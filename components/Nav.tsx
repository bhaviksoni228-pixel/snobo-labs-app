'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/services/sites', label: 'Snobo Sites' },
  { href: '/services/chat', label: 'Snobo Chat' },
  { href: '/services/crm', label: 'Snobo CRM' },
  { href: '/services/bots', label: 'Snobo Bots' },
  { href: '/services/build', label: 'Snobo Build' },
  { href: '/audit', label: 'Free Website Audit' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-[5vw] bg-black/70 backdrop-blur-md border-b border-white/[0.08]">
        <Link href="/" className="flex items-center gap-2.5 font-display font-bold text-sm tracking-[0.1em] whitespace-nowrap">
          <Image src="/symbol.png" alt="" width={22} height={22} className="invert flex-shrink-0" />
          SNOBO LABS
        </Link>

        <div className="hidden md:flex gap-8 text-[13px] tracking-[0.06em] uppercase">
          <Link href="/services/sites" className="opacity-65 hover:opacity-100 transition-opacity">Services</Link>
          <Link href="/audit" className="opacity-65 hover:opacity-100 transition-opacity">Free Audit</Link>
          <a href="#services" className="opacity-65 hover:opacity-100 transition-opacity">Pricing</a>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/hire"
            className="font-display text-xs font-semibold tracking-[0.04em] bg-white text-black px-[18px] py-2.5 rounded-full whitespace-nowrap"
          >
            Hire Us
          </a>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="md:hidden flex flex-col justify-center items-center gap-1.5 w-9 h-9 flex-shrink-0"
          >
            <span className="w-5 h-px bg-white" />
            <span className="w-5 h-px bg-white" />
          </button>
        </div>
      </nav>

      {/* Overlay */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Slide-out drawer */}
      <div
        className={`fixed top-0 right-0 z-[80] h-full w-[78vw] max-w-[320px] bg-black border-l border-grey-2 transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-grey-2">
          <span className="font-display font-semibold text-sm tracking-[0.08em]">MENU</span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="w-9 h-9 flex items-center justify-center text-xl"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col px-6 py-6">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-4 border-b border-grey-2 font-display text-lg font-medium last:border-b-0"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="/hire"
            onClick={() => setOpen(false)}
            className="mt-6 text-center font-display font-semibold text-sm bg-white text-black px-6 py-4 rounded-full"
          >
            Hire Us
          </a>
        </div>
      </div>
    </>
  )
}