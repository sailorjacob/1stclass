import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Mock booking data - EXACT format from GHL webhook reference
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 7) // Book for next week
    const bookingDate = tomorrow.toISOString().split('T')[0]
    
    // EXACT MAPPING FORMAT from your GHL webhook reference
    const mockWebhookData = {
      email: 'test.mapping@example.com',
      phone: '+1-555-123-4567',
      firstName: 'Test',
      lastName: 'Mapping',
      name: 'Test Mapping',
      
      // Booking details (EXACT keys from your reference)
      booking_date: bookingDate,
      booking_time: '3:30 PM',
      engineer_assigned: 'Test Engineer',
      room_booked: 'terminal-b',
      session_duration: '4 hours',
      stripe_payment_id: `pi_test_mapping_${Date.now()}`,
      
      // DateTime fields (EXACT format from reference)
      appointment_start: `${bookingDate}T15:30:00`,
      booking_datetime: `${bookingDate}T15:30:00`,
      session_start_time: `${bookingDate}T15:30:00`,
      session_end_time: `${bookingDate}T19:30:00`,
      
      // Financial fields (EXACT keys from reference)
      total_session_cost: '320',
      deposit_amount: '160',
      remaining_balance: '160',
      deposit_date: new Date().toISOString().split('T')[0],
      
      // Additional fields (EXACT keys from reference)
      project_type: 'Mapping Test Session',
      customer_message: 'Testing exact webhook mapping format from reference',
      booking_status: 'confirmed',
      with_engineer: 'true',
      studio_display_name: 'TERMINAL B',
      sms_consent: 'Yes',
      payment_confirmation_id: `pi_test_mapping_${Date.now()}`,
      booking_source: 'Website',
      client_type: 'new_customer',
      marketing_source: 'mapping_test'
    }

    console.log('🧪 TEST: Sending EXACT MAPPING FORMAT to GHL webhook')
    console.log('📧 Email being sent:', mockWebhookData.email)
    console.log('📱 Phone being sent:', mockWebhookData.phone)
    console.log('📋 Full payload:', JSON.stringify(mockWebhookData, null, 2))
    console.log('🔗 Target webhook URL:', process.env.GOHIGHLEVEL_WEBHOOK_URL)

    if (!process.env.GOHIGHLEVEL_WEBHOOK_URL) {
      return NextResponse.json({
        error: 'GOHIGHLEVEL_WEBHOOK_URL not configured',
        status: 'failed'
      }, { status: 400 })
    }

    // Send as application/x-www-form-urlencoded to match Website to CRM Webhook
    const formBody = new URLSearchParams()
    Object.entries(mockWebhookData).forEach(([key, value]) => {
      formBody.append(key, String(value))
    })
    const response = await fetch(process.env.GOHIGHLEVEL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody.toString(),
    })

    const responseText = await response.text()
    
    console.log('✅ GHL webhook response status:', response.status)
    console.log('📄 GHL webhook response:', responseText)

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'EXACT MAPPING webhook sent successfully to GHL',
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
