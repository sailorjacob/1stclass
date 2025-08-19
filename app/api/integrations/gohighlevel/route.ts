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

    // Build custom fields payload using official array format when IDs are provided
    const cf = (id?: string, value?: string | number | boolean) =>
      id && value !== undefined && value !== null && value !== '' ? [{ id, value }] : []

    // Debug: Log environment variables
    console.log('Environment variables check:', {
      GHL_CF_BOOKING_TIME_ID: process.env.GHL_CF_BOOKING_TIME_ID,
      GHL_CF_ROOM_BOOKED_ID: process.env.GHL_CF_ROOM_BOOKED_ID,
      GHL_CF_ENGINEER_ASSIGNED_ID: process.env.GHL_CF_ENGINEER_ASSIGNED_ID,
      GHL_CF_SESSION_DURATION_ID: process.env.GHL_CF_SESSION_DURATION_ID,
      GHL_CF_BOOKING_DATE_ID: process.env.GHL_CF_BOOKING_DATE_ID,
      GHL_CF_APPOINTMENT_START_ID: process.env.GHL_CF_APPOINTMENT_START_ID,
    })

    const customFieldsArray = [
      ...cf(process.env.GHL_CF_ROOM_BOOKED_ID, validatedData.roomBooked),
      ...cf(process.env.GHL_CF_ENGINEER_ASSIGNED_ID, validatedData.engineerAssigned),
      ...cf(process.env.GHL_CF_BOOKING_DATE_ID, validatedData.bookingDate),
      ...cf(process.env.GHL_CF_BOOKING_TIME_ID, validatedData.bookingTime),
      ...cf(process.env.GHL_CF_SESSION_DURATION_ID, validatedData.duration ? `${validatedData.duration} hours` : 'Not specified'),
      ...cf(process.env.GHL_CF_TOTAL_SESSION_COST_ID, validatedData.totalPrice),
      ...cf(process.env.GHL_CF_DEPOSIT_PAID_ID, validatedData.depositAmount ?? Math.floor(validatedData.totalPrice * 0.5)),
      ...cf(process.env.GHL_CF_REMAINING_BALANCE_ID, validatedData.remainingBalance ?? Math.floor(validatedData.totalPrice * 0.5)),
      ...cf(process.env.GHL_CF_DEPOSIT_DATE_ID, new Date().toISOString().split('T')[0]),
      ...cf(process.env.GHL_CF_PAYMENT_CONFIRMATION_ID, validatedData.paymentConfirmationId),
      ...cf(process.env.GHL_CF_BOOKING_STATUS_ID, 'confirmed'),
      ...cf(process.env.GHL_CF_WITH_ENGINEER_ID, validatedData.engineerAssigned !== 'No Engineer' ? 'Yes' : 'No'),
      ...cf(process.env.GHL_CF_STUDIO_DISPLAY_NAME_ID, validatedData.roomBooked.replace('-', ' ').toUpperCase()),
      ...cf(process.env.GHL_CF_SESSION_START_TIME_ID, `${validatedData.bookingDate} ${validatedData.bookingTime}`),
      ...cf(process.env.GHL_CF_APPOINTMENT_START_ID, `${validatedData.bookingDate}T${validatedData.bookingTime}:00`),
      ...cf(process.env.GHL_CF_BOOKING_SOURCE_ID, 'Studio Website'),
      ...cf(process.env.GHL_CF_PROJECT_TYPE_ID, validatedData.projectType || 'Not specified'),
      ...cf(process.env.GHL_CF_CUSTOMER_MESSAGE_ID, validatedData.message || 'No message provided'),
    ]

    const contactPayload = {
      locationId,
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
      source: 'Studio Booking System',
      // Use object format with field names that match GHL exactly
      customFields: {
        booking_time: validatedData.bookingTime,
        room_booked: validatedData.roomBooked,
        engineer_assigned: validatedData.engineerAssigned,
        session_duration: validatedData.duration ? `${validatedData.duration} hours` : 'Not specified',
        booking_date: validatedData.bookingDate,
        appointment_start: `${validatedData.bookingDate}T${validatedData.bookingTime}:00`,
      },
    }

    // Debug: Log the exact payload being sent
    console.log('GHL Payload:', JSON.stringify(contactPayload, null, 2))
    console.log('Custom Fields Array:', customFieldsArray)

    // Create comprehensive booking notes for automation use
    const bookingNotes = `
STUDIO BOOKING DETAILS
======================
📅 Date: ${validatedData.bookingDate}
⏰ Time: ${validatedData.bookingTime}
🏢 Studio: ${validatedData.roomBooked.replace('-', ' ').toUpperCase()}
👨‍💼 Engineer: ${validatedData.engineerAssigned}
⏱️ Duration: ${validatedData.duration ? `${validatedData.duration} hours` : 'Not specified'}
💰 Total Cost: $${validatedData.totalPrice}
💳 Deposit Paid: $${validatedData.depositAmount || Math.floor(validatedData.totalPrice * 0.5)}
💵 Remaining Balance: $${validatedData.remainingBalance || Math.floor(validatedData.totalPrice * 0.5)}
🔗 Payment ID: ${validatedData.paymentConfirmationId}
📍 Booking Source: Studio Website
📝 Project Type: ${validatedData.projectType || 'Not specified'}
💬 Customer Message: ${validatedData.message || 'No message provided'}

Appointment Start: ${validatedData.bookingDate}T${validatedData.bookingTime}:00
Status: Confirmed & Deposit Paid
    `.trim()

    // EXACT WORKING FORMAT that populated fields before!
    const workingPayload = {
      locationId,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email,
      phone: validatedData.phone,
      // Store booking info in fields that work
      address1: `📅 ${validatedData.bookingDate} ⏰ ${validatedData.bookingTime} 🏢 ${validatedData.roomBooked.toUpperCase()}`,
      city: `Engineer: ${validatedData.engineerAssigned}`,
      website: `Duration: ${validatedData.duration}h | Total: $${validatedData.totalPrice} | Deposit: $${validatedData.depositAmount}`,
      companyName: `Payment: ${validatedData.paymentConfirmationId}`,
      tags: [
        'studio-booking', 
        'deposit-paid', 
        validatedData.roomBooked,
        `${validatedData.roomBooked}-session`,
        validatedData.engineerAssigned !== 'No Engineer' ? 'with-engineer' : 'self-service'
      ],
      source: 'Studio Booking System'
    }

    console.log('Using EXACT WORKING payload:', JSON.stringify(workingPayload, null, 2))

    // Use v1 API with exact format that worked before
    const response = await axios.post(
      `https://rest.gohighlevel.com/v1/contacts/`,
      workingPayload,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )
    
    const contactId = response.data.contact.id
    console.log('v1 API response:', response.data)

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