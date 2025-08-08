// Engineer assignments by room
export const ROOM_ENGINEERS = {
  'terminal-a': {
    defaultEngineer: 'Murda',
    engineerId: 'engineer-murda',
  },
  'terminal-b': {
    defaultEngineer: 'Mike',
    engineerId: 'engineer-mike',
  },
  'terminal-c': {
    defaultEngineer: 'Chaos',
    engineerId: 'engineer-chaos',
  },
} as const

// Business hours configuration
export const BUSINESS_HOURS = {
  start: 9, // 9 AM
  end: 21, // 9 PM
  daysOpen: [1, 2, 3, 4, 5, 6, 0], // Mon-Sun (0 = Sunday)
}

// Booking slot duration in minutes
export const SLOT_DURATION = 60 // 1 hour slots for easier visualization

// Minimum booking duration in hours
export const MIN_BOOKING_HOURS = 2

// Colors for calendar display
export const ROOM_COLORS = {
  'terminal-a': '#F97316', // Orange
  'terminal-b': '#6B7280', // Grey
  'terminal-c': '#F97316', // Orange
}

// Booking status types
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

// Booking type
export interface Booking {
  id: string
  clientName: string
  clientEmail: string
  clientPhone: string
  studio: 'terminal-a' | 'terminal-b' | 'terminal-c'
  engineerName: string
  engineerId: string
  withEngineer: boolean
  startTime: Date
  endTime: Date
  duration: number // in hours
  totalPrice: number
  depositPaid: number
  status: BookingStatus
  stripePaymentIntentId: string
  createdAt: Date
  projectType?: string
  message?: string
  smsConsent?: boolean
}

// GoHighLevel contact data format
export interface GoHighLevelContact {
  firstName: string
  lastName?: string
  email: string
  phone: string
  tags: string[]
  customFields: {
    room_booked: string
    engineer_assigned: string
    booking_date: string
    booking_time: string
    total_price?: number
    payment_confirmation_id: string
    // Enhanced booking details
    session_duration?: string
    total_session_cost?: number
    deposit_paid?: number
    remaining_balance?: number
    deposit_date?: string
    booking_status?: string
    with_engineer?: string
    studio_display_name?: string
    session_start_time?: string
    booking_source?: string
    project_type?: string
    customer_message?: string
  }
} 