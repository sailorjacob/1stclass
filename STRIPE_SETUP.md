# Enhanced Studio Booking System Setup Guide

## 🚀 Your advanced booking system with calendar is ready!

### What's Been Set Up

✅ **Advanced Calendar Booking System**
- Real-time calendar view showing available/booked slots
- Automatic engineer assignment by room:
  - Terminal A → Murda
  - Terminal B → Mike 
  - Terminal C → Chaos
- Multi-step booking flow with progress indicator
- Prevents double-booking with real-time availability checks

✅ **Complete Stripe Integration**
- Payment processing for studio bookings
- 50% deposit calculation
- Secure checkout with Stripe Elements
- Booking confirmation flow
- API routes for payment processing

✅ **GoHighLevel CRM Integration**
- Automatic contact creation on booking
- Custom fields for all booking data
- Workflow trigger capability
- Tags for segmentation

✅ **Features Added**
- Professional calendar interface with week/day views
- Color-coded studios (Purple/Blue/Green)
- Duration-based pricing calculator
- Real-time slot availability
- Booking data storage
- Backup to Google Sheets (optional)

### Next Steps - Environment Setup

1. **Create a Stripe Account** (if you don't have one)
   - Go to [https://stripe.com](https://stripe.com)
   - Sign up for a free account

2. **Get Your API Keys**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
   - Copy your **Publishable key** (starts with `pk_test_`)
   - Copy your **Secret key** (starts with `sk_test_`)

3. **Create Environment File**
   - Create a `.env.local` file in your project root
   - Add the following (replace with your actual keys):

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# GoHighLevel Integration (configured and ready)
GOHIGHLEVEL_WEBHOOK_URL=https://services.leadconnectorhq.com/hooks/9z3OZIZFEngLUF9ijv5z/webhook-trigger/81bfe9a0-cb0b-4559-a80b-42877a977bf2

# Google Sheets Webhook (optional for backup)
GOOGLE_SHEETS_WEBHOOK_URL=your_webhook_url_here

# Application URL (for API calls)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Testing Your Integration

1. **Start the development server**:
   ```bash
   pnpm dev
   ```

2. **Test the booking flow**:
   - Go to `/booking`
   - Fill out the form
   - Use Stripe test cards:
     - Success: `4242 4242 4242 4242`
     - Decline: `4000 0000 0000 0002`
     - Any future expiry date (e.g., 12/34)
     - Any 3-digit CVC

### Current Pricing Structure

The system automatically calculates pricing based on:

- **Terminal A**: $80/hr (with engineer) | $40/hr (without)
- **Terminal B**: $60/hr (with engineer) | $30/hr (without) 
- **Terminal C**: $50/hr (with engineer) | $25/hr (without)

**Deposit**: 50% of total session cost
**Remaining**: Due at the session

### How the New Booking Flow Works

1. **Studio Selection**: Clients choose their studio and whether they want an engineer
2. **Calendar View**: 
   - See real-time availability
   - Select session duration (2, 3, 4, or 6 hours)
   - Click on available time slots
   - Booked slots are grayed out automatically
3. **Contact Info**: Quick form for name, email, phone
4. **Payment**: Stripe checkout for 50% deposit
5. **Confirmation**: Booking reference and details

### What Happens After Payment

1. ✅ Payment processed through Stripe
2. ✅ Booking saved to system (prevents double-booking)
3. ✅ Contact created in GoHighLevel (if configured)
4. ✅ Workflow triggered for confirmations/reminders
5. ✅ Data backed up to Google Sheets (if configured)
6. ✅ Confirmation screen with booking reference

### GoHighLevel Setup Instructions

1. **Get Your API Credentials**:
   - Log into GoHighLevel
   - Go to Settings → Integrations → API
   - Generate an API key
   - Copy your Location ID

2. **Create a Booking Workflow**:
   - Go to Automation → Workflows
   - Create a new workflow triggered by "Contact Created"
   - Add these actions:
     - Send SMS: "Thanks for booking {{custom_fields.room_booked}} on {{custom_fields.booking_date}}!"
     - Wait 24 hours
     - Send reminder SMS
     - Add to "Studio Clients" list

3. **Custom Fields in GoHighLevel**:
   The system will automatically populate these fields:
   - `room_booked`: Terminal A/B/C
   - `engineer_assigned`: Murda/Mike/Chaos
   - `booking_date`: Date of session
   - `booking_time`: Time of session
   - `total_price`: Total amount
   - `payment_confirmation_id`: Stripe payment ID

### Google Sheets Backup (Optional)

1. Create a Google Form with these fields:
   - firstName, lastName, email, phone
   - roomBooked, engineerAssigned
   - bookingDate, bookingTime
   - totalPrice, paymentConfirmationId
   - timestamp

2. Get the webhook URL from the form's script editor
3. Add to your `.env.local` file

### Next Development Steps

#### 1. Database Integration
For production, replace the in-memory storage with a real database:

```typescript
// Example with Supabase
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key)

// Save booking
const { data, error } = await supabase
  .from('bookings')
  .insert([bookingData])

// Get bookings for calendar
const { data: bookings } = await supabase
  .from('bookings')
  .select('*')
  .eq('status', 'confirmed')
```

#### 2. Enhanced Features
- **Recurring bookings**: Allow clients to book weekly sessions
- **Multi-room bookings**: Book multiple studios for larger productions
- **Engineer preferences**: Let clients request specific engineers
- **Email notifications**: Automated confirmations and reminders
- **Admin dashboard**: View all bookings, manage availability
- **Cancellation system**: Allow cancellations with policy enforcement

### Troubleshooting

**Common Issues:**
- **Environment variables not loading**: Restart your dev server after adding `.env.local`
- **Stripe keys not working**: Make sure you're using the correct test/live keys
- **Payment failing**: Check the Stripe dashboard logs for detailed error messages

**Security Notes:**
- Never commit your `.env.local` file to version control
- Use test keys for development, live keys only for production
- Consider adding webhook endpoints for production reliability

### Support

Your booking system is now fully functional! If you need help with:
- Email integration
- Database setup
- Production deployment
- Webhook configuration

Just let me know! 🎉 