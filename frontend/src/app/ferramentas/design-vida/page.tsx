'use client';

import { useState } from "react";
import FerramentaLayout from "@/components/dashboard/FerramentaLayout";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type DiaPerfeito = {
  acordar: string;
  onde: string;
  trabalho: string;
  pessoas: string;
  financeiro: string;
  cuidado: string;
  sentimento: string;
  ritual: string;
};

type HorizonteArea = {
  um: string;
  tres: string;
  cinco: string;
};

type VisaoAreas = Record<string, HorizonteArea>;

type PorqueProundo = {
  porqueImporta: string;
  quemBeneficia: string;
  seBuscar: string;
  declaracao: string;
};

type Area = {
  id: string;
  emoji: string;
  label: string;
  cor: string;
  placeholder1: string;
  placeholder3: string;
  placeholder5: string;
};

// ─── Constantes ──────────────────────────────────────────────────────────────

const AREAS: Area[] = [
  {
    id: "saude",
    emoji: "💪",
    label: "Saúde",
    cor: "#27AE60",
    placeholder1: "Como está minha saúde em 1 ano?",
    placeholder3: "Que hábito se tornou automático?",
    placeholder5: "Como é meu corpo e energia em 5 anos?",
  },
  {
    id: "mente",
    emoji: "🧠",
    label: "Mente",
    cor: "#8E44AD",
    placeholder1: "O que estou aprendendo?",
    placeholder3: "Que habilidade dominei?",
    placeholder5: "Qual é meu nível intelectual?",
  },
  {
    id: "financas",
    emoji: "💰",
    label: "Finanças",
    cor: "#E0A55F",
    placeholder1: "Qual é minha renda?",
    placeholder3: "O que já conquistei financeiramente?",
    placeholder5: "Como é minha liberdade financeira?",
  },
  {
    id: "carreira",
    emoji: "📊",
    label: "Carreira",
    cor: "#2980B9",
    placeholder1: "Em que trabalho?",
    placeholder3: "Que posição ocupo?",
    placeholder5: "Qual é meu legado profissional?",
  },
  {
    id: "relacionamentos",
    emoji: "🤝",
    label: "Relacionamentos",
    cor: "#E74C3C",
    placeholder1: "Com quem me relaciono?",
    placeholder3: "Como estão minhas conexões?",
    placeholder5: "Que vínculos cultivei por 5 anos?",
  },
  {
    id: "lazer",
    emoji: "🎨",
    label: "Lazer",
    cor: "#16A085",
    placeholder1: "O que faço por prazer?",
    placeholder3: "Que experiências vivi?",
    placeholder5: "Como é minha vida fora do trabalho?",
  },
  {
    id: "crescimento",
    emoji: "🌱",
    label: "Crescimento",
    cor: "#D35400",
    placeholder1: "Em que estou evoluindo?",
    placeholder3: "Que versão de mim emergiu?",
    placeholder5: "Como sou diferente de hoje?",
  },
  {
    id: "espiritualidade",
    emoji: "🧘",
    label: "Espiritualidade",
    cor: "#7F8C8D",
    placeholder1: "Como me conecto comigo?",
    placeholder3: "Que prática sustento?",
    placeholder5: "Como me sinto em paz?",
  },
];

