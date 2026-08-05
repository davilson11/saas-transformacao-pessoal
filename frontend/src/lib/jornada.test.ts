import { describe, it, expect } from 'vitest';
import {
  MESES_JORNADA,
  TOTAL_DIAS,
  diasEntre,
  somarDias,
  diaJornadaDe,
  diaJornadaHoje,
  dataDoDiaJornada,
  estadoJornada,
  mesDoDia,
  podeVerDia,
  rotuloDia,
  hojeStr,
  dataFixaHoje,
  escolherConteudo,
} from './jornada';

describe('estrutura da jornada', () => {
  it('cobre exatamente 365 dias, sem buraco nem sobreposição', () => {
    expect(MESES_JORNADA[0].diaInicio).toBe(1);
    expect(MESES_JORNADA[MESES_JORNADA.length - 1].diaFim).toBe(TOTAL_DIAS);

    for (let i = 1; i < MESES_JORNADA.length; i++) {
      expect(MESES_JORNADA[i].diaInicio).toBe(MESES_JORNADA[i - 1].diaFim + 1);
    }
  });

  it('mantém os comprimentos dos meses de 2026 — fevereiro tem 28 dias', () => {
    const fev = MESES_JORNADA[1];
    expect(fev.diaFim - fev.diaInicio + 1).toBe(28);
  });

  it('agrupa os 12 meses em 4 fases de 3 meses', () => {
    for (const m of MESES_JORNADA) {
      expect(m.fase).toBe(Math.ceil(m.numero / 3));
    }
  });

  it('abre com "Quem sou eu?" e fecha com "Gratidão e recomeço"', () => {
    expect(MESES_JORNADA[0].tema).toBe('Quem sou eu?');
    expect(MESES_JORNADA[11].tema).toBe('Gratidão e recomeço');
  });
});

describe('aritmética de datas', () => {
  it('conta dias-calendário entre duas datas', () => {
    expect(diasEntre('2026-01-01', '2026-01-01')).toBe(0);
    expect(diasEntre('2026-01-01', '2026-01-02')).toBe(1);
    expect(diasEntre('2026-01-01', '2026-12-31')).toBe(364);
  });

  it('atravessa a virada do ano sem se perder', () => {
    expect(diasEntre('2026-12-31', '2027-01-01')).toBe(1);
  });

  it('atravessa o horário de verão sem ganhar ou perder um dia', () => {
    // Outubro e fevereiro são os meses onde o DST costumava mudar no Brasil.
    expect(diasEntre('2026-10-15', '2026-10-16')).toBe(1);
    expect(diasEntre('2026-02-14', '2026-02-15')).toBe(1);
  });

  it('devolve null para data malformada em vez de NaN silencioso', () => {
    expect(diasEntre('ontem', '2026-01-01')).toBeNull();
    expect(diasEntre('2026-1-1', '2026-01-02')).toBeNull();
  });

  it('soma dias inclusive atravessando meses', () => {
    expect(somarDias('2026-01-31', 1)).toBe('2026-02-01');
    expect(somarDias('2026-02-28', 1)).toBe('2026-03-01');
    expect(somarDias('2026-12-31', 1)).toBe('2027-01-01');
  });
});

describe('quem começa hoje está no dia 1 hoje', () => {
  it('o dia de início é o dia 1, não o dia 0', () => {
    expect(diaJornadaDe('2026-08-04', '2026-08-04')).toBe(1);
  });

  it('o dia seguinte é o dia 2', () => {
    expect(diaJornadaDe('2026-08-05', '2026-08-04')).toBe(2);
  });

  it('converte ida e volta sem desvio', () => {
    const inicio = '2026-08-04';
    for (const dia of [1, 2, 31, 32, 200, 365]) {
      expect(diaJornadaDe(dataDoDiaJornada(dia, inicio), inicio)).toBe(dia);
    }
  });

  it('funciona para quem começou no ano anterior', () => {
    expect(diaJornadaDe('2027-01-01', '2026-08-04')).toBe(151);
  });

  it('devolve menor que 1 para data anterior ao início, sem esconder o problema', () => {
    expect(diaJornadaDe('2026-08-03', '2026-08-04')).toBe(0);
  });

  it('diaJornadaHoje usa o fuso de São Paulo', () => {
    // 3h UTC de 5 de agosto ainda é dia 4 em São Paulo (UTC-3).
    const madrugada = new Date('2026-08-05T02:00:00Z');
    expect(hojeStr(madrugada)).toBe('2026-08-04');
    expect(diaJornadaHoje('2026-08-04', madrugada)).toBe(1);
  });
});

