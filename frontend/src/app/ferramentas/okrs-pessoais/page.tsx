'use client';

import { useState, useEffect } from "react";
import FerramentaLayout from "@/components/dashboard/FerramentaLayout";
import { useCarregarRespostas } from "@/lib/useCarregarRespostas";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type KeyResult = {
  descricao: string;
  meta: string;
  atual: string;
  unidade: string;
  prazo: string;
};

type Objetivo = {
  texto: string;
  emoji: string;
  krs: [KeyResult, KeyResult, KeyResult];
};

type Semana = {
  feito: string;
  aprendizado: string;
};

// ─── Constantes ──────────────────────────────────────────────────────────────

const TRIMESTRES = ["Q1 2026", "Q2 2026", "Q3 2026", "Q4 2026"];

const EMOJIS_OBJETIVO = ["🎯", "🚀", "💡"];
const CORES_OBJETIVO = ["#27AE60", "#2980B9", "#8E44AD"];

const KR_VAZIO = (): KeyResult => ({
  descricao: "",
  meta: "",
  atual: "",
  unidade: "",
  prazo: "",
});

const OBJETIVO_VAZIO = (i: number): Objetivo => ({
  texto: "",
  emoji: EMOJIS_OBJETIVO[i],
  krs: [KR_VAZIO(), KR_VAZIO(), KR_VAZIO()],
});

const SEMANA_VAZIA = (): Semana => ({ feito: "", aprendizado: "" });

const ETAPAS = [
  { label: "Bem-vindo", descricao: "O que são OKRs?" },
  { label: "Meus Objetivos", descricao: "Objetivos trimestrais qualitativos." },
  { label: "Resultados-Chave", descricao: "Key Results mensuráveis por objetivo." },
  { label: "Progresso Semanal", descricao: "Check-in de 5 minutos por semana." },
];

const INSTRUCOES: Record<number, { titulo: string; itens: string[] }> = {
  1: {
    titulo: "O que são OKRs?",
    itens: [
      "OKR = Objective + Key Results.",
      "Objective: onde quero chegar (qualitativo, inspirador).",
      "Key Results: como sei que cheguei lá (mensurável).",
      "Trimestral — 3 meses é o ciclo ideal.",
    ],
  },
  2: {
    titulo: "Bons Objetivos",
    itens: [
      "São qualitativos e inspiradores, não numéricos.",
      "Devem te tirar da zona de conforto.",
      "3 objetivos é o máximo — foco é tudo.",
      "Use verbos de ação: construir, lançar, transformar.",
    ],
  },
  3: {
    titulo: "Bons Key Results",
    itens: [
      "São específicos, mensuráveis e com prazo.",
      "3 KRs por objetivo — no máximo.",
      "O percentual é calculado automaticamente.",
      "70% de conclusão já é considerado ótimo no OKR.",
    ],
  },
  4: {
    titulo: "Check-in Semanal",
    itens: [
      "Registre o que avançou a cada semana.",
      "Atualize os valores atuais dos KRs.",
      "O aprendizado é tão importante quanto o número.",
      "Consistência semanal = resultado trimestral.",
    ],
  },
};

const COR_GOLD = "#E0A55F";
const COR_DARK = "#1E392A";
const SEMANAS_TOTAL = 8;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcPct(atual: string, meta: string): number {
  const a = parseFloat(atual);
  const m = parseFloat(meta);
  if (!m || isNaN(a) || isNaN(m) || m === 0) return 0;
  return Math.min(100, Math.round((a / m) * 100));
}

function pctCor(pct: number): string {
  if (pct >= 70) return "#27AE60";
  if (pct >= 40) return COR_GOLD;
  return "#E74C3C";
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function BarraProgresso({ pct, cor, altura = 6 }: { pct: number; cor: string; altura?: number }) {
  return (
    <div
      className="w-full rounded-full overflow-hidden"
      style={{ height: altura, background: "rgba(30,57,42,0.08)" }}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: cor }}
      />
    </div>
  );
}

