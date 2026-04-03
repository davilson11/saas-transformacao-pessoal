'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { salvarVisaoAncora, buscarVisaoAncora } from '@/lib/queries';
import { useSupabaseClient } from '@/lib/useSupabaseClient';
import type { ReferenciaJson } from '@/lib/database.types';

// ─── Tokens de cor ────────────────────────────────────────────────────────────

const C = {
  bg:          '#0E0E0E',
  bgDark:      '#111111',
  bgCard:      '#1A1A1A',
  border:      'rgba(200,160,48,0.20)',
  borderGold:  'rgba(200,160,48,0.35)',
  gold:        '#C8A030',
  goldLight:   '#C8A030',
  goldBg:      'rgba(200,160,48,0.10)',
  cream:       '#F5F0E8',
  muted:       'rgba(245,240,232,0.50)',
  inputBg:     '#111111',
  inputBorder: 'rgba(200,160,48,0.30)',
  btnText:     '#0E0E0E',
};

// ─── Helpers de estilo ────────────────────────────────────────────────────────

const inputBase: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: C.inputBg,
  border: `1px solid ${C.inputBorder}`,
  borderRadius: 10,
  color: C.cream,
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 15,
  lineHeight: 1.6,
  padding: '11px 15px',
  outline: 'none',
  resize: 'vertical',
};

const labelBase: React.CSSProperties = {
  display: 'block',
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: C.muted,
  marginBottom: 8,
};

const card: React.CSSProperties = {
  background: C.bgCard,
  border: `1px solid ${C.border}`,
  borderRadius: 16,
  padding: 28,
};

const goldCard: React.CSSProperties = {
  background: C.goldBg,
  border: `1.5px solid ${C.borderGold}`,
  borderRadius: 16,
  padding: 28,
};

const sectionDivider: React.CSSProperties = {
  padding: '64px 0',
  borderBottom: `1px solid ${C.border}`,
};

// ─── Config das seções ────────────────────────────────────────────────────────

type PedidoConfig = {
  campo: 'pedido1' | 'pedido2' | 'pedido3';
  num: string;
  titulo: string;
  placeholder: string;
};

const PEDIDOS: PedidoConfig[] = [
  { campo: 'pedido1', num: '01', titulo: 'Primeiro Pedido',  placeholder: 'Se não houvesse limites...' },
  { campo: 'pedido2', num: '02', titulo: 'Segundo Pedido',   placeholder: 'O que mudaria imediatamente...' },
  { campo: 'pedido3', num: '03', titulo: 'Terceiro Pedido',  placeholder: 'O que você guardaria só para si...' },
];

type RefKeys = {
  nome:   'ref1nome' | 'ref2nome' | 'ref3nome' | 'ref4nome';
  area:   'ref1area' | 'ref2area' | 'ref3area' | 'ref4area';
  admiro: 'ref1admiro' | 'ref2admiro' | 'ref3admiro' | 'ref4admiro';
};

const REFS: RefKeys[] = [
  { nome: 'ref1nome', area: 'ref1area', admiro: 'ref1admiro' },
  { nome: 'ref2nome', area: 'ref2area', admiro: 'ref2admiro' },
  { nome: 'ref3nome', area: 'ref3area', admiro: 'ref3admiro' },
  { nome: 'ref4nome', area: 'ref4area', admiro: 'ref4admiro' },
];

type MoveConfig = {
  campo: 'tiraSono' | 'daEnergia' | 'fariaDeGraca' | 'mundoPerderia';
  emoji: string;
  titulo: string;
  placeholder: string;
};

const MOVE: MoveConfig[] = [
  { campo: 'tiraSono',     emoji: '🌙', titulo: 'O que me tira o sono?',               placeholder: 'Preocupações, sonhos, ideias que não saem da cabeça...' },
  { campo: 'daEnergia',    emoji: '⚡', titulo: 'O que me dá energia instantânea?',    placeholder: 'Atividades, pessoas, assuntos que me energizam...' },
  { campo: 'fariaDeGraca', emoji: '🎯', titulo: 'O que eu faria de graça para sempre?', placeholder: 'Se dinheiro não fosse problema...' },
  { campo: 'mundoPerderia',emoji: '🌍', titulo: 'O que o mundo perderia sem mim?',     placeholder: 'O que você traz de único para as pessoas ao seu redor...' },
];

