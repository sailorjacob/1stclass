import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Booking } from '@/lib/booking-config'
import { getServerStripe } from '@/lib/stripe'

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
  smsConsent: z.boolean().optional(),
  promotionalConsent: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const studio = searchParams.get('studio')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // 1) Start with any in-memory bookings (dev convenience)
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

    // 2) Augment with Stripe-derived bookings for persistence across deploys
    const stripe = getServerStripe(false)

    // Build time filter for Stripe 'created' if provided
    let created: { gte?: number; lte?: number } | undefined
    if (startDate || endDate) {
      created = {}
      if (startDate) created.gte = Math.floor(new Date(startDate).getTime() / 1000)
      if (endDate) created.lte = Math.floor(new Date(endDate).getTime() / 1000)
    }

    const stripeBookings: Booking[] = []
    let hasMore = true
    let startingAfter: string | undefined

    while (hasMore) {
      const list = await stripe.paymentIntents.list({
        limit: 100,
        created,
        starting_after: startingAfter,
      })
      for (const pi of list.data) {
        const md = (pi.metadata || {}) as Record<string, string>
        if (pi.status === 'succeeded' && md.type === 'studio_booking_deposit' && md.bookingDate && md.bookingTime && md.durationHours && md.studio) {
          // Compose Date from metadata
          const startIso = new Date(`${md.bookingDate} ${md.bookingTime}`).toISOString()
          const endIso = new Date(new Date(`${md.bookingDate} ${md.bookingTime}`).getTime() + parseInt(md.durationHours) * 60 * 60 * 1000).toISOString()
          const withEngineer = md.withEngineer === 'yes'

          // Optional studio filter
          if (studio && md.studio !== studio) continue

          const booking: Booking = {
            id: pi.id,
            clientName: md.customerName || 'Client',
            clientEmail: md.customerEmail || 'unknown@example.com',
            clientPhone: md.customerPhone || '',
            studio: md.studio as Booking['studio'],
            engineerName: withEngineer ? (md.engineerName || 'TBD') : 'No Engineer',
            engineerId: md.engineerId || '',
            withEngineer,
            startTime: new Date(startIso),
            endTime: new Date(endIso),
            duration: parseInt(md.durationHours),
            totalPrice: parseInt(md.totalAmount || '0') || 0,
            depositPaid: parseInt(md.depositAmount || '0') || 0,
            status: 'confirmed',
            stripePaymentIntentId: pi.id,
            createdAt: new Date(pi.created * 1000),
            projectType: md.projectType || undefined,
            message: md.message || undefined,
            smsConsent: md.smsConsent === 'yes',
          }
          stripeBookings.push(booking)
        }
      }
      hasMore = list.has_more
      startingAfter = hasMore ? list.data[list.data.length - 1]?.id : undefined
    }

    // Merge and de-duplicate by payment intent id / booking id
    const combined = [...filteredBookings, ...stripeBookings]
    const uniqueById = new Map(combined.map(b => [b.id, b]))
    const result = Array.from(uniqueById.values())

    return NextResponse.json({
      bookings: result,
      total: result.length,
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

    // GHL integration now handled via Stripe webhook only to avoid duplicates and race conditions
    console.log('Booking saved to internal system. GHL notification will be sent via Stripe webhook.')

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