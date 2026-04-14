'use client';

import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';

export default function TrialBanner() {
  const { isTrialActive, isPro, daysRemaining, loading } = useSubscription();
  const [dismissed, setDismissed] = useState(false);

  // Não mostrar: carregando, pro ativo, trial expirado, ou dispensado
  if (loading || isPro || !isTrialActive || dismissed) return null;

  // ── Variantes visuais por urgência ──────────────────────────────────────────

  type Variant = {
    bg:       string;
    border:   string;
    icon:     string;
    msg:      string;
    msgColor: string;
    btnBg:    string;
    btnColor: string;
  };

  const variant: Variant = (() => {
    if (daysRemaining <= 1) return {
      bg:       'linear-gradient(135deg, #2d0a0a, #1a0505)',
      border:   'rgba(239,68,68,0.5)',
      icon:     '🚨',
      msg:      'Último dia! Seu acesso expira hoje.',
      msgColor: '#fca5a5',
      btnBg:    '#ef4444',
      btnColor: '#fff',
    };
    if (daysRemaining <= 3) return {
      bg:       'linear-gradient(135deg, #2d1a00, #1a1000)',
      border:   'rgba(245,158,11,0.5)',
      icon:     '⚠️',
      msg:      `Seu trial expira em ${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'}.`,
      msgColor: '#fcd34d',
      btnBg:    '#f59e0b',
      btnColor: '#0E0E0E',
    };
    return {
      bg:       'linear-gradient(135deg, #1a1200, #0E0E0E)',
      border:   'rgba(200,160,48,0.35)',
      icon:     '🎁',
      msg:      `${daysRemaining} dias de acesso gratuito restantes.`,
      msgColor: '#F5F0E8',
      btnBg:    '#C8A030',
      btnColor: '#0E0E0E',
    };
  })();

  function abrirCheckout() {
    // Redireciona para a página de planos / checkout Stripe
    window.location.href = '/assinar';
  }

  return (
    <div style={{
      background:   variant.bg,
      border:       `1px solid ${variant.border}`,
      borderRadius: 12,
      padding:      '10px 14px',
      display:      'flex',
      alignItems:   'center',
      gap:          10,
      marginBottom: 4,
      flexWrap:     'wrap',
      overflow:     'hidden',
    }}>
      {/* Ícone */}
      <span style={{ fontSize: 18, flexShrink: 0 }}>{variant.icon}</span>

      {/* Mensagem */}
      <p style={{ flex: 1, fontSize: 13, fontWeight: 600, color: variant.msgColor, margin: 0, minWidth: 0, wordBreak: 'break-word' }}>
        {variant.msg}
      </p>

      {/* Botão assinar */}
      <button
        onClick={abrirCheckout}
        style={{
          flexShrink:   0,
          padding:      '7px 16px',
          borderRadius: 8,
          border:       'none',
          cursor:       'pointer',
          fontSize:     12,
          fontWeight:   700,
          letterSpacing: '0.04em',
          background:   variant.btnBg,
          color:        variant.btnColor,
          whiteSpace:   'nowrap',
          transition:   'opacity 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        Assinar agora — R$19/mês
      </button>

      {/* Dispensar (apenas versão confortável) */}
      {daysRemaining > 3 && (
        <button
          onClick={() => setDismissed(true)}
          aria-label="Fechar banner"
          style={{
            flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 16, color: 'rgba(245,240,232,0.3)', lineHeight: 1, padding: '2px 4px',
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
