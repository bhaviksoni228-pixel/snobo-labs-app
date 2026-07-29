'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function noise(x: number, y: number, z: number, t: number) {
  return Math.sin(x * 1.5 + t) * Math.cos(y * 1.5 + t) * Math.sin(z * 1.5 + t * 0.7)
}

function Blob() {
  const meshRef = useRef<THREE.Mesh>(null)
  const geoRef = useRef<THREE.IcosahedronGeometry>(null)

  const basePositions = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(2, 24)
    return geo.attributes.position.array.slice()
  }, [])

  const mouse = useRef({ x: 0, y: 0 })
  const scrollY = useRef(0)

  useMemo(() => {
    if (typeof window === 'undefined') return
    window.addEventListener('mousemove', (e) => {
      mouse.current.x = e.clientX / window.innerWidth - 0.5
      mouse.current.y = e.clientY / window.innerHeight - 0.5
    })
    window.addEventListener(
      'scroll',
      () => {
        scrollY.current = window.scrollY
      },
      { passive: true }
    )
  }, [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * 0.4
    const geo = geoRef.current
    if (!geo) return
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const ix = basePositions[i * 3]
      const iy = basePositions[i * 3 + 1]
      const iz = basePositions[i * 3 + 2]
      const n = noise(ix * 0.8, iy * 0.8, iz * 0.8, t)
      const scale = 1 + n * 0.15
      pos.setXYZ(i, ix * scale, iy * scale, iz * scale)
    }
    pos.needsUpdate = true

    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0016 + mouse.current.x * 0.0006
      meshRef.current.rotation.x = mouse.current.y * 0.3 + scrollY.current * 0.0004
      meshRef.current.position.y = -scrollY.current * 0.0012
    }
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry ref={geoRef} args={[2, 24]} />
      <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.18} />
    </mesh>
  )
}

function checkWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch (e) {
    return false
  }
}

export default function BlobBackground() {
  const [status, setStatus] = useState<'checking' | 'supported' | 'unsupported'>('checking')

  useEffect(() => {
    setStatus(checkWebGL() ? 'supported' : 'unsupported')
  }, [])

  if (status === 'unsupported' || status === 'checking') return null

  return (
    <div className="fixed inset-0 z-0" style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <Blob />
      </Canvas>
    </div>
  )
}