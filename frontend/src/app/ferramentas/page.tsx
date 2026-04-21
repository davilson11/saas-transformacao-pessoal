'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useSupabaseClient } from "@/lib/useSupabaseClient";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Ferramenta = {
  codigo:    string;
  slug:      string;
  emoji:     string;
  nome:      string;
  descricao: string;
  frequencia: string;
};

type FaseDef = {
  numero:      string;
  titulo:      string;
  subtitulo:   string;  // nome curto para uso inline
  descricao:   string;
  cor:         string;  // cor de acento da fase
  ferramentas: Ferramenta[];
};

// ─── Dados das Fases ──────────────────────────────────────────────────────────

const FASES: FaseDef[] = [
  {
    numero:    "01",
    titulo:    "Autoconhecimento",
    subtitulo: "Autoconhecimento",
    descricao: "Descubra quem você é, onde está e o que realmente importa.",
    cor:       "#4a8c6a",
    ferramentas: [
      { codigo: "F01", slug: "raio-x",          emoji: "🎯", nome: "Raio-X 360°",          frequencia: "Anual",     descricao: "Diagnóstico completo das 8 áreas da sua vida para saber exatamente onde você está." },
      { codigo: "F02", slug: "bussola-valores",  emoji: "🧭", nome: "Bússola de Valores",   frequencia: "Anual",     descricao: "Identifique os valores que guiam suas decisões e alinhe sua vida ao que é essencial." },
      { codigo: "F03", slug: "swot-pessoal",     emoji: "⭐", nome: "SWOT Pessoal",          frequencia: "Semestral", descricao: "Mapeie forças, fraquezas, oportunidades e ameaças para decisões mais estratégicas." },
      { codigo: "F04", slug: "feedback-360",     emoji: "🔮", nome: "Feedback 360°",         frequencia: "Semestral", descricao: "Colete perspectivas de pessoas próximas para enxergar pontos cegos e crescer mais rápido." },
    ],
  },
  {
    numero:    "02",
    titulo:    "Visão e Metas",
    subtitulo: "Visão e Metas",
    descricao: "Defina metas concretas e construa o plano que transforma visão em realidade.",
    cor:       "#d4905a",
    ferramentas: [
      { codigo: "F05", slug: "okrs-pessoais",    emoji: "📊", nome: "OKRs Pessoais",         frequencia: "Trimestral", descricao: "Defina objetivos ambiciosos e resultados-chave mensuráveis para cada trimestre." },
      { codigo: "F06", slug: "design-vida",      emoji: "📅", nome: "Design de Vida",         frequencia: "Anual",     descricao: "Visualize seu dia perfeito e trace horizontes de 1, 5 e 10 anos com clareza." },
      { codigo: "F07", slug: "dre-pessoal",      emoji: "💰", nome: "Mapa Financeiro Pessoal", frequencia: "Mensal",    descricao: "Mapeie o que entra, o que sai e construa sua saúde financeira com clareza e intenção." },
      { codigo: "F08", slug: "rotina-ideal",     emoji: "🌅", nome: "Rotina Ideal",           frequencia: "Semanal",   descricao: "Monte blocos de tempo para manhã, tarde e noite que maximizam energia e foco." },
    ],
  },
  {
    numero:    "03",
    titulo:    "Hábitos e Energia",
    subtitulo: "Hábitos e Energia",
    descricao: "Construa a base diária que sustenta a transformação ao longo dos 12 meses.",
    cor:       "#5a7abf",
    ferramentas: [
      { codigo: "F09", slug: "auditoria-tempo",      emoji: "⏱",  nome: "Auditoria de Tempo",      frequencia: "Mensal",  descricao: "Inventarie como você usa seu tempo, classifique atividades e redesenhe sua semana ideal." },
      { codigo: "F10", slug: "arquiteto-rotinas",    emoji: "🏗",  nome: "Arquiteto de Rotinas",    frequencia: "Semanal", descricao: "Construa rituais matinais, blocos produtivos e noturnos com rastreador semanal." },
      { codigo: "F11", slug: "sprint-aprendizado",   emoji: "🎓",  nome: "Sprint de Aprendizado",   frequencia: "Mensal",  descricao: "Domine uma habilidade em 30 dias com recursos, projetos práticos e tracker diário." },
      { codigo: "F12", slug: "energia-vitalidade",   emoji: "⚡",  nome: "Energia e Vitalidade",    frequencia: "Semanal", descricao: "Diagnostique as 4 dimensões da energia — física, mental, emocional e espiritual." },
    ],
  },
  {
    numero:    "04",
    titulo:    "Crescimento",
    subtitulo: "Crescimento",
    descricao: "Elimine bloqueios, consolide conquistas e garanta que a transformação dure.",
    cor:       "#9b6baf",
    ferramentas: [
      { codigo: "F13", slug: "desconstrutor-crencas", emoji: "🧠", nome: "Desconstrutor de Crenças",  frequencia: "Mensal", descricao: "Identifique e desconstrua crenças limitantes com 9 perguntas socráticas e mantras." },
      { codigo: "F14", slug: "crm-relacionamentos",   emoji: "🤝", nome: "Mapa de Relacionamentos",   frequencia: "Mensal", descricao: "Mapeie as pessoas que importam, fortaleça vínculos e cultive relacionamentos que constroem." },
      { codigo: "F15", slug: "diario-bordo",          emoji: "📔", nome: "Diário de Bordo",           frequencia: "Diária", descricao: "Ritual matinal + noturno + revisão semanal com análise acumulativa dos seus registros." },
      { codigo: "F16", slug: "prevencao-recaida",     emoji: "🛡",  nome: "Plano de Continuidade",    frequencia: "Mensal", descricao: "Crie planos para manter o progresso, superar obstáculos e continuar avançando mesmo nos dias difíceis." },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FREQ_STYLE: Record<string, { bg: string; color: string }> = {
  Diária:     { bg: "rgba(200,160,48,0.12)",  color: "#C8A030" },
  Semanal:    { bg: "rgba(80,160,220,0.12)",  color: "rgba(100,180,230,0.9)" },
  Mensal:     { bg: "rgba(200,160,48,0.10)",  color: "rgba(200,160,48,0.85)" },
  Trimestral: { bg: "rgba(180,120,220,0.12)", color: "rgba(190,140,220,0.9)" },
  Semestral:  { bg: "rgba(220,90,90,0.12)",   color: "rgba(220,130,130,0.9)" },
  Anual:      { bg: "rgba(80,200,140,0.12)",  color: "rgba(100,200,150,0.9)" },
};

/** Uma fase fica visualmente desbloqueada se a anterior tiver ≥ 3 concluídas. */
function isFaseDesbloqueada(idx: number, concluidas: Set<string>): boolean {
  if (idx === 0) return true;
  const anterior = FASES[idx - 1];
  const qtd = anterior.ferramentas.filter((f) => concluidas.has(f.codigo)).length;
  return qtd >= 3;
}

function progressoPorFase(fase: FaseDef, concluidas: Set<string>): number {
  return fase.ferramentas.filter((f) => concluidas.has(f.codigo)).length;
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function FrequenciaBadge({ frequencia }: { frequencia: string }) {
  const s = FREQ_STYLE[frequencia] ?? FREQ_STYLE["Mensal"];
  return (
    <span style={{
      fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 600,
      letterSpacing: "0.05em", textTransform: "uppercase" as const,
      padding: "3px 8px", borderRadius: 99,
      background: s.bg, color: s.color, whiteSpace: "nowrap" as const,
    }}>
      {frequencia}
    </span>
  );
}

function BarraProgresso({ valor, total, cor }: { valor: number; total: number; cor: string }) {
  const pct = Math.round((valor / total) * 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          fontFamily: "var(--font-body)", fontSize: 12,
          color: "rgba(245,240,232,0.50)",
        }}>
          {valor} de {total} ferramentas concluídas
        </span>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700,
          color: valor === total ? "#4ade80" : cor,
        }}>
          {pct}%
        </span>
      </div>
      <div style={{
        height: 5, borderRadius: 99, overflow: "hidden",
        background: "rgba(255,255,255,0.08)",
      }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          borderRadius: 99,
          background: valor === total
            ? "linear-gradient(90deg, #4ade80, #22c55e)"
            : `linear-gradient(90deg, ${cor}99, ${cor})`,
          transition: "width 0.9s ease",
        }} />
      </div>
    </div>
  );
}

