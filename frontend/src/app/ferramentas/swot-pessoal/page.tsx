'use client';

import { useState, useEffect } from "react";
import FerramentaLayout from "@/components/dashboard/FerramentaLayout";
import { useCarregarRespostas } from "@/lib/useCarregarRespostas";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Quadrante = {
  texto: string;
};

type SwotData = {
  forcas: Quadrante;
  fraquezas: Quadrante;
  oportunidades: Quadrante;
  ameacas: Quadrante;
};

type Estrategias = {
  fo: string; // Força + Oportunidade
  wo: string; // Fraqueza + Oportunidade
  ft: string; // Força + Ameaça
  wt: string; // Fraqueza + Ameaça
};

// ─── Constantes ──────────────────────────────────────────────────────────────

const ETAPAS = [
  { label: "Bem-vindo",                descricao: "Introdução à ferramenta" },
  { label: "Forças e Fraquezas",       descricao: "Fatores internos" },
  { label: "Oportunidades e Ameaças",  descricao: "Fatores externos" },
  { label: "Matriz de Ação",           descricao: "Estratégias concretas" },
];

const INSTRUCOES: Record<number, { titulo: string; itens: string[] }> = {
  1: {
    titulo: "O que é o SWOT Pessoal?",
    itens: [
      "Uma análise estratégica adaptada para o autoconhecimento.",
      "Mapeie suas forças internas e fraquezas a superar.",
      "Identifique oportunidades externas e ameaças ao seu crescimento.",
      "Transforme os dados em estratégias de ação concretas.",
    ],
  },
  2: {
    titulo: "Forças e Fraquezas",
    itens: [
      "Forças: o que você faz excepcionalmente bem?",
      "Fraquezas: onde você sabe que pode melhorar?",
      "Seja honesto — a autoconsciência é sua maior força.",
      "Liste pelo menos 3 itens em cada quadrante.",
    ],
  },
  3: {
    titulo: "Oportunidades e Ameaças",
    itens: [
      "Oportunidades: o que o ambiente oferece a você agora?",
      "Ameaças: o que pode dificultar seu progresso?",
      "Pense em tendências, pessoas e contextos externos.",
      "Seja específico — evite respostas genéricas.",
    ],
  },
  4: {
    titulo: "Matriz de Ação",
    itens: [
      "FO: use suas forças para capturar oportunidades.",
      "FrO: supere fraquezas aproveitando oportunidades.",
      "FA: use forças para neutralizar ameaças.",
      "FrA: minimize fraquezas e evite ameaças.",
    ],
  },
};

const PERGUNTAS = {
  forcas: [
    "Quais habilidades me diferenciam dos outros?",
    "O que as pessoas costumam me elogiar?",
    "Quais conquistas me deixam mais orgulhoso(a)?",
    "Que recursos (conhecimento, rede, saúde) tenho à disposição?",
    "Onde sou consistente mesmo sob pressão?",
  ],
  fraquezas: [
    "Em que área eu frequentemente topo com obstáculos?",
    "O que eu evito fazer por insegurança ou despreparo?",
    "Quais hábitos negativos me travam?",
    "O que eu gostaria de melhorar, mas ainda não priorizei?",
    "Onde sinto que meu desempenho fica abaixo do esperado?",
  ],
  oportunidades: [
    "Quais tendências do meu setor posso aproveitar?",
    "Que conexões ou mentores ainda não explorei?",
    "Que janelas de crescimento se abriram recentemente?",
    "Que recursos externos estão disponíveis para mim?",
    "O que mudou no mercado que posso usar a meu favor?",
  ],
  ameacas: [
    "O que no meu ambiente pode bloquear meu avanço?",
    "Quais concorrentes ou obstáculos posso enfrentar?",
    "Que mudanças externas me preocupam?",
    "O que poderia me tirar o foco ou a energia?",
    "Que riscos estou ignorando no momento?",
  ],
};

