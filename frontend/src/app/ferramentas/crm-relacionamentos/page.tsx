'use client';

import { useState, useEffect } from 'react';
import FerramentaLayout from '@/components/dashboard/FerramentaLayout';
import { useCarregarRespostas } from '@/lib/useCarregarRespostas';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type CategoriaContato = 'mentor' | 'familia' | 'amigo' | 'network' | 'recrutador';

type Contato = {
  nome:           string;
  categoria:      CategoriaContato;
  ultimoContato:  string;
  proximoContato: string;
  comoAjudar:     string;
  qualidade:      number;
};

type FrequenciaState = {
  estouFazendo: boolean | null;
  proximoPasso: string;
};

type Reflexao = { q1: string; q2: string; q3: string; q4: string };

// ─── Constantes ───────────────────────────────────────────────────────────────

const COR_VERDE  = '#1a5c3a';
const COR_GOLD   = '#b5840a';
const COR_BORDER = 'rgba(26,92,58,0.1)';

const ETAPAS = [
  { label: 'Bem-vindo',          descricao: 'Introdução à ferramenta'         },
  { label: 'Mapa de Contatos',   descricao: '10 relacionamentos mapeados'     },
  { label: 'Frequência Ideal',   descricao: 'Estratégia por categoria'        },
  { label: 'Reflexão',           descricao: '4 perguntas sobre conexões'      },
];

const CATEGORIA_KEYS: CategoriaContato[] = ['mentor', 'familia', 'amigo', 'network', 'recrutador'];

type CatConfig = {
  emoji:            string;
  nome:             string;
  cor:              string;
  bg:               string;
  frequencia:       string;
  meio:             string;
  comoAgregarValor: string;
  oQueEvitar:       string;
};

const CATEGORIAS: Record<CategoriaContato, CatConfig> = {
  mentor: {
    emoji: '🎓', nome: 'Mentor', cor: '#7c3aed', bg: 'rgba(124,58,237,0.07)',
    frequencia: 'Mensal',
    meio: 'Videochamada ou café presencial',
    comoAgregarValor: 'Compartilhe avanços, aplique os conselhos e dê feedback dos resultados obtidos',
    oQueEvitar: 'Pedir mais ajuda sem antes aplicar o que já foi ensinado',
  },
  familia: {
    emoji: '🏠', nome: 'Família', cor: '#e11d48', bg: 'rgba(225,29,72,0.05)',
    frequencia: 'Semanal',
    meio: 'Ligação, mensagem de voz ou visita presencial',
    comoAgregarValor: 'Presença real, escuta ativa e apoio nos momentos difíceis',
    oQueEvitar: 'Contato apenas em datas comemorativas ou quando precisar de algo',
  },
  amigo: {
    emoji: '🤝', nome: 'Amigo', cor: '#16a34a', bg: 'rgba(22,163,74,0.06)',
    frequencia: 'Quinzenal / Mensal',
    meio: 'Mensagem, encontro presencial ou chamada de vídeo',
    comoAgregarValor: 'Tomar a iniciativa do contato, reconhecer e ter interesse genuíno',
    oQueEvitar: 'Sumir por meses e reaparecer apenas quando precisar de algo',
  },
  network: {
    emoji: '🌐', nome: 'Network', cor: '#2563eb', bg: 'rgba(37,99,235,0.06)',
    frequencia: 'Mensal / Trimestral',
    meio: 'LinkedIn, e-mail ou eventos presenciais',
    comoAgregarValor: 'Indicações, conteúdo relevante, apresentar pessoas da rede',
    oQueEvitar: 'Contato apenas quando precisar de favores — relação unilateral',
  },
  recrutador: {
    emoji: '💼', nome: 'Recrutador', cor: '#d97706', bg: 'rgba(217,119,6,0.07)',
    frequencia: 'Trimestral',
    meio: 'LinkedIn, e-mail profissional',
    comoAgregarValor: 'Portfólio atualizado, indicar talentos, dar feedback sobre o mercado',
    oQueEvitar: 'Contato desesperado apenas quando precisar urgentemente de emprego',
  },
};

