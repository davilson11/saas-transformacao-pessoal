'use client';

import { useState, useEffect, useRef } from 'react';
import FerramentaLayout from '@/components/dashboard/FerramentaLayout';
import { useCarregarRespostas } from '@/lib/useCarregarRespostas';
import AnaliseIA from '@/components/dashboard/AnaliseIA';
import { useUser } from '@clerk/nextjs';
import { useSupabaseClient } from '@/lib/useSupabaseClient';
import { buscarRodaVida } from '@/lib/queries';
import type { RodaVida } from '@/lib/database.types';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type EntradaDiaria = {
  data:           string;
  emoji:          string;
  nota:           number;
  promptResposta: string;
  significativo:  string;
};

// ─── Constantes ───────────────────────────────────────────────────────────────

const COR_VERDE  = '#1a5c3a';
const COR_GOLD   = '#b5840a';
const COR_BORDER = 'rgba(26,92,58,0.12)';

const ETAPAS = [
  { label: 'Bem-vindo', descricao: 'Como funciona'    },
  { label: 'Registro',  descricao: '3 minutos por dia' },
];

const EMOJIS_HUMOR = [
  { emoji: '😣', label: 'Muito mal'    },
  { emoji: '😔', label: 'Mal'          },
  { emoji: '😐', label: 'Ok'           },
  { emoji: '🙂', label: 'Bem'          },
  { emoji: '😊', label: 'Muito bem'    },
  { emoji: '😄', label: 'Ótimo'        },
  { emoji: '🤩', label: 'Incrível'     },
];

const ENTRADA_DEFAULT: EntradaDiaria = {
  data:           '',
  emoji:          '',
  nota:           0,
  promptResposta: '',
  significativo:  '',
};

// ─── Área da Roda da Vida ─────────────────────────────────────────────────────

type RodaAreaKey = keyof Omit<RodaVida, 'id' | 'user_id' | 'created_at'>;

const RODA_PERGUNTAS: Record<RodaAreaKey, string> = {
  saude:           'Sua saúde está com atenção. O que você fez — ou poderia ter feito — por ela hoje?',
  carreira:        'Sua carreira pede foco. Que passo concreto você deu na direção certa hoje?',
  financas:        'Suas finanças merecem atenção. Que decisão financeira você tomou ou evitou hoje?',
  relacionamentos: 'Seus relacionamentos pedem cuidado. Quem você nutriu hoje — e como?',
  crescimento:     'Seu crescimento pessoal clama por ação. O que você aprendeu ou praticou hoje?',
  lazer:           'Lazer e descanso estão em falta. O que renovou sua energia hoje?',
  familia:         'Família merece presença. Como você esteve presente com quem ama hoje?',
  espiritualidade: 'Sua espiritualidade pede cuidado. O que te conectou a algo maior hoje?',
};

const PERGUNTA_PADRAO =
  'O que você fez hoje que te deixa orgulhoso, mesmo que pequeno?';

function gerarPergunta(rodaVida: RodaVida | null): string {
  if (!rodaVida) return PERGUNTA_PADRAO;
  const keys: RodaAreaKey[] = [
    'saude', 'carreira', 'financas', 'relacionamentos',
    'crescimento', 'lazer', 'familia', 'espiritualidade',
  ];
  const menor = keys.reduce((m, k) =>
    (rodaVida[k] as number) < (rodaVida[m] as number) ? k : m
  );
  return RODA_PERGUNTAS[menor];
}

// ─── Confetti dourado ─────────────────────────────────────────────────────────

type Particle = {
  id:    number;
  x:     number; // vw offset from center
  y:     number; // vh offset from center
  size:  number;
  color: string;
  delay: number;
  shape: 'circle' | 'square';
};

function gerarParticles(n = 28): Particle[] {
  const colors = ['#C8A030', '#e8c76a', '#f0d890', '#1a5c3a', '#4dbb7a', '#fff'];
  return Array.from({ length: n }, (_, i) => ({
    id:    i,
    x:     (Math.random() - 0.5) * 60,
    y:     (Math.random() - 0.5) * 60,
    size:  4 + Math.random() * 8,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 0.4,
    shape: Math.random() > 0.5 ? 'circle' : 'square',
  }));
}

