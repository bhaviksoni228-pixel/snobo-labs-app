import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import BlobBackground from '@/components/BlobBackground'
import HireForm from '@/components/HireForm'
import FaqAccordion from '@/components/FaqAccordion'
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
        <p className="mt-5 text-grey-5 text-lg max-w-xl leading-relaxed">
          {service.description}
        </p>
        <a
          href="#hire"
          className="inline-flex items-center gap-2 mt-8 font-display font-semibold text-sm px-6 py-4 rounded-full bg-white text-black"
        >
          Hire {service.name} <span>→</span>
        </a>
      </section>

      {/* Features */}
      <section className="relative z-5 px-[6vw] py-14 border-t border-grey-2">
        <div className="font-display text-[11px] tracking-[0.28em] uppercase text-grey-4 mb-6">
          What&apos;s included
        </div>
        <div className="grid sm:grid-cols-2 gap-4 max-w-3xl">
          {service.features.map((f) => (
            <div key={f} className="flex items-start gap-3 border border-grey-2 rounded-xl px-5 py-4 bg-black/60 backdrop-blur-sm">
              <span className="text-grey-5 mt-0.5">→</span>
              <span className="text-sm text-grey-5">{f}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-5 px-[6vw] py-14 border-t border-grey-2">
        <div className="font-display text-[11px] tracking-[0.28em] uppercase text-grey-4 mb-6">
          How it works
        </div>
        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl">
          {service.howItWorks.map((step, i) => (
            <div key={step}>
              <div className="font-display text-3xl font-bold text-grey-3 mb-2">
                {String(i + 1).padStart(2, '0')}
              </div>
              <p className="text-sm text-grey-5 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="relative z-5 px-[6vw] py-14 border-t border-grey-2">
        <div className="font-display text-[11px] tracking-[0.28em] uppercase text-grey-4 mb-6">
          Pricing
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {service.pricing.map((tier) => (
            <div key={tier.name} className="border border-grey-2 rounded-2xl p-6 flex flex-col bg-black/60 backdrop-blur-sm">
              <div className="font-display font-semibold text-lg">{tier.name}</div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="font-display font-bold text-3xl">{tier.price}</span>
                {tier.priceNote && (
                  <span className="text-xs text-grey-4">{tier.priceNote}</span>
                )}
              </div>
              <p className="mt-3 text-sm text-grey-4 leading-relaxed flex-1">
                {tier.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-5 px-[6vw] py-14 border-t border-grey-2">
        <div className="font-display text-[11px] tracking-[0.28em] uppercase text-grey-4 mb-6">
          FAQ
        </div>
        <FaqAccordion items={service.faq} />
      </section>

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