import Image from 'next/image'
import { getSiteContent } from '@/lib/api'

const DEFAULTS = {
  email: 'snobolabs@gmail.com',
  copyright: `© ${new Date().getFullYear()} Snobo Labs. All rights reserved.`,
}

export default async function Footer() {
  const content = (await getSiteContent('footer')) || DEFAULTS

  return (
    <footer
      id="contact"
      className="relative z-5 border-t border-grey-2 px-[6vw] pt-11 pb-9 flex justify-between items-center flex-wrap gap-3.5 text-xs text-grey-4"
    >
      <Image src="/symbol.png" alt="Snobo Labs" width={28} height={28} className="opacity-85" />
      <div>{content.copyright || DEFAULTS.copyright}</div>
      <div>{content.email || DEFAULTS.email}</div>
    </footer>
  )
}