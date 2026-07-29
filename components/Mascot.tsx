'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function Mascot() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = wrapRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    setRotate({ x: -py * 16, y: px * 16 })
  }

  function handleMouseLeave() {
    setRotate({ x: 0, y: 0 })
  }

  return (
    <div>
      <div
        ref={wrapRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative flex justify-center items-center mt-2 md:mt-9 min-h-[240px] md:min-h-[280px]"
        style={{ perspective: 1200 }}
      >
        {/* orbit rings */}
        <div className="absolute top-1/2 left-1/2 w-[115%] max-w-[420px] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-grey-4 animate-spin-slow">
          <div className="absolute top-0 left-1/2 w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_3px_rgba(255,255,255,0.7)]" />
        </div>
        <div
          className="absolute top-1/2 left-1/2 w-[85%] max-w-[320px] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-grey-3 animate-spin-slow"
          style={{ animationDuration: '60s', animationDirection: 'reverse' }}
        >
          <div className="absolute bottom-0 left-1/2 w-2 h-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.6)]" />
        </div>

        <motion.div
          className="relative z-10 w-[52vw] max-w-[260px]"
          animate={{ rotateX: rotate.x, rotateY: rotate.y, z: rotate.x || rotate.y ? 15 : 0 }}
          transition={{ type: 'spring', stiffness: 150, damping: 15 }}
          style={{
            transformStyle: 'preserve-3d',
            filter: 'drop-shadow(0 24px 50px rgba(0,0,0,0.9))',
          }}
        >
          <Image
            src="/mascot.png"
            alt="Snobo Labs mascot"
            width={453}
            height={881}
            className="w-full h-auto"
            priority
          />
        </motion.div>

        <div className="absolute bottom-[2%] left-1/2 w-1/2 h-5 -translate-x-1/2 blur-sm rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.16),transparent_70%)]" />
      </div>

      <div className="flex items-center gap-2.5 mt-2 md:mt-11 justify-center md:justify-start text-[10px] tracking-[0.2em] uppercase text-grey-4">
        <div className="w-px h-7 bg-gradient-to-b from-grey-4 to-transparent animate-scroll-line" />
        Scroll
      </div>
    </div>
  )
}