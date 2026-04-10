'use client';

import { useState, useEffect } from 'react';
import FerramentaLayout from '@/components/dashboard/FerramentaLayout';
import { useCarregarRespostas } from '@/lib/useCarregarRespostas';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Identificacao = {
  // ── Sequência de Descoberta (5 passos) ───────────────────────────────────
  desejo:          string;  // P1: o que quer mas ainda não buscou
  bloqueio:        string;  // P2: "Eu não vou atrás porque..." → É a crença
  origem:          string;  // P3: de onde veio / quem ensinou
  contraEvidencia: string;  // P4: evidência que contraria a crença
  novaAfirmacao:   string;  // P5: reescrita em afirmação expansiva
  // ── Campos mantidos ──────────────────────────────────────────────────────
  crenca:          string;  // espelho do bloqueio (compatibilidade)
  tempoAcredita:   string;
};

type Desconstrucao = {
  evidencia1:        string;
  evidencia2:        string;
  evidencia3:        string;
  opostoRadical:     string;
  custo:             string;
  beneficioEscondido: string;
  novaCrenca:        string;
  acaoHoje:          string;
  mantra:            string;
};

type Compromisso = {
  mantraFinal: string;
  acoes:       string[];
};

type CrencaItem = {
  identificacao: Identificacao;
  desconstrucao: Desconstrucao;
  compromisso:   Compromisso;
};

// ─── Constantes ───────────────────────────────────────────────────────────────

const COR_VERDE  = '#1a5c3a';
const COR_GOLD   = '#b5840a';
const COR_BORDER = 'rgba(26,92,58,0.1)';

const ETAPAS = [
  { label: 'Bem-vindo',      descricao: 'Banco de crenças limitantes'     },
  { label: 'Identificação',  descricao: 'Origem e história da crença'     },
  { label: 'Desconstrução',  descricao: '9 perguntas socráticas'          },
  { label: 'Compromisso',    descricao: 'Mantra e plano dos próximos 7 dias' },
];

type CategoriaConfig = {
  key:   string;
  emoji: string;
  nome:  string;
  cor:   string;
  bg:    string;
};

const CATEGORIAS: CategoriaConfig[] = [
  { key: 'si_mesmo',        emoji: '🪞', nome: 'Sobre si mesmo',   cor: '#7c3aed', bg: 'rgba(124,58,237,0.07)'  },
  { key: 'dinheiro',        emoji: '💰', nome: 'Dinheiro',          cor: '#d97706', bg: 'rgba(217,119,6,0.07)'   },
  { key: 'relacionamentos', emoji: '❤️', nome: 'Relacionamentos',   cor: '#e11d48', bg: 'rgba(225,29,72,0.05)'   },
  { key: 'carreira',        emoji: '🚀', nome: 'Carreira',          cor: '#2563eb', bg: 'rgba(37,99,235,0.07)'   },
  { key: 'mudanca',         emoji: '🔄', nome: 'Mudança',           cor: '#16a34a', bg: 'rgba(22,163,74,0.07)'   },
];

const BANCO_CRENCAS: Record<string, string[]> = {
  si_mesmo: [
    'Não sou inteligente o suficiente',
    'Não mereço ser feliz',
    'Não tenho disciplina para mudar',
    'Sou muito velho para começar de novo',
    'Nunca termino o que começo',
  ],
  dinheiro: [
    'Dinheiro é difícil de ganhar',
    'Ricos são desonestos ou exploram os outros',
    'Não mereço ganhar muito dinheiro',
    'Dinheiro não traz felicidade',
    'Não sou bom com dinheiro',
  ],
  relacionamentos: [
    'Não mereço ser amado verdadeiramente',
    'As pessoas sempre acabam me abandonando',
    'Tenho que ser perfeito para ser aceito',
    'Não posso confiar nas pessoas',
    'Sou difícil de amar',
  ],
  carreira: [
    'Não tenho talento suficiente para me destacar',
    'Já passou a minha vez',
    'Não consigo trabalhar com o que amo',
    'Não sou criativo o suficiente',
    'Para ter sucesso preciso sacrificar tudo',
  ],
  mudanca: [
    'Não tenho força de vontade suficiente',
    'Já tentei antes e não funcionou',
    'As pessoas não mudam de verdade',
    'Sou assim e pronto, não vou mudar',
    'Não tenho tempo nem energia para mudar',
  ],
};

type PerguntaConfig = {
  key:         keyof Desconstrucao;
  numero:      string;
  titulo:      string;
  placeholder: string;
  grupo:       'evidencias' | 'reflexao' | 'reconstrucao';
};