function CardObjetivo({
  idx,
  obj,
  onChange,
}: {
  idx: number;
  obj: Objetivo;
  onChange: (o: Partial<Objetivo>) => void;
}) {
  const cor = CORES_OBJETIVO[idx];
  const filled = obj.texto.trim().length > 5;

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        border: `1.5px solid ${filled ? cor + "55" : "var(--color-brand-border)"}`,
        background: "#fff",
        boxShadow: filled ? `0 2px 16px ${cor}18` : "var(--shadow-card)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ background: `${cor}0e`, borderBottom: `1px solid ${cor}22` }}
      >
        <div
          className="flex items-center justify-center rounded-xl shrink-0"
          style={{ width: 40, height: 40, background: `${cor}20`, fontSize: 20 }}
        >
          {obj.emoji}
        </div>
        <div className="flex-1">
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              fontWeight: 700,
              color: cor,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Objetivo {idx + 1}
          </span>
          <p style={{ fontSize: 13, color: "var(--color-brand-gray)", marginTop: 1 }}>
            Qualitativo e inspirador
          </p>
        </div>
        {filled && (
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 22, height: 22, background: cor }}
          >
            <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>✓</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-5">
        <textarea
          value={obj.texto}
          onChange={(e) => onChange({ texto: e.target.value })}
          placeholder={[
            "Ex: Construir uma saúde física que me dê energia para viver plenamente",
            "Ex: Lançar meu negócio próprio e conquistar os primeiros clientes",
            "Ex: Me tornar referência na minha área de atuação",
          ][idx]}
          className="w-full resize-none rounded-xl p-4 outline-none transition-all duration-200"
          style={{
            border: `1.5px solid ${cor}22`,
            background: `${cor}05`,
            color: COR_DARK,
            fontFamily: "var(--font-heading)",
            fontSize: 15,
            lineHeight: 1.6,
            minHeight: 80,
          }}
          onFocus={(e) => { e.target.style.borderColor = cor; e.target.style.boxShadow = `0 0 0 3px ${cor}18`; }}
          onBlur={(e) => { e.target.style.borderColor = `${cor}22`; e.target.style.boxShadow = "none"; }}
        />
      </div>
    </div>
  );
}

