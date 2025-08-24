import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Simulate the exact data that would be sent to Formspree when someone clicks "Continue to Payment"
    const mockFormData = {
      name: "Test Customer",
      email: "testcustomer@example.com",
      phone: "+15555559999",
      studio: "terminal-b",
      date: "2025-08-20",
      time: "14:00",
      duration: "3",
      engineer: "yes",
      projectType: "Full Integration Test",
      message: "Testing Formspree + GHL + Stripe all together!",
      smsConsent: true,
      promotionalConsent: true
    }

    console.log('🧪 Testing Formspree submission (Continue to Payment step):', mockFormData)

    // Submit to Formspree exactly like the booking page does
    const formData = new FormData()
    
    // Add all the booking session data (exact format from booking page)
    formData.append('Studio', mockFormData.studio)
    formData.append('Date', mockFormData.date)
    formData.append('Time', mockFormData.time)
    formData.append('Duration', mockFormData.duration)
    formData.append('Engineer', mockFormData.engineer === 'yes' ? 'Included' : 'Not included')
    formData.append('Project Type', mockFormData.projectType || 'Not specified')
    formData.append('Message', mockFormData.message || 'No message')
    formData.append('Customer Name', mockFormData.name)
    formData.append('Customer Email', mockFormData.email)
    formData.append('Customer Phone', mockFormData.phone)
    formData.append('SMS Consent', mockFormData.smsConsent ? 'Yes' : 'No')
    formData.append('Promotional Consent', mockFormData.promotionalConsent ? 'Yes' : 'No')
    formData.append('Booking Source', 'Website')
    formData.append('Form Type', 'Studio Booking')
    
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
        message: 'Formspree submission test successful! This simulates what happens when someone clicks "Continue to Payment"',
        formspreeResponse: responseText,
        submittedData: mockFormData,
        note: 'This test simulates the Formspree submission that happens BEFORE payment, ensuring all booking data is captured even if payment fails'
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Formspree submission test failed',
        status: response.status,
        response: responseText
      }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Formspree flow test error:', error)
    return NextResponse.json({
      success: false,
      message: 'Formspree flow test error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
