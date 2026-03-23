'use client';

const ferramentas = [
  { codigo: "F01", emoji: "🎯", nome: "Raio-X 360°" },
  { codigo: "F02", emoji: "🧭", nome: "Mapa de Valores" },
  { codigo: "F03", emoji: "⭐", nome: "Propósito de Vida" },
  { codigo: "F04", emoji: "🔮", nome: "Visão de Futuro" },
  { codigo: "F05", emoji: "📊", nome: "OKRs" },
  { codigo: "F06", emoji: "📅", nome: "Plano de 12 Meses" },
  { codigo: "F07", emoji: "💰", nome: "Finanças Pessoais" },
  { codigo: "F08", emoji: "🌅", nome: "Rotina Ideal" },
  { codigo: "F09", emoji: "💪", nome: "Saúde e Energia" },
  { codigo: "F10", emoji: "🤝", nome: "Relacionamentos" },
  { codigo: "F11", emoji: "🧘", nome: "Espiritualidade" },
  { codigo: "F12", emoji: "📔", nome: "Diário de Bordo" },
  { codigo: "F13", emoji: "🎓", nome: "Aprendizado" },
  { codigo: "F14", emoji: "⚡", nome: "Energia Diária" },
  { codigo: "F15", emoji: "🏆", nome: "Conquistas" },
  { codigo: "F16", emoji: "🔄", nome: "Revisão Mensal" },
];

export default function Ferramentas() {
  return (
    <section className="py-20 px-6" style={{ backgroundColor: "#F4F1DE" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-4xl sm:text-5xl font-bold mb-3"
            style={{ fontFamily: "var(--font-heading)", color: "#1E392A" }}
          >
            16 Ferramentas Para Transformar Sua Vida
          </h2>
          <p
            className="text-lg"
            style={{ fontFamily: "var(--font-body)", color: "#6B7280" }}
          >
            Cada ferramenta resolve um problema específico da sua jornada
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ferramentas.map((f) => (
            <div
              key={f.codigo}
              className="relative flex flex-col items-center gap-2 p-5 rounded-xl transition-all duration-300 hover:-translate-y-1"
              style={{
                backgroundColor: "white",
                border: "1px solid #E5E7EB",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 8px 24px rgba(30,57,42,0.25)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 2px 8px rgba(0,0,0,0.08)";
              }}
            >
              <span
                className="absolute top-3 left-3 text-xs font-bold"
                style={{ fontFamily: "var(--font-heading)", color: "#E0A55F" }}
              >
                {f.codigo}
              </span>
              <span className="text-4xl mt-2">{f.emoji}</span>
              <span
                className="text-sm font-semibold text-center"
                style={{ fontFamily: "var(--font-heading)", color: "#1E392A" }}
              >
                {f.nome}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
