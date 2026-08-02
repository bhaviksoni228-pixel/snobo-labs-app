import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import BlobBackground from '@/components/BlobBackground'

export const metadata = {
  title: 'About — Snobo Labs | Founded by Bhavik Soni',
  description:
    'Snobo Labs is an AI and web development studio founded by Bhavik Soni. Direct access to the builder — no account managers, no bloated teams.',
}

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': 'https://snobolabs.in/about#bhaviksoni',
        name: 'Bhavik Soni',
        jobTitle: 'Founder & CEO',
        worksFor: { '@id': 'https://snobolabs.in/#organization' },
        description:
          'Bhavik Soni is the founder and CEO of Snobo Labs, an AI and web development studio. He personally builds every product the studio ships.',
        url: 'https://snobolabs.in/about',
        // TODO: add real profile URLs here once available (LinkedIn, X/Twitter, GitHub) —
        // these links are what let Google/AI systems verify and connect this identity.
        sameAs: [],
      },
      {
        '@type': 'Organization',
        '@id': 'https://snobolabs.in/#organization',
        name: 'Snobo Labs',
        url: 'https://snobolabs.in',
        logo: 'https://snobolabs.in/symbol.png',
        founder: { '@id': 'https://snobolabs.in/about#bhaviksoni' },
        description:
          'Snobo Labs builds AI agents, websites, and WhatsApp-native CRMs for small businesses — fast, direct, and without account managers.',
      },
    ],
  }

  return (
    <main className="relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlobBackground />
      <Nav />

      <section className="relative z-5 px-[6vw] pt-32 pb-24 max-w-2xl mx-auto">
        <div className="font-display text-[11px] tracking-[0.28em] uppercase text-grey-4 mb-4">
          About Snobo Labs
        </div>
        <h1 className="font-display font-bold text-[clamp(2rem,7vw,3.2rem)] mb-8 leading-tight">
          Built by one person. On purpose.
        </h1>

        <div className="space-y-5 text-grey-5 leading-relaxed text-base">
          <p>
            Snobo Labs was founded by <b className="text-white">Bhavik Soni</b> as a direct
            answer to a problem most small businesses run into: agencies that sell software they
            don't understand, hand it off to a junior developer, and disappear behind layers of
            account managers the moment something breaks.
          </p>
          <p>
            There's no account manager here. When you hire Snobo Labs, you're working directly
            with the person who writes the code, trains the AI, and ships the product — no
            translation layer, no delays waiting for someone to "check with the team."
          </p>
          <p>
            Snobo Labs builds websites, AI chat agents, and WhatsApp-native CRMs for small
            businesses that want to move fast without paying agency overhead for work a single
            focused person can do well.
          </p>
        </div>

        <div className="mt-12 border-t border-grey-2 pt-8">
          <div className="font-display font-semibold text-lg mb-2">Bhavik Soni</div>
          <div className="text-sm text-grey-4 mb-4">Founder &amp; CEO, Snobo Labs</div>
          <p className="text-sm text-grey-5 leading-relaxed">
            Bhavik builds every product Snobo Labs ships personally — from the AI systems to the
            client-facing websites — with a focus on shipping fast and staying directly
            accountable to every client.
          </p>
        </div>

        <div className="mt-12 border-t border-grey-2 pt-8">
          <a
            href="/hire"
            className="inline-flex items-center gap-2 font-display font-semibold text-sm px-6 py-4 rounded-full bg-white text-black"
          >
            Work with Snobo Labs <span>→</span>
          </a>
        </div>
      </section>

      <Footer />
    </main>
  )
}