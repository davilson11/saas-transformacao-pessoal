/**
 * Motor de próximos passos.
 *
 * Antes, o componente NextActions mostrava uma lista fixa escrita à mão — os
 * mesmos seis itens para todo mundo, para sempre, tivesse a pessoa preenchido
 * a ferramenta ou não. Este módulo substitui aquilo por regras que olham o que
 * o usuário realmente fez.
 *
 * Tudo aqui é função pura: recebe o estado, devolve a lista. Nada de React,
 * nada de Supabase, nada de Date.now() escondido — a data "hoje" é sempre um
 * parâmetro. É o que torna estas regras testáveis, e são os primeiros testes
 * do projeto (proximosPassos.test.ts).
 *
 * Princípio das regras: uma sugestão só aparece se der para explicar POR QUE
 * ela apareceu. Toda ação carrega um `motivo` que é mostrado ao usuário.
 */

// ─── Catálogo ─────────────────────────────────────────────────────────────────

export type Frequencia = 'Diária' | 'Semanal' | 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual';

export type Ferramenta = {
  codigo:     string;
  slug:       string;
  nome:       string;
  emoji:      string;
  fase:       1 | 2 | 3 | 4;
  frequencia: Frequencia;
};

/**
 * As 16 ferramentas, na ordem em que fazem sentido ser feitas.
 * Espelha src/app/ferramentas/page.tsx — se uma ferramenta for adicionada lá,
 * adicione aqui também.
 */
export const FERRAMENTAS: Ferramenta[] = [
  // Fase 1 — Autoconhecimento
  { codigo: 'F01', slug: 'raio-x',               nome: 'Raio-X 360°',              emoji: '🎯', fase: 1, frequencia: 'Anual'      },
  { codigo: 'F02', slug: 'bussola-valores',      nome: 'Bússola de Valores',       emoji: '🧭', fase: 1, frequencia: 'Anual'      },
  { codigo: 'F03', slug: 'swot-pessoal',         nome: 'SWOT Pessoal',             emoji: '⭐', fase: 1, frequencia: 'Semestral'  },
  { codigo: 'F04', slug: 'feedback-360',         nome: 'Feedback 360°',            emoji: '🔮', fase: 1, frequencia: 'Semestral'  },
  // Fase 2 — Visão e Metas
  { codigo: 'F05', slug: 'okrs-pessoais',        nome: 'OKRs Pessoais',            emoji: '📊', fase: 2, frequencia: 'Trimestral' },
  { codigo: 'F06', slug: 'design-vida',          nome: 'Design de Vida',           emoji: '📅', fase: 2, frequencia: 'Anual'      },
  { codigo: 'F07', slug: 'dre-pessoal',          nome: 'Mapa Financeiro Pessoal',  emoji: '💰', fase: 2, frequencia: 'Mensal'     },
  { codigo: 'F08', slug: 'rotina-ideal',         nome: 'Rotina Ideal',             emoji: '🌅', fase: 2, frequencia: 'Semanal'    },
  // Fase 3 — Hábitos e Energia
  { codigo: 'F09', slug: 'auditoria-tempo',      nome: 'Auditoria de Tempo',       emoji: '⏱',  fase: 3, frequencia: 'Mensal'     },
  { codigo: 'F10', slug: 'arquiteto-rotinas',    nome: 'Arquiteto de Rotinas',     emoji: '🏗',  fase: 3, frequencia: 'Semanal'    },
  { codigo: 'F11', slug: 'sprint-aprendizado',   nome: 'Sprint de Aprendizado',    emoji: '🎓', fase: 3, frequencia: 'Mensal'     },
  { codigo: 'F12', slug: 'energia-vitalidade',   nome: 'Energia e Vitalidade',     emoji: '⚡', fase: 3, frequencia: 'Semanal'    },
  // Fase 4 — Crescimento
  { codigo: 'F13', slug: 'desconstrutor-crencas', nome: 'Desconstrutor de Crenças', emoji: '🧠', fase: 4, frequencia: 'Mensal'    },
  { codigo: 'F14', slug: 'crm-relacionamentos',   nome: 'Mapa de Relacionamentos',  emoji: '🤝', fase: 4, frequencia: 'Mensal'    },
  { codigo: 'F15', slug: 'diario-bordo',          nome: 'Diário de Bordo',          emoji: '📔', fase: 4, frequencia: 'Diária'    },
  { codigo: 'F16', slug: 'prevencao-recaida',     nome: 'Plano de Continuidade',    emoji: '🛡',  fase: 4, frequencia: 'Mensal'    },
];