function CardKRs({
  idx,
  obj,
  onUpdateKR,
}: {
  idx: number;
  obj: Objetivo;
  onUpdateKR: (krIdx: number, campo: Partial<KeyResult>) => void;
}) {
  const cor = CORES_OBJETIVO[idx];

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{ border: `1.5px solid ${cor}33`, background: "#fff", boxShadow: "var(--shadow-card)" }}
    >
      {/* Header objetivo */}
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ background: `${cor}0e`, borderBottom: `1px solid ${cor}22` }}
      >
        <span style={{ fontSize: 20 }}>{obj.emoji}</span>
        <div className="flex-1">
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              fontWeight: 700,
              color: cor,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            O{idx + 1}
          </span>
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 16,
              fontWeight: 700,
              color: COR_DARK,
              lineHeight: 1.3,
              marginTop: 2,
            }}
          >
            {obj.texto || "Objetivo não definido"}
          </p>
        </div>
      </div>

      {/* KRs */}
      <div className="divide-y" style={{ borderColor: "var(--color-brand-border)" }}>
        {obj.krs.map((kr, ki) => {
          const pct = calcPct(kr.atual, kr.meta);
          const krCor = pctCor(pct);
          const temDados = kr.descricao.trim() && kr.meta.trim();

          return (
            <div key={ki} className="p-5 flex flex-col gap-4">
              {/* Label KR */}
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center rounded-lg shrink-0"
                  style={{
                    width: 26,
                    height: 26,
                    background: `${cor}18`,
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    fontWeight: 700,
                    color: cor,
                  }}
                >
                  KR{ki + 1}
                </div>
                <span style={{ fontSize: 15, color: "var(--color-brand-gray)", fontWeight: 600 }}>
                  Key Result {ki + 1}
                </span>
                {temDados && (
                  <div className="ml-auto flex items-center gap-2">
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        fontWeight: 700,
                        color: krCor,
                      }}
                    >
                      {pct}%
                    </span>
                  </div>
                )}
              </div>

              {/* Descrição */}
              <input
                type="text"
                value={kr.descricao}
                onChange={(e) => onUpdateKR(ki, { descricao: e.target.value })}
                placeholder={`Ex: ${ki === 0 ? "Correr 5x por semana" : ki === 1 ? "Perder 8kg até o fim do trimestre" : "Dormir 7h+ por noite"}`}
                className="w-full rounded-xl px-4 py-3 outline-none transition-all duration-200"
                style={{
                  border: `1.5px solid ${cor}22`,
                  background: `${cor}05`,
                  color: COR_DARK,
                  fontFamily: "var(--font-body)",
                  fontSize: 16,
                }}
                onFocus={(e) => { e.target.style.borderColor = cor; e.target.style.boxShadow = `0 0 0 3px ${cor}18`; }}
                onBlur={(e) => { e.target.style.borderColor = `${cor}22`; e.target.style.boxShadow = "none"; }}
              />

              {/* Meta / Atual / Unidade / Prazo */}
              <div className="grid grid-cols-4 gap-3">
                {(
                  [
                    { campo: "meta", label: "Meta", placeholder: "100", tipo: "number" },
                    { campo: "atual", label: "Atual", placeholder: "0", tipo: "number" },
                    { campo: "unidade", label: "Unidade", placeholder: "kg / dias / R$", tipo: "text" },
                    { campo: "prazo", label: "Prazo", placeholder: "Mar/26", tipo: "text" },
                  ] as { campo: keyof KeyResult; label: string; placeholder: string; tipo: string }[]
                ).map(({ campo, label, placeholder, tipo }) => (
                  <div key={campo} className="flex flex-col gap-1">
                    <label
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--color-brand-gray)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {label}
                    </label>
                    <input
                      type={tipo}
                      value={kr[campo]}
                      onChange={(e) => onUpdateKR(ki, { [campo]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full rounded-lg px-3 py-2 outline-none transition-all duration-200"
                      style={{
                        border: `1.5px solid ${cor}22`,
                        background: "#fafafa",
                        color: COR_DARK,
                        fontFamily: "var(--font-mono)",
                        fontSize: 13,
                      }}
                      onFocus={(e) => { e.target.style.borderColor = cor; e.target.style.background = "#fff"; }}
                      onBlur={(e) => { e.target.style.borderColor = `${cor}22`; e.target.style.background = "#fafafa"; }}
                    />
                  </div>
                ))}
              </div>

              {/* Barra */}
              {temDados && (
                <div className="flex flex-col gap-1.5">
                  <BarraProgresso pct={pct} cor={krCor} altura={5} />
                  <div className="flex justify-between">
                    <span style={{ fontSize: 10, color: "var(--color-brand-gray)" }}>
                      {kr.atual || "0"} {kr.unidade} de {kr.meta} {kr.unidade}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: krCor }}>{pct}%</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TrackerSemanal({
  semanas,
  objetivos,
  onUpdate,
}: {
  semanas: Semana[];
  objetivos: Objetivo[];
  onUpdate: (semIdx: number, campo: Partial<Semana>) => void;
}) {
  const [semanaAberta, setSemanaAberta] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      {/* Mini-calendário de semanas */}
      <div className="grid grid-cols-8 gap-2">
        {semanas.map((sem, i) => {
          const preenchida = sem.feito.trim().length > 5;
          const ativa = semanaAberta === i;
          return (
            <button
              key={i}
              onClick={() => setSemanaAberta(i)}
              className="flex flex-col items-center gap-1 rounded-xl py-3 transition-all duration-200"
              style={{
                background: ativa ? COR_DARK : preenchida ? "rgba(39,174,96,0.1)" : "#fff",
                border: `1.5px solid ${ativa ? COR_DARK : preenchida ? "rgba(39,174,96,0.35)" : "var(--color-brand-border)"}`,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  fontWeight: 700,
                  color: ativa ? COR_GOLD : preenchida ? "#27AE60" : "var(--color-brand-gray)",
                }}
              >
                S{i + 1}
              </span>
              {preenchida && !ativa && (
                <div
                  className="rounded-full"
                  style={{ width: 5, height: 5, background: "#27AE60" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Painel da semana ativa */}
      <div
        className="flex flex-col gap-5 rounded-2xl p-6"
        style={{ border: "1.5px solid var(--color-brand-border)", background: "#fff", boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center justify-between">
          <h3
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 18,
              fontWeight: 700,
              color: COR_DARK,
            }}
          >
            Semana {semanaAberta + 1}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSemanaAberta((s) => Math.max(0, s - 1))}
              disabled={semanaAberta === 0}
              className="rounded-lg px-3 py-1.5 text-sm transition-all duration-150"
              style={{
                border: "1px solid var(--color-brand-border)",
                background: "transparent",
                color: semanaAberta === 0 ? "var(--color-brand-gray)" : COR_DARK,
                cursor: semanaAberta === 0 ? "default" : "pointer",
                opacity: semanaAberta === 0 ? 0.4 : 1,
              }}
            >
              ←
            </button>
            <button
              onClick={() => setSemanaAberta((s) => Math.min(SEMANAS_TOTAL - 1, s + 1))}
              disabled={semanaAberta === SEMANAS_TOTAL - 1}
              className="rounded-lg px-3 py-1.5 text-sm transition-all duration-150"
              style={{
                border: "1px solid var(--color-brand-border)",
                background: "transparent",
                color: semanaAberta === SEMANAS_TOTAL - 1 ? "var(--color-brand-gray)" : COR_DARK,
                cursor: semanaAberta === SEMANAS_TOTAL - 1 ? "default" : "pointer",
                opacity: semanaAberta === SEMANAS_TOTAL - 1 ? 0.4 : 1,
              }}
            >
              →
            </button>
          </div>
        </div>

        {/* O que fiz */}
        <div className="flex flex-col gap-2">
          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--color-brand-gray)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            ✅ O que avancei nesta semana
          </label>
          <textarea
            value={semanas[semanaAberta].feito}
            onChange={(e) => onUpdate(semanaAberta, { feito: e.target.value })}
            placeholder="Liste as ações concretas que você tomou em direção aos seus objetivos esta semana..."
            className="w-full resize-none rounded-xl p-4 outline-none transition-all duration-200"
            style={{
              border: "1.5px solid var(--color-brand-border)",
              background: "#fafafa",
              color: COR_DARK,
              fontFamily: "var(--font-body)",
              fontSize: 16,
              lineHeight: 1.65,
              minHeight: 110,
            }}
            onFocus={(e) => { e.target.style.borderColor = COR_DARK; e.target.style.background = "#fff"; e.target.style.boxShadow = `0 0 0 3px ${COR_DARK}10`; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--color-brand-border)"; e.target.style.background = "#fafafa"; e.target.style.boxShadow = "none"; }}
          />
        </div>

        {/* KRs snapshot */}
        <div className="flex flex-col gap-3">
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--color-brand-gray)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            📊 Status dos Key Results
          </p>
          <div className="flex flex-col gap-2">
            {objetivos.map((obj, oi) => {
              const cor = CORES_OBJETIVO[oi];
              const krsComMeta = obj.krs.filter((kr) => kr.descricao.trim() && kr.meta.trim());
              if (krsComMeta.length === 0) return null;
              return (
                <div key={oi} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 13 }}>{obj.emoji}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: cor }}>
                      {obj.texto ? obj.texto.slice(0, 40) + (obj.texto.length > 40 ? "…" : "") : `Objetivo ${oi + 1}`}
                    </span>
                  </div>
                  {obj.krs.map((kr, ki) => {
                    if (!kr.descricao.trim() || !kr.meta.trim()) return null;
                    const pct = calcPct(kr.atual, kr.meta);
                    const krCor = pctCor(pct);
                    return (
                      <div key={ki} className="flex items-center gap-3 pl-5">
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 9,
                            fontWeight: 700,
                            color: cor,
                            background: `${cor}15`,
                            padding: "1px 5px",
                            borderRadius: 4,
                            flexShrink: 0,
                          }}
                        >
                          KR{ki + 1}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--color-brand-gray)", flex: 1, lineHeight: 1.3 }}>
                          {kr.descricao.slice(0, 35)}{kr.descricao.length > 35 ? "…" : ""}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <div style={{ width: 60 }}>
                            <BarraProgresso pct={pct} cor={krCor} altura={4} />
                          </div>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: krCor, width: 32, textAlign: "right" }}>
                            {pct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {objetivos.every((o) => o.krs.every((kr) => !kr.meta.trim())) && (
              <p style={{ fontSize: 12, color: "var(--color-brand-gray)", fontStyle: "italic" }}>
                Defina os Key Results no passo anterior para acompanhar aqui.
              </p>
            )}
          </div>
        </div>

        {/* Aprendizado */}
        <div className="flex flex-col gap-2">
          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--color-brand-gray)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            💡 Maior aprendizado da semana
          </label>
          <textarea
            value={semanas[semanaAberta].aprendizado}
            onChange={(e) => onUpdate(semanaAberta, { aprendizado: e.target.value })}
            placeholder="O que você aprendeu sobre si mesmo, sobre o processo ou sobre seus objetivos?"
            className="w-full resize-none rounded-xl p-4 outline-none transition-all duration-200"
            style={{
              border: `1.5px solid ${COR_GOLD}33`,
              background: `${COR_GOLD}06`,
              color: COR_DARK,
              fontFamily: "var(--font-body)",
              fontSize: 16,
              lineHeight: 1.65,
              minHeight: 90,
            }}
            onFocus={(e) => { e.target.style.borderColor = COR_GOLD; e.target.style.boxShadow = `0 0 0 3px ${COR_GOLD}18`; }}
            onBlur={(e) => { e.target.style.borderColor = `${COR_GOLD}33`; e.target.style.boxShadow = "none"; }}
          />
        </div>
      </div>

      {/* Histórico resumido */}
      {semanas.some((s) => s.feito.trim()) && (
        <div
          className="flex flex-col gap-3 rounded-2xl p-5"
          style={{ border: "1px solid var(--color-brand-border)", background: "#fff" }}
        >
          <p style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 700, color: COR_DARK }}>
            Histórico de Check-ins
          </p>
          <div className="flex flex-col gap-3">
            {semanas.map((sem, i) => {
              if (!sem.feito.trim()) return null;
              return (
                <button
                  key={i}
                  onClick={() => setSemanaAberta(i)}
                  className="flex items-start gap-3 text-left rounded-xl p-3 transition-all duration-150"
                  style={{ background: semanaAberta === i ? `${COR_DARK}08` : "#fafafa", border: `1px solid ${semanaAberta === i ? COR_DARK + "22" : "transparent"}` }}
                >
                  <div
                    className="flex items-center justify-center rounded-lg shrink-0"
                    style={{ width: 28, height: 28, background: "#27AE6018", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#27AE60" }}
                  >
                    S{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 12, color: COR_DARK, lineHeight: 1.4 }}>
                      {sem.feito.slice(0, 80)}{sem.feito.length > 80 ? "…" : ""}
                    </p>
                    {sem.aprendizado.trim() && (
                      <p style={{ fontSize: 11, color: COR_GOLD, marginTop: 3 }}>
                        💡 {sem.aprendizado.slice(0, 50)}{sem.aprendizado.length > 50 ? "…" : ""}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function OKRsPessoaisPage() {
  const [passo, setPasso] = useState(0);
  const [trimestre, setTrimestre] = useState(TRIMESTRES[0]);
  const [objetivos, setObjetivos] = useState<Objetivo[]>([
    OBJETIVO_VAZIO(0),
    OBJETIVO_VAZIO(1),
    OBJETIVO_VAZIO(2),
  ]);
  const [semanas, setSemanas] = useState<Semana[]>(
    Array.from({ length: SEMANAS_TOTAL }, SEMANA_VAZIA)
  );

  const { dados: dadosSalvos } = useCarregarRespostas("okrs-pessoais");
  useEffect(() => { if (!dadosSalvos) return; if ((dadosSalvos as any).trimestre) setTrimestre((dadosSalvos as any).trimestre); if ((dadosSalvos as any).objetivos) setObjetivos((dadosSalvos as any).objetivos); if ((dadosSalvos as any).semanas) setSemanas((dadosSalvos as any).semanas); }, [dadosSalvos]);

  const updateObjetivo = (i: number, dados: Partial<Objetivo>) =>
    setObjetivos((prev) => prev.map((o, idx) => (idx === i ? { ...o, ...dados } : o)));

  const updateKR = (oi: number, ki: number, dados: Partial<KeyResult>) =>
    setObjetivos((prev) =>
      prev.map((o, idx) => {
        if (idx !== oi) return o;
        const krs = o.krs.map((kr, kidx) =>
          kidx === ki ? { ...kr, ...dados } : kr
        ) as [KeyResult, KeyResult, KeyResult];
        return { ...o, krs };
      })
    );

  const updateSemana = (i: number, dados: Partial<Semana>) =>
    setSemanas((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...dados } : s)));

  // Cálculos gerais
  const objPreenchidos = objetivos.filter((o) => o.texto.trim().length > 5).length;
  const krsComMeta = objetivos.flatMap((o) => o.krs).filter((kr) => kr.descricao.trim() && kr.meta.trim());
  const pctGeral =
    krsComMeta.length === 0
      ? 0
      : Math.round(
          krsComMeta.reduce((acc, kr) => acc + calcPct(kr.atual, kr.meta), 0) / krsComMeta.length
        );
  const semanasFeitas = semanas.filter((s) => s.feito.trim()).length;

  const progresso =
    passo === 0 ? 0
    : passo === 1 ? Math.round((objPreenchidos / 3) * 33)
    : passo === 2 ? 33 + Math.round((krsComMeta.length / 9) * 34)
    : 67 + Math.round((semanasFeitas / SEMANAS_TOTAL) * 33);

  const podeAvancar = () => {
    if (passo === 0) return true;
    if (passo === 1) return objPreenchidos >= 1;
    if (passo === 2) return krsComMeta.length >= 3;
    return true;
  };

  const instrucao = INSTRUCOES[passo + 1];

  // Próximos KRs a completar (< 100%)
  const proximosKRs = objetivos
    .flatMap((o, oi) =>
      o.krs.map((kr, ki) => ({ obj: o, kr, oi, ki, pct: calcPct(kr.atual, kr.meta) }))
    )
    .filter((item) => item.kr.descricao.trim() && item.kr.meta.trim() && item.pct < 100)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 4);

  const painelResumo = (
    <>
      <div className="flex flex-col gap-1">
        <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: COR_DARK }}>
          Painel {trimestre}
        </h3>
        <p style={{ fontSize: 11, color: "var(--color-brand-gray)" }}>Resumo em tempo real</p>
      </div>

      {/* Score geral */}
      {krsComMeta.length > 0 && (
        <div
          className="flex flex-col items-center gap-3 rounded-xl p-5"
          style={{ background: COR_DARK }}
        >
          <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(244,241,222,0.5)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Conclusão Geral
          </p>
          <div className="relative flex items-center justify-center">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="50" cy="50" r="40" stroke="rgba(244,241,222,0.1)" strokeWidth="8" fill="none" />
              <circle
                cx="50" cy="50" r="40"
                stroke={pctGeral >= 70 ? "#27AE60" : pctGeral >= 40 ? COR_GOLD : "#E74C3C"}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 * (1 - pctGeral / 100)}
                style={{ transition: "stroke-dashoffset 0.8s ease" }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span style={{ fontFamily: "var(--font-heading)", fontSize: 26, fontWeight: 700, color: "#F4F1DE", lineHeight: 1 }}>
                {pctGeral}%
              </span>
            </div>
          </div>
          <p style={{ fontSize: 11, color: pctGeral >= 70 ? "#27AE60" : pctGeral >= 40 ? COR_GOLD : "#E74C3C", fontWeight: 600 }}>
            {pctGeral >= 70 ? "Excelente progresso!" : pctGeral >= 40 ? "No caminho certo" : "Acelere o ritmo"}
          </p>
        </div>
      )}

      {/* Objetivos */}
      {objPreenchidos > 0 && (
        <div className="flex flex-col gap-3 rounded-xl p-4" style={{ background: `${COR_DARK}06`, border: `1px solid ${COR_DARK}12` }}>
          <p style={{ fontFamily: "var(--font-heading)", fontSize: 13, fontWeight: 700, color: COR_DARK }}>
            3 Objetivos
          </p>
          {objetivos.map((obj, oi) => {
            if (!obj.texto.trim()) return null;
            const cor = CORES_OBJETIVO[oi];
            const krsObj = obj.krs.filter((kr) => kr.descricao.trim() && kr.meta.trim());
            const pctObj = krsObj.length === 0 ? 0 : Math.round(krsObj.reduce((acc, kr) => acc + calcPct(kr.atual, kr.meta), 0) / krsObj.length);
            return (
              <div key={oi} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 14 }}>{obj.emoji}</span>
                  <p style={{ fontSize: 12, color: COR_DARK, fontWeight: 600, flex: 1, lineHeight: 1.3 }}>
                    {obj.texto.slice(0, 45)}{obj.texto.length > 45 ? "…" : ""}
                  </p>
                  {krsObj.length > 0 && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: pctCor(pctObj) }}>
                      {pctObj}%
                    </span>
                  )}
                </div>
                {krsObj.length > 0 && (
                  <BarraProgresso pct={pctObj} cor={cor} altura={4} />
                )}
                {krsObj.length > 0 && (
                  <div className="flex gap-2 flex-wrap pl-1">
                    {obj.krs.map((kr, ki) => {
                      if (!kr.descricao.trim() || !kr.meta.trim()) return null;
                      const p = calcPct(kr.atual, kr.meta);
                      return (
                        <span
                          key={ki}
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 9,
                            fontWeight: 700,
                            background: `${pctCor(p)}18`,
                            color: pctCor(p),
                            padding: "1px 6px",
                            borderRadius: 4,
                          }}
                        >
                          KR{ki + 1} {p}%
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Próximos KRs */}
      {proximosKRs.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl p-4" style={{ background: `${COR_GOLD}10`, border: `1px solid ${COR_GOLD}33` }}>
          <p style={{ fontFamily: "var(--font-heading)", fontSize: 13, fontWeight: 700, color: COR_DARK }}>
            Próximos a Completar
          </p>
          {proximosKRs.map((item, i) => {
            const cor = CORES_OBJETIVO[item.oi];
            return (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center rounded shrink-0"
                  style={{ width: 22, height: 22, background: `${cor}20`, fontFamily: "var(--font-mono)", fontSize: 8, fontWeight: 700, color: cor }}
                >
                  KR{item.ki + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 11, color: COR_DARK, lineHeight: 1.3 }}>
                    {item.kr.descricao.slice(0, 35)}{item.kr.descricao.length > 35 ? "…" : ""}
                  </p>
                  <div style={{ marginTop: 3 }}>
                    <BarraProgresso pct={item.pct} cor={pctCor(item.pct)} altura={3} />
                  </div>
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: pctCor(item.pct), flexShrink: 0 }}>
                  {item.pct}%
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Tracker */}
      {semanasFeitas > 0 && (
        <div className="flex flex-col gap-3 rounded-xl p-4" style={{ background: "rgba(39,174,96,0.06)", border: "1px solid rgba(39,174,96,0.2)" }}>
          <p style={{ fontFamily: "var(--font-heading)", fontSize: 13, fontWeight: 700, color: COR_DARK }}>
            Check-ins Realizados
          </p>
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5 flex-wrap">
              {semanas.map((s, i) => (
                <div
                  key={i}
                  className="rounded"
                  style={{
                    width: 14,
                    height: 14,
                    background: s.feito.trim() ? "#27AE60" : "rgba(30,57,42,0.08)",
                    fontSize: 0,
                  }}
                  title={`Semana ${i + 1}`}
                />
              ))}
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "#27AE60" }}>
              {semanasFeitas}/{SEMANAS_TOTAL}
            </span>
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {objPreenchidos === 0 && krsComMeta.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl p-6 text-center" style={{ border: "1.5px dashed var(--color-brand-border)" }}>
          <span style={{ fontSize: 32 }}>📊</span>
          <p style={{ fontSize: 15, color: "var(--color-brand-gray)", lineHeight: 1.5 }}>
            Seus OKRs vão aparecer aqui conforme você preenche.
          </p>
        </div>
      )}
    </>
  );

  return (
    <FerramentaLayout
      codigo="F06"
      nome="OKRs Pessoais"
      descricao="Objetivos trimestrais com resultados-chave mensuráveis."
      etapas={ETAPAS}
      etapaAtual={passo}
      progresso={progresso}
      onAvancar={() => setPasso((p) => Math.min(ETAPAS.length - 1, p + 1))}
      onVoltar={() => setPasso((p) => Math.max(0, p - 1))}
      podeAvancar={podeAvancar()}
      labelAvancar={passo === 0 ? "Começar →" : passo === ETAPAS.length - 1 ? "Salvar OKRs ✓" : "Continuar →"}
      resumo={painelResumo}
  respostas={{ trimestre, objetivos, semanas }}
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
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: COR_GOLD, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Ferramenta F06
              </span>
              <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, color: COR_DARK, lineHeight: 1.15 }}>
                OKRs{" "}
                <span style={{ color: COR_GOLD, fontStyle: "italic" }}>Pessoais</span>
              </h1>
              <p style={{ fontSize: 15, color: "var(--color-brand-gray)", lineHeight: 1.7, maxWidth: 520 }}>
                A metodologia OKR — usada por Google, Intel e Netflix — adaptada para sua vida pessoal. Defina onde quer chegar neste trimestre e meça o progresso semana a semana.
              </p>
            </div>

            {/* Anatomia do OKR */}
            <div
              className="rounded-2xl p-6 flex flex-col gap-5"
              style={{ background: `${COR_DARK}`, border: "none" }}
            >
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, color: COR_GOLD, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Anatomia de um OKR
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg px-3 py-1" style={{ background: "#27AE60", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "#fff" }}>O</div>
                    <p style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: "#F4F1DE" }}>Objective</p>
                  </div>
                  <p style={{ fontSize: 15, color: "rgba(244,241,222,0.65)", lineHeight: 1.5, paddingLeft: 48 }}>
                    &ldquo;Construir uma saúde física que me dê energia para viver plenamente&rdquo;
                  </p>
                </div>
                {[
                  { n: 1, texto: "Correr 3x por semana — meta: 36 vezes no trimestre" },
                  { n: 2, texto: "Perder 5kg — atual: 82kg, meta: 77kg" },
                  { n: 3, texto: "Dormir 7h+ — taxa de conformidade: meta 90%" },
                ].map((kr) => (
                  <div key={kr.n} className="flex items-start gap-3 pl-4">
                    <div
                      className="flex items-center justify-center rounded-lg shrink-0"
                      style={{ width: 28, height: 28, background: "rgba(224,165,95,0.2)", fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: COR_GOLD, marginTop: 1 }}
                    >
                      KR{kr.n}
                    </div>
                    <p style={{ fontSize: 15, color: "rgba(244,241,222,0.65)", lineHeight: 1.5 }}>{kr.texto}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Selecionar trimestre */}
            <div className="flex flex-col gap-3">
              <p style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: COR_DARK }}>
                Selecione o trimestre
              </p>
              <div className="grid grid-cols-4 gap-3">
                {TRIMESTRES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTrimestre(t)}
                    className="rounded-xl py-3 font-semibold transition-all duration-200"
                    style={{
                      background: trimestre === t ? COR_DARK : "#fff",
                      color: trimestre === t ? "#fff" : COR_DARK,
                      border: `1.5px solid ${trimestre === t ? COR_DARK : "var(--color-brand-border)"}`,
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl p-4" style={{ background: `${COR_GOLD}12`, border: `1px solid ${COR_GOLD}33` }}>
              <span style={{ fontSize: 20 }}>⏱️</span>
              <div>
                <p style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 700, color: COR_DARK }}>30–40 minutos</p>
                <p style={{ fontSize: 15, color: "var(--color-brand-gray)" }}>Para definir os OKRs. O tracker semanal leva 5 minutos por semana.</p>
              </div>
            </div>
          </div>
        )}

        {/* Passo 1 — Objetivos */}
        {passo === 1 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 700, color: COR_DARK }}>
                  Meus Objetivos — {trimestre}
                </h2>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    fontWeight: 700,
                    color: COR_DARK,
                    background: `${COR_DARK}10`,
                    padding: "3px 10px",
                    borderRadius: 99,
                  }}
                >
                  {objPreenchidos}/3
                </span>
              </div>
              <p style={{ fontSize: 15, color: "var(--color-brand-gray)" }}>
                Defina até 3 objetivos <strong style={{ color: COR_DARK }}>qualitativos e inspiradores</strong> para este trimestre. Mínimo 1 para continuar.
              </p>
            </div>
            <div className="flex flex-col gap-5">
              {objetivos.map((obj, i) => (
                <CardObjetivo key={i} idx={i} obj={obj} onChange={(d) => updateObjetivo(i, d)} />
              ))}
            </div>
          </div>
        )}

        {/* Passo 2 — Key Results */}
        {passo === 2 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 700, color: COR_DARK }}>
                  Resultados-Chave
                </h2>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    fontWeight: 700,
                    color: pctGeral >= 70 ? "#27AE60" : pctGeral >= 40 ? COR_GOLD : COR_DARK,
                    background: `${COR_DARK}10`,
                    padding: "3px 10px",
                    borderRadius: 99,
                  }}
                >
                  {krsComMeta.length} KRs definidos
                </span>
              </div>
              <p style={{ fontSize: 15, color: "var(--color-brand-gray)" }}>
                3 Key Results por objetivo — <strong style={{ color: COR_DARK }}>mensuráveis e com prazo</strong>. O percentual é calculado automaticamente. Mínimo 3 KRs para continuar.
              </p>
            </div>
            <div className="flex flex-col gap-6">
              {objetivos.map((obj, i) => (
                obj.texto.trim() && (
                  <CardKRs key={i} idx={i} obj={obj} onUpdateKR={(ki, d) => updateKR(i, ki, d)} />
                )
              ))}
              {objPreenchidos === 0 && (
                <div className="flex flex-col items-center gap-3 rounded-2xl p-10 text-center" style={{ border: "1.5px dashed var(--color-brand-border)" }}>
                  <span style={{ fontSize: 32 }}>📊</span>
                  <p style={{ fontSize: 16, color: "var(--color-brand-gray)" }}>Volte ao passo anterior e defina pelo menos 1 objetivo.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Passo 3 — Tracker Semanal */}
        {passo === 3 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 700, color: COR_DARK }}>
                  Progresso Semanal
                </h2>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    fontWeight: 700,
                    color: COR_DARK,
                    background: `${COR_DARK}10`,
                    padding: "3px 10px",
                    borderRadius: 99,
                  }}
                >
                  {semanasFeitas}/{SEMANAS_TOTAL} semanas
                </span>
              </div>
              <p style={{ fontSize: 15, color: "var(--color-brand-gray)" }}>
                Check-in semanal de{" "}
                <strong style={{ color: COR_DARK }}>5 minutos</strong>. Registre o que avançou e o maior aprendizado da semana.
              </p>
            </div>
            <TrackerSemanal semanas={semanas} objetivos={objetivos} onUpdate={updateSemana} />
          </div>
        )}
      </div>
    </FerramentaLayout>
  );
}
