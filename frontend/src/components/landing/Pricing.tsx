'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Plano } from '@/lib/stripe';

const planos = [
  {
    nome:     'Trial',
    sub:      '7 dias grátis com acesso completo',
    preco:    '0',
    periodo:  '7 dias grátis · sem cartão de crédito',
    destaque: false,
    tag:      null,
    badge:    '7 dias grátis' as string | null,
    plano:    null as Plano | null,
    features: [
      { texto: 'Acesso completo por 7 dias',      ativo: true  },
      { texto: 'Todas as 16 ferramentas',         ativo: true  },
      { texto: 'Dashboard de evolução',           ativo: true  },
      { texto: 'Histórico e progresso salvo',     ativo: true  },
      { texto: 'Sem cartão de crédito',           ativo: true  },
      { texto: 'Suporte por e-mail',              ativo: false },
    ],
    cta:  'Começar grátis — 7 dias',
    href: '/sign-up',
  },
  {
    nome:     'Pro Mensal',
    sub:      'Acesso completo, sem compromisso longo',
    preco:    '19',
    periodo:  '/mês · cancele quando quiser',
    destaque: false,
    tag:      null,
    badge:    '7 dias grátis' as string | null,
    plano:    'mensal' as Plano,
    features: [
      { texto: 'Todas as 16 ferramentas',   ativo: true },
      { texto: 'Dashboard com dados reais', ativo: true },
      { texto: 'Histórico de progresso',    ativo: true },
      { texto: 'Roda da Vida interativa',   ativo: true },
      { texto: 'Suporte por e-mail',        ativo: true },
      { texto: 'Atualizações inclusas',     ativo: true },
    ],
    cta:  'Assinar Pro — R$19/mês',
    href: null,
  },
  {
    nome:     'Pro Anual',
    sub:      'Melhor valor — equivale a R$12/mês',
    preco:    '147',
    periodo:  '/ano · você economiza R$81',
    destaque: true,
    tag:      'Mais popular',
    badge:    '7 dias grátis' as string | null,
    plano:    'anual' as Plano,
    features: [
      { texto: 'Tudo do Pro Mensal',              ativo: true },
      { texto: 'Economia de R$81 vs mensal',      ativo: true },
      { texto: 'Acesso antecipado a novidades',   ativo: true },
      { texto: 'Comunidade exclusiva',            ativo: true },
      { texto: 'Sessão de onboarding',            ativo: true },
      { texto: 'Garantia de 7 dias',              ativo: true },
    ],
    cta:  'Quero o Pro Anual — R$147/ano',
    href: null,
  },
] as const;

function BotaoCheckout({
  plano,
  cta,
  destaque,
}: {
  plano:    Plano;
  cta:      string;
  destaque: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [erro,    setErro]    = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch('/api/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plano }),
      });

      const json = await res.json() as { url?: string; error?: string };

      if (!res.ok || !json.url) {
        setErro(json.error ?? 'Erro ao iniciar checkout.');
        return;
      }

      window.location.href = json.url;
    } catch {
      setErro('Falha de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`btn-plan${destaque ? ' btn-plan-featured' : ''}`}
        style={{
          opacity: loading ? 0.7 : 1,
          cursor:  loading ? 'not-allowed' : 'pointer',
          border:  'none',
          width:   '100%',
        }}
      >
        {loading ? 'Redirecionando…' : cta}
      </button>
      {erro && (
        <p style={{ fontSize: 12, color: '#ef4444', textAlign: 'center', margin: 0 }}>
          {erro}
        </p>
      )}
    </div>
  );
}

export function Pricing() {
  return (
    <section className="section pricing" id="precos">
      <div className="container">
        <div className="section-label" style={{ textAlign: 'center' }}>Investimento</div>
        <h2 className="section-title" style={{ textAlign: 'center' }}>
          Comece agora.<br /><em>Sem desculpa de preço.</em>
        </h2>
        <p className="pricing-intro">
          Menos que um café por semana. Cancele quando quiser.
        </p>

        <div className="pricing-grid">
          {planos.map((p) => (
            <div key={p.nome} className={`pricing-card${p.destaque ? ' featured' : ''}`}>
              {p.tag && <div className="pricing-tag">{p.tag}</div>}
              <div className="pricing-name">{p.nome}</div>
              <div className="pricing-sub">{p.sub}</div>
              {p.badge && (
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(34,197,94,0.15)',
                  border: '1px solid rgba(34,197,94,0.4)',
                  color: '#22c55e',
                  fontSize: '.68rem', fontWeight: 700,
                  letterSpacing: '.1em', textTransform: 'uppercase',
                  padding: '.22rem .75rem', borderRadius: 99,
                  marginBottom: '1.25rem',
                }}>
                  ✦ {p.badge}
                </div>
              )}
              <div className="pricing-val">
                <span className="curr">{p.preco !== '0' ? 'R$' : ''}</span>
                <span className="num">{p.preco === '0' ? 'Grátis' : p.preco}</span>
              </div>
              <div className="pricing-period">{p.periodo}</div>
              <ul className="pricing-features">
                {p.features.map((f) => (
                  <li key={f.texto} className={f.ativo ? '' : 'off'}>
                    {f.texto}
                  </li>
                ))}
              </ul>

              {p.plano === null ? (
                <Link href={p.href} className="btn-plan">{p.cta}</Link>
              ) : (
                <BotaoCheckout plano={p.plano} cta={p.cta} destaque={p.destaque} />
              )}
            </div>
          ))}
        </div>

        <div className="pricing-footer">
          <span>🔒 Pagamento seguro via Stripe · SSL</span>
          <span>🛡️ Garantia de 7 dias no plano anual</span>
          <span>❌ Sem fidelidade no plano mensal</span>
        </div>
      </div>
    </section>
  );
}
