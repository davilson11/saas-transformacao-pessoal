// ─── Definição de Badges ──────────────────────────────────────────────────────

export type Badge = {
  id:        string;
  emoji:     string;
  nome:      string;
  descricao: string;
  dica:      string; // como conquistar
};

export type BadgeStatus = Badge & {
  conquistado: boolean;
};

// ─── Slugs da Fase 1 (Autoconhecimento) ───────────────────────────────────────

export const FASE1_SLUGS = [
  'raio-x',
  'bussola-valores',
  'swot-pessoal',
  'feedback-360',
] as const;

// ─── Catálogo de badges ───────────────────────────────────────────────────────

export const BADGES: Badge[] = [
  {
    id:        'primeiro-passo',
    emoji:     '🎯',
    nome:      'Primeiro Passo',
    descricao: 'Completou o Raio-X 360°',
    dica:      'Conclua a ferramenta F01 — Raio-X 360°',
  },
  {
    id:        'bussola-calibrada',
    emoji:     '🧭',
    nome:      'Bússola Calibrada',
    descricao: 'Completou a Bússola de Valores',
    dica:      'Conclua a ferramenta F02 — Bússola de Valores',
  },
  {
    id:        'autoconhecimento',
    emoji:     '🌟',
    nome:      'Autoconhecimento',
    descricao: 'Completou as 4 ferramentas da Fase 1',
    dica:      'Conclua Raio-X, Bússola, SWOT e Feedback 360°',
  },
  {
    id:        'semana-consistente',
    emoji:     '🔥',
    nome:      'Semana Consistente',
    descricao: '7 dias consecutivos no diário',
    dica:      'Registre no Diário de Bordo por 7 dias seguidos',
  },
  {
    id:        'mes-kairos',
    emoji:     '🌕',
    nome:      'Mês Kairos',
    descricao: '30 dias consecutivos no diário',
    dica:      'Registre no Diário de Bordo por 30 dias seguidos',
  },
  {
    id:        'meio-caminho',
    emoji:     '⚡',
    nome:      'Meio Caminho',
    descricao: '8 ferramentas concluídas',
    dica:      'Conclua pelo menos 8 das 16 ferramentas',
  },
  {
    id:        'mestre-kairos',
    emoji:     '🏆',
    nome:      'Mestre Kairos',
    descricao: 'Todas as 16 ferramentas concluídas',
    dica:      'Conclua todas as 16 ferramentas da plataforma',
  },
  {
    id:        'visionario',
    emoji:     '🦅',
    nome:      'Visionário',
    descricao: 'Visão Âncora criada',
    dica:      'Preencha sua Visão Âncora completa',
  },
  {
    id:        'roda-completa',
    emoji:     '☯',
    nome:      'Roda Completa',
    descricao: 'Roda da Vida avaliada',
    dica:      'Avalie todas as 8 áreas na Roda da Vida',
  },
  {
    id:        'diario-fiel',
    emoji:     '📔',
    nome:      'Diário Fiel',
    descricao: '10 registros no Diário de Bordo',
    dica:      'Faça 10 entradas no Diário de Bordo',
  },
];

// ─── Parâmetros para cálculo ─────────────────────────────────────────────────

export type CalcBadgesParams = {
  /** Slugs de todas as ferramentas que o usuário já concluiu */
  slugsConcluidas: Set<string>;
  /** Número total de ferramentas concluídas */
  totalConcluidas: number;
  /** Streak atual em dias consecutivos no diário (diario_kairos) */
  streakDias: number;
  /** Visão Âncora preenchida (manchete não vazia) */
  temVisao: boolean;
  /** Roda da Vida preenchida pelo menos uma vez */
  temRoda: boolean;
  /** Número total de registros no diário (diario_kairos) */
  diarioCount: number;
};

// ─── Função principal ────────────────────────────────────────────────────────

export function calcularBadges(params: CalcBadgesParams): BadgeStatus[] {
  const {
    slugsConcluidas,
    totalConcluidas,
    streakDias,
    temVisao,
    temRoda,
    diarioCount,
  } = params;

  const fase1Completa = FASE1_SLUGS.every((s) => slugsConcluidas.has(s));

  const checks: Record<string, boolean> = {
    'primeiro-passo':     slugsConcluidas.has('raio-x'),
    'bussola-calibrada':  slugsConcluidas.has('bussola-valores'),
    'autoconhecimento':   fase1Completa,
    'semana-consistente': streakDias >= 7,
    'mes-kairos':         streakDias >= 30,
    'meio-caminho':       totalConcluidas >= 8,
    'mestre-kairos':      totalConcluidas >= 16,
    'visionario':         temVisao,
    'roda-completa':      temRoda,
    'diario-fiel':        diarioCount >= 10,
  };

  return BADGES.map((badge) => ({
    ...badge,
    conquistado: checks[badge.id] ?? false,
  }));
}

// ─── Helper: calcular streak de dias consecutivos a partir de array de datas ──

/**
 * Recebe datas ISO (YYYY-MM-DD) ordenadas de forma DESCENDENTE (mais recente primeiro)
 * e retorna o streak atual de dias consecutivos.
 */
export function calcularStreakDias(datas: string[]): number {
  if (datas.length === 0) return 0;
  let streak = 0;
  for (let i = 0; i < datas.length; i++) {
    const esperadoStr = new Date(Date.now() - i * 86_400_000)
      .toLocaleDateString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric', month: '2-digit', day: '2-digit',
      })
      .split('/').reverse().join('-');
    if (datas[i] === esperadoStr) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
