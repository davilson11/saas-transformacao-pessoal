'use client';

import { useState } from "react";
import FerramentaLayout from "@/components/dashboard/FerramentaLayout";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Fonte = {
  nome: string;
  relacao: string;
  feedback: string;
  preenchida: boolean;
};

type FonteTipo = {
  id: string;
  emoji: string;
  titulo: string;
  perguntaSugerida: string;
  cor: string;
};

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

const FONTES_CONFIG: FonteTipo[] = [
  {
    id: "colega",
    emoji: "🤝",
    titulo: "Colega de Trabalho",
    perguntaSugerida: "Como você avalia minha capacidade de colaborar e entregar resultados em equipe?",
    cor: "#2980B9",
  },
  {
    id: "lideranca",
    emoji: "📊",
    titulo: "Liderança / Gestor",
    perguntaSugerida: "Quais são meus principais pontos fortes e o que devo melhorar para crescer profissionalmente?",
    cor: "#8E44AD",
  },
  {
    id: "amigo",
    emoji: "😊",
    titulo: "Amigo Próximo",
    perguntaSugerida: "Como você me descreveria para alguém que não me conhece? O que me diferencia?",
    cor: "#27AE60",
  },
  {
    id: "familiar",
    emoji: "🏠",
    titulo: "Familiar",
    perguntaSugerida: "Como você percebe minha presença e equilíbrio entre vida pessoal e profissional?",
    cor: "#E67E22",
  },
  {
    id: "mentor",
    emoji: "🎓",
    titulo: "Mentor / Coach",
    perguntaSugerida: "Que padrão comportamental você observa em mim que eu ainda não percebi?",
    cor: "#C0392B",
  },
  {
    id: "outro",
    emoji: "💡",
    titulo: "Outra Fonte",
    perguntaSugerida: "O que você vê em mim que eu poderia usar mais a meu favor?",
    cor: "#7F8C8D",
  },
];

const ASPECTOS_INICIAIS: Aspecto[] = [
  { id: "ponto_forte",     label: "Ponto Forte Principal",  comoMeVejo: "", oQueDisseram: "", pontoCego: null },
  { id: "area_melhoria",   label: "Área de Melhoria",       comoMeVejo: "", oQueDisseram: "", pontoCego: null },
  { id: "comunicacao",     label: "Comunicação",             comoMeVejo: "", oQueDisseram: "", pontoCego: null },
  { id: "lideranca",       label: "Liderança",               comoMeVejo: "", oQueDisseram: "", pontoCego: null },
  { id: "confiabilidade",  label: "Confiabilidade",          comoMeVejo: "", oQueDisseram: "", pontoCego: null },
  { id: "criatividade",    label: "Criatividade",            comoMeVejo: "", oQueDisseram: "", pontoCego: null },
  { id: "resiliencia",     label: "Resiliência",             comoMeVejo: "", oQueDisseram: "", pontoCego: null },
  { id: "relacionamentos", label: "Relacionamentos",         comoMeVejo: "", oQueDisseram: "", pontoCego: null },
];

const FONTES_INICIAIS: Record<string, Fonte> = Object.fromEntries(
  FONTES_CONFIG.map((f) => [f.id, { nome: "", relacao: "", feedback: "", preenchida: false }])
);

const ETAPAS = [
  { label: "Bem-vindo",                descricao: "Introdução à ferramenta" },
  { label: "Fontes de Feedback",       descricao: "Colete perspectivas" },
  { label: "Análise de Discrepâncias", descricao: "Compare percepções" },
  { label: "Insights e Ação",          descricao: "Transforme em compromissos" },
];

