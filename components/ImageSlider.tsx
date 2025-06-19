"use client"

import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

interface ImageSliderProps {
  images: string[]
  className?: string
  previewSides?: boolean
}

export function ImageSlider({ images, className, previewSides = false }: ImageSliderProps) {
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

  const prevIdx = (current - 1 + images.length) % images.length
  const nextIdx = (current + 1) % images.length

  return (
    <div className={`relative w-full h-full group ${className || ""}`}>
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

      {/* Current slide */}
      <Image
        src={images[current]}
        alt="Studio image"
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 50vw"
      />

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/80 hover:scale-110 z-20"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/80 hover:scale-110 z-20"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
    </div>
  )
} 