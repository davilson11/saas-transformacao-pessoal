const fases = [
  {
    numero: "01",
    emoji: "🔍",
    titulo: "Autoconhecimento",
    descricao: "Descubra quem você é e onde está hoje",
  },
  {
    numero: "02",
    emoji: "🎯",
    titulo: "Visão e Metas",
    descricao: "Defina com clareza onde quer chegar",
  },
  {
    numero: "03",
    emoji: "🚀",
    titulo: "Hábitos e Produtividade",
    descricao: "Construa a rotina que te leva lá",
  },
  {
    numero: "04",
    emoji: "🧠",
    titulo: "Mentalidade",
    descricao: "Elimine os bloqueios que te prendem",
  },
];

export default function Solucao() {
  return (
    <section
      className="py-20 px-6"
      style={{ background: "linear-gradient(135deg, #1E392A 0%, #2D5A4F 100%)" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-4xl sm:text-5xl font-bold mb-3 text-white"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            A Solução: Sua Jornada de 12 Meses
          </h2>
          <p
            className="text-lg"
            style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.8)" }}
          >
            4 fases que vão transformar todas as áreas da sua vida
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {fases.map((fase) => (
            <div
              key={fase.numero}
              className="flex flex-col gap-3 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span
                className="text-3xl font-bold"
                style={{ fontFamily: "var(--font-heading)", color: "#E0A55F" }}
              >
                {fase.numero}
              </span>
              <span className="text-4xl">{fase.emoji}</span>
              <h3
                className="text-lg font-semibold text-white"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {fase.titulo}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.75)" }}
              >
                {fase.descricao}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
