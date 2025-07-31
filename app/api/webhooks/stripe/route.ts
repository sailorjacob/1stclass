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
              // Standard contact fields (no prefix needed)
              first_name: metadata.customerName.split(' ')[0],
              last_name: metadata.customerName.split(' ').slice(1).join(' ') || '',
              email: metadata.customerEmail,
              phone: metadata.customerPhone,
              
              // Custom fields (need contact. prefix for GHL)
              'contact.room_booked': metadata.studio,
              'contact.engineer_assigned': metadata.withEngineer === 'yes' ? metadata.engineerName || 'TBD' : 'No Engineer',
              'contact.booking_date': metadata.bookingDate,
              'contact.booking_time': metadata.bookingTime,
              'contact.session_duration': `${metadata.durationHours} hours`,
              'contact.stripe_payment_id': paymentIntent.id,
              'contact.booking_datetime': `${metadata.bookingDate}T${metadata.bookingTime}:00`,
              'contact.session_start_time': `${metadata.bookingDate}T${metadata.bookingTime}:00`,
              'contact.session_end_time': new Date(new Date(`${metadata.bookingDate}T${metadata.bookingTime}:00`).getTime() + parseInt(metadata.durationHours) * 60 * 60 * 1000).toISOString(),
              'contact.total_session_cost': totalAmount,
              'contact.deposit_amount': depositAmount,
              'contact.remaining_balance': remainingBalance,
              'contact.deposit_date': depositDate,
              'contact.project_type': metadata.projectType || 'Not specified',
              'contact.customer_message': metadata.message || 'No message',
              'contact.booking_status': 'confirmed',
              'contact.with_engineer': metadata.withEngineer === 'yes',
              'contact.studio_display_name': metadata.studio.replace('-', ' ').toUpperCase(),
            }
            
            console.log('🚀 Sending to GHL webhook:', JSON.stringify(webhookData, null, 2))
            console.log('🔗 Webhook URL:', process.env.GOHIGHLEVEL_WEBHOOK_URL)
            
            const response = await fetch(process.env.GOHIGHLEVEL_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(webhookData),
            })
            
            if (response.ok) {
              console.log('✅ Successfully sent data to GoHighLevel webhook')
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