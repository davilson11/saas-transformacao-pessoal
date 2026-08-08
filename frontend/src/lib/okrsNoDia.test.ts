import { describe, it, expect } from 'vitest';
import {
  lerNumero,
  krsAcompanhaveis,
  atualizarKr,
  resumoDoDia,
  type RespostasOkrs,
} from './okrsNoDia';

const kr = (over: Partial<{ descricao: string; meta: string; atual: string; unidade: string }> = {}) => ({
  descricao: 'Correr', meta: '10', atual: '0', unidade: 'km', prazo: '', ...over,
});

const respostas = (over: Partial<RespostasOkrs> = {}): RespostasOkrs => ({
  trimestre: 'Q3 2026',
  objetivos: [{ texto: 'Ficar mais forte', emoji: '💪', krs: [kr()] }],
  ...over,
});

describe('leitura de números escritos por humano', () => {
  it('lê inteiro e decimal com ponto', () => {
    expect(lerNumero('10')).toBe(10);
    expect(lerNumero('1.5')).toBe(1.5);
  });

  it('lê decimal com vírgula, como se escreve em português', () => {
    expect(lerNumero('1,5')).toBe(1.5);
  });

  it('lê valor com milhar e decimal no padrão brasileiro', () => {
    expect(lerNumero('3.000,50')).toBe(3000.5);
    expect(lerNumero('R$ 3.000,50')).toBe(3000.5);
  });

  it('ignora unidade colada no número', () => {
    expect(lerNumero('12 kg')).toBe(12);
  });

  it('devolve null em vez de chutar quando não há número', () => {
    expect(lerNumero('três vezes')).toBeNull();
    expect(lerNumero('')).toBeNull();
    expect(lerNumero('   ')).toBeNull();
    expect(lerNumero(null)).toBeNull();
    expect(lerNumero(undefined)).toBeNull();
    expect(lerNumero('---')).toBeNull();
  });
});

describe('quais KRs entram no acompanhamento diário', () => {
  it('inclui o que tem meta numérica', () => {
    const lista = krsAcompanhaveis(respostas());
    expect(lista).toHaveLength(1);
    expect(lista[0].descricao).toBe('Correr');
    expect(lista[0].meta).toBe(10);
  });

  it('ignora KR qualitativo em vez de inventar número', () => {
    const lista = krsAcompanhaveis(respostas({
      objetivos: [{ texto: 'Crescer', emoji: '🎯', krs: [kr({ meta: 'todo dia' })] }],
    }));
    expect(lista).toHaveLength(0);
  });

  it('ignora meta zero — dividir por zero produziria progresso sem sentido', () => {
    const lista = krsAcompanhaveis(respostas({
      objetivos: [{ texto: 'Crescer', emoji: '🎯', krs: [kr({ meta: '0' })] }],
    }));
    expect(lista).toHaveLength(0);
  });

  it('ignora objetivo ou KR em branco', () => {
    expect(krsAcompanhaveis(respostas({
      objetivos: [{ texto: '  ', emoji: '🎯', krs: [kr()] }],
    }))).toHaveLength(0);

    expect(krsAcompanhaveis(respostas({
      objetivos: [{ texto: 'Crescer', emoji: '🎯', krs: [kr({ descricao: '' })] }],
    }))).toHaveLength(0);
  });

  it('trata "atual" vazio como zero, não como ausência', () => {
    const lista = krsAcompanhaveis(respostas({
      objetivos: [{ texto: 'Crescer', emoji: '🎯', krs: [kr({ atual: '' })] }],
    }));
    expect(lista[0].atual).toBe(0);
    expect(lista[0].progresso).toBe(0);
  });

  it('calcula progresso e limita a 100 quando a pessoa supera a meta', () => {
    const lista = krsAcompanhaveis(respostas({
      objetivos: [{ texto: 'Crescer', emoji: '🎯', krs: [kr({ atual: '15', meta: '10' })] }],
    }));
    expect(lista[0].progresso).toBe(100);
    expect(lista[0].concluido).toBe(true);
  });

  it('mantém o concluído na lista — ver a meta batida é reforço', () => {
    const lista = krsAcompanhaveis(respostas({
      objetivos: [{ texto: 'Crescer', emoji: '🎯', krs: [kr({ atual: '10', meta: '10' })] }],
    }));
    expect(lista).toHaveLength(1);
    expect(lista[0].concluido).toBe(true);
  });

  it('guarda os índices para escrever de volta sem ambiguidade', () => {
    const lista = krsAcompanhaveis({
      objetivos: [
        { texto: 'A', emoji: '🎯', krs: [kr({ descricao: 'a1' }), kr({ descricao: 'a2' })] },
        { texto: 'B', emoji: '🚀', krs: [kr({ descricao: 'b1' })] },
      ],
    });
    expect(lista.map((k) => [k.objetivoIdx, k.krIdx])).toEqual([[0, 0], [0, 1], [1, 0]]);
  });

  it('aguenta entrada vazia sem quebrar', () => {
    expect(krsAcompanhaveis(null)).toEqual([]);
    expect(krsAcompanhaveis(undefined)).toEqual([]);
    expect(krsAcompanhaveis({})).toEqual([]);
  });
});

describe('gravar de volta', () => {
  it('altera só o KR indicado', () => {
    const antes = {
      objetivos: [
        { texto: 'A', emoji: '🎯', krs: [kr({ descricao: 'a1' }), kr({ descricao: 'a2' })] },
        { texto: 'B', emoji: '🚀', krs: [kr({ descricao: 'b1' })] },
      ],
    };
    const depois = atualizarKr(antes, 0, 1, '7');

    expect(depois.objetivos![0].krs[1].atual).toBe('7');
    expect(depois.objetivos![0].krs[0].atual).toBe('0');
    expect(depois.objetivos![1].krs[0].atual).toBe('0');
  });

  it('preserva o resto do JSON, inclusive campos que não conhece', () => {
    const antes = {
      trimestre: 'Q3 2026',
      objetivos: [{ texto: 'A', emoji: '🎯', krs: [kr()], valorId: 'saude' }],
      semanas: [{ feito: 'x', aprendizado: 'y' }],
    } as RespostasOkrs & { semanas: unknown };

    const depois = atualizarKr(antes, 0, 0, '5') as typeof antes;

    expect(depois.trimestre).toBe('Q3 2026');
    expect(depois.objetivos![0].valorId).toBe('saude');
    expect(depois.semanas).toEqual([{ feito: 'x', aprendizado: 'y' }]);
  });

  it('não muta o objeto original', () => {
    const antes = respostas();
    const copia = JSON.parse(JSON.stringify(antes));
    atualizarKr(antes, 0, 0, '9');
    expect(antes).toEqual(copia);
  });
});

describe('resumo do dia', () => {
  it('cala quando não há nada para acompanhar', () => {
    expect(resumoDoDia([])).toBe('');
  });

  it('reconhece quando tudo foi batido', () => {
    const lista = krsAcompanhaveis(respostas({
      objetivos: [{ texto: 'A', emoji: '🎯', krs: [kr({ atual: '10' })] }],
    }));
    expect(resumoDoDia(lista)).toMatch(/batido/i);
  });

  it('nenhum texto cobra', () => {
    const cenarios = [
      krsAcompanhaveis(respostas()),
      krsAcompanhaveis(respostas({ objetivos: [{ texto: 'A', emoji: '🎯', krs: [kr({ atual: '10' }), kr({ descricao: 'z' })] }] })),
      [],
    ];
    for (const c of cenarios) {
      expect(resumoDoDia(c)).not.toMatch(/atras|falh|deveria|parado|abandon/i);
    }
  });
});