function CardFerramenta({
  f,
  desbloqueada,
  concluida,
  faseCor,
}: {
  f:            Ferramenta;
  desbloqueada: boolean;
  concluida:    boolean;
  faseCor:      string;
}) {
  const [hovered, setHovered] = useState(false);

  const card = (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position:      "relative",
        display:       "flex",
        flexDirection: "column",
        gap:           14,
        borderRadius:  16,
        padding:       "20px",
        height:        "100%",
        background:    "#1A1A1A",
        border:        `1px solid ${
          concluida    ? "rgba(74,222,128,0.30)"
          : hovered    ? "rgba(200,160,48,0.50)"
          : "rgba(200,160,48,0.14)"
        }`,
        boxShadow: hovered && desbloqueada
          ? `0 8px 32px rgba(0,0,0,0.40), 0 0 0 1px ${faseCor}22`
          : "none",
        opacity:    !desbloqueada ? 0.62 : 1,
        transition: "border-color 0.2s, box-shadow 0.2s, opacity 0.2s",
        cursor:     "pointer",
        boxSizing:  "border-box",
      }}
    >
      {/* Topo: emoji + código + badges */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: concluida ? "rgba(74,222,128,0.10)" : "rgba(200,160,48,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, border: concluida ? "1px solid rgba(74,222,128,0.20)" : "none",
        }}>
          {f.emoji}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
            color: "#C8A030", background: "rgba(200,160,48,0.12)",
            padding: "2px 7px", borderRadius: 99,
          }}>
            {f.codigo}
          </span>

          {/* Badge de conclusão */}
          {concluida && (
            <span style={{
              fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700,
              color: "#4ade80", background: "rgba(74,222,128,0.12)",
              border: "1px solid rgba(74,222,128,0.25)",
              padding: "2px 7px", borderRadius: 99,
            }}>
              ✓ Concluída
            </span>
          )}

          {/* Cadeado sutil para fases bloqueadas */}
          {!desbloqueada && !concluida && (
            <span
              title="Conclua 3 ferramentas da fase anterior para desbloquear"
              style={{
                fontSize: 13, opacity: 0.5,
                filter: "grayscale(1)",
              }}
            >
              🔒
            </span>
          )}
        </div>
      </div>

      {/* Nome + descrição */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <h3 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 15, fontWeight: 400,
          color: "#F5F0E8", lineHeight: 1.25, margin: 0,
        }}>
          {f.nome}
        </h3>
        <p style={{
          fontSize: 13, lineHeight: 1.6,
          color: "rgba(245,240,232,0.48)", margin: 0,
        }}>
          {f.descricao}
        </p>
      </div>

      {/* Rodapé */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingTop: 12, borderTop: "1px solid rgba(200,160,48,0.09)", marginTop: "auto",
      }}>
        <FrequenciaBadge frequencia={f.frequencia} />
        <span style={{
          fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600,
          color: concluida ? "#4ade80" : "#C8A030",
          transform: hovered ? "translateX(3px)" : "translateX(0)",
          transition: "transform 0.2s",
        }}>
          {concluida ? "Revisar →" : "Abrir →"}
        </span>
      </div>
    </div>
  );

  return (
    <Link
      href={`/ferramentas/${f.slug}`}
      style={{ display: "block", height: "100%", textDecoration: "none" }}
    >
      {card}
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 48, padding: "48px 24px" }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ height: 28, width: 220, borderRadius: 6, background: "rgba(255,255,255,0.06)", animation: "skPulse 1.5s ease-in-out infinite" }} />
          <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.04)" }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} style={{ height: 180, borderRadius: 16, background: "rgba(255,255,255,0.04)", animation: "skPulse 1.5s ease-in-out infinite", animationDelay: `${j * 0.1}s` }} />
            ))}
          </div>
        </div>
      ))}
      <style>{`@keyframes skPulse{0%,100%{opacity:.35}50%{opacity:.70}}`}</style>
    </div>
  );
}

