import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Mock booking data - similar to what would come from Stripe metadata
    const mockWebhookData = {
      // Standard contact fields (no prefix needed)
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-123-4567',
      
      // Custom fields (need contact. prefix for GHL)
      'contact.room_booked': 'terminal-a',
      'contact.engineer_assigned': 'Murda',
      'contact.booking_date': '2024-01-15',
      'contact.booking_time': '2:00 PM',
      'contact.session_duration': '3 hours',
      'contact.appointment_start': '2024-01-15T14:00:00',
      'contact.stripe_payment_id': 'pi_test_1234567890',
      'contact.booking_datetime': '2024-01-15T14:00:00',
      'contact.session_start_time': '2024-01-15T14:00:00',
      'contact.session_end_time': '2024-01-15T17:00:00',
      'contact.total_session_cost': 240,
      'contact.deposit_amount': 120,
      'contact.remaining_balance': 120,
      'contact.deposit_date': new Date().toISOString().split('T')[0],
      'contact.project_type': 'Recording Session',
      'contact.customer_message': 'Test booking for workflow trigger',
      'contact.booking_status': 'confirmed',
      'contact.with_engineer': true,
      'contact.studio_display_name': 'TERMINAL A',
      'contact.sms_consent': 'Yes',
      'contact.payment_confirmation_id': 'pi_test_1234567890',
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
