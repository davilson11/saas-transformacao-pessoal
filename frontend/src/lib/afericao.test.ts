import { describe, it, expect } from 'vitest';
import { estadoJornada } from './jornada';
import {
  mesAAferir,
  pendentes,
  enunciado,
  resumirSerie,
  type Afericao,
  type RespostaAfericao,
} from './afericao';

function af(mes: number, resposta: RespostaAfericao, volta = 1): Afericao {
  return {
    mes_jornada: mes, volta, dia_jornada: mes * 30, resposta,
    porque: null, manchete_no_momento: null, created_at: '2026-01-01T00:00:00Z',
  };
}

describe('quando perguntar', () => {
  it('não pergunta antes de o primeiro mês fechar', () => {
    expect(mesAAferir(estadoJornada(30), [])).toBeNull();
    expect(mesAAferir(estadoJornada(31), [])).toBeNull();
  });

  it('pergunta assim que o mês 1 se encerra', () => {
    expect(mesAAferir(estadoJornada(32), [])?.numero).toBe(1);
  });

  it('não exige responder no dia exato — aceita depois', () => {
    // A pessoa sumiu e voltou no dia 100. A pergunta do mês 1 continua lá.
    expect(mesAAferir(estadoJornada(100), [])?.numero).toBe(1);
  });

  it('prioriza o mês mais antigo em aberto', () => {
    const feito = [af(1, 'mais_perto')];
    expect(mesAAferir(estadoJornada(100), feito)?.numero).toBe(2);
  });

  it('para de perguntar quando tudo do período está aferido', () => {
    const feitos = [af(1, 'igual'), af(2, 'mais_perto'), af(3, 'mais_perto')];
    // dia 100 encerrou os meses 1, 2 e 3.
    expect(mesAAferir(estadoJornada(100), feitos)).toBeNull();
  });

  it('a segunda volta pergunta de novo, sem herdar as respostas da primeira', () => {
    const primeiraVolta = [af(1, 'mais_perto', 1)];
    const naSegunda = estadoJornada(365 + 40); // volta 2, dia 40 do ciclo
    expect(mesAAferir(naSegunda, primeiraVolta)?.numero).toBe(1);
  });

  it('conta quantas ficaram pendentes', () => {
    expect(pendentes(estadoJornada(100), [])).toBe(3);
    expect(pendentes(estadoJornada(100), [af(1, 'igual')])).toBe(2);
    expect(pendentes(estadoJornada(20), [])).toBe(0);
  });

  it('sem estado, não pergunta nada', () => {
    expect(mesAAferir(null, [])).toBeNull();
    expect(pendentes(null, [])).toBe(0);
  });
});

describe('enunciado', () => {
  it('sem manchete, não faz a pergunta', () => {
    const mes = estadoJornada(32)!;
    expect(enunciado(mes.mes, null)).toBeNull();
    expect(enunciado(mes.mes, '   ')).toBeNull();
  });

  it('cita o tema do mês e o número de dias', () => {
    const mes = { numero: 1, tema: 'Quem sou eu?', diaInicio: 1, diaFim: 31, fase: 1 as const };
    const t = enunciado(mes, 'Um homem presente')!;
    expect(t).toContain('Quem sou eu?');
    expect(t).toContain('31');
    expect(t).toMatch(/mais perto ou mais longe/i);
  });
});

describe('resumo da série', () => {
  it('explica o vazio sem parecer erro', () => {
    expect(resumirSerie([]).texto).toMatch(/primeira aferição/i);
  });

  it('com uma só, avisa que a régua ainda não existe', () => {
    expect(resumirSerie([af(1, 'mais_perto')]).texto).toMatch(/segunda/i);
  });

  it('conta as três respostas', () => {
    const s = resumirSerie([af(1, 'mais_perto'), af(2, 'igual'), af(3, 'mais_longe')]);
    expect(s.total).toBe(3);
    expect(s.maisPerto).toBe(1);
    expect(s.igual).toBe(1);
    expect(s.maisLonge).toBe(1);
  });

  it('reconhece quando a direção está se sustentando', () => {
    const s = resumirSerie([af(1, 'mais_perto'), af(2, 'mais_perto'), af(3, 'igual')]);
    expect(s.texto).toMatch(/sustentando a direção/i);
  });

  it('num saldo negativo, questiona a âncora em vez de julgar a pessoa', () => {
    const s = resumirSerie([af(1, 'mais_longe'), af(2, 'mais_longe'), af(3, 'igual')]);
    expect(s.texto).toMatch(/reler sua âncora/i);
    expect(s.texto).toMatch(/herdou/i);
    expect(s.texto).not.toMatch(/falh|fracass|preguiç|desist/i);
  });

  it('nenhum texto culpa a pessoa', () => {
    const cenarios: Afericao[][] = [
      [],
      [af(1, 'mais_longe')],
      [af(1, 'mais_longe'), af(2, 'mais_longe')],
      [af(1, 'igual'), af(2, 'igual'), af(3, 'mais_longe')],
      [af(1, 'mais_perto'), af(2, 'mais_perto')],
    ];
    for (const c of cenarios) {
      expect(resumirSerie(c).texto).not.toMatch(/falh|fracass|preguiç|desist|culpa/i);
    }
  });

  it('separa as voltas', () => {
    const mix = [af(1, 'mais_perto', 1), af(1, 'mais_longe', 2), af(2, 'mais_longe', 2)];
    expect(resumirSerie(mix, 1).total).toBe(1);
    expect(resumirSerie(mix, 2).total).toBe(2);
  });
});