const PERGUNTAS_DIA: {
  id: keyof DiaPerfeito;
  emoji: string;
  titulo: string;
  placeholder: string;
  cor: string;
}[] = [
  {
    id: "acordar",
    emoji: "🌅",
    titulo: "Que horas acordo e como começo meu dia?",
    placeholder: "Descreva seu ritual matinal ideal — horário, rotina, sensação ao acordar...",
    cor: "#E67E22",
  },
  {
    id: "onde",
    emoji: "🏠",
    titulo: "Onde vivo e como é meu ambiente?",
    placeholder: "Cidade, tipo de moradia, decoração, o que vejo pela janela...",
    cor: "#2980B9",
  },
  {
    id: "trabalho",
    emoji: "💼",
    titulo: "Como é meu trabalho neste dia perfeito?",
    placeholder: "O que faço, como faço, com quem trabalho, onde trabalho...",
    cor: "#8E44AD",
  },
  {
    id: "pessoas",
    emoji: "🤝",
    titulo: "Que pessoas me cercam neste dia?",
    placeholder: "Família, amigos, colegas — quem está presente e como são essas relações...",
    cor: "#E74C3C",
  },
  {
    id: "financeiro",
    emoji: "💰",
    titulo: "Como é minha situação financeira?",
    placeholder: "Quanto ganho, como gasto, que liberdade financeira tenho, o que posso fazer...",
    cor: "#27AE60",
  },
  {
    id: "cuidado",
    emoji: "💪",
    titulo: "Como cuido do meu corpo e mente?",
    placeholder: "Exercícios, alimentação, sono, meditação, hobbies que me recarregam...",
    cor: "#16A085",
  },
  {
    id: "sentimento",
    emoji: "✨",
    titulo: "Como me sinto ao final do dia?",
    placeholder: "Qual é a sensação predominante? O que me dá satisfação? Do que me orgulho?",
    cor: "#E0A55F",
  },
  {
    id: "ritual",
    emoji: "🌙",
    titulo: "Como é meu ritual noturno?",
    placeholder: "Como encerro o dia, o que reflito, como me preparo para o próximo...",
    cor: "#2C3E50",
  },
];

const ETAPAS = [
  { label: "Bem-vindo", descricao: "O que é Design da Vida?" },
  { label: "Meu Dia Perfeito", descricao: "8 perguntas para visualizar como seria um dia ideal." },
  { label: "Visão por Área", descricao: "8 dimensões da vida mapeadas em 1, 3 e 5 anos." },
  { label: "Porquê Profundo", descricao: "A razão que vai sustentar sua jornada." },
];

const INSTRUCOES: Record<number, { titulo: string; itens: string[] }> = {
  1: {
    titulo: "O que é Design da Vida?",
    itens: [
      "Uma metodologia para projetar intencionalmente sua vida ideal.",
      "Parte da imaginação vívida — sinta, não apenas pense.",
      "Combina horizonte de curto e longo prazo.",
      "O resultado é sua bússola para todas as decisões.",
    ],
  },
  2: {
    titulo: "Dia Perfeito",
    itens: [
      "Imagine que hoje é um dia perfeito — nada te impede.",
      "Escreva no presente, como se já fosse real.",
      "Seja específico: horários, lugares, pessoas, sensações.",
      "Não censure — deixe a visão fluir livremente.",
    ],
  },
  3: {
    titulo: "Visão por Área",
    itens: [
      "Defina como quer estar em 1, 3 e 5 anos em cada área.",
      "Seja concreto: números, posições, conquistas.",
      "As áreas se influenciam — pense no conjunto.",
      "Foque no que você mais quer transformar primeiro.",
    ],
  },
  4: {
    titulo: "Seu Porquê Profundo",
    itens: [
      "O porquê é o combustível que sustenta a jornada.",
      "Conecte sua visão a algo maior do que você mesmo.",
      "A declaração de visão é sua frase-âncora.",
      "Releia sempre que perder o rumo.",
    ],
  },
};

const COR_GOLD = "#E0A55F";
const COR_DARK = "#1E392A";

