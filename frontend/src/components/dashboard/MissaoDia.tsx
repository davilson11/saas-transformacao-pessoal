'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useSupabaseClient } from '@/lib/useSupabaseClient';
import { buscarRodaVida, buscarTodasRespostas } from '@/lib/queries';
import type { RodaVida, FerramentasRespostas } from '@/lib/database.types';

// ─── Catálogo de ferramentas ──────────────────────────────────────────────────

type AreaKey = keyof Omit<RodaVida, 'id' | 'user_id' | 'created_at'>;

type FerramentaCatalogo = {
  codigo: string;
  nome: string;
  slug: string;
  emoji: string;
  areas: AreaKey[];
};

const CATALOGO: FerramentaCatalogo[] = [
  { codigo: 'F01', nome: 'Raio-X 360°',             slug: 'raio-x',                emoji: '🎯', areas: ['saude', 'carreira', 'financas', 'relacionamentos', 'crescimento', 'lazer', 'familia', 'espiritualidade'] },
  { codigo: 'F02', nome: 'Bússola de Valores',       slug: 'bussola-valores',       emoji: '🧭', areas: ['espiritualidade', 'crescimento'] },
  { codigo: 'F03', nome: 'SWOT Pessoal',             slug: 'swot-pessoal',          emoji: '⭐', areas: ['carreira', 'crescimento'] },
  { codigo: 'F04', nome: 'Feedback 360°',            slug: 'feedback-360',          emoji: '🔮', areas: ['relacionamentos', 'carreira'] },
  { codigo: 'F05', nome: 'OKRs Pessoais',            slug: 'okrs-pessoais',         emoji: '📊', areas: ['carreira', 'financas'] },
  { codigo: 'F06', nome: 'Design de Vida',           slug: 'design-vida',           emoji: '📅', areas: ['crescimento', 'lazer'] },
  { codigo: 'F07', nome: 'DRE Pessoal',              slug: 'dre-pessoal',           emoji: '💰', areas: ['financas'] },
  { codigo: 'F08', nome: 'Rotina Ideal',             slug: 'rotina-ideal',          emoji: '🌅', areas: ['saude', 'lazer'] },
  { codigo: 'F09', nome: 'Auditoria de Tempo',       slug: 'auditoria-tempo',       emoji: '⏱', areas: ['lazer', 'carreira'] },
  { codigo: 'F10', nome: 'Arquiteto de Rotinas',     slug: 'arquiteto-rotinas',     emoji: '🏗', areas: ['saude', 'crescimento'] },
  { codigo: 'F11', nome: 'Sprint de Aprendizado',    slug: 'sprint-aprendizado',    emoji: '🎓', areas: ['crescimento', 'carreira'] },
  { codigo: 'F12', nome: 'Energia e Vitalidade',     slug: 'energia-vitalidade',    emoji: '⚡', areas: ['saude', 'espiritualidade'] },
  { codigo: 'F13', nome: 'Desconstrutor de Crenças', slug: 'desconstrutor-crencas', emoji: '🧠', areas: ['crescimento', 'espiritualidade'] },
  { codigo: 'F14', nome: 'CRM de Relacionamentos',   slug: 'crm-relacionamentos',   emoji: '🤝', areas: ['relacionamentos', 'familia'] },
  { codigo: 'F15', nome: 'Diário de Bordo',          slug: 'diario-bordo',          emoji: '📔', areas: ['saude', 'crescimento'] },
  { codigo: 'F16', nome: 'Prevenção de Recaída',     slug: 'prevencao-recaida',     emoji: '🛡', areas: ['crescimento', 'espiritualidade'] },
];

const AREA_LABELS: Record<AreaKey, string> = {
  saude:           'Saúde',
  carreira:        'Carreira',
  financas:        'Finanças',
  relacionamentos: 'Relacionamentos',
  crescimento:     'Crescimento',
  lazer:           'Lazer',
  familia:         'Família',
  espiritualidade: 'Espiritualidade',
};

