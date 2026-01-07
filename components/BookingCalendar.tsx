"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'
import { format, startOfWeek, addHours, isSameDay, isAfter, addDays, setHours, setMinutes } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar as CalendarIcon, Clock, Users, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { ROOM_ENGINEERS, BUSINESS_HOURS, ROOM_COLORS, MIN_BOOKING_HOURS, Booking } from '@/lib/booking-config'
import { STUDIO_PRICING } from '@/lib/stripe'
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
  
  // Mobile-optimized view: default to day view on mobile, week view on desktop
  const [view, setView] = useState(isMobile ? Views.DAY : Views.WEEK)
  const [date, setDate] = useState(new Date())
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
          backgroundColor: '#1a1a1a',
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
            backgroundColor: '#374151',
            border: '0px',
          },
        }
      }
    }

    return {
      className: 'rbc-available-slot',
      style: {
        backgroundColor: '#111827',
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
    <div className="space-y-6">
      {/* Studio and Duration Selection Info */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white font-light tracking-wider">SELECT YOUR TIME SLOT</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-4 mb-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
            {/* Selected Studio */}
            <div>
              <p className="text-white/60 text-sm mb-2">Selected Studio</p>
              {selectedStudio ? (
                <Badge
                  variant="secondary"
                  className="text-white"
                  style={{ backgroundColor: ROOM_COLORS[selectedStudio as keyof typeof ROOM_COLORS] }}
                >
                  {STUDIO_PRICING[selectedStudio as keyof typeof STUDIO_PRICING].name}
                  {withEngineer && ` - Book with Engineer`}
                </Badge>
              ) : (
                <p className="text-white/40 text-sm">No studio selected</p>
              )}
            </div>

            {/* Duration */}
            <div>
              <p className="text-white/60 text-sm mb-2">Duration</p>
              {selectedDuration ? (
                <Badge variant="outline" className="text-white border-white/20">
                  {selectedDuration} hours
                </Badge>
              ) : (
                <p className="text-white/40 text-sm">No duration selected</p>
              )}
            </div>

            {/* Engineer */}
            <div>
              <p className="text-white/60 text-sm mb-2">Engineer</p>
              <Badge variant="outline" className="text-white border-white/20">
                {withEngineer ? 'With Engineer' : 'Without Engineer'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-white/60">
            <AlertCircle className="w-4 h-4" />
            <span>{isMobile ? 'Tap on an available time slot to book' : 'Click on an available time slot to book'}</span>
          </div>
          
          {/* Mobile swipe hint */}
          {isMobile && !showMobilePicker && (
            <div className="flex items-center space-x-2 text-sm text-white/40 mt-2">
              <div className="flex space-x-1">
                <span>←</span>
                <span>Swipe to navigate</span>
                <span>→</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calendar or Mobile Time Slot Picker */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
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
                views={isMobile ? [Views.DAY] : [Views.WEEK, Views.DAY]}
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
      <div className={`flex flex-wrap gap-4 text-sm ${isMobile ? 'justify-center' : ''}`}>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-white/10 rounded" />
          <span className="text-white/60">Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-700 rounded" />
          <span className="text-white/60">Booked</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-black rounded" />
          <span className="text-white/60">Unavailable</span>
        </div>
        {Object.entries(ROOM_COLORS).map(([studio, color]) => (
          <div key={studio} className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
            <span className="text-white/60">
              {STUDIO_PRICING[studio as keyof typeof STUDIO_PRICING].name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Custom toolbar component with mobile optimization
const CustomToolbar = ({ date, onNavigate, view, onView, label, isMobile }: any) => {
  // Check if current date is today
  const isToday = isSameDay(date, new Date())

  if (isMobile) {
    return (
      <div className="rbc-toolbar bg-black/20 p-3 border-b border-white/10">
        <div className="flex flex-col space-y-3">
          {/* Date Navigation */}
          <div className="flex justify-between items-center">
            <Button
              size="sm"
              onClick={() => onNavigate('PREV')}
              className="text-white border-white/20 hover:bg-white/10 border bg-transparent p-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <span className="text-white text-base font-light tracking-wider text-center flex-1">
              {format(date, 'EEEE, MMMM d')}
            </span>
            
            <Button
              size="sm"
              onClick={() => onNavigate('NEXT')}
              className="text-white border-white/20 hover:bg-white/10 border bg-transparent p-2"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick Actions - Only show Today button if not on today */}
          {!isToday && (
            <div className="flex justify-center space-x-2">
              <Button
                size="sm"
                onClick={() => onNavigate('TODAY')}
                className="text-white border-white/20 hover:bg-white/10 border bg-transparent text-xs px-3 py-1"
              >
                Today
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Desktop toolbar
  return (
    <div className="rbc-toolbar bg-black/20 p-4 border-b border-white/10">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={() => onNavigate('PREV')}
            className="text-white border-white/20 hover:bg-white/10 border bg-transparent"
          >
            Previous
          </Button>
          {!isToday && (
            <Button
              size="sm"
              onClick={() => onNavigate('TODAY')}
              className="text-white border-white/20 hover:bg-white/10 border bg-transparent"
            >
              Today
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => onNavigate('NEXT')}
            className="text-white border-white/20 hover:bg-white/10 border bg-transparent"
          >
            Next
          </Button>
        </div>

        <span className="text-white text-lg font-light tracking-wider">{label}</span>

        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={() => onView(Views.WEEK)}
            className={view === Views.WEEK ? 'bg-white/20 text-white border-white/50 border' : 'text-white border-white/20 hover:bg-white/10 border bg-transparent'}
          >
            Week
          </Button>
          <Button
            size="sm"
            onClick={() => onView(Views.DAY)}
            className={view === Views.DAY ? 'bg-white/20 text-white border-white/50 border' : 'text-white border-white/20 hover:bg-white/10 border bg-transparent'}
          >
            Day
          </Button>
        </div>
      </div>
    </div>
  )
} 