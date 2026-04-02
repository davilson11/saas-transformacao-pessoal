const fases = [
  {
    n: 'FASE 01', titulo: '🔍 Autoconhecimento',
    ferramentas: [
      { icon: '🎯', num: 'F01', nome: 'Raio-X 360°',       desc: 'Diagnóstico completo de onde você está hoje' },
      { icon: '🧭', num: 'F02', nome: 'Mapa de Valores',    desc: 'Identifique o que realmente importa para você' },
      { icon: '⭐', num: 'F03', nome: 'Propósito de Vida',  desc: 'Descubra sua missão e razão de existir' },
      { icon: '🔮', num: 'F04', nome: 'Visão de Futuro',    desc: 'Visualize em detalhes como será sua vida ideal' },
    ],
  },
  {
    n: 'FASE 02', titulo: '🎯 Visão e Metas',
    ferramentas: [
      { icon: '📊', num: 'F05', nome: 'OKRs Pessoais',      desc: 'Objetivos e resultados-chave que guiam sua jornada' },
      { icon: '📅', num: 'F06', nome: 'Plano de 12 Meses',  desc: 'Cronograma claro mês a mês de cada objetivo' },
      { icon: '💰', num: 'F07', nome: 'Finanças Pessoais',  desc: 'Controle e planejamento financeiro integrado' },
      { icon: '🌅', num: 'F08', nome: 'Rotina Ideal',       desc: 'Monte sua rotina de manhã, tarde e noite' },
    ],
  },
  {
    n: 'FASE 03', titulo: '🚀 Hábitos e Energia',
    ferramentas: [
      { icon: '💪', num: 'F09', nome: 'Saúde e Energia',    desc: 'Hábitos de movimento, sono e alimentação' },
      { icon: '🤝', num: 'F10', nome: 'Relacionamentos',    desc: 'Cuide das conexões que importam de verdade' },
      { icon: '🧘', num: 'F11', nome: 'Espiritualidade',    desc: 'Prática contemplativa e conexão com o sagrado' },
      { icon: '⚡', num: 'F12', nome: 'Energia Diária',     desc: 'Rastreie e maximize seus níveis de energia' },
    ],
  },
  {
    n: 'FASE 04', titulo: '🧠 Crescimento e Revisão',
    ferramentas: [
      { icon: '🎓', num: 'F13', nome: 'Aprendizado',        desc: 'Gerencie leituras, cursos e novos conhecimentos' },
      { icon: '📔', num: 'F14', nome: 'Diário de Bordo',    desc: 'Registro contínuo da sua jornada e reflexões' },
      { icon: '🏆', num: 'F15', nome: 'Conquistas',         desc: 'Celebre cada vitória — pequena ou grande' },
      { icon: '🔄', num: 'F16', nome: 'Revisão Mensal',     desc: 'Check-in estruturado para ajustar o rumo' },
    ],
  },
]

export function Ferramentas() {
  return (
    <section className="section ferr" id="ferramentas">
      <div className="container">
        <div className="section-label">O que está incluído</div>
        <h2 className="section-title">16 ferramentas para <em>transformar sua vida.</em></h2>
        <div className="ferr-phases">
          {fases.map((fase) => (
            <div key={fase.n}>
              <div className="ferr-phase-title">
                <span className="ph-n">{fase.n}</span>
                <h3>{fase.titulo}</h3>
              </div>
              <div className="ferr-grid">
                {fase.ferramentas.map((f) => (
                  <div key={f.num} className="f-card">
                    <span className="f-icon">{f.icon}</span>
                    <div className="f-num">{f.num}</div>
                    <div className="f-name">{f.nome}</div>
                    <div className="f-desc">{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
