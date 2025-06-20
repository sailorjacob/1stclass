"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface AudioWaveFooterProps {
  heightRem?: number // h-16 default (4rem)
  barCount?: number
  bottomThreshold?: number
}

export function AudioWaveFooter({ heightRem = 4, barCount = 200, bottomThreshold = 120 }: AudioWaveFooterProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement
      setShow(scrollTop + clientHeight >= scrollHeight - bottomThreshold)
    }
    window.addEventListener("scroll", handleScroll)
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [bottomThreshold])

  return (
    <motion.section
      className="relative overflow-hidden w-full"
      style={{ height: `${heightRem}rem` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute inset-0 flex items-end justify-between pointer-events-none select-none">
        {Array.from({ length: barCount }).map((_, i) => {
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
  )
} 