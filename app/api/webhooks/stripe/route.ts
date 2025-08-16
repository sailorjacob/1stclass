import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getServerStripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('Stripe-Signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature provided' }, { status: 400 })
  }

  let event

  // Use live mode Stripe for webhook signature verification
  const stripe = getServerStripe(false)
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log('📨 Webhook received:', event.type)

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object
      console.log('✅ Payment succeeded:', paymentIntent.id)
      
      // Extract booking data from metadata
      const metadata = paymentIntent.metadata
      
      try {
        // Create booking record
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
          status: 'confirmed'
        }

        // Save to your booking system
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingData),
        })

        // Send to GoHighLevel via webhook
        if (process.env.GOHIGHLEVEL_WEBHOOK_URL) {
          try {
            console.log('📋 Available metadata fields:', Object.keys(metadata))
            console.log('📋 Full metadata:', metadata)
            
            const depositDate = new Date().toISOString().split('T')[0] // Today's date for deposit
            const totalAmount = parseInt(metadata.totalAmount)
            const depositAmount = parseInt(metadata.depositAmount)
            const remainingBalance = totalAmount - depositAmount
            
            const webhookData = {
              // Core contact fields - try ALL possible formats for GHL compatibility
              email: metadata.customerEmail,
              phone: metadata.customerPhone,
              'contact.email': metadata.customerEmail,
              'contact.phone': metadata.customerPhone,
              firstName: metadata.customerName.split(' ')[0],
              lastName: metadata.customerName.split(' ').slice(1).join(' ') || '',
              first_name: metadata.customerName.split(' ')[0],
              last_name: metadata.customerName.split(' ').slice(1).join(' ') || '',
              'contact.first_name': metadata.customerName.split(' ')[0],
              'contact.last_name': metadata.customerName.split(' ').slice(1).join(' ') || '',
              name: metadata.customerName,
              
              // Custom booking fields (matching your automation mappings)
              booking_date: metadata.bookingDate,
              booking_time: metadata.bookingTime,
              engineer_assigned: metadata.withEngineer === 'yes' ? metadata.engineerName || 'TBD' : 'No Engineer',
              room_booked: metadata.studio,
              session_duration: `${metadata.durationHours} hours`,
              stripe_payment_id: paymentIntent.id,
              
              // Additional comprehensive fields
              appointment_start: `${metadata.bookingDate}T${metadata.bookingTime}:00`,
              booking_datetime: `${metadata.bookingDate}T${metadata.bookingTime}:00`,
              session_start_time: `${metadata.bookingDate}T${metadata.bookingTime}:00`,
              session_end_time: new Date(new Date(`${metadata.bookingDate}T${metadata.bookingTime}:00`).getTime() + parseInt(metadata.durationHours) * 60 * 60 * 1000).toISOString(),
              total_session_cost: totalAmount,
              deposit_amount: depositAmount,
              remaining_balance: remainingBalance,
              deposit_date: depositDate,
              project_type: metadata.projectType || 'Not specified',
              customer_message: metadata.message || 'No message',
              booking_status: 'confirmed',
              with_engineer: metadata.withEngineer === 'yes',
              studio_display_name: metadata.studio.replace('-', ' ').toUpperCase(),
              sms_consent: metadata.smsConsent === 'yes' ? 'Yes' : 'No',
              payment_confirmation_id: paymentIntent.id,
            }
            
            console.log('🚀 Sending to GHL webhook:', JSON.stringify(webhookData, null, 2))
            console.log('🔗 Webhook URL:', process.env.GOHIGHLEVEL_WEBHOOK_URL)
            console.log('📋 Key fields being sent:')
            console.log('  - booking_time:', webhookData.booking_time)
            console.log('  - engineer_assigned:', webhookData.engineer_assigned)
            console.log('  - room_booked:', webhookData.room_booked)
            console.log('  - first_name:', webhookData.first_name)
            
            // Send as application/x-www-form-urlencoded for Website to CRM Webhook compatibility
            const formBody = new URLSearchParams()
            Object.entries(webhookData).forEach(([key, value]) => {
              formBody.append(key, String(value))
            })
            const response = await fetch(process.env.GOHIGHLEVEL_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: formBody.toString(),
            })
            
            if (response.ok) {
              console.log('✅ Successfully sent data to GoHighLevel webhook')
              
              // Also send to workflow webhook if configured
              if (process.env.GOHIGHLEVEL_WORKFLOW_WEBHOOK_URL) {
                try {
                  const workflowResponse = await fetch(process.env.GOHIGHLEVEL_WORKFLOW_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(webhookData),
                  })
                  
                  if (workflowResponse.ok) {
                    console.log('✅ Successfully triggered GHL workflow')
                  } else {
                    console.error('❌ GHL workflow webhook error:', workflowResponse.status)
                  }
                } catch (workflowError) {
                  console.error('❌ Failed to trigger GHL workflow:', workflowError)
                }
              }
            } else {
              console.error('❌ GHL webhook response error:', response.status, await response.text())
            }
          } catch (error) {
            console.error('❌ Failed to send to GoHighLevel webhook:', error)
          }
        } else {
          console.log('⚠️ GOHIGHLEVEL_WEBHOOK_URL not configured')
        }

        console.log('📅 Booking created successfully via webhook')
      } catch (error) {
        console.error('Error processing successful payment:', error)
      }
      break

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object
      console.log('❌ Payment failed:', failedPayment.id)
      // You could send a notification email here
      break

    case 'payment_intent.canceled':
      const canceledPayment = event.data.object
      console.log('🚫 Payment canceled:', canceledPayment.id)
      break

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
} 