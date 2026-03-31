'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { buscarTodasRespostas, buscarVisaoAncora, buscarRodaVida } from "@/lib/queries";
import { useSupabaseClient } from "@/lib/useSupabaseClient";
import type { FerramentasRespostas, RodaVida, VisaoAncora } from "@/lib/database.types";

// ─── Constantes ───────────────────────────────────────────────────────────────

const C = {
  green:  "#1a5c3a",
  gold:   "#b5840a",
  cream:  "#f5f4f0",
  border: "#dedad4",
  gray:   "#7a8c82",
  ink:    "#1c2b22",
};

const TOTAL_FERRAMENTAS = 16;

type ToolInfo = { nome: string; emoji: string; codigo: string; descricao: string };

const TOOL_MAP: Record<string, ToolInfo> = {
  "raio-x":               { codigo: "F01", emoji: "🎯", nome: "Raio-X 360°",             descricao: "Diagnóstico completo das 8 áreas da sua vida." },
  "bussola-valores":      { codigo: "F02", emoji: "🧭", nome: "Bússola de Valores",       descricao: "Identifique os valores que guiam suas decisões." },
  "swot-pessoal":         { codigo: "F03", emoji: "⭐", nome: "SWOT Pessoal",             descricao: "Mapeie forças, fraquezas, oportunidades e ameaças." },
  "feedback-360":         { codigo: "F04", emoji: "🔮", nome: "Feedback 360°",            descricao: "Colete perspectivas de pessoas próximas." },
  "okrs-pessoais":        { codigo: "F05", emoji: "📊", nome: "OKRs Pessoais",            descricao: "Objetivos ambiciosos com resultados-chave mensuráveis." },
  "design-vida":          { codigo: "F06", emoji: "📅", nome: "Design de Vida",           descricao: "Trace horizontes de 1, 5 e 10 anos com clareza." },
  "dre-pessoal":          { codigo: "F07", emoji: "💰", nome: "DRE Pessoal",              descricao: "Demonstrativo financeiro pessoal com metas de patrimônio." },
  "rotina-ideal":         { codigo: "F08", emoji: "🌅", nome: "Rotina Ideal",             descricao: "Monte blocos de tempo que maximizam energia e foco." },
  "auditoria-tempo":      { codigo: "F09", emoji: "⏱",  nome: "Auditoria de Tempo",       descricao: "Inventarie como você usa seu tempo e redesenhe sua semana." },
  "arquiteto-rotinas":    { codigo: "F10", emoji: "🏗",  nome: "Arquiteto de Rotinas",     descricao: "Construa rituais matinais e noturnos com rastreador." },
  "sprint-aprendizado":   { codigo: "F11", emoji: "🎓", nome: "Sprint de Aprendizado",    descricao: "Domine uma habilidade em 30 dias com tracker diário." },
  "energia-vitalidade":   { codigo: "F12", emoji: "⚡", nome: "Energia e Vitalidade",     descricao: "Diagnostique as 4 dimensões da energia." },
  "desconstrutor-crencas":{ codigo: "F13", emoji: "🧠", nome: "Desconstrutor de Crenças", descricao: "Desconstrua crenças limitantes com 9 perguntas socráticas." },
  "crm-relacionamentos":  { codigo: "F14", emoji: "🤝", nome: "CRM de Relacionamentos",   descricao: "Mapeie contatos-chave e frequência ideal de contato." },
  "diario-bordo":         { codigo: "F15", emoji: "📔", nome: "Diário de Bordo",          descricao: "Ritual matinal + noturno com revisão semanal." },
  "prevencao-recaida":    { codigo: "F16", emoji: "🛡",  nome: "Prevenção de Recaída",     descricao: "Planos SE-ENTÃO para cenários de risco e recuperação." },
};

