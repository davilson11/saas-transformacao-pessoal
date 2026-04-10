'use client';

import { useRef, useState } from "react";

// ─── Frases motivacionais ─────────────────────────────────────────────────────

const FRASES = [
  "A jornada de mil milhas começa com um único passo.",
  "Consistência é a chave de toda transformação.",
  "Você já é a melhor versão que já foi.",
  "Cada dia registrado é um dia que não foi desperdiçado.",
  "O autoconhecimento é o início de toda mudança real.",
  "Pequenos avanços diários criam grandes transformações.",
  "Sua história está sendo escrita agora, uma ferramenta de cada vez.",
  "Quem conhece a si mesmo conquista o mundo.",
];

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Props = {
  nome:            string;
  streak:          number;
  notaMedia:       number | null;
  fasesConcluidas: number;  // 0–4
  totalConcluidas: number;  // 0–16
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ExportarProgresso({
  nome,
  streak,
  notaMedia,
  fasesConcluidas,
  totalConcluidas,
}: Props) {
  const cardRef                   = useRef<HTMLDivElement>(null);
  const [baixando, setBaixando]   = useState(false);
  const [frase]                   = useState(() => FRASES[Math.floor(Math.random() * FRASES.length)]);

  const primeiroNome = nome.split(" ")[0] || "Usuário";
  const pctGeral     = Math.round((totalConcluidas / 16) * 100);

  async function baixarCard() {
    if (!cardRef.current) return;
    setBaixando(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0E0E0E",
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
      });
      const url = canvas.toDataURL("image/png");
      const a   = document.createElement("a");
      a.href     = url;
      a.download = `kairos-${primeiroNome.toLowerCase()}-progresso.png`;
      a.click();
    } catch {
      // silencioso
    } finally {
      setBaixando(false);
    }
  }

  // ─── Card capturável (800 × 420) ─────────────────────────────────────────

  const CARD_W = 800;
  const CARD_H = 420;

  return (
    <div>
      {/* Preview responsivo: escala o card de 800px para caber no container */}
      <div
        style={{
          width: "100%",
          overflow: "hidden",
          borderRadius: 16,
          position: "relative",
          /* altura proporcional ao scale — calculada via padding-top trick */
        }}
      >
        <div
          style={{
            width: CARD_W,
            transformOrigin: "top left",
            // A escala é aplicada inline via JS nos elementos mas o wrapper
            // usa position relative para manter o fluxo
          }}
          className="kairos-export-scale"
        >
          {/* ── Card ── */}
          <div
            ref={cardRef}
            style={{
              width:       CARD_W,
              height:      CARD_H,
              background:  "#0E0E0E",
              border:      "2px solid rgba(200,160,48,0.38)",
              borderRadius: 24,
              padding:     "44px 52px",
              display:     "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position:    "relative",
              overflow:    "hidden",
              fontFamily:  "system-ui, sans-serif",
              boxSizing:   "border-box",
            }}
          >
            {/* Linha dourada no topo */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 4,
              background: "linear-gradient(90deg, #C8A030 0%, #e8c76a 55%, transparent 100%)",
            }} />

            {/* Círculos decorativos */}
            <div style={{
              position: "absolute", right: -90, top: -90,
              width: 320, height: 320, borderRadius: "50%",
              border: "1px solid rgba(200,160,48,0.10)",
              pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", right: -44, top: -44,
              width: 210, height: 210, borderRadius: "50%",
              border: "1px solid rgba(200,160,48,0.07)",
              pointerEvents: "none",
            }} />

            {/* ── Linha 1: título + total ── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>

              {/* Logo + saudação */}
              <div>
                <div style={{
                  fontSize: 11, letterSpacing: "0.26em", textTransform: "uppercase",
                  color: "#C8A030", marginBottom: 10, fontWeight: 700,
                }}>
                  KAIROS
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, color: "#F5F0E8", lineHeight: 1.25 }}>
                  {primeiroNome}, sua jornada
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.25 }}>
                  <span style={{ color: "#C8A030" }}>avança</span>
                  <span style={{ color: "#F5F0E8" }}> com intenção.</span>
                </div>
              </div>

              {/* Progresso circular compacto */}
              <div style={{
                flexShrink: 0,
                background: "rgba(200,160,48,0.08)",
                border: "1px solid rgba(200,160,48,0.28)",
                borderRadius: 16,
                padding: "14px 22px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: "#C8A030", lineHeight: 1 }}>
                  {totalConcluidas}<span style={{ fontSize: 20, opacity: 0.6 }}>/16</span>
                </div>
                <div style={{ fontSize: 10, color: "rgba(245,240,232,0.45)", letterSpacing: "0.10em", marginTop: 6 }}>
                  FERRAMENTAS · {pctGeral}%
                </div>
              </div>
            </div>

            {/* ── Linha 2: stats ── */}
            <div style={{ display: "flex", gap: 14 }}>
              {[
                {
                  icon:  "🔥",
                  valor: String(streak),
                  label: streak === 1 ? "dia seguido" : "dias seguidos",
                },
                {
                  icon:  "📔",
                  valor: notaMedia !== null ? notaMedia.toFixed(1) : "—",
                  label: "nota média diário",
                },
                {
                  icon:  "🏆",
                  valor: `${fasesConcluidas}/4`,
                  label: "fases concluídas",
                },
                {
                  icon:  "✨",
                  valor: `${pctGeral}%`,
                  label: "da jornada completa",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(200,160,48,0.12)",
                    borderRadius: 14,
                    padding: "14px 16px",
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#F5F0E8", lineHeight: 1 }}>
                    {s.valor}
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(245,240,232,0.40)", marginTop: 5, lineHeight: 1.4 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Linha 3: frase + rodapé ── */}
            <div>
              <div style={{
                fontSize: 13, color: "rgba(245,240,232,0.52)",
                fontStyle: "italic", lineHeight: 1.55,
              }}>
                "{frase}"
              </div>
              <div style={{
                marginTop: 8,
                fontSize: 9, color: "rgba(200,160,48,0.42)",
                letterSpacing: "0.16em", textTransform: "uppercase",
              }}>
                kairos.app · Transformação Pessoal
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS de escala responsiva */}
      <style>{`
        .kairos-export-scale {
          transform-origin: top left;
          transform: scale(1);
        }
        @container (max-width: 800px) {
          .kairos-export-scale {
            transform: scale(0.9);
          }
        }
      `}</style>

      {/* Botão baixar */}
      <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={baixarCard}
          disabled={baixando}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "var(--font-body)",
            fontSize: 14,
            fontWeight: 700,
            color: "#0E0E0E",
            background: baixando
              ? "rgba(200,160,48,0.60)"
              : "linear-gradient(135deg, #C8A030, #e8c76a)",
            border: "none",
            borderRadius: 12,
            padding: "12px 24px",
            cursor: baixando ? "not-allowed" : "pointer",
            boxShadow: "0 4px 18px rgba(200,160,48,0.28)",
            transition: "opacity 0.15s",
            opacity: baixando ? 0.8 : 1,
          }}
          onMouseEnter={(e) => { if (!baixando) e.currentTarget.style.opacity = "0.88"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          {baixando ? (
            <>⏳ Gerando PNG…</>
          ) : (
            <>⬇ Baixar card de progresso</>
          )}
        </button>

        <span style={{
          fontSize: 12,
          color: "rgba(245,240,232,0.35)",
          fontFamily: "var(--font-body)",
        }}>
          Salvo como PNG · 1600 × 840 px
        </span>
      </div>
    </div>
  );
}
