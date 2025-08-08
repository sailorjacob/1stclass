import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

export interface BookingEmailPayload {
  to: string[]
  subject: string
  html: string
}

export async function sendBookingEmail(payload: BookingEmailPayload) {
  if (!resend) {
    console.warn('Resend not configured; skipping email send')
    return { skipped: true }
  }
  try {
    const from = process.env.BOOKING_NOTIFICATIONS_FROM || '1st Class Studios <noreply@1stclass-studios.com>'
    const result = await resend.emails.send({ from, to: payload.to, subject: payload.subject, html: payload.html })
    return { id: (result as any)?.id }
  } catch (err) {
    console.error('Failed to send booking email:', err)
    return { error: true }
  }
}

export function renderBookingEmail(params: {
  clientName: string
  clientEmail: string
  clientPhone: string
  studioName: string
  date: string
  time: string
  durationHours: number
  engineerName: string
  depositAmount: number
  remainingAmount: number
}) {
  const {
    clientName,
    clientEmail,
    clientPhone,
    studioName,
    date,
    time,
    durationHours,
    engineerName,
    depositAmount,
    remainingAmount,
  } = params

  const title = `Booking Confirmed: ${studioName} on ${date} at ${time}`
  const html = `
  <div style="font-family:Inter,system-ui,Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#0a0a0a;color:#fff">
    <h1 style="font-weight:400;letter-spacing:.06em">${title}</h1>
    <p>Thanks ${clientName}! Your booking is confirmed.</p>
    <hr style="border:none;border-top:1px solid #333;margin:16px 0" />
    <table style="width:100%;font-size:14px;color:#ddd">
      <tbody>
        <tr><td style="padding:6px 0;color:#aaa">Studio</td><td style="text-align:right">${studioName}</td></tr>
        <tr><td style="padding:6px 0;color:#aaa">Date</td><td style="text-align:right">${date}</td></tr>
        <tr><td style="padding:6px 0;color:#aaa">Time</td><td style="text-align:right">${time}</td></tr>
        <tr><td style="padding:6px 0;color:#aaa">Duration</td><td style="text-align:right">${durationHours} hours</td></tr>
        <tr><td style="padding:6px 0;color:#aaa">Engineer</td><td style="text-align:right">${engineerName}</td></tr>
        <tr><td style="padding:6px 0;color:#aaa">Deposit Paid</td><td style="text-align:right">$${depositAmount}</td></tr>
        <tr><td style="padding:6px 0;color:#aaa">Remaining Balance</td><td style="text-align:right">$${remainingAmount}</td></tr>
      </tbody>
    </table>
    <hr style="border:none;border-top:1px solid #333;margin:16px 0" />
    <p style="font-size:13px;color:#bbb">Contact: ${clientEmail} • ${clientPhone}</p>
    <p style="font-size:12px;color:#888">Reply STOP to opt out of SMS. Text HELP to (475) 229-9564 for assistance.</p>
  </div>`
  return { subject: title, html }
}

