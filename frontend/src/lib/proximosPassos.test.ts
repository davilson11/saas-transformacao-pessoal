import { describe, it, expect } from 'vitest';
import {
  calcularProximosPassos,
  diaStr,
  FERRAMENTAS,
  type EstadoUsuario,
  type RespostaFerramenta,
} from './proximosPassos';

// Data fixa para todos os testes: quinta-feira, 06/08/2026, meio-dia em SP.
const HOJE = new Date('2026-08-06T15:00:00Z');

function diasAtras(n: number): string {
  return new Date(HOJE.getTime() - n * 86_400_000).toISOString();
}

function resposta(over: Partial<RespostaFerramenta> & { ferramenta_slug: string }): RespostaFerramenta {
  return { progresso: 100, concluida: true, updated_at: diasAtras(1), ...over };
}

const VAZIO: EstadoUsuario = { respostas: [], diasComRegistro: [] };

describe('usuário novo', () => {
  it('manda começar pelo Raio-X, e não por uma ferramenta do meio', () => {
    const passos = calcularProximosPassos(VAZIO, HOJE);
    const jornada = passos.find((p) => p.id.startsWith('proxima-'));

    expect(jornada?.slug).toBe('raio-x');
    expect(jornada?.prioridade).toBe('alta');
    expect(jornada?.motivo).toMatch(/diagnóstico vem antes do plano/i);
  });

  it('não inventa ferramentas em andamento nem vencidas', () => {
    const passos = calcularProximosPassos(VAZIO, HOJE);
    expect(passos.some((p) => p.id.startsWith('andamento-'))).toBe(false);
    expect(passos.some((p) => p.id.startsWith('vencida-'))).toBe(false);
  });
});

describe('diário', () => {
  it('sugere o registro de hoje quando ele não existe', () => {
    const passos = calcularProximosPassos(VAZIO, HOJE);
    expect(passos[0].id).toBe('diario-hoje');
    expect(passos[0].prioridade).toBe('alta');
  });

  it('não sugere nada de diário quando hoje já foi registrado', () => {
    const estado: EstadoUsuario = { respostas: [], diasComRegistro: [diaStr(HOJE)] };
    const passos = calcularProximosPassos(estado, HOJE);
    expect(passos.some((p) => p.id === 'diario-hoje')).toBe(false);
  });

  it('reconhece a sequência quando houve registro ontem', () => {
    const ontem = diaStr(new Date(HOJE.getTime() - 86_400_000));
    const passos = calcularProximosPassos({ respostas: [], diasComRegistro: [ontem] }, HOJE);
    const diario = passos.find((p) => p.id === 'diario-hoje');
    expect(diario?.motivo).toMatch(/registrou ontem/i);
  });

  it('acolhe em vez de cobrar depois de uma ausência longa', () => {
    const passos = calcularProximosPassos(VAZIO, HOJE);
    const diario = passos.find((p) => p.id === 'diario-hoje');
    expect(diario?.motivo).toMatch(/recomeçar hoje já conta/i);
  });
});

describe('ferramenta em andamento', () => {
  it('prioriza fechar o que está aberto, com o progresso no motivo', () => {
    const estado: EstadoUsuario = {
      respostas: [resposta({ ferramenta_slug: 'raio-x', progresso: 60, concluida: false })],
      diasComRegistro: [diaStr(HOJE)],
    };
    const passos = calcularProximosPassos(estado, HOJE);

    expect(passos[0].id).toBe('andamento-raio-x');
    expect(passos[0].prioridade).toBe('alta');
    expect(passos[0].motivo).toBe('Você parou em 60%');
  });

  it('trata progresso baixo como prioridade média', () => {
    const estado: EstadoUsuario = {
      respostas: [resposta({ ferramenta_slug: 'raio-x', progresso: 20, concluida: false })],
      diasComRegistro: [diaStr(HOJE)],
    };
    const passos = calcularProximosPassos(estado, HOJE);
    expect(passos[0].prioridade).toBe('media');
  });

  it('ordena por quem está mais perto do fim', () => {
    const estado: EstadoUsuario = {
      respostas: [
        resposta({ ferramenta_slug: 'raio-x',          progresso: 30, concluida: false }),
        resposta({ ferramenta_slug: 'bussola-valores', progresso: 80, concluida: false }),
      ],
      diasComRegistro: [diaStr(HOJE)],
    };
    const passos = calcularProximosPassos(estado, HOJE);
    expect(passos[0].slug).toBe('bussola-valores');
  });
});

