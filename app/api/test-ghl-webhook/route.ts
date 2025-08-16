import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Mock booking data - comprehensive realistic customer booking
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 7) // Book for next week
    const bookingDate = tomorrow.toISOString().split('T')[0]
    const startTime = '2:00 PM'
    const endTime = '5:00 PM'
    
    const mockWebhookData = {
      // Core contact fields - ALL possible formats for GHL compatibility
      email: 'sarah.johnson@email.com',
      phone: '+1-203-555-0199',
      'contact.email': 'sarah.johnson@email.com',
      'contact.phone': '+1-203-555-0199',
      firstName: 'Sarah',
      lastName: 'Johnson',
      first_name: 'Sarah',
      last_name: 'Johnson',
      'contact.first_name': 'Sarah',
      'contact.last_name': 'Johnson',
      name: 'Sarah Johnson',
      
      // Booking details (exactly as your automation expects)
      booking_date: bookingDate,
      booking_time: startTime,
      engineer_assigned: 'Murda',
      room_booked: 'terminal-a',
      session_duration: '3 hours',
      stripe_payment_id: `pi_live_${Date.now()}`,
      
      // Additional comprehensive booking data
      appointment_start: `${bookingDate}T14:00:00`,
      booking_datetime: `${bookingDate}T14:00:00`,
      session_start_time: `${bookingDate}T14:00:00`,
      session_end_time: `${bookingDate}T17:00:00`,
      total_session_cost: 240,
      deposit_amount: 120,
      remaining_balance: 120,
      deposit_date: new Date().toISOString().split('T')[0],
      project_type: 'Recording Session',
      customer_message: 'Looking forward to recording my new album. Need help with mixing too.',
      booking_status: 'confirmed',
      with_engineer: true,
      studio_display_name: 'TERMINAL A',
      sms_consent: 'Yes',
      payment_confirmation_id: `pi_live_${Date.now()}`,
      
      // Extra fields that might be useful
      booking_source: 'Website',
      client_type: 'new_customer',
      marketing_source: 'google_ads'
    }

    console.log('🧪 TEST: Sending mock data to GHL webhook')
    console.log('📋 Mock webhook data:', JSON.stringify(mockWebhookData, null, 2))
    console.log('🔗 Target webhook URL:', process.env.GOHIGHLEVEL_WEBHOOK_URL)

    if (!process.env.GOHIGHLEVEL_WEBHOOK_URL) {
      return NextResponse.json({
        error: 'GOHIGHLEVEL_WEBHOOK_URL not configured',
        status: 'failed'
      }, { status: 400 })
    }

    // Send to your GHL webhook
    const response = await fetch(process.env.GOHIGHLEVEL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockWebhookData),
    })

    const responseText = await response.text()
    
    console.log('✅ GHL webhook response status:', response.status)
    console.log('📄 GHL webhook response:', responseText)

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Mock webhook sent successfully to GHL',
        ghlResponse: {
          status: response.status,
          body: responseText
        },
        mockData: mockWebhookData
      })
    } else {
      return NextResponse.json({
        error: 'GHL webhook failed',
        status: response.status,
        response: responseText,
        mockData: mockWebhookData
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Test webhook error:', error)
    return NextResponse.json({
      error: 'Failed to send test webhook',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint to trigger the test without needing a POST body
export async function GET() {
  return POST(new NextRequest('http://localhost/test'))
}
