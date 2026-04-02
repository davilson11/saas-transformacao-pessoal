import Link from 'next/link'

const features = [
  '16 ferramentas guiadas e prontas para usar',
  '4 fases de transformação progressiva',
  'Raio-X 360° das suas áreas de vida',
  'Plano de 12 meses personalizado',
  'Rotina ideal com blocos de tempo',
  'Controle financeiro integrado',
  'Revisões mensais estruturadas',
  'Acesso vitalício — sem assinatura',
  'Atualizações gratuitas para sempre',
]

export function Pricing() {
  return (
    <section className="section pricing" id="precos">
      <div className="container">
        <div className="section-label" style={{ textAlign: 'center' }}>Comece sua transformação hoje</div>
        <h2 className="section-title" style={{ textAlign: 'center' }}>
          Um investimento único.<br /><em>Acesso vitalício.</em>
        </h2>
        <div className="pricing-wrap">
          <div className="pricing-card">
            <div className="pricing-tag">✦ Oferta de lançamento — vagas limitadas ✦</div>
            <div className="pricing-name">Kairos</div>
            <div className="pricing-sub">Sistema Completo de Transformação de Vida</div>
            <div className="pricing-old">De R$ 297</div>
            <div className="pricing-discount">− 33% de desconto</div>
            <div className="pricing-val">
              <span className="curr">R$</span>
              <span className="num">197</span>
            </div>
            <div className="pricing-period">Pagamento único · Acesso vitalício</div>
            <ul className="pricing-features">
              {features.map((f) => <li key={f}>{f}</li>)}
            </ul>
            <Link href="/sign-up" className="btn-pricing">Quero o Kairos agora →</Link>
            <div className="pricing-guarantees">
              <div className="guarantee-item"><span>🔒</span>Compra 100% segura · SSL</div>
              <div className="guarantee-item"><span>🛡️</span>Garantia de 7 dias</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