// Ordem canônica F01→F16 para recomendação da próxima ferramenta
const TOOL_ORDER = [
  "raio-x", "bussola-valores", "swot-pessoal", "feedback-360",
  "okrs-pessoais", "design-vida", "dre-pessoal", "rotina-ideal",
  "auditoria-tempo", "arquiteto-rotinas", "sprint-aprendizado", "energia-vitalidade",
  "desconstrutor-crencas", "crm-relacionamentos", "diario-bordo", "prevencao-recaida",
];

type RodaKey = keyof Omit<RodaVida, "id" | "user_id" | "created_at">;

const RODA_AREAS: { key: RodaKey; label: string; emoji: string; cor: string }[] = [
  { key: "saude",           label: "Saúde",           emoji: "💪", cor: "#27AE60" },
  { key: "carreira",        label: "Carreira",         emoji: "🚀", cor: "#af6b9b" },
  { key: "financas",        label: "Finanças",         emoji: "💰", cor: "#b5840a" },
  { key: "relacionamentos", label: "Relacionamentos",  emoji: "🤝", cor: "#5a7abf" },
  { key: "lazer",           label: "Lazer",            emoji: "🎨", cor: "#D97706" },
  { key: "espiritualidade", label: "Espiritualidade",  emoji: "🧘", cor: "#7aaa8c" },
  { key: "familia",         label: "Família",          emoji: "👨‍👩‍👧", cor: "#e06b6b" },
  { key: "crescimento",     label: "Crescimento",      emoji: "📈", cor: C.green  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function memberSince(createdAt: string | null | undefined) {
  if (!createdAt) return "—";
  return new Date(createdAt).toLocaleDateString("pt-BR", {
    month: "long", year: "numeric",
  });
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ w, h = 14, r = 6 }: { w: number | string; h?: number; r?: number }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: r,
        background: "rgba(26,92,58,0.08)",
        animation: "perfil-pulse 1.5s ease-in-out infinite",
      }}
    />
  );
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: "24px",
        boxShadow: "0 1px 4px rgba(26,92,58,0.07), 0 4px 16px rgba(26,92,58,0.05)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Anel de progresso SVG ────────────────────────────────────────────────────

