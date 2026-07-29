import BlobBackground from '@/components/BlobBackground'
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import Manifesto from '@/components/Manifesto'
import Services from '@/components/Services'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="relative">
      <BlobBackground />
      <Nav />
      <Hero />
      <Manifesto />
      <Services />
      <Footer />
    </main>
  )
}