const COR_FORCAS = "#27AE60";
const COR_FRAQUEZAS = "#E74C3C";
const COR_OPORTUNIDADES = "#2980B9";
const COR_AMEACAS = "#E67E22";
const COR_GOLD = "#E0A55F";
const COR_DARK = "#1E392A";

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function QuadranteEditor({
  titulo,
  cor,
  emoji,
  perguntas,
  valor,
  onChange,
}: {
  titulo: string;
  cor: string;
  emoji: string;
  perguntas: string[];
  valor: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden h-full"
      style={{ border: `1.5px solid ${cor}33`, background: "#fff", boxShadow: "var(--shadow-card)" }}
    >
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3" style={{ background: `${cor}12`, borderBottom: `1px solid ${cor}22` }}>
        <span style={{ fontSize: 22 }}>{emoji}</span>
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 20,
            fontWeight: 700,
            color: cor,
          }}
        >
          {titulo}
        </h3>
      </div>

      {/* Perguntas */}
      <div className="px-5 py-4 flex flex-col gap-2">
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--color-brand-gray)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
          Perguntas guiadoras
        </p>
        <ul className="flex flex-col gap-1.5">
          {perguntas.map((p, i) => (
            <li key={i} className="flex items-start gap-2">
              <span style={{ color: cor, fontWeight: 700, fontSize: 15, marginTop: 1, flexShrink: 0 }}>•</span>
              <span style={{ fontSize: 15, color: "var(--color-brand-gray)", lineHeight: 1.5 }}>{p}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Textarea */}
      <div className="px-5 pb-5 flex-1 flex flex-col">
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--color-brand-gray)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
          Suas respostas
        </p>
        <textarea
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Escreva sobre suas ${titulo.toLowerCase()} aqui — uma por linha...`}
          className="flex-1 resize-none rounded-xl p-3 text-sm outline-none transition-all duration-200"
          style={{
            border: `1.5px solid ${cor}33`,
            background: `${cor}06`,
            color: "var(--color-brand-dark-green)",
            fontFamily: "var(--font-body)",
            lineHeight: 1.6,
            minHeight: 140,
          }}
          onFocus={(e) => { e.target.style.borderColor = cor; e.target.style.boxShadow = `0 0 0 3px ${cor}18`; }}
          onBlur={(e) => { e.target.style.borderColor = `${cor}33`; e.target.style.boxShadow = "none"; }}
        />
      </div>
    </div>
  );
}

function EstrategiaCard({
  titulo,
  subtitulo,
  cor,
  valor,
  onChange,
}: {
  titulo: string;
  subtitulo: string;
  cor: string;
  valor: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{ border: `1.5px solid ${cor}33`, background: "#fff", boxShadow: "var(--shadow-card)" }}
    >
      <div className="px-5 py-3 flex items-center gap-3" style={{ background: `${cor}12`, borderBottom: `1px solid ${cor}22` }}>
        <div
          className="flex items-center justify-center rounded-lg font-bold"
          style={{ width: 32, height: 32, background: cor, color: "#fff", fontFamily: "var(--font-heading)", fontSize: 12 }}
        >
          {titulo}
        </div>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--color-brand-gray)", lineHeight: 1.4 }}>
          {subtitulo}
        </span>
      </div>
      <div className="p-4">
        <textarea
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Descreva sua estratégia..."
          className="w-full resize-none rounded-xl p-3 text-sm outline-none transition-all duration-200"
          style={{
            border: `1.5px solid ${cor}33`,
            background: `${cor}06`,
            color: "var(--color-brand-dark-green)",
            fontFamily: "var(--font-body)",
            lineHeight: 1.6,
            minHeight: 90,
          }}
          onFocus={(e) => { e.target.style.borderColor = cor; e.target.style.boxShadow = `0 0 0 3px ${cor}18`; }}
          onBlur={(e) => { e.target.style.borderColor = `${cor}33`; e.target.style.boxShadow = "none"; }}
        />
      </div>
    </div>
  );
}

function MiniQuadrante({
  titulo,
  cor,
  emoji,
  texto,
}: {
  titulo: string;
  cor: string;
  emoji: string;
  texto: string;
}) {
  const linhas = texto.trim().split("\n").filter((l) => l.trim().length > 0);
  const preview = linhas.slice(0, 3);

  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden"
      style={{ border: `1.5px solid ${cor}2a`, background: "#fff" }}
    >
      <div className="px-3 py-2 flex items-center gap-2" style={{ background: `${cor}10`, borderBottom: `1px solid ${cor}1a` }}>
        <span style={{ fontSize: 14 }}>{emoji}</span>
        <span style={{ fontFamily: "var(--font-heading)", fontSize: 12, fontWeight: 700, color: cor }}>
          {titulo}
        </span>
        {linhas.length > 0 && (
          <span
            className="ml-auto"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              background: cor,
              color: "#fff",
              borderRadius: 99,
              padding: "1px 6px",
              fontWeight: 600,
            }}
          >
            {linhas.length}
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1">
        {preview.length === 0 ? (
          <p style={{ fontSize: 11, color: "var(--color-brand-gray)", fontStyle: "italic" }}>Não preenchido ainda</p>
        ) : (
          preview.map((l, i) => (
            <p key={i} className="flex items-start gap-1.5">
              <span style={{ color: cor, fontWeight: 700, fontSize: 10, marginTop: 1 }}>•</span>
              <span style={{ fontSize: 11, color: "var(--color-brand-dark-green)", lineHeight: 1.4 }}>
                {l.length > 50 ? l.slice(0, 50) + "…" : l}
              </span>
            </p>
          ))
        )}
        {linhas.length > 3 && (
          <p style={{ fontSize: 10, color: "var(--color-brand-gray)", fontStyle: "italic" }}>+{linhas.length - 3} itens</p>
        )}
      </div>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function SwotPessoalPage() {
  const [passo, setPasso] = useState(0);
  const [swot, setSwot] = useState<SwotData>({
    forcas: { texto: "" },
    fraquezas: { texto: "" },
    oportunidades: { texto: "" },
    ameacas: { texto: "" },
  });
  const [estrategias, setEstrategias] = useState<Estrategias>({ fo: "", wo: "", ft: "", wt: "" });

  const { dados: dadosSalvos } = useCarregarRespostas("swot-pessoal");
  useEffect(() => { if (!dadosSalvos) return; if ((dadosSalvos as any).swot) setSwot((dadosSalvos as any).swot); if ((dadosSalvos as any).estrategias) setEstrategias((dadosSalvos as any).estrategias); }, [dadosSalvos]);

  const update = (quad: keyof SwotData, texto: string) =>
    setSwot((prev) => ({ ...prev, [quad]: { texto } }));

  const progresso = Math.round((passo / 3) * 100);

  const podeAvancar = () => {
    if (passo === 0) return true;
    if (passo === 1) return swot.forcas.texto.trim().length > 10 && swot.fraquezas.texto.trim().length > 10;
    if (passo === 2) return swot.oportunidades.texto.trim().length > 10 && swot.ameacas.texto.trim().length > 10;
    return true;
  };

  const instrucao = INSTRUCOES[passo + 1];

  const totalItens =
    swot.forcas.texto.split("\n").filter((l) => l.trim()).length +
    swot.fraquezas.texto.split("\n").filter((l) => l.trim()).length +
    swot.oportunidades.texto.split("\n").filter((l) => l.trim()).length +
    swot.ameacas.texto.split("\n").filter((l) => l.trim()).length;

  // ── Painel direito (resumo) ───────────────────────────────────────────────

  const painelResumo = (
    <>
      {/* Quadrantes mini */}
      <div className="flex flex-col gap-3">
        <MiniQuadrante titulo="Forças" cor={COR_FORCAS} emoji="💪" texto={swot.forcas.texto} />
        <MiniQuadrante titulo="Fraquezas" cor={COR_FRAQUEZAS} emoji="🎯" texto={swot.fraquezas.texto} />
        <MiniQuadrante titulo="Oportunidades" cor={COR_OPORTUNIDADES} emoji="🌱" texto={swot.oportunidades.texto} />
        <MiniQuadrante titulo="Ameaças" cor={COR_AMEACAS} emoji="⚡" texto={swot.ameacas.texto} />
      </div>

      {/* Completude */}
      {totalItens > 0 && (
        <div
          className="flex flex-col gap-3 rounded-xl p-4"
          style={{ background: `${COR_DARK}06`, border: `1px solid ${COR_DARK}12` }}
        >
          <p style={{ fontFamily: "var(--font-heading)", fontSize: 13, fontWeight: 700, color: COR_DARK }}>
            Preenchimento
          </p>
          {[
            { label: "Forças", texto: swot.forcas.texto, cor: COR_FORCAS },
            { label: "Fraquezas", texto: swot.fraquezas.texto, cor: COR_FRAQUEZAS },
            { label: "Oportunidades", texto: swot.oportunidades.texto, cor: COR_OPORTUNIDADES },
            { label: "Ameaças", texto: swot.ameacas.texto, cor: COR_AMEACAS },
          ].map((q) => {
            const itens = q.texto.split("\n").filter((l) => l.trim()).length;
            const pct = Math.min(100, Math.round((itens / 5) * 100));
            return (
              <div key={q.label} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 13, color: "var(--color-brand-gray)" }}>{q.label}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: q.cor, fontWeight: 600 }}>
                    {itens}/5
                  </span>
                </div>
                <div
                  className="rounded-full overflow-hidden"
                  style={{ height: 4, background: `${q.cor}18` }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: q.cor }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Estratégias mini */}
      {passo === 3 && (estrategias.fo || estrategias.wo || estrategias.ft || estrategias.wt) && (
        <div
          className="flex flex-col gap-3 rounded-xl p-4"
          style={{ background: `${COR_GOLD}10`, border: `1px solid ${COR_GOLD}33` }}
        >
          <p style={{ fontFamily: "var(--font-heading)", fontSize: 13, fontWeight: 700, color: COR_DARK }}>
            Estratégias definidas
          </p>
          {[
            { sigla: "FO", texto: estrategias.fo, cor: COR_FORCAS },
            { sigla: "FrO", texto: estrategias.wo, cor: COR_OPORTUNIDADES },
            { sigla: "FA", texto: estrategias.ft, cor: COR_AMEACAS },
            { sigla: "FrA", texto: estrategias.wt, cor: COR_FRAQUEZAS },
          ]
            .filter((e) => e.texto.trim())
            .map((e) => (
              <div key={e.sigla} className="flex items-start gap-2">
                <div
                  className="flex items-center justify-center rounded shrink-0"
                  style={{ width: 22, height: 22, background: e.cor, color: "#fff", fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 700, marginTop: 1 }}
                >
                  {e.sigla}
                </div>
                <p style={{ fontSize: 13, color: "var(--color-brand-gray)", lineHeight: 1.4 }}>
                  {e.texto.length > 80 ? e.texto.slice(0, 80) + "…" : e.texto}
                </p>
              </div>
            ))}
        </div>
      )}

      {/* Estado vazio */}
      {totalItens === 0 && (
        <div
          className="flex flex-col items-center gap-3 rounded-xl p-6 text-center"
          style={{ border: `1.5px dashed var(--color-brand-border)` }}
        >
          <span style={{ fontSize: 32 }}>⚡</span>
          <p style={{ fontSize: 15, color: "var(--color-brand-gray)", lineHeight: 1.5 }}>
            Seu SWOT vai aparecer aqui conforme você preenche.
          </p>
        </div>
      )}
    </>
  );

  return (
    <FerramentaLayout
      codigo="F03"
      nome="SWOT Pessoal"
      descricao="Análise estratégica completa das suas forças, fraquezas, oportunidades e ameaças."
      etapas={ETAPAS}
      etapaAtual={passo}
      progresso={progresso}
      onAvancar={() => podeAvancar() && setPasso((p) => Math.min(3, p + 1))}
      onVoltar={() => setPasso((p) => Math.max(0, p - 1))}
      podeAvancar={podeAvancar()}
      totalItens={totalItens}
      labelItens="itens"
      resumo={painelResumo}
  respostas={{ swot, estrategias }}
    >
      <div className="p-8">

        {/* Instrução contextual */}
        <div
          className="max-w-2xl mx-auto mb-6 flex flex-col gap-3 rounded-xl p-4"
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
                Ferramenta F03
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
                SWOT{" "}
                <span style={{ color: COR_GOLD, fontStyle: "italic" }}>Pessoal</span>
              </h1>
              <p
                style={{
                  fontSize: 15,
                  color: "var(--color-brand-gray)",
                  lineHeight: 1.7,
                  maxWidth: 520,
                }}
              >
                A análise SWOT — Forças, Fraquezas, Oportunidades e Ameaças — é uma das ferramentas mais poderosas da estratégia empresarial, agora aplicada ao seu desenvolvimento pessoal.
              </p>
            </div>

            {/* Quadrantes intro */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { cor: COR_FORCAS, emoji: "💪", titulo: "Forças", desc: "Seus diferenciais e pontos fortes internos." },
                { cor: COR_FRAQUEZAS, emoji: "🎯", titulo: "Fraquezas", desc: "Limitações e pontos a desenvolver." },
                { cor: COR_OPORTUNIDADES, emoji: "🌱", titulo: "Oportunidades", desc: "Fatores externos favoráveis ao seu crescimento." },
                { cor: COR_AMEACAS, emoji: "⚡", titulo: "Ameaças", desc: "Riscos e desafios externos a antecipar." },
              ].map((q) => (
                <div
                  key={q.titulo}
                  className="flex flex-col gap-2 rounded-2xl p-5"
                  style={{ background: `${q.cor}10`, border: `1.5px solid ${q.cor}25` }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 20 }}>{q.emoji}</span>
                    <span
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: 18,
                        fontWeight: 700,
                        color: q.cor,
                      }}
                    >
                      {q.titulo}
                    </span>
                  </div>
                  <p style={{ fontSize: 15, color: "var(--color-brand-gray)", lineHeight: 1.5 }}>{q.desc}</p>
                </div>
              ))}
            </div>

            {/* Tempo estimado */}
            <div
              className="flex items-center gap-4 rounded-xl p-4"
              style={{ background: `${COR_GOLD}12`, border: `1px solid ${COR_GOLD}33` }}
            >
              <span style={{ fontSize: 20 }}>⏱️</span>
              <div>
                <p style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 700, color: COR_DARK }}>
                  30–45 minutos
                </p>
                <p style={{ fontSize: 15, color: "var(--color-brand-gray)" }}>
                  Recomendado: em um lugar tranquilo, sem distrações.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Passo 1 — Forças e Fraquezas */}
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
                Forças e Fraquezas
              </h2>
              <p style={{ fontSize: 15, color: "var(--color-brand-gray)" }}>
                Fatores <strong style={{ color: COR_DARK }}>internos</strong> — o que você controla.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <QuadranteEditor
                titulo="Forças"
                cor={COR_FORCAS}
                emoji="💪"
                perguntas={PERGUNTAS.forcas}
                valor={swot.forcas.texto}
                onChange={(v) => update("forcas", v)}
              />
              <QuadranteEditor
                titulo="Fraquezas"
                cor={COR_FRAQUEZAS}
                emoji="🎯"
                perguntas={PERGUNTAS.fraquezas}
                valor={swot.fraquezas.texto}
                onChange={(v) => update("fraquezas", v)}
              />
            </div>
          </div>
        )}

        {/* Passo 2 — Oportunidades e Ameaças */}
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
                Oportunidades e Ameaças
              </h2>
              <p style={{ fontSize: 15, color: "var(--color-brand-gray)" }}>
                Fatores <strong style={{ color: COR_DARK }}>externos</strong> — o que o ambiente oferece ou impõe.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <QuadranteEditor
                titulo="Oportunidades"
                cor={COR_OPORTUNIDADES}
                emoji="🌱"
                perguntas={PERGUNTAS.oportunidades}
                valor={swot.oportunidades.texto}
                onChange={(v) => update("oportunidades", v)}
              />
              <QuadranteEditor
                titulo="Ameaças"
                cor={COR_AMEACAS}
                emoji="⚡"
                perguntas={PERGUNTAS.ameacas}
                valor={swot.ameacas.texto}
                onChange={(v) => update("ameacas", v)}
              />
            </div>
          </div>
        )}

        {/* Passo 3 — Matriz de Ação */}
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
                Matriz de Ação
              </h2>
              <p style={{ fontSize: 15, color: "var(--color-brand-gray)" }}>
                Combine os quadrantes para criar <strong style={{ color: COR_DARK }}>estratégias concretas</strong>.
              </p>
            </div>

            {/* Legenda */}
            <div className="flex flex-wrap gap-3">
              {[
                { sigla: "FO", desc: "Força × Oportunidade", cor: COR_FORCAS },
                { sigla: "FrO", desc: "Fraqueza × Oportunidade", cor: COR_OPORTUNIDADES },
                { sigla: "FA", desc: "Força × Ameaça", cor: COR_AMEACAS },
                { sigla: "FrA", desc: "Fraqueza × Ameaça", cor: COR_FRAQUEZAS },
              ].map((l) => (
                <div key={l.sigla} className="flex items-center gap-2">
                  <div
                    className="flex items-center justify-center rounded-lg font-bold"
                    style={{ width: 28, height: 28, background: l.cor, color: "#fff", fontSize: 10, fontFamily: "var(--font-mono)" }}
                  >
                    {l.sigla}
                  </div>
                  <span style={{ fontSize: 15, color: "var(--color-brand-gray)" }}>{l.desc}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <EstrategiaCard
                titulo="FO"
                subtitulo="Use suas forças para capturar oportunidades"
                cor={COR_FORCAS}
                valor={estrategias.fo}
                onChange={(v) => setEstrategias((p) => ({ ...p, fo: v }))}
              />
              <EstrategiaCard
                titulo="FrO"
                subtitulo="Supere fraquezas aproveitando oportunidades"
                cor={COR_OPORTUNIDADES}
                valor={estrategias.wo}
                onChange={(v) => setEstrategias((p) => ({ ...p, wo: v }))}
              />
              <EstrategiaCard
                titulo="FA"
                subtitulo="Use forças para neutralizar ameaças"
                cor={COR_AMEACAS}
                valor={estrategias.ft}
                onChange={(v) => setEstrategias((p) => ({ ...p, ft: v }))}
              />
              <EstrategiaCard
                titulo="FrA"
                subtitulo="Minimize fraquezas e evite ameaças"
                cor={COR_FRAQUEZAS}
                valor={estrategias.wt}
                onChange={(v) => setEstrategias((p) => ({ ...p, wt: v }))}
              />
            </div>
          </div>
        )}
      </div>
    </FerramentaLayout>
  );
}
