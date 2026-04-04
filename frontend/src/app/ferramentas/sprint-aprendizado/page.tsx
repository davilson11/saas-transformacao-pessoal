'use client';

import { useState, useEffect } from 'react';
import FerramentaLayout from '@/components/dashboard/FerramentaLayout';
import { useCarregarRespostas } from '@/lib/useCarregarRespostas';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TipoRecurso = 'Livro' | 'Curso' | 'Vídeo' | 'Podcast' | 'Artigo' | 'Outro';
type NivelEnergia = 1 | 2 | 3 | 4 | 5;

type ConfigSprint = {
  habilidade:       string;
  dataInicio:       string;
  dataFim:          string;
  tempoDiario:      string;
  definicaoSucesso: string;
  porqueAgora:      string;
};

type Recurso = {
  tipo:         TipoRecurso;
  nome:         string;
  link:         string;
  cargaHoraria: string;
};

type Projeto = {
  descricao: string;
  objetivo:  string;
};

type DiaSprint = {
  completado:  boolean;
  aprendizado: string;
  energia:     NivelEnergia;
};

// ─── Constantes ───────────────────────────────────────────────────────────────

const COR_VERDE  = '#1a5c3a';
const COR_GOLD   = '#b5840a';
const COR_BORDER = 'rgba(26,92,58,0.1)';

const ETAPAS = [
  { label: 'Bem-vindo',         descricao: 'Introdução à ferramenta'      },
  { label: 'Config. do Sprint', descricao: 'Habilidade, prazo e metas'    },
  { label: 'Recursos e Projetos', descricao: 'Materiais e práticas'       },
  { label: 'Tracker 30 dias',   descricao: 'Registre sua evolução diária' },
];

const TIPOS_RECURSO: TipoRecurso[] = ['Livro', 'Curso', 'Vídeo', 'Podcast', 'Artigo', 'Outro'];

const TIPO_EMOJI: Record<TipoRecurso, string> = {
  Livro:   '📘',
  Curso:   '🎓',
  Vídeo:   '▶️',
  Podcast: '🎙️',
  Artigo:  '📄',
  Outro:   '🔗',
};

const TEMPO_OPTS = [
  '15 min', '20 min', '30 min', '45 min',
  '1h', '1h30', '2h', '2h30', '3h',
];

const ENERGIA_INFO: Record<NivelEnergia, { label: string; cor: string }> = {
  1: { label: 'Muito baixa', cor: '#ef4444' },
  2: { label: 'Baixa',       cor: '#f97316' },
  3: { label: 'Média',       cor: '#eab308' },
  4: { label: 'Alta',        cor: '#84cc16' },
  5: { label: 'Máxima',      cor: '#22c55e' },
};

const RECURSO_DEFAULT: Recurso = { tipo: 'Livro', nome: '', link: '', cargaHoraria: '' };
const PROJETO_DEFAULT: Projeto = { descricao: '', objetivo: '' };
const DIA_DEFAULT: DiaSprint   = { completado: false, aprendizado: '', energia: 3 };

