"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, Clock, ArrowRight, Calendar, Users } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { ImageSlider } from "@/components/ImageSlider"

export default function StudiosPage() {
  const studios = [
    {
      name: "TERMINAL A",
      capacity: "10 PERSON CAPACITY",
      withEngineer: "$80/HR",
      withoutEngineer: "$40/HR",
      images: [
        "/images/studio-1.avif",
        "https://kglfdycu0s7oxsz8.public.blob.vercel-storage.com/studios/cf7511_a84e4ebf1f4f4cd38b5b7bf0c3f5abd5~mv2%20(2)-C1XwjTdE6vnuySIfd9roqmt07c7Hva.avif",
        "https://kglfdycu0s7oxsz8.public.blob.vercel-storage.com/studios/cf7511_837d4acf0eb44559974ce22de1077578~mv2%20(1)-lMYchfkrInY3IW0WCJ9Wiw9Us5uORi.avif",
      ],
      description: "Our flagship studio with premium acoustics and full production capabilities",
    },
    {
      name: "TERMINAL B",
      capacity: "5 PERSON CAPACITY",
      withEngineer: "$60/HR",
      withoutEngineer: "$30/HR",
      images: [
        "/images/studio-3.avif",
        "/images/studio-2.avif",
        "https://kglfdycu0s7oxsz8.public.blob.vercel-storage.com/studios/TERMINALB-DoKqrOW8t2hmLEbZ5t5eXHBLLcORlb.avif",
        "https://kglfdycu0s7oxsz8.public.blob.vercel-storage.com/studios/cf7511_b728d8c510f4412eb418c5df251e5c2a~mv2-Bc9tI9WNhHUaZNUEMz72SdVmWWUeBH.avif",
        "https://kglfdycu0s7oxsz8.public.blob.vercel-storage.com/studios/b3a17f_fe7b75b926074efdb78a7816436d8fdd~mv2-OnfGcQlOHP264u08kzpFifpvElD4sM.avif",
        "https://kglfdycu0s7oxsz8.public.blob.vercel-storage.com/b3a17f_edabe64836b3455d830a8f85ffcd070b~mv2-AtnS0F6va0KHKvjB5qweitJ9ieeu3G.avif",
      ],
      description: "Perfect for small bands and solo artists with professional monitoring",
    },
    {
      name: "TERMINAL C",
      capacity: "3 PERSON CAPACITY",
      withEngineer: "$50/HR",
      withoutEngineer: "$25/HR",
      images: [
        "https://kglfdycu0s7oxsz8.public.blob.vercel-storage.com/studios/b3a17f_1aafe4dcf25f414e82392ae2a3134990~mv2-FBy7QcAIflKUsePBbJ8LAeVBbSTVEe.avif",
        "https://kglfdycu0s7oxsz8.public.blob.vercel-storage.com/b3a17f_3dbffcf3789644418b7d8aa8ab26d171~mv2-UQGH4qed93eOI7E71LhKtrzMCuTX79.avif",
        "https://kglfdycu0s7oxsz8.public.blob.vercel-storage.com/studios/b3a17f_baa8c423d38a4d16a94102bd8adade15~mv2-8YGIp8DPCA57R9bGUwVfZming3oBEP.avif",
        "https://kglfdycu0s7oxsz8.public.blob.vercel-storage.com/studios/b3a17f_5f69f571bddf41c391a7f05c795e0bc0~mv2-HvZeHwe9cmpgUVQXvTGkQ24xI2Hf6N.avif",
        "https://kglfdycu0s7oxsz8.public.blob.vercel-storage.com/studios/b3a17f_fc352d582ebd4c288f573dac0e642f62~mv2-WEIWN4rVU2euU8BnOYzzpy0OP0i5cF.avif",
      ],
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
                        <ImageSlider images={studio.images as string[]} />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-transparent to-transparent" />

                        <div className="absolute bottom-6 left-6">
                          <Badge className="bg-neutral-900/50 text-white border-white/20 backdrop-blur-sm font-light tracking-wider">
                            PREMIUM SETUP
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
                        <Mic className="w-6 h-6 text-white/80" />
                        <span className="text-white/80 font-light tracking-wider">EQUIPMENT INCLUDED</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Clock className="w-6 h-6 text-white/80" />
                        <span className="text-white/80 font-light tracking-wider">2 HOUR MINIMUM BOOKING</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Users className="w-6 h-6 text-white/80" />
                        <span className="text-white/80 font-light tracking-wider">{studio.capacity}</span>
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
