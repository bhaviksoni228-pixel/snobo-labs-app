'use client'

import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function TestCube() {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01
      meshRef.current.rotation.y += 0.01
    }
  })
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshBasicMaterial color="#ff0000" />
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

  if (status === 'unsupported') {
    return (
      <div className="fixed top-2 left-2 z-50 bg-red-600 text-white text-xs px-3 py-2 rounded">
        WebGL not supported on this browser — 3D background disabled
      </div>
    )
  }

  if (status === 'checking') return null

  return (
    <div className="fixed inset-0 z-0" style={{ width: '100vw', height: '100vh' }}>
      <div className="fixed top-2 left-2 z-50 bg-green-600 text-white text-xs px-3 py-2 rounded">
        DEBUG: Canvas mounted, WebGL supported
      </div>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={1} />
        <TestCube />
      </Canvas>
    </div>
  )
}