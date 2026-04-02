import Link from 'next/link'

export function CTAFinal() {
  return (
    <section className="cta-final">
      <h2>Kairos.<br /><em>O seu momento.</em></h2>
      <p>Cada dia que passa sem direção é um dia que não volta. A virada começa com um passo. Esse passo começa aqui.</p>
      <Link href="/sign-up" className="btn-primary">Quero começar minha virada →</Link>
    </section>
  )
}
