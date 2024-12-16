'use client'
import { useEffect, useState, useRef } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'

export default function LandingPage() {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [buttonText, setButtonText] = useState('')
  const fullText = 'Click to Enter'
  const globeRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.getElementById('globe-container')?.appendChild(renderer.domElement)

    // Create globe with more segments for smoother look while keeping retro style
    const globeGeometry = new THREE.SphereGeometry(5, 64, 32)
    const globeMaterial = new THREE.MeshStandardMaterial({
      map: new THREE.TextureLoader().load('/fonts/assets/8 bit map.jpg'),
      roughness: 1,
      metalness: 0,
      emissive: new THREE.Color(0x222222),
      emissiveIntensity: 0.3,
      flatShading: true,
    })
    
    // Set texture filtering to nearest for pixelated look
    if (globeMaterial.map) {
      globeMaterial.map.minFilter = THREE.NearestFilter
      globeMaterial.map.magFilter = THREE.NearestFilter
    }
    
    const globe = new THREE.Mesh(globeGeometry, globeMaterial)
    scene.add(globe)
    globeRef.current = globe

    // Enhanced lighting setup
    const ambientLight = new THREE.AmbientLight(0x444444, 1.2)
    scene.add(ambientLight)

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 3, 5)
    scene.add(directionalLight)

    // Add subtle rim light to enhance edges
    const rimLight = new THREE.DirectionalLight(0x335577, 0.3)
    rimLight.position.set(-5, 0, -5)
    scene.add(rimLight)

    camera.position.z = 15

    // Mouse movement handler
    let mouseX = 0
    let mouseY = 0

    const onMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - window.innerWidth / 2) * 0.002
      mouseY = (event.clientY - window.innerHeight / 2) * 0.002
    }

    window.addEventListener('mousemove', onMouseMove)

    // Animation loop
    const animate = () => {
      if (!isTransitioning) {
        requestAnimationFrame(animate)
        
        globe.rotation.y += (mouseX - globe.rotation.y) * 0.02
        globe.rotation.x += (mouseY - globe.rotation.x) * 0.02
        
        renderer.render(scene, camera)
      }
    }
    animate()

    // Animate RAISE3 letters
    gsap.to('.letter', {
      y: 0,
      opacity: 1,
      duration: 2.5,
      stagger: 0.4,
      ease: 'back.out(1.7)'
    })

    // Start typing effect after logo animation
    let currentIndex = 0
    const typewriterDelay = setTimeout(() => {
      const typeInterval = setInterval(() => {
        if (currentIndex <= fullText.length) {
          setButtonText(fullText.slice(0, currentIndex))
          currentIndex++
        } else {
          clearInterval(typeInterval)
          gsap.to('.enter-button', {
            opacity: 1,
            duration: 0.5
          })
        }
      }, 100)

      return () => clearInterval(typeInterval)
    }, 2500)

    return () => {
      clearTimeout(typewriterDelay)
      window.removeEventListener('mousemove', onMouseMove)
      renderer.dispose()
    }
  }, [isTransitioning])

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      <div id="globe-container" className="absolute inset-0" />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <h1 className="text-9xl font-['Daydream'] text-white z-10">
          {["R","A","I","S","E"].map((letter, index) => (
            <span 
              key={index} 
              className="letter opacity-0 inline-block"
              style={{ transform: 'translateY(20px)' }}
            >
              {letter}
            </span>
          ))}
          <sup className="text-6xl relative -top-20 letter opacity-0">3</sup>
        </h1>
        <button 
          className="enter-button mt-24 opacity-0 font-['Daydream'] text-2xl text-white hover:scale-110 transition-transform duration-200 relative mx-auto block pointer-events-auto"
          onClick={() => setIsTransitioning(true)}
        >
          {buttonText}
          <span className="animate-blink">|</span>
        </button>
      </div>
    </div>
  )
}