const INSTRUCOES: Record<number, { titulo: string; itens: string[] }> = {
  1: {
    titulo: "O que é o Feedback 360°?",
    itens: [
      "Coleta perspectivas de diferentes pessoas da sua vida.",
      "Revela pontos cegos que você não consegue ver sozinho.",
      "Compara como você se vê com como os outros te veem.",
      "Transforma percepções externas em ações concretas.",
    ],
  },
  2: {
    titulo: "Coletando Feedback",
    itens: [
      "Escolha pessoas que te conhecem em contextos diferentes.",
      "Use a pergunta sugerida ou crie a sua própria.",
      "Registre o feedback com fidelidade — sem editar.",
      "Busque pelo menos 4 fontes para resultados confiáveis.",
    ],
  },
  3: {
    titulo: "Analisando Discrepâncias",
    itens: [
      "Compare como você se vê com o que as pessoas disseram.",
      "Um ponto cego é quando os outros veem algo que você não vê.",
      "Seja curioso, não defensivo — é informação valiosa.",
      "Marque 'Sim' quando houver diferença significativa.",
    ],
  },
  4: {
    titulo: "Transformando em Ação",
    itens: [
      "Identifique o maior ponto cego revelado pelo processo.",
      "Defina UMA ação concreta para os próximos 30 dias.",
      "Fechar o loop = agradecer e compartilhar o progresso.",
      "O feedback sem ação é apenas informação.",
    ],
  },
};

