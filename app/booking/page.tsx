"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Calendar, Clock, Users, CheckCircle, ArrowRight, Music, Mic2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { StripeCheckout } from "@/components/StripeCheckout"
import { BookingCalendar } from "@/components/BookingCalendar"
import { ROOM_ENGINEERS, ROOM_COLORS, Booking } from "@/lib/booking-config"
import { STUDIO_PRICING, calculateBookingTotal, calculateDeposit } from "@/lib/stripe"
import { format } from "date-fns"
import "../calendar-styles.css"
import { Checkbox } from "@/components/ui/checkbox"

// Add Formspree form submission function
const submitToFormspree = async (data: any) => {
  try {
    const formData = new FormData()
    
    // Add all the booking session data
    formData.append('Studio', data.studio)
    formData.append('Date', data.date)
    formData.append('Time', data.time)
    formData.append('Duration', data.duration)
    formData.append('Engineer', data.engineer === 'yes' ? 'Included' : 'Not included')
    formData.append('Project Type', data.projectType || 'Not specified')
    formData.append('Message', data.message || 'No message')
    formData.append('Customer Name', data.name)
    formData.append('Customer Email', data.email)
    formData.append('Customer Phone', data.phone)
    formData.append('SMS Consent', data.smsConsent ? 'Yes' : 'No')
    formData.append('Promotional Consent', data.promotionalConsent ? 'Yes' : 'No')
    formData.append('Booking Source', 'Website')
    formData.append('Form Type', 'Studio Booking')
    
    // Submit to Formspree
    await fetch('https://formspree.io/f/xjkebeea', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
    
    console.log('✅ Booking data sent to Formspree successfully')
  } catch (error) {
    console.error('❌ Failed to send to Formspree:', error)
    // Don't block the flow if Formspree fails
  }
}

type BookingStep = 'booking' | 'contact-info' | 'checkout' | 'confirmation'

export default function BookingPage() {
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState<BookingStep>('booking')
  const [existingBookings, setExistingBookings] = useState<Booking[]>([])
  
  // Form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    studio: "terminal-a",
    date: "",
    time: "",
    duration: "2",
    engineer: "yes",
    projectType: "",
    message: "",
    smsConsent: false,
    promotionalConsent: false,
  })

  // Calendar selection state
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    date: Date
    startTime: string
    endTime: string
    engineerName: string
  } | null>(null)

  // Payment state
  const [showCheckout, setShowCheckout] = useState(false)
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [paymentIntentId, setPaymentIntentId] = useState<string>("")

  // Fetch existing bookings on mount
  useEffect(() => {
    fetchExistingBookings()
  }, [])

  const fetchExistingBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      const data = await response.json()
      setExistingBookings(data.bookings || [])
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    }
  }

  const handleTimeSlotSelect = (slotInfo: {
    studio: string
    date: Date
    startTime: string
    endTime: string
    duration: number
    engineerName: string
    withEngineer: boolean
  }) => {
    setSelectedTimeSlot({
      date: slotInfo.date,
      startTime: slotInfo.startTime,
      endTime: slotInfo.endTime,
      engineerName: slotInfo.engineerName,
    })
    
    setFormData(prev => ({
      ...prev,
      date: format(slotInfo.date, 'yyyy-MM-dd'),
      time: slotInfo.startTime,
      duration: slotInfo.duration.toString(),
    }))
    
    // Auto-advance to contact info
    setCurrentStep('contact-info')
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill in all contact information')
      return
    }
    setShowCheckout(true)
    setCurrentStep('checkout')
  }

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      // Check if we're in test mode
      const isTestMode = window.location.search.includes('test=true') || window.location.search.includes('testmode=1')
      
      const response = await fetch('/api/confirm-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          paymentIntentId,
          testMode: isTestMode
        }),
      })

      if (response.ok) {
        // Backup Formspree submission after successful payment
        try {
          await submitToFormspree({
            ...formData,
            paymentIntentId,
            totalAmount,
            depositAmount,
            status: 'Payment Confirmed'
          })
        } catch (formspreeError) {
          console.error('Formspree backup submission failed:', formspreeError)
          // Don't block the success flow
        }
        
        setPaymentIntentId(paymentIntentId)
        setBookingConfirmed(true)
        setCurrentStep('confirmation')
        fetchExistingBookings() // Refresh bookings
      }
    } catch (error) {
      console.error('Error confirming booking:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleBooleanChange = (field: string, value: boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetBooking = () => {
    setCurrentStep('booking')
    setFormData({
      name: "",
      email: "",
      phone: "",
      studio: "terminal-a",
      date: "",
      time: "",
      duration: "2",
      engineer: "yes",
      projectType: "",
      message: "",
      smsConsent: false,
      promotionalConsent: false,
    })
    setSelectedTimeSlot(null)
    setShowCheckout(false)
    setBookingConfirmed(false)
  }

  // Calculate pricing
  const withEngineer = formData.engineer === 'yes'
  const duration = parseInt(formData.duration) || 2
  const totalAmount = formData.studio ? calculateBookingTotal(formData.studio as any, duration, withEngineer) : 0
  const depositAmount = calculateDeposit(totalAmount)

  // Get current studio info
  const currentStudio = STUDIO_PRICING[formData.studio as keyof typeof STUDIO_PRICING]
  const hourlyRate = withEngineer ? currentStudio?.withEngineer : currentStudio?.withoutEngineer

  return (
    <div className="min-h-screen bg-neutral-900">
      <Navigation />

      {/* Progress Bar - Simplified */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-center space-x-2">
            {['booking', 'contact-info', 'checkout', 'confirmation'].map((step, index) => (
              <React.Fragment key={step}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all ${
                  currentStep === step ? 'bg-white text-black' : 
                  index < ['booking', 'contact-info', 'checkout', 'confirmation'].indexOf(currentStep) 
                    ? 'bg-orange-500 text-white' : 'bg-white/20 text-white/60'
                }`}>
                  {index < ['booking', 'contact-info', 'checkout', 'confirmation'].indexOf(currentStep) 
                    ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                {index < 3 && (
                  <div className={`w-12 md:w-16 h-0.5 transition-all ${
                    index < ['booking', 'contact-info', 'checkout', 'confirmation'].indexOf(currentStep) 
                      ? 'bg-orange-500' : 'bg-white/20'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-28 pb-16 px-4 md:px-8">
        <div className="container mx-auto">
          
          {/* Step 1: All-in-One Booking */}
          {currentStep === 'booking' && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-7xl mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-light text-white mb-2 tracking-wider">BOOK YOUR SESSION</h1>
                <p className="text-white/60">Select your studio, options, and time</p>
              </div>

              {/* Booking Controls - All in one row on desktop */}
              <Card className="bg-white/5 border-white/10 mb-6">
                <CardContent className="p-4 md:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                    
                    {/* Studio Selection */}
                    <div>
                      <Label className="text-white/60 text-xs uppercase tracking-wider mb-3 block">Studio</Label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(STUDIO_PRICING).map(([studioId, studio]) => (
                          <button
                            key={studioId}
                            onClick={() => handleInputChange('studio', studioId)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              formData.studio === studioId
                                ? 'text-white'
                                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                            }`}
                            style={formData.studio === studioId ? { 
                              backgroundColor: ROOM_COLORS[studioId as keyof typeof ROOM_COLORS] 
                            } : {}}
                          >
                            {studio.name.replace('Terminal ', '')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Engineer Toggle */}
                    <div>
                      <Label className="text-white/60 text-xs uppercase tracking-wider mb-3 block">Engineer</Label>
                      <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-3 border border-white/10">
                        <Mic2 className={`w-5 h-5 ${withEngineer ? 'text-orange-500' : 'text-white/40'}`} />
                        <Switch
                          checked={withEngineer}
                          onCheckedChange={(checked) => handleInputChange('engineer', checked ? 'yes' : 'no')}
                          className="data-[state=checked]:bg-orange-500"
                        />
                        <span className="text-white text-sm">
                          {withEngineer ? 'Included' : 'Not included'}
                        </span>
                      </div>
                    </div>

                    {/* Duration Selection */}
                    <div>
                      <Label className="text-white/60 text-xs uppercase tracking-wider mb-3 block">Duration</Label>
                      <div className="flex flex-wrap gap-2">
                        {['2', '3', '4', '6'].map(hours => (
                          <button
                            key={hours}
                            onClick={() => handleInputChange('duration', hours)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              formData.duration === hours
                                ? 'bg-white text-black'
                                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                            }`}
                          >
                            {hours}hr
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Display */}
                    <div>
                      <Label className="text-white/60 text-xs uppercase tracking-wider mb-3 block">Session Total</Label>
                      <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/10 rounded-lg p-3 border border-orange-500/30">
                        <div className="flex items-baseline space-x-2">
                          <span className="text-2xl md:text-3xl font-bold text-white">${totalAmount}</span>
                          <span className="text-white/60 text-sm">({duration}hr × ${hourlyRate})</span>
                        </div>
                        <div className="text-orange-400 text-sm mt-1">
                          ${depositAmount} deposit due today
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Calendar */}
              <BookingCalendar
                onSlotSelect={handleTimeSlotSelect}
                existingBookings={existingBookings}
                selectedStudio={formData.studio}
                selectedDuration={formData.duration}
                withEngineer={withEngineer}
              />

              {/* Quick Info */}
              <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-white/50">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-white/10" />
                  <span>Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-gray-600" />
                  <span>Booked</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Click a time to book</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Contact Information */}
          {currentStep === 'contact-info' && selectedTimeSlot && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-light text-white mb-2 tracking-wider">YOUR INFORMATION</h1>
                <p className="text-white/60">Almost there! Just need your contact details</p>
              </div>

              {/* Booking Summary */}
              <Card className="bg-gradient-to-r from-orange-500/10 to-transparent border-orange-500/30 mb-6">
                <CardContent className="p-4 md:p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-white/50 text-xs uppercase">Studio</p>
                      <p className="text-white font-medium">{currentStudio?.name}</p>
                    </div>
                    <div>
                      <p className="text-white/50 text-xs uppercase">Date</p>
                      <p className="text-white font-medium">
                        {format(selectedTimeSlot.date, 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/50 text-xs uppercase">Time</p>
                      <p className="text-white font-medium">
                        {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/50 text-xs uppercase">Total</p>
                      <p className="text-white font-medium">${totalAmount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Form */}
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4 md:p-6">
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-white/70 text-sm">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="bg-neutral-800/50 border-white/20 text-white mt-1"
                        placeholder="Your name"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email" className="text-white/70 text-sm">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="bg-neutral-800/50 border-white/20 text-white mt-1"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-white/70 text-sm">Phone *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="bg-neutral-800/50 border-white/20 text-white mt-1"
                          placeholder="(555) 000-0000"
                          required
                        />
                      </div>
                    </div>

                    {/* SMS Consent */}
                    <div className="pt-2 space-y-3">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="sms-consent"
                          checked={formData.smsConsent}
                          onCheckedChange={(checked) => handleBooleanChange('smsConsent', checked === true)}
                          className="mt-1 border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-black"
                        />
                        <label htmlFor="sms-consent" className="text-xs text-white/70 leading-relaxed">
                          I consent to receive booking confirmations and reminders via SMS. Message & data rates may apply.
                        </label>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="promotional-consent"
                          checked={formData.promotionalConsent}
                          onCheckedChange={(checked) => handleBooleanChange('promotionalConsent', checked === true)}
                          className="mt-1 border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-black"
                        />
                        <label htmlFor="promotional-consent" className="text-xs text-white/70 leading-relaxed">
                          I'd like to receive promotional offers and updates.
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        onClick={() => {
                          setSelectedTimeSlot(null)
                          setCurrentStep('booking')
                        }}
                        className="flex-1 border-white/20 text-white hover:bg-white/10 border bg-transparent"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={async (e) => {
                          if (!formData.smsConsent) {
                            e.preventDefault()
                            alert('Please accept SMS consent to continue')
                            return
                          }
                          await submitToFormspree(formData)
                          setCurrentStep('checkout')
                          setShowCheckout(true)
                        }}
                      >
                        Continue to Payment
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <p className="text-center text-xs text-white/40 mt-4">
                <Link href="/terms" className="underline">Terms</Link>
                {' · '}
                <Link href="/privacy" className="underline">Privacy</Link>
              </p>
            </motion.div>
          )}

          {/* Step 3: Checkout */}
          {currentStep === 'checkout' && showCheckout && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl mx-auto"
            >
              <StripeCheckout
                bookingData={formData}
                onSuccess={handlePaymentSuccess}
                onCancel={() => {
                  setShowCheckout(false)
                  setCurrentStep('contact-info')
                }}
              />
            </motion.div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 'confirmation' && bookingConfirmed && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl mx-auto text-center"
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-8 md:p-12">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-light text-white mb-4 tracking-wider">BOOKING CONFIRMED!</h2>
                  <p className="text-white/60 text-lg mb-8">
                    Thank you! We'll send a confirmation to {formData.email}
                  </p>
                  
                  <div className="bg-black/20 rounded-lg p-4 mb-6 text-left">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-white/50">Studio</p>
                        <p className="text-white">{currentStudio?.name}</p>
                      </div>
                      <div>
                        <p className="text-white/50">Date & Time</p>
                        <p className="text-white">{selectedTimeSlot && format(selectedTimeSlot.date, 'MMM d')} at {selectedTimeSlot?.startTime}</p>
                      </div>
                      <div>
                        <p className="text-white/50">Deposit Paid</p>
                        <p className="text-green-400">${depositAmount}</p>
                      </div>
                      <div>
                        <p className="text-white/50">Balance Due</p>
                        <p className="text-white">${totalAmount - depositAmount}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-white/40 text-sm mb-6">
                    Reference: {paymentIntentId}
                  </p>

                  <Button
                    onClick={resetBooking}
                    className="bg-white text-black hover:bg-gray-100 px-8"
                  >
                    Book Another Session
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
