const steps = [
  { n: '01', titulo: 'Conheça-se',          desc: 'Comece pelo diagnóstico completo. Entenda onde você está, o que te move e o que te trava. Sem isso, qualquer ação é chute.' },
  { n: '02', titulo: 'Planeje com clareza', desc: 'Use as ferramentas estratégicas para definir seus OKRs, desenhar sua rotina ideal e criar um plano que respeita quem você é.' },
  { n: '03', titulo: 'Execute e acompanhe', desc: 'O dashboard mostra sua evolução em tempo real. Cada ferramenta salva seu progresso. Você nunca perde o fio.' },
]

export function ComoFunciona() {
  return (
    <section className="section como" id="como-funciona">
      <div className="container">
        <div className="section-label">Como funciona</div>
        <h2 className="section-title">Três passos. <em>Uma virada.</em></h2>
        <div className="como-steps">
          {steps.map((s) => (
            <div key={s.n} className="como-step">
              <div className="step-n">{s.n}</div>
              <h3>{s.titulo}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
