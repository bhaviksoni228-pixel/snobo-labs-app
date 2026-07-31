import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import BlobBackground from '@/components/BlobBackground'
import HireForm from '@/components/HireForm'
import FaqAccordion from '@/components/FaqAccordion'
import Reveal from '@/components/Reveal'
import { SERVICES_DATA, SERVICES_LIST } from '@/lib/services-data'

export function generateStaticParams() {
  return SERVICES_LIST.map((s) => ({ slug: s.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const service = SERVICES_DATA[params.slug]
  if (!service) return {}
  return {
    title: `${service.name} — Snobo Labs`,
    description: service.hook,
  }
}

export default function ServicePage({ params }: { params: { slug: string } }) {
  const service = SERVICES_DATA[params.slug]
  if (!service) return notFound()

  return (
    <main className="relative">
      <BlobBackground />
      <Nav />

      {/* Hero */}
      <section className="relative z-5 px-[6vw] pt-32 pb-16">
        <div className="font-display text-[11px] tracking-[0.28em] uppercase text-grey-4 mb-4">
          Snobo Labs / {service.name}
        </div>
        <h1 className="font-display font-bold leading-[1.1] tracking-[-0.01em] text-[clamp(2rem,7vw,4rem)] max-w-3xl">
          {service.hook}
        </h1>
        <p className="mt-5 text-grey-5 text-base sm:text-lg max-w-xl leading-relaxed">
          {service.description}
        </p>
        <a
          href="#hire"
          className="inline-flex items-center gap-2 mt-8 font-display font-semibold text-sm px-6 py-4 rounded-full bg-white text-black active:scale-[0.97] transition-transform"
        >
          Hire {service.name} <span>→</span>
        </a>
      </section>

      {/* Features */}
      <Reveal>
        <section className="relative z-5 px-[6vw] py-14 border-t border-grey-2">
          <div className="font-display text-[11px] tracking-[0.28em] uppercase text-grey-4 mb-6">
            What&apos;s included
          </div>
          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl">
            {service.features.map((f) => (
              <div
                key={f}
                className="flex items-start gap-3 border border-grey-2 rounded-xl px-5 py-4 bg-black/60 backdrop-blur-sm hover:border-grey-4 transition-colors"
              >
                <span className="text-white mt-0.5">→</span>
                <span className="text-sm text-grey-5">{f}</span>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* How it works */}
      <Reveal>
        <section className="relative z-5 px-[6vw] py-14 border-t border-grey-2">
          <div className="font-display text-[11px] tracking-[0.28em] uppercase text-grey-4 mb-6">
            How it works
          </div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl">
            {service.howItWorks.map((step, i) => (
              <div key={step}>
                <div className="font-display text-3xl font-bold text-grey-4 mb-2">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <p className="text-sm text-grey-5 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Pricing */}
      <Reveal>
        <section className="relative z-5 px-[6vw] py-14 border-t border-grey-2">
          <div className="font-display text-[11px] tracking-[0.28em] uppercase text-grey-4 mb-6">
            Pricing
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {service.pricing.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl p-6 flex flex-col bg-black/70 backdrop-blur-sm transition-transform hover:-translate-y-1 ${
                  tier.popular ? 'border-2 border-white' : 'border border-grey-2'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-6 bg-white text-black text-[10px] font-display font-bold uppercase tracking-wide px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="font-display font-semibold text-lg mt-2">{tier.name}</div>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-display font-bold text-3xl">{tier.price}</span>
                  {tier.priceNote && (
                    <span className="text-xs text-grey-4">{tier.priceNote}</span>
                  )}
                </div>
                <ul className="mt-5 space-y-2.5 flex-1">
                  {tier.checks.map((c) => (
                    <li key={c} className="flex items-start gap-2.5 text-sm text-grey-5">
                      <span className="text-white flex-shrink-0 mt-0.5">✓</span>
                      {c}
                    </li>
                  ))}
                </ul>
                <a
                  href="#hire"
                  className={`mt-6 text-center font-display font-semibold text-sm px-5 py-3 rounded-full transition-opacity active:opacity-80 ${
                    tier.popular ? 'bg-white text-black' : 'border border-white text-white'
                  }`}
                >
                  Choose {tier.name}
                </a>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* FAQ */}
      <Reveal>
        <section className="relative z-5 px-[6vw] py-14 border-t border-grey-2">
          <div className="font-display text-[11px] tracking-[0.28em] uppercase text-grey-4 mb-6">
            FAQ
          </div>
          <FaqAccordion items={service.faq} />
        </section>
      </Reveal>

      {/* Hire form */}
      <section id="hire" className="relative z-5 px-[6vw] py-16 border-t border-grey-2">
        <div className="font-display text-[11px] tracking-[0.28em] uppercase text-grey-4 mb-4">
          Hire {service.name}
        </div>
        <h2 className="font-display font-bold text-2xl mb-8">
          Tell us what you need — we&apos;ll take it from there.
        </h2>
        <HireForm
          lockedService={service.slug}
          lockedServiceName={service.name}
          pricingTiers={service.pricing}
        />
      </section>

      <Footer />
    </main>
  )
}