const PERGUNTAS_REFLEXAO: Array<{ key: keyof Reflexao; titulo: string; placeholder: string; emoji: string }> = [
  {
    key: 'q1', emoji: '🌟',
    titulo: 'As 3 pessoas mais importantes',
    placeholder: 'Quem são as 3 pessoas mais importantes na sua vida agora e você está realmente investindo nelas?',
  },
  {
    key: 'q2', emoji: '⚠️',
    titulo: 'O relacionamento negligenciado',
    placeholder: 'Qual relacionamento você tem negligenciado e que precisa de atenção urgente? Por quê?',
  },
  {
    key: 'q3', emoji: '🔍',
    titulo: 'A conexão que está faltando',
    placeholder: 'Que tipo de conexão ainda não existe na sua rede mas aceleraria sua transformação?',
  },
  {
    key: 'q4', emoji: '🎁',
    titulo: 'Como agregar antes de receber',
    placeholder: 'Como você pode gerar valor genuíno para as pessoas que admira antes de precisar de algo delas?',
  },
];

const CONTATO_DEFAULT: Contato = {
  nome: '', categoria: 'amigo', ultimoContato: '', proximoContato: '', comoAjudar: '', qualidade: 0,
};

const FREQ_DEFAULT: FrequenciaState = { estouFazendo: null, proximoPasso: '' };
const REFL_DEFAULT: Reflexao         = { q1: '', q2: '', q3: '', q4: '' };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const HOJE = new Date().toISOString().slice(0, 10);
const EM7  = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);

function precisaAtencao(c: Contato): boolean {
  if (!c.nome.trim() || !c.proximoContato) return false;
  return c.proximoContato <= EM7;
}

