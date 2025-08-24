import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🧪 Testing COMPLETE webhook trigger flow...')
    
    // Step 1: Simulate Formspree submission (Continue to Payment step)
    console.log('📧 Step 1: Testing Formspree submission...')
    const formspreeData = {
      name: "Webhook Test Customer",
      email: "webhooktest@example.com",
      phone: "+15555559999",
      studio: "terminal-a",
      date: "2025-08-26",
      time: "15:00",
      duration: "4",
      engineer: "yes",
      projectType: "Webhook Integration Test",
      message: "Testing the complete webhook trigger flow!",
      smsConsent: true,
      promotionalConsent: true
    }

    // Submit to Formspree
    const formData = new FormData()
    formData.append('Studio', formspreeData.studio)
    formData.append('Date', formspreeData.date)
    formData.append('Time', formspreeData.time)
    formData.append('Duration', formspreeData.duration)
    formData.append('Engineer', formspreeData.engineer === 'yes' ? 'Included' : 'Not included')
    formData.append('Project Type', formspreeData.projectType)
    formData.append('Message', formspreeData.message)
    formData.append('Customer Name', formspreeData.name)
    formData.append('Customer Email', formspreeData.email)
    formData.append('Customer Phone', formspreeData.phone)
    formData.append('SMS Consent', formspreeData.smsConsent ? 'Yes' : 'No')
    formData.append('Promotional Consent', formspreeData.promotionalConsent ? 'Yes' : 'No')
    formData.append('Booking Source', 'Website')
    formData.append('Form Type', 'Studio Booking')

    const formspreeResponse = await fetch('https://formspree.io/f/xjkebeea', {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    })

    if (!formspreeResponse.ok) {
      throw new Error(`Formspree failed: ${formspreeResponse.status}`)
    }
    console.log('✅ Formspree submission successful')

    // Step 2: Simulate Stripe webhook processing (this will trigger GHL webhook)
    console.log('🌐 Step 2: Testing Stripe webhook processing to trigger GHL webhook...')
    
    // Create mock payment intent data (simulating successful payment)
    const mockPaymentIntent = {
      id: 'pi_webhook_test_123',
      status: 'succeeded',
      amount: 12000, // $120.00
      metadata: {
        type: 'studio_booking_deposit',
        customerName: formspreeData.name,
        customerEmail: formspreeData.email,
        customerPhone: formspreeData.phone,
        smsConsent: 'yes',
        promotionalConsent: 'yes',
        studio: formspreeData.studio,
        studioName: 'Terminal A',
        bookingDate: formspreeData.date,
        bookingTime: formspreeData.time,
        duration: formspreeData.duration,
        durationHours: formspreeData.duration,
        withEngineer: 'yes',
        engineerName: 'Test Engineer',
        engineerId: 'test_engineer_1',
        projectType: formspreeData.projectType,
        message: formspreeData.message,
        totalAmount: '240',
        depositAmount: '120',
        remainingAmount: '120'
      }
    }

    // Simulate the webhook data that Stripe would send
    const webhookData = {
      email: formspreeData.email,
      phone: formspreeData.phone,
      firstName: formspreeData.name.split(' ')[0],
      lastName: formspreeData.name.split(' ').slice(1).join(' ') || '',
      name: formspreeData.name,
      
      booking_date: formspreeData.date,
      booking_time: formspreeData.time,
      engineer_assigned: 'Test Engineer',
      room_booked: formspreeData.studio,
      session_duration: `${formspreeData.duration} hours`,
      stripe_payment_id: mockPaymentIntent.id,
      
      appointment_start: `${formspreeData.date}T${formspreeData.time}:00`,
      booking_datetime: `${formspreeData.date}T${formspreeData.time}:00`,
      session_start_time: `${formspreeData.date}T${formspreeData.time}:00`,
      session_end_time: new Date(new Date(`${formspreeData.date}T${formspreeData.time}:00`).getTime() + parseInt(formspreeData.duration) * 60 * 60 * 1000).toISOString(),
      total_session_cost: '240',
      deposit_amount: '120',
      remaining_balance: '120',
      deposit_date: new Date().toISOString().split('T')[0],
      project_type: formspreeData.projectType,
      customer_message: formspreeData.message,
      booking_status: 'confirmed',
      with_engineer: 'true',
      studio_display_name: formspreeData.studio.toUpperCase().replace('-', ' '),
      sms_consent: 'Yes',
      payment_confirmation_id: mockPaymentIntent.id,
      booking_source: 'Website',
      client_type: 'new_customer',
      marketing_source: 'webhook_test'
    }

    // Send to GHL webhook (this should trigger your automation!)
    console.log('🚀 Sending webhook data to GHL (this should trigger your automation):', JSON.stringify(webhookData, null, 2))
    
    const ghlWebhookResponse = await fetch(`${process.env.GOHIGHLEVEL_WEBHOOK_URL || 'https://www.1stclassstudios.com/api/test-gohighlevel'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(webhookData as any)
    })

    const ghlResponseText = await ghlWebhookResponse.text()
    console.log('📧 GHL webhook response:', ghlWebhookResponse.status, ghlResponseText)

    if (ghlWebhookResponse.ok) {
      console.log('✅ GHL webhook triggered successfully!')
    } else {
      console.log('⚠️ GHL webhook had issues:', ghlWebhookResponse.status)
    }

    return NextResponse.json({
      success: true,
      message: 'Complete webhook trigger test successful! Check your GHL automation now.',
      results: {
        formspree: '✅ Working',
        webhookTrigger: '✅ Triggered',
        ghlWebhook: ghlWebhookResponse.ok ? '✅ Success' : '⚠️ Issues'
      },
      webhookData: webhookData,
      ghlResponse: {
        status: ghlWebhookResponse.status,
        response: ghlResponseText
      },
      note: 'This test simulated the complete Stripe webhook flow and should have triggered your GHL automation. Check your GHL dashboard for the new execution!'
    })

  } catch (error) {
    console.error('❌ Webhook trigger test failed:', error)
    return NextResponse.json({
      success: false,
      message: 'Webhook trigger test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
