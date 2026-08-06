import { describe, it, expect } from 'vitest';
import { analisarGatilho, montarPlano } from './planoSeEntao';

describe('especificidade do gatilho', () => {
  it('reconhece hora explícita', () => {
    expect(analisarGatilho('às 7h').temHora).toBe(true);
    expect(analisarGatilho('07:30').temHora).toBe(true);
    expect(analisarGatilho('antes de dormir').temHora).toBe(true);
    expect(analisarGatilho('de manhã').temHora).toBe(true);
  });

  it('reconhece lugar', () => {
    expect(analisarGatilho('na cozinha').temLugar).toBe(true);
    expect(analisarGatilho('no carro').temLugar).toBe(true);
    expect(analisarGatilho('no escritório').temLugar).toBe(true);
  });

  it('reconhece âncora comportamental', () => {
    expect(analisarGatilho('depois do almoço').temAncora).toBe(true);
    expect(analisarGatilho('assim que eu acordar').temAncora).toBe(true);
    expect(analisarGatilho('logo que eu chegar em casa').temAncora).toBe(true);
  });

  it('dois sinais ou mais é específico, e não recebe dica', () => {
    const a = analisarGatilho('às 7h na cozinha');
    expect(a.nivel).toBe('especifico');
    expect(a.dica).toBe('');
  });

  it('um sinal é razoável, e a dica pede justamente o que falta', () => {
    const soHora = analisarGatilho('às 7h');
    expect(soHora.nivel).toBe('razoavel');
    expect(soHora.dica).toMatch(/onde você vai estar/i);

    const soLugar = analisarGatilho('na academia');
    expect(soLugar.nivel).toBe('razoavel');
    expect(soLugar.dica).toMatch(/que horas|depois de qual/i);
  });

  it('gatilho sem âncora nenhuma é vago', () => {
    const a = analisarGatilho('amanhã em algum momento');
    expect(a.nivel).toBe('vago');
    expect(a.dica).toMatch(/momento reconhecível/i);
  });

  it('campo vazio não gera dica — não se cobra o que nem foi tentado', () => {
    expect(analisarGatilho('').dica).toBe('');
    expect(analisarGatilho('  ').dica).toBe('');
  });

  it('nenhuma dica repreende', () => {
    for (const g of ['', 'amanhã', 'às 7h', 'na academia', 'às 7h na cozinha']) {
      expect(analisarGatilho(g).dica).not.toMatch(/errad|ruim|fraco|falh|devia/i);
    }
  });
});

describe('montagem da frase', () => {
  it('monta no formato contingente', () => {
    expect(montarPlano('às 7h na cozinha', 'Escrever três palavras'))
      .toBe('Quando às 7h na cozinha, eu vou escrever três palavras');
  });

  it('não duplica o "quando" quando a pessoa já escreveu', () => {
    expect(montarPlano('quando eu sentar para o café', 'Ligar para o meu pai'))
      .toBe('Quando eu sentar para o café, eu vou ligar para o meu pai');
  });

  it('também limpa "assim que" e "logo que"', () => {
    expect(montarPlano('assim que eu acordar', 'Beber água')).toBe('Quando eu acordar, eu vou beber água');
    expect(montarPlano('logo que eu chegar', 'Abrir o diário')).toBe('Quando eu chegar, eu vou abrir o diário');
  });

  it('devolve null quando falta gatilho ou missão', () => {
    expect(montarPlano('', 'Fazer algo')).toBeNull();
    expect(montarPlano('às 7h', '')).toBeNull();
    expect(montarPlano('   ', '   ')).toBeNull();
  });
});
