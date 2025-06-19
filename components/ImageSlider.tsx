"use client"

import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

interface ImageSliderProps {
  images: string[]
  className?: string
}

export function ImageSlider({ images, className }: ImageSliderProps) {
  const [current, setCurrent] = useState(0)

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

  return (
    <div className={`relative w-full h-full group ${className || ""}`}>
      {/* Slide */}
      <Image
        src={images[current]}
        alt="Studio image"
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-110"
        sizes="(max-width: 768px) 100vw, 50vw"
      />

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/80 hover:scale-110 z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/80 hover:scale-110 z-10"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  )
} 