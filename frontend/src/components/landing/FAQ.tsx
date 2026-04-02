const faqs = [
  { icon: '📱', q: 'Qual plataforma?',       a: 'Notion — disponível em todas as plataformas, mobile e desktop. Você acessa de qualquer lugar.' },
  { icon: '⏱️', q: 'Quanto tempo leva?',     a: 'Cada ferramenta leva de 20 a 60 minutos. Você vai no seu ritmo, sem pressão.' },
  { icon: '🔄', q: 'Posso usar todo ano?',   a: 'Sim! O sistema foi projetado para ser revisado e reiniciado anualmente. É um sistema para a vida.' },
  { icon: '🛡️', q: 'E se eu não gostar?',   a: 'Garantia de 7 dias. Reembolso total, sem perguntas. Você não tem nada a perder.' },
]

export function FAQ() {
  return (
    <section className="section" id="faq">
      <div className="container">
        <div className="section-label">Dúvidas frequentes</div>
        <h2 className="section-title">Antes de começar.</h2>
        <div className="faq-grid">
          {faqs.map((f) => (
            <div key={f.q} className="faq-card">
              <span className="faq-icon">{f.icon}</span>
              <div className="faq-q">{f.q}</div>
              <div className="faq-a">{f.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
