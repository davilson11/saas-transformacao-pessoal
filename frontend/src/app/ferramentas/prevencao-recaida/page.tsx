'use client';

import { useState } from 'react';
import FerramentaLayout from '@/components/dashboard/FerramentaLayout';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Probabilidade = 'baixa' | 'media' | 'alta';

type Cenario = {
  probabilidade: Probabilidade;
  gatilho:       string;
  seEntao:       string;
  quemAjuda:     string;
};

type LinhaApoio = { nome: string; contato: string };

type Protocolo = {
  apoio1:      LinhaApoio;
  apoio2:      LinhaApoio;
  reset:       string;
  mantra:      string;
  passo1:      string;
  passo2:      string;
  passo3:      string;
  compromisso: string;
};

type Milestone = {
  recompensa:   string;
  comoCelebrar: string;
  dataAlvo:     string;
};

// ─── Constantes ───────────────────────────────────────────────────────────────

const COR_VERDE  = '#1a5c3a';
const COR_GOLD   = '#b5840a';
const COR_BORDER = 'rgba(26,92,58,0.1)';

const ETAPAS = [
  { label: 'Bem-vindo',          descricao: 'Introdução à ferramenta'          },
  { label: 'Cenários de Risco',  descricao: '7 planos SE-ENTÃO preventivos'    },
  { label: 'Protocolo',          descricao: 'Rede de apoio e protocolo de reset' },
  { label: 'Recompensas',        descricao: '7 milestones e celebrações'       },
];

type CenarioConfig = {
  key:          string;
  emoji:        string;
  nome:         string;
  descricao:    string;
  cor:          string;
  bg:           string;
  gatilhoPad:   string;
  seEntaoPad:   string;
};

const CENARIOS_CONFIG: CenarioConfig[] = [
  {
    key: 'viagens', emoji: '✈️', nome: 'Viagens',
    descricao: 'Deslocamentos e rotinas quebradas',
    cor: '#2563eb', bg: 'rgba(37,99,235,0.06)',
    gatilhoPad: 'Fora de casa por mais de 2 dias consecutivos',
    seEntaoPad: 'Levarei equipamento mínimo e farei versão reduzida da rotina',
  },
  {
    key: 'pressao', emoji: '🔥', nome: 'Alta Pressão',
    descricao: 'Prazos, cobranças e estresse extremo',
    cor: '#dc2626', bg: 'rgba(220,38,38,0.05)',
    gatilhoPad: 'Prazo urgente ou múltiplas cobranças simultâneas',
    seEntaoPad: 'Farei apenas os 3 hábitos não negociáveis e comunicarei ao apoio',
  },
  {
    key: 'social', emoji: '🎉', nome: 'Eventos Sociais',
    descricao: 'Festas, reuniões e pressão do grupo',
    cor: '#d97706', bg: 'rgba(217,119,6,0.06)',
    gatilhoPad: 'Evento com presença de situações de risco ou pressão social',
    seEntaoPad: 'Comunicarei meus limites antes e terei plano de saída se necessário',
  },
  {
    key: 'fracasso', emoji: '💔', nome: 'Fracasso / Rejeição',
    descricao: 'Falha, crítica ou rejeição significativa',
    cor: '#7c3aed', bg: 'rgba(124,58,237,0.06)',
    gatilhoPad: 'Resultado muito abaixo do esperado ou rejeição importante',
    seEntaoPad: 'Ligarei para minha linha de apoio antes de agir por impulso',
  },
  {
    key: 'motivacao', emoji: '😔', nome: 'Baixa Motivação',
    descricao: 'Dias consecutivos sem energia ou propósito',
    cor: '#64748b', bg: 'rgba(100,116,139,0.06)',
    gatilhoPad: '3 ou mais dias consecutivos sem vontade de nada',
    seEntaoPad: 'Farei apenas 2 minutos do hábito — começar é suficiente por hoje',
  },
  {
    key: 'conflito', emoji: '⚡', nome: 'Conflito',
    descricao: 'Briga, tensão intensa ou desentendimento',
    cor: '#e11d48', bg: 'rgba(225,29,72,0.05)',
    gatilhoPad: 'Discussão intensa ou conflito não resolvido por mais de 24h',
    seEntaoPad: 'Esperarei esfriar antes de reagir e usarei atividade de reset',
  },
  {
    key: 'doenca', emoji: '🤒', nome: 'Doença / Mal-estar',
    descricao: 'Condição física que quebra a rotina',
    cor: '#16a34a', bg: 'rgba(22,163,74,0.06)',
    gatilhoPad: 'Mais de 3 dias doente ou incapacitado de rotina normal',
    seEntaoPad: 'Farei versão mínima adaptada — até no leito posso praticar gratidão',
  },
];

