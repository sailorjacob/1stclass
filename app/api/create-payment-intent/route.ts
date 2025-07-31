import { NextRequest, NextResponse } from 'next/server'
import { getServerStripe, calculateBookingTotal, calculateDeposit, STUDIO_PRICING, StudioId } from '@/lib/stripe'
import { z } from 'zod'

// Validation schema for booking request
const bookingSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone number is required'),
  studio: z.enum(['terminal-a', 'terminal-b', 'terminal-c']),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  duration: z.string().min(1, 'Duration is required'),
  engineer: z.enum(['yes', 'no']),
  projectType: z.string().optional(),
  message: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Check for test mode from referer URL or request body
    const referer = request.headers.get('referer') || ''
    const isTestMode = referer.includes('test=true') || referer.includes('testmode=1') || body.testMode === true
    
    console.log('Payment Intent - Test Mode:', isTestMode)
    
    // Validate the request data
    const validatedData = bookingSchema.parse(body)
    
    const {
      name,
      email,
      phone,
      studio,
      date,
      time,
      duration,
      engineer,
      projectType,
      message,
    } = validatedData

    // Calculate pricing
    const durationHours = duration === 'custom' ? 2 : parseInt(duration) // Default to 2 hours for custom
    const withEngineer = engineer === 'yes'
    const totalAmount = calculateBookingTotal(studio as StudioId, durationHours, withEngineer)
    const depositAmount = calculateDeposit(totalAmount)
    
    // Get studio info
    const studioInfo = STUDIO_PRICING[studio as StudioId]
    
    // Get engineer info
    const { ROOM_ENGINEERS } = await import('@/lib/booking-config')
    const engineerInfo = engineer === 'yes' 
      ? ROOM_ENGINEERS[studio as StudioId]
      : { defaultEngineer: 'No Engineer', engineerId: 'none' }
    
    // Create the payment intent for the deposit amount
    const stripe = getServerStripe(isTestMode)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: depositAmount * 100, // Stripe expects amounts in cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        type: 'studio_booking_deposit',
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        studio: studio,
        studioName: studioInfo.name,
        bookingDate: date,
        bookingTime: time,
        duration: duration,
        durationHours: durationHours.toString(),
        withEngineer: engineer,
        engineerName: engineerInfo.defaultEngineer,
        engineerId: engineerInfo.engineerId,
        projectType: projectType || '',
        message: message || '',
        totalAmount: totalAmount.toString(),
        depositAmount: depositAmount.toString(),
        remainingAmount: (totalAmount - depositAmount).toString(),
      },
    })

    // Return the client secret and booking details
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      bookingDetails: {
        studio: studioInfo.name,
        date,
        time,
        duration: `${durationHours} hours`,
        withEngineer,
        hourlyRate: withEngineer ? studioInfo.withEngineer : studioInfo.withoutEngineer,
        totalAmount,
        depositAmount,
        remainingAmount: totalAmount - depositAmount,
      }
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid booking data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
} 