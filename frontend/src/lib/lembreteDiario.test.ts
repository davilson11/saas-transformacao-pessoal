import { describe, it, expect } from 'vitest';
import { estadoJornada } from './jornada';
import { recortar, montarLembrete } from './lembreteDiario';

describe('recortar', () => {
  it('devolve o texto inteiro quando cabe', () => {
    expect(recortar('Curto demais')).toBe('Curto demais');
  });

  it('não quebra palavra ao meio', () => {
    const t = recortar('a'.repeat(50) + ' palavradepoisdocorte', 55);
    expect(t).toBe('a'.repeat(50) + '…');
  });

  it('normaliza espaços e quebras de linha', () => {
    expect(recortar('uma\n  frase   com\tespaços')).toBe('uma frase com espaços');
  });

  it('não deixa pontuação solta antes das reticências', () => {
    const t = recortar('Palavra uma, ' + 'b'.repeat(200), 13);
    expect(t).toBe('Palavra uma…');
  });

  it('aguenta vazio', () => {
    expect(recortar('')).toBe('');
  });
});

describe('montar o lembrete', () => {
  const estado = estadoJornada(12)!;

  it('o título carrega o dia e o tema do mês', () => {
    const l = montarLembrete(estado, 'Qualquer texto');
    expect(l.title).toBe('Dia 12 · Quem sou eu?');
  });

  it('o corpo é um trecho da voz do dia, não um aviso sobre o app', () => {
    const l = montarLembrete(estado, 'Há uma pergunta que você evita há anos.');
    expect(l.body).toBe('Há uma pergunta que você evita há anos.');
  });

  it('sem conteúdo, ainda existe mensagem', () => {
    expect(montarLembrete(estado, null).body).toBeTruthy();
    expect(montarLembrete(estado, '   ').body).toBeTruthy();
  });

  it('leva para o momento', () => {
    expect(montarLembrete(estado, 'x').url).toBe('/momento');
  });

  it('nenhuma variação cobra ou culpa', () => {
    const casos = [null, '', 'Texto normal do dia.'];
    for (const c of casos) {
      const l = montarLembrete(estado, c);
      expect(`${l.title} ${l.body}`).not.toMatch(/não registrou|ainda não|esqueceu|falh|atras|perdeu/i);
    }
  });

  it('o título muda com o mês, então não vira texto fixo', () => {
    const a = montarLembrete(estadoJornada(12)!, 'x').title;
    const b = montarLembrete(estadoJornada(200)!, 'x').title;
    expect(a).not.toBe(b);
  });
});
