"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, Volume2, Monitor, Laptop, Plane } from "lucide-react"
import { motion } from "framer-motion"
import { Navigation } from "@/components/navigation"
import Image from "next/image"

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

  const galleryImages = [
    "/images/studio-1.avif",
    "/images/studio-2.avif",
    "/images/studio-3.avif",
    "/images/studio-4.avif",
  ]

  return (
    <div className="min-h-screen bg-black">
      <Navigation />

      {/* Flying Plane Transition */}
      <motion.div
        initial={{ x: -200, y: -50, rotate: -20, opacity: 0 }}
        animate={{ x: [-200, 300, 800, 1200], y: [-50, -20, 20, 0], rotate: 15, opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2.5, ease: "easeInOut" }}
        className="fixed top-24 left-0 z-50 pointer-events-none"
      >
        <Plane className="w-14 h-14 text-orange-500 drop-shadow-lg" />
      </motion.div>

      {/* Hero Section */}
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
              className="border-white/30 text-white/80 bg-white/10 backdrop-blur-sm px-6 py-2 text-sm tracking-widest"
            >
              PROFESSIONAL EQUIPMENT
            </Badge>

            <h1 className="text-4xl md:text-5xl font-light text-white tracking-wider">GALLERY</h1>

            <p className="text-lg text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
              Explore our studio spaces below, followed by a comprehensive list of the professional equipment available
              in each terminal.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Photo Gallery Section */}
      <section className="relative py-20 px-8">
        <div className="container mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {galleryImages.map((src) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="overflow-hidden rounded-lg group"
              >
                <Image
                  src={src}
                  alt="Studio gallery image"
                  width={600}
                  height={400}
                  className="object-cover w-full h-64 group-hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipment Grid */}
      <section className="relative py-20 px-8">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
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
                    <div className="flex justify-center mb-8">
                      <div className="text-neutral-400 group-hover:text-orange-400 group-hover:scale-110 transition-all duration-300 border-2 border-neutral-400 group-hover:border-orange-400 rounded-lg p-6">
                        {category.icon}
                      </div>
                    </div>

                    <h3 className="text-3xl font-light text-white mb-2 tracking-[0.3em]">{category.title}</h3>

                    <div className="w-32 h-0.5 bg-orange-400 mx-auto mb-12"></div>

                    <div className="space-y-3 text-left max-w-md mx-auto">
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
                          <span className="text-white font-light tracking-wider text-sm group-hover/item:text-orange-400 transition-colors duration-300 uppercase">
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

      {/* Equipment Information */}
      <section className="relative py-32 px-8 bg-gradient-to-b from-transparent via-orange-500/5 to-transparent">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto space-y-16"
          >
            <div className="space-y-8">
              <h3 className="text-4xl md:text-5xl font-light text-white tracking-wider">PROFESSIONAL QUALITY</h3>
              <p className="text-lg text-white/70 font-light leading-relaxed max-w-3xl mx-auto">
                All equipment is regularly maintained and calibrated to ensure optimal performance. Our signal chain is
                designed to capture recordings with clarity and precision.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
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
                  className="p-8 bg-orange-500/5 border border-orange-500/20 rounded-lg backdrop-blur-sm hover:bg-orange-500/10 transition-all duration-300"
                >
                  <h4 className="text-xl font-light text-white mb-4 tracking-wider">{item.title}</h4>
                  <p className="text-white/60 font-light leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
} 