'use client';

import { useState, useEffect } from "react";
import FerramentaLayout from "@/components/dashboard/FerramentaLayout";
import { useCarregarRespostas } from "@/lib/useCarregarRespostas";
import { useUser } from "@clerk/nextjs";
import { useSupabaseClient } from "@/lib/useSupabaseClient";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Receitas = {
  salario: string;
  freelance: string;
  rendimentos: string;
  aluguel: string;
  outras: string;
};

type CustosFixos = {
  moradia: string;
  saude: string;
  internet: string;
  transporte: string;
  escola: string;
};

type CustosVariaveis = {
  alimentacao: string;
  lazer: string;
  assinaturas: string;
  roupas: string;
  outros: string;
};

type Investimentos = {
  reserva: string;
  investimentos: string;
  previdencia: string;
};

// ─── Constantes ──────────────────────────────────────────────────────────────

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const ANO_ATUAL = 2026;

const ETAPAS = [
  { label: "Bem-vindo",    descricao: "Como funciona o Mapa Financeiro" },
  { label: "O que entra",  descricao: "Registre suas fontes de renda" },
  { label: "O que sai",    descricao: "Fixos, variáveis e investimentos" },
  { label: "Diagnóstico",  descricao: "Semáforo de saúde financeira" },
];

const INSTRUCOES: Record<number, { titulo: string; itens: string[] }> = {
  1: {
    titulo: "O que é o Mapa Financeiro?",
    itens: [
      "Mapa Financeiro = onde cada real entra e sai da sua vida.",
      "Simples e direto — sem jargão contábil.",
      "Mostra exatamente para onde vai o seu dinheiro.",
      "Base para qualquer decisão financeira inteligente.",
    ],
  },
  2: {
    titulo: "Registrando o que entra",
    itens: [
      "Inclua todas as fontes de entrada de dinheiro.",
      "Use valores líquidos (já descontado imposto).",
      "Renda variável: use a média dos últimos 3 meses.",
      "Seja honesto — este dado é só seu.",
    ],
  },
  3: {
    titulo: "O que sai todo mês",
    itens: [
      "Custos fixos: o que sai todo mês sem variar.",
      "Variáveis: estimativa ou média dos últimos meses.",
      "Investimento é diferente de gasto — é ativo.",
      "Regra 50-30-20: necessidades, desejos, investimentos.",
    ],
  },
  4: {
    titulo: "Lendo o Diagnóstico",
    itens: [
      "Verde: percentual saudável para a categoria.",
      "Amarelo: atenção — revise se possível.",
      "Vermelho: acima do recomendado.",
      "Saldo negativo = urgência imediata de ação.",
    ],
  },
};

const COR_GOLD = "#E0A55F";
const COR_DARK = "#1E392A";
const COR_GREEN = "#27AE60";
const COR_YELLOW = "#F39C12";
const COR_RED = "#E74C3C";
const COR_BLUE = "#2980B9";

