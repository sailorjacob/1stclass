import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Booking } from '@/lib/booking-config'

// In a production app, you'd use a proper database (e.g., Supabase, PostgreSQL, MongoDB)
// For now, we'll use in-memory storage or you can integrate with Supabase
let bookings: Booking[] = []

// Schema for creating a booking
const createBookingSchema = z.object({
  clientName: z.string(),
  clientEmail: z.string().email(),
  clientPhone: z.string(),
  studio: z.enum(['terminal-a', 'terminal-b', 'terminal-c']),
  engineerName: z.string(),
  engineerId: z.string(),
  withEngineer: z.boolean(),
  startTime: z.string().transform(str => new Date(str)),
  endTime: z.string().transform(str => new Date(str)),
  duration: z.number(),
  totalPrice: z.number(),
  depositPaid: z.number(),
  stripePaymentIntentId: z.string(),
  projectType: z.string().optional(),
  message: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const studio = searchParams.get('studio')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let filteredBookings = bookings

    // Filter by studio if provided
    if (studio) {
      filteredBookings = filteredBookings.filter(booking => booking.studio === studio)
    }

    // Filter by date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      filteredBookings = filteredBookings.filter(booking => {
        const bookingDate = new Date(booking.startTime)
        return bookingDate >= start && bookingDate <= end
      })
    }

    // Only return confirmed bookings for calendar display
    filteredBookings = filteredBookings.filter(booking => booking.status === 'confirmed')

    return NextResponse.json({
      bookings: filteredBookings,
      total: filteredBookings.length,
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createBookingSchema.parse(body)

    // Create new booking
    const newBooking: Booking = {
      id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...validatedData,
      status: 'confirmed',
      createdAt: new Date(),
    }

    // Add to bookings array (in production, save to database)
    bookings.push(newBooking)

    // Send data to GoHighLevel
    try {
      const nameParts = validatedData.clientName.split(' ')
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(' ')

      const depositAmount = Math.floor(validatedData.totalPrice * 0.5) // 50% deposit
      const remainingBalance = validatedData.totalPrice - depositAmount

      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/integrations/gohighlevel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email: validatedData.clientEmail,
          phone: validatedData.clientPhone,
          roomBooked: validatedData.studio,
          engineerAssigned: validatedData.engineerName,
          bookingDate: validatedData.startTime.toDateString(),
          bookingTime: validatedData.startTime.toLocaleTimeString(),
          totalPrice: validatedData.totalPrice,
          paymentConfirmationId: validatedData.stripePaymentIntentId,
          duration: validatedData.duration,
          depositAmount,
          remainingBalance,
          projectType: validatedData.projectType || 'Not specified',
          message: validatedData.message || 'No message',
        }),
      })
    } catch (error) {
      console.error('Failed to sync with GoHighLevel:', error)
      // Don't fail the booking creation if CRM sync fails
    }

    return NextResponse.json({
      success: true,
      booking: newBooking,
    })
  } catch (error) {
    console.error('Error creating booking:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid booking data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

// For development: Add some sample bookings
if (process.env.NODE_ENV === 'development') {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  bookings = [
    {
      id: 'sample-1',
      clientName: 'John Doe',
      clientEmail: 'john@example.com',
      clientPhone: '555-0123',
      studio: 'terminal-a',
      engineerName: 'Murda',
      engineerId: 'engineer-murda',
      withEngineer: true,
      startTime: new Date(today.setHours(14, 0, 0, 0)),
      endTime: new Date(today.setHours(16, 0, 0, 0)),
      duration: 2,
      totalPrice: 160,
      depositPaid: 80,
      status: 'confirmed',
      stripePaymentIntentId: 'pi_sample_1',
      createdAt: new Date(),
    },
    {
      id: 'sample-2',
      clientName: 'Jane Smith',
      clientEmail: 'jane@example.com',
      clientPhone: '555-0124',
      studio: 'terminal-b',
      engineerName: 'Mike',
      engineerId: 'engineer-mike',
      withEngineer: true,
      startTime: new Date(tomorrow.setHours(10, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(13, 0, 0, 0)),
      duration: 3,
      totalPrice: 180,
      depositPaid: 90,
      status: 'confirmed',
      stripePaymentIntentId: 'pi_sample_2',
      createdAt: new Date(),
    },
  ]
} 