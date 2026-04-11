import Link from 'next/link'

export function CTAFinal() {
  return (
    <section className="cta-final">
      <h2>Kairos.<br /><em>O seu momento.</em></h2>
      <p>Você já sabe que precisa mudar. A questão não é se — é quando. Esse momento é agora.</p>
      <Link href="/sign-up" className="btn-primary">Quero começar minha virada →</Link>
    </section>
  )
}
