"use client"

import React, { useState, useMemo } from 'react'
import { format, addDays, addHours, isSameDay, isAfter, isBefore, startOfHour } from 'date-fns'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { BUSINESS_HOURS, ROOM_ENGINEERS, Booking } from '@/lib/booking-config'

interface TimeSlotPickerProps {
  onSlotSelect: (slot: {
    studio: string
    date: Date
    startTime: string
    endTime: string
    duration: number
    engineerName: string
    withEngineer: boolean
  }) => void
  existingBookings: Booking[]
  selectedStudio: string | null
  selectedDuration: string | null
  withEngineer: boolean
}

export const SimpleTimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  onSlotSelect,
  existingBookings,
  selectedStudio,
  selectedDuration,
  withEngineer,
}) => {
  const [startDayOffset, setStartDayOffset] = useState(0)
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; hour: number } | null>(null)
  
  const duration = parseInt(selectedDuration || '2')
  const daysToShow = 7

  // Generate days starting from today
  const days = useMemo(() => {
    const today = new Date()
    return Array.from({ length: daysToShow }, (_, i) => addDays(today, startDayOffset + i))
  }, [startDayOffset])

  // Generate hours (24 hour availability)
  const hours = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => i)
  }, [])

  // Check if a slot is available
  const isSlotAvailable = (day: Date, hour: number): boolean => {
    if (!selectedStudio) return false
    
    const slotStart = new Date(day)
    slotStart.setHours(hour, 0, 0, 0)
    const slotEnd = addHours(slotStart, duration)
    
    // Check if in the past
    if (isBefore(slotStart, new Date())) return false
    
    // Check for overlapping bookings
    return !existingBookings.some(booking => {
      if (booking.studio !== selectedStudio) return false
      const bookingStart = new Date(booking.startTime)
      const bookingEnd = new Date(booking.endTime)
      return (
        (slotStart >= bookingStart && slotStart < bookingEnd) ||
        (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
        (slotStart <= bookingStart && slotEnd >= bookingEnd)
      )
    })
  }

  // Check if a slot is selected
  const isSlotSelected = (day: Date, hour: number): boolean => {
    if (!selectedSlot) return false
    return isSameDay(selectedSlot.date, day) && selectedSlot.hour === hour
  }

  // Handle slot click
  const handleSlotClick = (day: Date, hour: number) => {
    if (!selectedStudio || !selectedDuration) {
      alert('Please select a studio and duration first')
      return
    }
    
    if (!isSlotAvailable(day, hour)) return
    
    const slotStart = new Date(day)
    slotStart.setHours(hour, 0, 0, 0)
    const slotEnd = addHours(slotStart, duration)
    
    setSelectedSlot({ date: day, hour })
    
    const roomConfig = ROOM_ENGINEERS[selectedStudio as keyof typeof ROOM_ENGINEERS]
    const engineerName = withEngineer ? roomConfig?.defaultEngineer || 'Engineer' : 'No Engineer'
    
    onSlotSelect({
      studio: selectedStudio,
      date: slotStart,
      startTime: format(slotStart, 'h:mm a'),
      endTime: format(slotEnd, 'h:mm a'),
      duration,
      engineerName,
      withEngineer,
    })
  }

  const formatHour = (hour: number): string => {
    if (hour === 0) return '12am'
    if (hour === 12) return '12pm'
    if (hour < 12) return `${hour}am`
    return `${hour - 12}pm`
  }

  const isToday = (day: Date): boolean => isSameDay(day, new Date())

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStartDayOffset(Math.max(0, startDayOffset - 7))}
          disabled={startDayOffset === 0}
          className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <span className="text-white font-medium">
          {format(days[0], 'MMM d')} - {format(days[days.length - 1], 'MMM d, yyyy')}
        </span>
        
        <button
          onClick={() => setStartDayOffset(startDayOffset + 7)}
          className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Time Grid */}
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="min-w-[600px]">
          {/* Day Headers */}
          <div className="grid grid-cols-8 gap-1 mb-2">
            <div className="text-xs text-white/40 p-2">Time</div>
            {days.map((day, i) => (
              <div
                key={i}
                className={`text-center p-2 rounded-lg ${
                  isToday(day) 
                    ? 'bg-orange-500/20 text-orange-400' 
                    : 'text-white/60'
                }`}
              >
                <div className="text-xs font-medium uppercase">
                  {format(day, 'EEE')}
                </div>
                <div className={`text-lg font-semibold ${isToday(day) ? 'text-orange-400' : 'text-white'}`}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>

          {/* Hour Rows */}
          <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2">
            {hours.map(hour => (
              <div key={hour} className="grid grid-cols-8 gap-1">
                {/* Hour Label */}
                <div className="text-xs text-white/40 p-2 flex items-center justify-end">
                  {formatHour(hour)}
                </div>
                
                {/* Day Cells */}
                {days.map((day, dayIndex) => {
                  const available = isSlotAvailable(day, hour)
                  const selected = isSlotSelected(day, hour)
                  
                  return (
                    <button
                      key={dayIndex}
                      onClick={() => handleSlotClick(day, hour)}
                      disabled={!available}
                      className={`
                        h-10 rounded-lg text-xs font-medium transition-all relative
                        ${selected 
                          ? 'bg-orange-500 text-white ring-2 ring-orange-400 ring-offset-2 ring-offset-black' 
                          : available 
                            ? 'bg-white/5 hover:bg-orange-500/20 hover:text-orange-400 text-white/60 border border-white/10 hover:border-orange-500/30' 
                            : 'bg-white/[0.02] text-white/20 cursor-not-allowed'
                        }
                      `}
                    >
                      {selected && (
                        <span className="flex items-center justify-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Start</span>
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-white/50 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white/5 border border-white/10" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white/[0.02]" />
          <span>Unavailable</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-500" />
          <span>Selected</span>
        </div>
      </div>
    </div>
  )
}
