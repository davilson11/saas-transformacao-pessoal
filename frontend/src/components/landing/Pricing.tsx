import Link from 'next/link'

const planos = [
  {
    nome: 'Grátis',
    sub: 'Para experimentar sem compromisso',
    preco: '0',
    periodo: 'para sempre',
    destaque: false,
    tag: null,
    features: [
      { texto: '3 ferramentas desbloqueadas', ativo: true },
      { texto: 'Raio-X 360°, Mapa de Valores e Visão de Futuro', ativo: true },
      { texto: 'Sem prazo — explore no seu ritmo', ativo: true },
      { texto: 'Todas as 16 ferramentas', ativo: false },
      { texto: 'Dashboard de evolução', ativo: false },
      { texto: 'Histórico e progresso salvo', ativo: false },
    ],
    cta: 'Criar conta grátis',
    href: '/sign-up',
  },
  {
    nome: 'Pro Mensal',
    sub: 'Acesso completo, sem compromisso longo',
    preco: '29',
    periodo: '/mês · cancele quando quiser',
    destaque: false,
    tag: null,
    features: [
      { texto: 'Todas as 16 ferramentas', ativo: true },
      { texto: 'Dashboard com dados reais', ativo: true },
      { texto: 'Histórico de progresso', ativo: true },
      { texto: 'Roda da Vida interativa', ativo: true },
      { texto: 'Suporte por e-mail', ativo: true },
      { texto: 'Atualizações inclusas', ativo: true },
    ],
    cta: 'Começar agora',
    href: '/sign-up?plano=mensal',
  },
  {
    nome: 'Pro Anual',
    sub: 'Melhor valor — economia de 45%',
    preco: '197',
    periodo: '/ano · equivale a R$16/mês',
    destaque: true,
    tag: 'Mais popular',
    features: [
      { texto: 'Tudo do Pro Mensal', ativo: true },
      { texto: '45% de desconto vs mensal', ativo: true },
      { texto: 'Acesso antecipado a novidades', ativo: true },
      { texto: 'Comunidade exclusiva', ativo: true },
      { texto: 'Sessão de onboarding', ativo: true },
      { texto: 'Garantia de 7 dias', ativo: true },
    ],
    cta: 'Quero o Pro Anual',
    href: '/sign-up?plano=anual',
  },
]

export function Pricing() {
  return (
    <section className="section pricing" id="precos">
      <div className="container">
        <div className="section-label" style={{ textAlign: 'center' }}>Investimento</div>
        <h2 className="section-title" style={{ textAlign: 'center' }}>
          Comece agora.<br /><em>Sem desculpa de preço.</em>
        </h2>
        <p className="pricing-intro">
          Menos que um café por semana. Cancele quando quiser.
        </p>

        <div className="pricing-grid">
          {planos.map((p) => (
            <div key={p.nome} className={`pricing-card${p.destaque ? ' featured' : ''}`}>
              {p.tag && <div className="pricing-tag">{p.tag}</div>}
              <div className="pricing-name">{p.nome}</div>
              <div className="pricing-sub">{p.sub}</div>
              <div className="pricing-val">
                <span className="curr">{p.preco !== '0' ? 'R$' : ''}</span>
                <span className="num">{p.preco === '0' ? 'Grátis' : p.preco}</span>
              </div>
              <div className="pricing-period">{p.periodo}</div>
              <ul className="pricing-features">
                {p.features.map((f) => (
                  <li key={f.texto} className={f.ativo ? '' : 'off'}>
                    {f.texto}
                  </li>
                ))}
              </ul>
              <Link href={p.href} className={`btn-plan${p.destaque ? ' btn-plan-featured' : ''}`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="pricing-footer">
          <span>🔒 Pagamento seguro · SSL</span>
          <span>🛡️ Garantia de 7 dias no plano anual</span>
          <span>❌ Sem fidelidade no plano mensal</span>
        </div>
      </div>
    </section>
  )
}
