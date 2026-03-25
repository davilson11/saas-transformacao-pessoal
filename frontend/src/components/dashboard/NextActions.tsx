'use client';

import { useState } from 'react';

type Action = {
  id: number;
  icon: string;
  texto: string;
  badge: string;
  prioridade: 'alta' | 'media' | 'baixa';
};

const ACTIONS_INICIAL: Action[] = [
  { id: 1, icon: '🎯', texto: 'Completar as 3 últimas perguntas do Propósito de Vida',    badge: 'F03', prioridade: 'alta'  },
  { id: 2, icon: '🌅', texto: 'Definir o bloco de manhã da sua Rotina Ideal',             badge: 'Rotina', prioridade: 'alta'  },
  { id: 3, icon: '📊', texto: 'Revisar os OKRs do mês e ajustar metas',                  badge: 'F05', prioridade: 'media' },
  { id: 4, icon: '💰', texto: 'Lançar os gastos da semana no Controle Financeiro',        badge: 'F07', prioridade: 'media' },
  { id: 5, icon: '📔', texto: 'Fazer o registro de hoje no Diário de Bordo',             badge: 'F14', prioridade: 'baixa' },
  { id: 6, icon: '🔄', texto: 'Agendar sua Revisão Mensal para o último dia do mês',     badge: 'F16', prioridade: 'baixa' },
];

const PRIORIDADE_CONFIG = {
  alta:  { label: 'Alta',  dot: '#C0392B' },
  media: { label: 'Média', dot: '#D97706' },
  baixa: { label: 'Baixa', dot: '#81B29A' },
};

export default function NextActions() {
  const [done, setDone] = useState<Set<number>>(new Set());

  const toggle = (id: number) =>
    setDone((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const concluidos = done.size;
  const total = ACTIONS_INICIAL.length;
  const pct = Math.round((concluidos / total) * 100);

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: '#fff',
        border: '1px solid var(--color-brand-border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-start justify-between gap-4"
        style={{ borderBottom: '1px solid var(--color-brand-border)' }}
      >
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 17,
              fontWeight: 700,
              color: 'var(--color-brand-dark-green)',
              lineHeight: 1.2,
            }}
          >
            Próximas Ações
          </h3>
          <p style={{ fontSize: 12, color: 'var(--color-brand-gray)', marginTop: 3 }}>
            Tarefas e metas do dia
          </p>
        </div>

        {/* Progresso circular compacto */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <svg width="36" height="36" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="14" fill="none" stroke="var(--color-brand-border)" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="14"
              fill="none"
              stroke={pct === 100 ? '#27AE60' : 'var(--color-brand-gold)'}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 14}`}
              strokeDashoffset={`${2 * Math.PI * 14 * (1 - pct / 100)}`}
              transform="rotate(-90 18 18)"
              style={{ transition: 'stroke-dashoffset 0.4s ease' }}
            />
            <text
              x="18" y="22"
              textAnchor="middle"
              style={{ fontSize: 10, fontWeight: 700, fill: 'var(--color-brand-dark-green)', fontFamily: 'DM Sans' }}
            >
              {pct}%
            </text>
          </svg>
          <span style={{ fontSize: 12, color: 'var(--color-brand-gray)' }}>
            {concluidos}/{total}
          </span>
        </div>
      </div>

      {/* Lista */}
      <ul className="flex flex-col divide-y" style={{ borderColor: 'var(--color-brand-border)' }}>
        {ACTIONS_INICIAL.map((action) => {
          const isDone = done.has(action.id);
          const prio = PRIORIDADE_CONFIG[action.prioridade];

          return (
            <li key={action.id}>
              <button
                onClick={() => toggle(action.id)}
                className="w-full flex items-start gap-4 px-6 py-4 text-left transition-colors duration-150"
                style={{ background: isDone ? 'rgba(39,174,96,0.04)' : 'transparent' }}
              >
                {/* Checkbox */}
                <div
                  className="flex items-center justify-center rounded-md flex-shrink-0 mt-0.5 transition-all duration-200"
                  style={{
                    width: 20,
                    height: 20,
                    border: isDone ? 'none' : '1.5px solid var(--color-brand-border)',
                    background: isDone ? '#27AE60' : 'transparent',
                  }}
                >
                  {isDone && (
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M1.5 5.5l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>

                {/* Ícone */}
                <span
                  className="flex-shrink-0 flex items-center justify-center rounded-xl"
                  style={{
                    width: 34,
                    height: 34,
                    background: isDone ? 'rgba(39,174,96,0.08)' : 'rgba(30,57,42,0.06)',
                    fontSize: 16,
                    opacity: isDone ? 0.6 : 1,
                  }}
                >
                  {action.icon}
                </span>

                {/* Texto + badges */}
                <div className="flex-1 min-w-0">
                  <p
                    style={{
                      fontSize: 14,
                      lineHeight: 1.45,
                      color: isDone ? 'var(--color-brand-gray)' : 'var(--color-brand-dark-green)',
                      textDecoration: isDone ? 'line-through' : 'none',
                      textDecorationColor: 'var(--color-brand-gray)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {action.texto}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {/* Badge ferramenta */}
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        fontWeight: 500,
                        color: isDone ? 'var(--color-brand-gray)' : 'var(--color-brand-gold)',
                        background: isDone ? 'rgba(107,114,128,0.08)' : 'rgba(224,165,95,0.12)',
                        padding: '2px 7px',
                        borderRadius: 99,
                        border: `1px solid ${isDone ? 'transparent' : 'rgba(224,165,95,0.25)'}`,
                      }}
                    >
                      {action.badge}
                    </span>
                    {/* Prioridade */}
                    <span className="flex items-center gap-1" style={{ fontSize: 11, color: 'var(--color-brand-gray)' }}>
                      <span
                        className="rounded-full inline-block"
                        style={{ width: 6, height: 6, background: isDone ? 'var(--color-brand-gray)' : prio.dot }}
                      />
                      {prio.label}
                    </span>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-6 py-4 mt-auto"
        style={{ borderTop: '1px solid var(--color-brand-border)', background: 'rgba(30,57,42,0.02)' }}
      >
        <p style={{ fontSize: 12, color: 'var(--color-brand-gray)' }}>
          {concluidos === total
            ? '🎉 Todas as ações concluídas hoje!'
            : `${total - concluidos} ação${total - concluidos !== 1 ? 'ões' : ''} pendente${total - concluidos !== 1 ? 's' : ''}`}
        </p>
        <button
          className="btn-primary"
          style={{ padding: '8px 18px', fontSize: 13, borderRadius: 10 }}
        >
          Ver Todas →
        </button>
      </div>
    </div>
  );
}
