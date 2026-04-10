'use client';

import { useState, useEffect } from "react";
import Link from "next/link";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Passo = 0 | 1 | 2;

type NotifStatus = "idle" | "loading" | "granted" | "denied" | "unsupported";

const STORAGE_KEY = "kairos_onboarding_visto";

// ─── Helper VAPID ─────────────────────────────────────────────────────────────

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw     = window.atob(base64);
  const arr     = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr.buffer as ArrayBuffer;
}

// ─── Conteúdo dos passos ──────────────────────────────────────────────────────

const PASSOS = [
  {
    emoji: "🌟",
    titulo: "Bem-vindo ao Kairos",
    corpo: (
      <>
        <p>
          Kairos é a sua jornada de transformação pessoal de 12 meses — 16
          ferramentas guiadas que ajudam você a se conhecer, planejar e agir com
          intenção.
        </p>
        <p>
          Cada ferramenta é um passo concreto. Juntas, elas constroem a melhor
          versão de você.
        </p>
      </>
    ),
    cta: null,
  },
  {
    emoji: "⚓",
    titulo: "Comece pela Visão Âncora",
    corpo: (
      <>
        <p>
          A <strong style={{ color: "#C8A030" }}>Visão Âncora (F00)</strong> é o
          documento mais importante da sua jornada — define quem você quer ser
          nos próximos 12 meses e ancora todas as suas decisões.
        </p>
        <p>
          Reserve 60 minutos, responda com honestidade e volte a ela sempre que
          precisar de direção.
        </p>
      </>
    ),
    cta: { label: "Criar minha Visão Âncora →", href: "/visao-ancora" },
  },
  {
    emoji: "📔",
    titulo: "Registre seu dia, todo dia",
    corpo: (
      <>
        <p>
          O <strong style={{ color: "#C8A030" }}>Diário de Bordo</strong> é o
          hábito central do Kairos — 5 minutos por dia para registrar vitórias,
          aprendizados e como você está se sentindo.
        </p>
        <p>
          A consistência é o que separa quem sonha de quem transforma. Comece
          hoje.
        </p>
      </>
    ),
    cta: { label: "Abrir Diário de Bordo →", href: "/ferramentas/diario-bordo" },
  },
] as const;

// ─── Ícone fechar ─────────────────────────────────────────────────────────────

function IconeFechar() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M2 2l14 14M16 2L2 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Indicador de passo ───────────────────────────────────────────────────────

