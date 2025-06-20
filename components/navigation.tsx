"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Phone, MessageSquare, MapPin, Mail, Instagram, Youtube, Facebook } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { usePathname } from "next/navigation"

interface NavigationProps {
  logoClicked?: boolean
  setLogoClicked?: (clicked: boolean) => void
}

export function Navigation({ logoClicked, setLogoClicked }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const menuItems = [
    { href: "/", label: "HOME" },
    { href: "/studios", label: "STUDIOS" },
    { href: "/gallery", label: "GALLERY" },
    { href: "/booking", label: "CONTACT" },
    { href: "/booking", label: "BOOK NOW" },
  ]

  // Close menu when logo click state changes
  useEffect(() => {
    if (logoClicked) {
      setIsOpen(true)
    }
  }, [logoClicked])

  const handleClose = () => {
    setIsOpen(false)
    if (setLogoClicked) {
      setLogoClicked(false)
    }
  }

  return (
    <>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-neutral-900/90 backdrop-blur-xl border-b border-white/10">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Left side - Logo and Menu */}
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center">
                <div className="relative w-12 h-12">
                  <Image src="https://twejikjgxkzmphocbvpt.supabase.co/storage/v1/object/public/havensvgs//1stclass.png" alt="1ST CLASS STUDIOS" fill className="object-contain" />
                </div>
              </Link>

              {/* Desktop Menu Button */}
              <Button
                variant="ghost"
                onClick={() => setIsOpen(!isOpen)}
                className="hidden md:flex items-center space-x-2 text-white/70 hover:text-white hover:bg-white/5 font-light tracking-wider transition-all duration-300 px-4 py-2"
              >
                <Menu className="w-5 h-5" />
                <span>MENU</span>
              </Button>

              {/* Desktop Navigation Tabs */}
              <div className="hidden lg:flex items-center space-x-1">
                {menuItems.slice(0, 4).map((item) => (
                  <Button
                    key={item.href}
                    asChild
                    variant="ghost"
                    size="sm"
                    className={`text-white/60 hover:text-white hover:bg-white/5 font-light tracking-wider transition-all duration-300 px-4 py-2 ${
                      pathname === item.href ? "text-white bg-white/10" : ""
                    }`}
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </Button>
                ))}
              </div>
            </div>

            {/* Right side - Contact */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/5 font-light tracking-wider transition-all duration-300 px-3 py-2"
              >
                <Link href="tel:203-826-8911" className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>203-826-8911</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-white/30 text-white bg-neutral-800/50 hover:bg-white/5 hover:border-white/50 font-light tracking-wider transition-all duration-300 px-4 py-2"
              >
                <Link href="/booking">BOOK NOW</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-white/70 hover:text-white hover:bg-white/5 transition-all duration-300 p-2"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Dropdown Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-neutral-900/95 backdrop-blur-xl"
            onClick={handleClose}
          >
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute top-0 left-0 w-full bg-neutral-900/98 border-b border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="container mx-auto px-8 py-12">
                {/* Close Button */}
                <div className="flex justify-between items-center mb-16">
                  <div className="flex items-center">
                    <div className="relative w-12 h-12">
                      <Image
                        src="https://twejikjgxkzmphocbvpt.supabase.co/storage/v1/object/public/havensvgs//1stclass.png"
                        alt="1ST CLASS STUDIOS"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleClose}
                    className="text-white/70 hover:text-white hover:bg-white/5 transition-all duration-300 p-2"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                {/* Menu Items */}
                <div className="grid md:grid-cols-2 gap-16">
                  <div className="space-y-8">
                    <h3 className="text-sm font-light tracking-[0.3em] text-white/50 mb-8">NAVIGATION</h3>
                    {[
                      ...menuItems.filter((m) => m.label === 'HOME' || m.label === 'STUDIOS' || m.label === 'GALLERY' || m.label === 'BOOK NOW'),
                      ...menuItems.filter((m) => m.label === 'CONTACT'),
                    ].map((item, index) => (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Link
                          href={item.href}
                          onClick={handleClose}
                          className="block text-4xl md:text-5xl font-extralight text-white hover:text-white/70 transition-colors duration-300 tracking-wider"
                        >
                          {item.label}
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  <div className="space-y-12">
                    <div>
                      <h3 className="text-sm font-light tracking-[0.3em] text-white/50 mb-8">CONTACT</h3>
                      <div className="space-y-6">
                        <div className="space-y-6">
                          <Button
                            asChild
                            variant="ghost"
                            className="justify-start p-0 h-auto text-xl font-light text-white hover:text-white/70 transition-all duration-300"
                          >
                            <Link href="tel:203-826-8911" className="flex items-center space-x-4">
                              <Phone className="w-5 h-5" />
                              <span>203-826-8911</span>
                            </Link>
                          </Button>
                          <Button
                            asChild
                            variant="ghost"
                            className="justify-start p-0 h-auto text-xl font-light text-white hover:text-white/70 transition-all duration-300"
                          >
                            <Link href="sms:475-229-9564" className="flex items-center space-x-4">
                              <MessageSquare className="w-5 h-5" />
                              <span>475-229-9564</span>
                            </Link>
                          </Button>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                          <Button
                            asChild
                            variant="ghost"
                            className="justify-start p-0 h-auto text-lg font-light text-white/80 hover:text-white transition-all duration-300"
                          >
                            <Link href="mailto:admin@1stclassstudios.com" className="flex items-center space-x-4">
                              <Mail className="w-5 h-5" />
                              <span>admin@1stclassstudios.com</span>
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-light tracking-[0.3em] text-white/50 mb-8">LOCATION</h3>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-4">
                          <MapPin className="w-5 h-5 text-white/60 mt-1 flex-shrink-0" />
                          <div className="text-white/80 font-light">
                            <div>66 Viaduct Rd</div>
                            <div>Stamford, CT 06907</div>
                            <div className="text-white/50 text-sm mt-2">By Appointment Only</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-light tracking-[0.3em] text-white/50 mb-8">SOCIAL MEDIA</h3>
                      <div className="flex space-x-6">
                        <Link
                          href="#"
                          className="text-white/60 hover:text-white transition-colors duration-300"
                          aria-label="Instagram"
                        >
                          <Instagram className="w-6 h-6" />
                        </Link>
                        <Link
                          href="#"
                          className="text-white/60 hover:text-white transition-colors duration-300"
                          aria-label="YouTube"
                        >
                          <Youtube className="w-6 h-6" />
                        </Link>
                        <Link
                          href="#"
                          className="text-white/60 hover:text-white transition-colors duration-300"
                          aria-label="Facebook"
                        >
                          <Facebook className="w-6 h-6" />
                        </Link>
                        <Link
                          href="#"
                          className="text-white/60 hover:text-white transition-colors duration-300"
                          aria-label="TikTok"
                        >
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
