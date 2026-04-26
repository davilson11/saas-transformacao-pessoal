const faqs = [
  {
    icon: '💳',
    q:   'Preciso de cartão para o trial?',
    a:   'Não. Você acessa tudo por 7 dias sem precisar cadastrar cartão. Só pedimos quando você decide continuar.',
  },
  {
    icon: '⏰',
    q:   'O que acontece após os 7 dias?',
    a:   'Seu acesso é pausado. Todos seus dados ficam salvos. Você pode assinar quando quiser e continuar exatamente de onde parou.',
  },
  {
    icon: '❌',
    q:   'Posso cancelar quando quiser?',
    a:   'Sim. Sem multa, sem burocracia. Cancele quando quiser pelo seu perfil — leva menos de 1 minuto.',
  },
  {
    icon: '💾',
    q:   'Meus dados ficam salvos se eu não assinar?',
    a:   'Sim. Seus registros, respostas das ferramentas e progresso ficam salvos por 30 dias após o trial.',
  },
  {
    icon: '📱',
    q:   'Qual plataforma?',
    a:   'Web e mobile — acesse pelo navegador ou instale como app no celular. Funciona em qualquer dispositivo.',
  },
  {
    icon: '⏱️',
    q:   'Quanto tempo leva cada ferramenta?',
    a:   'Cada ferramenta leva de 20 a 60 minutos. Você vai no seu ritmo, sem pressão.',
  },
  {
    icon: '🔄',
    q:   'Posso reiniciar o processo todo ano?',
    a:   'Sim. O sistema foi projetado para ser revisado e reiniciado anualmente. É um sistema para a vida.',
  },
  {
    icon: '🛡️',
    q:   'E se eu não gostar?',
    a:   'Garantia de 7 dias no plano anual. Reembolso total, sem perguntas. Você não tem nada a perder.',
  },
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
