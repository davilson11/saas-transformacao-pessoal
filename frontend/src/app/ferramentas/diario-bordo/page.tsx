'use client';

/*
  MIGRAÇÃO SUPABASE — execute no SQL Editor antes de usar:

  ALTER TABLE diario_kairos
    ADD COLUMN IF NOT EXISTS tipo_entrada TEXT NOT NULL DEFAULT 'livre',
    ADD COLUMN IF NOT EXISTS texto_livre  TEXT;
*/

import { useState, useEffect, useRef } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useSupabaseClient } from '@/lib/useSupabaseClient';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import type { DiarioKairos } from '@/lib/database.types';

// ─── Alias ────────────────────────────────────────────────────────────────────

type Entrada = DiarioKairos;
type TipoEntrada = 'livre' | 'diario' | 'profunda' | 'legado';

function getTipo(e: Entrada): TipoEntrada {
  if (e.tipo_entrada === 'diario')   return 'diario';
  if (e.tipo_entrada === 'livre')    return 'livre';
  if (e.tipo_entrada === 'profunda') return 'profunda';
  return 'legado';
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const EMOJIS = ['😣', '😔', '😐', '🙂', '😊', '😄', '🤩'] as const;

const STOPWORDS = new Set([
  'de','a','o','que','e','do','da','em','um','para','com','uma','os','no','se',
  'na','por','mais','as','dos','como','mas','ao','ele','das','seu','sua',
  'ou','quando','muito','nos','já','eu','também','só','pelo','pela','até','isso',
  'ela','entre','depois','sem','mesmo','seus','quem','nas','me','esse',
  'eles','você','essa','num','nem','suas','meu','minha','numa','pelos',
  'elas','seja','qual','será','nós','tenho','lhe','essas','esses',
  'pelas','este','fosse','dele','tu','te','vocês','vos','lhes','meus','minhas',
  'teu','tua','teus','tuas','nosso','nossa','nossos','nossas','dela','delas',
  'esta','estes','estas','aquele','aquela','aqueles','aquelas','isto','aquilo',
  'foi','é','são','fui','ser','ter','há','não','sim','então','hoje','dia',
  'anos','ano','vez','coisa','coisas','fazer','feito','ainda','assim','muito',
]);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dataHoje(): string {
  return new Date()
    .toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    .split('/')
    .reverse()
    .join('-');
}

function horaAgora(): string {
  return new Date().toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatarHora(entrada: Entrada): string {
  if (entrada.hora_registro) return entrada.hora_registro;
  return new Date(entrada.created_at).toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatarData(data: string): string {
  const hoje  = dataHoje();
  const ontem = new Date(Date.now() - 86_400_000)
    .toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    .split('/').reverse().join('-');
  if (data === hoje)  return 'Hoje';
  if (data === ontem) return 'Ontem';
  const [, mes, dia] = data.split('-');
  const MESES = ['', 'jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${dia} ${MESES[parseInt(mes, 10)] ?? mes}`;
}

function palavraFrequente(entradas: Entrada[]): string {
  const freq: Record<string, number> = {};
  for (const e of (entradas ?? [])) {
    // Incluir todos os campos de texto de todos os tipos de entrada
    const textos = [
      e.texto_livre,
      e.conquista,
      e.preocupacao,
      e.gratidao,
      e.aprendizado,
      e.missao_execucao,
    ];
    for (const txt of textos) {
      if (!txt) continue;
      txt
        .toLowerCase()
        .replace(/[^a-záéíóúãõâêîôûçàü\s]/g, ' ')
        .split(/\s+/)
        .filter(p => p.length > 3 && !STOPWORDS.has(p))
        .forEach(p => { freq[p] = (freq[p] ?? 0) + 1; });
    }
  }
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
}

function humorDominante(entradas: Entrada[]): string {
  const freq: Record<string, number> = {};
  for (const e of (entradas ?? []).slice(0, 7)) {
    if (!e.emocao) continue;
    freq[e.emocao] = (freq[e.emocao] ?? 0) + 1;
  }
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
}

function gerarInsight(palavra: string, humor: string): string {
  if (palavra && humor) {
    return `A palavra "${palavra}" aparece com frequência nas suas entradas — e seu humor predominante foi ${humor}. Pode ser um tema importante a explorar.`;
  }
  if (palavra) {
    return `"${palavra}" surge repetidamente. Pode ser algo que a sua mente está processando.`;
  }
  if (humor) {
    return `Seu humor dominante desta semana foi ${humor}. Como você se sente em relação a isso?`;
  }
  return 'Continue escrevendo — padrões mais profundos emergirão com o tempo.';
}

// ─── Estilos base ─────────────────────────────────────────────────────────────

const INPUT_STYLE: React.CSSProperties = {
  background:  'rgba(245,240,232,0.04)',
  border:      '1px solid rgba(245,240,232,0.1)',
  borderRadius: 8,
  padding:     '10px 14px',
  color:       '#F5F0E8',
  fontSize:    14,
  width:       '100%',
  boxSizing:   'border-box',
  outline:     'none',
  fontFamily:  'inherit',
  resize:      'none',
  lineHeight:  1.65,
};

// ─── Camada 1 — Modal de Entrada Livre ────────────────────────────────────────

function ModalEntradaLivre({
  onFechar,
  onSalvar,
}: {
  onFechar: () => void;
  onSalvar: (texto: string, emoji: string) => Promise<void>;
}) {
  const [texto,    setTexto]    = useState('');
  const [emoji,    setEmoji]    = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro,     setErro]     = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { textareaRef.current?.focus(); }, []);

  async function salvar() {
    if (!texto.trim() || salvando) return;
    setErro(null);
    setSalvando(true);
    try {
      await onSalvar(texto.trim(), emoji);
      onFechar();
    } catch (e) {
      setSalvando(false);
      setErro(mensagemErro(e));
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { onFechar(); return; }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { salvar(); }
  }

  const podeAvancar = texto.trim().length > 0 && !salvando;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onFechar(); }}
    >
      <div style={{
        background: '#141414',
        border: '1px solid rgba(200,160,48,0.2)',
        borderRadius: 20,
        width: '100%', maxWidth: 560,
        padding: '28px 28px 24px',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
              color: '#C8A030', textTransform: 'uppercase', marginBottom: 4,
            }}>
              Entrada livre
            </div>
            <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.3)' }}>
              {new Date().toLocaleString('pt-BR', {
                weekday: 'long', hour: '2-digit', minute: '2-digit',
                timeZone: 'America/Sao_Paulo',
              })}
            </div>
          </div>
          <button
            onClick={onFechar}
            style={{
              background: 'rgba(245,240,232,0.06)', border: 'none',
              borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
              color: 'rgba(245,240,232,0.4)', fontSize: 14, flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="O que está na sua mente agora? Escreva sem filtro, sem julgamento..."
          rows={8}
          style={{
            ...INPUT_STYLE,
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 15,
            lineHeight: 1.75,
            border: '1px solid rgba(245,240,232,0.12)',
            borderRadius: 12,
            padding: '16px',
          }}
        />

        {/* Emoji (opcional) */}
        <div>
          <div style={{
            fontSize: 10, color: 'rgba(245,240,232,0.3)',
            marginBottom: 8, letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            Como você está agora? <span style={{ opacity: 0.6 }}>(opcional)</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(emoji === e ? '' : e)}
                style={{
                  fontSize: 22,
                  background: emoji === e ? 'rgba(200,160,48,0.15)' : 'transparent',
                  border: emoji === e
                    ? '1.5px solid rgba(200,160,48,0.45)'
                    : '1.5px solid transparent',
                  borderRadius: 8,
                  padding: '4px 5px',
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Ações */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'rgba(245,240,232,0.2)' }}>⌘ Enter para salvar</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onFechar}
              style={{
                background: 'transparent',
                border: '1px solid rgba(245,240,232,0.12)',
                borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
                color: 'rgba(245,240,232,0.45)', fontSize: 13,
              }}
            >
              Cancelar
            </button>
            <button
              onClick={salvar}
              disabled={!podeAvancar}
              style={{
                background: erro ? 'rgba(239,68,68,0.85)' : podeAvancar ? '#C8A030' : 'rgba(200,160,48,0.15)',
                border: 'none', borderRadius: 8,
                padding: '8px 22px',
                cursor: podeAvancar ? 'pointer' : 'not-allowed',
                color: erro ? '#fff' : podeAvancar ? '#0E0E0E' : 'rgba(200,160,48,0.35)',
                fontSize: 13, fontWeight: 700,
                transition: 'all 0.15s',
              }}
            >
              {salvando ? 'Salvando…' : erro ? '✗ Erro — toque para tentar novamente' : 'Salvar'}
            </button>
          </div>
        </div>
        {/* Mensagem de erro visível */}
        {erro && (
          <div style={{
            marginTop: 12,
            padding: '10px 14px',
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8,
            fontSize: 12,
            color: '#fca5a5',
            lineHeight: 1.5,
          }}>
            ⚠️ {erro}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Camada 2 — Registro Diário ───────────────────────────────────────────────

function CardDiario({
  onSalvar,
}: {
  onSalvar: (d: { conquista: string; preocupacao: string; gratidao: string; aprendizado: string; missao_execucao: string }) => Promise<void>;
}) {
  const [conquista,      setConquista]      = useState('');
  const [preocupacao,    setPreocupacao]    = useState('');
  const [gratidao,       setGratidao]       = useState('');
  const [aprendizado,    setAprendizado]    = useState('');
  const [missaoExecucao, setMissaoExecucao] = useState('');
  const [salvando,       setSalvando]       = useState(false);
  const [salvo,          setSalvo]          = useState(false);
  const [erro,           setErro]           = useState<string | null>(null);

  async function salvar() {
    const algum = conquista || preocupacao || gratidao || aprendizado || missaoExecucao;
    if (salvando || !algum.trim()) return;
    setErro(null);
    setSalvando(true);
    try {
      await onSalvar({
        conquista:      conquista.trim(),
        preocupacao:    preocupacao.trim(),
        gratidao:       gratidao.trim(),
        aprendizado:    aprendizado.trim(),
        missao_execucao: missaoExecucao.trim(),
      });
      setSalvo(true);
    } catch (e) {
      setSalvando(false);
      setErro(mensagemErro(e));
    }
  }

  if (salvo) return null;

  const algumPreenchido = conquista.trim() || preocupacao.trim() || gratidao.trim()
    || aprendizado.trim() || missaoExecucao.trim();

  const perguntas = [
    { label: '🌟 O que foi mais significativo hoje?', value: conquista,      set: setConquista,      ph: 'Qualquer coisa, pequena ou grande…' },
    { label: '💭 O que está pesando?',                value: preocupacao,    set: setPreocupacao,    ph: 'Pode ser algo concreto ou uma sensação…' },
    { label: '🙏 Pelo que sou grato?',               value: gratidao,       set: setGratidao,       ph: 'Uma pessoa, momento, sensação…' },
    { label: '📈 O que você aprendeu hoje?',          value: aprendizado,    set: setAprendizado,    ph: 'Uma percepção, habilidade ou lição…' },
    { label: '🎯 O que faria diferente amanhã?',      value: missaoExecucao, set: setMissaoExecucao, ph: 'Uma atitude, decisão ou abordagem…' },
  ];

  return (
    <div style={{
      background: 'rgba(200,160,48,0.04)',
      border: '1px solid rgba(200,160,48,0.15)',
      borderRadius: 16,
      padding: '22px 22px 20px',
      display: 'flex', flexDirection: 'column', gap: 18,
    }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 3, height: 32, background: '#C8A030', borderRadius: 99, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#C8A030', marginBottom: 2 }}>
            Reflexão do dia
          </div>
          <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.3)' }}>
            5 perguntas · responda no seu ritmo
          </div>
        </div>
      </div>

      {/* Perguntas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {perguntas.map(({ label, value, set, ph }) => (
          <div key={label}>
            <label style={{
              fontSize: 12, color: 'rgba(245,240,232,0.5)',
              display: 'block', marginBottom: 6,
            }}>
              {label}
            </label>
            <textarea
              value={value}
              onChange={(e) => set(e.target.value)}
              rows={2}
              placeholder={ph}
              style={INPUT_STYLE}
            />
          </div>
        ))}
      </div>

      {/* Botão salvar + erro */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
        <button
          onClick={salvar}
          disabled={!algumPreenchido || salvando}
          style={{
            background: erro ? 'rgba(239,68,68,0.85)' : algumPreenchido ? '#C8A030' : 'rgba(200,160,48,0.15)',
            border: 'none', borderRadius: 8,
            padding: '9px 24px', cursor: (algumPreenchido && !salvando) ? 'pointer' : 'not-allowed',
            color: erro ? '#fff' : algumPreenchido ? '#0E0E0E' : 'rgba(200,160,48,0.35)',
            fontSize: 13, fontWeight: 700,
            transition: 'all 0.15s',
          }}
        >
          {salvando ? 'Salvando…' : erro ? '✗ Erro — toque para tentar novamente' : '✓ Salvar reflexão'}
        </button>
        {erro && (
          <p style={{ fontSize: 12, color: '#fca5a5', margin: 0, textAlign: 'right', lineHeight: 1.5 }}>
            ⚠️ {erro}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Camada — Reflexão Profunda (Domingos) ────────────────────────────────────

function CardReflexaoProfunda({
  onSalvar,
}: {
  onSalvar: (d: { texto_livre: string; conquista: string; aprendizado: string; preocupacao: string }) => Promise<void>;
}) {
  const [padrao,     setPadrao]     = useState('');
  const [desafio,    setDesafio]    = useState('');
  const [crescendo,  setCrescendo]  = useState('');
  const [drenando,   setDrenando]   = useState('');
  const [salvando,   setSalvando]   = useState(false);
  const [salvo,      setSalvo]      = useState(false);
  const [erro,       setErro]       = useState<string | null>(null);

  async function salvar() {
    const algum = padrao || desafio || crescendo || drenando;
    if (salvando || !algum.trim()) return;
    setErro(null);
    setSalvando(true);
    try {
      await onSalvar({
        texto_livre:  padrao.trim(),
        conquista:    desafio.trim(),
        aprendizado:  crescendo.trim(),
        preocupacao:  drenando.trim(),
      });
      setSalvo(true);
    } catch (e) {
      setSalvando(false);
      setErro(mensagemErro(e));
    }
  }

  if (salvo) return null;

  const algumPreenchido = padrao.trim() || desafio.trim() || crescendo.trim() || drenando.trim();

  const perguntas = [
    { label: '🔍 Qual padrão você notou em si esta semana?', value: padrao,    set: setPadrao,    ph: 'Um comportamento recorrente, emoção ou pensamento…' },
    { label: '💪 Qual foi seu maior desafio?',               value: desafio,   set: setDesafio,   ph: 'O que te testou, o que você aprendeu com isso…' },
    { label: '🌱 O que está crescendo em você?',             value: crescendo, set: setCrescendo, ph: 'Uma qualidade, habilidade ou mudança percebida…' },
    { label: '⚡ O que está drenando sua energia?',          value: drenando,  set: setDrenando,  ph: 'Pessoa, situação, hábito ou pensamento…' },
  ];

  return (
    <div style={{
      background: 'rgba(109,40,217,0.05)',
      border: '1px solid rgba(109,40,217,0.2)',
      borderRadius: 16,
      padding: '22px 22px 20px',
      display: 'flex', flexDirection: 'column', gap: 18,
    }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 3, height: 32, background: '#a78bfa', borderRadius: 99, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#a78bfa', marginBottom: 2 }}>
            Reflexão profunda — domingo
          </div>
          <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.3)' }}>
            4 perguntas para encerrar a semana com consciência
          </div>
        </div>
      </div>

      {/* Perguntas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {perguntas.map(({ label, value, set, ph }) => (
          <div key={label}>
            <label style={{
              fontSize: 12, color: 'rgba(245,240,232,0.5)',
              display: 'block', marginBottom: 6,
            }}>
              {label}
            </label>
            <textarea
              value={value}
              onChange={(e) => set(e.target.value)}
              rows={2}
              placeholder={ph}
              style={INPUT_STYLE}
            />
          </div>
        ))}
      </div>

      {/* Botão salvar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={salvar}
          disabled={!algumPreenchido || salvando}
          style={{
            background: erro ? 'rgba(239,68,68,0.85)' : algumPreenchido ? '#a78bfa' : 'rgba(109,40,217,0.15)',
            border: 'none', borderRadius: 8,
            padding: '9px 24px', cursor: (algumPreenchido && !salvando) ? 'pointer' : 'not-allowed',
            color: erro ? '#fff' : algumPreenchido ? '#0E0E0E' : 'rgba(167,139,250,0.35)',
            fontSize: 13, fontWeight: 700,
            transition: 'all 0.15s',
          }}
        >
          {salvando ? 'Salvando…' : erro ? '✗ Erro — toque para tentar novamente' : '✓ Salvar reflexão'}
        </button>
        {erro && (
          <p style={{ fontSize: 12, color: '#fca5a5', margin: 0, textAlign: 'right', lineHeight: 1.5 }}>
            ⚠️ {erro}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Camada 3 — Padrões Revelados ────────────────────────────────────────────

function CardPadroes({ entradas }: { entradas: Entrada[] }) {
  const palavra = palavraFrequente(entradas);
  const humor   = humorDominante(entradas);
  const insight = gerarInsight(palavra, humor);

  return (
    <div style={{
      background: 'rgba(109,40,217,0.05)',
      border: '1px solid rgba(109,40,217,0.18)',
      borderRadius: 16,
      padding: '22px 22px 20px',
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 22 }}>🔮</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#a78bfa' }}>Padrões revelados</div>
          <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.3)', marginTop: 2 }}>
            Baseado nas suas últimas {entradas.length} entradas
          </div>
        </div>
      </div>

      {(palavra || humor) && (
        <div style={{ display: 'flex', gap: 10 }}>
          {palavra && (
            <div style={{
              flex: 1,
              background: 'rgba(109,40,217,0.08)',
              border: '1px solid rgba(109,40,217,0.15)',
              borderRadius: 10, padding: '14px',
            }}>
              <div style={{
                fontSize: 9, color: 'rgba(167,139,250,0.55)',
                letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6,
              }}>
                Palavra-chave
              </div>
              <div style={{
                fontSize: 17, fontWeight: 700, color: '#a78bfa',
                fontFamily: "Georgia, serif",
              }}>
                "{palavra}"
              </div>
            </div>
          )}
          {humor && (
            <div style={{
              flex: 1,
              background: 'rgba(109,40,217,0.08)',
              border: '1px solid rgba(109,40,217,0.15)',
              borderRadius: 10, padding: '14px',
            }}>
              <div style={{
                fontSize: 9, color: 'rgba(167,139,250,0.55)',
                letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6,
              }}>
                Humor dominante
              </div>
              <div style={{ fontSize: 30, lineHeight: 1 }}>{humor}</div>
            </div>
          )}
        </div>
      )}

      <div style={{
        background: 'rgba(245,240,232,0.03)',
        borderRadius: 8, padding: '13px 15px',
        fontSize: 13, color: 'rgba(245,240,232,0.6)',
        lineHeight: 1.65, fontStyle: 'italic',
      }}>
        💡 {insight}
      </div>
    </div>
  );
}

// ─── Card de Entrada na Timeline ──────────────────────────────────────────────

function CardEntrada({ entrada }: { entrada: Entrada }) {
  const tipo = getTipo(entrada);
  const hora = formatarHora(entrada);

  if (tipo === 'livre') {
    return (
      <div style={{
        background: 'rgba(245,240,232,0.025)',
        border: '1px solid rgba(245,240,232,0.07)',
        borderRadius: 12,
        padding: '16px 18px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {entrada.emocao && (
            <span style={{ fontSize: 18, lineHeight: 1 }}>{entrada.emocao}</span>
          )}
          <span style={{
            fontSize: 11, color: 'rgba(245,240,232,0.25)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {hora}
          </span>
          <span style={{
            marginLeft: 'auto',
            fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'rgba(200,160,48,0.45)',
            background: 'rgba(200,160,48,0.06)',
            border: '1px solid rgba(200,160,48,0.12)',
            borderRadius: 99, padding: '2px 7px',
          }}>
            livre
          </span>
        </div>
        {entrada.texto_livre && (
          <p style={{
            color: 'rgba(245,240,232,0.78)',
            fontSize: 14, lineHeight: 1.75, margin: 0,
            fontFamily: "Georgia, 'Times New Roman', serif",
            whiteSpace: 'pre-wrap',
          }}>
            {entrada.texto_livre}
          </p>
        )}
      </div>
    );
  }

  if (tipo === 'diario') {
    return (
      <div style={{
        background: 'rgba(200,160,48,0.03)',
        border: '1px solid rgba(200,160,48,0.1)',
        borderRadius: 12,
        padding: '16px 18px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'rgba(245,240,232,0.25)' }}>{hora}</span>
          <span style={{
            marginLeft: 'auto',
            fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'rgba(200,160,48,0.65)',
            background: 'rgba(200,160,48,0.08)',
            border: '1px solid rgba(200,160,48,0.2)',
            borderRadius: 99, padding: '2px 8px',
          }}>
            reflexão
          </span>
        </div>
        {[
          { icon: '🌟', label: 'Significativo',  value: entrada.conquista },
          { icon: '💭', label: 'Pesando',        value: entrada.preocupacao },
          { icon: '🙏', label: 'Gratidão',       value: entrada.gratidao },
          { icon: '📈', label: 'Aprendizado',    value: entrada.aprendizado },
          { icon: '🎯', label: 'Faria diferente', value: entrada.missao_execucao },
        ].filter(item => item.value).map(({ icon, label, value }) => (
          <div key={label}>
            <div style={{
              fontSize: 10, color: 'rgba(245,240,232,0.3)',
              marginBottom: 3,
            }}>
              {icon} {label}
            </div>
            <p style={{
              color: 'rgba(245,240,232,0.72)',
              fontSize: 13, lineHeight: 1.65, margin: 0,
            }}>
              {value}
            </p>
          </div>
        ))}
      </div>
    );
  }

  if (tipo === 'profunda') {
    return (
      <div style={{
        background: 'rgba(109,40,217,0.04)',
        border: '1px solid rgba(109,40,217,0.15)',
        borderRadius: 12,
        padding: '16px 18px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'rgba(245,240,232,0.25)' }}>{hora}</span>
          <span style={{
            marginLeft: 'auto',
            fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'rgba(167,139,250,0.7)',
            background: 'rgba(109,40,217,0.1)',
            border: '1px solid rgba(109,40,217,0.25)',
            borderRadius: 99, padding: '2px 8px',
          }}>
            profunda
          </span>
        </div>
        {[
          { icon: '🔍', label: 'Padrão notado',  value: entrada.texto_livre },
          { icon: '💪', label: 'Maior desafio',  value: entrada.conquista },
          { icon: '🌱', label: 'Crescendo',      value: entrada.aprendizado },
          { icon: '⚡', label: 'Drenando',       value: entrada.preocupacao },
        ].filter(item => item.value).map(({ icon, label, value }) => (
          <div key={label}>
            <div style={{
              fontSize: 10, color: 'rgba(245,240,232,0.3)',
              marginBottom: 3,
            }}>
              {icon} {label}
            </div>
            <p style={{
              color: 'rgba(245,240,232,0.72)',
              fontSize: 13, lineHeight: 1.65, margin: 0,
            }}>
              {value}
            </p>
          </div>
        ))}
      </div>
    );
  }

  // Legado — entradas antigas do formato anterior
  const textoLegado = entrada.missao_execucao ?? entrada.aprendizado ?? entrada.gratidao;
  if (!textoLegado && !entrada.emocao) return null;
  return (
    <div style={{
      background: 'rgba(245,240,232,0.02)',
      border: '1px solid rgba(245,240,232,0.05)',
      borderRadius: 12,
      padding: '14px 16px',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {entrada.emocao && <span style={{ fontSize: 18 }}>{entrada.emocao}</span>}
        <span style={{ fontSize: 11, color: 'rgba(245,240,232,0.2)' }}>{hora}</span>
      </div>
      {textoLegado && (
        <p style={{
          color: 'rgba(245,240,232,0.5)', fontSize: 13,
          lineHeight: 1.65, margin: 0, fontStyle: 'italic',
        }}>
          {textoLegado}
        </p>
      )}
    </div>
  );
}

// ─── Botão Flutuante ──────────────────────────────────────────────────────────

function BotaoFlutuante({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="Nova entrada"
      style={{
        position: 'fixed',
        bottom: 32, right: 32,
        width: 56, height: 56,
        borderRadius: '50%',
        background: '#C8A030',
        border: 'none',
        cursor: 'pointer',
        fontSize: 30, lineHeight: 1,
        color: '#0E0E0E',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(200,160,48,0.45)',
        zIndex: 200,
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform  = 'scale(1.1)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(200,160,48,0.65)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform  = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(200,160,48,0.45)';
      }}
    >
      +
    </button>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

// ─── Helper: retry 1× após 2 s ────────────────────────────────────────────────

async function comRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch {
    await new Promise<void>(r => setTimeout(r, 2000));
    return fn();
  }
}

// ─── Mensagem legível para erros Supabase/Clerk ────────────────────────────────

function mensagemErro(err: unknown): string {
  if (err instanceof Error) {
    const msg = err.message;
    if (msg.includes('JWT') || msg.includes('token') || msg.includes('session') || msg.includes('auth'))
      return 'Sessão expirada — recarregue a página e tente novamente.';
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('ERR_CONNECTION'))
      return 'Sem conexão. Verifique sua internet e tente novamente.';
    if (msg.includes('permission') || msg.includes('policy') || msg.includes('42501'))
      return 'Erro de permissão — recarregue a página.';
    return msg.slice(0, 120);
  }
  return 'Erro inesperado. Tente novamente.';
}

export default function DiarioBordoPage() {
  const { user }       = useUser();
  const { getToken }   = useAuth();
  const { getClient }  = useSupabaseClient();

  const [entradas,    setEntradas]    = useState<Entrada[]>([]);
  const [carregando,  setCarregando]  = useState(true);
  const [modalAberto, setModalAberto] = useState(false);

  // ── Carregar entradas ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    let cancelado = false;
    (async () => {
      try {
        const client = await getClient();
        const { data } = await client
          .from('diario_kairos')
          .select('*')
          .eq('user_id', user.id)
          .or('tipo_entrada.neq.momento,tipo_entrada.is.null')
          .order('created_at', { ascending: false })
          .limit(200);
        if (!cancelado) {
          setEntradas((data ?? []) as Entrada[]);
        }
      } catch (err) {
        console.error('[diario-bordo] Erro ao carregar entradas:', err);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    })();
    return () => { cancelado = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ── Estado derivado ────────────────────────────────────────────────────────
  const hoje           = dataHoje();
  const ehDomingo      = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'long' }) === 'domingo';
  const temDiarioHoje  = entradas.some(e => e.data === hoje && e.tipo_entrada === 'diario');
  const temProfundaHoje = entradas.some(e => e.data === hoje && e.tipo_entrada === 'profunda');
  const mostrarPadroes = entradas.length >= 7;

  // Agrupa por data (já vêm ordenados por created_at desc)
  const grupos = Object.entries(
    (entradas ?? []).reduce<Record<string, Entrada[]>>((acc, e) => {
      (acc[e.data] ??= []).push(e);
      return acc;
    }, {})
  );

  // ── Verificar token JWT antes de qualquer escrita ─────────────────────────
  async function verificarToken(): Promise<void> {
    let t: string | null = null;
    try {
      t = await getToken({ template: 'supabase' });
    } catch {
      // Clerk com instabilidade — aguarda 2 s e tenta uma vez mais
      console.warn('[diario-bordo] getToken falhou — aguardando 2 s para retry');
      await new Promise<void>(r => setTimeout(r, 2000));
      try { t = await getToken({ template: 'supabase' }); } catch { /* ignora */ }
    }
    if (!t) throw new Error('Não foi possível conectar ao servidor de autenticação. Verifique sua conexão e tente novamente.');
  }

  // ── Salvar entrada livre ───────────────────────────────────────────────────
  async function salvarLivre(texto: string, emoji: string) {
    if (!user?.id) throw new Error('Usuário não autenticado.');
    await verificarToken();
    const client = await getClient();
    const result = await comRetry(async () =>
      client
        .from('diario_kairos')
        .upsert(
          { user_id: user.id, data: hoje, tipo_entrada: 'livre', texto_livre: texto, emocao: emoji || null, hora_registro: horaAgora() },
          { onConflict: 'user_id,data' }
        )
        .select()
        .single()
    );
    if (result.error) {
      console.error('[diario-bordo] salvarLivre:', result.error);
      throw new Error(result.error.message);
    }
    if (result.data) {
      const nova = result.data as Entrada;
      setEntradas(prev => [nova, ...prev.filter(e => e.id !== nova.id)]);
    }
  }

  // ── Salvar registro diário ─────────────────────────────────────────────────
  async function salvarDiario(dados: { conquista: string; preocupacao: string; gratidao: string; aprendizado: string; missao_execucao: string }) {
    if (!user?.id) throw new Error('Usuário não autenticado.');
    await verificarToken();
    const client = await getClient();
    const result = await comRetry(async () =>
      client
        .from('diario_kairos')
        .upsert(
          {
            user_id: user.id, data: hoje, tipo_entrada: 'diario',
            conquista:       dados.conquista       || null,
            preocupacao:     dados.preocupacao     || null,
            gratidao:        dados.gratidao        || null,
            aprendizado:     dados.aprendizado     || null,
            missao_execucao: dados.missao_execucao || null,
            hora_registro:   horaAgora(),
          },
          { onConflict: 'user_id,data' }
        )
        .select()
        .single()
    );
    if (result.error) {
      console.error('[diario-bordo] salvarDiario:', result.error);
      throw new Error(result.error.message);
    }
    if (result.data) {
      const nova = result.data as Entrada;
      setEntradas(prev => [nova, ...prev.filter(e => e.id !== nova.id)]);
    }
  }

  // ── Salvar reflexão profunda ───────────────────────────────────────────────
  async function salvarProfunda(dados: { texto_livre: string; conquista: string; aprendizado: string; preocupacao: string }) {
    if (!user?.id) throw new Error('Usuário não autenticado.');
    await verificarToken();
    const client = await getClient();
    const result = await comRetry(async () =>
      client
        .from('diario_kairos')
        .upsert(
          {
            user_id: user.id, data: hoje, tipo_entrada: 'profunda',
            texto_livre:   dados.texto_livre || null,
            conquista:     dados.conquista   || null,
            aprendizado:   dados.aprendizado || null,
            preocupacao:   dados.preocupacao || null,
            hora_registro: horaAgora(),
          },
          { onConflict: 'user_id,data' }
        )
        .select()
        .single()
    );
    if (result.error) {
      console.error('[diario-bordo] salvarProfunda:', result.error);
      throw new Error(result.error.message);
    }
    if (result.data) {
      const nova = result.data as Entrada;
      setEntradas(prev => [nova, ...prev.filter(e => e.id !== nova.id)]);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div style={{
        minHeight: '100vh',
        background: '#0E0E0E',
        padding: '32px 24px 120px',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
              color: '#C8A030', textTransform: 'uppercase', marginBottom: 8,
            }}>
              F15 · Diário de Bordo
            </div>
            <h1 style={{
              fontSize: 26, fontWeight: 300, color: '#F5F0E8', margin: 0,
              fontFamily: "Georgia, 'Times New Roman', serif",
              letterSpacing: '-0.01em',
            }}>
              Seu espaço secreto
            </h1>
            <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.28)', marginTop: 6 }}>
              {carregando
                ? 'Carregando…'
                : `${entradas.length} ${entradas.length === 1 ? 'entrada' : 'entradas'} · só você pode ver isso`}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* CAMADA 3 — Padrões (≥ 7 entradas) */}
            {mostrarPadroes && <CardPadroes entradas={entradas} />}

            {/* CAMADA 2 — Reflexão Profunda (domingos, uma vez por semana) */}
            {!carregando && ehDomingo && !temProfundaHoje && (
              <CardReflexaoProfunda onSalvar={salvarProfunda} />
            )}

            {/* CAMADA 2 — Registro diário (uma vez por dia) */}
            {!carregando && !temDiarioHoje && (
              <CardDiario onSalvar={salvarDiario} />
            )}

            {/* Timeline */}
            {carregando ? (
              <div style={{
                textAlign: 'center', padding: '64px 0',
                color: 'rgba(245,240,232,0.2)', fontSize: 14,
              }}>
                Carregando entradas…
              </div>
            ) : entradas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>📖</div>
                <div style={{ fontSize: 15, color: 'rgba(245,240,232,0.4)', marginBottom: 8 }}>
                  Seu diário está em branco.
                </div>
                <div style={{ fontSize: 13, color: 'rgba(245,240,232,0.22)' }}>
                  Toque em{' '}
                  <span style={{ color: '#C8A030', fontWeight: 700, fontSize: 18 }}>+</span>
                  {' '}para começar.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {grupos.map(([data, grupo]) => (
                  <div key={data} style={{ marginBottom: 20 }}>
                    {/* Separador de data */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      marginBottom: 10,
                    }}>
                      <div style={{ flex: 1, height: 1, background: 'rgba(245,240,232,0.06)' }} />
                      <span style={{
                        fontSize: 11, color: 'rgba(245,240,232,0.28)',
                        fontWeight: 600, letterSpacing: '0.06em',
                      }}>
                        {formatarData(data)}
                      </span>
                      <div style={{ flex: 1, height: 1, background: 'rgba(245,240,232,0.06)' }} />
                    </div>

                    {/* Entradas do dia */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {(grupo ?? []).map(e => <CardEntrada key={e.id} entrada={e} />)}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* CAMADA 1 — Modal de entrada livre */}
      {modalAberto && (
        <ModalEntradaLivre
          onFechar={() => setModalAberto(false)}
          onSalvar={salvarLivre}
        />
      )}

      {/* Botão flutuante '+' */}
      <BotaoFlutuante onClick={() => setModalAberto(true)} />
    </DashboardLayout>
  );
}