describe('estadoJornada — primeira volta', () => {
  it('dia 1 abre em "Quem sou eu?", fase 1', () => {
    const e = estadoJornada(1)!;
    expect(e.mes.tema).toBe('Quem sou eu?');
    expect(e.fase).toBe(1);
    expect(e.volta).toBe(1);
    expect(e.concluiuCiclo).toBe(false);
    expect(e.diasRestantesNoCiclo).toBe(364);
  });

  it('acerta as fronteiras de mês', () => {
    expect(estadoJornada(31)!.mes.numero).toBe(1);
    expect(estadoJornada(32)!.mes.numero).toBe(2);
    expect(estadoJornada(59)!.mes.numero).toBe(2);
    expect(estadoJornada(60)!.mes.numero).toBe(3);
    expect(estadoJornada(334)!.mes.numero).toBe(11);
    expect(estadoJornada(335)!.mes.numero).toBe(12);
  });

  it('reproduz a fase que o app já exibia — dia 216 é fase 3', () => {
    // 4 de agosto de 2026 era o dia 216 do calendário e aparecia como "Fase 03".
    const e = estadoJornada(216)!;
    expect(e.fase).toBe(3);
    expect(e.mes.tema).toBe('Relacionamentos que constroem');
  });

  it('dia 365 fecha o ciclo sem tê-lo ultrapassado', () => {
    const e = estadoJornada(365)!;
    expect(e.diaNoCiclo).toBe(365);
    expect(e.volta).toBe(1);
    expect(e.concluiuCiclo).toBe(false);
    expect(e.diasRestantesNoCiclo).toBe(0);
    expect(e.progressoCiclo).toBe(100);
  });

  it('rejeita dia inválido em vez de inventar um estado', () => {
    expect(estadoJornada(0)).toBeNull();
    expect(estadoJornada(-5)).toBeNull();
    expect(estadoJornada(NaN)).toBeNull();
  });
});

describe('estadoJornada — segunda volta', () => {
  it('dia 366 é o dia 1 da segunda volta', () => {
    const e = estadoJornada(366)!;
    expect(e.diaNoCiclo).toBe(1);
    expect(e.volta).toBe(2);
    expect(e.concluiuCiclo).toBe(true);
    expect(e.mes.tema).toBe('Quem sou eu?');
  });

  it('o dia 47 da segunda volta traz o mesmo conteúdo do dia 47 da primeira', () => {
    // É o que transforma repetição em régua: mesma pergunta, um ano depois.
    expect(estadoJornada(365 + 47)!.diaNoCiclo).toBe(47);
    expect(estadoJornada(365 + 47)!.mes.tema).toBe(estadoJornada(47)!.mes.tema);
  });

  it('conta a terceira volta corretamente', () => {
    expect(estadoJornada(365 * 2 + 1)!.volta).toBe(3);
    expect(estadoJornada(365 * 2 + 1)!.diaNoCiclo).toBe(1);
  });
});

describe('progresso', () => {
  it('progresso do mês é relativo ao mês, não ao ciclo', () => {
    expect(estadoJornada(1)!.progressoMes).toBe(Math.round((1 / 31) * 100));
    expect(estadoJornada(31)!.progressoMes).toBe(100);
    expect(estadoJornada(32)!.progressoMes).toBe(Math.round((1 / 28) * 100));
  });
});

describe('mesDoDia', () => {
  it('encontra o mês de qualquer dia válido', () => {
    expect(mesDoDia(1)?.numero).toBe(1);
    expect(mesDoDia(365)?.numero).toBe(12);
  });

  it('recusa dia fora do ciclo', () => {
    expect(mesDoDia(0)).toBeNull();
    expect(mesDoDia(366)).toBeNull();
  });
});

describe('podeVerDia', () => {
  it('libera o dia de hoje e os anteriores', () => {
    expect(podeVerDia(1, 10)).toBe(true);
    expect(podeVerDia(10, 10)).toBe(true);
  });

  it('bloqueia conteúdo futuro', () => {
    expect(podeVerDia(11, 10)).toBe(false);
  });

  it('bloqueia dia inválido', () => {
    expect(podeVerDia(0, 10)).toBe(false);
  });
});

describe('rotuloDia', () => {
  it('mostra dia e tema na primeira volta', () => {
    expect(rotuloDia(estadoJornada(47)!)).toBe('Dia 47 · O que me move?');
  });

  it('indica a volta a partir da segunda', () => {
    expect(rotuloDia(estadoJornada(365 + 47)!)).toContain('2ª volta');
  });
});

describe('datas fixas', () => {
  it('devolve MM-DD no fuso de São Paulo', () => {
    expect(dataFixaHoje(new Date('2026-12-25T15:00:00Z'))).toBe('12-25');
  });

  it('respeita o fuso na virada — 2h UTC de 25/12 ainda é 24/12 em SP', () => {
    expect(dataFixaHoje(new Date('2026-12-25T02:00:00Z'))).toBe('12-24');
  });

  it('o conteúdo de data fixa vence o da jornada', () => {
    expect(escolherConteudo('natal', 'dia-47')).toBe('natal');
  });

  it('sem data fixa hoje, vale o da jornada', () => {
    expect(escolherConteudo(null, 'dia-47')).toBe('dia-47');
    expect(escolherConteudo(undefined, 'dia-47')).toBe('dia-47');
  });

  it('sem nenhum dos dois, devolve null em vez de undefined', () => {
    expect(escolherConteudo(null, null)).toBeNull();
    expect(escolherConteudo(undefined, undefined)).toBeNull();
  });
});
