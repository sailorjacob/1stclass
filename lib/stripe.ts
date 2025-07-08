import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'

// Server-side Stripe instance (only create when needed)
let stripeInstance: Stripe | null = null

export const getServerStripe = (): Stripe => {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil',
      typescript: true,
    })
  }
  return stripeInstance
}

// Client-side Stripe promise
export const getStripe = () => {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
  }
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
}

// Studio pricing configuration
export const STUDIO_PRICING = {
  'terminal-a': {
    withEngineer: 80,
    withoutEngineer: 40,
    name: 'Terminal A',
    capacity: 10
  },
  'terminal-b': {
    withEngineer: 60,
    withoutEngineer: 30,
    name: 'Terminal B',
    capacity: 5
  },
  'terminal-c': {
    withEngineer: 50,
    withoutEngineer: 25,
    name: 'Terminal C',
    capacity: 3
  }
} as const

export type StudioId = keyof typeof STUDIO_PRICING

export function calculateBookingTotal(
  studioId: StudioId,
  duration: number,
  withEngineer: boolean
): number {
  const studio = STUDIO_PRICING[studioId]
  const hourlyRate = withEngineer ? studio.withEngineer : studio.withoutEngineer
  return hourlyRate * duration
}

export function calculateDeposit(total: number): number {
  return Math.round(total * 0.5) // 50% deposit
} 