const AREA_EMOJIS: Record<AreaKey, string> = {
  saude:           '💪',
  carreira:        '💼',
  financas:        '💰',
  relacionamentos: '🤝',
  crescimento:     '📈',
  lazer:           '🎨',
  familia:         '🏡',
  espiritualidade: '🧘',
};

// ─── Lógica de geração de missão ─────────────────────────────────────────────

type Missao = {
  titulo: string;
  texto: string;
  ferramenta: FerramentaCatalogo;
  areaLabel: string;
  areaEmoji: string;
  tipo: 'padrao' | 'area-baixa' | 'area-media' | 'streak';
};

function gerarMissao(
  rodaVida: RodaVida | null,
  respostas: FerramentasRespostas[],
  streak: number,
): Missao {
  const concluidasSlugs = new Set(
    respostas.filter((r) => r.concluida).map((r) => r.ferramenta_slug),
  );

  // Ferramenta padrão: F01 se não concluída, senão F02
  const ferramentaPadrao =
    CATALOGO.find((f) => !concluidasSlugs.has(f.slug)) ?? CATALOGO[0];

  // Sem dados da Roda da Vida → missão de boas-vindas
  if (!rodaVida) {
    return {
      titulo: 'Comece sua jornada',
      texto: 'Complete o Raio-X 360° para descobrir exatamente onde você está e para onde pode ir.',
      ferramenta: CATALOGO[0], // F01
      areaLabel: 'Autoconhecimento',
      areaEmoji: '🎯',
      tipo: 'padrao',
    };
  }

  // Encontrar área com menor score
  const areaKeys: AreaKey[] = [
    'saude', 'carreira', 'financas', 'relacionamentos',
    'crescimento', 'lazer', 'familia', 'espiritualidade',
  ];

  const menorArea = areaKeys.reduce<{ key: AreaKey; score: number }>(
    (min, key) => {
      const score = rodaVida[key] as number;
      return score < min.score ? { key, score } : min;
    },
    { key: 'saude', score: rodaVida.saude },
  );

  // Ferramenta não concluída para a área mais fraca
  const ferramentaArea =
    CATALOGO.find(
      (f) => f.areas.includes(menorArea.key) && !concluidasSlugs.has(f.slug),
    ) ?? ferramentaPadrao;

  const label = AREA_LABELS[menorArea.key];
  const emoji = AREA_EMOJIS[menorArea.key];
  const score = menorArea.score;

  // Streak longo tem prioridade na mensagem
  if (streak >= 7) {
    return {
      titulo: `🔥 ${streak} dias de sequência!`,
      texto: `Você está imparável! Mantenha o ritmo e fortaleça sua ${label} com a ${ferramentaArea.codigo}.`,
      ferramenta: ferramentaArea,
      areaLabel: label,
      areaEmoji: emoji,
      tipo: 'streak',
    };
  }

  if (streak >= 3) {
    return {
      titulo: `${streak} dias seguidos — continue!`,
      texto: `Sua ${label} pede atenção (nota ${score}/10). Aproveite o embalo e avance com a ${ferramentaArea.codigo}.`,
      ferramenta: ferramentaArea,
      areaLabel: label,
      areaEmoji: emoji,
      tipo: 'streak',
    };
  }

  if (score <= 4) {
    return {
      titulo: `Sua ${label} precisa de você`,
      texto: `Nota ${score}/10 — isso merece foco hoje. Dedique um tempo à ${ferramentaArea.codigo} e dê o primeiro passo.`,
      ferramenta: ferramentaArea,
      areaLabel: label,
      areaEmoji: emoji,
      tipo: 'area-baixa',
    };
  }

  if (score <= 6) {
    return {
      titulo: `Há espaço para crescer em ${label}`,
      texto: `Com nota ${score}/10, um pequeno esforço hoje pode mudar muito. A ${ferramentaArea.codigo} vai te ajudar.`,
      ferramenta: ferramentaArea,
      areaLabel: label,
      areaEmoji: emoji,
      tipo: 'area-media',
    };
  }

  // Score alto em todas as áreas → missão de manutenção
  return {
    titulo: 'Sua vida está equilibrada!',
    texto: `Continue avançando — hoje explore a ${ferramentaArea.codigo} para ir ainda mais longe.`,
    ferramenta: ferramentaArea,
    areaLabel: label,
    areaEmoji: emoji,
    tipo: 'padrao',
  };
}

