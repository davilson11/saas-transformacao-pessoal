const problemas = [
  { n: '01', icon: '🧭', titulo: 'Falta de direção',       desc: 'Você tem vontade de mudar, mas não sabe por onde começar. Cada dia parece igual ao anterior.', span: false },
  { n: '02', icon: '🗂️', titulo: 'Fragmentação',           desc: 'Começa vários projetos e não termina nenhum. A energia se dispersa sem gerar resultado.',       span: false },
  { n: '03', icon: '⏳', titulo: 'Procrastinação',          desc: 'Sabe o que precisa fazer, mas adia sempre para amanhã. O amanhã nunca chega.',                   span: false },
  { n: '04', icon: '🌫️', titulo: 'Falta de clareza',       desc: 'Não consegue visualizar como será sua vida daqui 1 ano. O futuro parece indefinido.',             span: false },
  { n: '05', icon: '📚', titulo: 'Excesso de informação',  desc: 'Consome muito conteúdo mas coloca pouco em prática. Informação sem sistema não vira ação.',        span: true  },
]

export function Problema() {
  return (
    <section className="section problema" id="problema">
      <div className="container">
        <div className="section-label">Você se identifica?</div>
        <h2 className="section-title">Você está aqui.</h2>
        <p className="identifica-sub">
          Reconhece algum desses cenários? A maioria das pessoas que querem mudar passa por pelo menos três deles.
        </p>

        <div className="problema-grid">
          {problemas.map((p) => (
            <div key={p.n} className={`prob-card${p.span ? ' prob-span' : ''}`}>
              <span className="prob-n">{p.n}</span>
              <div className="prob-top">
                <span className="prob-icon">{p.icon}</span>
                <h3>{p.titulo}</h3>
              </div>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="problema-cta">
          <p>&ldquo;Se você reconheceu pelo menos um desses cenários, o Kairos foi feito para você.&rdquo;</p>
        </div>
      </div>
    </section>
  )
}
