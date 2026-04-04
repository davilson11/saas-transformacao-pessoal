'use client';

import { useState, useEffect } from 'react';
import FerramentaLayout from '@/components/dashboard/FerramentaLayout';
import { useCarregarRespostas } from '@/lib/useCarregarRespostas';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Passo = 0 | 1 | 2 | 3;

type Valor = {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  emoji: string;
};

type ValorRankeado = {
  id: string;
  porque: string;
};

type CodigoConduta = {
  naoTolero: string;
  sobPressao: string;
  compromisso: string;
};

// ─── Dados ────────────────────────────────────────────────────────────────────

const CATEGORIAS: { id: string; label: string; cor: string; emoji: string }[] = [
  { id: 'ser',        label: 'Ser',        cor: '#4a8c6a', emoji: '🪞' },
  { id: 'fazer',      label: 'Fazer',      cor: '#5a7abf', emoji: '⚡' },
  { id: 'ter',        label: 'Ter',        cor: '#d4905a', emoji: '🌿' },
  { id: 'relacionar', label: 'Relacionar', cor: '#9b6baf', emoji: '🤝' },
  { id: 'crescer',    label: 'Crescer',    cor: '#27AE60', emoji: '📈' },
];

const VALORES: Valor[] = [
  { id: 'autenticidade', nome: 'Autenticidade', descricao: 'Ser fiel a si mesmo em tudo',         categoria: 'ser',        emoji: '🪞' },
  { id: 'coragem',       nome: 'Coragem',       descricao: 'Agir com bravura apesar do medo',     categoria: 'ser',        emoji: '🦁' },
  { id: 'integridade',   nome: 'Integridade',   descricao: 'Coerência entre fala e ação',         categoria: 'ser',        emoji: '⚖️' },
  { id: 'serenidade',    nome: 'Serenidade',    descricao: 'Paz interior em qualquer situação',   categoria: 'ser',        emoji: '🧘' },
  { id: 'excelencia',    nome: 'Excelência',    descricao: 'Dar o melhor em tudo que faz',        categoria: 'fazer',      emoji: '🏆' },
  { id: 'criatividade',  nome: 'Criatividade',  descricao: 'Criar e inovar constantemente',       categoria: 'fazer',      emoji: '🎨' },
  { id: 'impacto',       nome: 'Impacto',       descricao: 'Fazer a diferença na vida dos outros',categoria: 'fazer',      emoji: '💥' },
  { id: 'disciplina',    nome: 'Disciplina',    descricao: 'Consistência nas ações diárias',      categoria: 'fazer',      emoji: '⚡' },
  { id: 'liberdade',     nome: 'Liberdade',     descricao: 'Autonomia sobre a própria vida',      categoria: 'ter',        emoji: '🦅' },
  { id: 'seguranca',     nome: 'Segurança',     descricao: 'Estabilidade e previsibilidade',      categoria: 'ter',        emoji: '🛡️' },
  { id: 'abundancia',    nome: 'Abundância',    descricao: 'Prosperidade em todas as formas',     categoria: 'ter',        emoji: '🌿' },
  { id: 'saude',         nome: 'Saúde',         descricao: 'Corpo e mente em pleno equilíbrio',   categoria: 'ter',        emoji: '💚' },
  { id: 'amor',          nome: 'Amor',          descricao: 'Conexão profunda com quem importa',   categoria: 'relacionar', emoji: '❤️' },
  { id: 'lealdade',      nome: 'Lealdade',      descricao: 'Fidelidade às pessoas e causas',      categoria: 'relacionar', emoji: '🤝' },
  { id: 'empatia',       nome: 'Empatia',       descricao: 'Compreender o outro profundamente',   categoria: 'relacionar', emoji: '💙' },
  { id: 'pertencimento', nome: 'Pertencimento', descricao: 'Sentir que faz parte de algo maior',  categoria: 'relacionar', emoji: '🏡' },
  { id: 'aprendizado',   nome: 'Aprendizado',   descricao: 'Evoluir e aprender constantemente',   categoria: 'crescer',    emoji: '📚' },
  { id: 'proposito',     nome: 'Propósito',     descricao: 'Viver com sentido e direção claros',  categoria: 'crescer',    emoji: '🧭' },
  { id: 'aventura',      nome: 'Aventura',      descricao: 'Explorar o novo e desconhecido',      categoria: 'crescer',    emoji: '🗺️' },
  { id: 'legado',        nome: 'Legado',        descricao: 'Deixar algo que dure além de mim',    categoria: 'crescer',    emoji: '🌳' },
];

