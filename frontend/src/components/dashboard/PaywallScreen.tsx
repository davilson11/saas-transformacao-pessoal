'use client';

import { useState } from 'react';
import { PRICE_IDS } from '@/lib/stripe';

const GOLD  = '#C8A030';
const DARK  = '#0E0E0E';
const CREAM = '#F5F0E8';
const CARD  = '#141414';

type Plano = 'mensal' | 'anual';

export default function PaywallScreen() {
  const [loading, setLoading] = useState<Plano | null>(null);
  const [erro,    setErro]    = useState<string | null>(null);

  async function irParaCheckout(plano: Plano) {
    setErro(null);
    setLoading(plano);
    try {
      const priceId = PRICE_IDS[plano];
      if (!priceId) throw new Error(`Price ID para "${plano}" não configurado. Adicione NEXT_PUBLIC_STRIPE_PRICE_${plano.toUpperCase()} no .env.local`);

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? 'Erro ao criar sessão de checkout');
      }

      const { url } = await res.json() as { url?: string; sessionId?: string };
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('URL de checkout não retornada pela API');
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro inesperado');
      setLoading(null);
    }
  }

  return (
    <div style={{
      position:       'fixed',
      inset:          0,
      background:     DARK,
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '24px',
      zIndex:         9999,
      fontFamily:     'var(--font-body)',
    }}>
      {/* Ornamento de fundo */}
      <div style={{
        position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200,160,48,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', maxWidth: 480, width: '100%', textAlign: 'center' }}>

        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <p style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 13, fontWeight: 400, color: GOLD,
            letterSpacing: '0.3em', textTransform: 'uppercase', margin: '0 0 8px',
          }}>
            KAIROS
          </p>
          <div style={{ width: 32, height: 1, background: 'rgba(200,160,48,0.4)', margin: '0 auto' }} />
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 400,
          color: CREAM, margin: '0 0 12px', lineHeight: 1.2,
        }}>
          Sua jornada não para aqui.
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(245,240,232,0.6)', margin: '0 0 40px', lineHeight: 1.7 }}>
          Seu período gratuito terminou.<br />
          Continue sua transformação com acesso completo.
        </p>

        {/* Cards de plano */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 32 }}>

          {/* Mensal */}
          <div style={{
            background:   CARD,
            border:       `1px solid rgba(200,160,48,0.25)`,
            borderRadius: 16,
            padding:      '24px 20px',
            textAlign:    'center',
          }}>
            <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 10px' }}>Pro Mensal</p>
            <p style={{ fontSize: 34, fontWeight: 800, color: CREAM, margin: '0 0 2px', lineHeight: 1 }}>R$19</p>
            <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.4)', margin: '0 0 20px' }}>/mês</p>
            <button
              onClick={() => irParaCheckout('mensal')}
              disabled={loading !== null}
              style={{
                width:        '100%',
                padding:      '12px 0',
                borderRadius: 10,
                border:       `1.5px solid rgba(200,160,48,0.5)`,
                background:   'transparent',
                color:        GOLD,
                fontSize:     13,
                fontWeight:   700,
                cursor:       loading ? 'wait' : 'pointer',
                transition:   'all 0.2s',
                letterSpacing: '0.03em',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,160,48,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              {loading === 'mensal' ? 'Aguarde…' : 'Assinar mensal'}
            </button>
          </div>

          {/* Anual — destaque */}
          <div style={{
            background:   `linear-gradient(145deg, #1e1000, #141000)`,
            border:       `1.5px solid rgba(200,160,48,0.55)`,
            borderRadius: 16,
            padding:      '24px 20px',
            textAlign:    'center',
            position:     'relative',
          }}>
            {/* Badge economia */}
            <span style={{
              position:     'absolute',
              top:          -11,
              left:         '50%',
              transform:    'translateX(-50%)',
              background:   GOLD,
              color:        DARK,
              fontSize:     10,
              fontWeight:   800,
              letterSpacing: '0.06em',
              borderRadius: 99,
              padding:      '3px 12px',
              whiteSpace:   'nowrap',
            }}>
              ECONOMIZE 35%
            </span>
            <p style={{ fontSize: 10, color: 'rgba(200,160,48,0.7)', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 10px' }}>Pro Anual</p>
            <p style={{ fontSize: 34, fontWeight: 800, color: CREAM, margin: '0 0 2px', lineHeight: 1 }}>R$147</p>
            <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.5)', margin: '0 0 20px' }}>/ano · R$12,25/mês</p>
            <button
              onClick={() => irParaCheckout('anual')}
              disabled={loading !== null}
              style={{
                width:         '100%',
                padding:       '12px 0',
                borderRadius:  10,
                border:        'none',
                background:    GOLD,
                color:         DARK,
                fontSize:      13,
                fontWeight:    800,
                cursor:        loading ? 'wait' : 'pointer',
                transition:    'opacity 0.2s',
                letterSpacing: '0.03em',
                boxShadow:     '0 4px 18px rgba(200,160,48,0.4)',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              {loading === 'anual' ? 'Aguarde…' : 'Assinar anual'}
            </button>
          </div>
        </div>

        {/* Erro de checkout */}
        {erro && (
          <p style={{ fontSize: 12, color: '#fca5a5', marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }}>
            ⚠️ {erro}
          </p>
        )}

        {/* Nota tranquilizadora */}
        <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.35)', margin: 0, lineHeight: 1.6 }}>
          🔒 Seus dados estão salvos e te esperando.<br />
          Cancele a qualquer momento, sem multas.
        </p>

      </div>
    </div>
  );
}
