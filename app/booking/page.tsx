"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, Users, Phone, MessageSquare, CheckCircle, ArrowRight, Music } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { StripeCheckout } from "@/components/StripeCheckout"
import { BookingCalendar } from "@/components/BookingCalendar"
import { ROOM_ENGINEERS, ROOM_COLORS, Booking } from "@/lib/booking-config"
import { STUDIO_PRICING, calculateBookingTotal, calculateDeposit } from "@/lib/stripe"
import { format } from "date-fns"
import "../calendar-styles.css"

type BookingStep = 'studio-selection' | 'calendar' | 'contact-info' | 'checkout' | 'confirmation'

export default function BookingPage() {
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState<BookingStep>('studio-selection')
  const [existingBookings, setExistingBookings] = useState<Booking[]>([])
  
  // Form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    studio: "",
    date: "",
    time: "",
    duration: "",
    engineer: "",
    projectType: "",
    message: "",
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

  const handleStudioSelect = (studio: string, engineer: string, withEngineer: boolean) => {
    setFormData(prev => ({
      ...prev,
      studio,
      engineer: withEngineer ? 'yes' : 'no',
    }))
    setCurrentStep('calendar')
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
      const response = await fetch('/api/confirm-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId }),
      })

      if (response.ok) {
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

  const resetBooking = () => {
    setCurrentStep('studio-selection')
    setFormData({
      name: "",
      email: "",
      phone: "",
      studio: "",
      date: "",
      time: "",
      duration: "",
      engineer: "",
      projectType: "",
      message: "",
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

  return (
    <div className="min-h-screen bg-neutral-900">
      <Navigation />

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-center space-x-2">
            {['studio-selection', 'calendar', 'contact-info', 'checkout', 'confirmation'].map((step, index) => (
              <React.Fragment key={step}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all ${
                  currentStep === step ? 'bg-white text-black' : 
                  index < ['studio-selection', 'calendar', 'contact-info', 'checkout', 'confirmation'].indexOf(currentStep) 
                    ? 'bg-green-500 text-white' : 'bg-white/20 text-white/60'
                }`}>
                  {index < ['studio-selection', 'calendar', 'contact-info', 'checkout', 'confirmation'].indexOf(currentStep) 
                    ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                {index < 4 && (
                  <div className={`w-16 h-0.5 transition-all ${
                    index < ['studio-selection', 'calendar', 'contact-info', 'checkout', 'confirmation'].indexOf(currentStep) 
                      ? 'bg-green-500' : 'bg-white/20'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-32 pb-16 px-8">
        <div className="container mx-auto">
          {/* Step 1: Studio Selection */}
          {currentStep === 'studio-selection' && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-6xl mx-auto"
            >
              <div className="text-center mb-12">
                <h1 className="text-4xl font-light text-white mb-4 tracking-wider">SELECT YOUR STUDIO</h1>
                <p className="text-white/70 text-lg">Choose the perfect space for your session</p>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {Object.entries(STUDIO_PRICING).map(([studioId, studio]) => {
                  const roomConfig = ROOM_ENGINEERS[studioId as keyof typeof ROOM_ENGINEERS]
                  return (
                    <Card 
                      key={studioId} 
                      className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between mb-4">
                          <CardTitle className="text-2xl text-white font-light tracking-wider">
                            {studio.name}
                          </CardTitle>
                          <Badge 
                            className="text-white"
                            style={{ backgroundColor: ROOM_COLORS[studioId as keyof typeof ROOM_COLORS] }}
                          >
                            {studio.capacity} people
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-white/60">
                          <Music className="w-4 h-4" />
                          <span>Default Engineer: {roomConfig.defaultEngineer}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-3 border-b border-white/10">
                            <span className="text-white/80">With Engineer</span>
                            <span className="text-xl font-medium text-white">${studio.withEngineer}/hr</span>
                          </div>
                          <div className="flex justify-between items-center py-3">
                            <span className="text-white/80">Without Engineer</span>
                            <span className="text-xl font-medium text-white">${studio.withoutEngineer}/hr</span>
                          </div>
                        </div>

                                                 <div className="space-y-3">
                           <Button
                             onClick={() => handleStudioSelect(studioId, 'yes', true)}
                             className="w-full py-6 text-white font-medium"
                             style={{ backgroundColor: ROOM_COLORS[studioId as keyof typeof ROOM_COLORS] }}
                           >
                             Book with {roomConfig.defaultEngineer}
                             <ArrowRight className="w-4 h-4 ml-2" />
                           </Button>
                           <Button
                             onClick={() => handleStudioSelect(studioId, 'no', false)}
                             className="w-full border-2 bg-transparent text-white hover:bg-white/10 py-6 font-medium"
                             style={{ 
                               borderColor: ROOM_COLORS[studioId as keyof typeof ROOM_COLORS],
                               color: ROOM_COLORS[studioId as keyof typeof ROOM_COLORS]
                             }}
                           >
                             Book without Engineer
                             <ArrowRight className="w-4 h-4 ml-2" />
                           </Button>
                         </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Step 2: Calendar Selection */}
          {currentStep === 'calendar' && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-7xl mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="text-4xl font-light text-white mb-4 tracking-wider">CHOOSE YOUR TIME</h1>
                <p className="text-white/70 text-lg">Select duration and pick an available slot</p>
              </div>

              {/* Duration Selection */}
              <Card className="bg-white/5 border-white/10 mb-8">
                <CardHeader>
                  <CardTitle className="text-white font-light tracking-wider">SESSION DURATION</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['2', '3', '4', '6'].map(hours => (
                      <Button
                        key={hours}
                        onClick={() => handleInputChange('duration', hours)}
                        className={formData.duration === hours 
                          ? 'bg-white/20 text-white border-white/50 border' 
                          : 'border-white/30 text-white hover:bg-white/10 border bg-transparent'}
                      >
                        {hours} Hours
                        <span className="ml-2 text-sm opacity-70">
                          ${formData.studio && calculateBookingTotal(
                            formData.studio as any, 
                            parseInt(hours), 
                            withEngineer
                          )}
                        </span>
                      </Button>
                    ))}
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

              <div className="mt-8 text-center">
                <Button
                  onClick={() => setCurrentStep('studio-selection')}
                  className="border-white/30 text-white hover:bg-white/10 border bg-transparent"
                >
                  Back to Studio Selection
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Contact Information */}
          {currentStep === 'contact-info' && selectedTimeSlot && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="text-4xl font-light text-white mb-4 tracking-wider">YOUR INFORMATION</h1>
                <p className="text-white/70 text-lg">We'll need this to confirm your booking</p>
              </div>

              {/* Booking Summary */}
              <Card className="bg-white/5 border-white/10 mb-8">
                <CardHeader>
                  <CardTitle className="text-white font-light tracking-wider">BOOKING SUMMARY</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-white/60">Studio</p>
                      <p className="text-white font-medium">
                        {STUDIO_PRICING[formData.studio as keyof typeof STUDIO_PRICING]?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/60">Engineer</p>
                      <p className="text-white font-medium">{selectedTimeSlot.engineerName}</p>
                    </div>
                    <div>
                      <p className="text-white/60">Date</p>
                      <p className="text-white font-medium">
                        {format(selectedTimeSlot.date, 'MMMM d, yyyy')}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/60">Time</p>
                      <p className="text-white font-medium">
                        {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
                      </p>
                    </div>
                  </div>
                  <Separator className="my-4 bg-white/20" />
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Total ({duration} hours)</span>
                    <span className="text-xl font-medium text-white">${totalAmount}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-white/60">Deposit Due (50%)</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      ${depositAmount}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Form */}
              <Card className="bg-white/5 border-white/10">
                <CardContent className="pt-6">
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-white/80 font-light tracking-wider">
                        FULL NAME *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="bg-neutral-800/50 border-white/20 text-white"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-white/80 font-light tracking-wider">
                          EMAIL *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="bg-neutral-800/50 border-white/20 text-white"
                          required
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="phone" className="text-white/80 font-light tracking-wider">
                          PHONE *
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="bg-neutral-800/50 border-white/20 text-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-white/80 font-light tracking-wider">PROJECT TYPE</Label>
                      <Select
                        value={formData.projectType}
                        onValueChange={(value) => handleInputChange("projectType", value)}
                      >
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue placeholder="Select project type (optional)" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-800/95 border-white/20">
                          <SelectItem value="recording" className="text-white">Recording Session</SelectItem>
                          <SelectItem value="mixing" className="text-white">Mixing</SelectItem>
                          <SelectItem value="mastering" className="text-white">Mastering</SelectItem>
                          <SelectItem value="podcast" className="text-white">Podcast</SelectItem>
                          <SelectItem value="other" className="text-white">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="message" className="text-white/80 font-light tracking-wider">
                        ADDITIONAL NOTES
                      </Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        placeholder="Any special requirements or questions..."
                        className="bg-white/5 border-white/20 text-white min-h-[100px]"
                      />
                    </div>

                    <div className="flex space-x-4">
                      <Button
                        type="button"
                        onClick={() => setCurrentStep('calendar')}
                        className="flex-1 border-white/30 text-white hover:bg-white/10 border bg-transparent"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-white text-black hover:bg-gray-100"
                      >
                        Continue to Payment
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Checkout */}
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

          {/* Step 5: Confirmation */}
          {currentStep === 'confirmation' && bookingConfirmed && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl mx-auto text-center"
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-12">
                  <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
                  <h2 className="text-4xl font-light text-white mb-4 tracking-wider">BOOKING CONFIRMED!</h2>
                  <p className="text-white/70 text-lg mb-8">
                    Thank you for your deposit! We'll send a confirmation email shortly.
                  </p>
                  
                  <div className="bg-black/20 rounded-lg p-6 mb-8">
                    <p className="text-white/60 mb-2">Booking Reference</p>
                    <p className="text-white font-mono text-sm">{paymentIntentId}</p>
                  </div>

                  <div className="text-sm text-white/60 space-y-2 mb-8">
                    <p>Confirmation sent to: <span className="text-white">{formData.email}</span></p>
                    <p>Deposit paid: <span className="text-white">${depositAmount}</span></p>
                    <p>Balance due at session: <span className="text-white">${totalAmount - depositAmount}</span></p>
                  </div>

                  <Button
                    onClick={resetBooking}
                    className="bg-white text-black hover:bg-gray-100 px-8 py-3"
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
