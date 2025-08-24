import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const testData = {
      name: "Test Customer",
      email: "test@example.com",
      phone: "+15555559999",
      studio: "terminal-b",
      date: "2025-08-20",
      time: "14:00",
      duration: "3",
      engineer: "yes",
      projectType: "Test Session",
      message: "Testing payment intent creation",
      smsConsent: true,
      promotionalConsent: true
    }

    console.log('🧪 Testing payment intent creation with:', testData)

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.1stclassstudios.com'}/api/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    })

    const responseText = await response.text()
    console.log('📧 Payment intent response:', response.status, responseText)

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Payment intent created successfully',
        response: responseText
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Payment intent creation failed',
        status: response.status,
        response: responseText
      }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Payment intent test error:', error)
    return NextResponse.json({
      success: false,
      message: 'Payment intent test error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
