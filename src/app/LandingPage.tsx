'use client'
import { useEffect, useState, useRef } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const mouseRef = useRef(new THREE.Vector2())

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setIsLoading(false), 500) // Delay hiding loader
          return 100
        }
        return prev + 1
      })
    }, 20)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!isLoading) {  // Only initialize after loading is complete
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0x000000)
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
      cameraRef.current = camera
      const renderer = new THREE.WebGLRenderer({ antialias: true })
      
      renderer.setSize(window.innerWidth, window.innerHeight)
      document.getElementById('globe-container')?.appendChild(renderer.domElement)

      // Create particles for globe immediately
      const particles: THREE.Mesh[] = []
      const radius = 5
      const count = 2000

      const particleMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 0.5,
        flatShading: true,
      })

      // Create particles in a sphere formation
      for (let i = 0; i < count; i++) {
        const phi = Math.acos(-1 + (2 * i) / count)
        const theta = Math.sqrt(count * Math.PI) * phi

        const particle = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 0.1, 0.1),
          particleMaterial.clone()
        )

        // Calculate final position
        const finalX = radius * Math.sin(phi) * Math.cos(theta)
        const finalY = radius * Math.cos(phi)
        const finalZ = radius * Math.sin(phi) * Math.sin(theta)

        // Start at center
        particle.position.set(0, 0, 0)
        particles.push(particle)
        scene.add(particle)

        // Animate from center to final position
        gsap.fromTo(particle.position,
          { x: 0, y: 0, z: 0 },
          {
            x: finalX,
            y: finalY,
            z: finalZ,
            duration: 2,
            ease: "power2.out",
            delay: Math.random() * 0.5
          }
        )

        // Fade in
        gsap.fromTo(particle.material,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 1,
            delay: Math.random() * 0.5
          }
        )
      }

    

      // Enhanced lighting setup
      const ambientLight = new THREE.AmbientLight(0x444444, 1.2)
      scene.add(ambientLight)

      // Typewriter effect for launch date
      const text = "Launching April 2025..."
      const launchText = document.querySelector('p')
      if (launchText) {
        launchText.textContent = ''
        gsap.to(launchText, { opacity: 1, duration: 0.1 })
        
        const launchDuration = text.length * 0.1
        
        text.split('').forEach((char, i) => {
          gsap.to(launchText, {
            duration: 0.1,
            delay: 2 + (i * 0.1),
            onStart: () => {
              launchText.textContent = text.substring(0, i + 1)
            }
          })
        })

        // Spawn animation for both buttons
        const buttons = document.querySelectorAll('button')
        buttons.forEach((button, index) => {
          gsap.to(button, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out',
            delay: 2 + launchDuration + 0.5 + (index * 0.5) // Sequential spawn with 0.5s gap
          })
        })
      }

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

      const handleMouseMove = (e: MouseEvent) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2
        mouseY = -(e.clientY / window.innerHeight - 0.5) * 2
        mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
        mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1
      }

      window.addEventListener('mousemove', handleMouseMove)

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate)
        
        const time = Date.now() * 0.0005
        
        particles.forEach((particle, i) => {
          // Base sphere position
          const phi = Math.acos(-1 + (2 * i) / particles.length)
          const theta = Math.sqrt(particles.length * Math.PI) * phi + time
          
          // Set base position
          particle.position.x = radius * Math.sin(phi) * Math.cos(theta)
          particle.position.y = radius * Math.cos(phi)
          particle.position.z = radius * Math.sin(phi) * Math.sin(theta)
          
          // Calculate distance and angle to mouse
          const mousePos = new THREE.Vector3(mouseX * 10, -mouseY * 10, 0)
          const distanceToMouse = particle.position.distanceTo(mousePos)
          
          // Vortex effect
          if (distanceToMouse < 5) {  // Affect particles within range
            const angle = Math.atan2(
              particle.position.z - mousePos.z,
              particle.position.x - mousePos.x
            )
            
            // Create spiral motion
            const spiralStrength = Math.max(0, 1 - distanceToMouse * 0.2) * 2.0
            const spiralX = Math.cos(angle + time * 5) * spiralStrength
            const spiralZ = Math.sin(angle + time * 5) * spiralStrength
            
            particle.position.x += spiralX
            particle.position.z += spiralZ
            
            // Pull slightly toward mouse
            const pullStrength = Math.max(0, 1 - distanceToMouse * 0.2) * 0.1
            particle.position.lerp(mousePos, pullStrength)
          }
          
          // Glow effect
          const glowIntensity = Math.max(0.5, 2 - distanceToMouse * 0.2)
          ;(particle.material as THREE.MeshPhongMaterial).emissiveIntensity = glowIntensity
        })

        renderer.render(scene, camera)
      }
      animate()

      // Initial animation for letters
      gsap.fromTo('.letter', 
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.5,
          ease: 'power2.out',
          onComplete: () => {
            // After letters fade in, move logo to top
            gsap.to('.logo-container', {
              y: '-35vh', // Move up
              scale: 0.5, // Make smaller
              duration: 1,
              ease: 'power2.inOut',
              delay: 0.5 // Wait a bit before starting
            })
          }
        }
      )

      // Hover effects
      const letters = document.querySelectorAll('.letter')
      letters.forEach((letter) => {
        letter.addEventListener('mouseenter', () => {
          gsap.to(letter, {
            scale: 1.2,
            y: -10,
            color: '#00ffff',
            duration: 0.3,
            ease: 'power2.out'
          })
        })

        letter.addEventListener('mouseleave', () => {
          gsap.to(letter, {
            scale: 1,
            y: 0,
            color: '#ffffff',
            duration: 0.3,
            ease: 'power2.in'
          })
        })
      })

      // After the logo animation
      gsap.to('p', {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
        delay: 1.75
      })

      gsap.to('button', {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
        delay: 2,
        stagger: 0.5 // Add stagger for sequential button animations
      })

      // Cleanup
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        renderer.dispose()
        letters.forEach((letter) => {
          letter.removeEventListener('mouseenter', () => {})
          letter.removeEventListener('mouseleave', () => {})
        })
      }
    }
  }, [isLoading])

  return (
    <div className="relative">
      {/* Single section with fixed height */}
      <div className="h-screen overflow-hidden bg-black">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-400 transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <div className="text-cyan-400 mt-4 font-mono">
              Loading... {loadingProgress}%
            </div>
          </div>
        ) : (
          <>
            <div id="globe-container" className="absolute inset-0" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="logo-container">
                <h1 className="text-9xl font-['Daydream'] text-white z-10">
                  {["R","A","I","S","E"].map((letter, index) => (
                    <span 
                      key={index} 
                      className="letter opacity-0 inline-block transition-all duration-300"
                      style={{ transform: 'translateY(20px)' }}
                    >
                      {letter}
                    </span>
                  ))}
                  <sup 
                    className="text-6xl relative -top-20 letter opacity-0 transition-all duration-300"
                  >
                    3
                  </sup>
                </h1>
              </div>
              <p 
                className="absolute bottom-44 text-cyan-400 font-mono text-lg opacity-0"
                style={{ transform: 'translateY(20px)' }}
              >
                Launching April 2025...
              </p>
              <button 
                className="absolute bottom-28 text-cyan-400 font-mono text-xl opacity-0 border-2 border-cyan-400 px-6 py-2 rounded-lg hover:bg-cyan-400/10 transition-colors duration-300"
                style={{ transform: 'translateY(20px)' }}
                onClick={() => window.open('https://app.gitbook.com/invite/RchIfOacX2i9zA51W2fm/oeBqz13ORTmzaPOd8ynP', '_blank')}
              >
                Documentation
              </button>
              <button 
                className="absolute bottom-8 text-cyan-400 font-mono text-xl opacity-0 border-2 border-cyan-400 px-6 py-2 rounded-lg hover:bg-cyan-400/10 transition-colors duration-300"
                style={{ transform: 'translateY(20px)' }}
                onClick={() => console.log('Connect wallet clicked')}
              >
                Connect Wallet
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
