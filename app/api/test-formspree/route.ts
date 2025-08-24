import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock booking data that matches what the form would send
    const mockBookingData = {
      Studio: 'terminal-a',
      Date: '2025-08-31',
      Time: '3:30 PM',
      Duration: '4 hours',
      Engineer: 'Included',
      Project_Type: 'Album Recording',
      Message: 'Testing Formspree integration with complete booking data',
      Customer_Name: 'Test User',
      Customer_Email: 'test@example.com',
      Customer_Phone: '+1-555-123-4567',
      SMS_Consent: 'Yes',
      Promotional_Consent: 'Yes',
      Booking_Source: 'Website',
      Form_Type: 'Studio Booking',
      Payment_Intent_ID: 'pi_test_formspree_123',
      Total_Amount: '320',
      Deposit_Amount: '160',
      Status: 'Payment Confirmed'
    }

    // Convert to FormData format
    const formData = new FormData()
    Object.entries(mockBookingData).forEach(([key, value]) => {
      formData.append(key, value)
    })

    console.log('🚀 Testing Formspree with data:', mockBookingData)

    // Submit to Formspree
    const response = await fetch('https://formspree.io/f/xjkebeea', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })

    const responseText = await response.text()
    console.log('📧 Formspree response:', response.status, responseText)

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Formspree test submission successful!',
        formspreeResponse: responseText,
        submittedData: mockBookingData
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Formspree test submission failed',
        status: response.status,
        response: responseText
      }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Formspree test error:', error)
    return NextResponse.json({
      success: false,
      message: 'Formspree test error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