type MilestoneConfig = {
  key:   string;
  dias:  number;
  label: string;
  emoji: string;
  cor:   string;
};

const MILESTONES_CONFIG: MilestoneConfig[] = [
  { key: 'm7',   dias: 7,   label: '7 dias',   emoji: '🌱', cor: '#16a34a' },
  { key: 'm21',  dias: 21,  label: '21 dias',  emoji: '⭐', cor: '#2563eb' },
  { key: 'm30',  dias: 30,  label: '30 dias',  emoji: '🏆', cor: '#d97706' },
  { key: 'm60',  dias: 60,  label: '60 dias',  emoji: '💎', cor: '#7c3aed' },
  { key: 'm90',  dias: 90,  label: '90 dias',  emoji: '🔥', cor: '#dc2626' },
  { key: 'm180', dias: 180, label: '6 meses',  emoji: '🚀', cor: '#0891b2' },
  { key: 'm365', dias: 365, label: '12 meses', emoji: '👑', cor: COR_GOLD  },
];

const PROB_CONFIG: Record<Probabilidade, { label: string; cor: string; bg: string }> = {
  baixa: { label: 'Baixa', cor: '#16a34a', bg: 'rgba(22,163,74,0.12)'  },
  media: { label: 'Média', cor: '#d97706', bg: 'rgba(217,119,6,0.12)'  },
  alta:  { label: 'Alta',  cor: '#dc2626', bg: 'rgba(220,38,38,0.1)'   },
};

