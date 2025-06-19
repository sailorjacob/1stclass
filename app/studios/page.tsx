"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Mic, Clock, ArrowRight, Calendar } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Navigation } from "@/components/navigation"
import Image from "next/image"

export default function StudiosPage() {
  const studios = [
    {
      name: "TERMINAL A",
      capacity: "10 PERSON CAPACITY",
      withEngineer: "$80/HR",
      withoutEngineer: "$40/HR",
      image: "/images/studio-1.avif",
      description: "Our flagship studio with premium acoustics and full production capabilities",
    },
    {
      name: "TERMINAL B",
      capacity: "5 PERSON CAPACITY",
      withEngineer: "$60/HR",
      withoutEngineer: "$30/HR",
      image: "/images/studio-2.avif",
      description: "Perfect for small bands and solo artists with professional monitoring",
    },
    {
      name: "TERMINAL C",
      capacity: "3 PERSON CAPACITY",
      withEngineer: "$50/HR",
      withoutEngineer: "$25/HR",
      image: "/images/studio-3.avif",
      description: "Intimate setting ideal for vocals, overdubs, and small productions",
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
              THREE RECORDING TERMINALS
            </Badge>

            <h1 className="text-4xl md:text-5xl font-light text-white tracking-wider">STUDIOS</h1>

            <p className="text-lg text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
              Three distinct recording environments designed for different project needs, from intimate vocal sessions
              to full band productions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Studios Grid */}
      <section className="relative py-20 px-8">
        <div className="container mx-auto">
          <div className="space-y-24">
            {studios.map((studio, index) => (
              <motion.div
                key={studio.name}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`grid lg:grid-cols-2 gap-16 items-center ${index % 2 === 1 ? "lg:grid-flow-col-dense" : ""}`}
              >
                <div className={index % 2 === 1 ? "lg:col-start-2" : ""}>
                  <Card className="bg-neutral-800/50 border-white/10 overflow-hidden backdrop-blur-sm group hover:scale-105 transition-all duration-500">
                    <CardContent className="p-0">
                      <div className="aspect-[4/3] relative overflow-hidden">
                        <Image
                          src={studio.image || "/placeholder.svg"}
                          alt={studio.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-transparent to-transparent" />

                        <div className="absolute bottom-6 left-6">
                          <Badge className="bg-neutral-900/50 text-white border-white/20 backdrop-blur-sm font-light tracking-wider">
                            PROFESSIONAL SETUP
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className={index % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""}>
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-5xl md:text-6xl font-extralight text-white mb-4 tracking-wider">
                        {studio.name}
                      </h2>
                      <p className="text-xl text-white/70 font-light leading-relaxed">{studio.description}</p>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center space-x-4">
                        <Users className="w-6 h-6 text-white/80" />
                        <span className="text-white/80 font-light tracking-wider">{studio.capacity}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Mic className="w-6 h-6 text-white/80" />
                        <span className="text-white/80 font-light tracking-wider">PROFESSIONAL EQUIPMENT INCLUDED</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Clock className="w-6 h-6 text-white/80" />
                        <span className="text-white/80 font-light tracking-wider">2 HOUR MINIMUM BOOKING</span>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-8 backdrop-blur-sm">
                      <h3 className="text-2xl font-light text-white mb-6 tracking-wider">PRICING</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-white/70 font-light">With Engineer</span>
                          <span className="text-white font-light text-xl">{studio.withEngineer}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/70 font-light">Without Engineer</span>
                          <span className="text-white font-light text-xl">{studio.withoutEngineer}</span>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Book Button */}
                    <div className="relative group/button">
                      <Button
                        asChild
                        className="relative w-full bg-gradient-to-r from-neutral-800 to-neutral-700 text-white hover:from-neutral-700 hover:to-neutral-600 border-0 py-4 px-8 text-base font-medium tracking-[0.15em] transition-all duration-500 shadow-lg hover:shadow-xl overflow-hidden group"
                      >
                        <Link href="/booking" className="flex items-center justify-center space-x-3">
                          {/* Background animation - now slides from left to right */}
                          <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-100 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />

                          {/* Content */}
                          <div className="relative flex items-center space-x-3 group-hover:text-black transition-colors duration-500">
                            <Calendar className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                            <span className="font-light">BOOK {studio.name}</span>
                            <ArrowRight className="w-5 h-5 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                          </div>
                        </Link>
                      </Button>

                      {/* Glow effect */}
                      <div className="absolute inset-0 rounded-md bg-gradient-to-r from-white/20 to-gray-100/20 blur-lg opacity-0 group-hover/button:opacity-100 transition-opacity duration-500 -z-10" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple Requirements Section */}
      <section className="relative py-20 px-8">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <h3 className="text-3xl font-light text-white tracking-wider">BOOKING REQUIREMENTS</h3>
            <div className="space-y-3 text-white/70 font-light">
              <p>• Sessions are by appointments only - No walk-ins accepted</p>
              <p>• 2 hour minimum booking required for all sessions</p>
              <p>• 50% deposit required to book - All deposits are non-refundable</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
