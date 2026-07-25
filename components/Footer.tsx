import Image from 'next/image'

export default function Footer() {
  return (
    <footer
      id="contact"
      className="relative z-5 border-t border-grey-2 px-[6vw] pt-11 pb-9 flex justify-between items-center flex-wrap gap-3.5 text-xs text-grey-4"
    >
      <Image src="/symbol.png" alt="Snobo Labs" width={28} height={28} className="opacity-85" />
      <div>Snobo Labs © 2026 — snobolabs.in</div>
      <div>snobolabs@gmail.com</div>
    </footer>
  )
}