/** Quantos dias até uma resposta ser considerada velha, por frequência. */
const VALIDADE_DIAS: Record<Frequencia, number> = {
  'Diária':     1,
  'Semanal':    7,
  'Mensal':     30,
  'Trimestral': 90,
  'Semestral':  180,
  'Anual':      365,
};

// ─── Entrada e saída ──────────────────────────────────────────────────────────

/** Uma linha de `ferramentas_respostas`, reduzida ao que as regras usam. */
export type RespostaFerramenta = {
  ferramenta_slug: string;
  progresso:       number;   // 0–100
  concluida:       boolean;
  updated_at:      string;   // ISO
};

export type EstadoUsuario = {
  respostas:        RespostaFerramenta[];
  /** Datas (YYYY-MM-DD) com registro no diário, mais recente primeiro. */
  diasComRegistro:  string[];
};

export type Prioridade = 'alta' | 'media' | 'baixa';

export type ProximoPasso = {
  id:         string;
  slug:       string;
  codigo:     string;
  emoji:      string;
  texto:      string;
  /** Por que esta sugestão apareceu. Mostrado ao usuário. */
  motivo:     string;
  prioridade: Prioridade;
};

// ─── Utilidades de data ───────────────────────────────────────────────────────

const UM_DIA = 86_400_000;

/** Data no formato YYYY-MM-DD, no fuso de São Paulo. */
export function diaStr(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(d);
}

function diasEntre(inicio: string, fim: Date): number {
  const t = new Date(inicio).getTime();
  if (Number.isNaN(t)) return Number.POSITIVE_INFINITY;
  return Math.floor((fim.getTime() - t) / UM_DIA);
}

// ─── Regras ───────────────────────────────────────────────────────────────────

/**
 * Monta a lista de próximos passos.
 *
 * Ordem de importância das regras (a primeira que se aplica manda):
 *
 *  1. Diário em aberto hoje — é o hábito que sustenta todo o resto.
 *  2. Ferramenta começada e não terminada — fechar o que está aberto vem antes
 *     de abrir coisa nova.
 *  3. Próxima ferramenta da jornada — a primeira não feita, respeitando a
 *     ordem das fases. Só uma por vez: a lista existe para dar direção, não
 *     para dar a sensação de dever de casa acumulado.
 *  4. Resposta vencida — passou o intervalo natural da ferramenta (a coluna
 *     "frequência" do catálogo). Você mudou; a resposta de um ano atrás
 *     provavelmente não vale mais.
 *
 * @param hoje injetável para permitir teste determinístico.
 */
