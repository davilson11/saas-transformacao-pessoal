'use client';

import { useRef, useState } from "react";

// ─── Frases motivacionais ─────────────────────────────────────────────────────

const FRASES = [
  "A jornada de mil milhas começa com um único passo.",
  "Consistência é a chave de toda transformação.",
  "O autoconhecimento é o início de toda mudança real.",
  "Cada dia registrado é um dia que não foi desperdiçado.",
  "Pequenos avanços diários criam grandes transformações.",
  "Sua história está sendo escrita agora, uma ferramenta de cada vez.",
  "Quem conhece a si mesmo conquista o mundo.",
  "A clareza sobre si mesmo é o superpoder mais raro.",
];

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Props = {
  nome:            string;
  streak:          number;
  notaMedia:       number | null;
  fasesConcluidas: number;   // 0–4
  totalConcluidas: number;   // 0–16
};

type Formato = 'stories' | 'quadrado';

// ─── Dimensões ────────────────────────────────────────────────────────────────
// CSS em px; html2canvas exporta em scale 2 → resolução 2×

const DIMS: Record<Formato, { w: number; h: number; label: string }> = {
  stories:  { w: 540, h: 960,  label: '1080 × 1920 px · Stories' },
  quadrado: { w: 540, h: 540,  label: '1080 × 1080 px · Post'    },
};

// Largura máxima do preview na tela
const PREVIEW_W: Record<Formato, number> = {
  stories:  264,   // escala ≈ 0.489
  quadrado: 360,   // escala ≈ 0.667
};

// ─── Tokens de design ─────────────────────────────────────────────────────────

const G     = '#0E0E0E';
const GOLD  = '#C8A030';
const GOLD2 = '#e8c76a';
const CREAM = '#F5F0E8';

// ─── Progress Ring SVG ────────────────────────────────────────────────────────

