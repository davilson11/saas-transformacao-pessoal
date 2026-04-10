'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Plano } from '@/lib/stripe';

// ─── Dados dos planos ─────────────────────────────────────────────────────────

const planos = [
  {
    nome:     'Grátis',
    sub:      'Para experimentar sem compromisso',
    preco:    '0',
    periodo:  'para sempre',
    destaque: false,
    tag:      null,
    plano:    null as Plano | null,
    features: [
      { texto: '3 ferramentas desbloqueadas',                  ativo: true  },
      { texto: 'Raio-X 360°, Mapa de Valores e Visão de Futuro', ativo: true  },
      { texto: 'Sem prazo — explore no seu ritmo',             ativo: true  },
      { texto: 'Todas as 16 ferramentas',                      ativo: false },
      { texto: 'Dashboard de evolução',                        ativo: false },
      { texto: 'Histórico e progresso salvo',                  ativo: false },
    ],
    cta:  'Criar conta grátis',
    href: '/sign-up',
  },
  {
    nome:     'Pro Mensal',
    sub:      'Acesso completo, sem compromisso longo',
    preco:    '29',
    periodo:  '/mês · cancele quando quiser',
    destaque: false,
    tag:      null,
    plano:    'mensal' as Plano,
    features: [
      { texto: 'Todas as 16 ferramentas',    ativo: true },
      { texto: 'Dashboard com dados reais',  ativo: true },
      { texto: 'Histórico de progresso',     ativo: true },
      { texto: 'Roda da Vida interativa',    ativo: true },
      { texto: 'Suporte por e-mail',         ativo: true },
      { texto: 'Atualizações inclusas',      ativo: true },
    ],
    cta:  'Assinar Pro — R$29/mês',
    href: null,
  },
  {
    nome:     'Pro Anual',
    sub:      'Melhor valor — economia de 45%',
    preco:    '197',
    periodo:  '/ano · equivale a R$16/mês',
    destaque: true,
    tag:      'Mais popular',
    plano:    'anual' as Plano,
    features: [
      { texto: 'Tudo do Pro Mensal',          ativo: true },
      { texto: '45% de desconto vs mensal',   ativo: true },
      { texto: 'Acesso antecipado a novidades', ativo: true },
      { texto: 'Comunidade exclusiva',         ativo: true },
      { texto: 'Sessão de onboarding',         ativo: true },
      { texto: 'Garantia de 7 dias',           ativo: true },
    ],
    cta:  'Quero o Pro Anual',
    href: null,
  },
] as const;

// ─── Botão de checkout ────────────────────────────────────────────────────────

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
          opacity:  loading ? 0.7 : 1,
          cursor:   loading ? 'not-allowed' : 'pointer',
          border:   'none',
          width:    '100%',
        }}
      >
        {loading ? 'Redirecionando…' : cta}
      </button>
      {erro && (
        <p style={{
          fontSize: 12, color: '#ef4444',
          textAlign: 'center', margin: 0,
        }}>
          {erro}
        </p>
      )}
    </div>
  );
}

// ─── Seção de Preços ──────────────────────────────────────────────────────────

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

              {/* Grátis → Link normal; Pro → Checkout Stripe */}
              {p.plano === null ? (
                <Link
                  href={p.href}
                  className="btn-plan"
                >
                  {p.cta}
                </Link>
              ) : (
                <BotaoCheckout
                  plano={p.plano}
                  cta={p.cta}
                  destaque={p.destaque}
                />
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