export function calcularProximosPassos(
  estado: EstadoUsuario,
  hoje: Date = new Date(),
  limite = 6,
): ProximoPasso[] {
  const porSlug = new Map(estado.respostas.map((r) => [r.ferramenta_slug, r]));
  const passos: ProximoPasso[] = [];
  const usados = new Set<string>();

  const push = (p: ProximoPasso) => {
    if (usados.has(p.slug)) return;
    usados.add(p.slug);
    passos.push(p);
  };

  // ── 1. Diário de hoje ──────────────────────────────────────────────────
  const hojeStr   = diaStr(hoje);
  const ontemStr  = diaStr(new Date(hoje.getTime() - UM_DIA));
  const registros = new Set(estado.diasComRegistro);

  if (!registros.has(hojeStr)) {
    // Há quantos dias sem registrar? Muda o tom da mensagem.
    let diasSem = 0;
    for (let i = 1; i <= 30; i++) {
      if (registros.has(diaStr(new Date(hoje.getTime() - i * UM_DIA)))) break;
      diasSem = i;
    }

    const diario = FERRAMENTAS.find((f) => f.slug === 'diario-bordo')!;
    push({
      id:     'diario-hoje',
      slug:   diario.slug,
      codigo: diario.codigo,
      emoji:  diario.emoji,
      texto:  'Registrar o dia de hoje no Diário de Bordo',
      motivo:
        diasSem === 0 || registros.has(ontemStr)
          ? 'Você registrou ontem — manter a sequência é o que faz o diário valer'
          : diasSem >= 7
            ? `Seu último registro foi há mais de ${diasSem} dias. Recomeçar hoje já conta`
            : `${diasSem} dias sem registrar`,
      prioridade: 'alta',
    });
  }

  // ── 2. Ferramentas começadas e não terminadas ──────────────────────────
  const emAndamento = FERRAMENTAS
    .filter((f) => {
      const r = porSlug.get(f.slug);
      return r && !r.concluida && r.progresso > 0;
    })
    .sort((a, b) => (porSlug.get(b.slug)!.progresso) - (porSlug.get(a.slug)!.progresso));

  for (const f of emAndamento) {
    const r = porSlug.get(f.slug)!;
    push({
      id:     `andamento-${f.slug}`,
      slug:   f.slug,
      codigo: f.codigo,
      emoji:  f.emoji,
      texto:  `Terminar ${f.nome}`,
      motivo: `Você parou em ${r.progresso}%`,
      prioridade: r.progresso >= 50 ? 'alta' : 'media',
    });
  }

  // ── 3. Próxima ferramenta da jornada ───────────────────────────────────
  const proxima = FERRAMENTAS.find((f) => !porSlug.has(f.slug));
  if (proxima) {
    const anteriores  = FERRAMENTAS.slice(0, FERRAMENTAS.indexOf(proxima));
    const ehPrimeira  = anteriores.length === 0;
    const fechouFase  = anteriores.length > 0 && anteriores[anteriores.length - 1].fase !== proxima.fase;

    push({
      id:     `proxima-${proxima.slug}`,
      slug:   proxima.slug,
      codigo: proxima.codigo,
      emoji:  proxima.emoji,
      texto:  `Fazer ${proxima.nome}`,
      motivo: ehPrimeira
        ? 'É por aqui que a jornada começa — o diagnóstico vem antes do plano'
        : fechouFase
          ? `Você fechou a Fase ${proxima.fase - 1}. Esta abre a Fase ${proxima.fase}`
          : `Próxima da Fase ${proxima.fase}`,
      prioridade: ehPrimeira ? 'alta' : 'media',
    });
  }

  // ── 4. Respostas vencidas ──────────────────────────────────────────────
  const vencidas = FERRAMENTAS
    .map((f) => {
      const r = porSlug.get(f.slug);
      if (!r || !r.concluida || f.frequencia === 'Diária') return null;
      const idade = diasEntre(r.updated_at, hoje);
      const limiteDias = VALIDADE_DIAS[f.frequencia];
      return idade > limiteDias ? { f, idade, limiteDias } : null;
    })
    .filter((x): x is { f: Ferramenta; idade: number; limiteDias: number } => x !== null)
    .sort((a, b) => b.idade / b.limiteDias - a.idade / a.limiteDias);

  for (const { f, idade } of vencidas) {
    const meses = Math.floor(idade / 30);
    push({
      id:     `vencida-${f.slug}`,
      slug:   f.slug,
      codigo: f.codigo,
      emoji:  f.emoji,
      texto:  `Revisar ${f.nome}`,
      motivo: meses >= 2
        ? `Respondida há ${meses} meses — você mudou desde então`
        : `Frequência ${f.frequencia.toLowerCase()}, e já passou do prazo`,
      prioridade: 'baixa',
    });
  }

  return passos.slice(0, limite);
}

/**
 * Mensagem quando não há nada a sugerir — tudo em dia.
 * Estado raro e desejável; merece ser tratado como conquista, não como vazio.
 */
export const MENSAGEM_TUDO_EM_DIA =
  'Tudo em dia. Nenhuma ferramenta vencida e o diário de hoje já está registrado.';