function ProgressRing({
  pct,
  size = 96,
  stroke = 8,
  color = C.gold,
}: {
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
}) {
  const r  = (size - stroke) / 2;
  const cx = size / 2;
  const circum = 2 * Math.PI * r;
  const offset = circum * (1 - pct / 100);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" style={{ transform: "rotate(-90deg)" }}>
      <circle cx={cx} cy={cx} r={r} stroke="rgba(26,92,58,0.08)" strokeWidth={stroke} />
      <circle
        cx={cx} cy={cx} r={r}
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circum}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
    </svg>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function PerfilPage() {
  const { user, isLoaded } = useUser();
  const { getClient } = useSupabaseClient();

  const [respostas,  setRespostas]  = useState<FerramentasRespostas[]>([]);
  const [visao,      setVisao]      = useState<VisaoAncora | null>(null);
  const [roda,       setRoda]       = useState<RodaVida | null>(null);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user?.id) { setLoading(false); return; }
    (async () => {
      const client = await getClient();
      const [r, v, w] = await Promise.all([
        buscarTodasRespostas(user.id, client),
        buscarVisaoAncora(user.id, client),
        buscarRodaVida(user.id, client),
      ]);
      setRespostas(r);
      setVisao(v);
      setRoda(w);
      setLoading(false);
    })();
  }, [isLoaded, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const concluidas  = respostas.filter((r) => r.concluida);
  const emProgresso = respostas.filter((r) => !r.concluida && r.progresso > 0);
  const pctGeral    = Math.round((concluidas.length / TOTAL_FERRAMENTAS) * 100);

  // Próxima ferramenta recomendada: primeira da ordem canônica ainda não iniciada
  const slugsIniciadas = new Set(respostas.map((r) => r.ferramenta_slug));
  const proximaSlug = TOOL_ORDER.find((s) => !slugsIniciadas.has(s)) ?? TOOL_ORDER[0];
  const proximaTool = TOOL_MAP[proximaSlug];

  const primeiroNome = user?.firstName ?? user?.fullName?.split(" ")[0] ?? "Usuário";
  const nomeCompleto = user?.fullName ?? primeiroNome;
  const email        = user?.primaryEmailAddress?.emailAddress ?? "—";
  const avatarUrl    = user?.imageUrl;

  return (
    <DashboardLayout>
      <style>{`
        @keyframes perfil-pulse {
          0%, 100% { opacity: 0.5 }
          50%       { opacity: 1 }
        }
      `}</style>

      <div className="flex flex-col gap-6 max-w-4xl mx-auto">

        {/* ══════════════════════════════════════════════════════════════
            1. HEADER — foto, nome, email
        ══════════════════════════════════════════════════════════════ */}
        <Card style={{ background: `linear-gradient(135deg, ${C.green} 0%, #133028 100%)` }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

            {/* Avatar */}
            <div
              className="relative flex-shrink-0"
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                border: `3px solid ${C.gold}`,
                boxShadow: `0 0 0 4px rgba(181,132,10,0.18)`,
                overflow: "hidden",
              }}
            >
              {avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={avatarUrl} alt={nomeCompleto} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div
                  className="flex items-center justify-center w-full h-full"
                  style={{
                    background: `${C.gold}22`,
                    fontFamily: "var(--font-heading)",
                    fontSize: 26,
                    color: C.gold,
                    fontStyle: "italic",
                  }}
                >
                  {primeiroNome[0]}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              {loading ? (
                <div className="flex flex-col gap-2">
                  <Skeleton w={180} h={22} />
                  <Skeleton w={140} h={14} />
                </div>
              ) : (
                <>
                  <h1
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontStyle: "italic",
                      fontSize: "clamp(20px, 3vw, 26px)",
                      fontWeight: 400,
                      color: "#f5f4f0",
                      lineHeight: 1.2,
                      margin: 0,
                    }}
                  >
                    {nomeCompleto}
                  </h1>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(245,244,240,0.60)", margin: 0 }}>
                    {email}
                  </p>
                  {user?.createdAt && (
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(245,244,240,0.40)", margin: 0, marginTop: 2 }}>
                      Membro desde {memberSince(new Date(user.createdAt).toISOString())}
                    </p>
                  )}
                  {!loading && visao?.manchete && (
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: 13,
                        color: `rgba(181,132,10,0.90)`,
                        margin: 0,
                        marginTop: 8,
                        lineHeight: 1.4,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      ✦ Você está construindo:{" "}
                      <em style={{ fontFamily: "var(--font-heading)", fontStyle: "italic", fontWeight: 400 }}>
                        {visao.manchete}
                      </em>
                    </p>
                  )}
                </>
              )}
            </div>

            {/* UserButton (gerenciar conta Clerk) */}
            <div className="flex-shrink-0">
              <UserButton
                appearance={{
                  elements: { avatarBox: { width: 36, height: 36 } },
                }}
              />
            </div>
          </div>
        </Card>

        {/* ══════════════════════════════════════════════════════════════
            2. PROGRESSO GERAL
        ══════════════════════════════════════════════════════════════ */}
        <Card>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontStyle: "italic",
              fontSize: 20,
              fontWeight: 400,
              color: C.green,
              margin: "0 0 20px",
            }}
          >
            Progresso Geral
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Anel — mínimo 3% para arc visível quando pct > 0 */}
            <div className="relative flex-shrink-0" style={{ width: 96, height: 96 }}>
              <ProgressRing
                pct={loading ? 0 : (pctGeral > 0 && pctGeral < 3 ? 3 : pctGeral)}
                color={C.gold}
              />
              <div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ textAlign: "center" }}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: C.green, lineHeight: 1 }}>
                  {loading ? "—" : concluidas.length}
                </span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: C.gray, marginTop: 2, lineHeight: 1 }}>
                  de {TOTAL_FERRAMENTAS}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 flex flex-col gap-3 w-full">
              {[
                {
                  label: "Ferramentas concluídas",
                  valor: loading ? null : concluidas.length,
                  total: `/ ${TOTAL_FERRAMENTAS}`,
                  cor: C.green,
                },
                {
                  label: "Em progresso",
                  valor: loading ? null : emProgresso.length,
                  total: " ferramentas",
                  cor: C.gold,
                },
                {
                  label: "Progresso geral",
                  valor: loading ? null : pctGeral,
                  total: "%",
                  cor: "#5a7abf",
                },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.cor, flexShrink: 0 }} />
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: C.gray, flex: 1 }}>{s.label}</span>
                  {s.valor === null ? (
                    <Skeleton w={40} h={12} />
                  ) : (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: s.cor }}>
                      {s.valor}{s.total}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* ══════════════════════════════════════════════════════════════
            3. FERRAMENTAS CONCLUÍDAS
        ══════════════════════════════════════════════════════════════ */}
        <Card>
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontStyle: "italic",
                fontSize: 20,
                fontWeight: 400,
                color: C.green,
                margin: 0,
              }}
            >
              Ferramentas Concluídas
            </h2>
            <Link
              href="/ferramentas"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 12,
                fontWeight: 600,
                color: C.gold,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Ver todas →
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton w={32} h={32} r={8} />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Skeleton w="60%" h={12} />
                    <Skeleton w="35%" h={10} />
                  </div>
                  <Skeleton w={80} h={10} />
                </div>
              ))}
            </div>
          ) : concluidas.length === 0 ? (
            <div
              className="flex flex-col items-center gap-3 py-8"
              style={{ textAlign: "center" }}
            >
              <span style={{ fontSize: 36 }}>🛠</span>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: C.gray, maxWidth: 280 }}>
                Você ainda não concluiu nenhuma ferramenta. Comece pela{" "}
                <Link href="/ferramentas/raio-x" style={{ color: C.green, fontWeight: 600 }}>
                  Raio-X 360°
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {concluidas.map((r) => {
                const info = TOOL_MAP[r.ferramenta_slug];
                if (!info) return null;
                return (
                  <Link
                    key={r.id}
                    href={`/ferramentas/${r.ferramenta_slug}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150"
                      style={{ cursor: "pointer" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(26,92,58,0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Emoji badge */}
                      <div
                        className="flex items-center justify-center rounded-lg flex-shrink-0"
                        style={{ width: 34, height: 34, background: "rgba(26,92,58,0.06)", fontSize: 16 }}
                      >
                        {info.emoji}
                      </div>

                      {/* Nome + código */}
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <span
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: 14,
                            fontWeight: 600,
                            color: C.ink,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {info.nome}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            color: C.gold,
                            fontWeight: 600,
                            letterSpacing: "0.06em",
                          }}
                        >
                          {info.codigo}
                        </span>
                      </div>

                      {/* Badge concluído + data */}
                      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                        <span
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#1a7a40",
                            background: "rgba(39,174,96,0.10)",
                            padding: "2px 8px",
                            borderRadius: 99,
                          }}
                        >
                          ✓ Concluído
                        </span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: C.gray }}>
                          {formatDate(r.updated_at)}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}

              {/* Em progresso — listagem secundária */}
              {emProgresso.length > 0 && (
                <>
                  <div
                    style={{
                      margin: "12px 0 8px",
                      fontFamily: "var(--font-body)",
                      fontSize: 11,
                      fontWeight: 600,
                      color: C.gray,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      paddingLeft: 4,
                    }}
                  >
                    Em progresso
                  </div>
                  {emProgresso.map((r) => {
                    const info = TOOL_MAP[r.ferramenta_slug];
                    if (!info) return null;
                    return (
                      <Link key={r.id} href={`/ferramentas/${r.ferramenta_slug}`} style={{ textDecoration: "none" }}>
                        <div
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150"
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(26,92,58,0.04)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <div
                            className="flex items-center justify-center rounded-lg flex-shrink-0"
                            style={{ width: 34, height: 34, background: "rgba(181,132,10,0.08)", fontSize: 16 }}
                          >
                            {info.emoji}
                          </div>
                          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                            <span style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, color: C.ink }}>
                              {info.nome}
                            </span>
                            {/* Barra de progresso */}
                            <div
                              className="rounded-full overflow-hidden"
                              style={{ height: 3, background: "rgba(26,92,58,0.08)", width: 120 }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  width: `${r.progresso}%`,
                                  background: C.gold,
                                  borderRadius: 99,
                                  transition: "width 0.5s ease",
                                }}
                              />
                            </div>
                          </div>
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 11,
                              fontWeight: 700,
                              color: C.gold,
                              flexShrink: 0,
                            }}
                          >
                            {r.progresso}%
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </Card>

        {/* ══════════════════════════════════════════════════════════════
            4. PRÓXIMA FERRAMENTA RECOMENDADA
        ══════════════════════════════════════════════════════════════ */}
        {!loading && proximaTool && concluidas.length < TOTAL_FERRAMENTAS && (
          <Card
            style={{
              background: `linear-gradient(135deg, ${C.green} 0%, #1e4d31 100%)`,
              border: "none",
            }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Ícone */}
              <div
                className="flex items-center justify-center rounded-2xl flex-shrink-0"
                style={{
                  width: 56,
                  height: 56,
                  background: "rgba(245,244,240,0.10)",
                  fontSize: 26,
                  border: "1px solid rgba(245,244,240,0.10)",
                }}
              >
                {proximaTool.emoji}
              </div>

              {/* Texto */}
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    fontWeight: 600,
                    color: C.gold,
                    textTransform: "uppercase",
                    letterSpacing: "0.10em",
                  }}
                >
                  {proximaTool.codigo} · Próxima recomendada
                </span>
                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontStyle: "italic",
                    fontSize: "clamp(16px, 2vw, 20px)",
                    fontWeight: 400,
                    color: "#f5f4f0",
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {proximaTool.nome}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 13,
                    color: "rgba(245,244,240,0.60)",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {proximaTool.descricao}
                </p>
              </div>

              {/* CTA */}
              <Link
                href={`/ferramentas/${proximaSlug}`}
                className="flex-shrink-0"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  fontWeight: 700,
                  color: C.green,
                  background: `linear-gradient(135deg, ${C.gold}, #e8b84b)`,
                  padding: "12px 22px",
                  borderRadius: 12,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  boxShadow: `0 4px 16px rgba(181,132,10,0.35)`,
                }}
              >
                Começar agora →
              </Link>
            </div>
          </Card>
        )}

        {/* ══════════════════════════════════════════════════════════════
            5 + 6. Grid: Visão Âncora + Roda da Vida
        ══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* 4. VISÃO ÂNCORA */}
          <Card>
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontStyle: "italic",
                  fontSize: 20,
                  fontWeight: 400,
                  color: C.green,
                  margin: 0,
                }}
              >
                Visão Âncora
              </h2>
              <Link
                href="/visao-ancora"
                style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, color: C.gold, textDecoration: "none", whiteSpace: "nowrap" }}
              >
                {visao ? "Editar →" : "Criar →"}
              </Link>
            </div>

            {loading ? (
              <div className="flex flex-col gap-2">
                <Skeleton w="90%" h={16} />
                <Skeleton w="75%" h={16} />
                <Skeleton w="50%" h={14} />
              </div>
            ) : visao?.manchete ? (
              <div className="flex flex-col gap-3">
                {/* Eyebrow */}
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    fontWeight: 600,
                    color: C.gold,
                    textTransform: "uppercase",
                    letterSpacing: "0.10em",
                  }}
                >
                  Manchete Forbes
                </span>

                {/* Manchete */}
                <blockquote
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontStyle: "italic",
                    fontSize: "clamp(15px, 2vw, 18px)",
                    fontWeight: 400,
                    color: C.ink,
                    lineHeight: 1.35,
                    margin: 0,
                    paddingLeft: 14,
                    borderLeft: `3px solid ${C.gold}`,
                  }}
                >
                  &ldquo;{visao.manchete}&rdquo;
                </blockquote>

                {/* Declaração truncada */}
                {visao.declaracao && (
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 13,
                      color: C.gray,
                      lineHeight: 1.6,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      margin: 0,
                    }}
                  >
                    {visao.declaracao}
                  </p>
                )}
              </div>
            ) : (
              <div
                className="flex flex-col items-center gap-3 py-6"
                style={{ textAlign: "center" }}
              >
                <span style={{ fontSize: 32 }}>📰</span>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: C.gray, maxWidth: 220 }}>
                  Sua Visão Âncora é o documento mais importante da sua jornada.
                </p>
                <Link
                  href="/visao-ancora"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#fff",
                    background: C.green,
                    padding: "10px 20px",
                    borderRadius: 10,
                    textDecoration: "none",
                  }}
                >
                  Criar agora →
                </Link>
              </div>
            )}
          </Card>

          {/* 5. RODA DA VIDA */}
          <Card>
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontStyle: "italic",
                  fontSize: 20,
                  fontWeight: 400,
                  color: C.green,
                  margin: 0,
                }}
              >
                Roda da Vida
              </h2>
              <Link
                href="/ferramentas/raio-x"
                style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, color: C.gold, textDecoration: "none", whiteSpace: "nowrap" }}
              >
                Atualizar →
              </Link>
            </div>

            {loading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton w={80} h={11} />
                    <Skeleton w="100%" h={6} r={3} />
                    <Skeleton w={22} h={11} />
                  </div>
                ))}
              </div>
            ) : !roda ? (
              <div className="flex flex-col items-center gap-3 py-6" style={{ textAlign: "center" }}>
                <span style={{ fontSize: 32 }}>🎯</span>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: C.gray, maxWidth: 220 }}>
                  Faça o Raio-X 360° para ver seus scores aqui.
                </p>
                <Link
                  href="/ferramentas/raio-x"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#fff",
                    background: C.green,
                    padding: "10px 20px",
                    borderRadius: 10,
                    textDecoration: "none",
                  }}
                >
                  Fazer Raio-X →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {RODA_AREAS.map(({ key, label, emoji, cor }) => {
                  const score = (roda[key] as number) ?? 0;
                  const pct   = (score / 10) * 100;
                  return (
                    <div key={key} className="flex items-center gap-2">
                      {/* Label + emoji */}
                      <div className="flex items-center gap-1.5 flex-shrink-0" style={{ width: 108 }}>
                        <span style={{ fontSize: 13 }}>{emoji}</span>
                        <span
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: 12,
                            color: C.ink,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {label}
                        </span>
                      </div>

                      {/* Barra */}
                      <div
                        className="flex-1 rounded-full overflow-hidden"
                        style={{ height: 6, background: "rgba(26,92,58,0.07)" }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: cor,
                            borderRadius: 99,
                            transition: "width 0.6s ease",
                          }}
                        />
                      </div>

                      {/* Score */}
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 12,
                          fontWeight: 700,
                          color: cor,
                          flexShrink: 0,
                          minWidth: 24,
                          textAlign: "right",
                        }}
                      >
                        {score}
                      </span>
                    </div>
                  );
                })}

                {/* Data do snapshot */}
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: C.gray,
                    marginTop: 6,
                    textAlign: "right",
                  }}
                >
                  Avaliado em {formatDate(roda.created_at)}
                </p>
              </div>
            )}
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
}
