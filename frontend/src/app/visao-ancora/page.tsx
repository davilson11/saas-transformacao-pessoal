"use client";

import { useState, useRef } from "react";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface FormData {
  // Parte 1
  nomeCompleto: string;
  dataInicio: string;
  ondeEstou: string;
  tresPalavras: string;
  oQueMove: string;
  fe: string;
  // Parte 2
  manchete: string;
  areaReferencia: string;
  quemImpactou: string;
  maiorObstaculo: string;
  situacaoFinanceira: string;
  comoVive: string;
  // Parte 3
  pedido1: string;
  pedido2: string;
  pedido3: string;
  // Parte 4
  ref1nome: string; ref1area: string; ref1admiro: string; ref1aprendo: string;
  ref2nome: string; ref2area: string; ref2admiro: string; ref2aprendo: string;
  ref3nome: string; ref3area: string; ref3admiro: string; ref3aprendo: string;
  // Parte 5
  tiraSono: string;
  raivaBoa: string;
  daEnergia: string;
  doriProfunda: string;
  fariaDeGraca: string;
  mundoPerderia: string;
  // Parte 6
  declaracaoVida: string;
}

const initial: FormData = {
  nomeCompleto:"", dataInicio:"", ondeEstou:"", tresPalavras:"", oQueMove:"", fe:"",
  manchete:"", areaReferencia:"", quemImpactou:"", maiorObstaculo:"", situacaoFinanceira:"", comoVive:"",
  pedido1:"", pedido2:"", pedido3:"",
  ref1nome:"", ref1area:"", ref1admiro:"", ref1aprendo:"",
  ref2nome:"", ref2area:"", ref2admiro:"", ref2aprendo:"",
  ref3nome:"", ref3area:"", ref3admiro:"", ref3aprendo:"",
  tiraSono:"", raivaBoa:"", daEnergia:"", doriProfunda:"", fariaDeGraca:"", mundoPerderia:"",
  declaracaoVida:"",
};

const PARTS = [
  { id: 1, emoji: "👤", titulo: "Quem Eu Sou",           cor: "#2D5A4F" },
  { id: 2, emoji: "📰", titulo: "Minha Capa da Forbes",  cor: "#A0692D" },
  { id: 3, emoji: "🧞", titulo: "Os 3 Pedidos do Gênio", cor: "#6B21A8" },
  { id: 4, emoji: "⭐", titulo: "Minhas Referências",     cor: "#1D4ED8" },
  { id: 5, emoji: "🔥", titulo: "O Que Me Move",         cor: "#B91C1C" },
  { id: 6, emoji: "✍️", titulo: "Declaração de Vida",    cor: "#1E392A" },
];

// ─── Componentes utilitários ──────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display:"block", fontFamily:"var(--font-heading)", fontWeight:600,
      fontSize:14, color:"#1E392A", marginBottom:6 }}>
      {children}
    </label>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize:12, color:"#9CA3AF", fontStyle:"italic", marginTop:4, lineHeight:1.5 }}>
      {children}
    </p>
  );
}

function TextInput({ value, onChange, placeholder }: { value:string; onChange:(v:string)=>void; placeholder:string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width:"100%", padding:"12px 14px", borderRadius:10,
        border:"1.5px solid #D1D5DB", fontFamily:"var(--font-body)",
        fontSize:14, color:"#1E392A", background:"#fff", outline:"none",
        transition:"border-color 200ms",
      }}
      onFocus={e => e.target.style.borderColor="#E0A55F"}
      onBlur={e => e.target.style.borderColor="#D1D5DB"}
    />
  );
}

function TextArea({ value, onChange, placeholder, rows=4 }: { value:string; onChange:(v:string)=>void; placeholder:string; rows?:number }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width:"100%", padding:"12px 14px", borderRadius:10,
        border:"1.5px solid #D1D5DB", fontFamily:"var(--font-body)",
        fontSize:14, color:"#1E392A", background:"#fff", outline:"none",
        resize:"vertical", lineHeight:1.6, transition:"border-color 200ms",
      }}
      onFocus={e => e.target.style.borderColor="#E0A55F"}
      onBlur={e => e.target.style.borderColor="#D1D5DB"}
    />
  );
}

function SectionCard({ emoji, titulo, cor, children }: { emoji:string; titulo:string; cor:string; children:React.ReactNode }) {
  return (
    <div style={{
      background:"#fff", borderRadius:18, overflow:"hidden",
      boxShadow:"0 2px 16px rgba(30,57,42,0.08)", marginBottom:20,
      border:`1px solid ${cor}22`,
    }}>
      <div style={{
        background:`linear-gradient(135deg, ${cor} 0%, ${cor}cc 100%)`,
        padding:"18px 24px", display:"flex", alignItems:"center", gap:12,
      }}>
        <span style={{ fontSize:24 }}>{emoji}</span>
        <h2 style={{
          fontFamily:"var(--font-heading)", fontWeight:700,
          fontSize:18, color:"#F4F1DE", margin:0,
        }}>{titulo}</h2>
      </div>
      <div style={{ padding:"24px 24px 20px" }}>{children}</div>
    </div>
  );
}

