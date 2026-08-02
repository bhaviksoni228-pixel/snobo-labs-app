import Mascot from './Mascot'
import { getSiteContent } from '@/lib/api'

const DEFAULTS = {
  headline: 'Intelligence Beyond Limits',
  subtext: 'Innovate. Automate. Elevate.',
}

export default async function Hero() {
  const content = (await getSiteContent('hero')) || DEFAULTS
  const [line1, line2, line3] = (content.headline || DEFAULTS.headline).split(' ')

  return (
    <section className="relative z-5 min-h-[100svh] flex flex-col justify-center px-[6vw] pt-[calc(64px+40px)] pb-[60px]">
      <div className="grid md:grid-cols-[1.05fr_0.95fr] gap-5 items-center">
        <div>
          <div
            className="animate-fade-up flex items-center gap-3 text-[11px] tracking-[0.28em] uppercase text-grey-4 mb-5 before:content-[''] before:w-7 before:h-px before:bg-grey-4"
            style={{ animationDelay: '0.1s' }}
          >
            Snobo Labs / AI &amp; Web Studio
          </div>

          <h1
            className="animate-fade-up font-display font-bold leading-[1] tracking-[-0.02em] text-[clamp(2.4rem,9vw,5.2rem)]"
            style={{ animationDelay: '0.25s' }}
          >
            {content.headline || DEFAULTS.headline}
          </h1>

          <p
            className="animate-fade-up mt-5 max-w-[440px] text-[clamp(16px,4vw,19px)] leading-relaxed text-grey-5 font-medium"
            style={{ animationDelay: '0.4s' }}
          >
            {content.subtext || DEFAULTS.subtext}
          </p>

          <p
            className="animate-fade-up mt-3 text-sm text-grey-4 font-semibold"
            style={{ animationDelay: '0.5s' }}
          >
            Live in <b className="text-white font-bold">7 days</b>. No account managers. Just direct access to the builder.
          </p>

          <div className="animate-fade-up mt-8 flex gap-3.5 flex-wrap" style={{ animationDelay: '0.6s' }}>
            <a
              href="/hire"
              className="font-display text-sm font-semibold tracking-[0.03em] px-6 py-4 rounded-full bg-white text-black border border-white inline-flex items-center gap-2 active:scale-[0.97] transition-transform"
            >
              Hire Snobo <span>→</span>
            </a>
            <a
              href="#services"
              className="font-display text-sm font-semibold tracking-[0.03em] px-6 py-4 rounded-full bg-transparent text-white border border-white inline-flex items-center gap-2 hover:bg-white/[0.08] transition-colors"
            >
              See what we build
            </a>
          </div>

          <a
            href="/audit"
            className="animate-fade-up mt-4 inline-flex items-center gap-2 text-sm text-grey-4 underline"
            style={{ animationDelay: '0.7s' }}
          >
            Or get a free AI audit of your website →
          </a>
        </div>

        <Mascot />
      </div>
    </section>
  )
}