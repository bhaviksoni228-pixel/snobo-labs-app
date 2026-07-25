import Image from 'next/image'
import Link from 'next/link'

export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-[5vw] bg-black/70 backdrop-blur-md border-b border-white/[0.08]">
      <Link href="/" className="flex items-center gap-2.5 font-display font-bold text-sm tracking-[0.1em] whitespace-nowrap">
        <Image src="/symbol.png" alt="" width={22} height={22} className="invert flex-shrink-0" />
        SNOBO LABS
      </Link>

      <div className="hidden md:flex gap-8 text-[13px] tracking-[0.06em] uppercase">
        <a href="#services" className="opacity-65 hover:opacity-100 transition-opacity">Services</a>
        <a href="#work" className="opacity-65 hover:opacity-100 transition-opacity">Work</a>
        <a href="#contact" className="opacity-65 hover:opacity-100 transition-opacity">Pricing</a>
      </div>

      <a
        href="/hire"
        className="font-display text-xs font-semibold tracking-[0.04em] bg-white text-black px-[18px] py-2.5 rounded-full whitespace-nowrap"
      >
        Hire Us
      </a>
    </nav>
  )
}
