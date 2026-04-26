import Link from 'next/link'

export function CTAFinal() {
  return (
    <section className="cta-final">
      <h2>Kairos.<br /><em>O seu momento.</em></h2>
      <p>Você já sabe que precisa mudar. A questão não é se — é quando. Esse momento é agora.</p>
      <Link href="/sign-up" className="btn-primary">Começar meus 7 dias grátis →</Link>
      <p style={{
        marginTop:     '0.75rem',
        fontSize:      '0.8rem',
        color:         'rgba(245,240,232,0.4)',
        letterSpacing: '0.02em',
      }}>
        Sem cartão. Sem compromisso. Cancele quando quiser.
      </p>
    </section>
  )
}