const CENARIO_DEFAULT: Cenario = { probabilidade: 'media', gatilho: '', seEntao: '', quemAjuda: '' };
const MILESTONE_DEFAULT: Milestone = { recompensa: '', comoCelebrar: '', dataAlvo: '' };
const PROTOCOLO_DEFAULT: Protocolo = {
  apoio1: { nome: '', contato: '' },
  apoio2: { nome: '', contato: '' },
  reset: '', mantra: '', passo1: '', passo2: '', passo3: '', compromisso: '',
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function CenarioCard({ config, dados, onChange }: {
  config:  CenarioConfig;
  dados:   Cenario;
  onChange: (c: Cenario) => void;
}) {
  const set   = (p: Partial<Cenario>) => onChange({ ...dados, ...p });
  const prob  = PROB_CONFIG[dados.probabilidade];
  const temPl = dados.seEntao.trim().length > 0;

  return (
    <div style={{
      background: temPl ? config.bg : '#fff',
      border: `1.5px solid ${temPl ? config.cor + '30' : COR_BORDER}`,
      borderRadius: 12, padding: '16px 18px',
      display: 'flex', flexDirection: 'column', gap: 12,
      transition: 'border-color 0.2s, background 0.2s',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>{config.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700, color: config.cor }}>
            {config.nome}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(26,92,58,0.5)' }}>
            {config.descricao}
          </div>
        </div>
        {/* Probabilidade */}
        <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
          {(['baixa', 'media', 'alta'] as Probabilidade[]).map(p => (
            <button
              key={p}
              onClick={() => set({ probabilidade: p })}
              style={{
                padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all 0.15s',
                border: `1px solid ${dados.probabilidade === p ? PROB_CONFIG[p].cor : COR_BORDER}`,
                background: dados.probabilidade === p ? PROB_CONFIG[p].bg : 'transparent',
                color: dados.probabilidade === p ? PROB_CONFIG[p].cor : 'rgba(26,92,58,0.45)',
              }}
            >
              {PROB_CONFIG[p].label}
            </button>
          ))}
        </div>
      </div>

      {/* Gatilho de alerta */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: 'rgba(26,92,58,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Gatilho de alerta
        </label>
        <input
          type="text"
          value={dados.gatilho}
          onChange={e => set({ gatilho: e.target.value })}
          placeholder={config.gatilhoPad}
          style={{
            border: `1px solid ${dados.gatilho ? config.cor + '35' : COR_BORDER}`,
            borderRadius: 7, padding: '7px 11px', fontSize: 14,
            fontFamily: 'var(--font-body)', color: '#1a2015',
            outline: 'none', background: 'rgba(255,255,255,0.85)',
          }}
        />
      </div>

      {/* Plano SE-ENTÃO */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: config.cor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          ⟹ Plano SE-ENTÃO
        </label>
        <textarea
          value={dados.seEntao}
          onChange={e => set({ seEntao: e.target.value })}
          placeholder={`SE este cenário acontecer → ENTÃO: ${config.seEntaoPad}`}
          rows={2}
          style={{
            border: `1.5px solid ${dados.seEntao ? config.cor + '45' : COR_BORDER}`,
            borderRadius: 7, padding: '7px 11px', fontSize: 14,
            fontFamily: 'var(--font-body)', color: '#1a2015',
            outline: 'none', background: 'rgba(255,255,255,0.85)',
            resize: 'vertical', lineHeight: 1.5,
          }}
        />
      </div>

      {/* Quem me ajuda */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: 'rgba(26,92,58,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Quem me ajuda neste cenário
        </label>
        <input
          type="text"
          value={dados.quemAjuda}
          onChange={e => set({ quemAjuda: e.target.value })}
          placeholder="Nome / papel desta pessoa na sua recuperação…"
          style={{
            border: `1px solid ${dados.quemAjuda ? config.cor + '30' : COR_BORDER}`,
            borderRadius: 7, padding: '7px 11px', fontSize: 14,
            fontFamily: 'var(--font-body)', color: '#1a2015',
            outline: 'none', background: 'rgba(255,255,255,0.85)',
          }}
        />
      </div>
    </div>
  );
}

function MilestoneCard({ config, dados, onChange }: {
  config:  MilestoneConfig;
  dados:   Milestone;
  onChange: (m: Milestone) => void;
}) {
  const set      = (p: Partial<Milestone>) => onChange({ ...dados, ...p });
  const definido = dados.recompensa.trim().length > 0;

  return (
    <div style={{
      background: definido ? `${config.cor}07` : '#fff',
      border: `1.5px solid ${definido ? config.cor + '30' : COR_BORDER}`,
      borderRadius: 10, padding: '14px 16px',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>{config.emoji}</span>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: config.cor }}>
            {config.label}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(26,92,58,0.45)' }}>
            {config.dias} dias consecutivos
          </div>
        </div>
        {definido && (
          <div style={{
            marginLeft: 'auto',
            width: 20, height: 20, borderRadius: '50%',
            background: config.cor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 10, color: '#fff', fontWeight: 700 }}>✓</span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {/* Recompensa */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, gridColumn: '1 / -1' }}>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'rgba(26,92,58,0.6)' }}>
            🎁 Recompensa definida
          </label>
          <input
            type="text"
            value={dados.recompensa}
            onChange={e => set({ recompensa: e.target.value })}
            placeholder={`Ex: Jantar especial, compra desejada, viagem curta…`}
            style={{
              border: `1px solid ${dados.recompensa ? config.cor + '40' : COR_BORDER}`,
              borderRadius: 6, padding: '7px 10px', fontSize: 14,
              fontFamily: 'var(--font-body)', color: '#1a2015',
              outline: 'none', background: '#fff',
            }}
          />
        </div>

        {/* Como celebrar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'rgba(26,92,58,0.6)' }}>
            🎊 Como celebrar
          </label>
          <input
            type="text"
            value={dados.comoCelebrar}
            onChange={e => set({ comoCelebrar: e.target.value })}
            placeholder="Com quem, onde…"
            style={{
              border: `1px solid ${COR_BORDER}`, borderRadius: 6,
              padding: '7px 10px', fontSize: 14,
              fontFamily: 'var(--font-body)', color: '#1a2015',
              outline: 'none', background: '#fff',
            }}
          />
        </div>

        {/* Data alvo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'rgba(26,92,58,0.6)' }}>
            📅 Data alvo
          </label>
          <input
            type="date"
            value={dados.dataAlvo}
            onChange={e => set({ dataAlvo: e.target.value })}
            style={{
              border: `1px solid ${dados.dataAlvo ? config.cor + '35' : COR_BORDER}`,
              borderRadius: 6, padding: '6px 10px', fontSize: 13,
              fontFamily: 'var(--font-body)', color: dados.dataAlvo ? config.cor : '#1a2015',
              fontWeight: dados.dataAlvo ? 600 : 400,
              outline: 'none', background: '#fff',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function PrevencaoRecaidaPage() {
  const [etapa, setEtapa] = useState(0);

  const [cenarios, setCenarios] = useState<Record<string, Cenario>>(
    Object.fromEntries(CENARIOS_CONFIG.map(c => [c.key, { ...CENARIO_DEFAULT }]))
  );

  const [protocolo, setProtocolo] = useState<Protocolo>({ ...PROTOCOLO_DEFAULT });

  const [milestones, setMilestones] = useState<Record<string, Milestone>>(
    Object.fromEntries(MILESTONES_CONFIG.map(m => [m.key, { ...MILESTONE_DEFAULT }]))
  );

  // ─── Helpers de estado ────────────────────────────────────────────────────

  const setProt = (p: Partial<Protocolo>) => setProtocolo(prev => ({ ...prev, ...p }));
  const setApoio = (n: 1 | 2, p: Partial<LinhaApoio>) =>
    setProt({ [`apoio${n}`]: { ...protocolo[`apoio${n}`], ...p } });

  // ─── Métricas ──────────────────────────────────────────────────────────────

  const cenariosComPlano    = CENARIOS_CONFIG.filter(c => cenarios[c.key].seEntao.trim().length > 0).length;
  const protocoloFilled     = [protocolo.apoio1.nome, protocolo.mantra, protocolo.passo1].filter(v => v.trim().length > 0).length;
  const milestonesDefinidos = MILESTONES_CONFIG.filter(m => milestones[m.key].recompensa.trim().length > 0).length;

  const progresso =
    etapa === 0 ? 0
    : etapa === 1 ? Math.min(33, Math.round((cenariosComPlano / 7) * 33))
    : etapa === 2 ? 33 + Math.min(33, Math.round((protocoloFilled / 3) * 33))
    : 66 + Math.min(34, Math.round((milestonesDefinidos / 7) * 34));

  const podeAvancar =
    etapa === 0 ? true
    : etapa === 1 ? cenariosComPlano >= 3
    : etapa === 2 ? (protocolo.apoio1.nome.trim().length > 0 && protocolo.mantra.trim().length > 0 && protocolo.passo1.trim().length > 0)
    : milestonesDefinidos >= 3;

  const totalItens =
    etapa === 1 ? cenariosComPlano
    : etapa === 2 ? protocoloFilled
    : etapa === 3 ? milestonesDefinidos
    : undefined;

  const labelItens =
    etapa === 1 ? 'planos definidos'
    : etapa === 2 ? 'campos do protocolo'
    : 'milestones configurados';

  // ─── Painel Direito ────────────────────────────────────────────────────────

  const planosAtivos = CENARIOS_CONFIG.filter(c => cenarios[c.key].seEntao.trim().length > 0);
  const proximosMilestones = MILESTONES_CONFIG.filter(m => milestones[m.key].recompensa.trim().length > 0);

  const painelResumo = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Score de preparação */}
      <div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: COR_VERDE, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
          Nível de preparação
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          {[
            { label: 'Planos', valor: cenariosComPlano, total: 7, cor: '#2563eb' },
            { label: 'Protocolo', valor: protocoloFilled, total: 3, cor: '#16a34a' },
            { label: 'Metas', valor: milestonesDefinidos, total: 7, cor: COR_GOLD },
          ].map(stat => (
            <div key={stat.label} style={{
              background: '#fff', border: `1px solid ${COR_BORDER}`,
              borderRadius: 8, padding: '8px', textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: stat.cor, lineHeight: 1 }}>
                {stat.valor}
                <span style={{ fontSize: 10, fontWeight: 400, color: 'rgba(26,92,58,0.35)', marginLeft: 1 }}>
                  /{stat.total}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'rgba(26,92,58,0.5)', marginTop: 2 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Planos SE-ENTÃO */}
      {planosAtivos.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: COR_VERDE, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Planos SE-ENTÃO ativos
          </p>
          {planosAtivos.map(cfg => {
            const c = cenarios[cfg.key];
            const prob = PROB_CONFIG[c.probabilidade];
            return (
              <div key={cfg.key} style={{
                background: cfg.bg, border: `1px solid ${cfg.cor}20`,
                borderRadius: 8, padding: '10px 12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                  <span style={{ fontSize: 14 }}>{cfg.emoji}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: cfg.cor, flex: 1 }}>
                    {cfg.nome}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700,
                    color: prob.cor, background: prob.bg,
                    border: `1px solid ${prob.cor}25`,
                    borderRadius: 99, padding: '1px 6px',
                  }}>
                    {prob.label}
                  </span>
                </div>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: 12, color: '#2d3748',
                  lineHeight: 1.45, fontStyle: 'italic',
                }}>
                  &ldquo;{c.seEntao.length > 80 ? c.seEntao.slice(0, 80) + '…' : c.seEntao}&rdquo;
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Mantra de recuperação */}
      {protocolo.mantra && (
        <div style={{
          background: `${COR_GOLD}08`, border: `1px solid ${COR_GOLD}25`,
          borderRadius: 10, padding: '12px 14px',
        }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: COR_GOLD, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>
            MANTRA DE RECUPERAÇÃO
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#7c5500', fontStyle: 'italic', lineHeight: 1.5 }}>
            &ldquo;{protocolo.mantra}&rdquo;
          </p>
        </div>
      )}

      {/* Próximos milestones */}
      {proximosMilestones.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: COR_VERDE, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Próximas recompensas
          </p>
          {proximosMilestones.slice(0, 4).map(cfg => {
            const m = milestones[cfg.key];
            return (
              <div key={cfg.key} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#fff', border: `1px solid ${COR_BORDER}`,
                borderRadius: 8, padding: '8px 10px',
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{cfg.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: cfg.cor }}>
                    {cfg.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#2d3748', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.recompensa}
                  </div>
                </div>
                {m.dataAlvo && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: cfg.cor, fontWeight: 600, flexShrink: 0 }}>
                    {m.dataAlvo.slice(5).replace('-', '/')}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {cenariosComPlano === 0 && proximosMilestones.length === 0 && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(26,92,58,0.4)', fontStyle: 'italic', textAlign: 'center' }}>
          Preencha os planos para vê-los aqui.
        </p>
      )}
    </div>
  );

  // ─── Etapa 0: Bem-vindo ────────────────────────────────────────────────────

  const step0 = (
    <div style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: `${COR_GOLD}15`, border: `1px solid ${COR_GOLD}30`,
          borderRadius: 99, padding: '4px 14px', marginBottom: 16,
        }}>
          <span style={{ fontSize: 14 }}>🛡️</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: COR_GOLD }}>
            F16 · Mecanismo de Prevenção de Recaída
          </span>
        </div>
        <h1 style={{ color: COR_VERDE, marginBottom: 12 }}>
          Planeje para o caos antes que ele chegue
        </h1>
        <p style={{ color: '#4a5568', maxWidth: 560 }}>
          Todo processo de transformação enfrenta obstáculos previsíveis. Esta ferramenta usa a técnica SE-ENTÃO da psicologia comportamental — planejar antes do risco é a diferença entre quem mantém e quem abandona.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {[
          { emoji: '🗺️', titulo: '7 Cenários de Risco', desc: 'Planos SE-ENTÃO para viagem, pressão, conflito e mais'  },
          { emoji: '🆘', titulo: 'Protocolo de Reset',   desc: 'Rede de apoio e 3 passos para se reerguer rápido'       },
          { emoji: '🏆', titulo: 'Sistema de Metas',     desc: '7 milestones com recompensas reais para celebrar'       },
          { emoji: '🧠', titulo: 'Psicologia Real',      desc: 'Baseado em implementação de intenção e reforço positivo' },
        ].map(item => (
          <div key={item.titulo} style={{
            background: '#fff', border: `1px solid ${COR_BORDER}`,
            borderRadius: 12, padding: '16px 18px',
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>{item.emoji}</span>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700, color: COR_VERDE, marginBottom: 4 }}>
                {item.titulo}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(26,92,58,0.6)', lineHeight: 1.45 }}>
                {item.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'rgba(220,38,38,0.04)', border: '1px solid rgba(220,38,38,0.15)',
        borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
        <p style={{ color: '#7f1d1d', margin: 0, fontSize: 14 }}>
          <strong>Verdade inconfortável:</strong> Não é <em>se</em> você vai enfrentar um obstáculo — é <em>quando</em>. Quem pleja para a falha antes dela chegar é quem mantém a transformação a longo prazo.
        </p>
      </div>

      <div style={{
        background: 'rgba(181,132,10,0.06)', border: `1px solid ${COR_GOLD}25`,
        borderRadius: 12, padding: '14px 18px', display: 'flex', gap: 10, alignItems: 'center',
      }}>
        <span style={{ fontSize: 18 }}>🔬</span>
        <p style={{ color: '#5c4a00', margin: 0, fontSize: 13 }}>
          <strong>Ciência:</strong> Estudos de Peter Gollwitzer mostram que planos SE-ENTÃO aumentam em <strong>2-3x</strong> a probabilidade de manter um comportamento em situações de risco.
        </p>
      </div>
    </div>
  );

  // ─── Etapa 1: Cenários de Risco ───────────────────────────────────────────

  const step1 = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ color: COR_VERDE, marginBottom: 8 }}>Cenários de Risco</h2>
        <p style={{ color: '#4a5568', maxWidth: 600 }}>
          Para cada cenário, defina sua probabilidade, o gatilho específico que o ativa e seu plano SE-ENTÃO. Preencha com a primeira resposta que vier — a autenticidade é mais importante que a perfeição.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
          {[
            { label: '⟹ SE-ENTÃO', desc: `${cenariosComPlano}/7 planos definidos`, cor: COR_VERDE },
          ].map(s => (
            <span key={s.label} style={{
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: s.cor,
              background: `${s.cor}10`, border: `1px solid ${s.cor}25`,
              borderRadius: 99, padding: '4px 12px',
            }}>
              {s.label} · {s.desc}
            </span>
          ))}
        </div>
      </div>

      {CENARIOS_CONFIG.map(cfg => (
        <CenarioCard
          key={cfg.key}
          config={cfg}
          dados={cenarios[cfg.key]}
          onChange={updated => setCenarios(prev => ({ ...prev, [cfg.key]: updated }))}
        />
      ))}

      {cenariosComPlano < 3 && (
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#92400e',
          background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: 8, padding: '10px 14px', margin: 0,
        }}>
          Defina o plano SE-ENTÃO de pelo menos 3 cenários para continuar ({cenariosComPlano}/3).
        </p>
      )}
    </div>
  );

  // ─── Etapa 2: Protocolo de Recuperação ────────────────────────────────────

  const step2 = (
    <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <h2 style={{ color: COR_VERDE, marginBottom: 8 }}>Protocolo de Recuperação</h2>
        <p style={{ color: '#4a5568' }}>
          Quando a recaída acontece, a velocidade de recuperação é o que separa quem desiste de quem persiste. Configure seu sistema de suporte antes de precisar dele.
        </p>
      </div>

      {/* Linhas de apoio */}
      <div style={{
        background: '#fff', border: `1px solid ${COR_BORDER}`,
        borderRadius: 12, padding: '18px 20px',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>📞</span>
          <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 700, color: COR_VERDE }}>
            Rede de apoio
          </h3>
        </div>

        {([1, 2] as const).map(n => (
          <div key={n} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700,
              color: n === 1 ? '#dc2626' : '#d97706',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                background: n === 1 ? '#dc2626' : '#d97706',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontSize: 10, color: '#fff', fontWeight: 700,
              }}>
                {n}
              </div>
              Linha {n === 1 ? 'primária' : 'secundária'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input
                type="text"
                value={protocolo[`apoio${n}`].nome}
                onChange={e => setApoio(n, { nome: e.target.value })}
                placeholder="Nome da pessoa…"
                style={{
                  border: `1px solid ${protocolo[`apoio${n}`].nome ? (n === 1 ? '#dc2626' : '#d97706') + '40' : COR_BORDER}`,
                  borderRadius: 7, padding: '8px 11px', fontSize: 15,
                  fontFamily: 'var(--font-body)', color: '#1a2015',
                  outline: 'none', background: '#fff',
                }}
              />
              <input
                type="text"
                value={protocolo[`apoio${n}`].contato}
                onChange={e => setApoio(n, { contato: e.target.value })}
                placeholder="Telefone / contato…"
                style={{
                  border: `1px solid ${COR_BORDER}`,
                  borderRadius: 7, padding: '8px 11px', fontSize: 14,
                  fontFamily: 'var(--font-mono)', color: '#1a2015',
                  outline: 'none', background: '#fff',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Atividade de reset + Mantra */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: COR_VERDE }}>
            🔄 Atividade de reset
          </label>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(26,92,58,0.5)', margin: 0 }}>
            O que faz você voltar ao estado certo?
          </p>
          <textarea
            value={protocolo.reset}
            onChange={e => setProt({ reset: e.target.value })}
            placeholder="Ex: Caminhada de 20 min, oração, respiração 4-7-8, ducha fria…"
            rows={3}
            style={{
              border: `1px solid ${protocolo.reset ? COR_VERDE + '35' : COR_BORDER}`,
              borderRadius: 8, padding: '9px 12px', fontSize: 15,
              fontFamily: 'var(--font-body)', color: '#1a2015',
              outline: 'none', background: '#fff', resize: 'vertical', lineHeight: 1.5,
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: COR_VERDE }}>
            ✨ Mantra de recuperação <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(26,92,58,0.5)', margin: 0 }}>
            1 frase que você diz a si mesmo ao recair
          </p>
          <textarea
            value={protocolo.mantra}
            onChange={e => setProt({ mantra: e.target.value })}
            placeholder="Ex: Recair uma vez não é fracasso — desistir é. Eu recomeço agora."
            rows={3}
            style={{
              border: `1.5px solid ${protocolo.mantra ? COR_GOLD + '55' : COR_BORDER}`,
              borderRadius: 8, padding: '9px 12px', fontSize: 15,
              fontFamily: 'var(--font-body)', color: '#7c5500', fontStyle: 'italic',
              outline: 'none', background: protocolo.mantra ? `${COR_GOLD}04` : '#fff',
              resize: 'vertical', lineHeight: 1.5,
            }}
          />
        </div>
      </div>

      {/* Protocolo 3 passos */}
      <div style={{
        background: `${COR_VERDE}05`, border: `1px solid ${COR_VERDE}18`,
        borderRadius: 12, padding: '18px 20px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>📋</span>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700, color: COR_VERDE }}>
            Protocolo de 3 passos — o que fazer imediatamente
          </label>
        </div>
        {[
          { field: 'passo1' as const, num: 1, placeholder: 'Primeiro passo imediato ao perceber a recaída…' },
          { field: 'passo2' as const, num: 2, placeholder: 'Segundo passo — dentro das próximas horas…' },
          { field: 'passo3' as const, num: 3, placeholder: 'Terceiro passo — para evitar que se repita…' },
        ].map(item => (
          <div key={item.field} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: protocolo[item.field] ? COR_VERDE : 'rgba(26,92,58,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
              color: protocolo[item.field] ? '#fff' : 'rgba(26,92,58,0.5)',
              transition: 'background 0.2s',
            }}>
              {item.num}
            </div>
            <input
              type="text"
              value={protocolo[item.field]}
              onChange={e => setProt({ [item.field]: e.target.value })}
              placeholder={item.placeholder}
              style={{
                flex: 1,
                border: `1px solid ${protocolo[item.field] ? COR_VERDE + '40' : COR_BORDER}`,
                borderRadius: 7, padding: '8px 12px', fontSize: 15,
                fontFamily: 'var(--font-body)', color: '#1a2015',
                outline: 'none', background: '#fff',
              }}
            />
          </div>
        ))}
      </div>

      {/* Compromisso pessoal */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: COR_VERDE }}>
          🤝 Compromisso pessoal
        </label>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(26,92,58,0.5)', margin: 0 }}>
          Escreva uma declaração pessoal de comprometimento com sua transformação.
        </p>
        <textarea
          value={protocolo.compromisso}
          onChange={e => setProt({ compromisso: e.target.value })}
          placeholder="Eu, [seu nome], me comprometo a… porque… e quando falhar, vou…"
          rows={3}
          style={{
            border: `1px solid ${protocolo.compromisso ? COR_VERDE + '35' : COR_BORDER}`,
            borderRadius: 8, padding: '10px 14px', fontSize: 15,
            fontFamily: 'var(--font-body)', color: '#1a2015',
            outline: 'none', background: '#fff', resize: 'vertical', lineHeight: 1.55,
          }}
        />
      </div>

      {!podeAvancar && (
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#92400e',
          background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: 8, padding: '10px 14px', margin: 0,
        }}>
          Preencha a linha de apoio 1, o mantra e o 1º passo do protocolo para continuar.
        </p>
      )}
    </div>
  );

  // ─── Etapa 3: Sistema de Recompensas ──────────────────────────────────────

  const step3 = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h2 style={{ color: COR_VERDE, marginBottom: 8 }}>Sistema de Recompensas</h2>
        <p style={{ color: '#4a5568', maxWidth: 600 }}>
          O cérebro precisa de reforço positivo para manter comportamentos. Defina recompensas reais e significativas para cada marco — e comprometa-se a honrá-las quando conquistados.
        </p>
      </div>

      <div style={{
        background: `${COR_GOLD}07`, border: `1px solid ${COR_GOLD}25`,
        borderRadius: 10, padding: '12px 16px',
      }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#7c5500', margin: 0 }}>
          💡 <strong>Dica:</strong> A recompensa deve ser proporcional ao milestone e genuinamente desejada por você — não por outros. Quanto mais específica e visual, mais motivadora.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {MILESTONES_CONFIG.map(cfg => (
          <MilestoneCard
            key={cfg.key}
            config={cfg}
            dados={milestones[cfg.key]}
            onChange={updated => setMilestones(prev => ({ ...prev, [cfg.key]: updated }))}
          />
        ))}
      </div>

      {milestonesDefinidos < 3 && (
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#92400e',
          background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: 8, padding: '10px 14px', margin: 0,
        }}>
          Defina a recompensa de pelo menos 3 milestones para concluir ({milestonesDefinidos}/3).
        </p>
      )}
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  const steps = [step0, step1, step2, step3];

  return (
    <FerramentaLayout
      codigo="F16"
      nome="Prevenção de Recaída"
      descricao="Planos SE-ENTÃO para os 7 cenários de risco, protocolo de reset e sistema de recompensas."
      etapas={ETAPAS}
      etapaAtual={etapa}
      progresso={progresso}
      onAvancar={() => setEtapa(e => Math.min(e + 1, ETAPAS.length - 1))}
      onVoltar={etapa > 0 ? () => setEtapa(e => e - 1) : undefined}
      podeAvancar={podeAvancar}
      totalItens={totalItens}
      labelItens={labelItens}
      resumo={painelResumo}
    >
      {steps[etapa]}
    </FerramentaLayout>
  );
}
