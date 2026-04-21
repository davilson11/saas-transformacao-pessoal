const fases = [
  {
    n: '01', icon: '🔍', titulo: 'Autoconhecimento',
    desc: 'Descubra quem você é, onde está hoje e quais são seus valores mais profundos.',
    tools: ['Raio-X 360°', 'Bússola de Valores', 'SWOT Pessoal', 'Visão Âncora'],
  },
  {
    n: '02', icon: '🎯', titulo: 'Visão e Metas',
    desc: 'Defina com clareza onde quer chegar e estabeleça seus OKRs e design de vida.',
    tools: ['OKRs Pessoais', 'Design de Vida', 'Mapa Financeiro Pessoal', 'Rotina Ideal'],
  },
  {
    n: '03', icon: '🚀', titulo: 'Hábitos e Energia',
    desc: 'Construa a rotina que te leva lá: tempo, aprendizado e energia em ordem.',
    tools: ['Auditoria de Tempo', 'Arquiteto de Rotinas', 'Sprint de Aprendizado', 'Energia e Vitalidade'],
  },
  {
    n: '04', icon: '🧠', titulo: 'Crescimento',
    desc: 'Elimine bloqueios, fortaleça relações, registre sua evolução e mantenha o progresso.',
    tools: ['Desconstrutor de Crenças', 'Mapa de Relacionamentos', 'Diário de Bordo', 'Plano de Continuidade'],
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
