const fases = [
  {
    n: '01', icon: '🔍', titulo: 'Autoconhecimento',
    desc: 'Descubra quem você é, onde está hoje e quais são seus valores mais profundos.',
    tools: ['Raio-X 360°', 'Mapa de Valores', 'Propósito de Vida', 'Visão de Futuro'],
  },
  {
    n: '02', icon: '🎯', titulo: 'Visão e Metas',
    desc: 'Defina com clareza onde quer chegar e estabeleça seus OKRs e plano de 12 meses.',
    tools: ['OKRs Pessoais', 'Plano de 12 Meses', 'Finanças Pessoais', 'Rotina Ideal'],
  },
  {
    n: '03', icon: '🚀', titulo: 'Hábitos e Energia',
    desc: 'Construa a rotina que te leva lá: saúde, produtividade e relacionamentos.',
    tools: ['Saúde e Energia', 'Relacionamentos', 'Espiritualidade', 'Energia Diária'],
  },
  {
    n: '04', icon: '🧠', titulo: 'Crescimento e Revisão',
    desc: 'Elimine bloqueios, registre sua evolução e ajuste o rumo mensalmente.',
    tools: ['Aprendizado', 'Diário de Bordo', 'Conquistas', 'Revisão Mensal'],
  },
]

export function Metodologia() {
  return (
    <section className="section" id="metodologia">
      <div className="container">
        <div className="section-label">A metodologia</div>
        <h2 className="section-title">Sua jornada de <em>12 meses.</em></h2>
        <p className="fases-sub">
          4 fases progressivas que se constroem uma sobre a outra, transformando todas as áreas da sua vida de forma estruturada.
        </p>
        <div className="fases-grid">
          {fases.map((f) => (
            <div key={f.n} className="fase-card">
              <div className="fase-num">{f.n}</div>
              <span className="fase-icon">{f.icon}</span>
              <h3>{f.titulo}</h3>
              <p>{f.desc}</p>
              <ul className="fase-tools">
                {f.tools.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