const AREAS_VISAO_INICIAL: VisaoAreas = Object.fromEntries(
  AREAS.map((a) => [a.id, { um: "", tres: "", cinco: "" }])
);

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function PerguntaDia({
  pergunta,
  valor,
  onChange,
}: {
  pergunta: (typeof PERGUNTAS_DIA)[0];
  valor: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        border: `1.5px solid ${valor.trim() ? pergunta.cor + "44" : "var(--color-brand-border)"}`,
        background: "#fff",
        boxShadow: "var(--shadow-card)",
        transition: "border-color 0.2s",
      }}
    >
      <div
        className="flex items-center gap-3 px-5 py-3"
        style={{
          background: valor.trim() ? `${pergunta.cor}0e` : "#fafafa",
          borderBottom: `1px solid ${valor.trim() ? pergunta.cor + "22" : "var(--color-brand-border)"}`,
          transition: "background 0.2s",
        }}
      >
        <div
          className="flex items-center justify-center rounded-xl shrink-0"
          style={{ width: 36, height: 36, background: `${pergunta.cor}18`, fontSize: 18 }}
        >
          {pergunta.emoji}
        </div>
        <p
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 16,
            fontWeight: 700,
            color: COR_DARK,
            lineHeight: 1.3,
          }}
        >
          {pergunta.titulo}
        </p>
        {valor.trim() && (
          <div
            className="ml-auto flex items-center justify-center rounded-full shrink-0"
            style={{ width: 20, height: 20, background: pergunta.cor }}
          >
            <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>✓</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <textarea
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder={pergunta.placeholder}
          className="w-full resize-none rounded-xl p-3 text-sm outline-none transition-all duration-200"
          style={{
            border: `1.5px solid ${pergunta.cor}22`,
            background: `${pergunta.cor}05`,
            color: COR_DARK,
            fontFamily: "var(--font-body)",
            lineHeight: 1.65,
            minHeight: 88,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = pergunta.cor;
            e.target.style.boxShadow = `0 0 0 3px ${pergunta.cor}18`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = `${pergunta.cor}22`;
            e.target.style.boxShadow = "none";
          }}
        />
      </div>
    </div>
  );
}