// Limites saudáveis (% da renda)
const LIMITES: Record<string, { warn: number; danger: number; label: string }> = {
  moradia:      { warn: 25, danger: 35, label: "Moradia" },
  saude:        { warn: 10, danger: 15, label: "Saúde" },
  internet:     { warn: 3,  danger: 5,  label: "Internet/Telecom" },
  transporte:   { warn: 12, danger: 18, label: "Transporte" },
  escola:       { warn: 15, danger: 20, label: "Educação" },
  alimentacao:  { warn: 15, danger: 25, label: "Alimentação" },
  lazer:        { warn: 10, danger: 15, label: "Lazer" },
  assinaturas:  { warn: 5,  danger: 8,  label: "Assinaturas" },
  roupas:       { warn: 5,  danger: 8,  label: "Roupas" },
  outros:       { warn: 10, danger: 15, label: "Outros" },
  reserva:      { warn: 999, danger: 999, label: "Reserva de Emergência" },
  investimentos:{ warn: 999, danger: 999, label: "Investimentos" },
  previdencia:  { warn: 999, danger: 999, label: "Previdência" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function num(v: string): number {
  const n = parseFloat(v.replace(",", "."));
  return isNaN(n) ? 0 : n;
}

function soma(...vals: string[]): number {
  return vals.reduce((acc, v) => acc + num(v), 0);
}

function fmt(v: number): string {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function semaforo(pct: number, key: string): "green" | "yellow" | "red" {
  const l = LIMITES[key];
  if (!l || pct === 0) return "green";
  if (pct > l.danger) return "red";
  if (pct > l.warn) return "yellow";
  return "green";
}

function corSemaforo(s: "green" | "yellow" | "red"): string {
  return s === "green" ? COR_GREEN : s === "yellow" ? COR_YELLOW : COR_RED;
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function CampoReais({
  label,
  emoji,
  valor,
  onChange,
  placeholder,
  cor,
}: {
  label: string;
  emoji: string;
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
  cor?: string;
}) {
  const c = cor ?? COR_DARK;
  return (
    <div className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200"
      style={{ background: "#fff", border: `1.5px solid ${valor.trim() ? c + "44" : "var(--color-brand-border)"}`, boxShadow: "var(--shadow-card)" }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{emoji}</span>
      <label style={{ flex: 1, fontSize: 15, fontWeight: 600, color: COR_DARK, fontFamily: "var(--font-body)" }}>
        {label}
      </label>
      <div className="flex items-center gap-1.5">
        <span style={{ fontSize: 13, color: "var(--color-brand-gray)", fontFamily: "var(--font-mono)" }}>R$</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "0,00"}
          className="outline-none text-right"
          style={{
            width: 110,
            border: "none",
            background: "transparent",
            fontFamily: "var(--font-mono)",
            fontSize: 16,
            fontWeight: 700,
            color: c,
          }}
        />
      </div>
    </div>
  );
}

function SecaoFinanceira({
  titulo,
  emoji,
  cor,
  total,
  children,
}: {
  titulo: string;
  emoji: string;
  cor: string;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${cor}33`, background: "#fff", boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center justify-between px-5 py-4" style={{ background: `${cor}0e`, borderBottom: `1px solid ${cor}22` }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-xl" style={{ width: 36, height: 36, background: `${cor}20`, fontSize: 18 }}>
            {emoji}
          </div>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: COR_DARK }}>{titulo}</h3>
        </div>
        <div className="flex items-center gap-1">
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--color-brand-gray)" }}>Total</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700, color: cor, marginLeft: 6 }}>
            R$ {fmt(total)}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-3 p-5">{children}</div>
    </div>
  );
}

function LinhaDiagnostico({
  label,
  emoji,
  valor,
  total,
  chave,
  tipo,
}: {
  label: string;
  emoji: string;
  valor: number;
  total: number;
  chave: string;
  tipo: "gasto" | "investimento";
}) {
  const pct = total > 0 ? Math.round((valor / total) * 100) : 0;
  const sem = tipo === "investimento" ? "green" : semaforo(pct, chave);
  const cor = corSemaforo(sem);
  if (valor === 0) return null;
  return (
    <div className="flex flex-col gap-1.5 rounded-xl px-4 py-3"
      style={{ background: `${cor}07`, border: `1px solid ${cor}22` }}>
      <div className="flex items-center gap-2">
        <span style={{ fontSize: 15, flexShrink: 0 }}>{emoji}</span>
        <span style={{ fontSize: 15, fontWeight: 600, color: COR_DARK, flex: 1 }}>{label}</span>
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 700, color: COR_DARK }}>
            R$ {fmt(valor)}
          </span>
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ width: 44, height: 24, background: cor + "20", border: `1px solid ${cor}40` }}
          >
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: cor }}>
              {pct}%
            </span>
          </div>
          <div
            className="rounded-full"
            style={{ width: 10, height: 10, background: cor, flexShrink: 0 }}
          />
        </div>
      </div>
      <div className="w-full rounded-full overflow-hidden" style={{ height: 4, background: "rgba(30,57,42,0.08)" }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, pct * 2)}%`, background: cor }} />
      </div>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function DREPessoalPage() {
  const mesAtual = new Date().getMonth();
  const [passo, setPasso] = useState(0);
  const [mes, setMes] = useState(mesAtual);
  const [receitas, setReceitas] = useState<Receitas>({ salario: "", freelance: "", rendimentos: "", aluguel: "", outras: "" });
  const [fixos, setFixos] = useState<CustosFixos>({ moradia: "", saude: "", internet: "", transporte: "", escola: "" });
  const [variaveis, setVariaveis] = useState<CustosVariaveis>({ alimentacao: "", lazer: "", assinaturas: "", roupas: "", outros: "" });
  const [invest, setInvest] = useState<Investimentos>({ reserva: "", investimentos: "", previdencia: "" });
  const [scoreFinancas, setScoreFinancas] = useState<number | null>(null);
  const [vazamentoFinanceiro, setVazamentoFinanceiro] = useState("");
  const [compraImplanejada, setCompraImplanejada] = useState("");

  const { user } = useUser();
  const { getClient } = useSupabaseClient();

  const { dados: dadosSalvos } = useCarregarRespostas("dre-pessoal");
  useEffect(() => { if (!dadosSalvos) return; if ((dadosSalvos as any).mes) setMes((dadosSalvos as any).mes); if ((dadosSalvos as any).receitas) setReceitas((dadosSalvos as any).receitas); if ((dadosSalvos as any).fixos) setFixos((dadosSalvos as any).fixos); if ((dadosSalvos as any).variaveis) setVariaveis((dadosSalvos as any).variaveis); if ((dadosSalvos as any).invest) setInvest((dadosSalvos as any).invest); if ((dadosSalvos as any).vazamentoFinanceiro) setVazamentoFinanceiro((dadosSalvos as any).vazamentoFinanceiro); if ((dadosSalvos as any).compraImplanejada) setCompraImplanejada((dadosSalvos as any).compraImplanejada); }, [dadosSalvos]);

  useEffect(() => {
    if (!user?.id) return;
    getClient().then((sb) => {
      sb.from("roda_vida").select("financas").eq("user_id", user.id).single()
        .then(({ data }) => { if (data && typeof data.financas === "number") setScoreFinancas(data.financas); });
    });
  }, [user?.id, getClient]);

  const totalReceitas = soma(receitas.salario, receitas.freelance, receitas.rendimentos, receitas.aluguel, receitas.outras);
  const totalFixos = soma(fixos.moradia, fixos.saude, fixos.internet, fixos.transporte, fixos.escola);
  const totalVariaveis = soma(variaveis.alimentacao, variaveis.lazer, variaveis.assinaturas, variaveis.roupas, variaveis.outros);
  const totalInvest = soma(invest.reserva, invest.investimentos, invest.previdencia);
  const totalGastos = totalFixos + totalVariaveis;
  const saldo = totalReceitas - totalGastos - totalInvest;
  const pctGastos = totalReceitas > 0 ? Math.round((totalGastos / totalReceitas) * 100) : 0;
  const pctInvest = totalReceitas > 0 ? Math.round((totalInvest / totalReceitas) * 100) : 0;
  const pctSaldo = totalReceitas > 0 ? Math.round((saldo / totalReceitas) * 100) : 0;

  const podeAvancar = () => {
    if (passo === 0) return true;
    if (passo === 1) return totalReceitas > 0;
    if (passo === 2) return totalGastos > 0 || totalInvest > 0;
    return true;
  };

  const progresso = passo === 0 ? 0
    : passo === 1 ? Math.min(33, Math.round((totalReceitas > 0 ? 33 : 0)))
    : passo === 2 ? 33 + Math.min(34, Math.round(((totalGastos > 0 ? 1 : 0) * 34)))
    : 100;

  const instrucao = INSTRUCOES[passo + 1];

  const painelResumo = (
    <>
      <div className="flex flex-col gap-1">
        <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: COR_DARK }}>
          {MESES[mes]}/{ANO_ATUAL}
        </h3>
        <p style={{ fontSize: 11, color: "var(--color-brand-gray)" }}>Resumo financeiro em tempo real</p>
      </div>

      {/* Saldo principal */}
      <div className="flex flex-col rounded-2xl overflow-hidden"
        style={{ border: `2px solid ${saldo >= 0 && totalReceitas > 0 ? COR_GREEN : totalReceitas === 0 ? "var(--color-brand-border)" : COR_RED}44`, background: "#fff", boxShadow: "var(--shadow-card)" }}>
        <div className="flex flex-col items-center justify-center py-6 gap-1">
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-brand-gray)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Saldo</span>
          <span style={{
            fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 700, lineHeight: 1,
            color: totalReceitas === 0 ? "var(--color-brand-gray)" : saldo >= 0 ? COR_GREEN : COR_RED
          }}>
            {totalReceitas === 0 ? "R$ —" : `${saldo >= 0 ? "+" : ""}R$ ${fmt(saldo)}`}
          </span>
          {totalReceitas > 0 && (
            <span style={{ fontSize: 11, color: "var(--color-brand-gray)", marginTop: 2 }}>
              {pctSaldo >= 0 ? pctSaldo : Math.abs(pctSaldo)}% da renda {saldo >= 0 ? "livre" : "no déficit"}
            </span>
          )}
        </div>
      </div>

      {/* 3 métricas */}
      <div className="flex flex-col gap-3">
        {[
          { label: "Receita Total", valor: totalReceitas, cor: COR_GREEN, emoji: "📥", pct: null as number | null },
          { label: "Total de Gastos", valor: totalGastos, cor: COR_RED, emoji: "📤", pct: pctGastos as number | null },
          { label: "Total Investido", valor: totalInvest, cor: COR_BLUE, emoji: "📈", pct: pctInvest as number | null },
        ].map((r) => (
          <div key={r.label} className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: `${r.cor}0a`, border: `1px solid ${r.cor}22` }}>
            <span style={{ fontSize: 18 }}>{r.emoji}</span>
            <div className="flex-1">
              <p style={{ fontSize: 13, color: "var(--color-brand-gray)", lineHeight: 1 }}>{r.label}</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 700, color: r.cor, marginTop: 2 }}>
                R$ {fmt(r.valor)}
              </p>
            </div>
            {r.pct !== null && totalReceitas > 0 && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: r.cor }}>
                {r.pct}%
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Barra 50/30/20 vs realidade */}
      {totalReceitas > 0 && (
        <div className="flex flex-col gap-3 rounded-xl p-4" style={{ background: `${COR_DARK}06`, border: `1px solid ${COR_DARK}12` }}>
          <p style={{ fontFamily: "var(--font-heading)", fontSize: 13, fontWeight: 700, color: COR_DARK }}>vs. Regra 50/30/20</p>
          {[
            { label: "Necessidades", real: Math.round(((num(fixos.moradia) + num(fixos.saude) + num(fixos.internet) + num(fixos.transporte) + num(variaveis.alimentacao)) / totalReceitas) * 100), meta: 50, cor: COR_GREEN },
            { label: "Desejos", real: Math.round(((num(variaveis.lazer) + num(variaveis.assinaturas) + num(variaveis.roupas) + num(variaveis.outros) + num(fixos.escola)) / totalReceitas) * 100), meta: 30, cor: COR_YELLOW },
            { label: "Investimentos", real: pctInvest, meta: 20, cor: COR_BLUE },
          ].map((r) => (
            <div key={r.label} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 13, color: "var(--color-brand-gray)" }}>{r.label}</span>
                <div className="flex items-center gap-1">
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: r.real > r.meta ? COR_RED : COR_GREEN }}>{r.real}%</span>
                  <span style={{ fontSize: 10, color: "var(--color-brand-gray)" }}>/ {r.meta}%</span>
                </div>
              </div>
              <div className="relative w-full rounded-full overflow-hidden" style={{ height: 6, background: "rgba(30,57,42,0.08)" }}>
                <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (r.real / r.meta) * 100)}%`, background: r.real > r.meta ? COR_RED : r.cor }} />
                <div className="absolute inset-y-0" style={{ left: "100%", width: 1, background: r.cor + "60" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estado vazio */}
      {totalReceitas === 0 && totalGastos === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl p-6 text-center" style={{ border: "1.5px dashed var(--color-brand-border)" }}>
          <span style={{ fontSize: 32 }}>💰</span>
          <p style={{ fontSize: 15, color: "var(--color-brand-gray)", lineHeight: 1.5 }}>Seu Mapa Financeiro vai aparecer aqui conforme você preenche.</p>
        </div>
      )}
    </>
  );

  return (
    <FerramentaLayout
      codigo="F07"
      nome="Mapa Financeiro Pessoal"
      descricao="Visualize onde cada real entra e sai na sua vida."
      etapas={ETAPAS}
      etapaAtual={passo}
      progresso={progresso}
      onAvancar={() => setPasso((p) => Math.min(ETAPAS.length - 1, p + 1))}
      onVoltar={() => setPasso((p) => Math.max(0, p - 1))}
      podeAvancar={podeAvancar()}
      labelAvancar={passo === 0 ? "Começar →" : passo === ETAPAS.length - 1 ? "Salvar Mapa ✓" : "Continuar →"}
      resumo={painelResumo}
  respostas={{ mes, receitas, fixos, variaveis, invest, vazamentoFinanceiro, compraImplanejada }}
    >
      <div className="p-8">

        {/* Instrução da etapa */}
        {instrucao && (
          <div
            className="flex flex-col gap-3 rounded-xl p-4 mb-6"
            style={{ background: `${COR_DARK}06`, border: `1px solid ${COR_DARK}12` }}
          >
            <p style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: COR_DARK }}>
              {instrucao.titulo}
            </p>
            <ul className="flex flex-col gap-2">
              {instrucao.itens.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span style={{ color: COR_GOLD, fontSize: 15, marginTop: 1, flexShrink: 0 }}>→</span>
                  <span style={{ fontSize: 15, color: "var(--color-brand-gray)", lineHeight: 1.5 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Passo 0 — Bem-vindo */}
        {passo === 0 && (
          <div className="flex flex-col gap-8 max-w-2xl mx-auto">
            <div className="flex flex-col gap-3">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: COR_GOLD, textTransform: "uppercase", letterSpacing: "0.1em" }}>Ferramenta F07</span>
              <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, color: COR_DARK, lineHeight: 1.15 }}>
                Mapa <span style={{ color: COR_GOLD, fontStyle: "italic" }}>Financeiro</span>
              </h1>
              <p style={{ fontSize: 15, color: "var(--color-brand-gray)", lineHeight: 1.7, maxWidth: 520 }}>
                O Mapa Financeiro mostra exatamente onde cada real entra e para onde vai — sem surpresas, sem achismos. É a base de qualquer decisão financeira inteligente, com diagnóstico automático e semáforo de saúde financeira.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { emoji: "📥", titulo: "Receitas", desc: "Todas as entradas de dinheiro do mês.", cor: COR_GREEN },
                { emoji: "📤", titulo: "Despesas", desc: "Fixos, variáveis — tudo que sai.", cor: COR_RED },
                { emoji: "📈", titulo: "Investimentos", desc: "O que você destina para o futuro.", cor: COR_BLUE },
              ].map((b) => (
                <div key={b.titulo} className="flex flex-col gap-3 rounded-2xl p-5"
                  style={{ background: `${b.cor}0e`, border: `1.5px solid ${b.cor}25` }}>
                  <span style={{ fontSize: 24 }}>{b.emoji}</span>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: COR_DARK }}>{b.titulo}</h3>
                  <p style={{ fontSize: 15, color: "var(--color-brand-gray)", lineHeight: 1.5 }}>{b.desc}</p>
                </div>
              ))}
            </div>

            {/* Regra 50/30/20 */}
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${COR_DARK}18` }}>
              <div className="px-5 py-4" style={{ background: COR_DARK }}>
                <p style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: "#F4F1DE" }}>Regra do 50-30-20</p>
                <p style={{ fontSize: 15, color: "rgba(244,241,222,0.6)", marginTop: 2 }}>Referência para uma distribuição saudável</p>
              </div>
              <div className="grid grid-cols-3 divide-x" style={{ borderColor: "var(--color-brand-border)" }}>
                {[
                  { pct: "50%", label: "Necessidades", desc: "Moradia, saúde, transporte, alimentação", cor: COR_GREEN },
                  { pct: "30%", label: "Desejos", desc: "Lazer, roupas, assinaturas, outros", cor: COR_YELLOW },
                  { pct: "20%", label: "Investimentos", desc: "Reserva, aportes, previdência", cor: COR_BLUE },
                ].map((r) => (
                  <div key={r.label} className="flex flex-col items-center gap-2 py-5 px-4 text-center">
                    <span style={{ fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 700, color: r.cor }}>{r.pct}</span>
                    <span style={{ fontFamily: "var(--font-heading)", fontSize: 13, fontWeight: 700, color: COR_DARK }}>{r.label}</span>
                    <span style={{ fontSize: 13, color: "var(--color-brand-gray)", lineHeight: 1.4 }}>{r.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selecionar mês */}
            <div className="flex flex-col gap-3">
              <p style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: COR_DARK }}>Mês de referência</p>
              <div className="grid grid-cols-4 gap-2">
                {MESES.map((m, i) => (
                  <button key={m} onClick={() => setMes(i)}
                    className="rounded-xl py-2.5 text-sm font-semibold transition-all duration-200"
                    style={{
                      background: mes === i ? COR_DARK : "#fff",
                      color: mes === i ? "#fff" : COR_DARK,
                      border: `1.5px solid ${mes === i ? COR_DARK : "var(--color-brand-border)"}`,
                      fontFamily: "var(--font-body)", fontSize: 12, cursor: "pointer",
                    }}>
                    {m.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl p-4" style={{ background: `${COR_GOLD}12`, border: `1px solid ${COR_GOLD}33` }}>
              <span style={{ fontSize: 20 }}>⏱️</span>
              <div>
                <p style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 700, color: COR_DARK }}>15–20 minutos</p>
                <p style={{ fontSize: 15, color: "var(--color-brand-gray)" }}>Tenha seu extrato bancário e faturas de cartão em mãos.</p>
              </div>
            </div>
          </div>
        )}

        {/* Passo 1 — Receitas */}
        {passo === 1 && (
          <div className="flex flex-col gap-6 max-w-2xl mx-auto">

            {/* Banner Roda da Vida — Finanças crítico */}
            {scoreFinancas !== null && scoreFinancas <= 4 && (
              <div className="flex items-start gap-3 rounded-xl px-4 py-4"
                style={{ background: "rgba(231,76,60,0.08)", border: "1.5px solid rgba(231,76,60,0.35)" }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>🚨</span>
                <div className="flex flex-col gap-1">
                  <p style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: COR_RED }}>
                    Sua área financeira está crítica (nota {scoreFinancas}/10).
                  </p>
                  <p style={{ fontSize: 13, color: COR_RED, lineHeight: 1.5, opacity: 0.85 }}>
                    Vamos entender o porquê. Preencha cada campo com atenção — o diagnóstico vai revelar onde a situação pode ser revertida.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 700, color: COR_DARK }}>
                  Receitas — {MESES[mes]}/{ANO_ATUAL}
                </h2>
                <div className="flex items-center gap-1.5">
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-brand-gray)" }}>Total</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, color: COR_GREEN }}>R$ {fmt(totalReceitas)}</span>
                </div>
              </div>
              <p style={{ fontSize: 15, color: "var(--color-brand-gray)" }}>
                Insira todas as suas fontes de renda do mês. Use valores <strong style={{ color: COR_DARK }}>líquidos</strong> (já descontado imposto).
              </p>
            </div>

            <SecaoFinanceira titulo="Fontes de Renda" emoji="📥" cor={COR_GREEN} total={totalReceitas}>
              <CampoReais label="Salário / Pro-labore" emoji="💼" valor={receitas.salario} onChange={(v) => setReceitas((p) => ({ ...p, salario: v }))} placeholder="5.000,00" cor={COR_GREEN} />
              <CampoReais label="Freelance / Consultoria" emoji="💻" valor={receitas.freelance} onChange={(v) => setReceitas((p) => ({ ...p, freelance: v }))} placeholder="0,00" cor={COR_GREEN} />
              <CampoReais label="Rendimentos de Investimentos" emoji="📈" valor={receitas.rendimentos} onChange={(v) => setReceitas((p) => ({ ...p, rendimentos: v }))} placeholder="0,00" cor={COR_GREEN} />
              <CampoReais label="Aluguel recebido" emoji="🏠" valor={receitas.aluguel} onChange={(v) => setReceitas((p) => ({ ...p, aluguel: v }))} placeholder="0,00" cor={COR_GREEN} />
              <CampoReais label="Outras receitas" emoji="➕" valor={receitas.outras} onChange={(v) => setReceitas((p) => ({ ...p, outras: v }))} placeholder="0,00" cor={COR_GREEN} />

              {/* Total destacado */}
              <div className="flex items-center justify-between rounded-xl px-4 py-4 mt-1"
                style={{ background: `${COR_GREEN}12`, border: `2px solid ${COR_GREEN}44` }}>
                <span style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: COR_DARK }}>Total de Receitas</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: COR_GREEN }}>R$ {fmt(totalReceitas)}</span>
              </div>
            </SecaoFinanceira>

            {totalReceitas === 0 && (
              <div className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: "rgba(231,76,60,0.07)", border: "1px solid rgba(231,76,60,0.25)" }}>
                <span style={{ fontSize: 16 }}>⚠️</span>
                <p style={{ fontSize: 13, color: COR_RED, fontWeight: 600 }}>Insira ao menos uma receita para continuar.</p>
              </div>
            )}

            {/* Âncora comportamental — compra implanejada */}
            <div className="flex flex-col gap-3 rounded-2xl p-5"
              style={{ background: `${COR_YELLOW}0a`, border: `1.5px solid ${COR_YELLOW}33` }}>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-xl" style={{ width: 36, height: 36, background: `${COR_YELLOW}20`, fontSize: 18 }}>🛒</div>
                <div>
                  <p style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 700, color: COR_DARK }}>Âncora comportamental</p>
                  <p style={{ fontSize: 12, color: "var(--color-brand-gray)" }}>Memória episódica — responda com situação específica</p>
                </div>
              </div>
              <label style={{ fontSize: 14, fontWeight: 600, color: COR_DARK, fontFamily: "var(--font-body)" }}>
                O que você comprou este mês que não estava planejado?
              </label>
              <textarea
                value={compraImplanejada}
                onChange={(e) => setCompraImplanejada(e.target.value)}
                rows={3}
                placeholder="Ex: Comprei um fone de ouvido de R$350 na sexta-feira depois de um dia estressante no trabalho. Também parcelei roupas no cartão no final de semana..."
                className="w-full rounded-xl px-4 py-3 outline-none resize-none"
                style={{ fontSize: 14, color: COR_DARK, background: "#fff", border: `1.5px solid ${compraImplanejada.trim() ? COR_YELLOW + "66" : "var(--color-brand-border)"}`, fontFamily: "var(--font-body)", lineHeight: 1.6 }}
              />
              {compraImplanejada.trim().length > 0 && (
                <p style={{ fontSize: 11, color: "var(--color-brand-gray)", fontStyle: "italic" }}>
                  Este padrão de compra emocional pode ser seu maior vazamento financeiro.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Passo 2 — Despesas */}
        {passo === 2 && (
          <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <div className="flex flex-col gap-1">
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 700, color: COR_DARK }}>
                Despesas e Investimentos
              </h2>
              <p style={{ fontSize: 15, color: "var(--color-brand-gray)" }}>
                Registre seus custos mensais e o que você destina para o futuro.
              </p>
            </div>

            {/* Custos Fixos */}
            <SecaoFinanceira titulo="Custos Fixos" emoji="🏛️" cor={COR_RED} total={totalFixos}>
              <CampoReais label="Moradia (aluguel / prestação)" emoji="🏠" valor={fixos.moradia} onChange={(v) => setFixos((p) => ({ ...p, moradia: v }))} cor={COR_RED} />
              <CampoReais label="Saúde (plano / remédios)" emoji="🏥" valor={fixos.saude} onChange={(v) => setFixos((p) => ({ ...p, saude: v }))} cor={COR_RED} />
              <CampoReais label="Internet / Telefone" emoji="📡" valor={fixos.internet} onChange={(v) => setFixos((p) => ({ ...p, internet: v }))} cor={COR_RED} />
              <CampoReais label="Transporte (combustível / passagem)" emoji="🚗" valor={fixos.transporte} onChange={(v) => setFixos((p) => ({ ...p, transporte: v }))} cor={COR_RED} />
              <CampoReais label="Escola / Faculdade" emoji="🎓" valor={fixos.escola} onChange={(v) => setFixos((p) => ({ ...p, escola: v }))} cor={COR_RED} />
            </SecaoFinanceira>

            {/* Custos Variáveis */}
            <SecaoFinanceira titulo="Custos Variáveis" emoji="🛒" cor={COR_YELLOW} total={totalVariaveis}>
              <CampoReais label="Alimentação (mercado + restaurante)" emoji="🍽️" valor={variaveis.alimentacao} onChange={(v) => setVariaveis((p) => ({ ...p, alimentacao: v }))} cor={COR_YELLOW} />
              <CampoReais label="Lazer e entretenimento" emoji="🎉" valor={variaveis.lazer} onChange={(v) => setVariaveis((p) => ({ ...p, lazer: v }))} cor={COR_YELLOW} />
              <CampoReais label="Assinaturas (streaming, apps)" emoji="📱" valor={variaveis.assinaturas} onChange={(v) => setVariaveis((p) => ({ ...p, assinaturas: v }))} cor={COR_YELLOW} />
              <CampoReais label="Roupas e acessórios" emoji="👗" valor={variaveis.roupas} onChange={(v) => setVariaveis((p) => ({ ...p, roupas: v }))} cor={COR_YELLOW} />
              <CampoReais label="Outros gastos" emoji="📦" valor={variaveis.outros} onChange={(v) => setVariaveis((p) => ({ ...p, outros: v }))} cor={COR_YELLOW} />
            </SecaoFinanceira>

            {/* Investimentos */}
            <SecaoFinanceira titulo="Investimentos" emoji="📈" cor={COR_BLUE} total={totalInvest}>
              <CampoReais label="Reserva de emergência" emoji="🛡️" valor={invest.reserva} onChange={(v) => setInvest((p) => ({ ...p, reserva: v }))} cor={COR_BLUE} />
              <CampoReais label="Investimentos (renda fixa / variável)" emoji="💹" valor={invest.investimentos} onChange={(v) => setInvest((p) => ({ ...p, investimentos: v }))} cor={COR_BLUE} />
              <CampoReais label="Previdência privada" emoji="🏦" valor={invest.previdencia} onChange={(v) => setInvest((p) => ({ ...p, previdencia: v }))} cor={COR_BLUE} />

              {totalInvest === 0 && (
                <div className="flex items-center gap-2 rounded-xl px-4 py-3"
                  style={{ background: `${COR_BLUE}0e`, border: `1px solid ${COR_BLUE}22` }}>
                  <span style={{ fontSize: 14 }}>💡</span>
                  <p style={{ fontSize: 15, color: COR_BLUE, lineHeight: 1.5 }}>
                    Mesmo R$ 50/mês já é investir no seu futuro. Não pule esta categoria.
                  </p>
                </div>
              )}
            </SecaoFinanceira>

            {/* Maior vazamento financeiro */}
            <div className="flex flex-col gap-3 rounded-2xl p-5"
              style={{ background: `${COR_RED}07`, border: `1.5px solid ${COR_RED}28` }}>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-xl" style={{ width: 36, height: 36, background: `${COR_RED}18`, fontSize: 18 }}>🕳️</div>
                <div>
                  <p style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 700, color: COR_DARK }}>Maior vazamento financeiro do mês</p>
                  <p style={{ fontSize: 12, color: "var(--color-brand-gray)" }}>O gasto que mais compromete seu saldo sem trazer valor real</p>
                </div>
              </div>
              <textarea
                value={vazamentoFinanceiro}
                onChange={(e) => setVazamentoFinanceiro(e.target.value)}
                rows={3}
                placeholder="Ex: Delivery todo dia — gasto em torno de R$800/mês sem perceber. / Assinaturas esquecidas (academia + 3 apps) = R$290/mês que não uso. / Parcelamentos do cartão que se acumularam..."
                className="w-full rounded-xl px-4 py-3 outline-none resize-none"
                style={{ fontSize: 14, color: COR_DARK, background: "#fff", border: `1.5px solid ${vazamentoFinanceiro.trim() ? COR_RED + "55" : "var(--color-brand-border)"}`, fontFamily: "var(--font-body)", lineHeight: 1.6 }}
              />
            </div>

            {/* Mini resumo */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total Gastos", valor: totalGastos, cor: COR_RED, emoji: "📤" },
                { label: "Investido", valor: totalInvest, cor: COR_BLUE, emoji: "📈" },
                { label: "Saldo", valor: saldo, cor: saldo >= 0 ? COR_GREEN : COR_RED, emoji: saldo >= 0 ? "✅" : "⚠️" },
              ].map((r) => (
                <div key={r.label} className="flex flex-col items-center gap-1 rounded-xl py-4 px-3 text-center"
                  style={{ background: `${r.cor}0e`, border: `1.5px solid ${r.cor}33` }}>
                  <span style={{ fontSize: 18 }}>{r.emoji}</span>
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 700, color: r.cor }}>
                    R$ {fmt(r.valor)}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--color-brand-gray)" }}>{r.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Passo 3 — Diagnóstico */}
        {passo === 3 && (
          <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <div className="flex flex-col gap-1">
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 700, color: COR_DARK }}>
                Diagnóstico — {MESES[mes]}/{ANO_ATUAL}
              </h2>
              <p style={{ fontSize: 15, color: "var(--color-brand-gray)" }}>
                Cada categoria é avaliada em relação à sua renda. O semáforo indica a saúde financeira de cada item.
              </p>
            </div>

            {/* Saldo em destaque */}
            <div
              className="rounded-2xl p-6 flex items-center gap-6"
              style={{ background: saldo >= 0 ? `${COR_GREEN}12` : `${COR_RED}10`, border: `2px solid ${saldo >= 0 ? COR_GREEN : COR_RED}44` }}
            >
              <div className="flex flex-col gap-1 flex-1">
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-brand-gray)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Saldo do Mês
                </span>
                <span style={{ fontFamily: "var(--font-heading)", fontSize: 36, fontWeight: 700, color: saldo >= 0 ? COR_GREEN : COR_RED, lineHeight: 1 }}>
                  {saldo >= 0 ? "+" : ""}R$ {fmt(saldo)}
                </span>
                <p style={{ fontSize: 15, color: "var(--color-brand-gray)", marginTop: 4 }}>
                  {saldo >= 0
                    ? saldo === 0
                      ? "Receitas e despesas empatadas — fique atento."
                      : `Você tem R$ ${fmt(saldo)} sobrando — considere investir.`
                    : `Déficit de R$ ${fmt(Math.abs(saldo))} — revise seus gastos urgente.`}
                </p>
              </div>
              <div
                className="flex items-center justify-center rounded-2xl shrink-0"
                style={{ width: 56, height: 56, background: saldo >= 0 ? COR_GREEN : COR_RED, fontSize: 28 }}
              >
                {saldo >= 0 ? "✅" : "🚨"}
              </div>
            </div>

            {/* Distribuição visual */}
            {totalReceitas > 0 && (
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-brand-border)", background: "#fff", boxShadow: "var(--shadow-card)" }}>
                <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-brand-border)" }}>
                  <p style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: COR_DARK }}>Distribuição da Renda</p>
                  <p style={{ fontSize: 15, color: "var(--color-brand-gray)", marginTop: 2 }}>Renda total: R$ {fmt(totalReceitas)}</p>
                </div>
                {/* Barra composta */}
                <div className="px-5 py-5 flex flex-col gap-4">
                  <div className="w-full rounded-full overflow-hidden flex" style={{ height: 20 }}>
                    {pctGastos > 0 && (
                      <div className="flex items-center justify-center transition-all duration-700"
                        style={{ width: `${Math.min(pctGastos, 100)}%`, background: COR_RED, minWidth: pctGastos > 5 ? 24 : 0 }}>
                        {pctGastos > 8 && <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>{pctGastos}%</span>}
                      </div>
                    )}
                    {pctInvest > 0 && (
                      <div className="flex items-center justify-center transition-all duration-700"
                        style={{ width: `${Math.min(pctInvest, 100 - pctGastos)}%`, background: COR_BLUE, minWidth: pctInvest > 5 ? 24 : 0 }}>
                        {pctInvest > 8 && <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>{pctInvest}%</span>}
                      </div>
                    )}
                    {pctSaldo > 0 && (
                      <div className="flex items-center justify-center flex-1 transition-all duration-700" style={{ background: COR_GREEN }}>
                        {pctSaldo > 8 && <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>{pctSaldo}%</span>}
                      </div>
                    )}
                    {saldo < 0 && (
                      <div className="flex-1" style={{ background: "rgba(231,76,60,0.15)" }} />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { label: "Gastos", pct: pctGastos, valor: totalGastos, cor: COR_RED },
                      { label: "Investimentos", pct: pctInvest, valor: totalInvest, cor: COR_BLUE },
                      { label: saldo >= 0 ? "Sobra" : "Déficit", pct: Math.abs(pctSaldo), valor: Math.abs(saldo), cor: saldo >= 0 ? COR_GREEN : COR_RED },
                    ].map((r) => (
                      <div key={r.label} className="flex items-center gap-2">
                        <div className="rounded-full" style={{ width: 10, height: 10, background: r.cor }} />
                        <span style={{ fontSize: 15, color: "var(--color-brand-gray)" }}>
                          {r.label}: <strong style={{ color: r.cor }}>{r.pct}%</strong> (R$ {fmt(r.valor)})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Semáforo por categoria */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-brand-border)", background: "#fff", boxShadow: "var(--shadow-card)" }}>
              <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-brand-border)", background: `${COR_DARK}05` }}>
                <p style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: COR_DARK }}>Semáforo por Categoria</p>
                <div className="flex gap-4 mt-2">
                  {[{ cor: COR_GREEN, label: "Saudável" }, { cor: COR_YELLOW, label: "Atenção" }, { cor: COR_RED, label: "Excedido" }].map((s) => (
                    <div key={s.label} className="flex items-center gap-1.5">
                      <div className="rounded-full" style={{ width: 8, height: 8, background: s.cor }} />
                      <span style={{ fontSize: 11, color: "var(--color-brand-gray)" }}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3 p-5">
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-brand-gray)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Custos Fixos</p>
                <LinhaDiagnostico label="Moradia" emoji="🏠" valor={num(fixos.moradia)} total={totalReceitas} chave="moradia" tipo="gasto" />
                <LinhaDiagnostico label="Saúde" emoji="🏥" valor={num(fixos.saude)} total={totalReceitas} chave="saude" tipo="gasto" />
                <LinhaDiagnostico label="Internet / Telefone" emoji="📡" valor={num(fixos.internet)} total={totalReceitas} chave="internet" tipo="gasto" />
                <LinhaDiagnostico label="Transporte" emoji="🚗" valor={num(fixos.transporte)} total={totalReceitas} chave="transporte" tipo="gasto" />
                <LinhaDiagnostico label="Escola / Educação" emoji="🎓" valor={num(fixos.escola)} total={totalReceitas} chave="escola" tipo="gasto" />
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-brand-gray)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 8 }}>Custos Variáveis</p>
                <LinhaDiagnostico label="Alimentação" emoji="🍽️" valor={num(variaveis.alimentacao)} total={totalReceitas} chave="alimentacao" tipo="gasto" />
                <LinhaDiagnostico label="Lazer" emoji="🎉" valor={num(variaveis.lazer)} total={totalReceitas} chave="lazer" tipo="gasto" />
                <LinhaDiagnostico label="Assinaturas" emoji="📱" valor={num(variaveis.assinaturas)} total={totalReceitas} chave="assinaturas" tipo="gasto" />
                <LinhaDiagnostico label="Roupas" emoji="👗" valor={num(variaveis.roupas)} total={totalReceitas} chave="roupas" tipo="gasto" />
                <LinhaDiagnostico label="Outros" emoji="📦" valor={num(variaveis.outros)} total={totalReceitas} chave="outros" tipo="gasto" />
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-brand-gray)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 8 }}>Investimentos</p>
                <LinhaDiagnostico label="Reserva de Emergência" emoji="🛡️" valor={num(invest.reserva)} total={totalReceitas} chave="reserva" tipo="investimento" />
                <LinhaDiagnostico label="Investimentos" emoji="💹" valor={num(invest.investimentos)} total={totalReceitas} chave="investimentos" tipo="investimento" />
                <LinhaDiagnostico label="Previdência" emoji="🏦" valor={num(invest.previdencia)} total={totalReceitas} chave="previdencia" tipo="investimento" />

                {totalGastos === 0 && totalInvest === 0 && (
                  <p style={{ fontSize: 13, color: "var(--color-brand-gray)", fontStyle: "italic", textAlign: "center", padding: "16px 0" }}>
                    Volte ao passo anterior e registre suas despesas.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </FerramentaLayout>
  );
}