function getQualCor(q: number): string {
  if (q === 0) return 'rgba(26,92,58,0.3)';
  if (q >= 7)  return '#16a34a';
  if (q >= 4)  return '#d97706';
  return '#ef4444';
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function ContatoCard({ idx, contato, onChange }: {
  idx:     number;
  contato: Contato;
  onChange: (c: Contato) => void;
}) {
  const set = (p: Partial<Contato>) => onChange({ ...contato, ...p });
  const cat = CATEGORIAS[contato.categoria];
  const atencao = precisaAtencao(contato);

  return (
    <div style={{
      background: contato.nome ? (atencao ? 'rgba(217,119,6,0.04)' : '#fff') : '#fafaf9',
      border: `1.5px solid ${atencao && contato.nome ? '#d9770640' : contato.nome ? cat.cor + '25' : COR_BORDER}`,
      borderRadius: 10, padding: '14px 16px',
      display: 'flex', flexDirection: 'column', gap: 10,
      transition: 'border-color 0.2s',
    }}>
      {/* Linha 1: número + nome + categoria */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <div style={{
          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
          background: contato.nome ? cat.cor : 'rgba(26,92,58,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: '#fff',
        }}>
          {idx + 1}
        </div>

        <input
          type="text"
          value={contato.nome}
          onChange={e => set({ nome: e.target.value })}
          placeholder={`Contato ${idx + 1} — nome completo`}
          style={{
            flex: 1, minWidth: 160,
            border: `1px solid ${contato.nome ? cat.cor + '30' : COR_BORDER}`,
            borderRadius: 6, padding: '6px 10px', fontSize: 15,
            fontFamily: 'var(--font-body)', color: '#1a2015',
            fontWeight: contato.nome ? 600 : 400,
            outline: 'none', background: '#fff',
          }}
        />

        <select
          value={contato.categoria}
          onChange={e => set({ categoria: e.target.value as CategoriaContato })}
          style={{
            border: `1px solid ${cat.cor}30`, borderRadius: 6,
            padding: '6px 10px', fontSize: 13,
            fontFamily: 'var(--font-body)', color: cat.cor,
            fontWeight: 600, outline: 'none',
            background: `${cat.cor}08`, cursor: 'pointer',
          }}
        >
          {CATEGORIA_KEYS.map(k => (
            <option key={k} value={k}>{CATEGORIAS[k].emoji} {CATEGORIAS[k].nome}</option>
          ))}
        </select>

        {atencao && contato.nome && (
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700,
            color: '#d97706', background: 'rgba(217,119,6,0.12)',
            border: '1px solid rgba(217,119,6,0.25)',
            borderRadius: 99, padding: '2px 8px', flexShrink: 0,
          }}>
            ⚡ Esta semana
          </span>
        )}
      </div>

      {/* Linha 2: datas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'rgba(26,92,58,0.5)' }}>
            Último contato
          </label>
          <input
            type="date"
            value={contato.ultimoContato}
            onChange={e => set({ ultimoContato: e.target.value })}
            style={{
              border: `1px solid ${COR_BORDER}`, borderRadius: 6,
              padding: '5px 8px', fontSize: 13,
              fontFamily: 'var(--font-body)', color: '#1a2015',
              outline: 'none', background: '#fff',
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'rgba(26,92,58,0.5)' }}>
            Próximo contato
          </label>
          <input
            type="date"
            value={contato.proximoContato}
            min={HOJE}
            onChange={e => set({ proximoContato: e.target.value })}
            style={{
              border: `1px solid ${contato.proximoContato && contato.proximoContato <= EM7 ? '#d9770660' : COR_BORDER}`,
              borderRadius: 6, padding: '5px 8px', fontSize: 13,
              fontFamily: 'var(--font-body)', color: contato.proximoContato && contato.proximoContato <= EM7 ? '#d97706' : '#1a2015',
              fontWeight: contato.proximoContato && contato.proximoContato <= EM7 ? 600 : 400,
              outline: 'none', background: '#fff',
            }}
          />
        </div>
      </div>

      {/* Linha 3: como ajudar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <label style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'rgba(26,92,58,0.5)' }}>
          Como posso ajudar / agregar valor
        </label>
        <input
          type="text"
          value={contato.comoAjudar}
          onChange={e => set({ comoAjudar: e.target.value })}
          placeholder="Ex: Indicar para oportunidade, compartilhar recurso sobre…"
          style={{
            border: `1px solid ${COR_BORDER}`, borderRadius: 6,
            padding: '6px 10px', fontSize: 14,
            fontFamily: 'var(--font-body)', color: '#1a2015',
            outline: 'none', background: '#fff',
          }}
        />
      </div>

      {/* Linha 4: qualidade */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'rgba(26,92,58,0.5)', minWidth: 80 }}>
          Qualidade 1–10
        </span>
        <div style={{ display: 'flex', gap: 3 }}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              onClick={() => set({ qualidade: contato.qualidade === n ? 0 : n })}
              title={`${n}/10`}
              style={{
                width: 20, height: 20, borderRadius: 3, border: 'none',
                background: contato.qualidade >= n
                  ? (contato.qualidade >= 7 ? '#16a34a' : contato.qualidade >= 4 ? '#d97706' : '#ef4444')
                  : 'rgba(26,92,58,0.08)',
                cursor: 'pointer', padding: 0, transition: 'background 0.1s',
                fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700,
                color: contato.qualidade >= n ? '#fff' : 'rgba(26,92,58,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {n}
            </button>
          ))}
        </div>
        {contato.qualidade > 0 && (
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700,
            color: getQualCor(contato.qualidade),
          }}>
            {contato.qualidade >= 7 ? 'Saudável' : contato.qualidade >= 4 ? 'Atenção' : 'Crítico'}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function CrmRelacionamentosPage() {
  const [etapa, setEtapa] = useState(0);

  const [contatos, setContatos] = useState<Contato[]>(
    Array.from({ length: 10 }, () => ({ ...CONTATO_DEFAULT }))
  );

  const [frequencias, setFrequencias] = useState<Record<CategoriaContato, FrequenciaState>>({
    mentor:     { ...FREQ_DEFAULT },
    familia:    { ...FREQ_DEFAULT },
    amigo:      { ...FREQ_DEFAULT },
    network:    { ...FREQ_DEFAULT },
    recrutador: { ...FREQ_DEFAULT },
  });

  const [reflexao, setReflexao] = useState<Reflexao>({ ...REFL_DEFAULT });

  const { dados: dadosSalvos } = useCarregarRespostas("crm-relacionamentos");
  useEffect(() => { if (!dadosSalvos) return; if ((dadosSalvos as any).contatos) setContatos((dadosSalvos as any).contatos); if ((dadosSalvos as any).frequencias) setFrequencias((dadosSalvos as any).frequencias); if ((dadosSalvos as any).reflexao) setReflexao((dadosSalvos as any).reflexao); }, [dadosSalvos]);

  // ─── Métricas ──────────────────────────────────────────────────────────────

  const contatosPreenchidos = contatos.filter(c => c.nome.trim().length > 0).length;
  const contatosAtencao     = contatos.filter(precisaAtencao);
  const freqPreenchidas     = CATEGORIA_KEYS.filter(k => frequencias[k].estouFazendo !== null).length;
  const reflPreenchidas     = (Object.values(reflexao) as string[]).filter(v => v.trim().length > 0).length;

  const progresso =
    etapa === 0 ? 0
    : etapa === 1 ? Math.min(33, Math.round((contatosPreenchidos / 10) * 33))
    : etapa === 2 ? 33 + Math.min(33, Math.round((freqPreenchidas / 5) * 33))
    : 66 + Math.min(34, Math.round((reflPreenchidas / 4) * 34));

  const podeAvancar =
    etapa === 0 ? true
    : etapa === 1 ? contatosPreenchidos >= 3
    : etapa === 2 ? freqPreenchidas >= 3
    : reflPreenchidas >= 2;

  const totalItens =
    etapa === 1 ? contatosPreenchidos
    : etapa === 2 ? freqPreenchidas
    : etapa === 3 ? reflPreenchidas
    : undefined;

  const labelItens =
    etapa === 1 ? 'contatos mapeados'
    : etapa === 2 ? 'categorias avaliadas'
    : 'perguntas respondidas';

  // ─── Painel Direito ────────────────────────────────────────────────────────

  const contatosPorCategoria = CATEGORIA_KEYS.map(k => ({
    cat: CATEGORIAS[k],
    key: k,
    itens: contatos.filter(c => c.nome.trim() && c.categoria === k),
  })).filter(g => g.itens.length > 0);

  const painelResumo = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ background: `${COR_VERDE}07`, border: `1px solid ${COR_BORDER}`, borderRadius: 8, padding: '8px 12px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: COR_VERDE, lineHeight: 1 }}>
            {contatosPreenchidos}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(26,92,58,0.5)', marginTop: 2 }}>
            contatos
          </div>
        </div>
        <div style={{
          background: contatosAtencao.length > 0 ? 'rgba(217,119,6,0.08)' : `${COR_VERDE}07`,
          border: `1px solid ${contatosAtencao.length > 0 ? 'rgba(217,119,6,0.25)' : COR_BORDER}`,
          borderRadius: 8, padding: '8px 12px', textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: contatosAtencao.length > 0 ? '#d97706' : 'rgba(26,92,58,0.3)', lineHeight: 1 }}>
            {contatosAtencao.length}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(26,92,58,0.5)', marginTop: 2 }}>
            esta semana
          </div>
        </div>
      </div>

      {/* Atenção urgente */}
      {contatosAtencao.length > 0 && (
        <div style={{
          background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.2)',
          borderRadius: 10, padding: '12px 14px',
        }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
            ⚡ Contatar esta semana
          </p>
          {contatosAtencao.map((c, i) => {
            const cat = CATEGORIAS[c.categoria];
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < contatosAtencao.length - 1 ? 6 : 0 }}>
                <span style={{ fontSize: 14 }}>{cat.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#2d3748', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.nome}
                  </div>
                  {c.proximoContato && (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: c.proximoContato < HOJE ? '#dc2626' : '#d97706' }}>
                      {c.proximoContato < HOJE ? '⚠ Atrasado' : c.proximoContato === HOJE ? 'Hoje' : c.proximoContato}
                    </div>
                  )}
                </div>
                {c.qualidade > 0 && (
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: getQualCor(c.qualidade), flexShrink: 0 }} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Por categoria */}
      {contatosPorCategoria.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: COR_VERDE, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Por categoria
          </p>
          {contatosPorCategoria.map(grupo => (
            <div key={grupo.key} style={{
              background: grupo.cat.bg,
              border: `1px solid ${grupo.cat.cor}20`,
              borderRadius: 8, padding: '10px 12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 14 }}>{grupo.cat.emoji}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: grupo.cat.cor }}>
                  {grupo.cat.nome}
                </span>
                <span style={{
                  marginLeft: 'auto',
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                  color: grupo.cat.cor, opacity: 0.7,
                }}>
                  {grupo.itens.length}
                </span>
              </div>
              {grupo.itens.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: i < grupo.itens.length - 1 ? 4 : 0 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: getQualCor(c.qualidade), flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#2d3748', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.nome}
                  </span>
                  {precisaAtencao(c) && <span style={{ fontSize: 10 }}>⚡</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {contatosPreenchidos === 0 && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(26,92,58,0.4)', fontStyle: 'italic', textAlign: 'center' }}>
          Adicione contatos para visualizá-los aqui.
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
          <span style={{ fontSize: 14 }}>🤝</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: COR_GOLD }}>
            F14 · CRM de Relacionamentos
          </span>
        </div>
        <h1 style={{ color: COR_VERDE, marginBottom: 12 }}>
          Seus relacionamentos são seu maior patrimônio
        </h1>
        <p style={{ color: '#4a5568', maxWidth: 560 }}>
          Não existe crescimento solitário. Esta ferramenta transforma seus relacionamentos mais importantes em um sistema gerenciado — com intenção, frequência e reciprocidade.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {CATEGORIA_KEYS.map(k => {
          const cat = CATEGORIAS[k];
          return (
            <div key={k} style={{
              background: cat.bg, border: `1px solid ${cat.cor}20`,
              borderRadius: 12, padding: '16px 18px',
              display: 'flex', gap: 12, alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{cat.emoji}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700, color: cat.cor, marginBottom: 2 }}>
                  {cat.nome}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(26,92,58,0.55)', lineHeight: 1.45 }}>
                  {cat.frequencia} · {cat.meio.split(' ou ')[0]}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        background: 'rgba(181,132,10,0.06)', border: `1px solid ${COR_GOLD}25`,
        borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
        <p style={{ color: '#5c4a00', margin: 0, fontSize: 14 }}>
          <strong>Princípio fundamental:</strong> Antes de precisar de algo, seja a pessoa que mais agrega valor. Construa o relacionamento quando não precisa — use quando precisar.
        </p>
      </div>
    </div>
  );

  // ─── Etapa 1: Mapa de Relacionamentos ─────────────────────────────────────

  const step1 = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ color: COR_VERDE, marginBottom: 8 }}>Mapa de Relacionamentos</h2>
        <p style={{ color: '#4a5568', maxWidth: 600 }}>
          Cadastre as 10 pessoas mais importantes da sua rede. Defina próximo contato para ativar o indicador de atenção semanal no painel.
        </p>
      </div>

      {contatos.map((c, i) => (
        <ContatoCard
          key={i}
          idx={i}
          contato={c}
          onChange={updated => setContatos(prev => prev.map((x, j) => j === i ? updated : x))}
        />
      ))}

      {contatosPreenchidos < 3 && (
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#92400e',
          background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: 8, padding: '10px 14px', margin: 0,
        }}>
          Preencha pelo menos 3 contatos para continuar ({contatosPreenchidos}/3).
        </p>
      )}
    </div>
  );

  // ─── Etapa 2: Frequência Ideal ─────────────────────────────────────────────

  const step2 = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ color: COR_VERDE, marginBottom: 8 }}>Frequência Ideal por Categoria</h2>
        <p style={{ color: '#4a5568', maxWidth: 600 }}>
          Revise as recomendações para cada tipo de relacionamento e avalie se está praticando. Defina o próximo passo concreto para cada categoria.
        </p>
      </div>

      {CATEGORIA_KEYS.map(k => {
        const cat  = CATEGORIAS[k];
        const freq = frequencias[k];
        const setFreq = (p: Partial<FrequenciaState>) =>
          setFrequencias(prev => ({ ...prev, [k]: { ...prev[k], ...p } }));

        return (
          <div key={k} style={{
            background: cat.bg, border: `1.5px solid ${cat.cor}25`,
            borderRadius: 12, padding: '18px 20px',
            display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>{cat.emoji}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700, color: cat.cor }}>
                  {cat.nome}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: `${cat.cor}80` }}>
                  {cat.frequencia}
                </div>
              </div>
            </div>

            {/* Tabela de recomendações */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: '📡 Meio de contato',      texto: cat.meio },
                { label: '🎁 Como agregar valor',   texto: cat.comoAgregarValor },
                { label: '🚫 O que evitar',         texto: cat.oQueEvitar },
                { label: '📅 Frequência recomendada', texto: cat.frequencia },
              ].map(item => (
                <div key={item.label} style={{
                  background: 'rgba(255,255,255,0.6)', borderRadius: 8, padding: '10px 12px',
                }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: 'rgba(26,92,58,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                    {item.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#2d3748', lineHeight: 1.45 }}>
                    {item.texto}
                  </div>
                </div>
              ))}
            </div>

            {/* Avaliação do usuário */}
            <div style={{ borderTop: `1px solid ${cat.cor}15`, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: '#2d3748' }}>
                  Estou fazendo isso?
                </span>
                {([true, false] as const).map(val => (
                  <button
                    key={String(val)}
                    onClick={() => setFreq({ estouFazendo: val })}
                    style={{
                      padding: '5px 14px', borderRadius: 99,
                      border: `1.5px solid ${freq.estouFazendo === val ? (val ? '#16a34a' : '#ef4444') : COR_BORDER}`,
                      background: freq.estouFazendo === val ? (val ? 'rgba(22,163,74,0.12)' : 'rgba(239,68,68,0.1)') : '#fff',
                      color: freq.estouFazendo === val ? (val ? '#16a34a' : '#ef4444') : 'rgba(26,92,58,0.5)',
                      fontFamily: 'var(--font-body)', fontSize: 13,
                      fontWeight: freq.estouFazendo === val ? 600 : 400,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {val ? '✓ Sim' : '✗ Não ainda'}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'rgba(26,92,58,0.65)' }}>
                  Meu próximo passo concreto
                </label>
                <input
                  type="text"
                  value={freq.proximoPasso}
                  onChange={e => setFreq({ proximoPasso: e.target.value })}
                  placeholder={`Ex: Agendar ${cat.frequencia.toLowerCase()} com ${cat.nome.toLowerCase()}…`}
                  style={{
                    border: `1px solid ${freq.proximoPasso ? cat.cor + '40' : cat.cor + '20'}`,
                    borderRadius: 7, padding: '7px 12px', fontSize: 14,
                    fontFamily: 'var(--font-body)', color: '#1a2015',
                    outline: 'none', background: 'rgba(255,255,255,0.8)',
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}

      {freqPreenchidas < 3 && (
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#92400e',
          background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: 8, padding: '10px 14px', margin: 0,
        }}>
          Avalie pelo menos 3 categorias (Sim/Não) para continuar ({freqPreenchidas}/3).
        </p>
      )}
    </div>
  );

  // ─── Etapa 3: Reflexão ────────────────────────────────────────────────────

  const step3 = (
    <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <h2 style={{ color: COR_VERDE, marginBottom: 8 }}>Reflexão sobre Relacionamentos</h2>
        <p style={{ color: '#4a5568' }}>
          Quatro perguntas que revelam a verdade sobre como você está gerindo seus relacionamentos. Responda com honestidade total.
        </p>
      </div>

      {PERGUNTAS_REFLEXAO.map(perg => (
        <div key={perg.key} style={{
          background: '#fff', border: `1px solid ${COR_BORDER}`,
          borderRadius: 12, padding: '18px 20px',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{perg.emoji}</span>
            <label style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700, color: COR_VERDE, lineHeight: 1.35 }}>
              {perg.titulo}
            </label>
          </div>
          <textarea
            value={reflexao[perg.key]}
            onChange={e => setReflexao(prev => ({ ...prev, [perg.key]: e.target.value }))}
            placeholder={perg.placeholder}
            rows={4}
            style={{
              border: `1px solid ${reflexao[perg.key] ? COR_VERDE + '40' : COR_BORDER}`,
              borderRadius: 8, padding: '10px 14px', fontSize: 15,
              fontFamily: 'var(--font-body)', color: '#1a2015',
              outline: 'none', background: reflexao[perg.key] ? 'rgba(26,92,58,0.02)' : '#fff',
              resize: 'vertical', lineHeight: 1.6,
            }}
          />
        </div>
      ))}

      {reflPreenchidas < 2 && (
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#92400e',
          background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: 8, padding: '10px 14px', margin: 0,
        }}>
          Responda pelo menos 2 perguntas para salvar sua reflexão ({reflPreenchidas}/2).
        </p>
      )}
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  const steps = [step0, step1, step2, step3];

  return (
    <FerramentaLayout
      codigo="F14"
      nome="CRM de Relacionamentos"
      descricao="Gerencie seus 10 relacionamentos mais importantes com intenção, frequência e reciprocidade."
      etapas={ETAPAS}
      etapaAtual={etapa}
      progresso={progresso}
      onAvancar={() => setEtapa(e => Math.min(e + 1, ETAPAS.length - 1))}
      onVoltar={etapa > 0 ? () => setEtapa(e => e - 1) : undefined}
      podeAvancar={podeAvancar}
      totalItens={totalItens}
      labelItens={labelItens}
      resumo={painelResumo}
  respostas={{ contatos, frequencias, reflexao }}
    >
      {steps[etapa]}
    </FerramentaLayout>
  );
}
