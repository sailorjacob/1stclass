import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getServerStripe } from '@/lib/stripe'

const stripe = getServerStripe()

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('Stripe-Signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature provided' }, { status: 400 })
  }

  let event

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
            const webhookData = {
              full_name: metadata.customerName,
              email: metadata.customerEmail,
              phone: metadata.customerPhone,
              room_booked: metadata.studio,
              engineer: metadata.withEngineer === 'yes' ? metadata.engineerName || 'TBD' : 'No Engineer',
              booking_datetime: `${metadata.bookingDate}T${metadata.bookingTime}:00`,
              stripe_payment_id: paymentIntent.id,
              total_paid: metadata.depositAmount,
            }
            
            await fetch(process.env.GOHIGHLEVEL_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(webhookData),
            })
            
            console.log('✅ Data sent to GoHighLevel webhook')
          } catch (error) {
            console.error('❌ Failed to send to GoHighLevel webhook:', error)
          }
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