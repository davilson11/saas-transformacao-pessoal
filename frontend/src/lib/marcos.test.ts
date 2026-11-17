import { describe, it, expect } from 'vitest';
import { estadoJornada, dataDoDiaJornada } from './jornada';
import { mesAAferir } from './afericao';
import {
  DIAS_MARCO,
  marcoAnterior,
  diaAbsolutoDoMarco,
  dataDoMarco,
  mensagemMarco,
} from './marcos';

describe('lista de marcos', () => {
  it('começa no dia 1 e segue os fechamentos de mês reescritos', () => {
    expect(DIAS_MARCO).toEqual([1, 31, 59, 90, 120, 151]);
  });

  it('é crescente e sem repetição', () => {
    expect([...DIAS_MARCO].sort((a, b) => a - b)).toEqual([...DIAS_MARCO]);
    expect(new Set(DIAS_MARCO).size).toBe(DIAS_MARCO.length);
  });
});

describe('marcoAnterior', () => {
  it('mês 1 não tem marco anterior', () => {
    expect(marcoAnterior(1)).toBeNull();
  });

  it('mês 2 devolve o dia 31', () => {
    expect(marcoAnterior(2)).toBe(31);
  });

  it('mês 3 devolve o dia 59', () => {
    expect(marcoAnterior(3)).toBe(59);
  });

  it('meses 4, 5 e 6 devolvem 90, 120 e 151', () => {
    expect([4, 5, 6].map(marcoAnterior)).toEqual([90, 120, 151]);
  });

  it('mês 7 em diante devolve null até esses meses terem marco', () => {
    expect(marcoAnterior(7)).toBeNull();
    expect(marcoAnterior(12)).toBeNull();
  });

  it('entrada inválida devolve null, nunca lança', () => {
    expect(marcoAnterior(0)).toBeNull();
    expect(marcoAnterior(13)).toBeNull();
    expect(marcoAnterior(-1)).toBeNull();
  });
});

describe('data do marco — sem depender da data real do sistema', () => {
  // Todos os casos passam `hoje` explicitamente. O default hojeStr() só é
  // usado pelo componente.

  it('o marco 1 é a própria data de início', () => {
    // dia 45 em 2026-11-16 ⇒ início 2026-10-03
    const estado = estadoJornada(45)!;
    expect(dataDoMarco(1, estado, '2026-11-16')).toBe('2026-10-03');
  });

  it('na 1ª volta, o marco 31 é 30 dias depois do início', () => {
    // dia 60 em 2026-12-01 ⇒ início 2026-10-03 ⇒ dia 31 = 2026-11-02
    const estado = estadoJornada(60)!;
    expect(dataDoMarco(31, estado, '2026-12-01')).toBe('2026-11-02');
  });

  it('é consistente com dataDoDiaJornada', () => {
    const estado = estadoJornada(100)!;
    const hoje   = '2027-01-10';
    const inicio = '2026-10-03'; // 100º dia = hoje
    expect(dataDoMarco(59, estado, hoje)).toBe(dataDoDiaJornada(59, inicio));
  });

  it('na 2ª volta, o marco 31 cai 365 dias depois do da 1ª', () => {
    const estado = estadoJornada(365 + 60)!; // volta 2, dia 60 do ciclo
    expect(estado.volta).toBe(2);
    expect(diaAbsolutoDoMarco(31, 2)).toBe(396);
    // hoje é o dia absoluto 425 (2027-12-01) ⇒ início 2026-10-03 ⇒ dia 396 = 2027-11-02
    expect(dataDoMarco(31, estado, '2027-12-01')).toBe('2027-11-02');
  });

  it('diaAbsolutoDoMarco não quebra com volta 0 ou fracionária', () => {
    expect(diaAbsolutoDoMarco(31, 0)).toBe(31);
    expect(diaAbsolutoDoMarco(31, 1.9)).toBe(31);
  });

  it('atravessa a virada do ano', () => {
    // dia 120 em 2027-01-30 ⇒ início 2026-10-03 ⇒ dia 90 = 2026-12-31
    const estado = estadoJornada(120)!;
    expect(dataDoMarco(90, estado, '2027-01-30')).toBe('2026-12-31');
  });
});

describe('mensagem do marco', () => {
  it('devolve o texto quando há', () => {
    expect(mensagemMarco({ situacao: 'texto', texto: 'Alguém que começa.' })).toBe('Alguém que começa.');
  });

  it('sem registro, diz exatamente a frase combinada', () => {
    expect(mensagemMarco({ situacao: 'ausente' })).toBe('Não há registro no app para esse dia.');
  });

  it('erro de leitura NÃO vira "não há registro"', () => {
    const m = mensagemMarco({ situacao: 'erro' });
    expect(m).not.toMatch(/não há registro/i);
    expect(m).toMatch(/carregar/i);
  });

  it('nenhuma mensagem culpa a pessoa', () => {
    for (const r of [{ situacao: 'ausente' }, { situacao: 'erro' }] as const) {
      expect(mensagemMarco(r)).not.toMatch(/você não|esqueceu|deixou de|falh|perdeu|deveria/i);
    }
  });
});

describe('a aferição sem marco continua igual', () => {
  it('no mês 1 não há marco, e a aferição do mês 1 continua sendo oferecida', () => {
    const estado = estadoJornada(32)!;
    expect(mesAAferir(estado, [])?.numero).toBe(1);
    expect(marcoAnterior(1)).toBeNull();
  });

  it('num mês sem marco (7+), a aferição continua sendo oferecida', () => {
    const estado = estadoJornada(213)!;              // mês 7 fechou no dia 212
    expect(mesAAferir(estado, [])?.numero).toBe(1);  // o mais antigo pendente vem primeiro
    expect(marcoAnterior(8)).toBeNull();
  });
});
