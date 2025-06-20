"use client"

import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import React, { useState } from "react"

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

  // Manual drag handling to support desktop and touch devices
  const [dragStartX, setDragStartX] = useState<number | null>(null)

  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    setDragStartX(clientX)
  }

  const handleDragEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (dragStartX === null) return
    const clientX = "changedTouches" in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX
    const delta = clientX - dragStartX
    if (Math.abs(delta) > 50) {
      delta < 0 ? setCurrent((prev) => (prev + 1) % images.length) : setCurrent((prev) => (prev - 1 + images.length) % images.length)
    }
    setDragStartX(null)
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
    <div
      className={`relative w-full h-full group ${className || ""}`}
      onMouseDown={draggable ? handleDragStart : undefined}
      onMouseUp={draggable ? handleDragEnd : undefined}
      onTouchStart={draggable ? handleDragStart : undefined}
      onTouchEnd={draggable ? handleDragEnd : undefined}
    >
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
        className="object-cover transition-transform group-hover:scale-105"
        style={{ transitionDuration: `${transitionDurationMs}ms` }}
        sizes="(max-width: 768px) 100vw, 50vw"
      />

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