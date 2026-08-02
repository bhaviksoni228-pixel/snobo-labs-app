import Link from 'next/link'
import RevealServiceRow from './RevealServiceRow'
import { getPublicServices } from '@/lib/api'

const FALLBACK_SERVICES = [
  { slug: 'sites', name: 'Snobo Sites', hook: 'Get a professional website — live in 5–7 days.' },
  { slug: 'chat', name: 'Snobo Chat', hook: 'Never miss a customer message — AI on your site and WhatsApp.' },
  { slug: 'crm', name: 'Snobo CRM', hook: 'Stop losing track of leads — WhatsApp-native pipeline.' },
  { slug: 'bots', name: 'Snobo Bots', hook: 'Automate booking, FAQs, and follow-ups.' },
  { slug: 'build', name: 'Snobo Build', hook: 'Turn your idea into a working product, fast.' },
]

export default async function Services() {
  const dbServices = await getPublicServices()
  const services = dbServices.length > 0 ? dbServices : FALLBACK_SERVICES

  return (
    <section id="services" className="relative z-5 px-[6vw] pt-20 pb-24">
      <div className="font-display text-[11px] tracking-[0.28em] uppercase text-grey-4 mb-4.5">
        What we build
      </div>
      <h2 className="font-display font-bold leading-[1.18] tracking-[-0.01em] max-w-[700px] text-[clamp(1.6rem,6vw,3rem)]">
        Five ways to stop losing customers to slow response times.
      </h2>

      <div className="mt-11">
        {services.map((s: any, i: number) => (
          <RevealServiceRow key={s.slug} delay={i * 0.06}>
            <Link
              href={`/services/${s.slug}`}
              className="group grid grid-cols-[34px_1fr_26px] items-center gap-4 py-6 border-t border-grey-2 last:border-b transition-[padding-left,background] hover:pl-2.5 hover:bg-white/[0.03] active:bg-white/[0.05]"
            >
              <div className="font-display text-xs text-grey-4">{String(i + 1).padStart(2, '0')}</div>
              <div>
                <div className="font-display font-semibold text-[clamp(1.1rem,4.4vw,1.7rem)]">
                  {s.name}
                </div>
                <div className="text-sm text-grey-5 mt-1.5 font-medium leading-relaxed">
                  {s.hook}
                </div>
              </div>
              <div className="text-xl text-grey-5 text-right transition-transform group-hover:translate-x-1.5">
                →
              </div>
            </Link>
          </RevealServiceRow>
        ))}
      </div>
    </section>
  )
}