// ─── Próxima ferramenta recomendada ──────────────────────────────────────────

type ProximaRec = {
  ferramenta: Ferramenta;
  fase:       FaseDef;
};

function getProximaFerramenta(concluidas: Set<string>): ProximaRec | null {
  for (let i = 0; i < FASES.length; i++) {
    const fase = FASES[i];
    const desbloqueada = isFaseDesbloqueada(i, concluidas);
    if (!desbloqueada) {
      // fase bloqueada — mostra a primeira ferramenta dela como próximo objetivo
      return { ferramenta: fase.ferramentas[0], fase };
    }
    const proxima = fase.ferramentas.find(f => !concluidas.has(f.codigo));
    if (proxima) return { ferramenta: proxima, fase };
  }
  return null; // todas concluídas
}

function CardProximaFerramenta({ rec, concluidas }: { rec: ProximaRec; concluidas: Set<string> }) {
  const { ferramenta: f, fase } = rec;
  const bloqueada = !isFaseDesbloqueada(FASES.indexOf(fase), concluidas);

  return (
    <div style={{
      background: "linear-gradient(135deg, #111 0%, #1A1A0E 100%)",
      border: "1px solid rgba(200,160,48,0.30)",
      borderRadius: 16,
      padding: "24px 28px",
      display: "flex",
      alignItems: "center",
      gap: 24,
      flexWrap: "wrap" as const,
      boxShadow: "0 4px 32px rgba(200,160,48,0.08)",
      position: "relative" as const,
      overflow: "hidden",
    }}>
      {/* linha de acento superior */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${fase.cor} 0%, ${fase.cor}44 100%)`,
      }} />

      {/* Emoji */}
      <div style={{
        width: 56, height: 56, borderRadius: 14, flexShrink: 0,
        background: "rgba(200,160,48,0.10)",
        border: "1px solid rgba(200,160,48,0.22)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 28,
      }}>
        {f.emoji}
      </div>

      {/* Texto */}
      <div style={{ flex: 1, minWidth: 180 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" as const }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
            color: "#C8A030", background: "rgba(200,160,48,0.12)",
            padding: "2px 8px", borderRadius: 99,
          }}>
            {f.codigo}
          </span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10,
            color: "rgba(245,240,232,0.40)",
          }}>
            Fase {fase.numero} · {fase.titulo}
          </span>
        </div>
        <h3 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(17px, 2vw, 20px)", fontWeight: 400,
          color: "#F5F0E8", margin: "0 0 6px", lineHeight: 1.2,
        }}>
          {f.nome}
        </h3>
        <p style={{
          fontSize: 13, color: "rgba(245,240,232,0.50)",
          margin: 0, lineHeight: 1.55,
        }}>
          {f.descricao}
        </p>
      </div>

      {/* CTA */}
      <Link
        href={`/ferramentas/${f.slug}`}
        style={{
          display: "inline-block",
          fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700,
          color: "#0E0E0E",
          background: "linear-gradient(135deg, #C8A030, #e8c76a)",
          padding: "12px 24px",
          borderRadius: 12,
          textDecoration: "none",
          whiteSpace: "nowrap" as const,
          boxShadow: "0 4px 20px rgba(200,160,48,0.30)",
          flexShrink: 0,
        }}
      >
        {bloqueada ? "Ver detalhes →" : "Continuar agora →"}
      </Link>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function FeramentasPage() {
  const { user, isLoaded } = useUser();
  const { getClient }      = useSupabaseClient();

  const [concluidas, setConcluidas] = useState<Set<string>>(new Set());
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user?.id) { setLoading(false); return; }

    (async () => {
      try {
        const client = await getClient();
        const { data } = await client
          .from("ferramentas_respostas")
          .select("ferramenta_codigo")
          .eq("user_id", user.id)
          .eq("concluida", true);

        setConcluidas(new Set((data ?? []).map((r: { ferramenta_codigo: string }) => r.ferramenta_codigo)));
      } catch {
        // silencioso — sem dados de progresso
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoaded, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalConcluidas = concluidas.size;
  const totalFerramentas = 16;
  const pctGlobal = Math.round((totalConcluidas / totalFerramentas) * 100);

  return (
    <div style={{ background: "#0E0E0E", minHeight: "100vh" }}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={{ borderBottom: "1px solid rgba(200,160,48,0.12)", padding: "56px 24px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* Eyebrow */}
          <div style={{
            display: "inline-block",
            fontFamily: "var(--font-mono)", fontSize: 10,
            letterSpacing: "0.18em", textTransform: "uppercase" as const,
            color: "#C8A030", border: "1px solid rgba(200,160,48,0.28)",
            padding: "4px 14px", borderRadius: 2, marginBottom: 20,
          }}>
            Jornada de 12 Meses · 4 Fases
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 400,
            color: "#F5F0E8", lineHeight: 1.15, margin: "0 0 12px",
          }}>
            16 Ferramentas para{" "}
            <em style={{ color: "#C8A030" }}>Transformar Sua Vida</em>
          </h1>
          <p style={{ fontSize: 15, color: "rgba(245,240,232,0.50)", lineHeight: 1.65, margin: 0 }}>
            Quatro fases progressivas. Cada ferramenta resolve um problema específico
            da sua jornada — faça em ordem para resultados máximos.
          </p>

          {/* Progresso global */}
          {isLoaded && (
            <div style={{ marginTop: 32, maxWidth: 560 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(245,240,232,0.50)" }}>
                  Progresso geral da jornada
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#C8A030" }}>
                  {totalConcluidas}/{totalFerramentas} — {pctGlobal}%
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 99, overflow: "hidden", background: "rgba(255,255,255,0.08)" }}>
                <div style={{
                  height: "100%",
                  width: `${pctGlobal}%`,
                  borderRadius: 99,
                  background: "linear-gradient(90deg, #C8A030 0%, #e8c76a 100%)",
                  transition: "width 1s ease",
                }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Próxima ferramenta ───────────────────────────────────────────── */}
      {!loading && (() => {
        const rec = getProximaFerramenta(concluidas);
        if (!rec) return null;
        return (
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 0" }}>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 10,
              letterSpacing: "0.14em", textTransform: "uppercase" as const,
              color: "rgba(200,160,48,0.60)", marginBottom: 12,
            }}>
              ✦ Sua próxima ferramenta
            </div>
            <CardProximaFerramenta rec={rec} concluidas={concluidas} />
          </div>
        );
      })()}

      {/* ── Fases ────────────────────────────────────────────────────────── */}
      {loading ? (
        <Skeleton />
      ) : (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px", display: "flex", flexDirection: "column", gap: 0 }}>
          {FASES.map((fase, idx) => {
            const desbloqueada = isFaseDesbloqueada(idx, concluidas);
            const qtdConcluida = progressoPorFase(fase, concluidas);
            const faseCompleta = qtdConcluida === fase.ferramentas.length;
            const faltamAnterior = idx > 0
              ? 3 - progressoPorFase(FASES[idx - 1], concluidas)
              : 0;

            return (
              <section key={fase.numero} style={{ padding: "48px 0" }}>

                {/* Separador com conector de jornada */}
                {idx > 0 && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 12,
                    marginBottom: 40, marginTop: -16,
                  }}>
                    <div style={{ flex: 1, height: 1, background: "rgba(200,160,48,0.10)" }} />
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 9,
                      color: desbloqueada ? "rgba(200,160,48,0.55)" : "rgba(255,255,255,0.18)",
                      letterSpacing: "0.10em", textTransform: "uppercase" as const,
                      whiteSpace: "nowrap" as const,
                    }}>
                      {desbloqueada ? "▼ Fase desbloqueada" : `▼ Conclua ${Math.max(0, faltamAnterior)} ferramentas da fase anterior`}
                    </span>
                    <div style={{ flex: 1, height: 1, background: "rgba(200,160,48,0.10)" }} />
                  </div>
                )}

                {/* ── Header da Fase ── */}
                <div style={{
                  background: "#111111",
                  border: `1px solid ${desbloqueada ? `${fase.cor}35` : "rgba(255,255,255,0.06)"}`,
                  borderRadius: 16,
                  padding: "24px 28px",
                  marginBottom: 20,
                  position: "relative",
                  overflow: "hidden",
                }}>
                  {/* Linha de cor da fase no topo */}
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 3,
                    background: desbloqueada
                      ? `linear-gradient(90deg, ${fase.cor} 0%, ${fase.cor}44 100%)`
                      : "rgba(255,255,255,0.06)",
                  }} />

                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>

                    {/* Número da fase */}
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700,
                      color: desbloqueada ? fase.cor : "rgba(255,255,255,0.20)",
                      border: `1px solid ${desbloqueada ? fase.cor + "55" : "rgba(255,255,255,0.10)"}`,
                      background: desbloqueada ? `${fase.cor}10` : "rgba(255,255,255,0.03)",
                    }}>
                      {fase.numero}
                    </div>

                    {/* Título + descrição + barra */}
                    <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <h2 style={{
                          fontFamily: "'Playfair Display', Georgia, serif",
                          fontSize: "clamp(18px, 2.5vw, 22px)", fontWeight: 400,
                          color: desbloqueada ? "#F5F0E8" : "rgba(245,240,232,0.35)",
                          lineHeight: 1.2, margin: 0,
                        }}>
                          Fase {fase.numero} — {fase.titulo}
                        </h2>

                        {/* Status badge */}
                        {faseCompleta ? (
                          <span style={{
                            fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700,
                            color: "#4ade80", background: "rgba(74,222,128,0.12)",
                            border: "1px solid rgba(74,222,128,0.25)",
                            padding: "3px 10px", borderRadius: 99, whiteSpace: "nowrap" as const,
                          }}>
                            ✓ Fase Concluída
                          </span>
                        ) : desbloqueada ? (
                          <span style={{
                            fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 600,
                            color: fase.cor, background: `${fase.cor}12`,
                            border: `1px solid ${fase.cor}30`,
                            padding: "3px 10px", borderRadius: 99, whiteSpace: "nowrap" as const,
                          }}>
                            ● Em progresso
                          </span>
                        ) : (
                          <span style={{
                            fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 600,
                            color: "rgba(255,255,255,0.30)", background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.10)",
                            padding: "3px 10px", borderRadius: 99, whiteSpace: "nowrap" as const,
                          }}>
                            🔒 Bloqueada
                          </span>
                        )}
                      </div>

                      <p style={{
                        fontFamily: "var(--font-body)", fontSize: 13,
                        color: desbloqueada ? "rgba(245,240,232,0.50)" : "rgba(245,240,232,0.25)",
                        margin: 0, lineHeight: 1.5,
                      }}>
                        {desbloqueada
                          ? fase.descricao
                          : `Complete 3 ferramentas da Fase ${FASES[idx - 1]?.numero ?? ""} — ${FASES[idx - 1]?.subtitulo ?? ""} para desbloquear.`}
                      </p>

                      {/* Barra de progresso da fase */}
                      <BarraProgresso
                        valor={qtdConcluida}
                        total={fase.ferramentas.length}
                        cor={fase.cor}
                      />
                    </div>
                  </div>
                </div>

                {/* ── Grid de cards ── */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
                  gap: 14,
                }}>
                  {fase.ferramentas.map((f) => (
                    <CardFerramenta
                      key={f.codigo}
                      f={f}
                      desbloqueada={desbloqueada}
                      concluida={concluidas.has(f.codigo)}
                      faseCor={fase.cor}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* ── Footer CTA ───────────────────────────────────────────────────── */}
      <div style={{
        borderTop: "1px solid rgba(200,160,48,0.12)",
        padding: "48px 24px",
        textAlign: "center" as const,
      }}>
        <p style={{ fontSize: 14, color: "rgba(245,240,232,0.40)", marginBottom: 20 }}>
          Comece pela Fase 01 — cada ferramenta leva de 20 a 60 minutos.
        </p>
        <Link
          href="/ferramentas/raio-x"
          style={{
            display: "inline-block",
            fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700,
            color: "#0E0E0E",
            background: "linear-gradient(135deg, #C8A030, #e8c76a)",
            padding: "13px 28px",
            borderRadius: 12,
            textDecoration: "none",
            boxShadow: "0 4px 20px rgba(200,160,48,0.30)",
          }}
        >
          Começar com o Raio-X 360° →
        </Link>
      </div>
    </div>
  );
}