const PERGUNTAS: PerguntaConfig[] = [
  {
    key: 'evidencia1', numero: 'Q1', grupo: 'evidencias',
    titulo: 'Situação que prova que esta crença é FALSA',
    placeholder: 'Descreva uma situação real em que você agiu diferente do que essa crença afirma…',
  },
  {
    key: 'evidencia2', numero: 'Q2', grupo: 'evidencias',
    titulo: 'Uma pessoa que prova que o oposto é possível',
    placeholder: 'Quem você conhece (ou conhece de longe) que desafia completamente essa crença?',
  },
  {
    key: 'evidencia3', numero: 'Q3', grupo: 'evidencias',
    titulo: 'Algo que você já fez que contradiz essa crença',
    placeholder: 'Lembre de uma conquista ou atitude que prova que essa crença não é absoluta…',
  },
  {
    key: 'opostoRadical', numero: 'Q4', grupo: 'reflexao',
    titulo: 'Se o oposto fosse 100% verdadeiro na sua vida',
    placeholder: 'Se você acreditasse completamente no oposto dessa crença, o que seria diferente hoje?',
  },
  {
    key: 'custo', numero: 'Q5', grupo: 'reflexao',
    titulo: 'O custo real desta crença na sua vida',
    placeholder: 'O que essa crença já te custou em oportunidades, relacionamentos, conquistas, felicidade?',
  },
  {
    key: 'beneficioEscondido', numero: 'Q6', grupo: 'reflexao',
    titulo: 'O benefício escondido de manter essa crença',
    placeholder: 'Por que você ainda carrega essa crença? Que "proteção" ela oferece? (seja honesto)',
  },
  {
    key: 'novaCrenca', numero: 'Q7', grupo: 'reconstrucao',
    titulo: 'Sua nova crença fortalecedora',
    placeholder: 'Reescreva essa crença de forma empoderada, realista e positiva. Ex: "Eu sou capaz de…"',
  },
  {
    key: 'acaoHoje', numero: 'Q8', grupo: 'reconstrucao',
    titulo: 'Ação concreta para provar a nova crença HOJE',
    placeholder: 'Que ação pequena e específica você pode fazer hoje para começar a provar a nova crença?',
  },
  {
    key: 'mantra', numero: 'Q9', grupo: 'reconstrucao',
    titulo: 'Seu mantra pessoal (1 frase poderosa)',
    placeholder: 'Crie uma frase curta, no presente, que ressuma sua nova crença. Ex: "Eu aprendo e cresço a cada dia"',
  },
];

const GRUPOS_CONFIG = {
  evidencias:    { cor: '#16a34a', bg: 'rgba(22,163,74,0.06)',  titulo: 'Evidências contra a crença'   },
  reflexao:      { cor: '#2563eb', bg: 'rgba(37,99,235,0.06)',  titulo: 'Reflexão profunda'             },
  reconstrucao:  { cor: COR_GOLD,  bg: 'rgba(181,132,10,0.06)', titulo: 'Reconstrução'                 },
};

const TEMPO_OPTS = [
  'Menos de 1 ano', '1 a 3 anos', '3 a 5 anos',
  '5 a 10 anos', 'Mais de 10 anos', 'Desde criança',
];

const IDENT_DEFAULT: Identificacao  = {
  desejo: '', bloqueio: '', origem: '', contraEvidencia: '', novaAfirmacao: '',
  crenca: '', tempoAcredita: 'Menos de 1 ano',
};
const DESC_DEFAULT: Desconstrucao   = { evidencia1: '', evidencia2: '', evidencia3: '', opostoRadical: '', custo: '', beneficioEscondido: '', novaCrenca: '', acaoHoje: '', mantra: '' };
const COMP_DEFAULT: Compromisso     = { mantraFinal: '', acoes: Array.from({ length: 7 }, () => '') };