// ─── Estado ───────────────────────────────────────────────────────────────────

type Estado = {
  manchete: string;
  areaReferencia: string;
  obstaculoSuperado: string;
  pedido1: string;
  pedido2: string;
  pedido3: string;
  ref1nome: string; ref1area: string; ref1admiro: string;
  ref2nome: string; ref2area: string; ref2admiro: string;
  ref3nome: string; ref3area: string; ref3admiro: string;
  ref4nome: string; ref4area: string; ref4admiro: string;
  tiraSono: string;
  daEnergia: string;
  fariaDeGraca: string;
  mundoPerderia: string;
  declaracao: string;
};

const INICIAL: Estado = {
  manchete: '', areaReferencia: '', obstaculoSuperado: '',
  pedido1: '', pedido2: '', pedido3: '',
  ref1nome: '', ref1area: '', ref1admiro: '',
  ref2nome: '', ref2area: '', ref2admiro: '',
  ref3nome: '', ref3area: '', ref3admiro: '',
  ref4nome: '', ref4area: '', ref4admiro: '',
  tiraSono: '', daEnergia: '', fariaDeGraca: '', mundoPerderia: '',
  declaracao: '',
};

// ─── Sub-componente: cabeçalho de seção ──────────────────────────────────────

function SecHeader({ num, titulo, sub }: { num: string; titulo: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <span style={{
        fontFamily: '"DM Mono", monospace',
        fontSize: 11, fontWeight: 700,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: C.goldLight,
      }}>
        {num}
      </span>
      <h2 style={{
        fontFamily: '"Instrument Serif", Georgia, serif',
        fontStyle: 'italic',
        fontSize: 'clamp(24px, 3vw, 34px)',
        fontWeight: 400,
        color: C.cream,
        lineHeight: 1.2,
        margin: '8px 0 0',
        letterSpacing: '-0.01em',
      }}>
        {titulo}
      </h2>
      {sub && (
        <p style={{
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSize: 14, color: C.muted,
          marginTop: 10, lineHeight: 1.65,
        }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function VisaoAncoraPage() {
  const [s, setS] = useState<Estado>(INICIAL);
  const [gerado, setGerado] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const { user } = useUser();
  const { getClient } = useSupabaseClient();

  // ── Carregar dados salvos ao montar ──────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const client = await getClient();
      const data = await buscarVisaoAncora(user.id, client);
      if (!data) return;
      const refs = Array.isArray(data.referencias)
        ? (data.referencias as ReferenciaJson[])
        : [{} as ReferenciaJson, {} as ReferenciaJson, {} as ReferenciaJson, {} as ReferenciaJson];
      const r = (i: number) => refs[i] ?? ({} as ReferenciaJson);
      setS({
        manchete:          data.manchete,
        areaReferencia:    data.area_referencia,
        obstaculoSuperado: data.obstaculo,
        pedido1:           data.pedido1,
        pedido2:           data.pedido2,
        pedido3:           data.pedido3,
        ref1nome:  r(0).nome   ?? '', ref1area:  r(0).area   ?? '', ref1admiro: r(0).admiro ?? '',
        ref2nome:  r(1).nome   ?? '', ref2area:  r(1).area   ?? '', ref2admiro: r(1).admiro ?? '',
        ref3nome:  r(2).nome   ?? '', ref3area:  r(2).area   ?? '', ref3admiro: r(2).admiro ?? '',
        ref4nome:  r(3).nome   ?? '', ref4area:  r(3).area   ?? '', ref4admiro: r(3).admiro ?? '',
        tiraSono:      data.tira_sono,
        daEnergia:     data.da_energia,
        fariaDeGraca:  data.faria_graca,
        mundoPerderia: data.mundo_perderia,
        declaracao:    data.declaracao,
      });
    })();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Gerar e salvar ────────────────────────────────────────────────────────
  async function handleGerar() {
    setSaveStatus('saving');
    if (user?.id) {
      const client = await getClient();
      await salvarVisaoAncora(
        user.id,
        {
          manchete:       s.manchete,
          area_referencia: s.areaReferencia,
          obstaculo:       s.obstaculoSuperado,
          pedido1:         s.pedido1,
          pedido2:         s.pedido2,
          pedido3:         s.pedido3,
          referencias: [
            { nome: s.ref1nome, area: s.ref1area, admiro: s.ref1admiro },
            { nome: s.ref2nome, area: s.ref2area, admiro: s.ref2admiro },
            { nome: s.ref3nome, area: s.ref3area, admiro: s.ref3admiro },
            { nome: s.ref4nome, area: s.ref4area, admiro: s.ref4admiro },
          ],
          tira_sono:      s.tiraSono,
          da_energia:     s.daEnergia,
          faria_graca:    s.fariaDeGraca,
          mundo_perderia: s.mundoPerderia,
          declaracao:     s.declaracao,
          financas:       '',
          como_vive:      '',
        },
        client
      );
    }
    setSaveStatus('saved');
    setGerado(true);
  }

  const set = (k: keyof Estado) =>
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
      setS(prev => ({ ...prev, [k]: e.target.value }));

  function downloadHTML() {
    const pedidosHTML = PEDIDOS
      .map(p => s[p.campo])
      .filter(Boolean)
      .map((texto, i) => `<div class="card"><p class="label">Pedido ${i + 1}</p><p class="body">${texto}</p></div>`)
      .join('');

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Minha Visão Âncora — A Virada</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#0E0E0E;color:#F5F0E8;font-family:Georgia,serif;max-width:760px;margin:0 auto;padding:60px 32px}
  .eyebrow{font-family:monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:rgba(245,244,240,.5);margin-bottom:16px}
  h1{font-style:italic;font-size:clamp(28px,5vw,46px);font-weight:400;line-height:1.2;color:#f5f4f0;margin-bottom:12px}
  .gold{color:#C8A030}
  hr{border:none;border-top:1px solid rgba(232,184,75,.25);margin:36px 0}
  .label{font-family:monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:rgba(245,244,240,.45);margin-bottom:10px}
  .card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:22px;margin-bottom:16px}
  .gold-card{background:rgba(200,160,48,.10);border:1.5px solid rgba(200,160,48,.35);border-radius:12px;padding:24px;margin-bottom:16px}
  .body{font-size:15px;line-height:1.7;color:rgba(245,244,240,.8)}
  .italic{font-style:italic;font-size:18px;line-height:1.6;color:#f5f4f0}
  .footer{text-align:center;margin-top:48px;font-size:12px;color:rgba(245,244,240,.3)}
</style>
</head>
<body>
<p class="eyebrow">A Virada · Ferramenta F00</p>
<h1 class="gold">Minha<br>Visão Âncora</h1>
<hr>
${s.manchete ? `<div class="gold-card"><p class="label">Manchete da Forbes</p><p class="italic">&ldquo;${s.manchete}&rdquo;</p></div>` : ''}
${s.declaracao ? `<div class="gold-card"><p class="label">Declaração de Vida</p><p class="italic">${s.declaracao}</p></div>` : ''}
${pedidosHTML ? `<hr><p class="eyebrow">Os 3 Pedidos do Gênio</p>${pedidosHTML}` : ''}
${s.tiraSono || s.daEnergia || s.fariaDeGraca || s.mundoPerderia ? `<hr><p class="eyebrow">O que me Move</p>${[
  ['O que me tira o sono', s.tiraSono],
  ['O que me dá energia', s.daEnergia],
  ['O que faria de graça', s.fariaDeGraca],
  ['O que o mundo perderia', s.mundoPerderia],
].filter(([, v]) => v).map(([t, v]) => `<div class="card"><p class="label">${t}</p><p class="body">${v}</p></div>`).join('')}` : ''}
<p class="footer">Gerado em ${new Date().toLocaleDateString('pt-BR')} · A Virada</p>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'visao-ancora.html';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '"Inter", system-ui, sans-serif' }}>

      {/* ── TOPBAR ──────────────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: C.bgDark,
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: 56,
      }}>
        <span style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontStyle: 'italic', fontSize: 20, fontWeight: 400,
          color: C.cream, letterSpacing: '-0.01em',
        }}>
          A Virada
        </span>
        <span style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: 11, fontWeight: 700,
          color: C.goldLight,
          background: C.goldBg,
          border: `1px solid ${C.borderGold}`,
          borderRadius: 99,
          padding: '4px 14px',
          letterSpacing: '0.07em',
        }}>
          F00 · Visão Âncora
        </span>
      </header>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 96px' }}>

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto', paddingTop: 72, paddingBottom: 72 }}>
          <span style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: C.muted,
          }}>
            Ferramenta de Fundação
          </span>

          {/* Linha dourada decorativa */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '20px auto 28px', maxWidth: 300 }}>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${C.goldLight})` }} />
            <span style={{ color: C.goldLight, fontSize: 14 }}>◆</span>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${C.goldLight})` }} />
          </div>

          <h1 style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontStyle: 'italic',
            fontSize: 'clamp(28px, 4vw, 46px)',
            fontWeight: 400,
            color: C.cream,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            margin: '0 0 24px',
          }}>
            Antes de qualquer ferramenta, você precisa saber o seu porquê.
          </h1>

          <p style={{ fontSize: 16, color: 'rgba(245,244,240,0.68)', lineHeight: 1.75, marginBottom: 28 }}>
            A Visão Âncora é o documento mais importante da sua jornada. Ele ancora todas as suas decisões, mantém você nos trilhos nos momentos difíceis e reacende a chama quando a motivação diminui.
          </p>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: C.goldBg, border: `1px solid ${C.borderGold}`,
            borderRadius: 99, padding: '9px 22px',
          }}>
            <span style={{ fontSize: 15 }}>⏱</span>
            <span style={{ fontFamily: '"Inter", system-ui', fontSize: 13, fontWeight: 600, color: C.goldLight }}>
              Reserve 60 minutos — sem interrupções, apenas você e suas respostas.
            </span>
          </div>
        </div>

        {/* ── SEÇÃO 01 — Capa da Forbes ─────────────────────────────────── */}
        <div style={sectionDivider}>
          <SecHeader
            num="01"
            titulo="A Capa da Forbes"
            sub="Imagine que você está na capa da Forbes daqui a 12 meses. Qual seria a manchete sobre sua conquista? Escreva como se já tivesse acontecido."
          />

          <div style={goldCard}>
            <label style={{ ...labelBase, color: C.goldLight }}>
              Manchete da matéria
            </label>
            <textarea
              value={s.manchete}
              onChange={set('manchete')}
              placeholder="Ex: 'Como [Seu Nome] transformou sua vida em 12 meses e hoje inspira milhares de pessoas...'"
              rows={4}
              style={{
                ...inputBase,
                fontFamily: '"Instrument Serif", Georgia, serif',
                fontStyle: 'italic',
                fontSize: 20,
                lineHeight: 1.5,
                background: '#0a0a0a',
                border: `1px solid ${C.borderGold}`,
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
            <div>
              <label style={labelBase}>Área de maior conquista</label>
              <input
                value={s.areaReferencia}
                onChange={set('areaReferencia')}
                placeholder="Ex: Carreira, Finanças, Saúde..."
                style={{ ...inputBase, resize: 'none' }}
              />
            </div>
            <div>
              <label style={labelBase}>Obstáculo que superou</label>
              <input
                value={s.obstaculoSuperado}
                onChange={set('obstaculoSuperado')}
                placeholder="Ex: Medo de arriscar, dívidas..."
                style={{ ...inputBase, resize: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* ── SEÇÃO 02 — 3 Pedidos do Gênio ────────────────────────────── */}
        <div style={sectionDivider}>
          <SecHeader
            num="02"
            titulo="Os 3 Pedidos do Gênio"
            sub="Um gênio aparece e concede 3 pedidos para transformar sua vida. Sem limites. Sem julgamentos. O que você pediria?"
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {PEDIDOS.map(({ campo, num, titulo, placeholder }) => (
              <div key={campo} style={card}>
                <div style={{
                  fontFamily: '"Instrument Serif", Georgia, serif',
                  fontSize: 52, fontWeight: 400,
                  color: C.goldLight,
                  lineHeight: 1,
                  marginBottom: 14,
                  opacity: 0.65,
                }}>
                  {num}
                </div>
                <label style={labelBase}>{titulo}</label>
                <textarea
                  value={s[campo]}
                  onChange={set(campo)}
                  placeholder={placeholder}
                  rows={5}
                  style={inputBase}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── SEÇÃO 03 — Referências ────────────────────────────────────── */}
        <div style={sectionDivider}>
          <SecHeader
            num="03"
            titulo="Suas Referências Vivas"
            sub="Quem são as 4 pessoas — vivas ou históricas — que representam quem você quer se tornar? O que elas têm que você admira?"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {REFS.map(({ nome, area, admiro }, i) => (
              <div key={i} style={card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: C.goldBg, border: `1px solid ${C.borderGold}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{
                      fontFamily: '"Instrument Serif", Georgia, serif',
                      fontSize: 14, color: C.goldLight, fontWeight: 700,
                    }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                  </div>
                  <span style={{ ...labelBase, margin: 0 }}>Referência {i + 1}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={labelBase}>Nome</label>
                    <input value={s[nome]} onChange={set(nome)} placeholder="Nome da pessoa" style={{ ...inputBase, resize: 'none' }} />
                  </div>
                  <div>
                    <label style={labelBase}>Área de excelência</label>
                    <input value={s[area]} onChange={set(area)} placeholder="Ex: Liderança, Criatividade..." style={{ ...inputBase, resize: 'none' }} />
                  </div>
                  <div>
                    <label style={labelBase}>O que admiro nela</label>
                    <textarea value={s[admiro]} onChange={set(admiro)} placeholder="Qualidades, conquistas, forma de ser..." rows={3} style={inputBase} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SEÇÃO 04 — O que me Move ──────────────────────────────────── */}
        <div style={sectionDivider}>
          <SecHeader
            num="04"
            titulo="O que me Move"
            sub="Estas 4 perguntas revelam seus combustíveis internos — os motores que sustentarão sua jornada de 12 meses."
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {MOVE.map(({ campo, emoji, titulo, placeholder }) => (
              <div key={campo} style={card}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{emoji}</div>
                <label style={labelBase}>{titulo}</label>
                <textarea
                  value={s[campo]}
                  onChange={set(campo)}
                  placeholder={placeholder}
                  rows={5}
                  style={inputBase}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── SEÇÃO 05 — Declaração de Vida ─────────────────────────────── */}
        <div style={{ ...sectionDivider, borderBottom: 'none' }}>
          <SecHeader
            num="05"
            titulo="Declaração de Vida"
            sub="Junte tudo o que descobriu e escreva sua declaração pessoal. Ela é sua bússola para os próximos 12 meses. Escreva na primeira pessoa, no tempo presente, como se já fosse verdade."
          />

          <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
            <div style={{
              background: '#141414',
              border: `1.5px solid ${C.borderGold}`,
              borderRadius: 20,
              padding: '36px 40px',
            }}>
              <span style={{
                fontFamily: '"Instrument Serif", Georgia, serif',
                fontStyle: 'italic',
                fontSize: 17,
                color: C.goldLight,
                display: 'block',
                marginBottom: 22,
              }}>
                Eu declaro que...
              </span>
              <textarea
                value={s.declaracao}
                onChange={set('declaracao')}
                placeholder="Escreva sua declaração de vida aqui. O que você está comprometido a ser, fazer e ter nos próximos 12 meses. Seja ousado. Seja honesto. Seja específico..."
                rows={8}
                style={{
                  ...inputBase,
                  fontFamily: '"Instrument Serif", Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: 19,
                  lineHeight: 1.7,
                  textAlign: 'center',
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  resize: 'none',
                  color: C.cream,
                }}
              />
            </div>
          </div>
        </div>

        {/* ── BOTÃO FINAL ───────────────────────────────────────────────── */}
        {!gerado && (
          <div style={{ textAlign: 'center', paddingTop: 56 }}>
            <p style={{ fontSize: 14, color: C.muted, marginBottom: 20 }}>
              Quando terminar de preencher todas as seções, clique para gerar e salvar sua Visão Âncora.
            </p>
            <button
              onClick={handleGerar}
              disabled={saveStatus === 'saving'}
              style={{
                fontFamily: '"Inter", system-ui, sans-serif',
                fontSize: 16, fontWeight: 700,
                color: '#0E0E0E',
                background: C.gold,
                border: 'none',
                borderRadius: 14,
                padding: '18px 44px',
                cursor: saveStatus === 'saving' ? 'wait' : 'pointer',
                boxShadow: '0 4px 28px rgba(200,160,48,0.35)',
                letterSpacing: '0.01em',
                opacity: saveStatus === 'saving' ? 0.75 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              {saveStatus === 'saving' ? 'Salvando…' : 'Gerar minha Visão Âncora →'}
            </button>
            {saveStatus === 'error' && (
              <p style={{ fontSize: 13, color: '#f87171', marginTop: 12 }}>
                Erro ao salvar. Sua visão será exibida mesmo assim.
              </p>
            )}
          </div>
        )}

        {/* ── RESUMO GERADO ─────────────────────────────────────────────── */}
        {gerado && (
          <div style={{
            marginTop: 56,
            background: '#1A1A1A',
            border: `2px solid ${C.goldLight}`,
            borderRadius: 24,
            padding: '52px 48px',
            textAlign: 'center',
          }}>
            {/* Header do resumo */}
            <span style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: 11, fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: C.goldLight,
            }}>
              Sua Visão Âncora
            </span>
            <div style={{ margin: '20px auto', height: 1, maxWidth: 400, background: `linear-gradient(to right, transparent, ${C.goldLight}, transparent)` }} />

            {/* Manchete */}
            {s.manchete && (
              <div style={{ marginBottom: 44 }}>
                <p style={{ ...labelBase, display: 'block', marginBottom: 16, textAlign: 'center' }}>
                  Manchete da Forbes
                </p>
                <blockquote style={{
                  fontFamily: '"Instrument Serif", Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: 'clamp(22px, 3vw, 32px)',
                  fontWeight: 400,
                  color: C.cream,
                  lineHeight: 1.3,
                  margin: 0,
                  padding: 0,
                  border: 'none',
                }}>
                  &ldquo;{s.manchete}&rdquo;
                </blockquote>
              </div>
            )}

            {/* Declaração */}
            {s.declaracao && (
              <div style={{ marginBottom: 44, maxWidth: 620, margin: '0 auto 44px' }}>
                <p style={{ ...labelBase, display: 'block', marginBottom: 16, textAlign: 'center' }}>
                  Declaração de Vida
                </p>
                <p style={{
                  fontFamily: '"Instrument Serif", Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: 'clamp(17px, 2vw, 22px)',
                  color: 'rgba(245,244,240,0.85)',
                  lineHeight: 1.75,
                }}>
                  {s.declaracao}
                </p>
              </div>
            )}

            {/* Linha dourada */}
            <div style={{ margin: '32px auto', height: 1, maxWidth: 300, background: `linear-gradient(to right, transparent, ${C.goldLight}, transparent)` }} />

            {/* Botões */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={downloadHTML}
                style={{
                  fontFamily: '"Inter", system-ui',
                  fontSize: 14, fontWeight: 600,
                  color: '#0E0E0E',
                  background: C.gold,
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 28px',
                  cursor: 'pointer',
                }}
              >
                ⬇ Baixar como HTML
              </button>
              <button
                onClick={() => setGerado(false)}
                style={{
                  fontFamily: '"Inter", system-ui',
                  fontSize: 14, fontWeight: 600,
                  color: C.cream,
                  background: 'rgba(255,255,255,0.07)',
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  padding: '12px 28px',
                  cursor: 'pointer',
                }}
              >
                ← Editar respostas
              </button>
            </div>

            {/* Ir para o Dashboard */}
            <div style={{ marginTop: 16 }}>
              <Link
                href="/dashboard"
                style={{
                  display: 'inline-block',
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#0E0E0E',
                  background: C.gold,
                  borderRadius: 12,
                  padding: '13px 32px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 20px rgba(200,160,48,0.30)',
                  letterSpacing: '0.01em',
                }}
              >
                Ir para o Dashboard →
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
