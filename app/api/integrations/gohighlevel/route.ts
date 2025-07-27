import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { z } from 'zod'
import { GoHighLevelContact } from '@/lib/booking-config'

// Validation schema for GoHighLevel integration
const goHighLevelSchema = z.object({
  firstName: z.string(),
  lastName: z.string().optional(),
  email: z.string().email(),
  phone: z.string(),
  roomBooked: z.string(),
  engineerAssigned: z.string(),
  bookingDate: z.string(),
  bookingTime: z.string(),
  totalPrice: z.number(),
  paymentConfirmationId: z.string(),
  // Enhanced booking details
  duration: z.number().optional(),
  depositAmount: z.number().optional(),
  remainingBalance: z.number().optional(),
  projectType: z.string().optional(),
  message: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = goHighLevelSchema.parse(body)

    // Get GoHighLevel API key from environment
    const apiKey = process.env.GOHIGHLEVEL_API_KEY
    const locationId = process.env.GOHIGHLEVEL_LOCATION_ID

    if (!apiKey || !locationId) {
      console.error('GoHighLevel API credentials not configured')
      return NextResponse.json(
        { error: 'CRM integration not configured' },
        { status: 500 }
      )
    }

    // Prepare contact data for GoHighLevel
    const contactData: GoHighLevelContact = {
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email,
      phone: validatedData.phone,
      tags: [
        'studio-booking', 
        'deposit-paid', 
        validatedData.roomBooked,
        `${validatedData.roomBooked}-session`,
        validatedData.engineerAssigned !== 'No Engineer' ? 'with-engineer' : 'self-service'
      ],
      customFields: {
        room_booked: validatedData.roomBooked,
        engineer_assigned: validatedData.engineerAssigned,
        booking_date: validatedData.bookingDate,
        booking_time: validatedData.bookingTime,
        session_duration: validatedData.duration ? `${validatedData.duration} hours` : 'Not specified',
        total_session_cost: validatedData.totalPrice,
        deposit_paid: validatedData.depositAmount || Math.floor(validatedData.totalPrice * 0.5),
        remaining_balance: validatedData.remainingBalance || Math.floor(validatedData.totalPrice * 0.5),
        deposit_date: new Date().toISOString().split('T')[0],
        payment_confirmation_id: validatedData.paymentConfirmationId,
        booking_status: 'confirmed',
        with_engineer: validatedData.engineerAssigned !== 'No Engineer' ? 'Yes' : 'No',
        studio_display_name: validatedData.roomBooked.replace('-', ' ').toUpperCase(),
        session_start_time: `${validatedData.bookingDate} ${validatedData.bookingTime}`,
        booking_source: 'Studio Website',
        project_type: validatedData.projectType || 'Not specified',
        customer_message: validatedData.message || 'No message provided',
      },
    }

    // Create or update contact in GoHighLevel
    const response = await axios.post(
      `https://rest.gohighlevel.com/v1/contacts/`,
      {
        locationId,
        ...contactData,
        source: 'Studio Booking System',
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const contactId = response.data.contact.id

    // Trigger booking confirmation workflow
    if (process.env.GOHIGHLEVEL_BOOKING_WORKFLOW_ID) {
      await axios.post(
        `https://rest.gohighlevel.com/v1/contacts/${contactId}/workflow/${process.env.GOHIGHLEVEL_BOOKING_WORKFLOW_ID}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        }
      )
    }

    // Also backup to Google Sheets if configured
    if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
      try {
        await axios.post(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
          ...validatedData,
          timestamp: new Date().toISOString(),
        })
      } catch (error) {
        console.error('Failed to backup to Google Sheets:', error)
        // Don't fail the request if backup fails
      }
    }

    return NextResponse.json({
      success: true,
      contactId,
      message: 'Contact created and workflow triggered',
    })

  } catch (error) {
    console.error('GoHighLevel integration error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data format', details: error.errors },
        { status: 400 }
      )
    }

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { error: 'CRM API error', message: error.response?.data?.message || error.message },
        { status: error.response?.status || 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to sync with CRM' },
      { status: 500 }
    )
  }
} 