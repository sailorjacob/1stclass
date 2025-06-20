"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, Headphones, Users, Star, Phone, MessageSquare, Play, Volume2, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { useState, useEffect, useMemo } from "react"

export default function HomePage() {
  const [logoHovered, setLogoHovered] = useState(false)
  const [logoClicked, setLogoClicked] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Track if user is near bottom to reveal audio wave
  const [showWave, setShowWave] = useState(false)

  // Track mouse position for parallax effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement
      setShowWave(scrollTop + clientHeight >= scrollHeight - 120)
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const galleryImages = [
    {
      src: "/images/studio-1.avif",
      title: "TERMINAL A",
      subtitle: "FLAGSHIP STUDIO",
      description: "Premium acoustics and full production capabilities",
    },
    {
      src: "/images/studio-3.avif",
      title: "TERMINAL B",
      subtitle: "CREATIVE SPACE",
      description: "Perfect for small bands and solo artists",
    },
    {
      src: "https://kglfdycu0s7oxsz8.public.blob.vercel-storage.com/studios/b3a17f_1aafe4dcf25f414e82392ae2a3134990~mv2-FBy7QcAIflKUsePBbJ8LAeVBbSTVEe.avif",
      title: "TERMINAL C",
      subtitle: "INTIMATE SETTING",
      description: "Ideal for vocals and overdub sessions",
    },
  ]

  const features = [
    {
      icon: <Mic className="w-8 h-8" />,
      title: "PREMIUM EQUIPMENT",
      description: "Industry-standard microphones, preamps, and monitoring systems",
      metric: "50+",
      unit: "PREMIUM MICS",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "EXPERT ENGINEERS",
      description: "Experienced audio professionals dedicated to your vision",
      metric: "15+",
      unit: "YEARS EXPERIENCE",
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: "THREE TERMINALS",
      description: "Uniquely designed environments for various recording needs",
      metric: "3",
      unit: "STUDIO SPACES",
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "INDUSTRY STANDARD",
      description: "Professional sound quality that exceeds expectations",
      metric: "100%",
      unit: "SATISFACTION",
    },
  ]

  return (
    <div className="min-h-screen bg-neutral-900 overflow-hidden">
      {/* Navigation */}
      <Navigation logoClicked={logoClicked} setLogoClicked={setLogoClicked} />

      {/* Enhanced Artistic Background Elements with Parallax */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-white/3 to-transparent rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * 20,
            y: mousePosition.y * 20,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-white/2 to-transparent rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * -30,
            y: mousePosition.y * -30,
          }}
          transition={{ type: "spring", stiffness: 30, damping: 20 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-gradient-conic from-white/1 via-transparent to-white/1 rounded-full blur-3xl"
          animate={{
            rotate: mousePosition.x * 10,
            x: mousePosition.x * 15,
            y: mousePosition.y * 15,
          }}
          transition={{ type: "spring", stiffness: 20, damping: 20 }}
        />

        {/* Floating Particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Hero Gallery Section */}
      <section className="relative min-h-screen pt-32">
        <div className="container mx-auto px-8">
          {/* Hero Text */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-center mb-16"
          >
            {/* Enhanced Logo with Advanced Orbital System */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="flex justify-center mb-8 relative pointer-events-none"
              onClick={() => setLogoClicked(!logoClicked)}
            >
              <div
                className="relative w-48 h-48 md:w-64 md:h-64 cursor-pointer pointer-events-auto"
                onMouseEnter={() => setLogoHovered(true)}
                onMouseLeave={() => setLogoHovered(false)}
              >
                {/* Enhanced Orbital Circle Lines */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Primary Orbit Ring */}
                  <motion.div
                    className="absolute inset-0 border border-white/10 rounded-full"
                    style={{ transform: "scale(1.3)" }}
                    animate={{
                      rotate: logoHovered ? 360 : 0,
                      scale: logoHovered ? 1.4 : 1.3,
                      opacity: logoHovered ? 0.4 : 0.1,
                      borderColor: logoHovered ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
                    }}
                    transition={{
                      duration: 6,
                      repeat: logoHovered ? Number.POSITIVE_INFINITY : 0,
                      ease: "linear",
                      borderColor: { duration: 0.3 },
                    }}
                  />

                  {/* Secondary Orbit Ring */}
                  <motion.div
                    className="absolute inset-0 border border-white/15 rounded-full"
                    style={{ transform: "scale(1.6)" }}
                    animate={{
                      rotate: logoHovered ? -360 : 0,
                      scale: logoHovered ? 1.7 : 1.6,
                      opacity: logoHovered ? 0.5 : 0.1,
                      borderColor: logoHovered ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)",
                    }}
                    transition={{
                      duration: 10,
                      repeat: logoHovered ? Number.POSITIVE_INFINITY : 0,
                      ease: "linear",
                      borderColor: { duration: 0.3 },
                    }}
                  />

                  {/* Tertiary Orbit Ring */}
                  <motion.div
                    className="absolute inset-0 border border-white/20 rounded-full"
                    style={{ transform: "scale(1.9)" }}
                    animate={{
                      rotate: logoHovered ? 360 : 0,
                      scale: logoHovered ? 2.0 : 1.9,
                      opacity: logoHovered ? 0.6 : 0.1,
                      borderColor: logoHovered ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)",
                    }}
                    transition={{
                      duration: 12,
                      repeat: logoHovered ? Number.POSITIVE_INFINITY : 0,
                      ease: "linear",
                      borderColor: { duration: 0.3 },
                    }}
                  />

                  {/* Enhanced Orbital Elements with Trails */}
                  {[...Array(8)].map((_, i) => (
                    <div key={i}>
                      {/* Orbital Dot */}
                      <motion.div
                        className="absolute w-2 h-2 bg-white/50 rounded-full shadow-lg"
                        style={{
                          top: "50%",
                          left: "50%",
                          transformOrigin: `${70 + i * 15}px 0px`,
                        }}
                        animate={{
                          rotate: logoHovered ? 360 : 0,
                          scale: logoHovered ? 1.3 : 0.8,
                          opacity: logoHovered ? 0.9 : 0.2,
                          boxShadow: logoHovered ? "0 0 10px rgba(255,255,255,0.5)" : "0 0 0px rgba(255,255,255,0)",
                        }}
                        transition={{
                          duration: 5 + i * 1.5,
                          repeat: logoHovered ? Number.POSITIVE_INFINITY : 0,
                          ease: "linear",
                          delay: i * 0.3,
                          boxShadow: { duration: 0.3 },
                        }}
                      />
                    </div>
                  ))}

                  {/* Enhanced Pulsing Rings */}
                  {logoHovered && (
                    <>
                      <motion.div
                        className="absolute inset-0 border-2 border-white/40 rounded-full"
                        initial={{ scale: 1, opacity: 0.8 }}
                        animate={{ scale: 2.8, opacity: 0 }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
                      />
                      <motion.div
                        className="absolute inset-0 border border-white/30 rounded-full"
                        initial={{ scale: 1, opacity: 0.6 }}
                        animate={{ scale: 3.2, opacity: 0 }}
                        transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, ease: "easeOut", delay: 0.5 }}
                      />
                      <motion.div
                        className="absolute inset-0 border border-white/20 rounded-full"
                        initial={{ scale: 1, opacity: 0.4 }}
                        animate={{ scale: 3.6, opacity: 0 }}
                        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeOut", delay: 1 }}
                      />
                    </>
                  )}

                  {/* Sparkle Effects */}
                  {logoHovered &&
                    [...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute"
                        style={{
                          top: `${20 + Math.random() * 60}%`,
                          left: `${20 + Math.random() * 60}%`,
                        }}
                        initial={{ scale: 0, rotate: 0 }}
                        animate={{
                          scale: [0, 1, 0],
                          rotate: 360,
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: i * 0.3,
                          ease: "easeInOut",
                        }}
                      >
                        <Sparkles className="w-3 h-3 text-white/60" />
                      </motion.div>
                    ))}
                </div>

                {/* Enhanced Logo Image */}
                <motion.div
                  animate={{
                    scale: logoHovered ? 1.1 : 1,
                    rotate: logoHovered ? 5 : 0,
                    filter: logoHovered
                      ? "brightness(1.2) drop-shadow(0 0 20px rgba(255,255,255,0.3))"
                      : "brightness(1) drop-shadow(0 0 0px rgba(255,255,255,0))",
                  }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full z-10"
                >
                  <Image
                    src="https://twejikjgxkzmphocbvpt.supabase.co/storage/v1/object/public/havensvgs//1stclass.png"
                    alt="1ST CLASS STUDIOS"
                    fill
                    className="object-contain transition-all duration-300"
                  />
                </motion.div>

                {/* Click Indicator */}
                {logoHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-white/60 text-xs tracking-wider"
                  >
                    CLICK TO NAVIGATE
                  </motion.div>
                )}
              </div>
            </motion.div>

            <motion.div
              animate={{
                opacity: logoHovered ? 0.8 : 0.6,
                scale: logoHovered ? 1.05 : 1,
              }}
              transition={{ duration: 0.3 }}
              className="text-3xl md:text-4xl font-thin tracking-[0.3em] text-white/60 mb-8"
            >
              STUDIOS
            </motion.div>

            <Badge
              variant="outline"
              className="border-white/20 text-white/60 bg-neutral-800/50 backdrop-blur-sm px-6 py-2 text-xs tracking-[0.2em] mb-8"
            >
              PROFESSIONAL RECORDING STUDIO • STAMFORD, CT
            </Badge>

            <p className="text-lg md:text-xl font-light text-neutral-400 max-w-3xl mx-auto leading-relaxed mb-12 tracking-widest">
              ~ 45 MINS FROM NYC ~
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  asChild
                  className="bg-white text-black hover:bg-gray-100 px-10 py-4 text-sm font-light tracking-[0.2em] transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Link href="/booking">BOOK SESSION</Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/30 text-white bg-neutral-800/30 hover:bg-white/10 hover:border-white/50 px-10 py-4 text-sm font-light tracking-[0.2em] transition-all duration-300 backdrop-blur-sm"
                >
                  <Link href="/studios">
                    <Play className="w-4 h-4 mr-2" />
                    VIEW STUDIOS
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Enhanced Gallery Grid */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          >
            {galleryImages.map((image, index) => (
              <motion.div
                key={image.title}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group cursor-pointer"
              >
                <Link href={`/studios#${image.title.toLowerCase().replace(/\s+/g, "-")}`}
                      className="block">
                  <Card className="bg-neutral-800/50 border-white/10 overflow-hidden hover:border-white/30 transition-all duration-500 backdrop-blur-sm hover:shadow-2xl hover:shadow-white/10">
                    <CardContent className="p-0">
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <Image
                          src={image.src || "/placeholder.svg"}
                          alt={image.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/20 to-transparent" />

                        {/* Enhanced Audio Visualization Overlay */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="flex space-x-1 bg-neutral-900/50 rounded-lg p-2 backdrop-blur-sm">
                            {[...Array(8)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="w-1 bg-white/60 rounded-full"
                                style={{ height: `${Math.random() * 20 + 10}px` }}
                                animate={{
                                  height: [
                                    `${Math.random() * 20 + 10}px`,
                                    `${Math.random() * 30 + 15}px`,
                                    `${Math.random() * 20 + 10}px`,
                                  ],
                                  opacity: [0.6, 1, 0.6],
                                }}
                                transition={{
                                  duration: 1.5 + Math.random(),
                                  repeat: Number.POSITIVE_INFINITY,
                                  delay: i * 0.1,
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Hover Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <Badge className="bg-neutral-900/60 text-white/80 border-white/20 backdrop-blur-sm mb-3 text-xs tracking-wider">
                            {image.subtitle}
                          </Badge>
                          <h3 className="text-2xl font-light text-white mb-2 tracking-wider group-hover:text-white/90 transition-colors duration-300">
                            {image.title}
                          </h3>
                          <p className="text-white/60 text-sm font-light leading-relaxed group-hover:text-white/70 transition-colors duration-300">
                            {image.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-12 px-8 bg-gradient-to-b from-transparent via-white/2 to-transparent">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            {/* Header removed for tighter layout */}
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="bg-neutral-800/30 border-white/10 hover:bg-neutral-800/50 hover:border-white/20 transition-all duration-500 backdrop-blur-sm h-full hover:shadow-xl hover:shadow-white/5">
                  <CardContent className="p-8 text-center space-y-6">
                    <motion.div
                      className="text-white/60 flex justify-center group-hover:scale-110 transition-transform duration-300"
                      whileHover={{ rotate: 5 }}
                    >
                      {feature.icon}
                    </motion.div>

                    <div className="space-y-2">
                      <motion.div
                        className="text-4xl font-extralight text-white tracking-wider"
                        whileInView={{ scale: [0.8, 1.1, 1] }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        viewport={{ once: true }}
                      >
                        {feature.metric}
                      </motion.div>
                      <div className="text-xs text-white/40 tracking-[0.2em]">{feature.unit}</div>
                    </div>

                    <h3 className="text-lg font-light text-white leading-tight tracking-wider group-hover:text-white/90 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-white/50 font-light leading-relaxed text-sm group-hover:text-white/60 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Studio Information Section */}
      <section className="relative py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <Badge className="bg-neutral-800/50 text-white/60 border-white/20 backdrop-blur-sm px-6 py-2 text-xs tracking-[0.3em]">
                  PROFESSIONAL RECORDING
                </Badge>
                <h2 className="text-5xl md:text-6xl font-extralight text-white tracking-[-0.02em] leading-tight">
                  THREE RECORDING
                  <br />
                  <span className="text-white/40">TERMINALS</span>
                </h2>
                <p className="text-xl text-white/60 font-light leading-relaxed">
                  Our facilities feature three distinct recording environments, each designed for different project
                  needs. From intimate vocal sessions to full band productions, we provide the professional environment
                  and equipment necessary for quality recordings.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    asChild
                    className="bg-white text-black hover:bg-gray-100 px-8 py-3 text-sm font-light tracking-[0.2em] transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Link href="/studios">VIEW TERMINALS</Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    asChild
                    variant="outline"
                    className="border-white/30 text-white bg-neutral-800/30 hover:bg-white/10 hover:border-white/50 px-8 py-3 text-sm font-light tracking-[0.2em] transition-all duration-300 backdrop-blur-sm"
                  >
                    <Link href="/equipment">
                      <Volume2 className="w-4 h-4 mr-2" />
                      EQUIPMENT LIST
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <Card className="bg-gradient-to-br from-white/5 to-neutral-800/50 border-white/10 overflow-hidden backdrop-blur-sm hover:shadow-2xl hover:shadow-white/10 transition-all duration-500">
                <CardContent className="p-0">
                  <div className="aspect-[4/3] relative">
                    <Image src="/images/studio-2.avif" alt="Studio Interior" fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 via-transparent to-transparent" />

                    {/* Enhanced Floating Audio Elements */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="grid grid-cols-12 gap-1">
                        {[...Array(36)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-0.5 bg-white/30 rounded-full"
                            style={{ height: `${Math.random() * 40 + 20}px` }}
                            animate={{
                              height: [
                                `${Math.random() * 40 + 20}px`,
                                `${Math.random() * 60 + 30}px`,
                                `${Math.random() * 40 + 20}px`,
                              ],
                              opacity: [0.3, 0.8, 0.3],
                            }}
                            transition={{
                              duration: 2 + Math.random() * 2,
                              repeat: Number.POSITIVE_INFINITY,
                              delay: i * 0.03,
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="absolute bottom-6 left-6 right-6">
                      <Badge className="bg-neutral-800/60 text-white border-white/20 backdrop-blur-sm mb-3">
                        RECORDING SESSION
                      </Badge>
                      <p className="text-white/80 font-light">Professional recording environment</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Contact Section */}
      <section className="relative py-20 px-8">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="bg-neutral-800/30 border border-white/10 rounded-lg p-12 backdrop-blur-sm hover:bg-neutral-800/40 hover:border-white/20 transition-all duration-500">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-4xl font-light text-white tracking-wider">BOOK A SESSION</h2>
                  <p className="text-white/60 font-light leading-relaxed max-w-2xl mx-auto">
                    Sessions are by appointment only. Contact us to schedule your recording session.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      asChild
                      className="bg-white text-black hover:bg-gray-100 px-8 py-3 font-light tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <Link href="tel:203-826-8911">
                        <Phone className="w-4 h-4 mr-2" />
                        203-826-8911
                      </Link>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      asChild
                      variant="outline"
                      className="border-white/30 text-white bg-transparent hover:bg-white/5 hover:border-white/50 px-8 py-3 font-light tracking-wider transition-all duration-300"
                    >
                      <Link href="sms:475-229-9564">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        475-229-9564
                      </Link>
                    </Button>
                  </motion.div>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <div className="text-sm text-white/40 space-y-1">
                    <div>2 HOUR MINIMUM • 50% DEPOSIT REQUIRED • NO WALK-INS</div>
                    <div className="text-xs text-white/30">APPOINTMENTS ONLY</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Full-width Audio Wave */}
      <motion.section
        className="relative h-16 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: showWave ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 flex items-end justify-between pointer-events-none select-none">
          {Array.from({ length: 200 }).map((_, i) => {
            const min = Math.random() * 15 + 10 // 10% - 25%
            const max = min + Math.random() * 50 + 20 // up to ~95%
            return (
              <motion.div
                key={i}
                className="w-px bg-white/30 rounded-full"
                animate={{ height: [`${min}%`, `${max}%`, `${min}%`], opacity: [0.2, 0.9, 0.2] }}
                transition={{ duration: 2 + Math.random(), repeat: Infinity, delay: i * 0.02 }}
              />
            )
          })}
        </div>
      </motion.section>
    </div>
  )
}