describe('avanço na jornada', () => {
  it('avisa quando a próxima ferramenta abre uma fase nova', () => {
    const fase1 = FERRAMENTAS.filter((f) => f.fase === 1);
    const estado: EstadoUsuario = {
      respostas: fase1.map((f) => resposta({ ferramenta_slug: f.slug })),
      diasComRegistro: [diaStr(HOJE)],
    };
    const passos  = calcularProximosPassos(estado, HOJE);
    const jornada = passos.find((p) => p.id.startsWith('proxima-'));

    expect(jornada?.slug).toBe('okrs-pessoais');
    expect(jornada?.motivo).toMatch(/fechou a Fase 1.*abre a Fase 2/i);
  });

  it('sugere uma ferramenta nova por vez, não a lista inteira', () => {
    const passos = calcularProximosPassos(VAZIO, HOJE);
    expect(passos.filter((p) => p.id.startsWith('proxima-'))).toHaveLength(1);
  });
});

describe('respostas vencidas', () => {
  it('pede revisão de uma ferramenta mensal respondida há 100 dias', () => {
    const estado: EstadoUsuario = {
      respostas: [resposta({ ferramenta_slug: 'dre-pessoal', updated_at: diasAtras(100) })],
      diasComRegistro: [diaStr(HOJE)],
    };
    const passos = calcularProximosPassos(estado, HOJE);
    const vencida = passos.find((p) => p.id === 'vencida-dre-pessoal');

    expect(vencida).toBeDefined();
    expect(vencida?.motivo).toMatch(/há 3 meses.*você mudou/i);
    expect(vencida?.prioridade).toBe('baixa');
  });

  it('respeita a frequência de cada ferramenta: 100 dias não vence a anual', () => {
    const estado: EstadoUsuario = {
      respostas: [resposta({ ferramenta_slug: 'raio-x', updated_at: diasAtras(100) })],
      diasComRegistro: [diaStr(HOJE)],
    };
    const passos = calcularProximosPassos(estado, HOJE);
    expect(passos.some((p) => p.id === 'vencida-raio-x')).toBe(false);
  });

  it('não marca como vencida a ferramenta que nem foi concluída', () => {
    const estado: EstadoUsuario = {
      respostas: [resposta({ ferramenta_slug: 'dre-pessoal', concluida: false, progresso: 40, updated_at: diasAtras(100) })],
      diasComRegistro: [diaStr(HOJE)],
    };
    const passos = calcularProximosPassos(estado, HOJE);
    expect(passos.some((p) => p.id === 'vencida-dre-pessoal')).toBe(false);
    expect(passos.some((p) => p.id === 'andamento-dre-pessoal')).toBe(true);
  });

  it('ordena pelo mais atrasado em relação à própria frequência', () => {
    const estado: EstadoUsuario = {
      respostas: [
        resposta({ ferramenta_slug: 'dre-pessoal',   updated_at: diasAtras(60)  }), // mensal, 2x o prazo
        resposta({ ferramenta_slug: 'rotina-ideal',  updated_at: diasAtras(70)  }), // semanal, 10x o prazo
      ],
      diasComRegistro: [diaStr(HOJE)],
    };
    const passos   = calcularProximosPassos(estado, HOJE);
    const vencidas = passos.filter((p) => p.id.startsWith('vencida-'));
    expect(vencidas[0].slug).toBe('rotina-ideal');
  });
});

describe('garantias gerais', () => {
  it('nunca repete a mesma ferramenta em dois passos', () => {
    const estado: EstadoUsuario = {
      respostas: [resposta({ ferramenta_slug: 'diario-bordo', updated_at: diasAtras(400) })],
      diasComRegistro: [],
    };
    const passos = calcularProximosPassos(estado, HOJE);
    const slugs  = passos.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('respeita o limite de itens', () => {
    const estado: EstadoUsuario = {
      respostas: FERRAMENTAS.map((f) => resposta({ ferramenta_slug: f.slug, updated_at: diasAtras(400) })),
      diasComRegistro: [],
    };
    expect(calcularProximosPassos(estado, HOJE, 3)).toHaveLength(3);
  });

  it('toda sugestão explica por que apareceu', () => {
    const passos = calcularProximosPassos(VAZIO, HOJE);
    expect(passos.length).toBeGreaterThan(0);
    for (const p of passos) {
      expect(p.motivo.length).toBeGreaterThan(10);
    }
  });

  it('devolve lista vazia quando está tudo em dia', () => {
    const estado: EstadoUsuario = {
      respostas: FERRAMENTAS.map((f) => resposta({ ferramenta_slug: f.slug })),
      diasComRegistro: [diaStr(HOJE)],
    };
    expect(calcularProximosPassos(estado, HOJE)).toHaveLength(0);
  });
});
