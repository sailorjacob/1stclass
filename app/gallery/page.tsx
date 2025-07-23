"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, Volume2, Monitor, Laptop } from "lucide-react"
import { motion } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { ImageSlider } from "@/components/ImageSlider"
import React from "react"

export default function GalleryPage() {
  const equipmentCategories = [
    {
      title: "MICROPHONES",
      icon: <Mic className="w-12 h-12" />,
      items: [
        "AKG C414XLII",
        "TELEFUNKEN TF39",
        "STERLING AUDIO ST6050",
        "SHURE SM7B",
        "SHURE SM57",
        "SHURE SM58",
      ],
    },
    {
      title: "OUTBOARD GEAR",
      icon: <Volume2 className="w-12 h-12" />,
      items: [
        "NEVE 1073 PREAMP",
        "HERITAGE AUDIO BRITSTRIP",
        "API 512C PREAMP",
        "UNIVERSAL AUDIO APOLLO X8P",
        "UNIVERSAL AUDIO APOLLO TWIN",
        "ANTELOPE AUDIO ZEN STUDIO",
        "ANTELOPE AUDIO SATORI",
        "WARM AUDIO WA-1B",
        "NEVE 535 BRIDGE COMPRESSOR",
      ],
    },
    {
      title: "MONITORING",
      icon: <Monitor className="w-12 h-12" />,
      items: [
        "EMOTIVA STEALTH 8S",
        "DYNAUDIO BM6A",
        "KRK ROKIT 10-3 G4",
        "KRK ROKIT 8S",
        "JBL 308P MKII 8S",
        "JBL 306P MKII 6.6S",
        "YAMAHA HS 5S",
        "GENELECS 8010AS",
      ],
    },
    {
      title: "SOFTWARE",
      icon: <Laptop className="w-12 h-12" />,
      items: [
        "PRO TOOLS",
        "WAVES",
        "FABFILTER BUNDLE",
        "ANTARES AUTOTUNE",
        "CELEMONY MELODYNE 5",
        "T-RACKS",
        "SOUNDTOYS BUNDLE",
        "IZOTOPE",
        "PLUGIN ALLIANCE BUNDLE",
        "UNIVERSAL AUDIO",
        "AND MORE... (ASK FOR DETAILS)",
      ],
    },
  ]

  const terminalAImages = [
    "https://twejikjgxkzmphocbvpt.supabase.co/storage/v1/object/public/1stclass/TERMINAL%20A%20WEBSITE%20PICS/_DFP2684.JPG",
    "https://twejikjgxkzmphocbvpt.supabase.co/storage/v1/object/public/1stclass/TERMINAL%20A%20WEBSITE%20PICS/_DFP2687.JPG",
    "https://twejikjgxkzmphocbvpt.supabase.co/storage/v1/object/public/1stclass/TERMINAL%20A%20WEBSITE%20PICS/_DFP2708.JPG",
  ]

  const terminalBImages = [
    "https://twejikjgxkzmphocbvpt.supabase.co/storage/v1/object/public/1stclass/TERMINAL%20B%20WEBSITE%20PICS/_DFP2789.JPG",
    "https://twejikjgxkzmphocbvpt.supabase.co/storage/v1/object/public/1stclass/TERMINAL%20B%20WEBSITE%20PICS/_DFP2768.JPG",
    "https://twejikjgxkzmphocbvpt.supabase.co/storage/v1/object/public/1stclass/TERMINAL%20B%20WEBSITE%20PICS/_DFP2753.JPG",
    "https://twejikjgxkzmphocbvpt.supabase.co/storage/v1/object/public/1stclass/TERMINAL%20B%20WEBSITE%20PICS/_DFP2759.JPG",
    "https://twejikjgxkzmphocbvpt.supabase.co/storage/v1/object/public/1stclass/TERMINAL%20B%20WEBSITE%20PICS/_DFP2783.JPG",
    "https://twejikjgxkzmphocbvpt.supabase.co/storage/v1/object/public/1stclass/TERMINAL%20B%20WEBSITE%20PICS/_DFP2771.JPG",
  ]

  const terminalCImages = [
    "https://twejikjgxkzmphocbvpt.supabase.co/storage/v1/object/public/1stclass/TERMINAL%20C%20WEBSITE%20PICS/_DFP2819.JPG",
    "https://twejikjgxkzmphocbvpt.supabase.co/storage/v1/object/public/1stclass/TERMINAL%20C%20WEBSITE%20PICS/_DFP2906.JPG",
    "https://twejikjgxkzmphocbvpt.supabase.co/storage/v1/object/public/1stclass/TERMINAL%20C%20WEBSITE%20PICS/_DFP2921.JPG",
  ]

  const loungeEventSpaceImages = [
    "https://twejikjgxkzmphocbvpt.supabase.co/storage/v1/object/public/1stclass/LOUNGE:EVENTSPACE%20WEBSITE%20PICS/_DFP2840.JPG",
    "https://twejikjgxkzmphocbvpt.supabase.co/storage/v1/object/public/1stclass/LOUNGE:EVENTSPACE%20WEBSITE%20PICS/_DFP2846.JPG",
  ]

  // Combine all images into one gallery
  const allGalleryImages = [
    ...terminalAImages,
    ...terminalBImages, 
    ...terminalCImages,
    ...loungeEventSpaceImages,
    "/images/studio-4.avif" // Add the original studio-4 image
  ].filter(Boolean) // Remove any undefined/null values

  return (
    <div className="min-h-screen bg-neutral-900">
      <Navigation />

      {/* Removed hero section for a cleaner gallery */}

      {/* Photo Gallery Section */}
      <section className="relative pt-28 pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
            className="rounded-lg group aspect-[21/9] relative overflow-visible"
          >
            <ImageSlider
              images={allGalleryImages}
              previewSides
              transitionDurationMs={2000}
              outerArrows
              draggable
            />
              </motion.div>
        </div>
      </section>

      {/* Equipment Grid */}
      <section className="relative py-10 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 justify-items-center">
            {equipmentCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className="bg-transparent border-none">
                  <CardContent className="p-0 text-center">
                    <div className="flex justify-center mb-6">
                      <div className="text-neutral-400 group-hover:text-orange-400 group-hover:scale-105 transition-all duration-300 border border-neutral-400 group-hover:border-orange-400 rounded-lg p-4">
                        {React.cloneElement(category.icon as any, { className: "w-8 h-8" })}
                      </div>
                    </div>

                    <h3 className="text-2xl font-light text-white mb-1 tracking-[0.25em]">{category.title}</h3>

                    <div className="w-24 h-0.5 bg-orange-400 mx-auto mb-6"></div>

                    <div className="space-y-2 text-left max-w-md mx-auto">
                      {category.items.map((item, itemIndex) => (
                        <motion.div
                          key={item}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.2 + itemIndex * 0.05 }}
                          viewport={{ once: true }}
                          className="flex items-center space-x-3 group/item"
                        >
                          <div className="w-1 h-1 rounded-full bg-orange-400 flex-shrink-0" />
                          <span className="text-white font-light tracking-wider text-xs group-hover/item:text-orange-400 transition-colors duration-300 uppercase">
                            {item}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlight Cards */}
      <section className="relative py-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "PREMIUM PREAMPS",
                description: "Neve, API, and Heritage Audio preamps for professional sound",
              },
              {
                title: "MULTIPLE MONITORING",
                description: "Various monitor speakers to suit different mixing preferences",
              },
              {
                title: "COMPLETE PLUGIN SUITE",
                description: "Industry-standard plugins for mixing and mastering",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative p-8 bg-neutral-800/40 border border-white/15 rounded-lg backdrop-blur-sm hover:bg-neutral-800/50 transition-all duration-300 overflow-hidden group"
              >
                {/* Audio Wave Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="flex space-x-1">
                    {Array.from({ length: 40 }).map((_, barIndex) => (
                      <motion.div
                        key={barIndex}
                        className="w-0.5 bg-white/40 rounded-full"
                        animate={{
                          height: ["8px", "32px", "8px"],
                          opacity: [0.3, 0.8, 0.3],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: barIndex * 0.05,
                        }}
                      />
                    ))}
                  </div>
                </div>

                <h4 className="relative text-xl font-light text-white mb-4 tracking-wider">{item.title}</h4>
                <p className="relative text-white/60 font-light leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
} 