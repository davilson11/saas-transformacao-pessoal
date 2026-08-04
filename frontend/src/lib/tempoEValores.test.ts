import { describe, it, expect } from 'vitest';
import { calcularContraste, formatarHoras, textoSemMapeamento, type DiaTipico } from './tempoEValores';
import { valoresDoUsuario } from './valores';

const DIA_ZERADO: DiaTipico = {
  trabalho: 0, familia: 0, saude: 0, lazer: 0, crescimento: 0, desperdicado: 0,
};

const dia = (over: Partial<DiaTipico>): DiaTipico => ({ ...DIA_ZERADO, ...over });

describe('formatarHoras', () => {
  it('mostra horas cheias sem minutos', () => {
    expect(formatarHoras(3)).toBe('3h');
  });

  it('mostra meia hora como 1h30, não 1.5h', () => {
    expect(formatarHoras(1.5)).toBe('1h30');
  });

  it('mostra só minutos quando é menos de uma hora', () => {
    expect(formatarHoras(0.5)).toBe('30min');
  });
});

describe('quando o módulo deve ficar calado', () => {
  it('sem valores definidos', () => {
    const c = calcularContraste([], { diaTipico: dia({ familia: 1 }) });
    expect(c.observacoes).toEqual([]);
  });

  it('sem resposta da auditoria', () => {
    const v = valoresDoUsuario({ selecionados: ['amor'] });
    expect(calcularContraste(v, null).observacoes).toEqual([]);
    expect(calcularContraste(v, undefined).observacoes).toEqual([]);
    expect(calcularContraste(v, {}).observacoes).toEqual([]);
  });

  it('não opina sobre valores sem equivalente numa área do dia', () => {
    const v = valoresDoUsuario({ selecionados: ['coragem', 'integridade', 'excelencia'] });
    const c = calcularContraste(v, { diaTipico: dia({ familia: 1, desperdicado: 4 }) });

    expect(c.observacoes).toEqual([]);
    expect(c.semMapeamento.map((x) => x.id)).toEqual(['coragem', 'integridade', 'excelencia']);
  });

  it('só olha os três primeiros do ranking', () => {
    // saude está em 4º: a ausência dele na agenda é escolha de prioridade,
    // não contradição.
    const v = valoresDoUsuario({ selecionados: ['coragem', 'integridade', 'excelencia', 'saude'] });
    const c = calcularContraste(v, { diaTipico: dia({ saude: 0, desperdicado: 5 }) });

    expect(c.observacoes).toEqual([]);
    expect(c.semMapeamento).toHaveLength(3);
  });
});

describe('contradição — o tempo desperdiçado supera o valor central', () => {
  it('aponta quando o desperdício é maior que a área do valor', () => {
    const v = valoresDoUsuario({ selecionados: ['amor'] });
    const c = calcularContraste(v, { diaTipico: dia({ familia: 1, desperdicado: 3 }) });

    expect(c.observacoes).toHaveLength(1);
    expect(c.observacoes[0].tipo).toBe('contradicao');
    expect(c.observacoes[0].texto).toContain('1h');
    expect(c.observacoes[0].texto).toContain('3h');
    expect(c.observacoes[0].texto).toContain('seu valor número 1');
  });

  it('devolve pergunta em vez de veredicto', () => {
    const v = valoresDoUsuario({ selecionados: ['amor'] });
    const c = calcularContraste(v, { diaTipico: dia({ familia: 1, desperdicado: 3 }) });

    expect(c.observacoes[0].texto).toContain('Os dois números são seus');
    expect(c.observacoes[0].texto).toMatch(/\?$/);
  });

  it('não acusa contradição quando não há tempo desperdiçado', () => {
    const v = valoresDoUsuario({ selecionados: ['amor'] });
    const c = calcularContraste(v, { diaTipico: dia({ familia: 1, desperdicado: 0 }) });

    expect(c.observacoes[0].tipo).toBe('atencao');
  });
});

describe('atenção e reconhecimento', () => {
  it('marca atenção quando a área fica abaixo da referência da ferramenta', () => {
    // referência de família é 3h
    const v = valoresDoUsuario({ selecionados: ['amor'] });
    const c = calcularContraste(v, { diaTipico: dia({ familia: 2 }) });

    expect(c.observacoes[0].tipo).toBe('atencao');
    expect(c.observacoes[0].texto).toContain('referência');
  });

  it('reconhece quando a agenda concorda com o valor', () => {
    const v = valoresDoUsuario({ selecionados: ['amor'] });
    const c = calcularContraste(v, { diaTipico: dia({ familia: 4 }) });

    expect(c.observacoes[0].tipo).toBe('reconhecimento');
    expect(c.observacoes[0].texto).toContain('concorda');
  });

  it('reconhece também quando fica exatamente na referência', () => {
    const v = valoresDoUsuario({ selecionados: ['saude'] });
    const c = calcularContraste(v, { diaTipico: dia({ saude: 2 }) });

    expect(c.observacoes[0].tipo).toBe('reconhecimento');
  });
});

describe('mapeamento de valores para áreas', () => {
  it('todos os valores de relacionar apontam para família', () => {
    for (const id of ['amor', 'lealdade', 'empatia', 'pertencimento']) {
      const v = valoresDoUsuario({ selecionados: [id] });
      const c = calcularContraste(v, { diaTipico: dia({ familia: 4 }) });
      expect(c.observacoes[0]?.tipo).toBe('reconhecimento');
    }
  });

  it('todos os valores de crescer apontam para crescimento pessoal', () => {
    for (const id of ['aprendizado', 'proposito', 'aventura', 'legado']) {
      const v = valoresDoUsuario({ selecionados: [id] });
      const c = calcularContraste(v, { diaTipico: dia({ crescimento: 2 }) });
      expect(c.observacoes[0]?.tipo).toBe('reconhecimento');
    }
  });
});

describe('ordenação', () => {
  it('contradições vêm antes, reconhecimentos por último', () => {
    const v = valoresDoUsuario({ selecionados: ['saude', 'amor', 'aprendizado'] });
    const c = calcularContraste(v, {
      diaTipico: dia({
        saude:        4,   // acima da referência (2) → reconhecimento
        familia:      1,   // menor que desperdiçado → contradição
        crescimento:  0.5, // abaixo da referência (1), mas desperdiçado é maior → contradição
        desperdicado: 3,
      }),
    });

    const tipos = c.observacoes.map((o) => o.tipo);
    expect(tipos[tipos.length - 1]).toBe('reconhecimento');
    expect(tipos[0]).toBe('contradicao');
  });
});

describe('textoSemMapeamento', () => {
  it('é vazio quando não há valores sem mapeamento', () => {
    expect(textoSemMapeamento([])).toBe('');
  });

  it('explica o silêncio em vez de simplesmente omitir', () => {
    const v = valoresDoUsuario({ selecionados: ['coragem'] });
    const t = textoSemMapeamento(v);

    expect(t).toContain('Coragem');
    expect(t).toContain('sem inventar uma conclusão');
  });

  it('concorda em número no singular e no plural', () => {
    const um = valoresDoUsuario({ selecionados: ['coragem'] });
    const dois = valoresDoUsuario({ selecionados: ['coragem', 'integridade'] });

    expect(textoSemMapeamento(um)).toContain('esse valor não é');
    expect(textoSemMapeamento(dois)).toContain('esses valores não são');
  });
});