function FieldGroup({ children }: { children:React.ReactNode }) {
  return <div style={{ marginBottom:18 }}>{children}</div>;
}

// ─── Gerador de resumo para impressão ─────────────────────────────────────────
function gerarResumoHTML(f: FormData): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Minha Visão Âncora — ${f.nomeCompleto || "A Virada"}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;1,400&family=DM+Sans:wght@400;600&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'DM Sans',sans-serif; background:#F4F1DE; color:#1E392A; padding:32px; max-width:800px; margin:0 auto; }
  .cover { background:linear-gradient(135deg,#1E392A,#2D5A4F); border-radius:20px; padding:48px 40px; text-align:center; margin-bottom:32px; }
  .cover-badge { font-size:11px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:#E0A55F; margin-bottom:16px; }
  .cover-title { font-family:'Fraunces',serif; font-size:40px; color:#F4F1DE; line-height:1.1; margin-bottom:12px; }
  .cover-name { font-size:18px; color:rgba(244,241,222,.75); font-style:italic; margin-bottom:8px; }
  .cover-date { font-size:13px; color:rgba(244,241,222,.45); }
  .gold-line { height:3px; background:#E0A55F; border-radius:99px; width:60px; margin:20px auto; }
  .section { background:#fff; border-radius:14px; padding:28px; margin-bottom:20px; break-inside:avoid; }
  .section-header { display:flex; align-items:center; gap:10px; margin-bottom:20px; padding-bottom:12px; border-bottom:2px solid #E0A55F; }
  .section-emoji { font-size:22px; }
  .section-title { font-family:'Fraunces',serif; font-size:20px; color:#1E392A; }
  .field { margin-bottom:16px; }
  .field-label { font-size:11px; font-weight:600; color:#9CA3AF; text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px; }
  .field-value { font-size:15px; color:#1E392A; line-height:1.65; white-space:pre-wrap; }
  .field-empty { font-size:13px; color:#D1D5DB; font-style:italic; }
  .manchete-box { background:linear-gradient(135deg,#1E392A,#2D5A4F); border-radius:14px; padding:28px; margin:12px 0; }
  .manchete-text { font-family:'Fraunces',serif; font-size:18px; color:#F4F1DE; line-height:1.5; font-style:italic; }
  .declaracao-box { background:#FDF8F0; border:2px solid #E0A55F; border-radius:14px; padding:28px; margin:12px 0; text-align:center; }
  .declaracao-text { font-family:'Fraunces',serif; font-size:20px; color:#1E392A; line-height:1.6; font-style:italic; }
  .protocolo { background:linear-gradient(135deg,#1E392A,#2D5A4F); border-radius:14px; padding:28px; margin-top:20px; }
  .protocolo-title { font-family:'Fraunces',serif; font-size:18px; color:#E0A55F; margin-bottom:16px; }
  .protocolo-item { display:flex; gap:12px; align-items:flex-start; margin-bottom:10px; }
  .protocolo-dot { width:8px; height:8px; background:#E0A55F; border-radius:50%; margin-top:6px; flex-shrink:0; }
  .protocolo-text { font-size:13px; color:rgba(244,241,222,.8); line-height:1.5; }
  .footer { text-align:center; margin-top:32px; padding:20px; }
  .footer-text { font-size:12px; color:#9CA3AF; }
  .ref-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; }
  .ref-card { background:#F7F5EE; border-radius:10px; padding:14px; }
  .ref-name { font-weight:600; font-size:14px; color:#1E392A; margin-bottom:4px; }
  .ref-area { font-size:11px; color:#E0A55F; font-weight:600; text-transform:uppercase; letter-spacing:.05em; margin-bottom:8px; }
  .ref-desc { font-size:12px; color:#6B7280; line-height:1.5; }
  @media print { body { padding:16px; } .section { break-inside:avoid; } }
</style>
</head>
<body>

<div class="cover">
  <div class="cover-badge">✦ A Virada — Ferramenta F00 ✦</div>
  <div class="cover-title">Minha Visão Âncora</div>
  ${f.nomeCompleto ? `<div class="cover-name">${f.nomeCompleto}</div>` : ""}
  ${f.dataInicio ? `<div class="cover-date">Iniciado em ${f.dataInicio}</div>` : ""}
  <div class="gold-line"></div>
  <div style="font-size:13px;color:rgba(244,241,222,.55);font-style:italic;">
    "O documento mais importante da sua jornada de transformação"
  </div>
</div>

${f.manchete ? `
<div class="manchete-box">
  <div style="font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#E0A55F;margin-bottom:12px;">📰 Minha Capa da Forbes</div>
  <div class="manchete-text">"${f.manchete}"</div>
</div>` : ""}

${f.declaracaoVida ? `
<div class="declaracao-box">
  <div style="font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#A0692D;margin-bottom:12px;">✍️ Minha Declaração de Vida</div>
  <div class="declaracao-text">"${f.declaracaoVida}"</div>
</div>` : ""}

<div class="section">
  <div class="section-header">
    <span class="section-emoji">👤</span>
    <span class="section-title">Quem Eu Sou</span>
  </div>
  ${f.tresPalavras ? `<div class="field"><div class="field-label">Em 3 palavras</div><div class="field-value" style="font-size:20px;font-weight:600;color:#1E392A;">${f.tresPalavras}</div></div>` : ""}
  ${f.oQueMove ? `<div class="field"><div class="field-label">O que me move profundamente</div><div class="field-value">${f.oQueMove}</div></div>` : ""}
  ${f.fe ? `<div class="field"><div class="field-label">Minha fé / o que me sustenta</div><div class="field-value">${f.fe}</div></div>` : ""}
  ${f.ondeEstou ? `<div class="field"><div class="field-label">Onde estou agora</div><div class="field-value">${f.ondeEstou}</div></div>` : ""}
</div>

<div class="section">
  <div class="section-header">
    <span class="section-emoji">🧞</span>
    <span class="section-title">Os 3 Pedidos do Gênio</span>
  </div>
  ${f.pedido1 ? `<div class="field"><div class="field-label">1° Pedido — Vida Pessoal</div><div class="field-value">${f.pedido1}</div></div>` : ""}
  ${f.pedido2 ? `<div class="field"><div class="field-label">2° Pedido — Carreira & Impacto</div><div class="field-value">${f.pedido2}</div></div>` : ""}
  ${f.pedido3 ? `<div class="field"><div class="field-label">3° Pedido — Quem Amo</div><div class="field-value">${f.pedido3}</div></div>` : ""}
</div>

${(f.ref1nome || f.ref2nome || f.ref3nome) ? `
<div class="section">
  <div class="section-header">
    <span class="section-emoji">⭐</span>
    <span class="section-title">Minhas Referências</span>
  </div>
  <div class="ref-grid">
    ${f.ref1nome ? `<div class="ref-card"><div class="ref-name">${f.ref1nome}</div>${f.ref1area ? `<div class="ref-area">${f.ref1area}</div>` : ""}${f.ref1admiro ? `<div class="ref-desc">${f.ref1admiro}</div>` : ""}</div>` : ""}
    ${f.ref2nome ? `<div class="ref-card"><div class="ref-name">${f.ref2nome}</div>${f.ref2area ? `<div class="ref-area">${f.ref2area}</div>` : ""}${f.ref2admiro ? `<div class="ref-desc">${f.ref2admiro}</div>` : ""}</div>` : ""}
    ${f.ref3nome ? `<div class="ref-card"><div class="ref-name">${f.ref3nome}</div>${f.ref3area ? `<div class="ref-area">${f.ref3area}</div>` : ""}${f.ref3admiro ? `<div class="ref-desc">${f.ref3admiro}</div>` : ""}</div>` : ""}
  </div>
</div>` : ""}

<div class="section">
  <div class="section-header">
    <span class="section-emoji">🔥</span>
    <span class="section-title">O Que Me Move</span>
  </div>
  ${f.tiraSono ? `<div class="field"><div class="field-label">O que tira meu sono</div><div class="field-value">${f.tiraSono}</div></div>` : ""}
  ${f.daEnergia ? `<div class="field"><div class="field-label">O que me dá energia</div><div class="field-value">${f.daEnergia}</div></div>` : ""}
  ${f.fariaDeGraca ? `<div class="field"><div class="field-label">O que faria de graça para sempre</div><div class="field-value">${f.fariaDeGraca}</div></div>` : ""}
  ${f.mundoPerderia ? `<div class="field"><div class="field-label">O que o mundo perderia se eu desistisse</div><div class="field-value">${f.mundoPerderia}</div></div>` : ""}
</div>

<div class="protocolo">
  <div class="protocolo-title">✦ Protocolo de Ancoragem Diária</div>
  <div class="protocolo-item"><div class="protocolo-dot"></div><div class="protocolo-text"><strong style="color:#F4F1DE">Manhã:</strong> Leia sua manchete e declaração em voz alta — 2 min</div></div>
  <div class="protocolo-item"><div class="protocolo-dot"></div><div class="protocolo-text"><strong style="color:#F4F1DE">Tarde:</strong> Pergunte — "Esta ação me aproxima da minha visão?" — 30 seg</div></div>
  <div class="protocolo-item"><div class="protocolo-dot"></div><div class="protocolo-text"><strong style="color:#F4F1DE">Noite:</strong> Releia sua declaração. Anote 1 passo dado hoje — 1 min</div></div>
  <div class="protocolo-item"><div class="protocolo-dot"></div><div class="protocolo-text"><strong style="color:#F4F1DE">Domingo:</strong> Releia tudo. A visão evoluiu? Ajuste o que precisar — 5 min</div></div>
</div>

<div class="footer">
  <div class="footer-text">A Virada · Ferramenta F00 — Visão Âncora · O Norte que guia todas as outras ferramentas</div>
  <div class="footer-text" style="margin-top:6px">Releia todos os dias. A visão que não é lembrada vira sonho. A que é lembrada vira destino.</div>
</div>

</body>
</html>`;
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function VisaoAncora() {
  const [form, setForm] = useState<FormData>(initial);
  const [etapa, setEtapa] = useState<"form" | "resultado">("form");
  const [parteAtual, setParteAtual] = useState(1);
  const topoRef = useRef<HTMLDivElement>(null);

  const set = (campo: keyof FormData) => (v: string) =>
    setForm(prev => ({ ...prev, [campo]: v }));

  const avancar = () => {
    if (parteAtual < 6) {
      setParteAtual(p => p + 1);
      topoRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      setEtapa("resultado");
      topoRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const voltar = () => {
    if (parteAtual > 1) {
      setParteAtual(p => p - 1);
      topoRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const baixarPDF = () => {
    const html = gerarResumoHTML(form);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visao-ancora-${form.nomeCompleto.replace(/\s+/g, "-").toLowerCase() || "minha"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const progresso = ((parteAtual - 1) / 5) * 100;

  return (
    <div style={{ minHeight:"100vh", background:"#F4F1DE", fontFamily:"var(--font-body)" }}>

      {/* Header */}
      <div style={{
        background:"linear-gradient(135deg, #1E392A 0%, #2D5A4F 100%)",
        padding:"32px 20px 28px", textAlign:"center",
      }}>
        <div ref={topoRef} />
        <p style={{ fontSize:11, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase",
          color:"#E0A55F", marginBottom:10 }}>✦ A Virada — Ferramenta F00 ✦</p>
        <h1 style={{ fontFamily:"var(--font-heading)", fontWeight:700, fontSize:"clamp(28px,6vw,44px)",
          color:"#F4F1DE", lineHeight:1.1, marginBottom:10 }}>
          Visão Âncora
        </h1>
        <p style={{ fontSize:14, color:"rgba(244,241,222,.65)", fontStyle:"italic", maxWidth:400, margin:"0 auto" }}>
          O documento mais importante da sua jornada de transformação
        </p>
      </div>

      {etapa === "form" && (
        <div style={{ maxWidth:640, margin:"0 auto", padding:"24px 16px 40px" }}>

          {/* Barra de progresso */}
          <div style={{ background:"#fff", borderRadius:14, padding:"16px 20px", marginBottom:20,
            boxShadow:"0 2px 8px rgba(30,57,42,.08)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <span style={{ fontSize:13, fontWeight:600, color:"#1E392A" }}>
                Parte {parteAtual} de 6 — {PARTS[parteAtual-1].titulo}
              </span>
              <span style={{ fontSize:13, color:"#E0A55F", fontWeight:700 }}>
                {Math.round(progresso)}%
              </span>
            </div>
            <div style={{ height:6, background:"#E5E7EB", borderRadius:99, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${progresso}%`, background:"linear-gradient(90deg,#1E392A,#E0A55F)",
                borderRadius:99, transition:"width 400ms ease" }} />
            </div>
            {/* Dots das partes */}
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:10 }}>
              {PARTS.map(p => (
                <div key={p.id} style={{
                  width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:12,
                  background: p.id < parteAtual ? "#1E392A" : p.id === parteAtual ? "#E0A55F" : "#E5E7EB",
                  color: p.id <= parteAtual ? "#fff" : "#9CA3AF",
                  fontWeight:700, transition:"all 300ms",
                }}>
                  {p.id < parteAtual ? "✓" : p.id}
                </div>
              ))}
            </div>
          </div>

          {/* Instrução inicial — só na parte 1 */}
          {parteAtual === 1 && (
            <div style={{ background:"#FDF8F0", border:"1.5px solid #E0A55F", borderRadius:14,
              padding:"16px 18px", marginBottom:20 }}>
              <p style={{ fontSize:13, color:"#A0692D", lineHeight:1.65 }}>
                📋 <strong>Como usar:</strong> Reserve 60 minutos em um lugar silencioso. Desligue o celular.
                Responda com o coração, não com a razão. Não existe resposta certa — existe a resposta <em>verdadeira</em>.
                Depois imprima ou releia toda manhã por 21 dias.
              </p>
            </div>
          )}

          {/* ── PARTE 1 ── */}
          {parteAtual === 1 && (
            <SectionCard emoji="👤" titulo="Quem Eu Sou" cor="#2D5A4F">
              <FieldGroup>
                <Label>Seu nome completo</Label>
                <TextInput value={form.nomeCompleto} onChange={set("nomeCompleto")} placeholder="Como você quer ser lembrado pela história" />
              </FieldGroup>
              <FieldGroup>
                <Label>Data de início da jornada</Label>
                <TextInput value={form.dataInicio} onChange={set("dataInicio")} placeholder="DD/MM/AAAA — o dia em que você decidiu mudar" />
              </FieldGroup>
              <FieldGroup>
                <Label>Onde estou agora</Label>
                <TextInput value={form.ondeEstou} onChange={set("ondeEstou")} placeholder="Cidade, contexto, momento atual da vida" />
              </FieldGroup>
              <FieldGroup>
                <Label>Em 3 palavras, quem sou eu</Label>
                <TextInput value={form.tresPalavras} onChange={set("tresPalavras")} placeholder="Ex: Determinado. Criativo. Em evolução." />
              </FieldGroup>
              <FieldGroup>
                <Label>O que me move profundamente</Label>
                <TextArea value={form.oQueMove} onChange={set("oQueMove")} placeholder="O que faz seu coração acelerar quando você pensa no futuro..." rows={3} />
              </FieldGroup>
              <FieldGroup>
                <Label>Minha fé / o que me sustenta</Label>
                <TextArea value={form.fe} onChange={set("fe")} placeholder="O que te ancora quando tudo parece desmoronar..." rows={3} />
              </FieldGroup>
            </SectionCard>
          )}

          {/* ── PARTE 2 ── */}
          {parteAtual === 2 && (
            <SectionCard emoji="📰" titulo="Minha Capa da Forbes" cor="#A0692D">
              <div style={{ background:"#FFFBEB", border:"1px solid #E0A55F", borderRadius:10,
                padding:"12px 14px", marginBottom:20 }}>
                <p style={{ fontSize:13, color:"#92400E", lineHeight:1.6 }}>
                  💡 <em>"Se daqui 10 anos sua vida desse completamente certo — qual seria a manchete?"</em><br/>
                  Seja específico. Use seu nome. Escreva como se já fosse real.
                </p>
              </div>
              <FieldGroup>
                <Label>📰 A manchete da minha vida ideal</Label>
                <TextArea value={form.manchete} onChange={set("manchete")} rows={4}
                  placeholder='Ex: "Davilson Santos, criador de A Virada, transformou a vida de 100.000 pessoas. Hoje é referência mundial em desenvolvimento humano."' />
                <Hint>Esta é a frase que você vai ler toda manhã. Faça ela arrepiar.</Hint>
              </FieldGroup>
              <FieldGroup>
                <Label>Em que área da vida você se tornou referência?</Label>
                <TextArea value={form.areaReferencia} onChange={set("areaReferencia")} rows={2} placeholder="Carreira, família, negócios, espiritualidade, impacto..." />
              </FieldGroup>
              <FieldGroup>
                <Label>Quem foi impactado pela sua transformação?</Label>
                <TextArea value={form.quemImpactou} onChange={set("quemImpactou")} rows={2} placeholder="Família, pessoas ao redor, clientes, comunidade..." />
              </FieldGroup>
              <FieldGroup>
                <Label>Qual foi o maior obstáculo que você superou?</Label>
                <TextArea value={form.maiorObstaculo} onChange={set("maiorObstaculo")} rows={2} placeholder="O que tornou sua história digna de capa..." />
              </FieldGroup>
              <FieldGroup>
                <Label>Como está sua situação financeira neste futuro?</Label>
                <TextArea value={form.situacaoFinanceira} onChange={set("situacaoFinanceira")} rows={2} placeholder="Seja específico — números, liberdade, o que conquistou..." />
              </FieldGroup>
              <FieldGroup>
                <Label>Onde e como você vive?</Label>
                <TextArea value={form.comoVive} onChange={set("comoVive")} rows={2} placeholder="Casa, cidade, rotina, com quem, como é um dia típico..." />
              </FieldGroup>
            </SectionCard>
          )}

          {/* ── PARTE 3 ── */}
          {parteAtual === 3 && (
            <SectionCard emoji="🧞" titulo="Os 3 Pedidos do Gênio" cor="#6B21A8">
              <div style={{ background:"#F5F3FF", border:"1px solid #8B5CF6", borderRadius:10,
                padding:"12px 14px", marginBottom:20 }}>
                <p style={{ fontSize:13, color:"#5B21B6", lineHeight:1.6 }}>
                  ⚠️ <strong>Regra:</strong> Escreva o que seu coração quer — não o que sua razão acha possível.
                  Proibido ser "realista" aqui. Sem limites, sem julgamentos.
                </p>
              </div>
              <FieldGroup>
                <Label>🧞 1° Pedido — O que você mais quer para sua VIDA PESSOAL?</Label>
                <TextArea value={form.pedido1} onChange={set("pedido1")} rows={4} placeholder="Saúde, relacionamentos, família, experiências, liberdade..." />
              </FieldGroup>
              <FieldGroup>
                <Label>🧞 2° Pedido — O que você mais quer para sua CARREIRA e IMPACTO?</Label>
                <TextArea value={form.pedido2} onChange={set("pedido2")} rows={4} placeholder="Missão, reconhecimento, negócio, legado, contribuição..." />
              </FieldGroup>
              <FieldGroup>
                <Label>🧞 3° Pedido — O que você mais quer para quem você AMA?</Label>
                <TextArea value={form.pedido3} onChange={set("pedido3")} rows={4} placeholder="Família, amigos, pessoas que dependem de você, comunidade..." />
              </FieldGroup>
            </SectionCard>
          )}

          {/* ── PARTE 4 ── */}
          {parteAtual === 4 && (
            <SectionCard emoji="⭐" titulo="Minhas Referências" cor="#1D4ED8">
              <div style={{ background:"#EFF6FF", border:"1px solid #3B82F6", borderRadius:10,
                padding:"12px 14px", marginBottom:20 }}>
                <p style={{ fontSize:13, color:"#1D4ED8", lineHeight:1.6 }}>
                  💡 Você é a média das referências que tem. Quem você admira revela quem quer se tornar.
                  Pode ser pessoa, empresa, livro, movimento.
                </p>
              </div>
              {[1,2,3].map(n => (
                <div key={n} style={{ background:"#F7F5EE", borderRadius:12, padding:"16px",
                  marginBottom:14, border:"1px solid #E5E0D0" }}>
                  <p style={{ fontFamily:"var(--font-heading)", fontWeight:700, fontSize:14,
                    color:"#E0A55F", marginBottom:12 }}>Referência {n}</p>
                  <FieldGroup>
                    <Label>Nome / quem é</Label>
                    <TextInput value={form[`ref${n}nome` as keyof FormData]} onChange={set(`ref${n}nome` as keyof FormData)} placeholder="Ex: Brenno Burchard, G4 Educação, Livro Hábitos Atômicos..." />
                  </FieldGroup>
                  <FieldGroup>
                    <Label>Área de vida</Label>
                    <TextInput value={form[`ref${n}area` as keyof FormData]} onChange={set(`ref${n}area` as keyof FormData)} placeholder="Ex: Negócios, Espiritualidade, Saúde..." />
                  </FieldGroup>
                  <FieldGroup>
                    <Label>O que admiro nela</Label>
                    <TextArea value={form[`ref${n}admiro` as keyof FormData]} onChange={set(`ref${n}admiro` as keyof FormData)} rows={2} placeholder="O que especificamente te inspira..." />
                  </FieldGroup>
                  <FieldGroup>
                    <Label>O que vou aprender / imitar</Label>
                    <TextArea value={form[`ref${n}aprendo` as keyof FormData]} onChange={set(`ref${n}aprendo` as keyof FormData)} rows={2} placeholder="Ação concreta que vai copiar desta referência..." />
                  </FieldGroup>
                </div>
              ))}
            </SectionCard>
          )}

          {/* ── PARTE 5 ── */}
          {parteAtual === 5 && (
            <SectionCard emoji="🔥" titulo="O Que Me Move e Preocupa" cor="#B91C1C">
              <FieldGroup>
                <Label>😤 O que tira meu sono hoje?</Label>
                <TextArea value={form.tiraSono} onChange={set("tiraSono")} rows={3} placeholder="Que preocupações ficam na sua cabeça às 3h da manhã..." />
              </FieldGroup>
              <FieldGroup>
                <Label>🔥 O que me deixa com raiva (boa)?</Label>
                <TextArea value={form.raivaBoa} onChange={set("raivaBoa")} rows={3} placeholder="Que injustiça ou problema no mundo você não aguenta ver..." />
              </FieldGroup>
              <FieldGroup>
                <Label>💪 O que me dá energia só de pensar?</Label>
                <TextArea value={form.daEnergia} onChange={set("daEnergia")} rows={3} placeholder="O que faz seus olhos brilharem quando você fala sobre..." />
              </FieldGroup>
              <FieldGroup>
                <Label>😢 O que me dói profundamente?</Label>
                <TextArea value={form.doriProfunda} onChange={set("doriProfunda")} rows={3} placeholder="Qual dor pessoal ou alheia você mais quer resolver..." />
              </FieldGroup>
              <FieldGroup>
                <Label>🌟 O que eu faria de graça para sempre?</Label>
                <TextArea value={form.fariaDeGraca} onChange={set("fariaDeGraca")} rows={3} placeholder="Se dinheiro não fosse necessário, o que você faria..." />
              </FieldGroup>
              <FieldGroup>
                <Label>⚡ O que o mundo perderia se eu desistisse?</Label>
                <TextArea value={form.mundoPerderia} onChange={set("mundoPerderia")} rows={3} placeholder="Qual contribuição única só você pode dar..." />
                <Hint>Esta é a pergunta mais importante desta seção. Responda com coragem.</Hint>
              </FieldGroup>
            </SectionCard>
          )}

          {/* ── PARTE 6 ── */}
          {parteAtual === 6 && (
            <SectionCard emoji="✍️" titulo="Minha Declaração de Vida" cor="#1E392A">
              <div style={{ background:"#FDF8F0", border:"1.5px solid #E0A55F", borderRadius:10,
                padding:"14px 16px", marginBottom:20 }}>
                <p style={{ fontSize:13, color:"#A0692D", lineHeight:1.7 }}>
                  📝 <strong>Modelo:</strong> <em>"Eu sou [QUEM VOCÊ É] que [O QUE FAZ] para [QUEM IMPACTA],
                  porque [SEU PORQUÊ PROFUNDO]."</em>
                </p>
                <p style={{ fontSize:12, color:"#C8914A", marginTop:8, lineHeight:1.5 }}>
                  Esta é a síntese de tudo que você escreveu. A frase que você vai reler toda manhã
                  por 12 meses. Faça ela ser verdadeira e ao mesmo tempo aspiracional.
                </p>
              </div>
              <FieldGroup>
                <Label>✍️ Minha Declaração de Vida</Label>
                <TextArea value={form.declaracaoVida} onChange={set("declaracaoVida")} rows={5}
                  placeholder='Ex: "Eu sou Davilson Santos, um criador que transforma vidas através de ferramentas de autoconhecimento, porque acredito que toda pessoa tem um potencial inexplorado esperando para florescer."' />
                <Hint>Escreva na primeira pessoa, no presente, como se já fosse realidade.</Hint>
              </FieldGroup>

              {/* Preview da declaração */}
              {form.declaracaoVida && (
                <div style={{ background:"linear-gradient(135deg,#1E392A,#2D5A4F)", borderRadius:14,
                  padding:"24px", marginTop:8, textAlign:"center" }}>
                  <p style={{ fontFamily:"var(--font-heading)", fontSize:16, color:"#F4F1DE",
                    lineHeight:1.7, fontStyle:"italic" }}>
                    "{form.declaracaoVida}"
                  </p>
                  <div style={{ width:40, height:2, background:"#E0A55F", borderRadius:99, margin:"16px auto 0" }} />
                  <p style={{ fontSize:12, color:"rgba(244,241,222,.5)", marginTop:8 }}>
                    {form.nomeCompleto || "Sua Declaração de Vida"}
                  </p>
                </div>
              )}
            </SectionCard>
          )}

          {/* Navegação */}
          <div style={{ display:"flex", gap:12, marginTop:8 }}>
            {parteAtual > 1 && (
              <button onClick={voltar} style={{
                flex:1, padding:"14px", borderRadius:12, border:"1.5px solid #D1D5DB",
                background:"#fff", color:"#1E392A", fontFamily:"var(--font-heading)",
                fontWeight:600, fontSize:15, cursor:"pointer",
              }}>
                ← Voltar
              </button>
            )}
            <button onClick={avancar} style={{
              flex:2, padding:"14px", borderRadius:12, border:"none",
              background: parteAtual === 6
                ? "linear-gradient(135deg,#1E392A,#2D5A4F)"
                : "#E0A55F",
              color: parteAtual === 6 ? "#F4F1DE" : "#1E392A",
              fontFamily:"var(--font-heading)", fontWeight:700, fontSize:15, cursor:"pointer",
              boxShadow: parteAtual === 6 ? "0 4px 20px rgba(30,57,42,.3)" : "0 4px 16px rgba(224,165,95,.4)",
            }}>
              {parteAtual === 6 ? "✦ Gerar Minha Visão Âncora" : "Continuar →"}
            </button>
          </div>
        </div>
      )}

      {/* ── RESULTADO ── */}
      {etapa === "resultado" && (
        <div style={{ maxWidth:640, margin:"0 auto", padding:"24px 16px 40px" }}>

          {/* Card de parabéns */}
          <div style={{ background:"linear-gradient(135deg,#1E392A,#2D5A4F)", borderRadius:20,
            padding:"32px 24px", textAlign:"center", marginBottom:20,
            boxShadow:"0 8px 32px rgba(30,57,42,.3)" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🎯</div>
            <h2 style={{ fontFamily:"var(--font-heading)", fontWeight:700, fontSize:26,
              color:"#F4F1DE", marginBottom:10 }}>
              Sua Visão Âncora está criada!
            </h2>
            <p style={{ fontSize:14, color:"rgba(244,241,222,.7)", lineHeight:1.65 }}>
              Você acabou de fazer algo que menos de 5% das pessoas fazem:<br/>
              parar, olhar para dentro e definir com clareza para onde vai.
            </p>
            <div style={{ width:48, height:3, background:"#E0A55F", borderRadius:99, margin:"20px auto" }} />
            <p style={{ fontSize:13, color:"rgba(244,241,222,.5)", fontStyle:"italic" }}>
              "A visão que não é lembrada todos os dias vira sonho.<br/>A que é lembrada vira destino."
            </p>
          </div>

          {/* Manchete em destaque */}
          {form.manchete && (
            <div style={{ background:"#FDF8F0", border:"2px solid #E0A55F", borderRadius:16,
              padding:"24px", marginBottom:16, textAlign:"center" }}>
              <p style={{ fontSize:11, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase",
                color:"#A0692D", marginBottom:12 }}>📰 Sua Capa da Forbes</p>
              <p style={{ fontFamily:"var(--font-heading)", fontSize:17, color:"#1E392A",
                lineHeight:1.6, fontStyle:"italic" }}>
                "{form.manchete}"
              </p>
            </div>
          )}

          {/* Declaração em destaque */}
          {form.declaracaoVida && (
            <div style={{ background:"linear-gradient(135deg,#1E392A,#2D5A4F)", borderRadius:16,
              padding:"24px", marginBottom:16, textAlign:"center" }}>
              <p style={{ fontSize:11, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase",
                color:"#E0A55F", marginBottom:12 }}>✍️ Sua Declaração de Vida</p>
              <p style={{ fontFamily:"var(--font-heading)", fontSize:17, color:"#F4F1DE",
                lineHeight:1.65, fontStyle:"italic" }}>
                "{form.declaracaoVida}"
              </p>
            </div>
          )}

          {/* Protocolo */}
          <div style={{ background:"#fff", borderRadius:16, padding:"20px 24px", marginBottom:20,
            boxShadow:"0 2px 8px rgba(30,57,42,.08)" }}>
            <h3 style={{ fontFamily:"var(--font-heading)", fontSize:16, color:"#1E392A", marginBottom:16 }}>
              ✦ Seu Protocolo de Ancoragem Diária
            </h3>
            {[
              { hora:"🌅 Manhã", acao:"Leia sua manchete e declaração em voz alta — 2 min" },
              { hora:"☕ Café", acao:"Visualize um detalhe da sua vida ideal — 1 min" },
              { hora:"🎯 Tarde", acao:"\"Esta ação me aproxima da minha visão?\" — 30 seg" },
              { hora:"🌙 Noite", acao:"Releia sua declaração. Anote 1 passo dado — 1 min" },
              { hora:"📅 Domingo", acao:"Releia tudo e ajuste o que evoluiu — 5 min" },
            ].map((p, i) => (
              <div key={i} style={{ display:"flex", gap:14, alignItems:"center", marginBottom:10,
                padding:"10px 14px", borderRadius:10,
                background: i%2===0 ? "#F7F5EE" : "#fff" }}>
                <span style={{ fontWeight:700, fontSize:13, color:"#1E392A", minWidth:70 }}>{p.hora}</span>
                <span style={{ fontSize:13, color:"#4B5563" }}>{p.acao}</span>
              </div>
            ))}
          </div>

          {/* Botões de ação */}
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <button onClick={baixarPDF} style={{
              padding:"16px", borderRadius:14, border:"none",
              background:"linear-gradient(135deg,#1E392A,#2D5A4F)",
              color:"#F4F1DE", fontFamily:"var(--font-heading)", fontWeight:700,
              fontSize:16, cursor:"pointer", boxShadow:"0 4px 20px rgba(30,57,42,.3)",
            }}>
              ⬇️ Baixar Minha Visão Âncora
            </button>
            <button onClick={() => { setEtapa("form"); setParteAtual(1); topoRef.current?.scrollIntoView({behavior:"smooth"}); }}
              style={{
                padding:"14px", borderRadius:14,
                border:"1.5px solid #D1D5DB", background:"#fff",
                color:"#6B7280", fontFamily:"var(--font-heading)", fontWeight:600,
                fontSize:14, cursor:"pointer",
              }}>
              ← Editar respostas
            </button>
          </div>

          {/* Footer */}
          <p style={{ textAlign:"center", fontSize:12, color:"#9CA3AF", marginTop:24, lineHeight:1.6 }}>
            A Virada · Ferramenta F00 — Visão Âncora<br/>
            Esta é a base de todas as outras 16 ferramentas da sua jornada.
          </p>
        </div>
      )}
    </div>
  );
}