const MAX = 5;

const ETAPAS = [
  { label: 'Bem-vindo',             descricao: 'Introdução à ferramenta' },
  { label: 'Selecione Valores',     descricao: 'Escolha seus 5 essenciais' },
  { label: 'Ordene e Justifique',   descricao: 'Ranqueie e reflita' },
  { label: 'Código de Conduta',     descricao: 'Crie suas regras de vida' },
];

const INSTRUCOES = [
  {
    titulo: 'Bem-vindo à Bússola de Valores',
    corpo: [
      'Valores são os princípios inegociáveis que guiam suas decisões — mesmo quando ninguém está olhando. São o seu sistema operacional interno.',
      'Quando você age alinhado aos seus valores, sente energia e propósito. Quando age contra eles, sente vazio e culpa.',
      'Nesta ferramenta você vai identificar seus 5 valores mais essenciais e transformá-los em um Código de Conduta pessoal.',
    ],
    dica: '💡 Não escolha os valores que "deveria" ter — escolha os que realmente movem você.',
  },
  {
    titulo: 'Como escolher seus valores',
    corpo: [
      'Clique nos valores que mais ressoam com quem você é — não com quem você quer ser no futuro.',
      'Você pode selecionar até 5. Se quiser trocar, clique novamente para desmarcar.',
      'Pense em momentos em que se sentiu mais vivo e realizado. Quais desses valores estavam presentes?',
    ],
    dica: '💡 Se dois valores parecem iguais para você, escolha o que te custaria mais abandonar.',
  },
  {
    titulo: 'Por que ranquear importa',
    corpo: [
      'Quando dois valores entram em conflito, qual vence? A ordem do ranking revela sua hierarquia real.',
      'Para cada valor, escreva por que ele é inegociável para você. Justificativas vagas = valores que não são realmente seus.',
      'Use os botões ↑↓ para reorganizar a prioridade até a ordem sentir certa.',
    ],
    dica: '💡 Imagine que você terá que sacrificar todos, exceto o primeiro da lista. Qual fica?',
  },
  {
    titulo: 'Seu Código de Conduta',
    corpo: [
      'Um Código de Conduta transforma valores abstratos em regras práticas e concretas para o dia a dia.',
      'Responda as 3 perguntas com honestidade. Estas respostas são sua bússola — leia-as quando tiver dúvidas.',
      'Salve este código em algum lugar visível: agenda, celular ou um post-it na mesa.',
    ],
    dica: '💡 Revise seu Código a cada 3 meses. Valores evoluem conforme você cresce.',
  },
];

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function ValorCard({ valor, selecionado, desabilitado, onToggle, corCategoria }: {
  valor: Valor;
  selecionado: boolean;
  desabilitado: boolean;
  onToggle: () => void;
  corCategoria: string;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={desabilitado && !selecionado}
      className="text-left rounded-xl p-3 transition-all duration-200 flex items-start gap-3"
      style={{
        background: selecionado ? `${corCategoria}15` : '#fff',
        border: `1.5px solid ${selecionado ? corCategoria : 'var(--color-brand-border)'}`,
        boxShadow: selecionado ? `0 2px 12px ${corCategoria}22` : 'none',
        opacity: desabilitado && !selecionado ? 0.4 : 1,
        cursor: desabilitado && !selecionado ? 'not-allowed' : 'pointer',
      }}
    >
      <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{valor.emoji}</span>
      <div className="min-w-0">
        <p style={{ fontSize: 15, fontWeight: 600, color: selecionado ? corCategoria : 'var(--color-brand-dark-green)', fontFamily: 'var(--font-body)', lineHeight: 1.2 }}>
          {valor.nome}
        </p>
        <p style={{ fontSize: 13, color: 'var(--color-brand-gray)', marginTop: 2, lineHeight: 1.4 }}>
          {valor.descricao}
        </p>
      </div>
      {selecionado && (
        <div className="flex-shrink-0 flex items-center justify-center rounded-full ml-auto" style={{ width: 18, height: 18, background: corCategoria, marginTop: 2 }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5l2.5 2.5 4.5-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </button>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function BussolaValoresPage() {
  const [passo, setPasso] = useState<Passo>(0);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [ranking, setRanking] = useState<ValorRankeado[]>([]);

  const { dados: dadosSalvos } = useCarregarRespostas("bussola-valores");
  useEffect(() => { if (!dadosSalvos) return; if ((dadosSalvos as any).selecionados) setSelecionados((dadosSalvos as any).selecionados); if ((dadosSalvos as any).ranking) setRanking((dadosSalvos as any).ranking); }, [dadosSalvos]);
  const [codigo, setCodigo] = useState<CodigoConduta>({ naoTolero: '', sobPressao: '', compromisso: '' });

  const instrucao = INSTRUCOES[passo];

  // Quando avança do passo 1 → 2, inicializa o ranking com os selecionados
  const avancar = () => {
    if (passo === 1 && ranking.length !== selecionados.length) {
      setRanking(selecionados.map((id) => ({ id, porque: '' })));
    }
    setPasso((p) => Math.min(3, p + 1) as Passo);
  };

  const toggleValor = (id: string) => {
    setSelecionados((prev) => {
      if (prev.includes(id)) return prev.filter((v) => v !== id);
      if (prev.length >= MAX) return prev;
      return [...prev, id];
    });
  };

  const moverRanking = (idx: number, direcao: -1 | 1) => {
    setRanking((prev) => {
      const next = [...prev];
      const alvo = idx + direcao;
      if (alvo < 0 || alvo >= next.length) return prev;
      [next[idx], next[alvo]] = [next[alvo], next[idx]];
      return next;
    });
  };

  const atualizarPorque = (id: string, texto: string) => {
    setRanking((prev) => prev.map((v) => v.id === id ? { ...v, porque: texto } : v));
  };

  const podeAvancar =
    passo === 0 ? true :
    passo === 1 ? selecionados.length === MAX :
    passo === 2 ? ranking.every((v) => v.porque.trim().length > 0) :
    false;

  const getValor = (id: string) => VALORES.find((v) => v.id === id)!;
  const getCat = (cat: string) => CATEGORIAS.find((c) => c.id === cat)!;

  const progresso = Math.round((passo / (ETAPAS.length - 1)) * 100);

  // ── Painel direito (resumo) ───────────────────────────────────────────────

  const listaRanking = passo >= 2 ? ranking : selecionados.map((id) => ({ id, porque: '' }));

  const painelResumo = (
    <>
      <div className="flex flex-col gap-1" style={{ borderBottom: '1px solid var(--color-brand-border)', paddingBottom: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--color-brand-gray)', marginTop: 2 }}>
          {selecionados.length === 0 ? 'Nenhum selecionado ainda' : `${selecionados.length} de ${MAX} escolhidos`}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {Array.from({ length: MAX }).map((_, i) => {
          const rv = listaRanking[i];
          if (!rv) return (
            <div key={i} className="flex items-center gap-3 rounded-xl p-3"
              style={{ background: 'rgba(30,57,42,0.03)', border: '1.5px dashed var(--color-brand-border)' }}>
              <div className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{ width: 24, height: 24, background: 'rgba(30,57,42,0.06)', color: 'rgba(30,57,42,0.25)', fontSize: 11, fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                {i + 1}
              </div>
              <p style={{ fontSize: 13, color: 'rgba(30,57,42,0.3)', fontStyle: 'italic' }}>Não selecionado</p>
            </div>
          );

          const v = getValor(rv.id);
          const cat = getCat(v.categoria);
          return (
            <div key={rv.id} className="flex items-center gap-3 rounded-xl p-3"
              style={{ background: `${cat.cor}10`, border: `1.5px solid ${cat.cor}30` }}>
              <div className="flex items-center justify-center rounded-full flex-shrink-0 font-bold"
                style={{ width: 24, height: 24, background: i === 0 && passo >= 2 ? 'var(--color-brand-gold)' : cat.cor, color: '#fff', fontSize: 11, fontFamily: 'var(--font-heading)' }}>
                {i + 1}
              </div>
              <span style={{ fontSize: 16 }}>{v.emoji}</span>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 13, fontWeight: 600, color: cat.cor, fontFamily: 'var(--font-body)' }}>{v.nome}</p>
                {rv.porque && (
                  <p style={{ fontSize: 10, color: 'var(--color-brand-gray)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {rv.porque}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Código de conduta resumo */}
      {passo === 3 && (codigo.naoTolero || codigo.sobPressao || codigo.compromisso) && (
        <div className="flex flex-col gap-2" style={{ borderTop: '1px solid var(--color-brand-border)', paddingTop: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-brand-gray)', marginBottom: 4 }}>
            Código de conduta
          </p>
          {codigo.naoTolero && (
            <div className="rounded-xl p-3" style={{ background: 'rgba(192,57,43,0.05)', border: '1px solid rgba(192,57,43,0.15)' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#C0392B', marginBottom: 3 }}>🚫 Não tolero</p>
              <p style={{ fontSize: 13, color: 'var(--color-brand-dark-green)', lineHeight: 1.5 }}>{codigo.naoTolero.slice(0, 80)}{codigo.naoTolero.length > 80 ? '…' : ''}</p>
            </div>
          )}
          {codigo.compromisso && (
            <div className="rounded-xl p-3" style={{ background: 'rgba(30,57,42,0.05)', border: '1px solid rgba(30,57,42,0.12)' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-brand-dark-green)', marginBottom: 3 }}>✨ Compromisso</p>
              <p style={{ fontSize: 13, color: 'var(--color-brand-dark-green)', lineHeight: 1.5 }}>{codigo.compromisso.slice(0, 80)}{codigo.compromisso.length > 80 ? '…' : ''}</p>
            </div>
          )}
        </div>
      )}
    </>
  );

  // ── Render central por passo ──────────────────────────────────────────────

  const renderCentro = () => {
    if (passo === 0) return (
      <div className="flex flex-col items-center justify-center flex-1 gap-6 text-center px-8">
        <div style={{ fontSize: 64 }}>🧭</div>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700, color: 'var(--color-brand-dark-green)', marginBottom: 8 }}>
            Sua Bússola de Valores
          </h2>
          <p style={{ fontSize: 15, color: 'var(--color-brand-gray)', lineHeight: 1.7, maxWidth: 420 }}>
            Você vai selecionar os <strong style={{ color: 'var(--color-brand-dark-green)' }}>5 valores</strong> mais essenciais da sua vida e transformá-los em um <strong style={{ color: 'var(--color-brand-dark-green)' }}>Código de Conduta</strong> pessoal.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
          {[{ n: '20', l: 'valores disponíveis' }, { n: '5', l: 'para selecionar' }, { n: '3', l: 'perguntas finais' }].map((s) => (
            <div key={s.l} className="rounded-xl p-3 text-center" style={{ background: 'rgba(30,57,42,0.05)', border: '1px solid var(--color-brand-border)' }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--color-brand-dark-green)' }}>{s.n}</p>
              <p style={{ fontSize: 13, color: 'var(--color-brand-gray)', marginTop: 2 }}>{s.l}</p>
            </div>
          ))}
        </div>

        {/* Instrução */}
        <div className="w-full max-w-lg">
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: 'var(--color-brand-dark-green)', marginBottom: 8 }}>
            {instrucao.titulo}
          </h3>
          <div className="flex flex-col gap-2 mb-3">
            {instrucao.corpo.map((t, i) => (
              <p key={i} style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--color-brand-gray)' }}>{t}</p>
            ))}
          </div>
          <div className="rounded-xl p-3" style={{ background: 'rgba(224,165,95,0.1)', border: '1px solid rgba(224,165,95,0.25)' }}>
            <p style={{ fontSize: 15, color: '#a0692d', lineHeight: 1.6 }}>{instrucao.dica}</p>
          </div>
        </div>
      </div>
    );

    if (passo === 1) return (
      <div className="flex flex-col gap-5">
        {/* Instrução */}
        <div className="rounded-xl p-4" style={{ background: 'rgba(224,165,95,0.1)', border: '1px solid rgba(224,165,95,0.25)' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-brand-dark-green)', marginBottom: 4 }}>{instrucao.titulo}</p>
          <p style={{ fontSize: 15, color: '#a0692d', lineHeight: 1.6 }}>{instrucao.dica}</p>
        </div>

        {/* Contador */}
        <div className="flex items-center justify-between">
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: 'var(--color-brand-dark-green)' }}>
              Escolha seus 5 Valores
            </h2>
            <p style={{ fontSize: 15, color: 'var(--color-brand-gray)', marginTop: 2 }}>
              Clique nos valores que mais ressoam com você
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {Array.from({ length: MAX }).map((_, i) => (
              <div key={i} className="rounded-full transition-all duration-200" style={{
                width: 10, height: 10,
                background: i < selecionados.length ? 'var(--color-brand-gold)' : 'rgba(30,57,42,0.1)',
                border: '1.5px solid ' + (i < selecionados.length ? 'var(--color-brand-gold)' : 'rgba(30,57,42,0.2)'),
              }} />
            ))}
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-brand-dark-green)', marginLeft: 4 }}>
              {selecionados.length}/{MAX}
            </span>
          </div>
        </div>

        {/* Valores por categoria */}
        {CATEGORIAS.map((cat) => (
          <div key={cat.id}>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ fontSize: 14 }}>{cat.emoji}</span>
              <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: cat.cor, fontFamily: 'var(--font-body)' }}>
                {cat.label}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {VALORES.filter((v) => v.categoria === cat.id).map((valor) => (
                <ValorCard
                  key={valor.id}
                  valor={valor}
                  selecionado={selecionados.includes(valor.id)}
                  desabilitado={selecionados.length >= MAX}
                  onToggle={() => toggleValor(valor.id)}
                  corCategoria={cat.cor}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );

    if (passo === 2) return (
      <div className="flex flex-col gap-4">
        {/* Instrução */}
        <div className="rounded-xl p-4" style={{ background: 'rgba(224,165,95,0.1)', border: '1px solid rgba(224,165,95,0.25)' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-brand-dark-green)', marginBottom: 4 }}>{instrucao.titulo}</p>
          <p style={{ fontSize: 15, color: '#a0692d', lineHeight: 1.6 }}>{instrucao.dica}</p>
        </div>

        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: 'var(--color-brand-dark-green)' }}>
            Ranqueie seus Valores
          </h2>
          <p style={{ fontSize: 15, color: 'var(--color-brand-gray)', marginTop: 2 }}>
            Ordene do mais ao menos essencial e justifique cada escolha
          </p>
        </div>

        {ranking.map((rv, idx) => {
          const v = getValor(rv.id);
          const cat = getCat(v.categoria);
          return (
            <div key={rv.id} className="rounded-2xl p-5 flex flex-col gap-3"
              style={{ background: '#fff', border: '1px solid var(--color-brand-border)', boxShadow: 'var(--shadow-card)' }}>
              {/* Header do item */}
              <div className="flex items-center gap-3">
                {/* Posição */}
                <div className="flex items-center justify-center rounded-xl flex-shrink-0 font-bold"
                  style={{ width: 36, height: 36, background: idx === 0 ? 'var(--color-brand-gold)' : 'rgba(30,57,42,0.07)', color: idx === 0 ? '#1E392A' : 'var(--color-brand-gray)', fontFamily: 'var(--font-heading)', fontSize: 15 }}>
                  {idx + 1}º
                </div>
                <span style={{ fontSize: 22 }}>{v.emoji}</span>
                <div className="flex-1">
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700, color: cat.cor }}>{v.nome}</p>
                  <p style={{ fontSize: 13, color: 'var(--color-brand-gray)' }}>{v.descricao}</p>
                </div>
                {/* Botões de ordem */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button onClick={() => moverRanking(idx, -1)} disabled={idx === 0}
                    className="flex items-center justify-center rounded-lg transition-all duration-150"
                    style={{ width: 28, height: 26, background: idx === 0 ? 'transparent' : 'rgba(30,57,42,0.07)', color: idx === 0 ? 'rgba(30,57,42,0.2)' : 'var(--color-brand-dark-green)', border: 'none', cursor: idx === 0 ? 'default' : 'pointer' }}>
                    ↑
                  </button>
                  <button onClick={() => moverRanking(idx, 1)} disabled={idx === ranking.length - 1}
                    className="flex items-center justify-center rounded-lg transition-all duration-150"
                    style={{ width: 28, height: 26, background: idx === ranking.length - 1 ? 'transparent' : 'rgba(30,57,42,0.07)', color: idx === ranking.length - 1 ? 'rgba(30,57,42,0.2)' : 'var(--color-brand-dark-green)', border: 'none', cursor: idx === ranking.length - 1 ? 'default' : 'pointer' }}>
                    ↓
                  </button>
                </div>
              </div>

              {/* Campo "por que" */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-brand-gray)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Por que é inegociável para mim?
                </label>
                <textarea
                  rows={2}
                  value={rv.porque}
                  onChange={(e) => atualizarPorque(rv.id, e.target.value)}
                  placeholder={`Escreva por que ${v.nome.toLowerCase()} é essencial na sua vida...`}
                  className="w-full mt-1 rounded-xl resize-none outline-none transition-all duration-150"
                  style={{
                    padding: '10px 12px',
                    fontSize: 15,
                    fontFamily: 'var(--font-body)',
                    color: 'var(--color-brand-dark-green)',
                    background: 'rgba(30,57,42,0.03)',
                    border: rv.porque ? `1.5px solid ${cat.cor}` : '1.5px solid var(--color-brand-border)',
                    lineHeight: 1.6,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );

    // passo === 3
    return (
      <div className="flex flex-col gap-5">
        {/* Instrução */}
        <div className="rounded-xl p-4" style={{ background: 'rgba(224,165,95,0.1)', border: '1px solid rgba(224,165,95,0.25)' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-brand-dark-green)', marginBottom: 4 }}>{instrucao.titulo}</p>
          <p style={{ fontSize: 15, color: '#a0692d', lineHeight: 1.6 }}>{instrucao.dica}</p>
        </div>

        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: 'var(--color-brand-dark-green)' }}>
            Seu Código de Conduta
          </h2>
          <p style={{ fontSize: 15, color: 'var(--color-brand-gray)', marginTop: 2 }}>
            Transforme seus valores em regras concretas de vida
          </p>
        </div>

        {[
          {
            key: 'naoTolero' as const,
            label: 'O que não tolero de forma alguma na minha vida',
            placeholder: 'Ex: Não tolero desonestidade, mesmo que pequena. Não tolero ficar parado quando tenho energia para agir...',
            emoji: '🚫',
            cor: '#C0392B',
          },
          {
            key: 'sobPressao' as const,
            label: 'Como ajo quando estou sob pressão',
            placeholder: 'Ex: Respiro fundo antes de responder. Busco clareza antes de agir. Me lembro dos meus valores antes de qualquer decisão importante...',
            emoji: '🧠',
            cor: '#2980B9',
          },
          {
            key: 'compromisso' as const,
            label: 'Meu compromisso diário com meus valores',
            placeholder: 'Ex: Toda manhã reafirmo quem quero ser. Tomo pelo menos uma decisão por dia alinhada aos meus valores. Reviso meu progresso toda semana...',
            emoji: '✨',
            cor: 'var(--color-brand-dark-green)',
          },
        ].map((campo) => (
          <div key={campo.key} className="rounded-2xl p-5 flex flex-col gap-3"
            style={{ background: '#fff', border: '1px solid var(--color-brand-border)', boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 20 }}>{campo.emoji}</span>
              <label style={{ fontSize: 16, fontWeight: 600, color: campo.cor, fontFamily: 'var(--font-body)' }}>
                {campo.label}
              </label>
            </div>
            <textarea
              rows={4}
              value={codigo[campo.key]}
              onChange={(e) => setCodigo((prev) => ({ ...prev, [campo.key]: e.target.value }))}
              placeholder={campo.placeholder}
              className="w-full rounded-xl resize-none outline-none"
              style={{
                padding: '12px 14px',
                fontSize: 15,
                fontFamily: 'var(--font-body)',
                color: 'var(--color-brand-dark-green)',
                background: 'rgba(30,57,42,0.03)',
                border: codigo[campo.key] ? `1.5px solid ${campo.cor}` : '1.5px solid var(--color-brand-border)',
                lineHeight: 1.7,
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <FerramentaLayout
      codigo="F02"
      nome="Bússola de Valores"
      descricao="Identifique seus 5 valores essenciais e transforme-os em um Código de Conduta pessoal."
      etapas={ETAPAS}
      etapaAtual={passo}
      progresso={progresso}
      onAvancar={avancar}
      onVoltar={() => setPasso((p) => Math.max(0, p - 1) as Passo)}
      podeAvancar={podeAvancar}
      totalItens={selecionados.length}
      labelItens="valores"
      resumo={painelResumo}
  respostas={{ selecionados, ranking }}
    >
      <div className="p-8">
        <div className="max-w-xl mx-auto flex flex-col gap-4" style={{ minHeight: passo === 0 ? '100%' : 'auto' }}>
          {renderCentro()}
        </div>
      </div>
    </FerramentaLayout>
  );
}
