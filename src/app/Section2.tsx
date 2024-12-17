import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Section2() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    
    renderer.setSize(window.innerWidth, window.innerHeight)
    containerRef.current?.appendChild(renderer.domElement)

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x444444, 1)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 3, 5)
    scene.add(directionalLight)

    camera.position.z = 15

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      renderer.dispose()
    }
  }, [])

  return (
    <div className="relative min-h-screen bg-black">
      <div ref={containerRef} className="absolute inset-0" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h2 className="text-6xl font-['Daydream'] text-white z-10 opacity-0">
          Section 2
        </h2>
      </div>
    </div>
  )
}