// ─── Calcula streak a partir de registros do diário ──────────────────────────

function calcularStreak(datas: string[]): number {
  if (datas.length === 0) return 0;
  let s = 0;
  const hoje = new Date();
  for (let i = 0; i < datas.length; i++) {
    const esperado = new Date(hoje);
    esperado.setDate(hoje.getDate() - i);
    const esperadoStr = esperado.toISOString().split('T')[0];
    if (datas[i] === esperadoStr) s++;
    else break;
  }
  return s;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function MissaoDia() {
  const { user, isLoaded } = useUser();
  const { getClient } = useSupabaseClient();

  const [missao, setMissao] = useState<Missao | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user?.id) {
      // Usuário não logado: missão padrão imediata
      setMissao(gerarMissao(null, [], 0));
      setLoading(false);
      return;
    }

    (async () => {
      const client = await getClient();

      const [rodaVida, respostas, diario] = await Promise.all([
        buscarRodaVida(user.id, client),
        buscarTodasRespostas(user.id, client),
        client
          .from('diario_kairos')
          .select('data')
          .eq('user_id', user.id)
          .order('data', { ascending: false })
          .limit(60),
      ]);

      const datas = (diario.data ?? []).map((d) => d.data as string);
      const streak = calcularStreak(datas);

      setMissao(gerarMissao(rodaVida, respostas, streak));
      setLoading(false);
    })();
  }, [isLoaded, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Skeleton ──
  if (loading) {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #fdf6e3 0%, #fef9ed 100%)',
          border: '1.5px solid rgba(200,160,48,0.35)',
          borderRadius: 16,
          padding: '20px 24px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[180, 320, 140].map((w) => (
            <div
              key={w}
              style={{
                height: 14,
                width: w,
                maxWidth: '100%',
                borderRadius: 6,
                background: 'rgba(200,160,48,0.18)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}`}</style>
      </div>
    );
  }

  if (!missao) return null;

  const { titulo, texto, ferramenta, areaLabel, areaEmoji } = missao;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #fdf6e3 0%, #fef9ed 100%)',
        border: '1.5px solid rgba(200,160,48,0.4)',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 2px 16px rgba(200,160,48,0.10)',
      }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 px-6 py-5">

        {/* Ícone relâmpago */}
        <div
          className="flex items-center justify-center rounded-2xl flex-shrink-0"
          style={{
            width: 52,
            height: 52,
            background: '#C8A030',
            boxShadow: '0 4px 12px rgba(200,160,48,0.35)',
          }}
        >
          <svg
            width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="#fff" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>

        {/* Texto */}
        <div className="flex-1 min-w-0">
          {/* Eyebrow */}
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              color: '#9a7820',
              marginBottom: 4,
            }}
          >
            ⚡ Missão do Dia · {areaEmoji} {areaLabel}
          </p>

          {/* Título */}
          <h3
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 17,
              fontWeight: 700,
              color: '#5a3e00',
              lineHeight: 1.25,
              margin: 0,
            }}
          >
            {titulo}
          </h3>

          {/* Texto motivacional */}
          <p
            style={{
              fontSize: 13,
              color: '#7a5c10',
              lineHeight: 1.6,
              marginTop: 4,
            }}
          >
            {texto}
          </p>
        </div>

        {/* CTA */}
        <Link
          href={`/ferramentas/${ferramenta.slug}`}
          className="flex-shrink-0"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 20px',
            background: '#C8A030',
            color: '#fff',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 14,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(200,160,48,0.30)',
            transition: 'opacity 0.15s',
          }}
        >
          <span>{ferramenta.emoji}</span>
          <span>{ferramenta.codigo} — {ferramenta.nome}</span>
          <span style={{ opacity: 0.75 }}>→</span>
        </Link>
      </div>
    </div>
  );
}