function TabelaAreas({
  visao,
  onUpdate,
}: {
  visao: VisaoAreas;
  onUpdate: (id: string, horizonte: keyof HorizonteArea, valor: string) => void;
}) {
  const horizontes: { key: keyof HorizonteArea; label: string; cor: string; desc: string }[] = [
    { key: "um", label: "1 Ano", cor: "#27AE60", desc: "Conquistas próximas" },
    { key: "tres", label: "3 Anos", cor: "#E0A55F", desc: "Transformação real" },
    { key: "cinco", label: "5 Anos", cor: "#8E44AD", desc: "Versão ideal" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Header horizontes */}
      <div
        className="grid rounded-xl overflow-hidden"
        style={{ gridTemplateColumns: "160px repeat(3, 1fr)", gap: 0 }}
      >
        <div style={{ background: `${COR_DARK}06`, padding: "10px 16px" }} />
        {horizontes.map((h) => (
          <div
            key={h.key}
            className="flex flex-col items-center py-3"
            style={{ background: `${h.cor}12`, borderLeft: `1px solid ${h.cor}22` }}
          >
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 16,
                fontWeight: 700,
                color: h.cor,
              }}
            >
              {h.label}
            </span>
            <span style={{ fontSize: 10, color: "var(--color-brand-gray)", marginTop: 2 }}>
              {h.desc}
            </span>
          </div>
        ))}
      </div>

      {/* Linhas por área */}
      {AREAS.map((area) => {
        const v = visao[area.id];
        const preenchida = v.um.trim() || v.tres.trim() || v.cinco.trim();
        return (
          <div
            key={area.id}
            className="grid rounded-2xl overflow-hidden"
            style={{
              gridTemplateColumns: "160px repeat(3, 1fr)",
              border: `1.5px solid ${preenchida ? area.cor + "33" : "var(--color-brand-border)"}`,
              background: "#fff",
              boxShadow: "var(--shadow-card)",
              transition: "border-color 0.2s",
            }}
          >
            {/* Label área */}
            <div
              className="flex flex-col items-start justify-center gap-1 px-4 py-4"
              style={{
                background: `${area.cor}0c`,
                borderRight: `1px solid ${area.cor}22`,
              }}
            >
              <span style={{ fontSize: 22 }}>{area.emoji}</span>
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 13,
                  fontWeight: 700,
                  color: area.cor,
                }}
              >
                {area.label}
              </span>
            </div>

            {/* Células de horizonte */}
            {horizontes.map((h, hi) => (
              <div
                key={h.key}
                className="p-3"
                style={{ borderLeft: hi > 0 ? "1px solid var(--color-brand-border)" : "none" }}
              >
                <textarea
                  value={v[h.key]}
                  onChange={(e) => onUpdate(area.id, h.key, e.target.value)}
                  placeholder={
                    h.key === "um"
                      ? area.placeholder1
                      : h.key === "tres"
                      ? area.placeholder3
                      : area.placeholder5
                  }
                  className="w-full resize-none rounded-lg p-2 text-xs outline-none transition-all duration-200"
                  style={{
                    border: `1.5px solid ${h.cor}22`,
                    background: v[h.key].trim() ? `${h.cor}06` : "#fafafa",
                    color: COR_DARK,
                    fontFamily: "var(--font-body)",
                    lineHeight: 1.5,
                    minHeight: 72,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = h.cor;
                    e.target.style.background = `${h.cor}08`;
                    e.target.style.boxShadow = `0 0 0 2px ${h.cor}18`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = `${h.cor}22`;
                    e.target.style.background = v[h.key].trim() ? `${h.cor}06` : "#fafafa";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function CampoPorque({
  emoji,
  titulo,
  placeholder,
  valor,
  onChange,
  cor,
  destaque,
}: {
  emoji: string;
  titulo: string;
  placeholder: string;
  valor: string;
  onChange: (v: string) => void;
  cor: string;
  destaque?: boolean;
}) {
  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        border: `${destaque ? "2px" : "1.5px"} solid ${cor}${destaque ? "55" : "33"}`,
        background: "#fff",
        boxShadow: destaque ? `0 4px 20px ${cor}22` : "var(--shadow-card)",
      }}
    >
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{
          background: `${cor}${destaque ? "14" : "0e"}`,
          borderBottom: `1px solid ${cor}22`,
        }}
      >
        <span style={{ fontSize: 22 }}>{emoji}</span>
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: destaque ? 16 : 15,
            fontWeight: 700,
            color: COR_DARK,
          }}
        >
          {titulo}
        </h3>
        {destaque && (
          <span
            className="ml-auto"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 10,
              fontWeight: 600,
              color: cor,
              background: `${cor}18`,
              padding: "2px 8px",
              borderRadius: 99,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Declaração final
          </span>
        )}
      </div>
      <div className="p-5">
        <textarea
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full resize-none rounded-xl p-4 outline-none transition-all duration-200"
          style={{
            border: `1.5px solid ${cor}33`,
            background: `${cor}06`,
            color: COR_DARK,
            fontFamily: destaque ? "var(--font-heading)" : "var(--font-body)",
            fontSize: destaque ? 15 : 14,
            lineHeight: 1.7,
            minHeight: destaque ? 80 : 110,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = cor;
            e.target.style.boxShadow = `0 0 0 3px ${cor}18`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = `${cor}33`;
            e.target.style.boxShadow = "none";
          }}
        />
      </div>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function DesignVidaPage() {
  const [passo, setPasso] = useState(0);
  const [dia, setDia] = useState<DiaPerfeito>({
    acordar: "",
    onde: "",
    trabalho: "",
    pessoas: "",
    financeiro: "",
    cuidado: "",
    sentimento: "",
    ritual: "",
  });
  const [visao, setVisao] = useState<VisaoAreas>(AREAS_VISAO_INICIAL);
  const [porque, setPorque] = useState<PorqueProundo>({
    porqueImporta: "",
    quemBeneficia: "",
    seBuscar: "",
    declaracao: "",
  });

  const updateDia = (campo: keyof DiaPerfeito, valor: string) =>
    setDia((prev) => ({ ...prev, [campo]: valor }));

  const updateVisao = (id: string, horizonte: keyof HorizonteArea, valor: string) =>
    setVisao((prev) => ({
      ...prev,
      [id]: { ...prev[id], [horizonte]: valor },
    }));

  const updatePorque = (campo: keyof PorqueProundo, valor: string) =>
    setPorque((prev) => ({ ...prev, [campo]: valor }));

  const diaPreenchidos = Object.values(dia).filter((v) => v.trim().length > 10).length;
  const areasPreenchidas = AREAS.filter((a) => {
    const v = visao[a.id];
    return v.um.trim() || v.tres.trim() || v.cinco.trim();
  }).length;
  const porquePreenchidos = Object.values(porque).filter((v) => v.trim().length > 10).length;

  const progresso =
    passo === 0
      ? 0
      : passo === 1
      ? Math.round((diaPreenchidos / 8) * 33)
      : passo === 2
      ? 33 + Math.round((areasPreenchidas / 8) * 34)
      : 67 + Math.round((porquePreenchidos / 4) * 33);

  const podeAvancar = () => {
    if (passo === 0) return true;
    if (passo === 1) return diaPreenchidos >= 4;
    if (passo === 2) return areasPreenchidas >= 3;
    return true;
  };

  const instrucao = INSTRUCOES[passo + 1];

  const painelResumo = (
    <>
      <div className="flex flex-col gap-1">
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 15,
            fontWeight: 700,
            color: COR_DARK,
          }}
        >
          Sua Visão
        </h3>
        <p style={{ fontSize: 13, color: "var(--color-brand-gray)" }}>
          Resumo em construção
        </p>
      </div>

      {/* Declaração de visão em destaque */}
      {porque.declaracao.trim() && (
        <div
          className="rounded-xl p-4"
          style={{ background: COR_DARK, border: "none" }}
        >
          <p style={{ fontSize: 10, fontWeight: 600, color: COR_GOLD, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Declaração de Visão
          </p>
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 13,
              color: "#F4F1DE",
              lineHeight: 1.6,
              fontStyle: "italic",
            }}
          >
            &ldquo;{porque.declaracao}&rdquo;
          </p>
        </div>
      )}

      {/* Dia perfeito — highlights */}
      {diaPreenchidos > 0 && (
        <div
          className="flex flex-col gap-3 rounded-xl p-4"
          style={{ background: `${COR_DARK}06`, border: `1px solid ${COR_DARK}12` }}
        >
          <div className="flex items-center justify-between">
            <p style={{ fontFamily: "var(--font-heading)", fontSize: 13, fontWeight: 700, color: COR_DARK }}>
              Dia Perfeito
            </p>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                fontWeight: 700,
                color: COR_GOLD,
                background: "rgba(224,165,95,0.15)",
                padding: "2px 8px",
                borderRadius: 99,
              }}
            >
              {diaPreenchidos}/8
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PERGUNTAS_DIA.filter((p) => dia[p.id].trim().length > 10).map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1"
                style={{ background: `${p.cor}14`, border: `1px solid ${p.cor}25` }}
              >
                <span style={{ fontSize: 11 }}>{p.emoji}</span>
                <span style={{ fontSize: 10, color: p.cor, fontWeight: 600 }}>
                  {p.titulo.split(" ").slice(0, 3).join(" ")}…
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Áreas */}
      {areasPreenchidas > 0 && (
        <div
          className="flex flex-col gap-3 rounded-xl p-4"
          style={{ background: `${COR_DARK}06`, border: `1px solid ${COR_DARK}12` }}
        >
          <div className="flex items-center justify-between">
            <p style={{ fontFamily: "var(--font-heading)", fontSize: 13, fontWeight: 700, color: COR_DARK }}>
              Áreas Mapeadas
            </p>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                fontWeight: 700,
                color: COR_GOLD,
                background: "rgba(224,165,95,0.15)",
                padding: "2px 8px",
                borderRadius: 99,
              }}
            >
              {areasPreenchidas}/8
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {AREAS.map((area) => {
              const v = visao[area.id];
              const tem = v.um.trim() || v.tres.trim() || v.cinco.trim();
              const horizontes = [v.um, v.tres, v.cinco].filter((h) => h.trim()).length;
              return (
                <div key={area.id} className="flex items-center gap-2">
                  <span style={{ fontSize: 14, opacity: tem ? 1 : 0.3 }}>{area.emoji}</span>
                  <span
                    style={{
                      fontSize: 13,
                      color: tem ? COR_DARK : "var(--color-brand-gray)",
                      fontWeight: tem ? 600 : 400,
                      flex: 1,
                    }}
                  >
                    {area.label}
                  </span>
                  {tem && (
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="rounded-sm"
                          style={{
                            width: 6,
                            height: 6,
                            background: i < horizontes
                              ? (i === 0 ? "#27AE60" : i === 1 ? COR_GOLD : "#8E44AD")
                              : "var(--color-brand-border)",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 mt-1">
            {[
              { cor: "#27AE60", label: "1 ano" },
              { cor: COR_GOLD, label: "3 anos" },
              { cor: "#8E44AD", label: "5 anos" },
            ].map((h) => (
              <div key={h.label} className="flex items-center gap-1">
                <div className="rounded-sm" style={{ width: 6, height: 6, background: h.cor }} />
                <span style={{ fontSize: 9, color: "var(--color-brand-gray)" }}>{h.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Porquê */}
      {(porque.porqueImporta || porque.quemBeneficia || porque.seBuscar) && (
        <div
          className="flex flex-col gap-3 rounded-xl p-4"
          style={{ background: `${COR_GOLD}10`, border: `1px solid ${COR_GOLD}33` }}
        >
          <p style={{ fontFamily: "var(--font-heading)", fontSize: 13, fontWeight: 700, color: COR_DARK }}>
            Porquê Profundo
          </p>
          {[
            { emoji: "❤️", campo: porque.porqueImporta, label: "Por que importa" },
            { emoji: "🌍", campo: porque.quemBeneficia, label: "Quem se beneficia" },
            { emoji: "⚠️", campo: porque.seBuscar, label: "Custo de não agir" },
          ]
            .filter((i) => i.campo.trim())
            .map((i) => (
              <div key={i.label} className="flex items-start gap-2">
                <span style={{ fontSize: 13, flexShrink: 0 }}>{i.emoji}</span>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 600, color: COR_GOLD, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
                    {i.label}
                  </p>
                  <p style={{ fontSize: 13, color: "var(--color-brand-gray)", lineHeight: 1.4 }}>
                    {i.campo.length > 80 ? i.campo.slice(0, 80) + "…" : i.campo}
                  </p>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Estado vazio */}
      {diaPreenchidos === 0 && areasPreenchidas === 0 && !porque.declaracao && (
        <div
          className="flex flex-col items-center gap-3 rounded-xl p-6 text-center"
          style={{ border: "1.5px dashed var(--color-brand-border)" }}
        >
          <span style={{ fontSize: 32 }}>🔮</span>
          <p style={{ fontSize: 15, color: "var(--color-brand-gray)", lineHeight: 1.5 }}>
            Sua visão vai tomar forma aqui conforme você preenche.
          </p>
        </div>
      )}
    </>
  );

  return (
    <FerramentaLayout
      codigo="F05"
      nome="Design da Vida Ideal"
      descricao="Projete intencionalmente sua vida ideal em 1, 3 e 5 anos."
      etapas={ETAPAS}
      etapaAtual={passo}
      progresso={progresso}
      onAvancar={() => setPasso((p) => Math.min(ETAPAS.length - 1, p + 1))}
      onVoltar={() => setPasso((p) => Math.max(0, p - 1))}
      podeAvancar={podeAvancar()}
      labelAvancar={passo === 0 ? "Começar →" : passo === ETAPAS.length - 1 ? "Salvar Visão ✓" : "Continuar →"}
      resumo={painelResumo}
  respostas={{ dia, visao, porque }}
    >
      <div className="p-8">

        {/* Instrução da etapa */}
        {instrucao && (
          <div
            className="flex flex-col gap-3 rounded-xl p-4 mb-6"
            style={{ background: `${COR_DARK}06`, border: `1px solid ${COR_DARK}12` }}
          >
            <p style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: COR_DARK }}>
              {instrucao.titulo}
            </p>
            <ul className="flex flex-col gap-2">
              {instrucao.itens.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span style={{ color: COR_GOLD, fontSize: 15, marginTop: 1, flexShrink: 0 }}>→</span>
                  <span style={{ fontSize: 15, color: "var(--color-brand-gray)", lineHeight: 1.5 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Passo 0 — Bem-vindo */}
        {passo === 0 && (
          <div className="flex flex-col gap-8 max-w-2xl mx-auto">
            <div className="flex flex-col gap-3">
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  fontWeight: 600,
                  color: COR_GOLD,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Ferramenta F05
              </span>
              <h1
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(28px, 4vw, 40px)",
                  fontWeight: 700,
                  color: COR_DARK,
                  lineHeight: 1.15,
                }}
              >
                Design da{" "}
                <span style={{ color: COR_GOLD, fontStyle: "italic" }}>Vida Ideal</span>
              </h1>
              <p
                style={{
                  fontSize: 15,
                  color: "var(--color-brand-gray)",
                  lineHeight: 1.7,
                  maxWidth: 520,
                }}
              >
                Grandes vidas não acontecem por acidente — elas são projetadas. Esta ferramenta te ajuda a construir uma visão vívida e concreta do que você quer criar, e conectar essa visão ao porquê que vai te manter no caminho.
              </p>
            </div>

            {/* 3 blocos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { emoji: "🌅", titulo: "Dia Perfeito", desc: "8 perguntas para visualizar como seria um dia ideal na sua vida.", cor: "#E67E22" },
                { emoji: "🗺️", titulo: "Visão por Área", desc: "8 dimensões da vida mapeadas em 1, 3 e 5 anos.", cor: "#2980B9" },
                { emoji: "❤️", titulo: "Porquê Profundo", desc: "A razão que vai sustentar sua jornada nos momentos difíceis.", cor: "#E74C3C" },
              ].map((b) => (
                <div
                  key={b.titulo}
                  className="flex flex-col gap-3 rounded-2xl p-5"
                  style={{ background: `${b.cor}0e`, border: `1.5px solid ${b.cor}25` }}
                >
                  <span style={{ fontSize: 24 }}>{b.emoji}</span>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: COR_DARK }}>
                    {b.titulo}
                  </h3>
                  <p style={{ fontSize: 15, color: "var(--color-brand-gray)", lineHeight: 1.5 }}>{b.desc}</p>
                </div>
              ))}
            </div>

            {/* Citação */}
            <div
              className="rounded-2xl p-6 relative overflow-hidden"
              style={{ background: `${COR_DARK}`, border: "none" }}
            >
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
                style={{ background: COR_GOLD, transform: "translate(30%, -30%)" }}
              />
              <p
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 20,
                  fontStyle: "italic",
                  color: "#F4F1DE",
                  lineHeight: 1.6,
                  position: "relative",
                }}
              >
                &ldquo;Se você não sabe para onde vai, qualquer caminho serve. Mas se você sabe com clareza, o caminho se revela.&rdquo;
              </p>
              <p style={{ fontSize: 15, color: COR_GOLD, marginTop: 12, fontWeight: 600, position: "relative" }}>
                Design da Vida — A Virada
              </p>
            </div>

            {/* Tempo */}
            <div
              className="flex items-center gap-4 rounded-xl p-4"
              style={{ background: `${COR_GOLD}12`, border: `1px solid ${COR_GOLD}33` }}
            >
              <span style={{ fontSize: 20 }}>⏱️</span>
              <div>
                <p style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 700, color: COR_DARK }}>
                  45–60 minutos
                </p>
                <p style={{ fontSize: 15, color: "var(--color-brand-gray)" }}>
                  Reserve um tempo sem interrupções. Vale um café e um caderno ao lado.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Passo 1 — Dia Perfeito */}
        {passo === 1 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 24,
                  fontWeight: 700,
                  color: COR_DARK,
                }}
              >
                Meu Dia Perfeito
              </h2>
              <p style={{ fontSize: 15, color: "var(--color-brand-gray)" }}>
                Imagine que hoje é um dia perfeito. Escreva no <strong style={{ color: COR_DARK }}>presente</strong>, como se já fosse real. Mínimo{" "}
                <strong style={{ color: COR_DARK }}>4 perguntas</strong> para continuar.
              </p>
            </div>

            {diaPreenchidos > 0 && (
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: "rgba(39,174,96,0.08)", border: "1px solid rgba(39,174,96,0.25)" }}
              >
                <span style={{ fontSize: 16 }}>✅</span>
                <p style={{ fontSize: 15, color: "#27AE60", fontWeight: 600 }}>
                  {diaPreenchidos}/8 perguntas respondidas
                  {diaPreenchidos < 4 ? ` — responda mais ${4 - diaPreenchidos} para continuar` : " — você pode continuar!"}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-4">
              {PERGUNTAS_DIA.map((pergunta) => (
                <PerguntaDia
                  key={pergunta.id}
                  pergunta={pergunta}
                  valor={dia[pergunta.id]}
                  onChange={(v) => updateDia(pergunta.id, v)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Passo 2 — Visão por Área */}
        {passo === 2 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 24,
                  fontWeight: 700,
                  color: COR_DARK,
                }}
              >
                Visão por Área de Vida
              </h2>
              <p style={{ fontSize: 15, color: "var(--color-brand-gray)" }}>
                Para cada área, escreva onde quer estar em <strong style={{ color: "#27AE60" }}>1 ano</strong>,{" "}
                <strong style={{ color: COR_GOLD }}>3 anos</strong> e{" "}
                <strong style={{ color: "#8E44AD" }}>5 anos</strong>. Mínimo{" "}
                <strong style={{ color: COR_DARK }}>3 áreas</strong> para continuar.
              </p>
            </div>

            {areasPreenchidas > 0 && (
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: "rgba(39,174,96,0.08)", border: "1px solid rgba(39,174,96,0.25)" }}
              >
                <span style={{ fontSize: 16 }}>✅</span>
                <p style={{ fontSize: 15, color: "#27AE60", fontWeight: 600 }}>
                  {areasPreenchidas}/8 áreas preenchidas
                  {areasPreenchidas < 3 ? ` — preencha mais ${3 - areasPreenchidas} para continuar` : " — você pode continuar!"}
                </p>
              </div>
            )}

            <TabelaAreas visao={visao} onUpdate={updateVisao} />
          </div>
        )}

        {/* Passo 3 — Porquê Profundo */}
        {passo === 3 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 24,
                  fontWeight: 700,
                  color: COR_DARK,
                }}
              >
                Meu Porquê Profundo
              </h2>
              <p style={{ fontSize: 15, color: "var(--color-brand-gray)" }}>
                Conecte sua visão ao que realmente importa. O porquê é o que sustenta a jornada nos momentos difíceis.
              </p>
            </div>

            <CampoPorque
              emoji="❤️"
              titulo="Por que esta visão importa para mim?"
              placeholder="Vá além do óbvio. Por que, no fundo, você quer isso? O que muda em você quando alcança?"
              valor={porque.porqueImporta}
              onChange={(v) => updatePorque("porqueImporta", v)}
              cor="#E74C3C"
            />
            <CampoPorque
              emoji="🌍"
              titulo="Quem se beneficia quando eu vivo esta visão?"
              placeholder="Família, equipe, comunidade, pessoas que você nem conhece — quem ganha quando você se torna essa versão?"
              valor={porque.quemBeneficia}
              onChange={(v) => updatePorque("quemBeneficia", v)}
              cor="#2980B9"
            />
            <CampoPorque
              emoji="⚠️"
              titulo="O que acontece se eu não buscar esta visão?"
              placeholder="Seja honesto. Qual é o custo de não agir? Quem perde, o que se perde, como você se sentirá em 5 anos?"
              valor={porque.seBuscar}
              onChange={(v) => updatePorque("seBuscar", v)}
              cor="#E67E22"
            />
            <CampoPorque
              emoji="⭐"
              titulo="Minha declaração de visão em 1 frase"
              placeholder="Em [prazo], eu serei [quem], fazendo [o quê], para [quem/por quê]."
              valor={porque.declaracao}
              onChange={(v) => updatePorque("declaracao", v)}
              cor={COR_GOLD}
              destaque
            />
          </div>
        )}
      </div>
    </FerramentaLayout>
  );
}
