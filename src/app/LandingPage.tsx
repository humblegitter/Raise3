'use client'
import { useEffect } from 'react'
import gsap from 'gsap'

export default function LandingPage() {
  useEffect(() => {
    const letters = "RAISE".split("")
    
    gsap.to('.letter', {
      y: 0,
      opacity: 1,
      duration: 2.5,
      stagger: 0.4,
      ease: 'back.out(1.7)'
    })
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#5bc3f3]">
      <h1 className="text-9xl font-['Daydream']">
        {["R","A","I","S","E"].map((letter, index) => (
          <span key={index} className="letter opacity-0">{letter}</span>
        ))}
        <sup className="text-6xl relative -top-20 letter opacity-0">3</sup>
      </h1>
    </div>
  )
}
