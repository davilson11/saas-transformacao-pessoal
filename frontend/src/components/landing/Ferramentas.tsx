const fases = [
  {
    n: 'FASE 01', titulo: '🔍 Autoconhecimento',
    ferramentas: [
      { icon: '🎯', num: 'F01', nome: 'Raio-X 360°',             desc: 'Diagnóstico completo das 8 áreas da sua vida' },
      { icon: '🧭', num: 'F02', nome: 'Bússola de Valores',       desc: 'Identifique os valores que guiam suas decisões' },
      { icon: '⭐', num: 'F03', nome: 'SWOT Pessoal',             desc: 'Forças, fraquezas, oportunidades e ameaças' },
      { icon: '🔮', num: 'F04', nome: 'Feedback 360°',            desc: 'Enxergue pontos cegos com perspectivas externas' },
    ],
  },
  {
    n: 'FASE 02', titulo: '🎯 Visão e Metas',
    ferramentas: [
      { icon: '📊', num: 'F05', nome: 'OKRs Pessoais',            desc: 'Objetivos e resultados-chave trimestrais' },
      { icon: '📅', num: 'F06', nome: 'Design de Vida',           desc: 'Trace horizontes de 1, 5 e 10 anos com clareza' },
      { icon: '💰', num: 'F07', nome: 'Mapa Financeiro Pessoal',  desc: 'Visualize entradas, saídas e construa saúde financeira' },
      { icon: '🌅', num: 'F08', nome: 'Rotina Ideal',             desc: 'Monte sua rotina de manhã, tarde e noite' },
    ],
  },
  {
    n: 'FASE 03', titulo: '🚀 Hábitos e Energia',
    ferramentas: [
      { icon: '⏱',  num: 'F09', nome: 'Auditoria de Tempo',       desc: 'Mapeie como você usa suas 24 horas diárias' },
      { icon: '🏗',  num: 'F10', nome: 'Arquiteto de Rotinas',     desc: 'Rituais matinal e noturno com rastreador semanal' },
      { icon: '🎓',  num: 'F11', nome: 'Sprint de Aprendizado',    desc: 'Domine uma habilidade em 30 dias com tracker diário' },
      { icon: '⚡',  num: 'F12', nome: 'Energia e Vitalidade',     desc: 'Diagnostique e maximize suas 4 dimensões de energia' },
    ],
  },
  {
    n: 'FASE 04', titulo: '🧠 Crescimento',
    ferramentas: [
      { icon: '🧠', num: 'F13', nome: 'Desconstrutor de Crenças', desc: 'Elimine crenças limitantes com 9 perguntas socráticas' },
      { icon: '🤝', num: 'F14', nome: 'Mapa de Relacionamentos',  desc: 'Fortaleça vínculos e cultive conexões que constroem' },
      { icon: '📔', num: 'F15', nome: 'Diário de Bordo',          desc: 'Registro contínuo da sua jornada e reflexões' },
      { icon: '🛡',  num: 'F16', nome: 'Plano de Continuidade',   desc: 'Planos SE-ENTÃO para manter o progresso nos dias difíceis' },
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
