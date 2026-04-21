'use client';

import { useState, useEffect } from "react";
import FerramentaLayout from "@/components/dashboard/FerramentaLayout";
import { useCarregarRespostas } from "@/lib/useCarregarRespostas";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Aspecto = {
  id: string;
  label: string;
  comoMeVejo: string;
  oQueDisseram: string;
  pontoCego: boolean | null;
};

type Insights = {
  maiorPontoCego: string;
  trabalharEm30Dias: string;
  fecharLoop: string;
};

// ─── Constantes ──────────────────────────────────────────────────────────────

const PERGUNTAS_IMAGINADO: Array<{
  id: string;
  emoji: string;
  perspectiva: string;
  cor: string;
  pergunta: string;
  placeholder: string;
}> = [
  {
    id: "amigo",
    emoji: "😊",
    perspectiva: "Seu melhor amigo",
    cor: "#27AE60",
    pergunta: "Como você acha que seu melhor amigo descreveria seu maior ponto forte?",
    placeholder:
      "Pense em como ele/ela realmente te vê. Quais palavras usaria para descrever o que faz você especial para as pessoas ao redor?",
  },
  {
    id: "lider",
    emoji: "📊",
    perspectiva: "Seu gestor ou líder",
    cor: "#8E44AD",
    pergunta: "O que seu gestor ou líder diria que precisa melhorar em você?",
    placeholder:
      "Com base no que você percebe nas reuniões, projetos e avaliações. O que ele/ela diria de forma honesta sobre o que te falta desenvolver?",
  },
  {
    id: "familia",
    emoji: "🏠",
    perspectiva: "Sua família",
    cor: "#E67E22",
    pergunta: "Como sua família descreveria como você lida com pressão?",
    placeholder:
      "O que eles diriam ao observar você sob estresse, prazo ou conflito? Quais padrões de comportamento eles reconheceriam?",
  },
  {
    id: "antigo",
    emoji: "⏳",
    perspectiva: "Alguém que te conhece há anos",
    cor: "#2980B9",
    pergunta: "O que alguém que te conhece há anos diria que é seu maior padrão limitante?",
    placeholder:
      "Aquele comportamento que se repete ao longo do tempo — que às vezes você mesmo reconhece. O que eles observariam com clareza por terem te acompanhado por tanto tempo?",
  },
  {
    id: "admirador",
    emoji: "✨",
    perspectiva: "Alguém que te admira",
    cor: "#C0392B",
    pergunta: "Como uma pessoa que te admira descreveria o impacto que você tem na vida das pessoas?",
    placeholder:
      "O que ela diria sobre a forma como você influencia, inspira ou transforma as pessoas ao seu redor? Quais palavras específicas usaria?",
  },
];

const ASPECTOS_INICIAIS: Aspecto[] = [
  { id: "ponto_forte",     label: "Ponto Forte Principal",  comoMeVejo: "", oQueDisseram: "", pontoCego: null },
  { id: "area_melhoria",   label: "Maior Oportunidade",     comoMeVejo: "", oQueDisseram: "", pontoCego: null },
  { id: "comunicacao",     label: "Comunicação",             comoMeVejo: "", oQueDisseram: "", pontoCego: null },
  { id: "lideranca",       label: "Influência / Liderança",  comoMeVejo: "", oQueDisseram: "", pontoCego: null },
  { id: "confiabilidade",  label: "Confiabilidade",          comoMeVejo: "", oQueDisseram: "", pontoCego: null },
  { id: "criatividade",    label: "Resolução de Problemas",  comoMeVejo: "", oQueDisseram: "", pontoCego: null },
  { id: "resiliencia",     label: "Resiliência",             comoMeVejo: "", oQueDisseram: "", pontoCego: null },
  { id: "relacionamentos", label: "Relacionamentos",         comoMeVejo: "", oQueDisseram: "", pontoCego: null },
];

const ETAPAS = [
  { label: "Bem-vindo",                descricao: "Introdução à ferramenta" },
  { label: "Feedback Imaginado",       descricao: "5 perspectivas revelam padrões" },
  { label: "Análise de Discrepâncias", descricao: "Compare percepções" },
  { label: "Insights e Ação",          descricao: "Transforme em compromissos" },
];

