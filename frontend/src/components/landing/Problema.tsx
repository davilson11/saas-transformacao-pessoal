const problemas = [
  {
    emoji: "🧭",
    titulo: "Falta de direção",
    descricao: "Você tem vontade de mudar, mas não sabe por onde começar.",
  },
  {
    emoji: "🗂️",
    titulo: "Fragmentação",
    descricao: "Começa vários projetos e não termina nenhum.",
  },
  {
    emoji: "⏳",
    titulo: "Procrastinação",
    descricao: "Sabe o que precisa fazer, mas adia sempre para amanhã.",
  },
  {
    emoji: "🌫️",
    titulo: "Falta de clareza",
    descricao: "Não consegue visualizar como será sua vida daqui 1 ano.",
  },
  {
    emoji: "📚",
    titulo: "Excesso de informação",
    descricao: "Consome muito conteúdo mas coloca pouco em prática.",
  },
];

export default function Problema() {
  return (
    <section className="py-20 px-6" style={{ backgroundColor: "#F4F1DE" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-4xl sm:text-5xl font-bold mb-3"
            style={{ fontFamily: "var(--font-heading)", color: "#1E392A" }}
          >
            Você está aqui:
          </h2>
          <p
            className="text-lg"
            style={{ fontFamily: "var(--font-body)", color: "#6B7280" }}
          >
            Reconhece algum desses cenários?
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          {problemas.map((p) => (
            <div key={p.titulo} className="card w-full max-w-sm">
              <div className="text-5xl mb-4">{p.emoji}</div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ fontFamily: "var(--font-heading)", color: "#1E392A" }}
              >
                {p.titulo}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ fontFamily: "var(--font-body)", color: "#6B7280" }}
              >
                {p.descricao}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
