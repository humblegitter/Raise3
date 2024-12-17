'use client'
import { useEffect, useState, useRef } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'

export default function LandingPage() {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const globeRef = useRef<THREE.Mesh>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef = useRef(new THREE.Vector2())
  const particlesRef = useRef<THREE.Mesh[]>([])

  useEffect(() => {
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

      particle.position.setFromSphericalCoords(
        radius,
        phi,
        theta
      )

      particles.push(particle)
      scene.add(particle)
    }

    globeRef.current = particles[0]

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
    const baseRadius = 5  // Store original radius

    const handleMouseMove = (e: MouseEvent) => {
      if (!isTransitioning) {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2
        mouseY = -(e.clientY / window.innerHeight - 0.5) * 2
      } else {
        mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
        mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1
      }
    }

    window.addEventListener('mousemove', handleMouseMove)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      
      if (!isTransitioning) {
        const time = Date.now() * 0.001 // For wave animation
        
        particles.forEach(particle => {
          // Get the original normalized position
          const normalizedPos = particle.position.clone().normalize()
          
          // Calculate distance from mouse position to particle
          const mousePos = new THREE.Vector3(mouseX * 10, -mouseY * 10, 0)
          const distanceToMouse = particle.position.distanceTo(mousePos)
          
          // Wave effect
          const waveX = Math.sin(particle.position.x * 0.5 + time) * 0.5
          const waveY = Math.cos(particle.position.y * 0.5 + time) * 0.5
          const wave = (waveX + waveY) * Math.max(0, 1 - distanceToMouse * 0.1)
          
          // Apply wave distortion
          const newRadius = baseRadius + wave
          particle.position.copy(normalizedPos.multiplyScalar(newRadius))
          
          // Glow effect based on distance to mouse
          const glowIntensity = Math.max(0.5, 2 - distanceToMouse * 0.2)
          ;(particle.material as THREE.MeshPhongMaterial).emissiveIntensity = glowIntensity
          
          // Orbit around center
          const currentX = particle.position.x
          const currentZ = particle.position.z
          const angle = 0.002 // Speed of rotation
          
          particle.position.x = currentX * Math.cos(angle) - currentZ * Math.sin(angle)
          particle.position.z = currentZ * Math.cos(angle) + currentX * Math.sin(angle)
          
          // Individual particle rotation
          particle.rotation.x += 0.001
          particle.rotation.y += 0.001
        })
      }

      if (isTransitioning) {
        raycasterRef.current.setFromCamera(mouseRef.current, camera)
        const intersects = raycasterRef.current.intersectObjects(particles)
        
        particles.forEach(particle => {
          (particle.material as THREE.MeshPhongMaterial).emissiveIntensity = 0.5
        })

        intersects.forEach(intersect => {
          const particle = intersect.object as THREE.Mesh
          (particle.material as THREE.MeshPhongMaterial).emissiveIntensity = 2
        })
      }
      
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      renderer.dispose()
    }
  }, [isTransitioning])

  useEffect(() => {
    gsap.to('.letter', {
      opacity: 1,
      y: 0,
      stagger: 0.1,
      delay: 0.5,
      ease: 'power2.out'
    })
  }, [])

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
      </div>
    </div>
  )
}