const INSTRUCOES: Record<number, { titulo: string; itens: string[] }> = {
  1: {
    titulo: "O que é o Feedback 360° Imaginado?",
    itens: [
      "Você se coloca no lugar de pessoas próximas e imagina o que cada uma diria sobre você.",
      "Estudos mostram que antecipar a perspectiva do outro ativa os mesmos mecanismos que ouvir o feedback real.",
      "O que você imagina que os outros veem é, em si mesmo, uma revelação sobre sua autoconsciência.",
      "5 perspectivas de contextos diferentes — o padrão que aparece em todas é o mais verdadeiro.",
    ],
  },
  2: {
    titulo: "Como responder o Feedback Imaginado",
    itens: [
      "Seja honesto(a) — imagine o que cada pessoa realmente diria, não o que você quer ouvir.",
      "Use palavras concretas: 'diria que sou [X]' ou 'observaria que tenho dificuldade com [Y]'.",
      "O desconforto em algumas respostas é normal — justamente aí está o aprendizado mais valioso.",
      "Responda pelo menos 2 perspectivas para continuar.",
    ],
  },
  3: {
    titulo: "Analisando Discrepâncias",
    itens: [
      "Para cada aspecto, descreva como você se vê e o que as perspectivas imaginadas revelaram.",
      "Discrepância = você se via de um jeito, mas as perspectivas mostram algo diferente.",
      "Pontos cegos são os mais valiosos — resistência a eles é normal e esperada.",
      "Pergunte: 'Em qual situação real esse padrão apareceu?' antes de marcar.",
    ],
  },
  4: {
    titulo: "Transformando em Ação",
    itens: [
      "O compromisso deve ter data, comportamento observável e sinal de sucesso.",
      "UMA mudança bem implementada vale mais que dez intenções vagas.",
      "Fechar o loop significa atualizar as pessoas próximas sobre o que você aprendeu.",
      "Feedback sem ação concreta e datada é apenas informação perecível.",
    ],
  },
};

