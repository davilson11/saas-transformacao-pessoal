'use client';

import Link from 'next/link';
import { useState } from 'react';

// ─── Planos ───────────────────────────────────────────────────────────────────

const planos = [
  {
    id:       'mensal' as const,
    nome:     'Pro Mensal',
    sub:      'Flexibilidade total — cancele quando quiser',
    preco:    '19',
    periodo:  '/mês após os 7 dias grátis',
    destaque: false,
    tag:      null as string | null,
    features: [
      'Todas as 16 ferramentas guiadas',
      'Dashboard com dados reais',
      'Histórico de progresso',
      'Roda da Vida interativa',
      'Momento Kairos diário',
      'Suporte por e-mail',
    ],
  },
  {
    id:       'anual' as const,
    nome:     'Pro Anual',
    sub:      'Melhor valor — equivale a R$12,25/mês',
    preco:    '147',
    periodo:  '/ano após os 7 dias grátis · você economiza 35%',
    destaque: true,
    tag:      'Mais popular' as string | null,
    features: [
      'Tudo do Pro Mensal',
      'Economia de R$81 vs mensal',
      'Acesso antecipado a novidades',
      'Comunidade exclusiva',
      'Sessão de onboarding guiado',
      'Garantia de 7 dias',
    ],
  },
] as const;

// ─── Componente ───────────────────────────────────────────────────────────────

export function Pricing() {
  const [loadingId, setLoadingId] = useState<'mensal' | 'anual' | null>(null);
  const [erro,      setErro]      = useState<string | null>(null);

  async function irParaCheckout(plano: 'mensal' | 'anual') {
    setErro(null);
    setLoadingId(plano);
    try {
      const res = await fetch('/api/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plano }),
      });
      const json = await res.json() as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        // Se não autenticado, redirecionar para cadastro
        if (res.status === 401) { window.location.href = '/sign-up'; return; }
        setErro(json.error ?? 'Erro ao iniciar checkout.');
        return;
      }
      window.location.href = json.url;
    } catch {
      setErro('Falha de conexão. Tente novamente.');
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <section className="section pricing" id="precos">
      <div className="container">
        <div className="section-label" style={{ textAlign: 'center' }}>Investimento</div>
        <h2 className="section-title" style={{ textAlign: 'center' }}>
          Comece grátis.<br /><em>Continue quando quiser.</em>
        </h2>

        {/* Banner do trial */}
        <div style={{
          background:    'rgba(34,197,94,0.08)',
          border:        '1px solid rgba(34,197,94,0.35)',
          borderRadius:  12,
          padding:       '14px 24px',
          textAlign:     'center',
          marginBottom:  '2.5rem',
          maxWidth:      560,
          margin:        '0 auto 2.5rem',
        }}>
          <p style={{ margin: 0, fontSize: '0.97rem', fontWeight: 600, color: '#4ade80' }}>
            🎁 7 dias grátis com acesso completo — sem cartão agora
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'rgba(245,240,232,0.55)' }}>
            Crie sua conta e acesse tudo imediatamente. Só pedimos o cartão se você decidir continuar.
          </p>
        </div>

        <div className="pricing-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', maxWidth: 720, margin: '0 auto' }}>
          {planos.map((p) => (
            <div key={p.id} className={`pricing-card${p.destaque ? ' featured' : ''}`} style={{ position: 'relative' }}>
              {p.tag && <div className="pricing-tag">{p.tag}</div>}

              <div className="pricing-name">{p.nome}</div>
              <div className="pricing-sub">{p.sub}</div>

              {/* Badge economia (anual) */}
              {p.destaque && (
                <div style={{
                  display:        'inline-block',
                  background:     'rgba(200,160,48,0.18)',
                  border:         '1px solid rgba(200,160,48,0.45)',
                  color:          '#C8A030',
                  fontSize:       '0.68rem',
                  fontWeight:     700,
                  letterSpacing:  '0.1em',
                  textTransform:  'uppercase',
                  padding:        '0.22rem 0.75rem',
                  borderRadius:   99,
                  marginBottom:   '1.25rem',
                }}>
                  ✦ Economize 35%
                </div>
              )}

              <div className="pricing-val">
                <span className="curr">R$</span>
                <span className="num">{p.preco}</span>
              </div>
              <div className="pricing-period">{p.periodo}</div>

              <ul className="pricing-features">
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>

              {/* CTA principal → cadastro grátis */}
              <Link
                href="/sign-up"
                className={`btn-plan${p.destaque ? ' btn-plan-featured' : ''}`}
                style={{ display: 'block', textAlign: 'center', marginBottom: 8 }}
              >
                Começar 7 dias grátis →
              </Link>

              {/* CTA secundário → checkout direto (usuário já logado) */}
              <button
                onClick={() => irParaCheckout(p.id)}
                disabled={loadingId !== null}
                style={{
                  width:          '100%',
                  background:     'transparent',
                  border:         '1px solid rgba(245,240,232,0.12)',
                  borderRadius:   8,
                  padding:        '8px 0',
                  cursor:         loadingId ? 'not-allowed' : 'pointer',
                  color:          'rgba(245,240,232,0.38)',
                  fontSize:       '0.75rem',
                  transition:     'color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'rgba(245,240,232,0.65)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(245,240,232,0.38)'; }}
              >
                {loadingId === p.id ? 'Redirecionando…' : 'Já tenho conta — assinar agora'}
              </button>
            </div>
          ))}
        </div>

        {erro && (
          <p style={{ textAlign: 'center', color: '#ef4444', fontSize: '0.82rem', marginTop: 12 }}>
            {erro}
          </p>
        )}

        {/* Aviso pós-trial */}
        <p style={{
          textAlign:     'center',
          fontSize:      '0.8rem',
          color:         'rgba(245,240,232,0.38)',
          marginTop:     '1.5rem',
          lineHeight:    1.7,
        }}>
          Após os 7 dias, seu acesso é pausado — seus dados ficam salvos por 30 dias.<br />
          Assine quando quiser e continue exatamente de onde parou.
        </p>

        <div className="pricing-footer">
          <span>🔒 Pagamento seguro via Stripe · SSL</span>
          <span>🛡️ Garantia de 7 dias no plano anual</span>
          <span>❌ Sem fidelidade — cancele quando quiser</span>
        </div>
      </div>
    </section>
  );
}
