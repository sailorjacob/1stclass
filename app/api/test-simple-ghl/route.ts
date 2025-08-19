import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GOHIGHLEVEL_API_KEY
    const locationId = process.env.GOHIGHLEVEL_LOCATION_ID

    if (!apiKey || !locationId) {
      return NextResponse.json({ error: 'Missing API credentials' }, { status: 500 })
    }

    // Test individual fields with v1 API to see what works
    const simplePayload = {
      locationId,
      firstName: "OneField",
      lastName: "Test",
      email: "onefield@example.com",
      phone: "+15555551237",
      address1: "TEST ADDRESS FIELD",
      tags: ["one-field-test"]
    }

    console.log('=== PAYLOAD WE ARE SENDING ===')
    console.log(JSON.stringify(simplePayload, null, 2))
    console.log('=== PAYLOAD END ===')

    // Use v1 API to test individual fields
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
      contactId: response.data.contact?.id || response.data.id,
      message: 'V2 API test completed',
      payload: simplePayload,
      apiUsed: 'v2'
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
