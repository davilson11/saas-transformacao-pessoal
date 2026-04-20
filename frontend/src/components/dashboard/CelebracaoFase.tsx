'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// ─── Dados das fases ──────────────────────────────────────────────────────────

const FASES_INFO = [
  {
    num: 1,
    nome: 'Autoconhecimento',
    emoji: '🪞',
    frase: 'Você se conheceu profundamente. Agora é hora de construir com clareza e intenção.',
    proximaFase: 'Visão e Estratégia',
  },
  {
    num: 2,
    nome: 'Visão e Estratégia',
    emoji: '🗺️',
    frase: 'Sua visão está clara e seu mapa está desenhado. Hora de agir com propósito real.',
    proximaFase: 'Hábitos e Produtividade',
  },
  {
    num: 3,
    nome: 'Hábitos e Produtividade',
    emoji: '⚡',
    frase: 'Seus sistemas estão no lugar. A consistência é agora o seu maior superpoder.',
    proximaFase: 'Mentalidade',
  },
  {
    num: 4,
    nome: 'Mentalidade',
    emoji: '🏆',
    frase: 'Você completou a jornada completa do Kairos. Isso é transformação real e duradoura.',
    proximaFase: null,
  },
] as const;

// ─── Confetti dourado ─────────────────────────────────────────────────────────

type Particle = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
  shape: 'circle' | 'square' | 'rect';
  rotate: number;
};

const COLORS = ['#C8A030', '#e8d08a', '#ffd700', '#F5F0E8', '#A07828', '#f0c040'];

function Confetti() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 48 }, (_, i) => ({
        id:       i,
        left:     Math.random() * 100,
        delay:    Math.random() * 2.2,
        duration: 2.2 + Math.random() * 2,
        size:     5 + Math.random() * 9,
        color:    COLORS[Math.floor(Math.random() * COLORS.length)],
        shape:    (['circle', 'square', 'rect'] as const)[Math.floor(Math.random() * 3)],
        rotate:   Math.random() * 360,
      }))
    );
  }, []);

  return (
    <>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: -12,
            width:  p.shape === 'rect' ? p.size * 2 : p.size,
            height: p.size,
            background: p.color,
            borderRadius:
              p.shape === 'circle' ? '50%'
              : p.shape === 'rect'  ? 2
              : 1,
            opacity: 0,
            transform: `rotate(${p.rotate}deg)`,
            animation: `cfFall ${p.duration}s ${p.delay}s ease-in forwards`,
            pointerEvents: 'none',
          }}
        />
      ))}
    </>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface CelebracaoFaseProps {
  faseConcluida: number | null;
  onFechar: () => void;
}

export default function CelebracaoFase({ faseConcluida, onFechar }: CelebracaoFaseProps) {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    if (faseConcluida !== null) setVisivel(true);
  }, [faseConcluida]);

  if (!visivel || faseConcluida === null) return null;

  const faseNum = faseConcluida;
  const fase = FASES_INFO[faseNum - 1];
  if (!fase) return null;

  function handleFechar() {
    localStorage.setItem(`kairos_fase_${faseNum}_celebrada`, '1');
    setVisivel(false);
    onFechar();
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleFechar}
        style={{
          position: 'fixed', inset: 0, zIndex: 1100,
          background: 'rgba(0,0,0,0.88)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1101,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', pointerEvents: 'none',
      }}>
        <div style={{
          width: '100%', maxWidth: 460,
          background: 'linear-gradient(160deg, #1a1200 0%, #111111 55%, #0e0e0e 100%)',
          border: '1px solid rgba(200,160,48,0.38)',
          borderRadius: 28,
          boxShadow: '0 32px 100px rgba(0,0,0,0.8), 0 0 80px rgba(200,160,48,0.06)',
          overflow: 'hidden',
          pointerEvents: 'all',
          position: 'relative',
          textAlign: 'center',
          padding: '52px 36px 44px',
          animation: 'cfSlideUp 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        }}>

          {/* Confetti layer */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
            <Confetti />
          </div>

          {/* Glow radial */}
          <div style={{
            position: 'absolute', top: -80, left: '50%',
            transform: 'translateX(-50%)',
            width: 360, height: 360, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(200,160,48,0.14) 0%, transparent 70%)',
            pointerEvents: 'none', zIndex: 0,
          }} />

          {/* Conteúdo (acima do confetti) */}
          <div style={{ position: 'relative', zIndex: 1 }}>

            {/* Emoji principal */}
            <div style={{
              fontSize: 68, lineHeight: 1, marginBottom: 22,
              display: 'inline-block',
              animation: 'cfBounce 0.55s 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) both',
            }}>
              {fase.emoji}
            </div>

            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 10, fontWeight: 700, color: '#C8A030',
              background: 'rgba(200,160,48,0.12)',
              border: '1px solid rgba(200,160,48,0.3)',
              padding: '4px 16px', borderRadius: 99,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              marginBottom: 20,
            }}>
              ✦ Fase {faseNum} Concluída
            </div>

            {/* Nome */}
            <h2 style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 30, fontWeight: 300, color: '#F5F0E8',
              margin: '0 0 16px', lineHeight: 1.2,
            }}>
              {fase.nome}
            </h2>

            {/* Frase */}
            <p style={{
              fontSize: 15, color: 'rgba(245,240,232,0.6)',
              margin: '0 0 40px', lineHeight: 1.7,
              fontStyle: 'italic',
            }}>
              &ldquo;{fase.frase}&rdquo;
            </p>

            {/* CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {fase.proximaFase !== null ? (
                <Link
                  href="/ferramentas"
                  onClick={handleFechar}
                  style={{
                    display: 'block',
                    background: 'linear-gradient(135deg, #C8A030 0%, #A07828 100%)',
                    color: '#0E0E0E', fontWeight: 700, fontSize: 15,
                    padding: '14px 28px', borderRadius: 14,
                    textDecoration: 'none',
                    boxShadow: '0 6px 28px rgba(200,160,48,0.4)',
                    transition: 'opacity 0.2s, transform 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.opacity = '0.9';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Próxima fase: {fase.proximaFase} →
                </Link>
              ) : (
                <Link
                  href="/progresso"
                  onClick={handleFechar}
                  style={{
                    display: 'block',
                    background: 'linear-gradient(135deg, #C8A030 0%, #A07828 100%)',
                    color: '#0E0E0E', fontWeight: 700, fontSize: 15,
                    padding: '14px 28px', borderRadius: 14,
                    textDecoration: 'none',
                    boxShadow: '0 6px 28px rgba(200,160,48,0.4)',
                    transition: 'opacity 0.2s, transform 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.opacity = '0.9';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  🏆 Ver meu progresso completo
                </Link>
              )}

              <button
                onClick={handleFechar}
                style={{
                  background: 'transparent', border: 'none',
                  color: 'rgba(245,240,232,0.28)', fontSize: 13,
                  cursor: 'pointer', padding: '8px',
                  fontFamily: 'var(--font-body)',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(245,240,232,0.5)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,240,232,0.28)')}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cfFall {
          0%   { transform: translateY(0px)   rotate(0deg);   opacity: 1;   }
          80%  { opacity: 0.8; }
          100% { transform: translateY(520px) rotate(720deg); opacity: 0;   }
        }
        @keyframes cfBounce {
          0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg);   opacity: 1; }
        }
        @keyframes cfSlideUp {
          0%   { transform: translateY(32px) scale(0.96); opacity: 0; }
          100% { transform: translateY(0)    scale(1);    opacity: 1; }
        }
      `}</style>
    </>
  );
}
