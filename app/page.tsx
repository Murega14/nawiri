import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import TrustScore from '@/components/TrustScore'
import P2PLending from '@/components/P2PLending'
import Testimonials from '@/components/Testimonials'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <HowItWorks />
      <TrustScore />
      <P2PLending />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  )
}