const SPRINT_DEFAULT: ConfigSprint = {
  habilidade: '', dataInicio: '', dataFim: '',
  tempoDiario: '1h', definicaoSucesso: '', porqueAgora: '',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcStreak(dias: DiaSprint[]): number {
  let lastIdx = -1;
  for (let i = dias.length - 1; i >= 0; i--) {
    if (dias[i].completado) { lastIdx = i; break; }
  }
  if (lastIdx === -1) return 0;
  let streak = 0;
  for (let i = lastIdx; i >= 0; i--) {
    if (dias[i].completado) streak++;
    else break;
  }
  return streak;
}

function ultimoAprendizado(dias: DiaSprint[]): { dia: number; texto: string } | null {
  for (let i = dias.length - 1; i >= 0; i--) {
    if (dias[i].completado && dias[i].aprendizado.trim().length > 0) {
      return { dia: i + 1, texto: dias[i].aprendizado };
    }
  }
  return null;
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function SprintAprendizadoPage() {
  const [etapa, setEtapa] = useState(0);

  const [config, setConfig] = useState<ConfigSprint>({ ...SPRINT_DEFAULT });

  const [recursos, setRecursos] = useState<Recurso[]>([
    { ...RECURSO_DEFAULT },
    { ...RECURSO_DEFAULT },
    { ...RECURSO_DEFAULT },
    { ...RECURSO_DEFAULT },
  ]);

  const [projetos, setProjetos] = useState<Projeto[]>([
    { ...PROJETO_DEFAULT },
    { ...PROJETO_DEFAULT },
    { ...PROJETO_DEFAULT },
    { ...PROJETO_DEFAULT },
  ]);

  const [dias, setDias] = useState<DiaSprint[]>(
    Array.from({ length: 30 }, () => ({ ...DIA_DEFAULT }))
  );

  const { dados: dadosSalvos } = useCarregarRespostas("sprint-aprendizado");
  useEffect(() => { if (!dadosSalvos) return; if ((dadosSalvos as any).config) setConfig((dadosSalvos as any).config); if ((dadosSalvos as any).recursos) setRecursos((dadosSalvos as any).recursos); if ((dadosSalvos as any).projetos) setProjetos((dadosSalvos as any).projetos); if ((dadosSalvos as any).dias) setDias((dadosSalvos as any).dias); }, [dadosSalvos]);

  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);

  // ─── Métricas ──────────────────────────────────────────────────────────────

  const diasCompletos   = dias.filter(d => d.completado).length;
  const streak          = calcStreak(dias);
  const ultimoAprendizadoInfo = ultimoAprendizado(dias);
  const recursosValidos = recursos.filter(r => r.nome.trim().length > 0).length;
  const projetosValidos = projetos.filter(p => p.descricao.trim().length > 0).length;

  const progresso =
    etapa === 0 ? 0
    : etapa === 1 ? (config.habilidade ? Math.min(33, 33) : 5)
    : etapa === 2 ? 33 + Math.min(33, Math.round(((recursosValidos + projetosValidos) / 8) * 33))
    : 66 + Math.min(34, Math.round((diasCompletos / 30) * 34));

  const podeAvancar =
    etapa === 0 ? true
    : etapa === 1 ? (config.habilidade.trim().length > 0 && config.dataInicio.length > 0 && config.dataFim.length > 0)
    : etapa === 2 ? (recursosValidos >= 1 || projetosValidos >= 1)
    : true;

  const totalItens =
    etapa === 1 ? undefined
    : etapa === 2 ? recursosValidos + projetosValidos
    : etapa === 3 ? diasCompletos
    : undefined;

  const labelItens =
    etapa === 2 ? 'itens configurados'
    : 'dias completados';

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const setConfig_ = (partial: Partial<ConfigSprint>) =>
    setConfig(prev => ({ ...prev, ...partial }));

  const setRecurso = (idx: number, partial: Partial<Recurso>) =>
    setRecursos(prev => prev.map((r, i) => i === idx ? { ...r, ...partial } : r));

  const setProjeto = (idx: number, partial: Partial<Projeto>) =>
    setProjetos(prev => prev.map((p, i) => i === idx ? { ...p, ...partial } : p));

  const toggleDia = (idx: number) => {
    setDias(prev => prev.map((d, i) =>
      i === idx ? { ...d, completado: !d.completado } : d
    ));
    setDiaSelecionado(idx);
  };

  const setDia = (idx: number, partial: Partial<DiaSprint>) =>
    setDias(prev => prev.map((d, i) => i === idx ? { ...d, ...partial } : d));

  // ─── Painel Direito ────────────────────────────────────────────────────────

  const pct = Math.round((diasCompletos / 30) * 100);

  const painelResumo = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Habilidade em foco */}
      {config.habilidade && (
        <div style={{
          background: `${COR_VERDE}08`,
          border: `1px solid ${COR_VERDE}18`,
          borderRadius: 10,
          padding: '10px 14px',
        }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: 'rgba(26,92,58,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            Habilidade
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: COR_VERDE, lineHeight: 1.35 }}>
            {config.habilidade}
          </p>
        </div>
      )}

      {/* Progresso dos 30 dias */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: COR_VERDE, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Progresso
          </p>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: COR_VERDE }}>
            {diasCompletos}
            <span style={{ fontSize: 12, fontWeight: 400, color: 'rgba(26,92,58,0.45)', marginLeft: 2 }}>/30</span>
          </span>
        </div>
        <div style={{ height: 8, borderRadius: 99, background: 'rgba(26,92,58,0.08)', overflow: 'hidden', marginBottom: 4 }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: pct >= 80
              ? '#16a34a'
              : pct >= 50
              ? COR_GOLD
              : '#2563eb',
            borderRadius: 99,
            transition: 'width 0.5s ease',
          }} />
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(26,92,58,0.45)', textAlign: 'right' }}>
          {pct}% concluído
        </p>
      </div>

      {/* Mini grid 30 dias */}
      <div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: COR_VERDE, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          Mapa de dias
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 3 }}>
          {dias.map((d, i) => (
            <div
              key={i}
              title={`Dia ${i + 1}${d.aprendizado ? `: ${d.aprendizado.slice(0, 40)}` : ''}`}
              style={{
                aspectRatio: '1',
                borderRadius: 4,
                background: d.completado
                  ? (diaSelecionado === i ? COR_VERDE : 'rgba(26,92,58,0.55)')
                  : diaSelecionado === i
                  ? `${COR_GOLD}30`
                  : 'rgba(26,92,58,0.07)',
                border: diaSelecionado === i
                  ? `1.5px solid ${d.completado ? COR_VERDE : COR_GOLD}`
                  : '1.5px solid transparent',
                transition: 'all 0.15s',
              }}
            />
          ))}
        </div>
      </div>

      {/* Streak */}
      <div style={{
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        background: streak >= 7 ? 'rgba(234,179,8,0.08)' : 'rgba(26,92,58,0.04)',
        border: `1px solid ${streak >= 7 ? 'rgba(234,179,8,0.25)' : COR_BORDER}`,
        borderRadius: 10,
        padding: '10px 14px',
      }}>
        <span style={{ fontSize: 24 }}>{streak >= 7 ? '🔥' : streak >= 3 ? '⚡' : '📅'}</span>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: streak >= 7 ? '#d97706' : COR_VERDE, lineHeight: 1 }}>
            {streak}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(26,92,58,0.55)' }}>
            {streak === 1 ? 'dia consecutivo' : 'dias consecutivos'}
          </div>
        </div>
        {streak >= 7 && (
          <div style={{
            marginLeft: 'auto',
            fontFamily: 'var(--font-body)',
            fontSize: 11,
            fontWeight: 700,
            color: '#d97706',
            background: 'rgba(217,119,6,0.12)',
            border: '1px solid rgba(217,119,6,0.25)',
            borderRadius: 99,
            padding: '2px 8px',
          }}>
            Em chamas!
          </div>
        )}
      </div>

      {/* Último aprendizado */}
      {ultimoAprendizadoInfo && (
        <div style={{
          background: '#fff',
          border: `1px solid ${COR_BORDER}`,
          borderRadius: 10,
          padding: '12px 14px',
        }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: 'rgba(26,92,58,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            Último aprendizado · Dia {ultimoAprendizadoInfo.dia}
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#2d3748', lineHeight: 1.5, fontStyle: 'italic' }}>
            &ldquo;{ultimoAprendizadoInfo.texto.length > 120
              ? ultimoAprendizadoInfo.texto.slice(0, 120) + '…'
              : ultimoAprendizadoInfo.texto}&rdquo;
          </p>
        </div>
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
          <span style={{ fontSize: 14 }}>⚡</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: COR_GOLD }}>
            F11 · Sprint de Aprendizado
          </span>
        </div>
        <h1 style={{ color: COR_VERDE, marginBottom: 12 }}>
          Domine qualquer habilidade em 30 dias
        </h1>
        <p style={{ color: '#4a5568', maxWidth: 560 }}>
          Um sprint de aprendizado é um período intenso e focado para dominar uma habilidade específica. Com método, recursos certos e prática diária, você avança mais em 30 dias do que em 1 ano sem estrutura.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {[
          { emoji: '🎯', titulo: 'Foco total',       desc: 'Uma habilidade, 30 dias, resultado mensurável' },
          { emoji: '📚', titulo: 'Recursos certos',  desc: 'Livros, cursos e vídeos selecionados com intenção' },
          { emoji: '🔨', titulo: 'Prática real',     desc: '4 projetos práticos para aprendizado ativo' },
          { emoji: '📊', titulo: 'Tracker diário',   desc: '30 dias de registro para ver sua evolução' },
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
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(26,92,58,0.6)', lineHeight: 1.5 }}>
                {item.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'rgba(181,132,10,0.06)', border: `1px solid ${COR_GOLD}25`,
        borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
        <p style={{ color: '#5c4a00', margin: 0, fontSize: 14 }}>
          <strong>Regra de ouro:</strong> Escolha <em>uma</em> habilidade específica — não &ldquo;aprender programação&rdquo;, mas &ldquo;construir um CRUD em React em 30 dias&rdquo;. Quanto mais específico o objetivo, maior a chance de sucesso.
        </p>
      </div>
    </div>
  );

  // ─── Etapa 1: Configuração do Sprint ──────────────────────────────────────

  const step1 = (
    <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <h2 style={{ color: COR_VERDE, marginBottom: 8 }}>Configuração do Sprint</h2>
        <p style={{ color: '#4a5568' }}>
          Defina com clareza o que você vai dominar, em quanto tempo e o que significa ter sucesso ao final dos 30 dias.
        </p>
      </div>

      {/* Habilidade */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: COR_VERDE }}>
          Habilidade a dominar <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="text"
          value={config.habilidade}
          onChange={e => setConfig_({ habilidade: e.target.value })}
          placeholder="Ex: Escrever copy de alta conversão para landing pages…"
          style={{
            border: `1.5px solid ${config.habilidade ? COR_VERDE + '40' : COR_BORDER}`,
            borderRadius: 8, padding: '10px 14px',
            fontSize: 15, fontFamily: 'var(--font-body)', color: '#1a2015',
            outline: 'none', background: '#fff',
          }}
        />
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(26,92,58,0.5)' }}>
          Seja específico — quanto mais concreto, mais fácil medir o progresso.
        </p>
      </div>

      {/* Datas e tempo */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: COR_VERDE }}>
            Data início <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="date"
            value={config.dataInicio}
            onChange={e => setConfig_({ dataInicio: e.target.value })}
            style={{
              border: `1px solid ${COR_BORDER}`, borderRadius: 8,
              padding: '8px 12px', fontSize: 14,
              fontFamily: 'var(--font-body)', color: '#1a2015',
              outline: 'none', background: '#fff',
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: COR_VERDE }}>
            Data fim <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="date"
            value={config.dataFim}
            onChange={e => setConfig_({ dataFim: e.target.value })}
            style={{
              border: `1px solid ${COR_BORDER}`, borderRadius: 8,
              padding: '8px 12px', fontSize: 14,
              fontFamily: 'var(--font-body)', color: '#1a2015',
              outline: 'none', background: '#fff',
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: COR_VERDE }}>
            Tempo diário
          </label>
          <select
            value={config.tempoDiario}
            onChange={e => setConfig_({ tempoDiario: e.target.value })}
            style={{
              border: `1px solid ${COR_BORDER}`, borderRadius: 8,
              padding: '8px 12px', fontSize: 14,
              fontFamily: 'var(--font-body)', color: '#1a2015',
              outline: 'none', background: '#fff', cursor: 'pointer',
            }}
          >
            {TEMPO_OPTS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Definição de sucesso */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: COR_VERDE }}>
          Definição de sucesso
        </label>
        <textarea
          value={config.definicaoSucesso}
          onChange={e => setConfig_({ definicaoSucesso: e.target.value })}
          placeholder="Como você saberá que dominou esta habilidade ao final dos 30 dias? Seja concreto…"
          rows={3}
          style={{
            border: `1px solid ${COR_BORDER}`, borderRadius: 8,
            padding: '10px 14px', fontSize: 15,
            fontFamily: 'var(--font-body)', color: '#1a2015',
            outline: 'none', background: '#fff',
            resize: 'vertical', lineHeight: 1.55,
          }}
        />
      </div>

      {/* Por que esta habilidade agora */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: COR_VERDE }}>
          Por que esta habilidade agora?
        </label>
        <textarea
          value={config.porqueAgora}
          onChange={e => setConfig_({ porqueAgora: e.target.value })}
          placeholder="Qual problema resolve? Qual oportunidade abre? Qual sonho aproxima?"
          rows={3}
          style={{
            border: `1px solid ${COR_BORDER}`, borderRadius: 8,
            padding: '10px 14px', fontSize: 15,
            fontFamily: 'var(--font-body)', color: '#1a2015',
            outline: 'none', background: '#fff',
            resize: 'vertical', lineHeight: 1.55,
          }}
        />
      </div>

      {!podeAvancar && (
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#92400e',
          background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: 8, padding: '10px 14px', margin: 0,
        }}>
          Preencha a habilidade, data de início e data de fim para continuar.
        </p>
      )}
    </div>
  );

  // ─── Etapa 2: Recursos e Projetos ─────────────────────────────────────────

  const step2 = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <h2 style={{ color: COR_VERDE, marginBottom: 8 }}>Recursos e Projetos</h2>
        <p style={{ color: '#4a5568' }}>
          Selecione os materiais que vai usar e defina projetos práticos para consolidar o aprendizado. A prática ativa supera qualquer quantidade de leitura passiva.
        </p>
      </div>

      {/* Recursos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>📚</span>
          <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 18, fontWeight: 700, color: COR_VERDE }}>
            Recursos de aprendizado
          </h3>
        </div>

        {recursos.map((r, idx) => (
          <div key={idx} style={{
            background: '#fff', border: `1px solid ${COR_BORDER}`,
            borderRadius: 10, padding: '14px 16px',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>{TIPO_EMOJI[r.tipo]}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'rgba(26,92,58,0.4)', letterSpacing: '0.06em' }}>
                RECURSO {idx + 1}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 100px', gap: 10 }}>
              {/* Tipo */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'rgba(26,92,58,0.6)' }}>Tipo</label>
                <select
                  value={r.tipo}
                  onChange={e => setRecurso(idx, { tipo: e.target.value as TipoRecurso })}
                  style={{
                    border: `1px solid ${COR_BORDER}`, borderRadius: 6,
                    padding: '6px 8px', fontSize: 13,
                    fontFamily: 'var(--font-body)', color: '#1a2015',
                    outline: 'none', background: '#fff', cursor: 'pointer',
                  }}
                >
                  {TIPOS_RECURSO.map(t => <option key={t} value={t}>{TIPO_EMOJI[t]} {t}</option>)}
                </select>
              </div>

              {/* Nome */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'rgba(26,92,58,0.6)' }}>Nome</label>
                <input
                  type="text"
                  value={r.nome}
                  onChange={e => setRecurso(idx, { nome: e.target.value })}
                  placeholder="Ex: The Lean Startup…"
                  style={{
                    border: `1px solid ${COR_BORDER}`, borderRadius: 6,
                    padding: '6px 10px', fontSize: 14,
                    fontFamily: 'var(--font-body)', color: '#1a2015',
                    outline: 'none', background: '#fff',
                  }}
                />
              </div>

              {/* Link */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'rgba(26,92,58,0.6)' }}>Link</label>
                <input
                  type="text"
                  value={r.link}
                  onChange={e => setRecurso(idx, { link: e.target.value })}
                  placeholder="https://…"
                  style={{
                    border: `1px solid ${COR_BORDER}`, borderRadius: 6,
                    padding: '6px 10px', fontSize: 13,
                    fontFamily: 'var(--font-mono)', color: '#1a2015',
                    outline: 'none', background: '#fff',
                  }}
                />
              </div>

              {/* Carga horária */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'rgba(26,92,58,0.6)' }}>Carga horária</label>
                <input
                  type="text"
                  value={r.cargaHoraria}
                  onChange={e => setRecurso(idx, { cargaHoraria: e.target.value })}
                  placeholder="Ex: 8h"
                  style={{
                    border: `1px solid ${COR_BORDER}`, borderRadius: 6,
                    padding: '6px 10px', fontSize: 14,
                    fontFamily: 'var(--font-body)', color: '#1a2015',
                    outline: 'none', background: '#fff',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Projetos práticos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🔨</span>
          <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 18, fontWeight: 700, color: COR_VERDE }}>
            Projetos práticos
          </h3>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(26,92,58,0.6)', margin: 0 }}>
          Projetos concretos que vão consolidar o aprendizado na prática. Sem praticar, você apenas sabe sobre a habilidade — não a domina.
        </p>

        {projetos.map((p, idx) => {
          const cores = ['#16a34a', '#2563eb', '#d97706', '#7c3aed'];
          const cor = cores[idx];
          return (
            <div key={idx} style={{
              background: `${cor}06`,
              border: `1.5px solid ${cor}20`,
              borderRadius: 10, padding: '14px 16px',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: cor, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
                  {idx + 1}
                </div>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: cor }}>
                  Projeto {idx + 1}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'rgba(26,92,58,0.7)' }}>
                  Descrição do projeto
                </label>
                <input
                  type="text"
                  value={p.descricao}
                  onChange={e => setProjeto(idx, { descricao: e.target.value })}
                  placeholder="Ex: Criar uma landing page completa para um produto fictício…"
                  style={{
                    border: `1px solid ${cor}25`, borderRadius: 7,
                    padding: '8px 12px', fontSize: 15,
                    fontFamily: 'var(--font-body)', color: '#1a2015',
                    outline: 'none', background: 'rgba(255,255,255,0.8)',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'rgba(26,92,58,0.7)' }}>
                  Objetivo / entregável
                </label>
                <input
                  type="text"
                  value={p.objetivo}
                  onChange={e => setProjeto(idx, { objetivo: e.target.value })}
                  placeholder="O que você vai entregar/produzir ao final deste projeto?"
                  style={{
                    border: `1px solid ${cor}25`, borderRadius: 7,
                    padding: '8px 12px', fontSize: 15,
                    fontFamily: 'var(--font-body)', color: '#1a2015',
                    outline: 'none', background: 'rgba(255,255,255,0.8)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {!podeAvancar && (
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#92400e',
          background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: 8, padding: '10px 14px', margin: 0,
        }}>
          Preencha pelo menos 1 recurso ou 1 projeto para continuar.
        </p>
      )}
    </div>
  );

  // ─── Etapa 3: Tracker 30 dias ─────────────────────────────────────────────

  const step3 = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ color: COR_VERDE, marginBottom: 8 }}>Tracker de 30 dias</h2>
        <p style={{ color: '#4a5568' }}>
          Marque cada dia que você praticou e registre o principal aprendizado. Clique em um dia para expandir e adicionar detalhes.
        </p>
      </div>

      {/* Stats rápidas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Dias completos', valor: diasCompletos, total: '/30', cor: COR_VERDE },
          { label: 'Sequência atual', valor: streak, total: ' dias', cor: streak >= 7 ? '#d97706' : '#2563eb' },
          { label: 'Conclusão', valor: pct, total: '%', cor: pct >= 80 ? '#16a34a' : COR_GOLD },
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#fff', border: `1px solid ${COR_BORDER}`,
            borderRadius: 10, padding: '14px 16px', textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 700, color: stat.cor, lineHeight: 1 }}>
              {stat.valor}
              <span style={{ fontSize: 13, fontWeight: 400, color: 'rgba(26,92,58,0.4)' }}>{stat.total}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(26,92,58,0.55)', marginTop: 4 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Grid 30 dias */}
      <div style={{
        background: '#fff', border: `1px solid ${COR_BORDER}`,
        borderRadius: 12, padding: '20px',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700,
          color: COR_VERDE, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16,
        }}>
          Clique para marcar o dia como completo
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
          {dias.map((d, i) => (
            <button
              key={i}
              onClick={() => toggleDia(i)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                padding: '10px 6px',
                borderRadius: 10,
                border: `2px solid ${
                  diaSelecionado === i
                    ? (d.completado ? COR_VERDE : COR_GOLD)
                    : d.completado
                    ? 'rgba(26,92,58,0.3)'
                    : COR_BORDER
                }`,
                background: d.completado
                  ? diaSelecionado === i ? `${COR_VERDE}18` : 'rgba(26,92,58,0.07)'
                  : diaSelecionado === i ? `${COR_GOLD}10` : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.15s',
                minHeight: 56,
              }}
            >
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 700,
                color: d.completado ? COR_VERDE : 'rgba(26,92,58,0.35)',
                letterSpacing: '0.04em',
              }}>
                D{String(i + 1).padStart(2, '0')}
              </span>
              <span style={{ fontSize: d.completado ? 16 : 14, lineHeight: 1 }}>
                {d.completado ? '✅' : '○'}
              </span>
              {d.aprendizado && (
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: COR_GOLD, flexShrink: 0,
                }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Painel do dia selecionado */}
      {diaSelecionado !== null && (
        <div style={{
          background: '#fff',
          border: `1.5px solid ${dias[diaSelecionado].completado ? COR_VERDE + '40' : COR_BORDER}`,
          borderRadius: 12, padding: '20px 22px',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: COR_VERDE,
              background: `${COR_VERDE}10`, border: `1px solid ${COR_VERDE}20`,
              borderRadius: 8, padding: '4px 12px',
            }}>
              Dia {diaSelecionado + 1}
            </div>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'rgba(26,92,58,0.6)' }}>
              {dias[diaSelecionado].completado ? '✅ Dia completo' : '○ Clique no dia para marcar como completo'}
            </span>
          </div>

          {/* Aprendizado do dia */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: COR_VERDE }}>
              Principal aprendizado do dia
            </label>
            <textarea
              value={dias[diaSelecionado].aprendizado}
              onChange={e => setDia(diaSelecionado, { aprendizado: e.target.value })}
              placeholder="O que você aprendeu hoje? Qual insight ou descoberta mais importante?"
              rows={3}
              style={{
                border: `1px solid ${COR_BORDER}`, borderRadius: 8,
                padding: '10px 14px', fontSize: 15,
                fontFamily: 'var(--font-body)', color: '#1a2015',
                outline: 'none', background: '#fafef9',
                resize: 'vertical', lineHeight: 1.55,
              }}
            />
          </div>

          {/* Nível de energia */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: COR_VERDE }}>
              Nível de energia durante o estudo
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {([1,2,3,4,5] as NivelEnergia[]).map(n => (
                <button
                  key={n}
                  onClick={() => setDia(diaSelecionado, { energia: n })}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 14px', borderRadius: 8,
                    border: `1.5px solid ${dias[diaSelecionado].energia === n ? ENERGIA_INFO[n].cor : COR_BORDER}`,
                    background: dias[diaSelecionado].energia === n ? `${ENERGIA_INFO[n].cor}15` : 'transparent',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    width: 12, height: 12, borderRadius: '50%',
                    background: ENERGIA_INFO[n].cor, flexShrink: 0,
                  }} />
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 13,
                    fontWeight: dias[diaSelecionado].energia === n ? 600 : 400,
                    color: dias[diaSelecionado].energia === n ? ENERGIA_INFO[n].cor : 'rgba(26,92,58,0.6)',
                  }}>
                    {n} — {ENERGIA_INFO[n].label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  const steps = [step0, step1, step2, step3];

  return (
    <FerramentaLayout
      codigo="F11"
      nome="Sprint de Aprendizado"
      descricao="Domine qualquer habilidade em 30 dias com método, recursos certos e prática diária."
      etapas={ETAPAS}
      etapaAtual={etapa}
      progresso={progresso}
      onAvancar={() => setEtapa(e => Math.min(e + 1, ETAPAS.length - 1))}
      onVoltar={etapa > 0 ? () => setEtapa(e => e - 1) : undefined}
      podeAvancar={podeAvancar}
      totalItens={totalItens}
      labelItens={labelItens}
      resumo={painelResumo}
  respostas={{ config, recursos, projetos, dias }}
    >
      {steps[etapa]}
    </FerramentaLayout>
  );
}