const COR_GOLD = "#E0A55F";
const COR_DARK = "#1E392A";

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function TabelaDiscrepancias({
  aspectos,
  onUpdate,
}: {
  aspectos: Aspecto[];
  onUpdate: (id: string, campo: Partial<Aspecto>) => void;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid var(--color-brand-border)", background: "#fff", boxShadow: "var(--shadow-card)" }}
    >
      {/* Cabeçalho */}
      <div
        className="grid px-4 py-3"
        style={{
          gridTemplateColumns: "200px 1fr 1fr 100px",
          gap: 12,
          background: `${COR_DARK}06`,
          borderBottom: "1px solid var(--color-brand-border)",
        }}
      >
        {["Aspecto", "Como me vejo (situação concreta)", "O que as perspectivas revelaram", "Ponto Cego?"].map((h) => (
          <p
            key={h}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 10,
              fontWeight: 600,
              color: "var(--color-brand-gray)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {h}
          </p>
        ))}
      </div>

      {/* Linhas */}
      {aspectos.map((a, idx) => (
        <div
          key={a.id}
          className="grid items-start px-4 py-3"
          style={{
            gridTemplateColumns: "200px 1fr 1fr 100px",
            gap: 12,
            borderBottom: idx < aspectos.length - 1 ? "1px solid var(--color-brand-border)" : "none",
            background: a.pontoCego === true ? "rgba(231,76,60,0.04)" : "#fff",
          }}
        >
          <div className="flex items-center gap-2 pt-1">
            {a.pontoCego === true && (
              <div className="rounded-full shrink-0" style={{ width: 6, height: 6, background: "#E74C3C" }} />
            )}
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: COR_DARK, lineHeight: 1.3 }}>
              {a.label}
            </p>
          </div>

          <textarea
            value={a.comoMeVejo}
            onChange={(e) => onUpdate(a.id, { comoMeVejo: e.target.value })}
            placeholder="Em qual situação concreta você demonstrou isso? O que fez exatamente?"
            className="resize-none rounded-lg p-2 text-xs outline-none transition-all duration-200 w-full"
            style={{
              border: "1.5px solid var(--color-brand-border)",
              background: "#fafafa",
              color: COR_DARK,
              fontFamily: "var(--font-body)",
              lineHeight: 1.5,
              minHeight: 60,
            }}
            onFocus={(e) => { e.target.style.borderColor = COR_DARK; e.target.style.background = "#fff"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--color-brand-border)"; e.target.style.background = "#fafafa"; }}
          />

          <textarea
            value={a.oQueDisseram}
            onChange={(e) => onUpdate(a.id, { oQueDisseram: e.target.value })}
            placeholder="O que as perspectivas imaginadas revelaram sobre este aspecto? Qual padrão apareceu?"
            className="resize-none rounded-lg p-2 text-xs outline-none transition-all duration-200 w-full"
            style={{
              border: "1.5px solid var(--color-brand-border)",
              background: "#fafafa",
              color: COR_DARK,
              fontFamily: "var(--font-body)",
              lineHeight: 1.5,
              minHeight: 60,
            }}
            onFocus={(e) => { e.target.style.borderColor = COR_DARK; e.target.style.background = "#fff"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--color-brand-border)"; e.target.style.background = "#fafafa"; }}
          />

          <div className="flex flex-col items-center gap-2 pt-1">
            <button
              onClick={() => onUpdate(a.id, { pontoCego: a.pontoCego === true ? null : true })}
              className="w-full rounded-lg py-1.5 text-xs font-semibold transition-all duration-200"
              style={{
                background: a.pontoCego === true ? "#E74C3C" : "rgba(231,76,60,0.08)",
                color: a.pontoCego === true ? "#fff" : "#E74C3C",
                border: `1.5px solid ${a.pontoCego === true ? "#E74C3C" : "rgba(231,76,60,0.25)"}`,
                fontFamily: "var(--font-body)",
              }}
            >
              {a.pontoCego === true ? "✓ Sim" : "Sim"}
            </button>
            <button
              onClick={() => onUpdate(a.id, { pontoCego: a.pontoCego === false ? null : false })}
              className="w-full rounded-lg py-1.5 text-xs font-semibold transition-all duration-200"
              style={{
                background: a.pontoCego === false ? COR_DARK : `${COR_DARK}08`,
                color: a.pontoCego === false ? "#fff" : "var(--color-brand-gray)",
                border: `1.5px solid ${a.pontoCego === false ? COR_DARK : "var(--color-brand-border)"}`,
                fontFamily: "var(--font-body)",
              }}
            >
              {a.pontoCego === false ? "✓ Não" : "Não"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CampoInsight({
  emoji, titulo, placeholder, valor, onChange, cor,
}: {
  emoji: string;
  titulo: string;
  placeholder: string;
  valor: string;
  onChange: (v: string) => void;
  cor: string;
}) {
  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{ border: `1.5px solid ${cor}33`, background: "#fff", boxShadow: "var(--shadow-card)" }}
    >
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ background: `${cor}10`, borderBottom: `1px solid ${cor}22` }}
      >
        <span style={{ fontSize: 22 }}>{emoji}</span>
        <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: COR_DARK }}>
          {titulo}
        </h3>
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
            fontFamily: "var(--font-body)",
            fontSize: 16,
            lineHeight: 1.7,
            minHeight: 110,
          }}
          onFocus={(e) => { e.target.style.borderColor = cor; e.target.style.boxShadow = `0 0 0 3px ${cor}18`; }}
          onBlur={(e) => { e.target.style.borderColor = `${cor}33`; e.target.style.boxShadow = "none"; }}
        />
      </div>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function Feedback360Page() {
  const [passo, setPasso] = useState(0);

  const [feedbackImaginado, setFeedbackImaginado] = useState<Record<string, string>>(
    Object.fromEntries(PERGUNTAS_IMAGINADO.map((p) => [p.id, ""]))
  );
  const [aspectos, setAspectos] = useState<Aspecto[]>(ASPECTOS_INICIAIS);
  const [insights, setInsights] = useState<Insights>({
    maiorPontoCego: "",
    trabalharEm30Dias: "",
    fecharLoop: "",
  });

  const { dados: dadosSalvos } = useCarregarRespostas("feedback-360");
  useEffect(() => {
    if (!dadosSalvos) return;
    if ((dadosSalvos as any).feedbackImaginado) setFeedbackImaginado((dadosSalvos as any).feedbackImaginado);
    if ((dadosSalvos as any).aspectos) setAspectos((dadosSalvos as any).aspectos);
    if ((dadosSalvos as any).insights) setInsights((dadosSalvos as any).insights);
  }, [dadosSalvos]);

  const updateAspecto = (id: string, campo: Partial<Aspecto>) =>
    setAspectos((prev) => prev.map((a) => (a.id === id ? { ...a, ...campo } : a)));

  const imaginadosPreenchidos = PERGUNTAS_IMAGINADO.filter(
    (p) => feedbackImaginado[p.id].trim().length > 20
  ).length;

  const pontoCegosCount = aspectos.filter((a) => a.pontoCego === true).length;
  const aspectosPreenchidos = aspectos.filter((a) => a.comoMeVejo.trim() && a.oQueDisseram.trim()).length;

  const progresso = Math.round((passo / 3) * 100);

  const podeAvancar = () => {
    if (passo === 0) return true;
    if (passo === 1) return imaginadosPreenchidos >= 2;
    if (passo === 2) return aspectosPreenchidos >= 4;
    return true;
  };

  const instrucao = INSTRUCOES[passo + 1];

  // ── Painel direito ────────────────────────────────────────────────────────

  const painelResumo = (
    <>
      {/* Perspectivas imaginadas */}
      <div
        className="flex flex-col gap-3 rounded-xl p-4"
        style={{ background: `${COR_DARK}06`, border: `1px solid ${COR_DARK}12` }}
      >
        <div className="flex items-center justify-between">
          <p style={{ fontFamily: "var(--font-heading)", fontSize: 13, fontWeight: 700, color: COR_DARK }}>
            Perspectivas imaginadas
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
            {imaginadosPreenchidos}/5
          </span>
        </div>

        {PERGUNTAS_IMAGINADO.map((p) => {
          const ok = feedbackImaginado[p.id].trim().length > 20;
          return (
            <div key={p.id} className="flex items-center gap-2">
              <div
                className="flex items-center justify-center rounded-full shrink-0"
                style={{ width: 22, height: 22, background: ok ? p.cor : `${p.cor}18`, fontSize: ok ? 11 : 13 }}
              >
                {ok ? <span style={{ color: "#fff", fontWeight: 700 }}>✓</span> : p.emoji}
              </div>
              <div className="flex-1">
                <p style={{ fontSize: 13, color: ok ? COR_DARK : "var(--color-brand-gray)", fontWeight: ok ? 600 : 400 }}>
                  {p.perspectiva}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Discrepâncias */}
      {aspectosPreenchidos > 0 && (
        <div
          className="flex flex-col gap-3 rounded-xl p-4"
          style={{ background: "rgba(231,76,60,0.05)", border: "1px solid rgba(231,76,60,0.2)" }}
        >
          <p style={{ fontFamily: "var(--font-heading)", fontSize: 13, fontWeight: 700, color: COR_DARK }}>
            Discrepâncias
          </p>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 13, color: "var(--color-brand-gray)" }}>Aspectos analisados</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: COR_DARK }}>
              {aspectosPreenchidos}/8
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 13, color: "var(--color-brand-gray)" }}>Pontos cegos</span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                fontWeight: 700,
                color: pontoCegosCount > 0 ? "#E74C3C" : "var(--color-brand-gray)",
              }}
            >
              {pontoCegosCount}
            </span>
          </div>
          {pontoCegosCount > 0 && (
            <div className="flex flex-col gap-1 mt-1">
              {aspectos.filter((a) => a.pontoCego === true).map((a) => (
                <div key={a.id} className="flex items-center gap-1.5">
                  <div className="rounded-full shrink-0" style={{ width: 5, height: 5, background: "#E74C3C" }} />
                  <span style={{ fontSize: 13, color: "#E74C3C", fontWeight: 600 }}>{a.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Insights */}
      {(insights.maiorPontoCego || insights.trabalharEm30Dias || insights.fecharLoop) && (
        <div
          className="flex flex-col gap-3 rounded-xl p-4"
          style={{ background: `${COR_GOLD}10`, border: `1px solid ${COR_GOLD}33` }}
        >
          <p style={{ fontFamily: "var(--font-heading)", fontSize: 13, fontWeight: 700, color: COR_DARK }}>
            Insights registrados
          </p>
          {[
            { emoji: "🔍", campo: insights.maiorPontoCego, label: "Ponto cego" },
            { emoji: "🎯", campo: insights.trabalharEm30Dias, label: "Ação em 30 dias" },
            { emoji: "🤝", campo: insights.fecharLoop, label: "Fechar o loop" },
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
      {imaginadosPreenchidos === 0 && aspectosPreenchidos === 0 && !insights.maiorPontoCego && (
        <div
          className="flex flex-col items-center gap-3 rounded-xl p-6 text-center"
          style={{ border: "1.5px dashed var(--color-brand-border)" }}
        >
          <span style={{ fontSize: 32 }}>🪞</span>
          <p style={{ fontSize: 15, color: "var(--color-brand-gray)", lineHeight: 1.5 }}>
            Seu resumo vai aparecer aqui conforme você preenche.
          </p>
        </div>
      )}
    </>
  );

  return (
    <FerramentaLayout
      codigo="F04"
      nome="Feedback 360°"
      descricao="Imagine como as pessoas mais próximas te veem — e descubra seus padrões mais verdadeiros."
      etapas={ETAPAS}
      etapaAtual={passo}
      progresso={progresso}
      onAvancar={() => podeAvancar() && setPasso((p) => Math.min(3, p + 1))}
      onVoltar={() => setPasso((p) => Math.max(0, p - 1))}
      podeAvancar={podeAvancar()}
      totalItens={imaginadosPreenchidos}
      labelItens={imaginadosPreenchidos === 1 ? "perspectiva" : "perspectivas"}
      resumo={painelResumo}
      respostas={{ feedbackImaginado, aspectos, insights }}
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

        {/* ── Passo 0 — Bem-vindo ─────────────────────────────────────────── */}
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
                Ferramenta F04
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
                Feedback{" "}
                <span style={{ color: COR_GOLD, fontStyle: "italic" }}>Imaginado</span>
              </h1>
              <p
                style={{
                  fontSize: 15,
                  color: "var(--color-brand-gray)",
                  lineHeight: 1.7,
                  maxWidth: 520,
                }}
              >
                A versão mais honesta de quem você é vem de como você se enxerga pelos olhos das pessoas próximas.
                O Feedback Imaginado usa 5 perspectivas para revelar padrões que você não consegue ver sozinho.
              </p>
            </div>

            {/* Como funciona */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { num: "01", titulo: "Perspectivas", desc: "Se coloque no lugar de 5 pessoas do seu círculo e imagine o que diriam.", emoji: "🪞" },
                { num: "02", titulo: "Análise",      desc: "Compare sua autopercepção com as perspectivas que imaginou.", emoji: "🔍" },
                { num: "03", titulo: "Ação",          desc: "Transforme os padrões descobertos em compromissos concretos.", emoji: "🚀" },
              ].map((e) => (
                <div
                  key={e.num}
                  className="flex flex-col gap-3 rounded-2xl p-5"
                  style={{ background: `${COR_DARK}07`, border: `1px solid ${COR_DARK}12` }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 20 }}>{e.emoji}</span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        fontWeight: 700,
                        color: COR_GOLD,
                        background: "rgba(224,165,95,0.15)",
                        padding: "2px 7px",
                        borderRadius: 99,
                      }}
                    >
                      {e.num}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: COR_DARK }}>
                    {e.titulo}
                  </h3>
                  <p style={{ fontSize: 15, color: "var(--color-brand-gray)", lineHeight: 1.5 }}>{e.desc}</p>
                </div>
              ))}
            </div>

            {/* As 5 perspectivas */}
            <div className="flex flex-col gap-3">
              <p style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: COR_DARK }}>
                5 perspectivas que você vai imaginar
              </p>
              <div className="flex flex-wrap gap-2">
                {PERGUNTAS_IMAGINADO.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 rounded-xl px-3 py-2"
                    style={{ background: `${p.cor}12`, border: `1px solid ${p.cor}25` }}
                  >
                    <span style={{ fontSize: 14 }}>{p.emoji}</span>
                    <span style={{ fontSize: 15, color: p.cor, fontWeight: 600 }}>{p.perspectiva}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Princípio */}
            <div
              className="flex items-start gap-4 rounded-xl p-4"
              style={{ background: `${COR_GOLD}12`, border: `1px solid ${COR_GOLD}33` }}
            >
              <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
              <div>
                <p style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: COR_DARK, marginBottom: 4 }}>
                  O que se repete é o que é real
                </p>
                <p style={{ fontSize: 15, color: "var(--color-brand-gray)", lineHeight: 1.6 }}>
                  Quando o mesmo padrão aparece em perspectivas de contextos diferentes — amigo, família, trabalho — isso não é coincidência. É quem você realmente é.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Passo 1 — Feedback Imaginado ───────────────────────────────── */}
        {passo === 1 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 700, color: COR_DARK }}>
                Feedback Imaginado
              </h2>
              <p style={{ fontSize: 15, color: "var(--color-brand-gray)" }}>
                Para cada perspectiva, imagine o que essa pessoa <strong style={{ color: COR_DARK }}>realmente diria</strong> sobre você.
                Mínimo <strong style={{ color: COR_DARK }}>2 perspectivas</strong> para continuar.
              </p>
            </div>

            {imaginadosPreenchidos >= 2 && (
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: "rgba(39,174,96,0.08)", border: "1px solid rgba(39,174,96,0.25)" }}
              >
                <span style={{ fontSize: 16 }}>✅</span>
                <p style={{ fontSize: 15, color: "#27AE60", fontWeight: 600 }}>
                  {imaginadosPreenchidos} perspectiva{imaginadosPreenchidos > 1 ? "s" : ""} preenchida{imaginadosPreenchidos > 1 ? "s" : ""} — você pode continuar!
                </p>
              </div>
            )}

            <div className="flex flex-col gap-4">
              {PERGUNTAS_IMAGINADO.map((p) => {
                const val = feedbackImaginado[p.id];
                const preenchida = val.trim().length > 20;
                return (
                  <div
                    key={p.id}
                    className="flex flex-col rounded-2xl overflow-hidden"
                    style={{
                      border: `1.5px solid ${preenchida ? p.cor + "55" : "var(--color-brand-border)"}`,
                      background: "#fff",
                      boxShadow: preenchida ? `0 2px 12px ${p.cor}18` : "var(--shadow-card)",
                    }}
                  >
                    {/* Header */}
                    <div
                      className="flex items-center gap-3 px-5 py-4"
                      style={{ background: preenchida ? `${p.cor}0e` : "#fafafa", borderBottom: `1px solid ${p.cor}22` }}
                    >
                      <div
                        className="flex items-center justify-center rounded-xl shrink-0"
                        style={{ width: 40, height: 40, background: `${p.cor}18`, fontSize: 20 }}
                      >
                        {p.emoji}
                      </div>
                      <div className="flex-1">
                        <p style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 700, color: "var(--color-brand-gray)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          {p.perspectiva}
                        </p>
                        <p style={{ fontSize: 15, fontWeight: 600, color: COR_DARK, marginTop: 2, lineHeight: 1.4 }}>
                          {p.pergunta}
                        </p>
                      </div>
                      {preenchida && (
                        <div
                          className="flex items-center justify-center rounded-full shrink-0"
                          style={{ width: 22, height: 22, background: p.cor }}
                        >
                          <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>
                        </div>
                      )}
                    </div>

                    {/* Textarea */}
                    <div className="p-5">
                      <textarea
                        value={val}
                        onChange={(e) => setFeedbackImaginado((prev) => ({ ...prev, [p.id]: e.target.value }))}
                        placeholder={p.placeholder}
                        className="resize-none rounded-xl p-3 w-full outline-none transition-all duration-200"
                        style={{
                          border: `1.5px solid ${p.cor}33`,
                          background: `${p.cor}06`,
                          color: COR_DARK,
                          fontFamily: "var(--font-body)",
                          fontSize: 15,
                          lineHeight: 1.65,
                          minHeight: 100,
                        }}
                        onFocus={(e) => { e.target.style.borderColor = p.cor; e.target.style.boxShadow = `0 0 0 3px ${p.cor}18`; }}
                        onBlur={(e) => { e.target.style.borderColor = `${p.cor}33`; e.target.style.boxShadow = "none"; }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Passo 2 — Análise de Discrepâncias ─────────────────────────── */}
        {passo === 2 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 700, color: COR_DARK }}>
                Análise de Discrepâncias
              </h2>
              <p style={{ fontSize: 15, color: "var(--color-brand-gray)" }}>
                Para cada aspecto, descreva <strong style={{ color: COR_DARK }}>como você se vê</strong> e{" "}
                <strong style={{ color: COR_DARK }}>o que as perspectivas imaginadas revelaram</strong>. Marque se há diferença (ponto cego).
              </p>
            </div>

            {pontoCegosCount > 0 && (
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: "rgba(231,76,60,0.07)", border: "1px solid rgba(231,76,60,0.25)" }}
              >
                <span style={{ fontSize: 16 }}>🔍</span>
                <p style={{ fontSize: 15, color: "#E74C3C", fontWeight: 600 }}>
                  {pontoCegosCount} ponto{pontoCegosCount > 1 ? "s cegos" : " cego"} identificado{pontoCegosCount > 1 ? "s" : ""}
                </p>
              </div>
            )}

            <TabelaDiscrepancias aspectos={aspectos} onUpdate={updateAspecto} />

            <p style={{ fontSize: 15, color: "var(--color-brand-gray)", textAlign: "center" }}>
              Preencha pelo menos 4 linhas para continuar
              {aspectosPreenchidos > 0 && ` · ${aspectosPreenchidos}/8 preenchidos`}
            </p>
          </div>
        )}

        {/* ── Passo 3 — Insights e Ação ──────────────────────────────────── */}
        {passo === 3 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 700, color: COR_DARK }}>
                Insights e Ação
              </h2>
              <p style={{ fontSize: 15, color: "var(--color-brand-gray)" }}>
                Transforme o que você aprendeu em <strong style={{ color: COR_DARK }}>compromissos concretos</strong>.
              </p>
            </div>

            {/* Resumo das perspectivas imaginadas */}
            {imaginadosPreenchidos > 0 && (
              <div
                className="flex flex-col gap-4 rounded-2xl p-5"
                style={{ background: `${COR_DARK}05`, border: `1px solid ${COR_DARK}12` }}
              >
                <div className="flex items-start gap-3">
                  <span style={{ fontSize: 20, flexShrink: 0 }}>🪞</span>
                  <div>
                    <p style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: COR_DARK, marginBottom: 4 }}>
                      Suas perspectivas imaginadas
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        color: COR_GOLD,
                        fontStyle: "italic",
                        lineHeight: 1.55,
                        fontWeight: 600,
                      }}
                    >
                      &ldquo;O que se repete nas diferentes perspectivas revela seu padrão mais verdadeiro.&rdquo;
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {PERGUNTAS_IMAGINADO.filter((p) => feedbackImaginado[p.id].trim().length > 0).map((p) => (
                    <div
                      key={p.id}
                      className="rounded-xl p-4"
                      style={{ background: `${p.cor}08`, border: `1px solid ${p.cor}20` }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span style={{ fontSize: 14 }}>{p.emoji}</span>
                        <p style={{ fontSize: 12, fontWeight: 700, color: p.cor, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          {p.perspectiva}
                        </p>
                      </div>
                      <p style={{ fontSize: 14, color: COR_DARK, lineHeight: 1.6, fontStyle: "italic" }}>
                        &ldquo;{feedbackImaginado[p.id].length > 200
                          ? feedbackImaginado[p.id].slice(0, 200) + "…"
                          : feedbackImaginado[p.id]}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <CampoInsight
              emoji="🔍"
              titulo="Maior ponto cego revelado"
              placeholder="Complete: 'Eu acreditava que era [X], mas múltiplas perspectivas mostram que na verdade [Y].' O que essa diferença revela sobre um padrão que você repete?"
              valor={insights.maiorPontoCego}
              onChange={(v) => setInsights((p) => ({ ...p, maiorPontoCego: v }))}
              cor="#8E44AD"
            />
            <CampoInsight
              emoji="🎯"
              titulo="Compromisso nos próximos 30 dias"
              placeholder="Complete: 'Até [data exata], vou [ação comportamental específica e observável] para trabalhar [padrão identificado]. Vou saber que funcionou quando [sinal concreto]."
              valor={insights.trabalharEm30Dias}
              onChange={(v) => setInsights((p) => ({ ...p, trabalharEm30Dias: v }))}
              cor={COR_DARK}
            />
            <CampoInsight
              emoji="🤝"
              titulo="Como vou compartilhar o aprendizado"
              placeholder="Com quem vai compartilhar o que descobriu sobre si mesmo? Quando? O que vai dizer sobre o padrão que identificou e o que vai mudar?"
              valor={insights.fecharLoop}
              onChange={(v) => setInsights((p) => ({ ...p, fecharLoop: v }))}
              cor={COR_GOLD}
            />
          </div>
        )}

      </div>
    </FerramentaLayout>
  );
}
