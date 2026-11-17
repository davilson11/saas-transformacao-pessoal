import { describe, it, expect } from 'vitest';
import { interpretarInscricao, classificarFalha, mensagemDaFalha } from './inscricaoPush';

describe('interpretar a resposta do servidor', () => {
  it('2xx é sucesso, com ou sem corpo', () => {
    expect(interpretarInscricao(200, { ok: true })).toEqual({ estado: 'granted' });
    expect(interpretarInscricao(201, null)).toEqual({ estado: 'granted' });
  });

  it('500 NÃO vira sucesso — era o bug do botão verde', () => {
    const r = interpretarInscricao(500, { error: 'constraint violada' });
    expect(r.estado).toBe('erro');
    if (r.estado === 'erro') expect(r.mensagem).toContain('constraint violada');
  });

  it('500 sem corpo legível ainda produz mensagem para a pessoa', () => {
    const r = interpretarInscricao(500, null);
    expect(r.estado).toBe('erro');
    if (r.estado === 'erro') expect(r.mensagem).toMatch(/servidor/i);
  });

  it('401 fala de sessão, não de navegador', () => {
    const r = interpretarInscricao(401, { error: 'Não autenticado.' });
    expect(r.estado).toBe('erro');
    if (r.estado === 'erro') {
      expect(r.mensagem).toMatch(/sessão/i);
      expect(r.mensagem).not.toMatch(/navegador|configura/i);
    }
  });

  it('400 usa o detalhe do servidor quando existe', () => {
    const r = interpretarInscricao(400, { error: 'Subscription inválida.' });
    if (r.estado === 'erro') expect(r.mensagem).toBe('Subscription inválida.');
  });

  it('nenhuma mensagem de erro de servidor manda mexer nos ajustes do navegador', () => {
    // Era a confusão do Onboarding: qualquer falha virava "bloqueado no navegador".
    for (const status of [400, 403, 500, 502, 503]) {
      const r = interpretarInscricao(status, null);
      if (r.estado === 'erro') expect(r.mensagem).not.toMatch(/ajustes do navegador|bloquead/i);
    }
  });
});

describe('classificar a exceção', () => {
  const erro = (name: string, message = '') => Object.assign(new Error(message), { name });

  it('permissão negada pelo navegador', () => {
    expect(classificarFalha(erro('NotAllowedError'))).toBe('permissao');
    expect(classificarFalha(new Error('Registration failed - permission denied'))).toBe('permissao');
  });

  it('chave VAPID ausente ou trocada', () => {
    expect(classificarFalha(erro('InvalidStateError'))).toBe('chave');
    expect(classificarFalha(new Error('applicationServerKey is not valid'))).toBe('chave');
  });

  it('rede fora', () => {
    expect(classificarFalha(erro('TypeError', 'Failed to fetch'))).toBe('rede');
  });

  it('o resto é navegador, inclusive lixo', () => {
    expect(classificarFalha(new Error('qualquer coisa'))).toBe('navegador');
    expect(classificarFalha(null)).toBe('navegador');
    expect(classificarFalha('string solta')).toBe('navegador');
  });

  it('cada origem tem uma mensagem diferente e nenhuma está vazia', () => {
    const msgs = (['permissao', 'chave', 'navegador', 'rede'] as const).map(mensagemDaFalha);
    expect(new Set(msgs).size).toBe(4);
    for (const m of msgs) expect(m.length).toBeGreaterThan(10);
  });
});
