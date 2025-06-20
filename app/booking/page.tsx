"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, Phone, MessageSquare, CheckCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Navigation } from "@/components/navigation"

export default function BookingPage() {
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

  const studios = [
    { value: "terminal-a", label: "Terminal A - $80/HR (with engineer) | $40/HR (without)", capacity: "10 people" },
    { value: "terminal-b", label: "Terminal B - $60/HR (with engineer) | $30/HR (without)", capacity: "5 people" },
    { value: "terminal-c", label: "Terminal C - $50/HR (with engineer) | $25/HR (without)", capacity: "3 people" },
  ]

  const timeSlots = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
    "7:00 PM",
    "8:00 PM",
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Navigation */}
      <Navigation />

      {/* Simplified Hero Section */}
      <section className="relative pt-32 pb-12 px-8">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <p className="text-lg text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
              Fill out the form below to request a booking, or contact us directly to schedule your session.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-8 pb-32">
        <div className="grid lg:grid-cols-3 gap-16">
          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-8">
                <CardTitle className="text-3xl text-white font-light tracking-wider">BOOKING REQUEST FORM</CardTitle>
                <p className="text-white/60 font-light">
                  Please fill out all required fields. We'll contact you to confirm your booking.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Personal Information */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-white/80 font-light tracking-wider">
                        FULL NAME *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="bg-neutral-800/50 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 py-6"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-white/80 font-light tracking-wider">
                        EMAIL *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="bg-neutral-800/50 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 py-6"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-white/80 font-light tracking-wider">
                      PHONE NUMBER *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="bg-neutral-800/50 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 py-6"
                      required
                    />
                  </div>

                  {/* Studio Selection */}
                  <div className="space-y-3">
                    <Label className="text-white/80 font-light tracking-wider">STUDIO SELECTION *</Label>
                    <Select value={formData.studio} onValueChange={(value) => handleInputChange("studio", value)}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white py-6">
                        <SelectValue placeholder="Choose a studio" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-800/95 border-white/20 backdrop-blur-sm">
                        {studios.map((studio) => (
                          <SelectItem key={studio.value} value={studio.value} className="text-white">
                            {studio.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date and Time */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="date" className="text-white/80 font-light tracking-wider">
                        PREFERRED DATE *
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange("date", e.target.value)}
                        className="bg-neutral-800/50 border-white/20 text-white py-6"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-white/80 font-light tracking-wider">PREFERRED TIME *</Label>
                      <Select value={formData.time} onValueChange={(value) => handleInputChange("time", value)}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white py-6">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-800/95 border-white/20 backdrop-blur-sm">
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time} className="text-white">
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Duration and Engineer */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-white/80 font-light tracking-wider">SESSION DURATION *</Label>
                      <Select value={formData.duration} onValueChange={(value) => handleInputChange("duration", value)}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white py-6">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-800/95 border-white/20 backdrop-blur-sm">
                          <SelectItem value="2" className="text-white">
                            2 Hours (Minimum)
                          </SelectItem>
                          <SelectItem value="3" className="text-white">
                            3 Hours
                          </SelectItem>
                          <SelectItem value="4" className="text-white">
                            4 Hours
                          </SelectItem>
                          <SelectItem value="6" className="text-white">
                            6 Hours
                          </SelectItem>
                          <SelectItem value="8" className="text-white">
                            8 Hours
                          </SelectItem>
                          <SelectItem value="custom" className="text-white">
                            Custom Duration
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-white/80 font-light tracking-wider">ENGINEER REQUIRED? *</Label>
                      <Select value={formData.engineer} onValueChange={(value) => handleInputChange("engineer", value)}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white py-6">
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-800/95 border-white/20 backdrop-blur-sm">
                          <SelectItem value="yes" className="text-white">
                            Yes, with Engineer
                          </SelectItem>
                          <SelectItem value="no" className="text-white">
                            No, without Engineer
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Project Type */}
                  <div className="space-y-3">
                    <Label className="text-white/80 font-light tracking-wider">PROJECT TYPE</Label>
                    <Select
                      value={formData.projectType}
                      onValueChange={(value) => handleInputChange("projectType", value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white py-6">
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-800/95 border-white/20 backdrop-blur-sm">
                        <SelectItem value="recording" className="text-white">
                          Recording Session
                        </SelectItem>
                        <SelectItem value="mixing" className="text-white">
                          Mixing
                        </SelectItem>
                        <SelectItem value="mastering" className="text-white">
                          Mastering
                        </SelectItem>
                        <SelectItem value="overdubs" className="text-white">
                          Overdubs
                        </SelectItem>
                        <SelectItem value="vocals" className="text-white">
                          Vocal Recording
                        </SelectItem>
                        <SelectItem value="podcast" className="text-white">
                          Podcast Recording
                        </SelectItem>
                        <SelectItem value="other" className="text-white">
                          Other
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Additional Message */}
                  <div className="space-y-3">
                    <Label htmlFor="message" className="text-white/80 font-light tracking-wider">
                      ADDITIONAL INFORMATION
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Tell us about your project, special requirements, or any questions..."
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 min-h-[120px] focus:border-white/40"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-white text-black hover:bg-gray-100 hover:scale-105 py-6 text-lg font-light tracking-widest transition-all duration-300 shadow-lg"
                  >
                    SUBMIT BOOKING REQUEST
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-8"
          >
            {/* Contact Info */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white font-light tracking-wider">DIRECT CONTACT</CardTitle>
                <p className="text-white/60 font-light">Prefer to book by phone or text?</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  asChild
                  className="w-full bg-white text-black hover:bg-gray-100 hover:scale-105 py-6 font-light tracking-wider shadow-lg"
                >
                  <Link href="tel:203-826-8911">
                    <Phone className="w-5 h-5 mr-3" />
                    CALL 203-826-8911
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-white/30 text-white bg-neutral-800/30 hover:bg-white/10 hover:border-white/50 py-6 font-light tracking-wider transition-all duration-300 backdrop-blur-sm"
                >
                  <Link href="sms:475-229-9564">
                    <MessageSquare className="w-5 h-5 mr-3" />
                    TEXT 475-229-9564
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Booking Requirements */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-white font-light tracking-wider">
                  <CheckCircle className="w-6 h-6 text-white/60" />
                  <span>BOOKING REQUIREMENTS</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-white/70 text-sm font-light">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-white/60 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong className="text-white">2 HOUR MINIMUM:</strong> All sessions require minimum 2-hour booking
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-white/60 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong className="text-white">APPOINTMENTS ONLY:</strong> No walk-ins accepted
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-white/60 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong className="text-white">50% DEPOSIT:</strong> Required to secure booking (non-refundable)
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Studio Quick Reference */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white font-light tracking-wider">STUDIO QUICK REFERENCE</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <div className="font-light text-white tracking-wider">TERMINAL A</div>
                  <div className="text-white/60">10 people • $80/$40 per hour</div>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <div className="font-light text-white tracking-wider">TERMINAL B</div>
                  <div className="text-white/60">5 people • $60/$30 per hour</div>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <div className="font-light text-white tracking-wider">TERMINAL C</div>
                  <div className="text-white/60">3 people • $50/$25 per hour</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
