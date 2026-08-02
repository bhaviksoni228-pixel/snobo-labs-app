import Image from 'next/image'
import { getSiteContent } from '@/lib/api'

const DEFAULT_TEXT =
  "Most small businesses get sold software they don't understand and can't maintain. We think AI should feel like a teammate, not a black box."

export default async function Manifesto() {
  const content = await getSiteContent('manifesto')
  const text = content?.text || DEFAULT_TEXT

  return (
    <section className="relative z-5 border-t border-b border-grey-2 overflow-hidden">
      <Image
        src="/banner.jpg"
        alt="Snobo Labs"
        width={1828}
        height={860}
        className="w-full h-auto block grayscale contrast-[1.1] opacity-[0.85]"
      />
      <div className="px-[6vw] pt-16 pb-20 max-w-[780px]">
        <p className="font-display font-medium leading-[1.4] tracking-[-0.01em] text-[clamp(1.25rem,4.4vw,2.2rem)]">
          {text}
        </p>
      </div>
    </section>
  )
}