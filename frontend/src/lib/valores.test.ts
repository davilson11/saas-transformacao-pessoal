import { describe, it, expect } from 'vitest';
import {
  valoresDoUsuario,
  calcularAlinhamento,
  prioridadeDoValor,
  getValor,
  VALORES,
} from './valores';

describe('valoresDoUsuario', () => {
  it('usa o ranking, porque a ordem dele é a prioridade que a pessoa definiu', () => {
    const v = valoresDoUsuario({
      selecionados: ['amor', 'coragem', 'legado'],
      ranking: [
        { id: 'legado',  porque: 'quero deixar algo' },
        { id: 'amor',    porque: 'minha família' },
        { id: 'coragem', porque: '' },
      ],
    });
    expect(v.map((x) => x.id)).toEqual(['legado', 'amor', 'coragem']);
  });

  it('cai para selecionados quando o ranking ainda não foi montado', () => {
    const v = valoresDoUsuario({ selecionados: ['amor', 'coragem'] });
    expect(v.map((x) => x.id)).toEqual(['amor', 'coragem']);
  });

  it('devolve vazio quando não há resposta da Bússola', () => {
    expect(valoresDoUsuario(null)).toEqual([]);
    expect(valoresDoUsuario(undefined)).toEqual([]);
    expect(valoresDoUsuario({})).toEqual([]);
  });

  it('descarta id desconhecido em vez de quebrar a tela', () => {
    const v = valoresDoUsuario({ ranking: [
      { id: 'valor-que-nao-existe-mais', porque: '' },
      { id: 'amor', porque: '' },
    ] });
    expect(v.map((x) => x.id)).toEqual(['amor']);
  });

  it('não repete valor duplicado', () => {
    const v = valoresDoUsuario({ ranking: [
      { id: 'amor', porque: '' },
      { id: 'amor', porque: '' },
    ] });
    expect(v).toHaveLength(1);
  });

  it('devolve o objeto completo do catálogo, não só o id', () => {
    const [primeiro] = valoresDoUsuario({ selecionados: ['coragem'] });
    expect(primeiro.nome).toBe('Coragem');
    expect(primeiro.emoji).toBeTruthy();
    expect(primeiro.categoria).toBe('ser');
  });
});

describe('prioridadeDoValor', () => {
  const valores = valoresDoUsuario({ selecionados: ['legado', 'amor', 'coragem'] });

  it('devolve 1 para o valor mais importante', () => {
    expect(prioridadeDoValor('legado', valores)).toBe(1);
  });

  it('devolve a posição correta para os demais', () => {
    expect(prioridadeDoValor('coragem', valores)).toBe(3);
  });

  it('devolve 0 para valor fora do ranking ou ausente', () => {
    expect(prioridadeDoValor('saude', valores)).toBe(0);
    expect(prioridadeDoValor(null, valores)).toBe(0);
    expect(prioridadeDoValor(undefined, valores)).toBe(0);
  });
});

describe('calcularAlinhamento', () => {
  const valores = valoresDoUsuario({ selecionados: ['amor', 'saude', 'legado'] });

  it('ignora objetivo em branco na contagem', () => {
    const a = calcularAlinhamento(
      [{ texto: '', valorId: 'amor' }, { texto: '   ', valorId: null }],
      valores,
    );
    expect(a.total).toBe(0);
  });

  it('separa alinhados de sem valor', () => {
    const a = calcularAlinhamento(
      [
        { texto: 'Correr uma meia maratona', valorId: 'saude' },
        { texto: 'Trocar de emprego',        valorId: null },
      ],
      valores,
    );
    expect(a.total).toBe(2);
    expect(a.alinhados).toBe(1);
    expect(a.semValor).toBe(1);
  });

  it('aponta os valores que nenhum objetivo serve — o dado mais útil', () => {
    const a = calcularAlinhamento(
      [{ texto: 'Correr uma meia maratona', valorId: 'saude' }],
      valores,
    );
    expect(a.naoServidos.map((v) => v.id)).toEqual(['amor', 'legado']);
  });

  it('não sobra nada quando todos os valores têm objetivo', () => {
    const a = calcularAlinhamento(
      [
        { texto: 'Jantar em família toda quarta', valorId: 'amor' },
        { texto: 'Correr uma meia maratona',      valorId: 'saude' },
        { texto: 'Escrever o livro',              valorId: 'legado' },
      ],
      valores,
    );
    expect(a.naoServidos).toEqual([]);
    expect(a.semValor).toBe(0);
  });

  it('lida com objetivo sem o campo valorId — respostas salvas antes desta funcionalidade', () => {
    const a = calcularAlinhamento([{ texto: 'Objetivo antigo' }], valores);
    expect(a.total).toBe(1);
    expect(a.semValor).toBe(1);
    expect(a.alinhados).toBe(0);
  });

  it('sem valores definidos, nada é apontado como não servido', () => {
    const a = calcularAlinhamento([{ texto: 'Algum objetivo', valorId: null }], []);
    expect(a.naoServidos).toEqual([]);
    expect(a.total).toBe(1);
  });
});

describe('catálogo', () => {
  it('não tem id repetido', () => {
    const ids = VALORES.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todo valor tem nome, emoji e categoria', () => {
    for (const v of VALORES) {
      expect(v.nome).toBeTruthy();
      expect(v.emoji).toBeTruthy();
      expect(v.categoria).toBeTruthy();
    }
  });

  it('getValor encontra pelo id e devolve undefined para id inválido', () => {
    expect(getValor('amor')?.nome).toBe('Amor');
    expect(getValor('nao-existe')).toBeUndefined();
  });
});
