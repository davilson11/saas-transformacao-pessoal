const beneficios = [
  "Acesso completo às 16 ferramentas",
  "Dashboard cockpit personalizado",
  "Relatório de progresso mensal em PDF",
  "Atualizações vitalícias incluídas",
  "Suporte por email em até 24h",
  "Garantia de 30 dias ou seu dinheiro de volta",
];

export default function Pricing() {
  return (
    <section className="py-20 px-6" style={{ backgroundColor: "#1E392A" }}>
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-4xl sm:text-5xl font-bold mb-3 text-white"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Comece Sua Transformação Hoje
          </h2>
          <p
            className="text-lg"
            style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.7)" }}
          >
            Um investimento único para 12 meses de mudança real
          </p>
        </div>

        <div
          className="flex flex-col gap-6 p-8 sm:p-10"
          style={{
            backgroundColor: "white",
            borderRadius: "20px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
          }}
        >
          {/* Badge */}
          <div className="flex justify-center">
            <span
              className="px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase"
              style={{
                fontFamily: "var(--font-heading)",
                color: "#E0A55F",
                backgroundColor: "rgba(224,165,95,0.15)",
              }}
            >
              Mais Popular
            </span>
          </div>

          {/* Nome do plano */}
          <div className="text-center">
            <h3
              className="text-2xl font-bold"
              style={{ fontFamily: "var(--font-heading)", color: "#1E392A" }}
            >
              Jornada Anual
            </h3>
          </div>

          {/* Preço */}
          <div className="text-center">
            <p
              className="text-6xl font-bold leading-none"
              style={{ fontFamily: "var(--font-heading)", color: "#1E392A" }}
            >
              R$ 297
            </p>
            <p
              className="mt-2 text-sm"
              style={{ fontFamily: "var(--font-body)", color: "#6B7280" }}
            >
              ou 12x de R$ 24,75
            </p>
          </div>

          {/* Divisor */}
          <hr style={{ borderColor: "#E5E7EB" }} />

          {/* Benefícios */}
          <ul className="flex flex-col gap-3">
            {beneficios.map((b) => (
              <li
                key={b}
                className="flex items-start gap-3 text-sm"
                style={{ fontFamily: "var(--font-body)", color: "#1E392A" }}
              >
                <span className="mt-0.5">✅</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <a
            href="#comecar"
            className="block w-full text-center py-4 rounded-xl text-base font-bold transition-all duration-150 hover:brightness-90 hover:-translate-y-0.5 active:translate-y-0"
            style={{
              fontFamily: "var(--font-heading)",
              backgroundColor: "#E0A55F",
              color: "#1E392A",
            }}
          >
            Começar Agora
          </a>

          {/* Segurança */}
          <p
            className="text-center text-xs"
            style={{ fontFamily: "var(--font-body)", color: "#6B7280" }}
          >
            🔒 Pagamento 100% seguro · Cancele quando quiser
          </p>
        </div>
      </div>
    </section>
  );
}