function Dots({ atual, total }: { atual: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === atual ? 20 : 8,
            height: 8,
            borderRadius: 99,
            background: i === atual
              ? "#C8A030"
              : i < atual
              ? "rgba(200,160,48,0.35)"
              : "rgba(255,255,255,0.12)",
            transition: "all 0.3s ease",
          }}
        />
      ))}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function Onboarding() {
  const [visivel,     setVisivel]     = useState(false);
  const [passo,       setPasso]       = useState<Passo>(0);
  const [saindo,      setSaindo]      = useState(false);
  const [notifStatus, setNotifStatus] = useState<NotifStatus>("idle");

  // Mostrar apenas na primeira visita
  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisivel(true);
      }
    } catch {
      // localStorage indisponível (SSR ou incognito bloqueado)
    }
  }, []);

  function fechar() {
    setSaindo(true);
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* noop */ }
    setTimeout(() => { setVisivel(false); setSaindo(false); }, 280);
  }

  function avancar() {
    if (passo < 2) {
      setPasso((p) => (p + 1) as Passo);
    } else {
      fechar();
    }
  }

  function voltar() {
    if (passo > 0) setPasso((p) => (p - 1) as Passo);
  }

  async function ativarLembretes() {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setNotifStatus("unsupported");
      return;
    }
    setNotifStatus("loading");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setNotifStatus("denied");
        return;
      }
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: vapidKey ? urlBase64ToUint8Array(vapidKey) : undefined,
      });

      await fetch("/api/notify", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ subscription }),
      });

      setNotifStatus("granted");
    } catch {
      setNotifStatus("denied");
    }
  }

  if (!visivel) return null;

  const step = PASSOS[passo];
  const ultimo = passo === 2;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={fechar}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.72)",
          backdropFilter: "blur(4px)",
          zIndex: 999,
          opacity: saindo ? 0 : 1,
          transition: "opacity 0.28s ease",
        }}
      />

      {/* Painel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Onboarding Kairos — passo ${passo + 1} de 3`}
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          zIndex: 1000,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            background: "#0E0E0E",
            border: "1px solid rgba(200,160,48,0.30)",
            borderRadius: 20,
            width: "100%",
            maxWidth: 480,
            boxShadow: "0 32px 80px rgba(0,0,0,0.70), 0 0 0 1px rgba(200,160,48,0.08)",
            overflow: "hidden",
            pointerEvents: "auto",
            opacity: saindo ? 0 : 1,
            transform: saindo ? "scale(0.96) translateY(8px)" : "scale(1) translateY(0)",
            transition: "opacity 0.28s ease, transform 0.28s ease",
          }}
        >
          {/* Barra dourada superior */}
          <div
            style={{
              height: 3,
              background: "linear-gradient(90deg, #C8A030 0%, #a07820 100%)",
            }}
          />

          {/* Conteúdo */}
          <div style={{ padding: "32px 32px 28px" }}>

            {/* Header: emoji + fechar */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              {/* Emoji em círculo */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "rgba(200,160,48,0.12)",
                  border: "1px solid rgba(200,160,48,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  flexShrink: 0,
                }}
              >
                {step.emoji}
              </div>

              {/* Botão fechar */}
              <button
                onClick={fechar}
                aria-label="Fechar onboarding"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(245,244,240,0.35)",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 6,
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "rgba(245,244,240,0.80)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(245,244,240,0.35)")
                }
              >
                <IconeFechar />
              </button>
            </div>

            {/* Título */}
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(22px, 4vw, 28px)",
                fontWeight: 700,
                color: "#f5f4f0",
                margin: "0 0 16px",
                lineHeight: 1.2,
              }}
            >
              {step.titulo}
            </h2>

            {/* Corpo */}
            <div
              style={{
                fontSize: 15,
                color: "rgba(245,244,240,0.65)",
                lineHeight: 1.7,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {step.corpo}
            </div>

            {/* CTA do passo (se houver) */}
            {step.cta && (
              <Link
                href={step.cta.href}
                onClick={fechar}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#0E0E0E",
                  background: "#C8A030",
                  padding: "11px 22px",
                  borderRadius: 12,
                  textDecoration: "none",
                  marginTop: 20,
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 18px rgba(200,160,48,0.30)",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                {step.cta.label}
              </Link>
            )}

            {/* Botão de notificações — último passo apenas */}
            {ultimo && (
              <div style={{ marginTop: 16 }}>
                {notifStatus === "granted" ? (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    fontFamily: "var(--font-body)", fontSize: 13,
                    color: "#4ade80",
                    background: "rgba(74,222,128,0.10)",
                    border: "1px solid rgba(74,222,128,0.25)",
                    borderRadius: 10, padding: "10px 16px",
                  }}>
                    <span>✓</span>
                    <span>Lembretes diários ativados às 20h!</span>
                  </div>
                ) : notifStatus === "denied" ? (
                  <p style={{
                    fontFamily: "var(--font-body)", fontSize: 12,
                    color: "rgba(245,244,240,0.40)",
                    margin: 0, lineHeight: 1.5,
                  }}>
                    🔕 Notificações bloqueadas. Você pode ativar nas configurações do navegador.
                  </p>
                ) : notifStatus === "unsupported" ? (
                  <p style={{
                    fontFamily: "var(--font-body)", fontSize: 12,
                    color: "rgba(245,244,240,0.35)", margin: 0,
                  }}>
                    Notificações não suportadas neste navegador.
                  </p>
                ) : (
                  <button
                    onClick={ativarLembretes}
                    disabled={notifStatus === "loading"}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600,
                      color: "#C8A030",
                      background: "rgba(200,160,48,0.10)",
                      border: "1px solid rgba(200,160,48,0.30)",
                      borderRadius: 10, padding: "10px 18px",
                      cursor: notifStatus === "loading" ? "not-allowed" : "pointer",
                      opacity: notifStatus === "loading" ? 0.7 : 1,
                      transition: "opacity 0.15s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {notifStatus === "loading" ? (
                      <>⏳ Ativando…</>
                    ) : (
                      <>🔔 Ativar lembretes diários</>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer: dots + navegação */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 32px 24px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Dots atual={passo} total={3} />

            <div style={{ display: "flex", gap: 10 }}>
              {passo > 0 && (
                <button
                  onClick={voltar}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.14)",
                    borderRadius: 10,
                    color: "rgba(245,244,240,0.55)",
                    fontFamily: "var(--font-body)",
                    fontSize: 13,
                    fontWeight: 600,
                    padding: "9px 18px",
                    cursor: "pointer",
                    transition: "border-color 0.15s, color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.30)";
                    e.currentTarget.style.color = "rgba(245,244,240,0.85)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
                    e.currentTarget.style.color = "rgba(245,244,240,0.55)";
                  }}
                >
                  ← Voltar
                </button>
              )}

              <button
                onClick={avancar}
                style={{
                  background: ultimo ? "#C8A030" : "rgba(200,160,48,0.15)",
                  border: `1px solid ${ultimo ? "#C8A030" : "rgba(200,160,48,0.35)"}`,
                  borderRadius: 10,
                  color: ultimo ? "#0E0E0E" : "#C8A030",
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  fontWeight: 700,
                  padding: "9px 20px",
                  cursor: "pointer",
                  transition: "opacity 0.15s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                {ultimo ? "Começar agora ✓" : "Próximo →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
