"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Calendar, momentLocalizer, Views, SlotInfo } from 'react-big-calendar'
import { format, startOfWeek, addHours, isSameDay, isAfter, addDays, setHours, setMinutes } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar as CalendarIcon, Clock, Users, AlertCircle } from 'lucide-react'
import { ROOM_ENGINEERS, BUSINESS_HOURS, ROOM_COLORS, MIN_BOOKING_HOURS, Booking } from '@/lib/booking-config'
import { STUDIO_PRICING } from '@/lib/stripe'
import moment from 'moment'

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
    clientName: string
    engineerName: string
    isBlocked: boolean
  }
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  onSlotSelect,
  existingBookings,
  selectedStudio,
  selectedDuration,
  withEngineer = true,
}) => {
  const [view, setView] = useState(Views.WEEK)
  const [date, setDate] = useState(new Date())
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date
    end: Date
    studio: string
  } | null>(null)

  // Convert existing bookings to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return existingBookings
      .filter(booking => booking.status !== 'cancelled')
      .map(booking => ({
        id: booking.id,
        title: `${booking.clientName} - ${booking.engineerName}`,
        start: new Date(booking.startTime),
        end: new Date(booking.endTime),
        resource: {
          studio: booking.studio,
          clientName: booking.clientName,
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
            cursor: 'not-allowed',
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

  // Handle slot selection
  const handleSelectSlot = (slotInfo: SlotInfo) => {
    if (!selectedStudio) {
      alert('Please select a studio first')
      return
    }

    if (!selectedDuration) {
      alert('Please select a duration first')
      return
    }

    const start = slotInfo.start
    const duration = parseInt(selectedDuration)
    const end = addHours(start, duration)

    // Check if slot is in the past
    if (start < new Date()) {
      alert('Cannot book slots in the past')
      return
    }

    // Check business hours
    const startHour = start.getHours()
    const endHour = end.getHours()
    if (startHour < BUSINESS_HOURS.start || endHour > BUSINESS_HOURS.end) {
      alert('Please select a time within business hours (9 AM - 9 PM)')
      return
    }

    // Check availability
    if (!isSlotAvailable(start, end, selectedStudio)) {
      alert('This time slot is not available')
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

  return (
    <div className="space-y-6">
      {/* Studio and Duration Selection Info */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white font-light tracking-wider">SELECT YOUR TIME SLOT</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                  {withEngineer && ` - ${ROOM_ENGINEERS[selectedStudio as keyof typeof ROOM_ENGINEERS].defaultEngineer}`}
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
            <span>Click on an available time slot to book</span>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-0">
          <div className="h-[600px] booking-calendar">
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
              min={setHours(setMinutes(new Date(), 0), BUSINESS_HOURS.start)}
              max={setHours(setMinutes(new Date(), 0), BUSINESS_HOURS.end)}
              dayLayoutAlgorithm="no-overlap"
              slotPropGetter={slotStyleGetter}
              eventPropGetter={eventStyleGetter}
              views={[Views.WEEK, Views.DAY]}
              formats={{
                timeGutterFormat: 'h:mm A',
                eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
                  `${localizer?.format(start, 'h:mm A', culture)} - ${localizer?.format(end, 'h:mm A', culture)}`,
              }}
              components={{
                toolbar: CustomToolbar,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
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

// Custom toolbar component
const CustomToolbar = ({ date, onNavigate, view, onView, label }: any) => {
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
          <Button
            size="sm"
            onClick={() => onNavigate('TODAY')}
            className="text-white border-white/20 hover:bg-white/10 border bg-transparent"
          >
            Today
          </Button>
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