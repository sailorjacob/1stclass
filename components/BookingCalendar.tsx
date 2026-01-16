"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'
import { format, startOfWeek, addHours, isSameDay, isAfter, addDays, setHours, setMinutes } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { ROOM_ENGINEERS, BUSINESS_HOURS, ROOM_COLORS, MIN_BOOKING_HOURS, Booking } from '@/lib/booking-config'
import moment from 'moment'
import { useIsMobile } from '@/hooks/use-mobile'

import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = momentLocalizer(moment)

interface BookingCalendarProps {
  onSlotSelect: (slotInfo: {
    studio: string
    date: Date
    startTime: string
    endTime: string
    duration: number
    engineerName: string
    withEngineer: boolean
  }) => void
  existingBookings: Booking[]
  selectedStudio?: string
  selectedDuration?: string
  withEngineer?: boolean
}

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: {
    studio: string
    engineerName: string
    isBlocked: boolean
  }
}

// Mobile-optimized time slot picker for very small screens
const MobileTimeSlotPicker: React.FC<{
  selectedStudio: string
  selectedDuration: string
  onSlotSelect: (slotInfo: any) => void
  existingBookings: Booking[]
  withEngineer: boolean
}> = ({ selectedStudio, selectedDuration, onSlotSelect, existingBookings, withEngineer }) => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState<string>('')

  // Check if selected date is today
  const isToday = useMemo(() => {
    const today = new Date()
    return isSameDay(selectedDate, today)
  }, [selectedDate])

  // Generate time slots for the selected date
  const timeSlots = useMemo(() => {
    const slots = []
    const startHour = BUSINESS_HOURS.start
    const endHour = BUSINESS_HOURS.end
    
    for (let hour = startHour; hour < endHour; hour++) {
      const time = setHours(setMinutes(selectedDate, 0), hour)
      const slotEnd = addHours(time, parseInt(selectedDuration) || 1)
      
      // Check if slot is available
      const isAvailable = !existingBookings.some(booking => {
        if (booking.status === 'cancelled' || booking.studio !== selectedStudio) return false
        const bookingStart = new Date(booking.startTime)
        const bookingEnd = new Date(booking.endTime)
        return (
          (time >= bookingStart && time < bookingEnd) ||
          (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
          (time <= bookingStart && slotEnd >= bookingEnd)
        )
      })

      // Check if slot is in the past
      const isPast = time < new Date()
      
      // Check business hours
      const endHour = slotEnd.getHours()
      const isWithinHours = hour >= startHour && endHour <= BUSINESS_HOURS.end

      slots.push({
        time,
        formattedTime: format(time, 'h:mm a'),
        isAvailable: isAvailable && !isPast && isWithinHours,
        isPast,
        isWithinHours,
      })
    }
    
    return slots
  }, [selectedDate, selectedDuration, selectedStudio, existingBookings])

  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate)
    setSelectedTime('')
  }

  const handleTimeSelect = (slot: any) => {
    if (!slot.isAvailable) return

    const duration = parseInt(selectedDuration)
    const end = addHours(slot.time, duration)
    
    // Get engineer info
    const roomConfig = ROOM_ENGINEERS[selectedStudio as keyof typeof ROOM_ENGINEERS]
    const engineerName = withEngineer ? roomConfig.defaultEngineer : 'No Engineer'

    onSlotSelect({
      studio: selectedStudio,
      date: slot.time,
      startTime: format(slot.time, 'h:mm a'),
      endTime: format(end, 'h:mm a'),
      duration,
      engineerName,
      withEngineer,
    })
  }

  return (
    <div className="mobile-time-slot-picker">
      {/* Date Selection */}
      <div className="date-navigation">
        <Button
          size="sm"
          onClick={() => handleDateChange(addDays(selectedDate, -1))}
          className="text-white border-white/20 hover:bg-white/10 border bg-transparent p-2"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <span className="date-display">
          {format(selectedDate, 'EEEE, MMMM d')}
        </span>
        
        <Button
          size="sm"
          onClick={() => handleDateChange(addDays(selectedDate, 1))}
          className="text-white border-white/20 hover:bg-white/10 border bg-transparent p-2"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Quick Date Navigation - Only show if not on today */}
      {!isToday && (
        <div className="today-button">
          <Button
            size="sm"
            onClick={() => handleDateChange(new Date())}
            className="text-white border-white/20 hover:bg-white/10 border bg-transparent text-xs px-3 py-1"
          >
            Today
          </Button>
        </div>
      )}

      {/* Time Slots Grid */}
      <div className="time-slot-grid">
        {timeSlots.map((slot, index) => (
          <button
            key={index}
            onClick={() => handleTimeSelect(slot)}
            disabled={!slot.isAvailable}
            className={`
              time-slot-button
              ${slot.isAvailable ? 'available' : 'unavailable'}
              ${slot.isPast ? 'past' : ''}
            `}
          >
            {slot.formattedTime}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="legend">
        <div>Available time slots are highlighted</div>
        <div>Tap a time to select your booking slot</div>
      </div>
    </div>
  )
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  onSlotSelect,
  existingBookings,
  selectedStudio,
  selectedDuration,
  withEngineer = true,
}) => {
  const isMobile = useIsMobile()
  
  // Default to DAY view for cleaner experience (no wasted space on past dates)
  const [view, setView] = useState(Views.DAY)
  const [date, setDate] = useState(new Date())
  
  // Scroll to current time on load
  const scrollToTime = useMemo(() => {
    const now = new Date()
    // Show 1 hour before current time for context
    now.setHours(now.getHours() - 1)
    return now
  }, [])
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date
    end: Date
    studio: string
  } | null>(null)

  // Touch gesture state for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50

  // State for very small screen detection
  const [isVerySmallScreen, setIsVerySmallScreen] = useState(false)

  // Auto-switch to day view on mobile for better usability
  useEffect(() => {
    if (isMobile && view === Views.WEEK) {
      setView(Views.DAY)
    }
  }, [isMobile, view])

  // Check screen size for mobile picker
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkScreenSize = () => {
        setIsVerySmallScreen(window.innerWidth < 480)
      }
      
      checkScreenSize()
      window.addEventListener('resize', checkScreenSize)
      
      return () => window.removeEventListener('resize', checkScreenSize)
    }
  }, [])

  // Touch gesture handlers for mobile navigation
  const onTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!isMobile || !touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      // Swipe left - go to next day
      setDate(prevDate => addDays(prevDate, 1))
    } else if (isRightSwipe) {
      // Swipe right - go to previous day
      setDate(prevDate => addDays(prevDate, -1))
    }

    // Reset touch state
    setTouchStart(null)
    setTouchEnd(null)
  }

  // Convert existing bookings to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return existingBookings
      .filter(booking => booking.status !== 'cancelled')
      .map(booking => ({
        id: booking.id,
        // Privacy: do not show client name on the calendar
        title: 'Booked',
        start: new Date(booking.startTime),
        end: new Date(booking.endTime),
        resource: {
          studio: booking.studio,
          engineerName: booking.engineerName,
          isBlocked: true,
        },
      }))
  }, [existingBookings])

  // Filter events by selected studio
  const filteredEvents = selectedStudio
    ? events.filter(event => event.resource.studio === selectedStudio)
    : events

  // Check if a time slot is available
  const isSlotAvailable = (start: Date, end: Date, studio: string): boolean => {
    return !existingBookings.some(booking => {
      if (booking.status === 'cancelled' || booking.studio !== studio) return false
      const bookingStart = new Date(booking.startTime)
      const bookingEnd = new Date(booking.endTime)
      return (
        (start >= bookingStart && start < bookingEnd) ||
        (end > bookingStart && end <= bookingEnd) ||
        (start <= bookingStart && end >= bookingEnd)
      )
    })
  }

  // Custom slot style based on availability
  const slotStyleGetter = (date: Date) => {
    const hour = date.getHours()
    const isBusinessHour = hour >= BUSINESS_HOURS.start && hour < BUSINESS_HOURS.end
    const now = new Date()
    const isPast = date < now

    if (!isBusinessHour || isPast) {
      return {
        className: 'rbc-unavailable-slot',
        style: {
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          cursor: 'not-allowed',
        },
      }
    }

    // Check availability for each studio
    if (selectedStudio) {
      const slotEnd = addHours(date, 1)
      const available = isSlotAvailable(date, slotEnd, selectedStudio)
      
      if (!available) {
        return {
          className: 'rbc-booked-slot',
          style: {
            backgroundColor: 'rgba(75, 85, 99, 0.5)',
          },
        }
      }
    }

    return {
      className: 'rbc-available-slot',
      style: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
      },
    }
  }

  // Custom event style based on studio
  const eventStyleGetter = (event: CalendarEvent) => {
    const color = ROOM_COLORS[event.resource.studio as keyof typeof ROOM_COLORS] || '#6B7280'
    
    return {
      style: {
        backgroundColor: color,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    }
  }

  // Handle slot selection with mobile optimization
  const handleSelectSlot = (slotInfo: any) => {
    if (!selectedStudio) {
      if (isMobile) {
        // Mobile-friendly alert
        const message = 'Please select a studio first'
        // You could replace this with a toast notification or modal
        alert(message)
      } else {
        alert('Please select a studio first')
      }
      return
    }

    if (!selectedDuration) {
      if (isMobile) {
        const message = 'Please select a duration first'
        alert(message)
      } else {
        alert('Please select a duration first')
      }
      return
    }

    const start = slotInfo.start
    const duration = parseInt(selectedDuration)
    const end = addHours(start, duration)

    // Check if slot is in the past
    if (start < new Date()) {
      const message = 'Cannot book slots in the past'
      alert(message)
      return
    }

    // Check business hours (only if not 24/7 operation)
    const is24HourOperation = BUSINESS_HOURS.start === 0 && BUSINESS_HOURS.end === 24
    if (!is24HourOperation) {
    const startHour = start.getHours()
    const endHour = end.getHours()
    if (startHour < BUSINESS_HOURS.start || endHour > BUSINESS_HOURS.end) {
        const message = `Please select a time within business hours (${BUSINESS_HOURS.start}:00 - ${BUSINESS_HOURS.end}:00)`
      alert(message)
      return
      }
    }

    // Check availability
    if (!isSlotAvailable(start, end, selectedStudio)) {
      const message = 'This time slot is not available'
      alert(message)
      return
    }

    // Get engineer info
    const roomConfig = ROOM_ENGINEERS[selectedStudio as keyof typeof ROOM_ENGINEERS]
    const engineerName = withEngineer ? roomConfig.defaultEngineer : 'No Engineer'

    setSelectedSlot({ start, end, studio: selectedStudio })

    // Call the parent callback
    onSlotSelect({
      studio: selectedStudio,
      date: start,
      startTime: format(start, 'h:mm a'),
      endTime: format(end, 'h:mm a'),
      duration,
      engineerName,
      withEngineer,
    })
  }

  // Mobile-optimized height
  const calendarHeight = isMobile ? '400px' : '600px'

  // Show mobile time slot picker for very small screens or when preferred
  const showMobilePicker = isMobile && isVerySmallScreen

  return (
    <div className="space-y-4">

      {/* Calendar or Mobile Time Slot Picker */}
      <Card className="bg-transparent border-white/10">
        <CardContent className="p-0 md:p-4">
          {showMobilePicker ? (
            <MobileTimeSlotPicker
              selectedStudio={selectedStudio || ''}
              selectedDuration={selectedDuration || ''}
              onSlotSelect={onSlotSelect}
              existingBookings={existingBookings}
              withEngineer={withEngineer}
            />
          ) : (
            <div 
              className="booking-calendar" 
              style={{ height: calendarHeight }}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <Calendar
                localizer={localizer}
                events={filteredEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                view={view}
                onView={setView}
                date={date}
                onNavigate={setDate}
                onSelectSlot={handleSelectSlot}
                selectable
                step={60}
                timeslots={1}
                min={new Date(new Date().setHours(BUSINESS_HOURS.start, 0, 0, 0))}
                max={new Date(new Date().setHours(23, 59, 59, 999))}
                dayLayoutAlgorithm="no-overlap"
                slotPropGetter={slotStyleGetter}
                eventPropGetter={eventStyleGetter}
                views={isMobile ? [Views.DAY] : [Views.DAY, Views.WEEK]}
                scrollToTime={scrollToTime}
                formats={{
                  timeGutterFormat: 'h:mm A',
                  // Cast to any to avoid type issues from react-big-calendar typings in this project setup
                  eventTimeRangeFormat: ({ start, end }: any, culture: any, localizer: any) =>
                    `${localizer?.format(start, 'h:mm A', culture)} - ${localizer?.format(end, 'h:mm A', culture)}`,
                }}
                components={{
                  toolbar: (props: any) => <CustomToolbar {...props} isMobile={isMobile} />,
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <div className={`flex flex-wrap gap-6 text-sm mt-4 ${isMobile ? 'justify-center' : ''}`}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-white/5 border border-white/10" />
          <span className="text-white/50">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gray-600" />
          <span className="text-white/50">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-white/40" />
          <span className="text-white/50">Click a time to book</span>
        </div>
      </div>
    </div>
  )
}

// Custom toolbar component - clean minimal design
const CustomToolbar = ({ date, onNavigate, view, onView, isMobile }: any) => {
  const today = new Date()
  const isToday = isSameDay(date, today)
  
  // Format date based on view
  const dateLabel = view === Views.DAY 
    ? format(date, 'EEEE, MMM d')
    : format(date, 'MMMM yyyy')

  return (
    <div className="flex items-center justify-between gap-2 mb-6 px-1">
      {/* Left: Navigation */}
      <div className="flex items-center">
        <button
          onClick={() => onNavigate('PREV')}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => onNavigate('NEXT')}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {!isToday && (
          <button
            onClick={() => onNavigate('TODAY')}
            className="ml-2 px-3 py-1.5 text-xs font-medium rounded-full bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors"
          >
            Today
          </button>
        )}
      </div>

      {/* Center: Date Label */}
      <span className="text-white font-medium">
        {dateLabel}
      </span>

      {/* Right: View Switcher (desktop only) */}
      {!isMobile ? (
        <div className="flex bg-white/5 rounded-full p-0.5">
          <button
            onClick={() => onView(Views.DAY)}
            className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
              view === Views.DAY 
                ? 'bg-orange-500 text-white' 
                : 'text-white/50 hover:text-white'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => onView(Views.WEEK)}
            className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
              view === Views.WEEK 
                ? 'bg-orange-500 text-white' 
                : 'text-white/50 hover:text-white'
            }`}
          >
            Week
          </button>
        </div>
      ) : (
        <div className="w-9" /> 
      )}
    </div>
  )
} 