function Confetti({ visivel }: { visivel: boolean }) {
  const [particles] = useState<Particle[]>(() => gerarParticles());
  if (!visivel) return null;
  return (
    <>
      <style>{`
        @keyframes confetti-fly {
          0%   { opacity: 1; transform: translate(0, 0) scale(1) rotate(0deg); }
          80%  { opacity: 0.6; }
          100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0.3) rotate(360deg); }
        }
        .conf-particle {
          position: fixed;
          top: 50%;
          left: 50%;
          pointer-events: none;
          z-index: 500;
          animation: confetti-fly 1.1s ease-out forwards;
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          className="conf-particle"
          style={{
            width:  p.size,
            height: p.size,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            background: p.color,
            marginLeft: -p.size / 2,
            marginTop:  -p.size / 2,
            animationDelay: `${p.delay}s`,
            // CSS custom properties for the fly direction
            ['--tx' as string]: `${p.x}vw`,
            ['--ty' as string]: `${p.y}vh`,
          }}
        />
      ))}
    </>
  );
}

// ─── GoldPulse — anel dourado de celebração ───────────────────────────────────

function GoldPulse({ visivel }: { visivel: boolean }) {
  if (!visivel) return null;
  return (
    <>
      <style>{`
        @keyframes goldRing {
          0%   { transform: translate(-50%,-50%) scale(0.5); opacity: 0.9; }
          100% { transform: translate(-50%,-50%) scale(3);   opacity: 0; }
        }
        .gold-pulse {
          position: fixed;
          top: 50%; left: 50%;
          width: 120px; height: 120px;
          border-radius: 50%;
          border: 3px solid #C8A030;
          pointer-events: none;
          z-index: 499;
          animation: goldRing 0.9s ease-out forwards;
        }
        .gold-pulse-2 {
          animation-delay: 0.18s;
        }
        .gold-pulse-3 {
          animation-delay: 0.36s;
        }
      `}</style>
      <div className="gold-pulse" />
      <div className="gold-pulse gold-pulse-2" />
      <div className="gold-pulse gold-pulse-3" />
    </>
  );
}

// ─── EmojiPicker ──────────────────────────────────────────────────────────────

function EmojiPicker({ valor, onChange }: { valor: string; onChange: (e: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <label style={{
        fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: COR_VERDE,
      }}>
        Como você está se sentindo agora?
      </label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {EMOJIS_HUMOR.map(({ emoji, label }) => (
          <button
            key={emoji}
            title={label}
            onClick={() => onChange(valor === emoji ? '' : emoji)}
            style={{
              width: 48, height: 48,
              borderRadius: 12,
              border: `2px solid ${valor === emoji ? COR_GOLD + 'aa' : COR_BORDER}`,
              background: valor === emoji ? `${COR_GOLD}15` : '#fff',
              fontSize: 24,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
              transform: valor === emoji ? 'scale(1.18)' : 'scale(1)',
              boxShadow: valor === emoji ? `0 0 0 3px ${COR_GOLD}30` : 'none',
            }}
          >
            {emoji}
          </button>
        ))}
      </div>
      {valor && (
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 13,
          color: COR_GOLD, fontStyle: 'italic', margin: 0,
        }}>
          {EMOJIS_HUMOR.find((e) => e.emoji === valor)?.label ?? ''}
        </p>
      )}
    </div>
  );
}

// ─── NotaPicker ──────────────────────────────────────────────────────────────

function NotaPicker({ valor, onChange }: { valor: number; onChange: (n: number) => void }) {
  function cor(n: number): string {
    if (n >= 8) return '#16a34a';
    if (n >= 6) return COR_GOLD;
    if (n >= 4) return '#d97706';
    return '#ef4444';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label style={{
          fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: COR_VERDE,
        }}>
          Nota do dia
        </label>
        {valor > 0 && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700,
            color: cor(valor), transition: 'color 0.2s',
          }}>
            {valor}/10
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => onChange(valor === n ? 0 : n)}
            title={`${n}/10`}
            style={{
              flex: 1,
              height: 40,
              borderRadius: 8,
              border: 'none',
              background: valor >= n ? cor(valor) : 'rgba(26,92,58,0.08)',
              color: valor >= n ? '#fff' : 'rgba(26,92,58,0.35)',
              fontFamily: 'var(--font-mono)',
              fontSize: 13, fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.12s, transform 0.1s',
              transform: valor === n ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Painel direito ───────────────────────────────────────────────────────────

function PainelResumo({ entrada }: { entrada: EntradaDiaria }) {
  const temDados = entrada.emoji || entrada.nota > 0 || entrada.significativo;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Snapshot do dia */}
      {temDados ? (
        <div style={{
          background: `${COR_VERDE}07`,
          border: `1px solid ${COR_VERDE}18`,
          borderRadius: 12, padding: '14px 16px',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            color: 'rgba(26,92,58,0.45)', textTransform: 'uppercase',
            letterSpacing: '0.08em', margin: 0,
          }}>
            Hoje
          </p>

          {entrada.emoji && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 28 }}>{entrada.emoji}</span>
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: 13,
                color: COR_GOLD, fontStyle: 'italic',
              }}>
                {EMOJIS_HUMOR.find((e) => e.emoji === entrada.emoji)?.label}
              </span>
            </div>
          )}

          {entrada.nota > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(26,92,58,0.6)' }}>
                Nota:
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700,
                color: entrada.nota >= 8 ? '#16a34a' : entrada.nota >= 6 ? COR_GOLD : '#ef4444',
              }}>
                {entrada.nota}/10
              </span>
            </div>
          )}

          {entrada.significativo && (
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 13, fontStyle: 'italic',
              color: 'rgba(26,92,58,0.65)', lineHeight: 1.5,
              borderLeft: `2px solid ${COR_GOLD}55`,
              paddingLeft: 10, margin: 0,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}>
              {entrada.significativo}
            </p>
          )}
        </div>
      ) : (
        <div style={{
          textAlign: 'center', padding: '20px 0',
          color: 'rgba(26,92,58,0.3)',
          fontFamily: 'var(--font-body)', fontSize: 13,
        }}>
          Preencha o registro para ver o resumo.
        </div>
      )}

      {/* Análise IA */}
      <div style={{ borderTop: `1px solid ${COR_BORDER}`, paddingTop: 16 }}>
        <AnaliseIA />
      </div>
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function DiarioBordoPage() {
  const [etapa, setEtapa] = useState(0);
  const [entrada, setEntrada] = useState<EntradaDiaria>(() => ({
    ...ENTRADA_DEFAULT,
    data: new Date().toISOString().slice(0, 10),
  }));
  const [celebrando, setCelebrando] = useState(false);
  const celebrandoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Carregar respostas salvas ──────────────────────────────────────────────
  const { dados: dadosSalvos } = useCarregarRespostas('diario-bordo');
  useEffect(() => {
    if (!dadosSalvos) return;
    const d = dadosSalvos as Record<string, unknown>;
    if (d.entrada && typeof d.entrada === 'object') {
      setEntrada((prev) => ({ ...prev, ...(d.entrada as Partial<EntradaDiaria>) }));
    }
  }, [dadosSalvos]);

  // ── Pergunta adaptativa ───────────────────────────────────────────────────
  const { user } = useUser();
  const { getClient } = useSupabaseClient();
  const [pergunta, setPergunta] = useState(PERGUNTA_PADRAO);
  const [perguntaLoading, setPerguntaLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setPerguntaLoading(false); return; }
    (async () => {
      const client = await getClient();
      const rodaVida = await buscarRodaVida(user.id, client);
      setPergunta(gerarPergunta(rodaVida));
      setPerguntaLoading(false);
    })();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers ────────────────────────────────────────────────────────────────
  const setEnt = (p: Partial<EntradaDiaria>) => setEntrada((prev) => ({ ...prev, ...p }));

  // ── Progresso ─────────────────────────────────────────────────────────────
  const camposFilled = [
    entrada.emoji ? 1 : 0,
    entrada.nota > 0 ? 1 : 0,
    entrada.significativo.trim().length > 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const progresso =
    etapa === 0 ? 0
    : Math.min(99, Math.round((camposFilled / 3) * 100));

  const podeAvancar =
    etapa === 0
      ? true
      : entrada.emoji.length > 0 && entrada.nota > 0 && entrada.significativo.trim().length > 0;

  // ── Celebração ────────────────────────────────────────────────────────────
  function dispararCelebracao() {
    if (celebrandoRef.current) clearTimeout(celebrandoRef.current);
    setCelebrando(true);
    celebrandoRef.current = setTimeout(() => setCelebrando(false), 1400);
  }

  // ── Avançar ────────────────────────────────────────────────────────────────
  function handleAvancar() {
    if (etapa === 1) {
      // Última etapa: salva e celebra
      dispararCelebracao();
    }
    setEtapa((e) => Math.min(e + 1, ETAPAS.length - 1));
  }

  // ── Respostas para auto-save ───────────────────────────────────────────────
  const respostas = { entrada };

  // ── Painel direito ─────────────────────────────────────────────────────────
  const painelResumo = <PainelResumo entrada={entrada} />;

  // ── Etapa 0: Boas-vindas ──────────────────────────────────────────────────
  const step0 = (
    <div style={{ maxWidth: 580, display: 'flex', flexDirection: 'column', gap: 32 }}>

      <div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: `${COR_GOLD}15`, border: `1px solid ${COR_GOLD}30`,
          borderRadius: 99, padding: '4px 14px', marginBottom: 18,
        }}>
          <span style={{ fontSize: 14 }}>📔</span>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: COR_GOLD,
          }}>
            F15 · Diário de Bordo
          </span>
        </div>

        <h1 style={{ color: COR_VERDE, marginBottom: 12 }}>
          3 minutos que mudam tudo
        </h1>
        <p style={{ color: '#4a5568', maxWidth: 500, lineHeight: 1.65 }}>
          O diário é o hábito central do Kairos. Três perguntas, três minutos,
          todo dia. Simples o suficiente para não parar. Poderoso o suficiente
          para transformar.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          {
            n: '01', emoji: '😊',
            titulo: 'Como você está',
            desc:   'Escolha um emoji e dê uma nota ao seu dia — 10 segundos.',
          },
          {
            n: '02', emoji: '💡',
            titulo: 'Pergunta do dia',
            desc:   'Uma pergunta personalizada com base na sua área mais fraca na Roda da Vida.',
          },
          {
            n: '03', emoji: '⭐',
            titulo: 'O mais significativo',
            desc:   'Uma frase sobre o que mais importou hoje — o que vai ficar.',
          },
        ].map((item) => (
          <div
            key={item.n}
            style={{
              display: 'flex', gap: 16, alignItems: 'flex-start',
              background: '#fff', border: `1px solid ${COR_BORDER}`,
              borderRadius: 12, padding: '16px 20px',
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: `${COR_VERDE}12`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
              color: COR_VERDE,
            }}>
              {item.n}
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700,
                color: COR_VERDE, marginBottom: 4,
              }}>
                {item.emoji} {item.titulo}
              </div>
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: 13,
                color: 'rgba(26,92,58,0.6)', lineHeight: 1.5,
              }}>
                {item.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );

  // ── Etapa 1: O Registro ────────────────────────────────────────────────────
  const step1 = (
    <div style={{ maxWidth: 580, display: 'flex', flexDirection: 'column', gap: 36 }}>

      {/* Campo 1: Humor + Nota */}
      <div style={{
        background: '#fff', border: `1px solid ${COR_BORDER}`,
        borderRadius: 14, padding: '24px 28px',
        display: 'flex', flexDirection: 'column', gap: 24,
      }}>
        <EmojiPicker valor={entrada.emoji} onChange={(e) => setEnt({ emoji: e })} />
        <div style={{ borderTop: `1px solid ${COR_BORDER}`, paddingTop: 20 }}>
          <NotaPicker valor={entrada.nota} onChange={(n) => setEnt({ nota: n })} />
        </div>
      </div>

      {/* Campo 2: Pergunta adaptativa */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Balão da pergunta */}
        <div style={{
          background: 'rgba(181,132,10,0.07)',
          border: `1px solid ${COR_GOLD}35`,
          borderRadius: 12, padding: '16px 20px',
          display: 'flex', alignItems: 'flex-start', gap: 12,
        }}>
          <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>💡</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
              color: COR_GOLD, textTransform: 'uppercase', letterSpacing: '0.08em',
              marginBottom: 6,
            }}>
              Pergunta do dia · personalizada
            </p>
            {perguntaLoading ? (
              <div style={{
                height: 14, width: '85%', borderRadius: 4,
                background: `${COR_GOLD}25`,
                animation: 'promptPulse 1.5s ease-in-out infinite',
              }} />
            ) : (
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 15,
                color: '#5c4a00', lineHeight: 1.55, fontWeight: 500, margin: 0,
              }}>
                {pergunta}
              </p>
            )}
          </div>
        </div>

        <textarea
          value={entrada.promptResposta}
          onChange={(e) => setEnt({ promptResposta: e.target.value })}
          placeholder="Escreva sua reflexão aqui…"
          rows={4}
          disabled={perguntaLoading}
          style={{
            border: `1px solid ${entrada.promptResposta ? COR_GOLD + '55' : COR_BORDER}`,
            borderRadius: 10, padding: '12px 16px', fontSize: 15,
            fontFamily: 'var(--font-body)', color: '#1a2015',
            outline: 'none',
            background: entrada.promptResposta ? 'rgba(181,132,10,0.02)' : '#fff',
            resize: 'vertical', lineHeight: 1.6,
            transition: 'border-color 0.15s',
            opacity: perguntaLoading ? 0.5 : 1,
          }}
        />
      </div>

      {/* Campo 3: O mais significativo */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <label style={{
          fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: COR_VERDE,
        }}>
          ⭐ O que foi mais significativo hoje?
          <span style={{
            display: 'block',
            fontSize: 13, fontWeight: 400, color: 'rgba(26,92,58,0.5)',
            marginTop: 2,
          }}>
            Uma frase, uma emoção, uma conquista — o que vai ficar.
          </span>
        </label>
        <textarea
          value={entrada.significativo}
          onChange={(e) => setEnt({ significativo: e.target.value })}
          placeholder="Ex: Finalizei o projeto que estava travado há semanas. Senti que voltei…"
          rows={4}
          style={{
            border: `1px solid ${entrada.significativo ? COR_VERDE + '55' : COR_BORDER}`,
            borderRadius: 10, padding: '12px 16px', fontSize: 15,
            fontFamily: 'var(--font-body)', color: '#1a2015',
            outline: 'none',
            background: entrada.significativo ? `${COR_VERDE}03` : '#fff',
            resize: 'vertical', lineHeight: 1.6,
            transition: 'border-color 0.15s',
          }}
        />
      </div>

      <style>{`
        @keyframes promptPulse {
          0%, 100% { opacity: 0.4 }
          50%       { opacity: 0.9 }
        }
      `}</style>
    </div>
  );

  return (
    <>
      {/* Animação celebratória */}
      <GoldPulse  visivel={celebrando} />
      <Confetti   visivel={celebrando} />

      <FerramentaLayout
        codigo="F15"
        nome="Diário de Bordo"
        descricao="Registro diário de 3 minutos — humor, reflexão e o que mais importou hoje."
        etapas={ETAPAS}
        etapaAtual={etapa}
        progresso={progresso}
        onAvancar={handleAvancar}
        onVoltar={etapa > 0 ? () => setEtapa((e) => e - 1) : undefined}
        podeAvancar={podeAvancar}
        labelAvancar={
          etapa === 0
            ? 'Começar →'
            : 'Salvar Diário ✓'
        }
        totalItens={etapa === 1 ? camposFilled : undefined}
        labelItens="de 3 campos"
        respostas={respostas}
        resumo={painelResumo}
      >
        {etapa === 0 && step0}
        {etapa === 1 && step1}
      </FerramentaLayout>
    </>
  );
}
