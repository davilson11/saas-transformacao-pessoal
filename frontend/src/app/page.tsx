import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { Problema } from '@/components/landing/Problema'
import { Metodologia } from '@/components/landing/Metodologia'
import { Ferramentas } from '@/components/landing/Ferramentas'
import { ComoFunciona } from '@/components/landing/ComoFunciona'
import { Depoimentos } from '@/components/landing/Depoimentos'
import { Pricing } from '@/components/landing/Pricing'
import { FAQ } from '@/components/landing/FAQ'
import { CTAFinal } from '@/components/landing/CTAFinal'
import { Footer } from '@/components/landing/Footer'
import '../styles/landing.css'

export default function Home() {
  return (
    <div className="landing-root">
      <Navbar />
      <main>
        <Hero />
        <div className="divider" />
        <Problema />
        <div className="divider" />
        <Metodologia />
        <div className="divider" />
        <Ferramentas />
        <div className="divider" />
        <ComoFunciona />
        <div className="divider" />
        <Depoimentos />
        <div className="divider" />
        <Pricing />
        <div className="divider" />
        <FAQ />
        <CTAFinal />
      </main>
      <Footer />
    </div>
  )
}
