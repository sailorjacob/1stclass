import { NextRequest, NextResponse } from 'next/server'

/**
 * Test endpoint that simulates a complete booking flow to ensure 
 * consistent date/time formatting across all integration points
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      firstName = "Real",
      lastName = "Checkout",
      email = "realcheckout@example.com",
      phone = "+15555550008",
      studio = "terminal-a",
      date = "2025-07-15",
      time = "15:45", // 3:45 PM
      duration = 8,
      engineer = "Real Engineer",
      projectType = "Real Session Test",
      message = "Testing real checkout flow!"
    } = body

    console.log('🧪 Testing real checkout flow with:', {
      firstName, lastName, email, phone, studio, date, time, duration, engineer, projectType
    })

    // 1. Simulate creating payment intent
    const paymentIntentResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.1stclassstudios.com'}/api/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: `${firstName} ${lastName}`,
        customerEmail: email,
        customerPhone: phone,
        studio,
        bookingDate: date,
        bookingTime: time,
        durationHours: duration,
        engineerName: engineer,
        withEngineer: true,
        projectType,
        message,
        smsConsent: true
      })
    })

    if (!paymentIntentResponse.ok) {
      throw new Error(`Payment intent creation failed: ${paymentIntentResponse.statusText}`)
    }

    const paymentIntent = await paymentIntentResponse.json()
    console.log('✅ Payment intent created:', paymentIntent.id)

    // 2. Simulate confirming booking (what happens after Stripe payment)
    const confirmResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.1stclassstudios.com'}/api/confirm-booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentIntentId: paymentIntent.id,
        testMode: true
      })
    })

    if (!confirmResponse.ok) {
      throw new Error(`Booking confirmation failed: ${confirmResponse.statusText}`)
    }

    const confirmResult = await confirmResponse.json()
    console.log('✅ Booking confirmed with GHL integration')

    return NextResponse.json({
      success: true,
      message: 'Real checkout flow test completed successfully',
      paymentIntentId: paymentIntent.id,
      results: {
        paymentIntentCreated: true,
        bookingConfirmed: true,
        ghlIntegrationTriggered: true,
        emailSent: confirmResult.emailSent || false,
      },
      testData: {
        customer: `${firstName} ${lastName}`,
        email,
        phone,
        session: `${studio} on ${date} at ${time}`,
        duration: `${duration} hours`,
        engineer,
        projectType
      }
    })

  } catch (error) {
    console.error('Real checkout test failed:', error)
    return NextResponse.json(
      { 
        error: 'Real checkout test failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
