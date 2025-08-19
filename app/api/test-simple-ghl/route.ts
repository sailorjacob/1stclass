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

    console.log('=== PAYLOAD WE ARE SENDING ===')
    console.log(JSON.stringify(simplePayload, null, 2))
    console.log('=== PAYLOAD END ===')

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

    console.log('=== GHL RESPONSE ===')
    console.log(JSON.stringify(response.data, null, 2))
    console.log('=== RESPONSE END ===')

    // Let's also try to UPDATE the contact with additional fields
    const contactId = response.data.contact.id
    
    const updatePayload = {
      address1: "UPDATE: Terminal B at 3:00 PM",
      city: "Update City",
      website: "https://update-test.com",
      companyName: "Updated Company Name",
      notes: "This is an update attempt with notes"
    }

    console.log('=== UPDATE PAYLOAD ===')
    console.log(JSON.stringify(updatePayload, null, 2))
    console.log('=== UPDATE PAYLOAD END ===')

    try {
      const updateResponse = await axios.put(
        `https://rest.gohighlevel.com/v1/contacts/${contactId}`,
        updatePayload,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      )
      console.log('=== UPDATE RESPONSE ===')
      console.log(JSON.stringify(updateResponse.data, null, 2))
      console.log('=== UPDATE RESPONSE END ===')
    } catch (updateError) {
      console.log('=== UPDATE ERROR ===')
      console.log(updateError.response?.data || updateError.message)
      console.log('=== UPDATE ERROR END ===')
    }

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
