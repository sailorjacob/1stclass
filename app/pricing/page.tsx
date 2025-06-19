"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Phone, MessageSquare, CheckCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Navigation } from "@/components/navigation"
import Image from "next/image"

export default function PricingPage() {
  const studios = [
    {
      name: "TERMINAL A",
      capacity: "10 PERSON CAPACITY",
      withEngineer: 80,
      withoutEngineer: 40,
      image: "/images/terminal-a-pricing.avif",
      features: [
        "Premium acoustics",
        "Full production setup",
        "Large control room",
        "Isolation booth",
        "Professional monitoring",
      ],
    },
    {
      name: "TERMINAL B",
      capacity: "5 PERSON CAPACITY",
      withEngineer: 60,
      withoutEngineer: 30,
      image: "/images/terminal-b-pricing.avif",
      features: [
        "Perfect for small bands",
        "Professional equipment",
        "Comfortable environment",
        "Quality monitoring",
        "Flexible setup",
      ],
    },
    {
      name: "TERMINAL C",
      capacity: "3 PERSON CAPACITY",
      withEngineer: 50,
      withoutEngineer: 25,
      image: "/images/terminal-c-pricing.avif",
      features: ["Intimate setting", "Ideal for vocals", "Overdub sessions", "Solo recordings", "Cost effective"],
    },
  ]

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
            <Badge
              variant="outline"
              className="border-white/30 text-white/80 bg-white/5 backdrop-blur-sm px-6 py-2 text-sm tracking-widest"
            >
              TRANSPARENT PRICING
            </Badge>

            <h1 className="text-4xl md:text-5xl font-light text-white tracking-wider">PRICING</h1>

            <p className="text-lg text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
              Professional recording rates with flexible options. Choose the terminal that fits your needs and budget.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative py-20 px-8">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {studios.map((studio, index) => (
              <motion.div
                key={studio.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className="bg-neutral-800/50 border-white/10 hover:scale-105 transition-all duration-500 backdrop-blur-sm overflow-hidden">
                  {/* Image with overlay content */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={studio.image || "/placeholder.svg"}
                      alt={studio.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/50 to-transparent" />

                    {/* All content overlaid on image */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-between">
                      {/* Top badge */}
                      <div className="flex justify-between items-start">
                        <Badge className="bg-neutral-900/60 text-white/80 border-white/20 backdrop-blur-sm text-xs tracking-wider">
                          PROFESSIONAL STUDIO
                        </Badge>
                      </div>

                      {/* Bottom content */}
                      <div className="space-y-4">
                        {/* Studio info */}
                        <div>
                          <h3 className="text-3xl font-light text-white mb-2 tracking-wider">{studio.name}</h3>
                          <div className="flex items-center space-x-2 text-white/70 mb-4">
                            <Users className="w-4 h-4" />
                            <span className="tracking-wider font-light text-sm">{studio.capacity}</span>
                          </div>
                        </div>

                        {/* Pricing - horizontal layout */}
                        <div className="flex space-x-4 mb-4">
                          <div className="bg-neutral-900/70 backdrop-blur-sm rounded-lg p-3 flex-1 text-center">
                            <div className="text-xs text-white/60 mb-1">WITH ENGINEER</div>
                            <div className="text-xl font-light text-white">
                              ${studio.withEngineer}
                              <span className="text-sm">/HR</span>
                            </div>
                          </div>
                          <div className="bg-neutral-900/70 backdrop-blur-sm rounded-lg p-3 flex-1 text-center">
                            <div className="text-xs text-white/60 mb-1">WITHOUT</div>
                            <div className="text-xl font-light text-white">
                              ${studio.withoutEngineer}
                              <span className="text-sm">/HR</span>
                            </div>
                          </div>
                        </div>

                        {/* Features - compact */}
                        <div className="space-y-1 mb-4">
                          {studio.features.slice(0, 3).map((feature) => (
                            <div key={feature} className="flex items-center space-x-2">
                              <CheckCircle className="w-3 h-3 text-white/60 flex-shrink-0" />
                              <span className="text-white/80 text-xs font-light">{feature}</span>
                            </div>
                          ))}
                        </div>

                        {/* Book button */}
                        <Button
                          asChild
                          className="w-full bg-white text-black hover:bg-gray-100 py-3 text-sm font-light tracking-widest transition-all duration-300 shadow-lg"
                        >
                          <Link href="/booking">BOOK {studio.name}</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple Contact Section */}
      <section className="relative py-20 px-8">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="bg-neutral-800/30 border border-white/10 rounded-lg p-8 backdrop-blur-sm">
              <div className="space-y-6">
                <div className="space-y-3">
                  <h2 className="text-2xl font-light text-white tracking-wider">BOOK A SESSION</h2>
                  <p className="text-white/60 font-light">2 hour minimum • 50% deposit required • Appointments only</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    className="bg-white text-black hover:bg-gray-100 px-6 py-3 font-light tracking-wider transition-all duration-300"
                  >
                    <Link href="tel:203-826-8911">
                      <Phone className="w-4 h-4 mr-2" />
                      203-826-8911
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-white/30 text-white bg-transparent hover:bg-white/5 hover:border-white/50 px-6 py-3 font-light tracking-wider transition-all duration-300"
                  >
                    <Link href="sms:475-229-9564">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      475-229-9564
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