const COR_GOLD = "#E0A55F";
const COR_DARK = "#1E392A";

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function FonteCard({
  config,
  fonte,
  onUpdate,
}: {
  config: FonteTipo;
  fonte: Fonte;
  onUpdate: (f: Partial<Fonte>) => void;
}) {
  const [expandida, setExpandida] = useState(false);
  const preenchida = fonte.nome.trim().length > 0 && fonte.feedback.trim().length > 20;

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        border: `1.5px solid ${preenchida ? config.cor + "55" : "var(--color-brand-border)"}`,
        background: "#fff",
        boxShadow: preenchida ? `0 2px 12px ${config.cor}18` : "var(--shadow-card)",
      }}
    >
      {/* Header clicável */}
      <button
        onClick={() => setExpandida((v) => !v)}
        className="flex items-center gap-3 px-5 py-4 text-left w-full transition-all duration-200"
        style={{
          background: preenchida ? `${config.cor}0e` : "#fafafa",
          borderBottom: expandida ? `1px solid ${config.cor}22` : "none",
        }}
      >
        <div
          className="flex items-center justify-center rounded-xl shrink-0"
          style={{ width: 40, height: 40, background: `${config.cor}18`, fontSize: 20 }}
        >
          {config.emoji}
        </div>
        <div className="flex-1">
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 16,
              fontWeight: 700,
              color: COR_DARK,
              lineHeight: 1.2,
            }}
          >
            {config.titulo}
          </p>
          {fonte.nome.trim() ? (
            <p style={{ fontSize: 15, color: config.cor, fontWeight: 600, marginTop: 2 }}>
              {fonte.nome}
            </p>
          ) : (
            <p style={{ fontSize: 15, color: "var(--color-brand-gray)", marginTop: 2 }}>
              Não preenchido
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {preenchida && (
            <div
              className="flex items-center justify-center rounded-full"
              style={{ width: 22, height: 22, background: config.cor }}
            >
              <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>
            </div>
          )}
          <span
            style={{
              fontSize: 12,
              color: "var(--color-brand-gray)",
              transform: expandida ? "rotate(180deg)" : "rotate(0deg)",
              display: "inline-block",
              transition: "transform 0.2s",
            }}
          >
            ▾
          </span>
        </div>
      </button>

      {/* Conteúdo expansível */}
      {expandida && (
        <div className="flex flex-col gap-4 p-5">
          {/* Nome + Relação */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-brand-gray)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Nome
              </label>
              <input
                type="text"
                value={fonte.nome}
                onChange={(e) => onUpdate({ nome: e.target.value })}
                placeholder="Ex: Ana Lima"
                className="rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200"
                style={{
                  border: `1.5px solid ${config.cor}33`,
                  background: `${config.cor}06`,
                  color: COR_DARK,
                  fontFamily: "var(--font-body)",
                }}
                onFocus={(e) => { e.target.style.borderColor = config.cor; e.target.style.boxShadow = `0 0 0 3px ${config.cor}18`; }}
                onBlur={(e) => { e.target.style.borderColor = `${config.cor}33`; e.target.style.boxShadow = "none"; }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-brand-gray)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Relação
              </label>
              <input
                type="text"
                value={fonte.relacao}
                onChange={(e) => onUpdate({ relacao: e.target.value })}
                placeholder="Ex: Gerente de equipe"
                className="rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200"
                style={{
                  border: `1.5px solid ${config.cor}33`,
                  background: `${config.cor}06`,
                  color: COR_DARK,
                  fontFamily: "var(--font-body)",
                }}
                onFocus={(e) => { e.target.style.borderColor = config.cor; e.target.style.boxShadow = `0 0 0 3px ${config.cor}18`; }}
                onBlur={(e) => { e.target.style.borderColor = `${config.cor}33`; e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          {/* Pergunta sugerida */}
          <div
            className="flex items-start gap-2 rounded-xl p-3"
            style={{ background: `${config.cor}0e`, border: `1px solid ${config.cor}22` }}
          >
            <span style={{ color: config.cor, fontSize: 13, marginTop: 1, flexShrink: 0 }}>💬</span>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: config.cor, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
                Pergunta sugerida
              </p>
              <p style={{ fontSize: 15, color: "var(--color-brand-gray)", lineHeight: 1.5, fontStyle: "italic" }}>
                &ldquo;{config.perguntaSugerida}&rdquo;
              </p>
            </div>
          </div>

          {/* Feedback recebido */}
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-brand-gray)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Feedback recebido
            </label>
            <textarea
              value={fonte.feedback}
              onChange={(e) => onUpdate({ feedback: e.target.value })}
              placeholder="Escreva exatamente o que a pessoa disse, com as palavras dela..."
              className="resize-none rounded-xl p-3 text-sm outline-none transition-all duration-200"
              style={{
                border: `1.5px solid ${config.cor}33`,
                background: `${config.cor}06`,
                color: COR_DARK,
                fontFamily: "var(--font-body)",
                lineHeight: 1.6,
                minHeight: 100,
              }}
              onFocus={(e) => { e.target.style.borderColor = config.cor; e.target.style.boxShadow = `0 0 0 3px ${config.cor}18`; }}
              onBlur={(e) => { e.target.style.borderColor = `${config.cor}33`; e.target.style.boxShadow = "none"; }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

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
      {/* Cabeçalho da tabela */}
      <div
        className="grid px-4 py-3"
        style={{
          gridTemplateColumns: "200px 1fr 1fr 100px",
          gap: 12,
          background: `${COR_DARK}06`,
          borderBottom: "1px solid var(--color-brand-border)",
        }}
      >
        {["Aspecto", "Como me vejo", "O que disseram", "Ponto Cego?"].map((h) => (
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
          {/* Label */}
          <div className="flex items-center gap-2 pt-1">
            {a.pontoCego === true && (
              <div
                className="rounded-full shrink-0"
                style={{ width: 6, height: 6, background: "#E74C3C" }}
              />
            )}
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: 600,
                color: COR_DARK,
                lineHeight: 1.3,
              }}
            >
              {a.label}
            </p>
          </div>

          {/* Como me vejo */}
          <textarea
            value={a.comoMeVejo}
            onChange={(e) => onUpdate(a.id, { comoMeVejo: e.target.value })}
            placeholder="Sua autopercepção..."
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

          {/* O que disseram */}
          <textarea
            value={a.oQueDisseram}
            onChange={(e) => onUpdate(a.id, { oQueDisseram: e.target.value })}
            placeholder="O que o feedback revelou..."
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

          {/* Ponto cego toggle */}
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
                background: a.pontoCego === false ? `${COR_DARK}` : `${COR_DARK}08`,
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
  emoji,
  titulo,
  placeholder,
  valor,
  onChange,
  cor,
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
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 15,
            fontWeight: 700,
            color: COR_DARK,
          }}
        >
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
  const [fontes, setFontes] = useState<Record<string, Fonte>>(FONTES_INICIAIS);
  const [aspectos, setAspectos] = useState<Aspecto[]>(ASPECTOS_INICIAIS);
  const [insights, setInsights] = useState<Insights>({
    maiorPontoCego: "",
    trabalharEm30Dias: "",
    fecharLoop: "",
  });

  const updateFonte = (id: string, dados: Partial<Fonte>) =>
    setFontes((prev) => ({ ...prev, [id]: { ...prev[id], ...dados } }));

  const updateAspecto = (id: string, campo: Partial<Aspecto>) =>
    setAspectos((prev) => prev.map((a) => (a.id === id ? { ...a, ...campo } : a)));

  const fontesPreenchidas = FONTES_CONFIG.filter(
    (f) => fontes[f.id].nome.trim().length > 0 && fontes[f.id].feedback.trim().length > 20
  );

  const pontoCegosCount = aspectos.filter((a) => a.pontoCego === true).length;
  const aspectosPreenchidos = aspectos.filter((a) => a.comoMeVejo.trim() && a.oQueDisseram.trim()).length;

  const progresso = Math.round((passo / 3) * 100);

  const podeAvancar = () => {
    if (passo === 0) return true;
    if (passo === 1) return fontesPreenchidas.length >= 2;
    if (passo === 2) return aspectosPreenchidos >= 4;
    return true;
  };

  const instrucao = INSTRUCOES[passo + 1];

  // ── Painel direito (resumo) ───────────────────────────────────────────────

  const painelResumo = (
    <>
      {/* Fontes preenchidas */}
      <div
        className="flex flex-col gap-3 rounded-xl p-4"
        style={{ background: `${COR_DARK}06`, border: `1px solid ${COR_DARK}12` }}
      >
        <div className="flex items-center justify-between">
          <p style={{ fontFamily: "var(--font-heading)", fontSize: 13, fontWeight: 700, color: COR_DARK }}>
            Fontes coletadas
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
            {fontesPreenchidas.length}/6
          </span>
        </div>

        {FONTES_CONFIG.map((config) => {
          const fonte = fontes[config.id];
          const ok = fonte.nome.trim().length > 0 && fonte.feedback.trim().length > 20;
          return (
            <div key={config.id} className="flex items-center gap-2">
              <div
                className="flex items-center justify-center rounded-full shrink-0"
                style={{
                  width: 22,
                  height: 22,
                  background: ok ? config.cor : `${config.cor}18`,
                  fontSize: ok ? 11 : 13,
                }}
              >
                {ok ? (
                  <span style={{ color: "#fff", fontWeight: 700 }}>✓</span>
                ) : (
                  config.emoji
                )}
              </div>
              <div className="flex-1">
                <p style={{ fontSize: 13, color: ok ? COR_DARK : "var(--color-brand-gray)", fontWeight: ok ? 600 : 400 }}>
                  {ok ? fonte.nome : config.titulo}
                </p>
                {ok && fonte.relacao && (
                  <p style={{ fontSize: 10, color: "var(--color-brand-gray)" }}>{fonte.relacao}</p>
                )}
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
              {aspectos
                .filter((a) => a.pontoCego === true)
                .map((a) => (
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
      {fontesPreenchidas.length === 0 && aspectosPreenchidos === 0 && !insights.maiorPontoCego && (
        <div
          className="flex flex-col items-center gap-3 rounded-xl p-6 text-center"
          style={{ border: "1.5px dashed var(--color-brand-border)" }}
        >
          <span style={{ fontSize: 32 }}>🔄</span>
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
      descricao="Colete perspectivas de quem convive com você e descubra seus pontos cegos."
      etapas={ETAPAS}
      etapaAtual={passo}
      progresso={progresso}
      onAvancar={() => podeAvancar() && setPasso((p) => Math.min(3, p + 1))}
      onVoltar={() => setPasso((p) => Math.max(0, p - 1))}
      podeAvancar={podeAvancar()}
      totalItens={fontesPreenchidas.length}
      labelItens={fontesPreenchidas.length === 1 ? "fonte" : "fontes"}
      resumo={painelResumo}
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
                <span style={{ color: COR_GOLD, fontStyle: "italic" }}>360°</span>
              </h1>
              <p
                style={{
                  fontSize: 15,
                  color: "var(--color-brand-gray)",
                  lineHeight: 1.7,
                  maxWidth: 520,
                }}
              >
                A versão mais honesta de quem você é vem de quem convive com você. O Feedback 360° coleta perspectivas de múltiplas fontes para revelar o que você não consegue ver sozinho.
              </p>
            </div>

            {/* Como funciona */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { num: "01", titulo: "Coleta", desc: "Registre o feedback de até 6 pessoas do seu círculo.", emoji: "📥" },
                { num: "02", titulo: "Análise", desc: "Compare sua autopercepção com o que cada um disse.", emoji: "🔍" },
                { num: "03", titulo: "Ação", desc: "Transforme pontos cegos em plano de desenvolvimento.", emoji: "🚀" },
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
                  <h3
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: 15,
                      fontWeight: 700,
                      color: COR_DARK,
                    }}
                  >
                    {e.titulo}
                  </h3>
                  <p style={{ fontSize: 15, color: "var(--color-brand-gray)", lineHeight: 1.5 }}>{e.desc}</p>
                </div>
              ))}
            </div>

            {/* Fontes */}
            <div className="flex flex-col gap-3">
              <p style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: COR_DARK }}>
                6 perspectivas disponíveis
              </p>
              <div className="flex flex-wrap gap-2">
                {FONTES_CONFIG.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-2 rounded-xl px-3 py-2"
                    style={{ background: `${f.cor}12`, border: `1px solid ${f.cor}25` }}
                  >
                    <span style={{ fontSize: 14 }}>{f.emoji}</span>
                    <span style={{ fontSize: 15, color: f.cor, fontWeight: 600 }}>{f.titulo}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tempo */}
            <div
              className="flex items-center gap-4 rounded-xl p-4"
              style={{ background: `${COR_GOLD}12`, border: `1px solid ${COR_GOLD}33` }}
            >
              <span style={{ fontSize: 20 }}>⏱️</span>
              <div>
                <p style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 700, color: COR_DARK }}>
                  20–40 minutos
                </p>
                <p style={{ fontSize: 15, color: "var(--color-brand-gray)" }}>
                  Mais rico quando feito após coletar feedback com as pessoas pessoalmente.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Passo 1 — Fontes de Feedback */}
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
                Fontes de Feedback
              </h2>
              <p style={{ fontSize: 15, color: "var(--color-brand-gray)" }}>
                Preencha as perspectivas de quem você pediu feedback. Mínimo{" "}
                <strong style={{ color: COR_DARK }}>2 fontes</strong> para continuar.
              </p>
            </div>

            {fontesPreenchidas.length > 0 && (
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: "rgba(39,174,96,0.08)", border: "1px solid rgba(39,174,96,0.25)" }}
              >
                <span style={{ fontSize: 16 }}>✅</span>
                <p style={{ fontSize: 15, color: "#27AE60", fontWeight: 600 }}>
                  {fontesPreenchidas.length} fonte{fontesPreenchidas.length > 1 ? "s" : ""} preenchida{fontesPreenchidas.length > 1 ? "s" : ""}
                  {fontesPreenchidas.length < 2 ? " — adicione mais 1 para continuar" : " — você pode continuar!"}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-4">
              {FONTES_CONFIG.map((config) => (
                <FonteCard
                  key={config.id}
                  config={config}
                  fonte={fontes[config.id]}
                  onUpdate={(dados) => updateFonte(config.id, dados)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Passo 2 — Análise de Discrepâncias */}
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
                Análise de Discrepâncias
              </h2>
              <p style={{ fontSize: 15, color: "var(--color-brand-gray)" }}>
                Para cada aspecto, escreva <strong style={{ color: COR_DARK }}>como você se vê</strong> e{" "}
                <strong style={{ color: COR_DARK }}>o que o feedback revelou</strong>. Marque se há ponto cego.
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

        {/* Passo 3 — Insights e Ação */}
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
                Insights e Ação
              </h2>
              <p style={{ fontSize: 15, color: "var(--color-brand-gray)" }}>
                Transforme o que você aprendeu em <strong style={{ color: COR_DARK }}>compromissos concretos</strong>.
              </p>
            </div>

            <CampoInsight
              emoji="🔍"
              titulo="Maior ponto cego revelado"
              placeholder="Qual foi a maior diferença entre como eu me via e o que as pessoas disseram? O que isso me revela sobre mim mesmo(a)?"
              valor={insights.maiorPontoCego}
              onChange={(v) => setInsights((p) => ({ ...p, maiorPontoCego: v }))}
              cor="#8E44AD"
            />
            <CampoInsight
              emoji="🎯"
              titulo="O que vou trabalhar nos próximos 30 dias"
              placeholder="Com base nos pontos cegos e feedbacks, qual é UMA mudança específica que vou implementar nos próximos 30 dias?"
              valor={insights.trabalharEm30Dias}
              onChange={(v) => setInsights((p) => ({ ...p, trabalharEm30Dias: v }))}
              cor={COR_DARK}
            />
            <CampoInsight
              emoji="🤝"
              titulo="Como vou fechar o loop"
              placeholder="Como vou agradecer às pessoas que me deram feedback e compartilhar meu plano de ação com elas?"
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
