import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import AuditFlow from '@/components/audit/AuditFlow'

export const metadata = {
  title: 'Free Website Audit — Snobo Labs',
  description:
    'Get a free, evidence-based audit of your website from Snobo Labs.',
}

export default function AuditPage() {
  return (
    <main className="relative min-h-screen bg-black">
      <Nav />

      <section className="min-h-screen px-[6vw] pb-24 pt-32">
        <div className="mb-8 max-w-lg">
          <div className="mb-4 font-display text-[11px] uppercase tracking-[0.28em] text-grey-4">
            Free Tool
          </div>

          <h1 className="mb-4 font-display text-[clamp(1.8rem,6vw,3.2rem)] font-bold leading-tight text-white">
            Find out what your website is costing you.
          </h1>

          <p className="text-grey-5">
            Paste your website URL. Snobo checks real technical and conversion
            signals and tells you where you may be losing customers.
          </p>
        </div>

        <AuditFlow />
      </section>

      <Footer />
    </main>
  )
}