function ProgressRing({ pct, size, stroke }: { pct: number; size: number; stroke: number }) {
  const r      = (size - stroke) / 2;
  const circ   = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="rgba(200,160,48,0.12)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="url(#goldGrad)" strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset} />
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={GOLD} />
          <stop offset="100%" stopColor={GOLD2} />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Card Stories (540 × 960) ─────────────────────────────────────────────────

function CardStories({
  primeiroNome, streak, notaMedia, fasesConcluidas, totalConcluidas, pctGeral, frase,
}: {
  primeiroNome: string; streak: number; notaMedia: number | null;
  fasesConcluidas: number; totalConcluidas: number; pctGeral: number; frase: string;
}) {
  const STATS = [
    { icon: '🔥', valor: String(streak),                        label: streak === 1 ? 'dia seguido' : 'dias seguidos' },
    { icon: '📔', valor: notaMedia !== null ? notaMedia.toFixed(1) : '—', label: 'nota média diário' },
    { icon: '🏆', valor: `${fasesConcluidas}/4`,                label: 'fases concluídas'  },
    { icon: '✨', valor: `${totalConcluidas}/16`,               label: 'ferramentas feitas' },
  ];

  return (
    <div style={{
      width: 540, height: 960,
      background: G,
      border: `2px solid rgba(200,160,48,0.35)`,
      borderRadius: 32,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxSizing: 'border-box',
    }}>

      {/* Linha dourada topo */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2}, transparent)`, zIndex: 2 }} />

      {/* Círculos decorativos */}
      <div style={{ position: 'absolute', right: -110, top: -110, width: 400, height: 400, borderRadius: '50%', border: '1px solid rgba(200,160,48,0.08)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: -60, top: -60,   width: 260, height: 260, borderRadius: '50%', border: '1px solid rgba(200,160,48,0.06)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', left: -80, bottom: -80,  width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(200,160,48,0.06)', pointerEvents: 'none' }} />

      {/* ── Topo: logo ── */}
      <div style={{ padding: '44px 44px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <div>
          <div style={{ fontSize: 13, letterSpacing: '0.30em', textTransform: 'uppercase' as const, color: GOLD, fontWeight: 800, lineHeight: 1 }}>
            KAIROS
          </div>
          <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.35)', letterSpacing: '0.10em', marginTop: 5, textTransform: 'uppercase' as const }}>
            Transformação Pessoal
          </div>
        </div>
        <div style={{
          background: 'rgba(200,160,48,0.10)', border: `1px solid rgba(200,160,48,0.28)`,
          borderRadius: 12, padding: '8px 16px', textAlign: 'center' as const,
        }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: GOLD, lineHeight: 1 }}>
            {pctGeral}<span style={{ fontSize: 13 }}>%</span>
          </div>
          <div style={{ fontSize: 9, color: 'rgba(245,240,232,0.40)', letterSpacing: '0.08em', marginTop: 4, textTransform: 'uppercase' as const }}>
            concluído
          </div>
        </div>
      </div>

      {/* ── Herói: anel de progresso ── */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '40px 44px 20px', gap: 0, position: 'relative', zIndex: 1,
      }}>
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <ProgressRing pct={pctGeral} size={220} stroke={14} />
          <div style={{
            position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          }}>
            <span style={{ fontSize: 58, fontWeight: 900, color: CREAM, lineHeight: 1, letterSpacing: '-0.02em' }}>
              {pctGeral}
            </span>
            <span style={{ fontSize: 14, color: GOLD, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>
              %
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'center' as const, marginTop: 20 }}>
          <div style={{ fontSize: 34, fontWeight: 800, color: CREAM, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
            {primeiroNome},
          </div>
          <div style={{ fontSize: 28, fontWeight: 400, color: CREAM, lineHeight: 1.3, marginTop: 4 }}>
            sua jornada <span style={{ color: GOLD, fontStyle: 'italic' as const, fontWeight: 700 }}>avança</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 400, color: CREAM, lineHeight: 1.3 }}>
            com intenção.
          </div>
        </div>
      </div>

      {/* ── Stats 2 × 2 ── */}
      <div style={{ padding: '0 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, position: 'relative', zIndex: 1 }}>
        {STATS.map((s) => (
          <div key={s.label} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(200,160,48,0.14)',
            borderRadius: 18,
            padding: '20px 22px',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{ fontSize: 26 }}>{s.icon}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: CREAM, lineHeight: 1, letterSpacing: '-0.01em' }}>
              {s.valor}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.42)', lineHeight: 1.4 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Frase + rodapé ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '28px 44px 44px', position: 'relative', zIndex: 1 }}>
        <div style={{
          borderLeft: `3px solid rgba(200,160,48,0.45)`,
          paddingLeft: 18,
          marginBottom: 28,
        }}>
          <div style={{ fontSize: 15, color: 'rgba(245,240,232,0.60)', fontStyle: 'italic' as const, lineHeight: 1.65 }}>
            &ldquo;{frase}&rdquo;
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(200,160,48,0.15)' }} />
          <div style={{ fontSize: 10, color: 'rgba(200,160,48,0.50)', letterSpacing: '0.20em', textTransform: 'uppercase' as const, whiteSpace: 'nowrap' as const }}>
            kairos.app
          </div>
          <div style={{ flex: 1, height: 1, background: 'rgba(200,160,48,0.15)' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Card Quadrado (540 × 540) ────────────────────────────────────────────────

function CardQuadrado({
  primeiroNome, streak, notaMedia, fasesConcluidas, totalConcluidas, pctGeral, frase,
}: {
  primeiroNome: string; streak: number; notaMedia: number | null;
  fasesConcluidas: number; totalConcluidas: number; pctGeral: number; frase: string;
}) {
  const STATS = [
    { icon: '🔥', valor: String(streak),                             label: 'dias' },
    { icon: '📔', valor: notaMedia !== null ? notaMedia.toFixed(1) : '—', label: 'nota' },
    { icon: '🏆', valor: `${fasesConcluidas}/4`,                    label: 'fases' },
    { icon: '✨', valor: `${totalConcluidas}/16`,                   label: 'tools' },
  ];

  const barW = Math.round(pctGeral * 4.08); // 408px = 76% of 540

  return (
    <div style={{
      width: 540, height: 540,
      background: G,
      border: `2px solid rgba(200,160,48,0.35)`,
      borderRadius: 32,
      display: 'flex',
      flexDirection: 'column',
      padding: '0 0 36px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxSizing: 'border-box',
    }}>

      {/* Linha dourada topo */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2}, transparent)`, zIndex: 2 }} />

      {/* Círculo decorativo */}
      <div style={{ position: 'absolute', right: -80, top: -80, width: 320, height: 320, borderRadius: '50%', border: '1px solid rgba(200,160,48,0.09)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: -30, top: -30, width: 190, height: 190, borderRadius: '50%', border: '1px solid rgba(200,160,48,0.06)', pointerEvents: 'none' }} />

      {/* ── Topo: logo + título ── */}
      <div style={{ padding: '40px 42px 0', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase' as const, color: GOLD, fontWeight: 800 }}>
              KAIROS
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: CREAM, lineHeight: 1.15, letterSpacing: '-0.01em' }}>
                {primeiroNome}, sua jornada
              </div>
              <div style={{ fontSize: 24, fontWeight: 400, color: CREAM, lineHeight: 1.2, marginTop: 2 }}>
                <span style={{ color: GOLD, fontStyle: 'italic' as const, fontWeight: 700 }}>avança</span> com intenção.
              </div>
            </div>
          </div>
          {/* Anel compacto */}
          <div style={{ position: 'relative', flexShrink: 0, marginTop: 4 }}>
            <ProgressRing pct={pctGeral} size={88} stroke={7} />
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 22, fontWeight: 900, color: CREAM, lineHeight: 1 }}>{pctGeral}</span>
              <span style={{ fontSize: 10, color: GOLD, fontWeight: 700, letterSpacing: '0.04em' }}>%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats 1 × 4 ── */}
      <div style={{ padding: '0 32px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, position: 'relative', zIndex: 1 }}>
        {STATS.map((s) => (
          <div key={s.label} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(200,160,48,0.14)',
            borderRadius: 16,
            padding: '14px 10px',
            display: 'flex', flexDirection: 'column', alignItems: 'center' as const, gap: 5,
          }}>
            <div style={{ fontSize: 20 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: CREAM, lineHeight: 1, letterSpacing: '-0.01em' }}>
              {s.valor}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(245,240,232,0.38)', letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Barra de progresso ── */}
      <div style={{ padding: '22px 42px 0', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: 'rgba(245,240,232,0.40)', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
            Progresso Geral
          </span>
          <span style={{ fontSize: 13, fontWeight: 800, color: GOLD, fontFamily: 'monospace' }}>
            {pctGeral}%
          </span>
        </div>
        <div style={{ height: 8, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pctGeral}%`,
            background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`,
            borderRadius: 99,
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7 }}>
          <span style={{ fontSize: 10, color: 'rgba(245,240,232,0.25)' }}>0%</span>
          <span style={{ fontSize: 10, color: 'rgba(245,240,232,0.25)'}}>{totalConcluidas} de 16 ferramentas</span>
          <span style={{ fontSize: 10, color: 'rgba(245,240,232,0.25)' }}>100%</span>
        </div>
      </div>

      {/* ── Frase + rodapé ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 42px', position: 'relative', zIndex: 1 }}>
        <div style={{ borderLeft: `2px solid rgba(200,160,48,0.40)`, paddingLeft: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: 'rgba(245,240,232,0.55)', fontStyle: 'italic' as const, lineHeight: 1.55 }}>
            &ldquo;{frase}&rdquo;
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(200,160,48,0.13)' }} />
          <div style={{ fontSize: 9, color: 'rgba(200,160,48,0.45)', letterSpacing: '0.22em', textTransform: 'uppercase' as const }}>
            kairos.app
          </div>
          <div style={{ flex: 1, height: 1, background: 'rgba(200,160,48,0.13)' }} />
        </div>
      </div>

      {/* barW ref used inline above but unused var suppressed */}
      <div style={{ display: 'none' }}>{barW}</div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ExportarProgresso({
  nome,
  streak,
  notaMedia,
  fasesConcluidas,
  totalConcluidas,
}: Props) {
  const cardRef                   = useRef<HTMLDivElement>(null);
  const [baixando, setBaixando]   = useState(false);
  const [formato, setFormato]     = useState<Formato>('stories');
  const [frase]                   = useState(() => FRASES[Math.floor(Math.random() * FRASES.length)]);

  const primeiroNome = nome.split(' ')[0] || 'Usuário';
  const pctGeral     = Math.round((totalConcluidas / 16) * 100);
  const dims         = DIMS[formato];
  const previewW     = PREVIEW_W[formato];
  const previewScale = previewW / dims.w;
  const previewH     = Math.round(dims.h * previewScale);

  async function baixarCard() {
    if (!cardRef.current) return;
    setBaixando(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: G,
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
      });
      const url = canvas.toDataURL('image/png');
      const a   = document.createElement('a');
      a.href     = url;
      a.download = `kairos-${primeiroNome.toLowerCase()}-${formato}.png`;
      a.click();
    } catch {
      // silencioso
    } finally {
      setBaixando(false);
    }
  }

  const sharedProps = { primeiroNome, streak, notaMedia, fasesConcluidas, totalConcluidas, pctGeral, frase };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Seletor de formato ── */}
      <div style={{ display: 'flex', gap: 8 }}>
        {(['stories', 'quadrado'] as Formato[]).map((f) => (
          <button
            key={f}
            onClick={() => setFormato(f)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: formato === f ? 700 : 500,
              color: formato === f ? '#0E0E0E' : GOLD,
              background: formato === f
                ? `linear-gradient(135deg, ${GOLD}, ${GOLD2})`
                : 'rgba(200,160,48,0.08)',
              border: `1px solid ${formato === f ? 'transparent' : 'rgba(200,160,48,0.28)'}`,
              borderRadius: 10, padding: '8px 16px', cursor: 'pointer',
              transition: 'all 0.15s',
              boxShadow: formato === f ? `0 4px 14px rgba(200,160,48,0.30)` : 'none',
            }}
          >
            {f === 'stories'  ? '📱 Stories (9:16)' : '⬛ Post (1:1)'}
          </button>
        ))}
      </div>

      {/* ── Preview ── */}
      <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* Container do preview — altura exata para não vazar */}
        <div style={{
          width: previewW,
          height: previewH,
          overflow: 'hidden',
          borderRadius: 16,
          flexShrink: 0,
          boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
          position: 'relative',
        }}>
          {/* Card em tamanho real, escalado para preview */}
          <div style={{
            width: dims.w,
            height: dims.h,
            transformOrigin: 'top left',
            transform: `scale(${previewScale})`,
            position: 'absolute',
            top: 0, left: 0,
          }}>
            <div ref={cardRef}>
              {formato === 'stories' ? (
                <CardStories {...sharedProps} />
              ) : (
                <CardQuadrado {...sharedProps} />
              )}
            </div>
          </div>
        </div>

        {/* Info lateral */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8, flex: 1, minWidth: 200 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 700, color: '#1E392A', margin: '0 0 4px', lineHeight: 1.2 }}>
              {formato === 'stories' ? 'Instagram Stories' : 'Post Quadrado'}
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-brand-gray)', margin: 0, lineHeight: 1.5 }}>
              {dims.label}
            </p>
          </div>

          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Resolução 2× para telas retina',
              'Fundo preto premium Kairos',
              'Pronto para postar no Instagram',
            ].map((item) => (
              <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--color-brand-gray)', lineHeight: 1.5 }}>
                <span style={{ color: GOLD, flexShrink: 0, marginTop: 1 }}>→</span>
                {item}
              </li>
            ))}
          </ul>

          {/* Botão baixar */}
          <button
            onClick={baixarCard}
            disabled={baixando}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700,
              color: '#0E0E0E',
              background: baixando
                ? 'rgba(200,160,48,0.55)'
                : `linear-gradient(135deg, ${GOLD}, ${GOLD2})`,
              border: 'none', borderRadius: 12,
              padding: '13px 24px',
              cursor: baixando ? 'not-allowed' : 'pointer',
              boxShadow: baixando ? 'none' : '0 4px 18px rgba(200,160,48,0.32)',
              transition: 'opacity 0.15s, transform 0.15s',
              opacity: baixando ? 0.75 : 1,
              width: '100%',
              justifyContent: 'center' as const,
            }}
            onMouseEnter={(e) => { if (!baixando) { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {baixando ? '⏳ Gerando PNG…' : '⬇ Baixar como PNG'}
          </button>

          <p style={{ fontSize: 11, color: 'rgba(30,57,42,0.40)', margin: 0, textAlign: 'center' as const, fontFamily: 'var(--font-body)' }}>
            {dims.label.split(' · ')[0]} · PNG de alta resolução
          </p>
        </div>
      </div>
    </div>
  );
}
