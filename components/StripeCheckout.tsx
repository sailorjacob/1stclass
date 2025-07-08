"use client"

import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, CreditCard, Loader2 } from 'lucide-react'

// Debug: Log the publishable key availability
console.log('Stripe publishable key available:', !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
console.log('Stripe key starts with pk_:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_'))

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : Promise.reject(new Error('Stripe publishable key not found'))

interface BookingDetails {
  studio: string
  date: string
  time: string
  duration: string
  withEngineer: boolean
  hourlyRate: number
  totalAmount: number
  depositAmount: number
  remainingAmount: number
}

interface BookingData {
  name: string
  email: string
  phone: string
  studio: string
  date: string
  time: string
  duration: string
  engineer: string
  projectType?: string
  message?: string
}

interface StripeCheckoutProps {
  bookingData: BookingData
  onSuccess: (paymentIntentId: string) => void
  onCancel: () => void
}

const CheckoutForm: React.FC<{
  bookingData: BookingData
  onSuccess: (paymentIntentId: string) => void
  onCancel: () => void
}> = ({ bookingData, onSuccess, onCancel }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [clientSecret, setClientSecret] = useState<string>('')
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookingData),
        })

        if (!response.ok) {
          throw new Error('Failed to create payment intent')
        }

        const data = await response.json()
        setClientSecret(data.clientSecret)
        setBookingDetails(data.bookingDetails)
      } catch (err) {
        setError('Failed to initialize payment. Please try again.')
        console.error('Error creating payment intent:', err)
      }
    }

    createPaymentIntent()
  }, [bookingData])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      return
    }

    setIsLoading(true)
    setError('')

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      setError('Card information is required')
      setIsLoading(false)
      return
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: bookingData.name,
            email: bookingData.email,
            phone: bookingData.phone,
          },
        },
      })

      if (error) {
        setError(error.message || 'Payment failed')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id)
      }
    } catch (err) {
      setError('Payment processing failed. Please try again.')
      console.error('Payment error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!bookingDetails) {
    return (
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-white" />
          <p className="text-white/70">Preparing your booking...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Booking Summary */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white font-light tracking-wider">BOOKING SUMMARY</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-white/60">Studio</p>
              <p className="text-white font-medium">{bookingDetails.studio}</p>
            </div>
            <div>
              <p className="text-white/60">Date & Time</p>
              <p className="text-white font-medium">
                {bookingDetails.date} at {bookingDetails.time}
              </p>
            </div>
            <div>
              <p className="text-white/60">Duration</p>
              <p className="text-white font-medium">{bookingDetails.duration}</p>
            </div>
            <div>
              <p className="text-white/60">Engineer</p>
              <p className="text-white font-medium">
                {bookingDetails.withEngineer ? 'Included' : 'Not included'}
              </p>
            </div>
          </div>
          
          <Separator className="bg-white/20" />
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Hourly Rate</span>
              <span className="text-white">${bookingDetails.hourlyRate}/hr</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Total Session Cost</span>
              <span className="text-white">${bookingDetails.totalAmount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Deposit (50%)</span>
              <div className="text-right">
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                  ${bookingDetails.depositAmount}
                </Badge>
              </div>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/50">Remaining balance due at session</span>
              <span className="text-white/50">${bookingDetails.remainingAmount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3 text-white font-light tracking-wider">
            <CreditCard className="w-6 h-6" />
            <span>PAYMENT INFORMATION</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 border border-white/20 rounded-lg bg-white/5">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#ffffff',
                      '::placeholder': {
                        color: '#ffffff80',
                      },
                    },
                  },
                }}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 border-white/30 text-white bg-transparent hover:bg-white/10 py-6"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!stripe || isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-6 font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Pay Deposit ${bookingDetails.depositAmount}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-white/50">
        <p>Your payment is secured by Stripe. Your card will only be charged after confirmation.</p>
        <p className="mt-1">The remaining balance of ${bookingDetails.remainingAmount} is due at your session.</p>
      </div>
    </div>
  )
}

// Debug component to show Stripe status
const StripeDebugInfo = () => {
  const hasKey = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  return (
    <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs">
      <p className="text-blue-400">
        🔧 Debug: Stripe Key Available: {hasKey ? '✅ Yes' : '❌ No'} 
        {hasKey && ` (${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 10)}...)`}
      </p>
    </div>
  )
}

export const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  bookingData,
  onSuccess,
  onCancel,
}) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        bookingData={bookingData}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  )
} 