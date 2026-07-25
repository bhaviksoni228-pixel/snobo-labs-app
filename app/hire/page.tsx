import HireForm from '@/components/HireForm'
import Nav from '@/components/Nav'
import BlobBackground from '@/components/BlobBackground'

export default function HirePage() {
  return (
    <main>
      <BlobBackground />
      <Nav />
      <section className="relative z-5 px-[6vw] pt-32 pb-24">
        <div className="font-display text-[11px] tracking-[0.28em] uppercase text-grey-4 mb-4">
          Get Started
        </div>
        <h1 className="font-display font-bold text-[clamp(1.8rem,6vw,3rem)] mb-10">
          Tell us what you need.
        </h1>
        <HireForm />
      </section>
    </main>
  )
}
