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

    // Create/Update contact in GoHighLevel via API integration (reliable path)
    try {
      const nameParts = (metadata.customerName || '').split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ')

      const totalAmount = parseInt(metadata.totalAmount)
      const depositAmount = parseInt(metadata.depositAmount)
      const remainingBalance = totalAmount - depositAmount

      const payload = {
        firstName,
        lastName,
        email: metadata.customerEmail,
        phone: metadata.customerPhone,
        roomBooked: metadata.studio,
        engineerAssigned: metadata.withEngineer === 'yes' ? metadata.engineerName || 'TBD' : 'No Engineer',
        bookingDate: metadata.bookingDate,
        bookingTime: metadata.bookingTime,
        totalPrice: totalAmount,
        paymentConfirmationId: paymentIntent.id,
        duration: parseInt(metadata.durationHours),
        depositAmount,
        remainingBalance,
        projectType: metadata.projectType || 'Not specified',
        message: metadata.message || 'No message',
      }

      console.log('🚀 Sending to GHL API integration (confirm-booking):', JSON.stringify(payload, null, 2))
      const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/integrations/gohighlevel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!apiResponse.ok) {
        console.error('❌ GHL API integration error:', apiResponse.status, await apiResponse.text())
      } else {
        console.log('✅ GHL API integration succeeded')
      }
    } catch (error) {
      console.error('❌ Failed to send to GoHighLevel API integration:', error)
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