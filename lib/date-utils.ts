/**
 * Shared date and time formatting utilities for consistent display across the booking system
 */

/**
 * Format a date string (YYYY-MM-DD) to readable format like "Jul 2, 2025"
 */
export function formatBookingDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

/**
 * Convert 24-hour time string (HH:MM) to 12-hour format like "2:30 PM"
 */
export function formatBookingTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':')
  const hour12 = parseInt(hours) % 12 || 12
  const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM'
  return `${hour12}:${minutes} ${ampm}`
}

/**
 * Format booking date and time together for display
 */
export function formatBookingDateTime(dateString: string, timeString: string): string {
  return `${formatBookingDate(dateString)} at ${formatBookingTime(timeString)}`
}

/**
 * Create a comprehensive booking summary for GHL fields
 */
export function createBookingSummary(data: {
  bookingDate: string
  bookingTime: string
  duration: number
  totalPrice: number
  depositAmount: number
  remainingBalance?: number
  projectType?: string
}): {
  formattedDate: string
  formattedTime: string
  formattedDateTime: string
  websiteFieldContent: string
  addressFieldContent: string
} {
  const formattedDate = formatBookingDate(data.bookingDate)
  const formattedTime = formatBookingTime(data.bookingTime)
  const formattedDateTime = formatBookingDateTime(data.bookingDate, data.bookingTime)
  
  const websiteFieldContent = `Date of Booking: ${formattedDate} | Session Start Time: ${formattedTime} | Duration: ${data.duration}h | Total: $${data.totalPrice} | Deposit: $${data.depositAmount} | Remaining: $${data.remainingBalance || Math.floor(data.totalPrice * 0.5)} | Project: ${data.projectType || 'Unspecified'}`
  
  const addressFieldContent = `📅 ${formattedDate} ⏰ ${formattedTime}`
  
  return {
    formattedDate,
    formattedTime,
    formattedDateTime,
    websiteFieldContent,
    addressFieldContent
  }
}
