"use client"

import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import React, { useState } from "react"
import { motion } from "framer-motion"

interface ImageSliderProps {
  images: string[]
  className?: string
  previewSides?: boolean
  transitionDurationMs?: number
  outerArrows?: boolean
  draggable?: boolean
}

export function ImageSlider({
  images,
  className,
  previewSides = false,
  transitionDurationMs = 700,
  outerArrows = false,
  draggable = false,
}: ImageSliderProps) {
  const [current, setCurrent] = useState(0)

  // framer-motion drag handling
  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (Math.abs(info.offset.x) > 50 || Math.abs(info.velocity.x) > 500) {
      if (info.offset.x < 0) {
        setCurrent((prev) => (prev + 1) % images.length)
      } else {
        setCurrent((prev) => (prev - 1 + images.length) % images.length)
      }
    }
  }

  if (!images || images.length === 0) {
    return null
  }

  const goPrev = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrent((prev) => (prev - 1 + images.length) % images.length)
  }

  const goNext = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrent((prev) => (prev + 1) % images.length)
  }

  const prevIdx = (current - 1 + images.length) % images.length
  const nextIdx = (current + 1) % images.length

  return (
    <div className={`relative w-full h-full group overflow-hidden ${className || ""}`}>
      {previewSides && images.length > 1 && (
        <>
          {/* Previous preview */}
          <div className="absolute left-[-10%] top-1/2 -translate-y-1/2 w-[60%] h-[80%] scale-75 opacity-40 pointer-events-none overflow-hidden rounded-lg">
            <Image src={images[prevIdx]} alt="Prev" fill className="object-cover" />
          </div>

          {/* Next preview */}
          <div className="absolute right-[-10%] top-1/2 -translate-y-1/2 w-[60%] h-[80%] scale-75 opacity-40 pointer-events-none overflow-hidden rounded-lg">
            <Image src={images[nextIdx]} alt="Next" fill className="object-cover" />
          </div>
        </>
      )}

      {/* Slides container */}
      <div className="relative w-full h-full overflow-hidden">
        <motion.div
          className="flex h-full w-full"
          drag={draggable ? "x" : false}
          dragElastic={0.2}
          onDragEnd={draggable ? handleDragEnd : undefined}
          animate={{ x: `-${current * 100}%` }}
          transition={{ duration: transitionDurationMs / 1000, ease: "easeInOut" }}
        >
          {images.map((img, idx) => (
            <div key={idx} className="relative flex-shrink-0 w-full h-full">
              <Image src={img} alt="slide" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className={`${outerArrows ? "-left-12" : "left-4"} absolute top-1/2 -translate-y-1/2 p-2 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/80 hover:scale-110 z-20`}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={goNext}
            className={`${outerArrows ? "-right-12" : "right-4"} absolute top-1/2 -translate-y-1/2 p-2 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/80 hover:scale-110 z-20`}
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
    </div>
  )
} 