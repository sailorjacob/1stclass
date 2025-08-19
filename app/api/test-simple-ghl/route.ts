import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GOHIGHLEVEL_API_KEY
    const locationId = process.env.GOHIGHLEVEL_LOCATION_ID

    if (!apiKey || !locationId) {
      return NextResponse.json({ error: 'Missing API credentials' }, { status: 500 })
    }

    // Try different fields that might accept text
    const simplePayload = {
      locationId,
      firstName: "FieldTest",
      lastName: "Various",
      email: "fieldtest@example.com",
      phone: "+15555551235",
      // Try multiple text fields
      address1: "BOOKING INFO: Terminal A at 2:00 PM",
      city: "Test City Info",
      website: "https://booking-info.com",
      companyName: "Studio Booking Details",
      tags: ["field-test"]
    }

    console.log('Simple payload:', JSON.stringify(simplePayload, null, 2))

    // Try v1 API with minimal payload
    const response = await axios.post(
      `https://rest.gohighlevel.com/v1/contacts/`,
      simplePayload,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    console.log('Simple response:', response.data)

    return NextResponse.json({
      success: true,
      contactId: response.data.contact.id,
      message: 'Simple test completed',
      payload: simplePayload
    })

  } catch (error) {
    console.error('Simple test error:', error)
    
    if (axios.isAxiosError(error)) {
      console.error('Error response:', error.response?.data)
      return NextResponse.json(
        { error: 'API error', details: error.response?.data },
        { status: error.response?.status || 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed simple test' },
      { status: 500 }
    )
  }
}