const CRENCA_DEFAULT: CrencaItem = {
  identificacao: { ...IDENT_DEFAULT },
  desconstrucao: { ...DESC_DEFAULT },
  compromisso:   { mantraFinal: '', acoes: Array.from({ length: 7 }, () => '') },
};

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function DesconstritorCrencasPage() {
  const [etapa, setEtapa]           = useState(0);
  const [crencaAtiva, setCrencaAtiva] = useState(0);

  const [crencas, setCrencas] = useState<CrencaItem[]>([
    structuredClone(CRENCA_DEFAULT),
    structuredClone(CRENCA_DEFAULT),
    structuredClone(CRENCA_DEFAULT),
  ]);

  const { dados: dadosSalvos } = useCarregarRespostas("desconstrutor-crencas");
  useEffect(() => { if (!dadosSalvos) return; if ((dadosSalvos as any).crencaAtiva) setCrencaAtiva((dadosSalvos as any).crencaAtiva); if ((dadosSalvos as any).crencas) setCrencas((dadosSalvos as any).crencas); }, [dadosSalvos]);

  // ─── Helpers de estado ────────────────────────────────────────────────────

  const ativa = crencas[crencaAtiva];

  const setIdent = (p: Partial<Identificacao>) =>
    setCrencas(prev => prev.map((c, i) => {
      if (i !== crencaAtiva) return c;
      const updated = { ...c.identificacao, ...p };
      // mantém crenca espelhando bloqueio para compatibilidade com etapa 2
      if ('bloqueio' in p) updated.crenca = p.bloqueio ?? '';
      return { ...c, identificacao: updated };
    }));

  const setDesc = (p: Partial<Desconstrucao>) =>
    setCrencas(prev => prev.map((c, i) =>
      i === crencaAtiva ? { ...c, desconstrucao: { ...c.desconstrucao, ...p } } : c
    ));

  const setComp = (p: Partial<Compromisso>) =>
    setCrencas(prev => prev.map((c, i) =>
      i === crencaAtiva ? { ...c, compromisso: { ...c.compromisso, ...p } } : c
    ));

  const setAcao = (diaIdx: number, valor: string) =>
    setComp({ acoes: ativa.compromisso.acoes.map((a, i) => i === diaIdx ? valor : a) });

  const selecionarCrencaBanco = (texto: string) => {
    setCrencas(prev => prev.map((c, i) =>
      i === crencaAtiva ? { ...c, identificacao: { ...c.identificacao, crenca: texto } } : c
    ));
  };

  // ─── Métricas ──────────────────────────────────────────────────────────────

  const identPreenchidas = crencas.filter(c => c.identificacao.bloqueio.trim().length > 0).length;

  const descRespondidas = (c: CrencaItem) =>
    Object.values(c.desconstrucao).filter(v => v.trim().length > 0).length;

  const totalDescRespondidas = crencas.reduce((sum, c) => sum + descRespondidas(c), 0);

  const mantrasCriados = crencas.filter(c => c.compromisso.mantraFinal.trim().length > 0).length;

  const descAtiva = descRespondidas(ativa);

  const progresso =
    etapa === 0 ? 0
    : etapa === 1 ? Math.min(33, Math.round((identPreenchidas / 3) * 33))
    : etapa === 2 ? 33 + Math.min(33, Math.round((totalDescRespondidas / 27) * 33))
    : 66 + Math.min(34, Math.round((mantrasCriados / 3) * 34));

  const podeAvancar =
    etapa === 0 ? true
    : etapa === 1 ? ativa.identificacao.bloqueio.trim().length > 5
    : etapa === 2 ? descAtiva >= 5
    : ativa.compromisso.mantraFinal.trim().length > 0;

  // ─── Tabs de navegação entre crenças ──────────────────────────────────────

  const CrencaTabs = () => (
    <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
      {crencas.map((c, i) => {
        const ativo = crencaAtiva === i;
        const temDados = c.identificacao.crenca.length > 0;
        return (
          <button
            key={i}
            onClick={() => setCrencaAtiva(i)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 16px', borderRadius: 8,
              border: `1.5px solid ${ativo ? COR_VERDE : COR_BORDER}`,
              background: ativo ? `${COR_VERDE}10` : '#fff',
              fontFamily: 'var(--font-body)', fontSize: 13,
              fontWeight: ativo ? 700 : 400,
              color: ativo ? COR_VERDE : 'rgba(26,92,58,0.5)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <span>Crença {i + 1}</span>
            {temDados && (
              <span style={{
                width: 16, height: 16, borderRadius: '50%',
                background: c.compromisso.mantraFinal ? '#16a34a' : c.desconstrucao.evidencia1 ? COR_GOLD : COR_VERDE,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, color: '#fff', fontWeight: 700, flexShrink: 0,
              }}>
                {c.compromisso.mantraFinal ? '✓' : descRespondidas(c)}
              </span>
            )}
          </button>
        );
      })}
      <div style={{
        marginLeft: 'auto',
        fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(26,92,58,0.5)',
        display: 'flex', alignItems: 'center',
      }}>
        {identPreenchidas}/3 crenças identificadas
      </div>
    </div>
  );

  // ─── Painel Direito ────────────────────────────────────────────────────────

  const STATUS_LABEL = (c: CrencaItem): { label: string; cor: string } => {
    if (c.compromisso.mantraFinal) return { label: 'Comprometida', cor: '#16a34a' };
    if (descRespondidas(c) >= 5)   return { label: 'Desconstruída', cor: COR_GOLD  };
    if (c.identificacao.bloqueio || c.identificacao.crenca) return { label: 'Identificada', cor: '#2563eb' };
    return                                 { label: 'Não iniciada', cor: 'rgba(26,92,58,0.3)' };
  };

  const painelResumo = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: COR_VERDE, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Crenças em desconstrução
      </p>

      {crencas.map((c, i) => {
        const status = STATUS_LABEL(c);
        const pct    = c.compromisso.mantraFinal ? 100
          : descRespondidas(c) > 0 ? 33 + Math.round((descRespondidas(c) / 9) * 34)
          : c.identificacao.crenca ? 33
          : 0;

        return (
          <div
            key={i}
            onClick={() => setCrencaAtiva(i)}
            style={{
              background: crencaAtiva === i ? `${COR_VERDE}07` : '#fff',
              border: `1.5px solid ${crencaAtiva === i ? COR_VERDE + '30' : COR_BORDER}`,
              borderRadius: 10, padding: '12px 14px',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'rgba(26,92,58,0.4)', letterSpacing: '0.06em' }}>
                CRENÇA {i + 1}
              </span>
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700,
                color: status.cor, background: `${status.cor}12`,
                border: `1px solid ${status.cor}25`,
                borderRadius: 99, padding: '1px 7px',
              }}>
                {status.label}
              </span>
            </div>

            {(c.identificacao.bloqueio || c.identificacao.crenca) ? (
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 13, color: '#2d3748',
                fontStyle: 'italic', lineHeight: 1.4, marginBottom: 8,
              }}>
                {(() => {
                  const txt = c.identificacao.bloqueio || c.identificacao.crenca;
                  return <>&ldquo;{txt.length > 60 ? txt.slice(0, 60) + '…' : txt}&rdquo;</>;
                })()}
              </p>
            ) : (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(26,92,58,0.35)', fontStyle: 'italic', marginBottom: 8 }}>
                Não preenchida ainda
              </p>
            )}

            <div style={{ height: 4, borderRadius: 99, background: 'rgba(26,92,58,0.08)', overflow: 'hidden', marginBottom: c.compromisso.mantraFinal ? 8 : 0 }}>
              <div style={{
                height: '100%', width: `${pct}%`,
                background: pct === 100 ? '#16a34a' : pct >= 50 ? COR_GOLD : '#2563eb',
                borderRadius: 99, transition: 'width 0.4s',
              }} />
            </div>

            {c.compromisso.mantraFinal && (
              <div style={{
                background: `${COR_GOLD}10`, border: `1px solid ${COR_GOLD}25`,
                borderRadius: 7, padding: '7px 10px', marginTop: 6,
              }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: COR_GOLD, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
                  MANTRA
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#5c4a00', fontStyle: 'italic', lineHeight: 1.4 }}>
                  &ldquo;{c.compromisso.mantraFinal.length > 80
                    ? c.compromisso.mantraFinal.slice(0, 80) + '…'
                    : c.compromisso.mantraFinal}&rdquo;
                </p>
              </div>
            )}
          </div>
        );
      })}

      {/* Progresso global */}
      <div style={{ borderTop: `1px solid ${COR_BORDER}`, paddingTop: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(26,92,58,0.6)' }}>
            Progresso total
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: COR_VERDE }}>
            {mantrasCriados}/3 completas
          </span>
        </div>
        <div style={{ height: 6, borderRadius: 99, background: 'rgba(26,92,58,0.08)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${Math.round((mantrasCriados / 3) * 100)}%`,
            background: COR_VERDE, borderRadius: 99, transition: 'width 0.5s',
          }} />
        </div>
      </div>
    </div>
  );

  // ─── Etapa 0: Bem-vindo ────────────────────────────────────────────────────

  const step0 = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: `${COR_GOLD}15`, border: `1px solid ${COR_GOLD}30`,
          borderRadius: 99, padding: '4px 14px', marginBottom: 16,
        }}>
          <span style={{ fontSize: 14 }}>🧠</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: COR_GOLD }}>
            F13 · Desconstrutor de Crenças
          </span>
        </div>
        <h1 style={{ color: COR_VERDE, marginBottom: 12 }}>
          Suas crenças criam a sua realidade
        </h1>
        <p style={{ color: '#4a5568', maxWidth: 580 }}>
          Crenças limitantes são histórias que contamos para nós mesmos — histórias que parecem verdade mas nos aprisionam. Esta ferramenta usa perguntas socráticas para desconstruir essas histórias e criar novas crenças empoderadoras.
        </p>
      </div>

      <div style={{
        background: `${COR_GOLD}08`, border: `1px solid ${COR_GOLD}20`,
        borderRadius: 12, padding: '14px 18px', marginBottom: 4,
      }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#5c4a00', margin: 0 }}>
          <strong>Como usar:</strong> Identifique-se com as crenças abaixo e clique em qualquer uma para selecioná-la como ponto de partida. Você vai trabalhar até <strong>3 crenças</strong> nesta sessão.
        </p>
      </div>

      {/* Banco de crenças */}
      {CATEGORIAS.map(cat => (
        <div key={cat.key}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 18 }}>{cat.emoji}</span>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700, color: cat.cor }}>
              {cat.nome}
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {BANCO_CRENCAS[cat.key].map(texto => {
              const jaSelecionada = crencas.some(c => c.identificacao.crenca === texto);
              const ehAtiva = crencas[crencaAtiva].identificacao.crenca === texto;
              return (
                <button
                  key={texto}
                  onClick={() => {
                    selecionarCrencaBanco(texto);
                    // Avança para próxima crença vazia se a ativa já tiver dado
                    if (crencas[crencaAtiva].identificacao.crenca && crencas[crencaAtiva].identificacao.crenca !== texto) {
                      const prox = crencas.findIndex((c, i) => i !== crencaAtiva && !c.identificacao.crenca);
                      if (prox !== -1) setCrencaAtiva(prox);
                    }
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', borderRadius: 8, textAlign: 'left',
                    border: `1.5px solid ${ehAtiva ? cat.cor : jaSelecionada ? cat.cor + '50' : COR_BORDER}`,
                    background: ehAtiva ? `${cat.cor}12` : jaSelecionada ? `${cat.cor}06` : '#fff',
                    cursor: 'pointer', transition: 'all 0.15s', width: '100%',
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    border: `1.5px solid ${ehAtiva || jaSelecionada ? cat.cor : 'rgba(26,92,58,0.2)'}`,
                    background: ehAtiva ? cat.cor : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {(ehAtiva || jaSelecionada) && (
                      <span style={{ fontSize: 10, color: ehAtiva ? '#fff' : cat.cor, fontWeight: 700 }}>✓</span>
                    )}
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: 14,
                    color: ehAtiva ? cat.cor : '#2d3748',
                    fontStyle: 'italic',
                    fontWeight: ehAtiva ? 600 : 400,
                  }}>
                    &ldquo;{texto}&rdquo;
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  // ─── Etapa 1: Sequência de Descoberta ────────────────────────────────────

  const PASSOS_DESCOBERTA = [
    {
      num:      1,
      cor:      '#7c3aed',
      bg:       'rgba(124,58,237,0.06)',
      titulo:   'O que você quer muito, mas ainda não buscou?',
      subtexto: 'Escreva sem filtro — não existe resposta certa. Quanto mais honesto(a), mais poderoso o processo.',
      exemplo:  '"Quero abrir meu próprio negócio, mas nunca dei o primeiro passo."',
      placeholder: 'Escreva livremente. Pode ser um sonho antigo, algo que você evita pensar, um desejo que parece impossível…',
      campo:    'desejo' as keyof Identificacao,
    },
    {
      num:      2,
      cor:      '#e11d48',
      bg:       'rgba(225,29,72,0.05)',
      titulo:   'Complete a frase: "Eu não vou atrás porque…"',
      subtexto: 'Essa frase vai revelar a crença limitante. Não edite — escreva o primeiro pensamento que veio.',
      exemplo:  '"…não sou bom o suficiente para competir com quem já está lá."',
      placeholder: 'Eu não vou atrás porque… (escreva sem censura, essa é a crença que vamos desconstruir)',
      campo:    'bloqueio' as keyof Identificacao,
    },
    {
      num:      3,
      cor:      '#d97706',
      bg:       'rgba(217,119,6,0.06)',
      titulo:   'De onde veio essa crença? Quem te ensinou isso?',
      subtexto: 'Crenças não nascem do nada — alguém plantou isso em você. Identificar a origem tira o poder dela.',
      exemplo:  '"Meu pai sempre dizia que sonhar demais é coisa de gente preguiçosa. Cresci acreditando nisso."',
      placeholder: 'Pode ter vindo de um familiar, professor, evento marcante, fracasso, ou até de algo que você interpretou sozinho…',
      campo:    'origem' as keyof Identificacao,
    },
    {
      num:      4,
      cor:      '#16a34a',
      bg:       'rgba(22,163,74,0.06)',
      titulo:   'Qual evidência CONTRARIA essa crença na sua vida?',
      subtexto: 'O cérebro confirma o que acredita e ignora o que contradiz. Force-o a enxergar o oposto.',
      exemplo:  '"Já dei uma virada completa na minha vida antes — mudei de cidade sem nada garantido e deu certo."',
      placeholder: 'Pense em uma situação real — por menor que seja — em que você agiu diferente do que essa crença afirma…',
      campo:    'contraEvidencia' as keyof Identificacao,
    },
    {
      num:      5,
      cor:      COR_GOLD,
      bg:       `rgba(181,132,10,0.06)`,
      titulo:   'Reescreva a crença como uma afirmação que te expande.',
      subtexto: 'Não precisa ser uma frase perfeita. Precisa ser verdadeira o suficiente para você acreditar — ao menos 51%.',
      exemplo:  '"Eu tenho tudo o que preciso para começar. Cada passo pequeno me aproxima do que quero."',
      placeholder: 'Escreva no tempo presente, na primeira pessoa, como se já fosse sua nova verdade…',
      campo:    'novaAfirmacao' as keyof Identificacao,
    },
  ];

  const step1 = (
    <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Cabeçalho */}
      <div>
        <h2 style={{ color: COR_VERDE, marginBottom: 8 }}>Sequência de Descoberta</h2>
        <p style={{ color: '#4a5568', lineHeight: 1.65 }}>
          Em vez de identificar diretamente a crença — o que ativa defesas —, vamos chegar nela de forma indireta, através do desejo. Responda cada passo com o primeiro pensamento honesto que surgir.
        </p>
      </div>

      <CrencaTabs />

      {/* 5 passos */}
      {PASSOS_DESCOBERTA.map((passo, pi) => {
        const valor = ativa.identificacao[passo.campo] as string;
        const preenchido = valor.trim().length > 0;

        return (
          <div key={passo.num}>
            {/* Card do passo */}
            <div style={{
              background: preenchido ? passo.bg : '#fff',
              border: `1.5px solid ${preenchido ? passo.cor + '40' : COR_BORDER}`,
              borderRadius: 14,
              overflow: 'hidden',
              transition: 'border-color 0.2s, background 0.2s',
            }}>
              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 14,
                padding: '16px 20px 14px',
                borderBottom: `1px solid ${preenchido ? passo.cor + '20' : COR_BORDER}`,
                background: `${passo.cor}08`,
              }}>
                {/* Número */}
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: preenchido ? passo.cor : `${passo.cor}15`,
                  border: `1.5px solid ${passo.cor}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
                  color: preenchido ? '#fff' : passo.cor,
                  transition: 'all 0.2s',
                }}>
                  {preenchido ? '✓' : passo.num}
                </div>

                {/* Texto */}
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700,
                    color: preenchido ? passo.cor : '#2d3748', lineHeight: 1.4, marginBottom: 4,
                  }}>
                    {passo.titulo}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: 13,
                    color: 'rgba(26,92,58,0.55)', lineHeight: 1.5,
                  }}>
                    {passo.subtexto}
                  </p>
                </div>
              </div>

              {/* Corpo */}
              <div style={{ padding: '14px 20px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Exemplo */}
                <div style={{
                  background: `${passo.cor}08`, border: `1px solid ${passo.cor}20`,
                  borderRadius: 8, padding: '8px 12px',
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: passo.cor, flexShrink: 0, marginTop: 1 }}>
                    Ex:
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: 13,
                    color: '#4a5568', fontStyle: 'italic', lineHeight: 1.5,
                  }}>
                    {passo.exemplo}
                  </span>
                </div>

                {/* Textarea */}
                <textarea
                  value={valor}
                  onChange={e => setIdent({ [passo.campo]: e.target.value })}
                  placeholder={passo.placeholder}
                  rows={passo.num === 5 ? 2 : 3}
                  style={{
                    border: `1.5px solid ${preenchido ? passo.cor + '40' : `${passo.cor}20`}`,
                    borderRadius: 8, padding: '10px 14px', fontSize: 15,
                    fontFamily: 'var(--font-body)', color: '#1a2015',
                    outline: 'none', background: 'rgba(255,255,255,0.9)',
                    resize: 'vertical', lineHeight: 1.6,
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = passo.cor; e.target.style.boxShadow = `0 0 0 3px ${passo.cor}14`; }}
                  onBlur={e  => { e.target.style.borderColor = preenchido ? `${passo.cor}40` : `${passo.cor}20`; e.target.style.boxShadow = 'none'; }}
                />

                {/* Nota especial para passo 2 */}
                {passo.num === 2 && valor.trim().length > 5 && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'rgba(225,29,72,0.05)', border: '1px solid rgba(225,29,72,0.18)',
                    borderRadius: 7, padding: '7px 12px',
                  }}>
                    <span style={{ fontSize: 13 }}>🎯</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#9b1239', lineHeight: 1.4 }}>
                      <strong>Crença identificada.</strong> Vamos desconstruí-la nos próximos passos — e na Etapa 2.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Conector entre passos */}
            {pi < PASSOS_DESCOBERTA.length - 1 && (
              <div style={{
                display: 'flex', justifyContent: 'center', padding: '4px 0',
                color: 'rgba(26,92,58,0.2)', fontSize: 18, userSelect: 'none',
              }}>
                ↓
              </div>
            )}
          </div>
        );
      })}

      {/* Há quanto tempo */}
      <div style={{
        background: `${COR_VERDE}05`, border: `1px solid ${COR_BORDER}`,
        borderRadius: 12, padding: '16px 20px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <label style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: COR_VERDE }}>
          ⏱ Há quanto tempo você carrega essa crença?
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TEMPO_OPTS.map(t => (
            <button
              key={t}
              onClick={() => setIdent({ tempoAcredita: t })}
              style={{
                padding: '6px 13px', borderRadius: 8,
                border: `1.5px solid ${ativa.identificacao.tempoAcredita === t ? COR_VERDE : COR_BORDER}`,
                background: ativa.identificacao.tempoAcredita === t ? `${COR_VERDE}10` : '#fff',
                fontFamily: 'var(--font-body)', fontSize: 13,
                fontWeight: ativa.identificacao.tempoAcredita === t ? 600 : 400,
                color: ativa.identificacao.tempoAcredita === t ? COR_VERDE : 'rgba(26,92,58,0.55)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {!ativa.identificacao.bloqueio.trim() && (
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#92400e',
          background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: 8, padding: '10px 14px', margin: 0,
        }}>
          Complete o Passo 2 (&ldquo;Eu não vou atrás porque…&rdquo;) para continuar.
        </p>
      )}
    </div>
  );

  // ─── Etapa 2: Desconstrução ───────────────────────────────────────────────

  const step2 = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <h2 style={{ color: COR_VERDE, marginBottom: 8 }}>Desconstrução Socrática</h2>
        <p style={{ color: '#4a5568', maxWidth: 580 }}>
          Responda as 9 perguntas com profundidade e honestidade. Quanto mais você investir aqui, mais poderosa será a transformação.
        </p>
      </div>

      <CrencaTabs />

      {/* Crença em foco */}
      {(ativa.identificacao.bloqueio || ativa.identificacao.crenca) && (
        <div style={{
          background: 'rgba(26,92,58,0.05)', border: `1px solid ${COR_VERDE}20`,
          borderRadius: 10, padding: '12px 16px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'rgba(26,92,58,0.45)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Crença em desconstrução
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: '#e11d48', fontStyle: 'italic', fontWeight: 600, lineHeight: 1.5 }}>
            &ldquo;{ativa.identificacao.bloqueio || ativa.identificacao.crenca}&rdquo;
          </p>
          {ativa.identificacao.novaAfirmacao && (
            <div style={{ borderTop: `1px solid ${COR_VERDE}15`, paddingTop: 8, marginTop: 2 }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: `${COR_GOLD}99`, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>
                Sua nova afirmação (Passo 5)
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#7c5500', fontStyle: 'italic', lineHeight: 1.5 }}>
                &ldquo;{ativa.identificacao.novaAfirmacao}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}

      {/* Perguntas agrupadas */}
      {(['evidencias', 'reflexao', 'reconstrucao'] as const).map(grupoKey => {
        const grupo    = GRUPOS_CONFIG[grupoKey];
        const pergs    = PERGUNTAS.filter(p => p.grupo === grupoKey);
        const resps    = pergs.filter(p => ativa.desconstrucao[p.key].trim().length > 0).length;

        return (
          <div key={grupoKey} style={{
            background: grupo.bg, border: `1.5px solid ${grupo.cor}25`,
            borderRadius: 12, padding: '18px 20px',
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700, color: grupoKey === 'reconstrucao' ? '#7c5500' : grupo.cor }}>
                {grupo.titulo}
              </h3>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                color: grupo.cor, background: `${grupo.cor}15`,
                border: `1px solid ${grupo.cor}25`,
                borderRadius: 99, padding: '2px 8px',
              }}>
                {resps}/{pergs.length} respondidas
              </span>
            </div>

            {pergs.map(perg => (
              <div key={perg.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                    color: grupo.cor, background: `${grupo.cor}18`,
                    borderRadius: 4, padding: '2px 6px', flexShrink: 0, marginTop: 1,
                  }}>
                    {perg.numero}
                  </span>
                  <label style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: '#2d3748', lineHeight: 1.4 }}>
                    {perg.titulo}
                  </label>
                </div>
                <textarea
                  value={ativa.desconstrucao[perg.key]}
                  onChange={e => setDesc({ [perg.key]: e.target.value })}
                  placeholder={perg.placeholder}
                  rows={perg.key === 'mantra' || perg.key === 'acaoHoje' ? 2 : 3}
                  style={{
                    border: `1px solid ${ativa.desconstrucao[perg.key] ? grupo.cor + '40' : `${grupo.cor}20`}`,
                    borderRadius: 8, padding: '9px 12px', fontSize: 15,
                    fontFamily: 'var(--font-body)', color: '#1a2015',
                    outline: 'none', background: 'rgba(255,255,255,0.8)',
                    resize: 'vertical', lineHeight: 1.55,
                  }}
                />
              </div>
            ))}
          </div>
        );
      })}

      {descAtiva < 5 && (
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#92400e',
          background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: 8, padding: '10px 14px', margin: 0,
        }}>
          Responda pelo menos 5 das 9 perguntas para continuar ({descAtiva}/5 respondidas).
        </p>
      )}
    </div>
  );

  // ─── Etapa 3: Compromisso ─────────────────────────────────────────────────

  const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  const step3 = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <h2 style={{ color: COR_VERDE, marginBottom: 8 }}>Compromisso e Ação</h2>
        <p style={{ color: '#4a5568', maxWidth: 580 }}>
          A desconstrução intelectual é só o começo. O compromisso e a ação diária são o que realmente reescrevem a crença no subconsciente.
        </p>
      </div>

      <CrencaTabs />

      {/* Mantra final */}
      <div style={{
        background: `${COR_GOLD}08`, border: `1.5px solid ${COR_GOLD}30`,
        borderRadius: 12, padding: '20px 22px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>✨</span>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700, color: '#7c5500' }}>
            Seu mantra definitivo <span style={{ color: '#ef4444' }}>*</span>
          </label>
        </div>
        {(ativa.identificacao.novaAfirmacao || ativa.desconstrucao.mantra) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {ativa.identificacao.novaAfirmacao && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(124,85,0,0.7)', fontStyle: 'italic', margin: 0 }}>
                💡 Da descoberta (Passo 5): &ldquo;{ativa.identificacao.novaAfirmacao}&rdquo;
              </p>
            )}
            {ativa.desconstrucao.mantra && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(124,85,0,0.7)', fontStyle: 'italic', margin: 0 }}>
                💡 Da desconstrução (Q9): &ldquo;{ativa.desconstrucao.mantra}&rdquo;
              </p>
            )}
          </div>
        )}
        <textarea
          value={ativa.compromisso.mantraFinal}
          onChange={e => setComp({ mantraFinal: e.target.value })}
          placeholder={ativa.desconstrucao.mantra || 'Escreva seu mantra definitivo — 1 frase poderosa no tempo presente…'}
          rows={2}
          style={{
            border: `1.5px solid ${ativa.compromisso.mantraFinal ? COR_GOLD + '60' : COR_GOLD + '30'}`,
            borderRadius: 8, padding: '10px 14px', fontSize: 16,
            fontFamily: 'var(--font-body)', color: '#7c5500',
            fontStyle: 'italic', fontWeight: 500,
            outline: 'none', background: 'rgba(255,255,255,0.7)',
            resize: 'vertical', lineHeight: 1.55,
          }}
        />
      </div>

      {/* Plano dos 7 dias */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>📅</span>
          <div>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 700, color: COR_VERDE }}>
              Plano de ação — próximos 7 dias
            </h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(26,92,58,0.55)', margin: 0 }}>
              Uma ação por dia para provar sua nova crença na prática.
            </p>
          </div>
        </div>

        {DIAS_SEMANA.map((dia, i) => {
          const cores = ['#16a34a','#2563eb','#d97706','#7c3aed','#e11d48','#0891b2','#16a34a'];
          const cor = cores[i];
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: '#fff', border: `1px solid ${COR_BORDER}`,
              borderRadius: 9, padding: '10px 14px',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                background: `${cor}12`, border: `1px solid ${cor}25`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700, color: `${cor}99`, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1 }}>
                  Dia
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: cor, lineHeight: 1.1 }}>
                  {i + 1}
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(26,92,58,0.5)', fontWeight: 500, minWidth: 56 }}>
                {dia}
              </span>
              <input
                type="text"
                value={ativa.compromisso.acoes[i]}
                onChange={e => setAcao(i, e.target.value)}
                placeholder={`Ação para o dia ${i + 1}…`}
                style={{
                  flex: 1, border: `1px solid ${ativa.compromisso.acoes[i] ? cor + '40' : COR_BORDER}`,
                  borderRadius: 6, padding: '7px 12px', fontSize: 14,
                  fontFamily: 'var(--font-body)', color: '#1a2015',
                  outline: 'none', background: ativa.compromisso.acoes[i] ? `${cor}04` : '#fff',
                }}
              />
            </div>
          );
        })}
      </div>

      {!ativa.compromisso.mantraFinal && (
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#92400e',
          background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: 8, padding: '10px 14px', margin: 0,
        }}>
          Escreva seu mantra definitivo para salvar esta crença.
        </p>
      )}
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  const steps = [step0, step1, step2, step3];

  return (
    <FerramentaLayout
      codigo="F13"
      nome="Desconstrutor de Crenças"
      descricao="Identifique, questione e substitua crenças limitantes por crenças fortalecedoras."
      etapas={ETAPAS}
      etapaAtual={etapa}
      progresso={progresso}
      onAvancar={() => setEtapa(e => Math.min(e + 1, ETAPAS.length - 1))}
      onVoltar={etapa > 0 ? () => setEtapa(e => e - 1) : undefined}
      podeAvancar={podeAvancar}
      totalItens={etapa >= 1 ? identPreenchidas : undefined}
      labelItens="crenças identificadas"
      resumo={painelResumo}
  respostas={{ crencaAtiva, crencas }}
    >
      {steps[etapa]}
    </FerramentaLayout>
  );
}
