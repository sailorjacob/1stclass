import { NextResponse } from 'next/server'

export async function GET() {
  // Only show this in development - don't expose env vars in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const ghlEnvVars = Object.entries(process.env)
    .filter(([key]) => key.startsWith('GHL_CF_'))
    .reduce((acc, [key, value]) => {
      acc[key] = value ? 'SET' : 'NOT_SET'
      return acc
    }, {} as Record<string, string>)

  return NextResponse.json({
    ghlEnvVars,
    nodeEnv: process.env.NODE_ENV,
    hasGhlApiKey: !!process.env.GOHIGHLEVEL_API_KEY,
    hasGhlLocationId: !!process.env.GOHIGHLEVEL_LOCATION_ID,
  })
}
