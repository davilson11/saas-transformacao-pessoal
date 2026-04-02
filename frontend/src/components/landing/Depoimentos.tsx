const depoimentos = [
  { initials: 'AV', bg: '#C8A030', texto: '"Em 3 meses já tinha clareza suficiente para pedir demissão e abrir meu negócio. O sistema me deu a estrutura que eu não conseguia criar sozinha."', nome: 'Ana Vitória',   role: 'Designer, 28 anos' },
  { initials: 'LM', bg: '#DDB95A', texto: '"Finalmente consegui parar de procrastinar e colocar meus planos em prática. As ferramentas de revisão mensal mudaram minha relação com metas."',          nome: 'Lucas Mendes',   role: 'Engenheiro, 34 anos' },
  { initials: 'RS', bg: '#9A6E08', texto: '"O Mapa de Valores foi um divisor de águas. Percebi que estava perseguindo objetivos que não eram meus. Hoje vivo muito mais alinhada."',                nome: 'Rafaela Santos', role: 'Professora, 31 anos' },
]

export function Depoimentos() {
  return (
    <section className="section depo" id="depoimentos">
      <div className="container">
        <div className="section-label">Resultados reais</div>
        <h2 className="section-title">Quem já <em>virou o jogo.</em></h2>
        <div className="depo-grid">
          {depoimentos.map((d) => (
            <div key={d.initials} className="depo-card">
              <p className="depo-text">{d.texto}</p>
              <div className="depo-author">
                <div className="depo-av" style={{ background: d.bg }}>{d.initials}</div>
                <div>
                  <div className="depo-name">{d.nome}</div>
                  <div className="depo-role">{d.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
