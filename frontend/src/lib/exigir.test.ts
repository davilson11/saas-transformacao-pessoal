import { describe, it, expect } from 'vitest';
import { exigir, ErroDeConsulta } from './exigir';

describe('exigir', () => {
  it('devolve os dados quando não há erro', () => {
    expect(exigir({ data: [1, 2], error: null }, 'teste')).toEqual([1, 2]);
    expect(exigir({ data: { a: 1 }, error: null }, 'teste')).toEqual({ a: 1 });
  });

  it('lista vazia é sucesso, não erro', () => {
    expect(exigir({ data: [], error: null }, 'teste')).toEqual([]);
  });

  it('erro do Supabase vira exceção — o padrão antigo seguiria com null', () => {
    expect(() =>
      exigir({ data: null, error: { message: 'permission denied', code: '42501' } }, 'subscriptions'),
    ).toThrow(ErroDeConsulta);
  });

  it('a exceção diz de onde veio e o que foi', () => {
    try {
      exigir({ data: null, error: { message: 'relation does not exist', code: '42P01' } }, 'momento_kairos');
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(ErroDeConsulta);
      const err = e as ErroDeConsulta;
      expect(err.message).toBe('momento_kairos: relation does not exist');
      expect(err.contexto).toBe('momento_kairos');
      expect(err.codigo).toBe('42P01');
    }
  });

  it('erro tem prioridade mesmo se data vier junto', () => {
    expect(() =>
      exigir({ data: [1], error: { message: 'parcial' } }, 'x'),
    ).toThrow(/parcial/);
  });

  it('null sem erro: lança por padrão', () => {
    expect(() => exigir({ data: null, error: null }, 'x')).toThrow(/não devolveu dados/);
  });

  it('null sem erro: devolve o vazio se um for dado', () => {
    expect(exigir({ data: null, error: null }, 'x', [])).toEqual([]);
    expect(exigir({ data: null, error: null }, 'x', 0)).toBe(0);
  });
});
