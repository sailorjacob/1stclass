import { NextRequest, NextResponse } from 'next/server'
import { getServerStripe } from '@/lib/stripe'
import { z } from 'zod'
import { renderBookingEmail, sendBookingEmail } from '@/lib/email'

const confirmBookingSchema = z.object({
  paymentIntentId: z.string(),
  testMode: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentIntentId, testMode } = confirmBookingSchema.parse(body)
    
    // Check for test mode from request body first, then referer URL
    const referer = request.headers.get('referer') || ''
    const isTestMode = testMode === true || referer.includes('test=true') || referer.includes('testmode=1')
    
    console.log('Confirm Booking - Test Mode:', isTestMode)
    
    // Retrieve the payment intent to get booking details
    const stripe = getServerStripe(isTestMode)
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }
    
    // Extract booking details from metadata
    const metadata = paymentIntent.metadata
    
    // Here you can:
    // 1. Save the booking to your database
    // 2. Send confirmation emails
    // 3. Add to calendar/scheduling system
    // 4. Send notifications to staff
    
    console.log('Booking confirmed:', {
      customerName: metadata.customerName,
      customerEmail: metadata.customerEmail,
      studio: metadata.studioName,
      date: metadata.bookingDate,
      time: metadata.bookingTime,
      duration: metadata.duration,
      totalAmount: metadata.totalAmount,
      depositPaid: metadata.depositAmount,
    })
    
    // Parse booking details from metadata
    const bookingData = {
      clientName: metadata.customerName,
      clientEmail: metadata.customerEmail,
      clientPhone: metadata.customerPhone,
      studio: metadata.studio,
      engineerName: metadata.withEngineer === 'yes' ? metadata.engineerName || 'TBD' : 'No Engineer',
      engineerId: metadata.engineerId || '',
      withEngineer: metadata.withEngineer === 'yes',
      startTime: new Date(`${metadata.bookingDate} ${metadata.bookingTime}`).toISOString(),
      endTime: new Date(new Date(`${metadata.bookingDate} ${metadata.bookingTime}`).getTime() + parseInt(metadata.durationHours) * 60 * 60 * 1000).toISOString(),
      duration: parseInt(metadata.durationHours),
      totalPrice: parseInt(metadata.totalAmount),
      depositPaid: parseInt(metadata.depositAmount),
      stripePaymentIntentId: paymentIntent.id,
      projectType: metadata.projectType || undefined,
      message: metadata.message || undefined,
      smsConsent: metadata.smsConsent === 'yes',
    }

    // Create booking record
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })
    } catch (error) {
      console.error('Failed to create booking record:', error)
    }

    // Send emails (client + management) if configured
    try {
      const to: string[] = []
      if (metadata.customerEmail) to.push(metadata.customerEmail)
      const managementList = (process.env.BOOKING_NOTIFICATIONS_TO || '').split(',').map(s => s.trim()).filter(Boolean)
      to.push(...managementList)

      if (to.length > 0) {
        const { subject, html } = renderBookingEmail({
          clientName: metadata.customerName,
          clientEmail: metadata.customerEmail,
          clientPhone: metadata.customerPhone,
          studioName: metadata.studioName,
          date: metadata.bookingDate,
          time: metadata.bookingTime,
          durationHours: parseInt(metadata.durationHours),
          engineerName: metadata.withEngineer === 'yes' ? (metadata.engineerName || 'TBD') : 'No Engineer',
          depositAmount: parseInt(metadata.depositAmount),
          remainingAmount: parseInt(metadata.totalAmount) - parseInt(metadata.depositAmount),
        })
        await sendBookingEmail({ to, subject, html })
      }
    } catch (emailError) {
      console.error('Failed to send booking emails:', emailError)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Booking confirmed successfully',
      bookingReference: paymentIntent.id,
      customerEmail: metadata.customerEmail,
    })
    
  } catch (error) {
    console.error('Error confirming booking:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to confirm booking' },
      { status: 500 }
    )
  }
} 