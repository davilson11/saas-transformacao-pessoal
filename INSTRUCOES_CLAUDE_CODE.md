# Instruções para o Claude Code — Landing Page Kairos

Cria ou substitui os seguintes arquivos no projeto `~/Desktop/saas-transformacao-pessoal/frontend/`.

---

## 1. `src/app/page.tsx` — Página principal (substitui o existente)

```tsx
import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { Problema } from '@/components/landing/Problema'
import { Metodologia } from '@/components/landing/Metodologia'
import { Ferramentas } from '@/components/landing/Ferramentas'
import { ComoFunciona } from '@/components/landing/ComoFunciona'
import { Depoimentos } from '@/components/landing/Depoimentos'
import { Pricing } from '@/components/landing/Pricing'
import { FAQ } from '@/components/landing/FAQ'
import { CTAFinal } from '@/components/landing/CTAFinal'
import { Footer } from '@/components/landing/Footer'
import '../styles/landing.css'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <div className="divider" />
        <Problema />
        <div className="divider" />
        <Metodologia />
        <div className="divider" />
        <Ferramentas />
        <div className="divider" />
        <ComoFunciona />
        <div className="divider" />
        <Depoimentos />
        <div className="divider" />
        <Pricing />
        <div className="divider" />
        <FAQ />
        <CTAFinal />
      </main>
      <Footer />
    </>
  )
}
```

---

## 2. `src/styles/landing.css` — Todos os estilos da landing

```css
/* =====================
   VARIÁVEIS
   ===================== */
:root {
  --gold: #C8A030;
  --gold-light: #DDB95A;
  --gold-dark: #9A6E08;
  --cream: #F5F0E8;
  --cream2: #EDE8DF;
  --bg: #0E0E0E;
  --bg2: #111111;
  --bg3: #1A1A1A;
  --muted: #AAA49A;
  --dim: #666660;
  --serif: 'Playfair Display', Georgia, serif;
  --sans: 'DM Sans', sans-serif;
  --mono: 'DM Mono', monospace;
}

/* =====================
   BASE
   ===================== */
html { scroll-behavior: smooth; background: #0E0E0E; }

body {
  background: #0E0E0E;
  color: #F5F0E8;
  font-family: var(--sans);
  font-weight: 300;
  line-height: 1.7;
  overflow-x: hidden;
}

/* =====================
   NAV
   ===================== */
.landing-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.25rem 2.5rem;
  background: rgba(14,14,14,0.93);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(200,160,48,0.13);
}
.nav-logo {
  font-family: var(--serif);
  font-size: 1.45rem;
  color: var(--gold);
  letter-spacing: .14em;
  text-decoration: none;
}
.nav-links { display: flex; gap: 2rem; align-items: center; }
.nav-links a {
  color: var(--muted); text-decoration: none;
  font-size: .85rem; font-weight: 400; letter-spacing: .04em;
  transition: color .2s;
}
.nav-links a:hover { color: var(--gold-light); }
.nav-cta {
  background: var(--gold); color: #0E0E0E;
  padding: .5rem 1.25rem; border-radius: 2px;
  font-size: .85rem; font-weight: 600;
  text-decoration: none; letter-spacing: .06em;
  transition: background .2s;
}
.nav-cta:hover { background: var(--gold-light); }

/* =====================
   HERO
   ===================== */
.hero {
  min-height: 100vh;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center;
  padding: 8rem 2rem 5rem;
  position: relative; overflow: hidden;
}
.hero-glow {
  position: absolute; top: 38%; left: 50%;
  transform: translate(-50%, -50%);
  width: 800px; height: 600px;
  background: radial-gradient(ellipse, rgba(200,160,48,.06) 0%, transparent 70%);
  pointer-events: none;
}
.hero-spiral {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -54%);
  width: 560px; height: 560px;
  opacity: .05; pointer-events: none;
}
.hero-badge {
  display: inline-flex; align-items: center; gap: .5rem;
  border: 1px solid rgba(200,160,48,.35); border-radius: 2px;
  padding: .35rem 1rem;
  font-size: .68rem; font-family: var(--mono);
  color: var(--gold); letter-spacing: .16em; text-transform: uppercase;
  margin-bottom: 1.75rem;
}
.badge-dot {
  display: inline-block; width: 6px; height: 6px;
  border-radius: 50%; background: var(--gold);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }

.hero h1 {
  font-family: var(--serif);
  font-size: clamp(2.6rem, 6.5vw, 5rem);
  font-weight: 400; line-height: 1.1; letter-spacing: -.02em;
  max-width: 820px; color: #F5F0E8;
}
.hero h1 em { font-style: italic; color: var(--gold); }
.hero-sub {
  font-size: 1.05rem; font-weight: 300; color: var(--muted);
  max-width: 540px; margin: 1.75rem auto 0; line-height: 1.85;
}
.social-proof {
  display: flex; align-items: center; gap: 1.25rem;
  margin-top: 2.5rem; flex-wrap: wrap; justify-content: center;
}
.avatars { display: flex; }
.avatar {
  width: 36px; height: 36px; border-radius: 50%;
  border: 2px solid #0E0E0E;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--serif); font-size: .72rem;
  font-weight: 700; color: #0E0E0E;
  margin-left: -10px; flex-shrink: 0;
}
.avatar:first-child { margin-left: 0; }
.proof-text { font-size: .8rem; color: var(--muted); }
.proof-text strong { color: #F5F0E8; font-weight: 500; }
.stars { color: var(--gold); font-size: .85rem; letter-spacing: 1px; }
.stars-label { color: var(--muted); font-size: .75rem; }
.hero-actions {
  display: flex; gap: 1rem; align-items: center;
  margin-top: 2.5rem; flex-wrap: wrap; justify-content: center;
}
.hero-stat-row {
  display: flex; gap: 3rem;
  margin-top: 5rem; padding-top: 3rem;
  border-top: 1px solid rgba(200,160,48,.1);
}
.hero-stat { text-align: center; }
.hero-stat-n { font-family: var(--serif); font-size: 2rem; color: var(--gold); display: block; }
.hero-stat-l { font-size: .7rem; color: var(--muted); letter-spacing: .1em; text-transform: uppercase; }

/* =====================
   BOTÕES
   ===================== */
.btn-primary {
  background: var(--gold); color: #0E0E0E;
  padding: .9rem 2.25rem; border-radius: 2px;
  font-size: .9rem; font-weight: 600;
  text-decoration: none; letter-spacing: .06em;
  transition: background .2s, transform .15s; white-space: nowrap;
  display: inline-block;
}
.btn-primary:hover { background: var(--gold-light); transform: translateY(-1px); }
.btn-ghost {
  color: #F5F0E8; font-size: .875rem; text-decoration: none;
  display: flex; align-items: center; gap: .4rem;
  opacity: .55; transition: opacity .2s;
}
.btn-ghost:hover { opacity: 1; }

/* =====================
   UTIL
   ===================== */
.divider {
  width: 1px; height: 64px;
  background: linear-gradient(to bottom, transparent, rgba(200,160,48,.28), transparent);
  margin: 0 auto;
}
.section { padding: 6rem 2rem; }
.container { max-width: 1100px; margin: 0 auto; }
.section-label {
  font-family: var(--mono); font-size: .66rem;
  letter-spacing: .24em; text-transform: uppercase;
  color: var(--gold); margin-bottom: 1rem;
}
.section-title {
  font-family: var(--serif);
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 400; line-height: 1.2;
  color: #F5F0E8; margin-bottom: .75rem;
}
.section-title em { font-style: italic; color: var(--gold); }

/* =====================
   PROBLEMA
   ===================== */
.problema { background: var(--bg2); }
.identifica-sub { color: var(--muted); font-size: .95rem; line-height: 1.85; max-width: 600px; margin-bottom: 3rem; }
.problema-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 2px; border: 1px solid rgba(200,160,48,.08);
  background: rgba(200,160,48,.08);
}
.prob-card {
  background: var(--bg2); padding: 1.75rem 2rem;
  position: relative; transition: background .2s;
}
.prob-card:hover { background: var(--bg3); }
.prob-span { grid-column: span 2; }
.prob-n {
  position: absolute; top: 1.5rem; right: 1.5rem;
  font-family: var(--mono); font-size: .62rem;
  color: rgba(200,160,48,.35); letter-spacing: .14em;
}
.prob-top { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: .75rem; }
.prob-icon { font-size: 1.4rem; flex-shrink: 0; margin-top: .1rem; }
.prob-card h3 { font-family: var(--serif); font-size: 1.1rem; font-weight: 400; color: #F5F0E8; }
.prob-card p { font-size: .875rem; color: var(--muted); line-height: 1.85; }
.problema-cta {
  margin-top: 3rem; padding: 2.5rem;
  border-left: 2px solid var(--gold);
  background: rgba(200,160,48,.04);
  border-radius: 0 4px 4px 0;
}
.problema-cta p { font-family: var(--serif); font-size: 1.2rem; font-style: italic; line-height: 1.75; color: #F5F0E8; }

/* =====================
   METODOLOGIA — 4 FASES
   ===================== */
.fases-sub { color: var(--muted); font-size: .95rem; line-height: 1.85; max-width: 600px; margin-bottom: 4rem; margin-top: .75rem; }
.fases-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 1px; background: rgba(200,160,48,.08);
  border: 1px solid rgba(200,160,48,.08);
}
.fase-card {
  background: var(--bg); padding: 2rem 1.5rem;
  transition: background .2s;
}
.fase-card:hover { background: var(--bg3); }
.fase-num { font-family: var(--mono); font-size: .62rem; color: rgba(200,160,48,.4); letter-spacing: .18em; margin-bottom: 1rem; }
.fase-icon { font-size: 1.5rem; margin-bottom: .75rem; display: block; }
.fase-card h3 { font-family: var(--serif); font-size: 1.05rem; font-weight: 400; color: #F5F0E8; margin-bottom: .5rem; }
.fase-card p { font-size: .8rem; color: var(--muted); line-height: 1.75; margin-bottom: 1.25rem; }
.fase-tools { list-style: none; }
.fase-tools li {
  font-size: .75rem; color: #AAA49A;
  padding: .3rem 0; border-bottom: 1px solid rgba(200,160,48,.06);
  display: flex; align-items: center; gap: .5rem;
}
.fase-tools li::before { content: '✦'; color: rgba(200,160,48,.5); font-size: .6rem; flex-shrink: 0; }

/* =====================
   FERRAMENTAS
   ===================== */
.ferr { background: var(--bg2); }
.ferr-phases { display: flex; flex-direction: column; gap: 3rem; margin-top: 3rem; }
.ferr-phase-title {
  display: flex; align-items: center; gap: 1rem;
  margin-bottom: 1.25rem; padding-bottom: 1rem;
  border-bottom: 1px solid rgba(200,160,48,.1);
}
.ph-n { font-family: var(--mono); font-size: .62rem; color: rgba(200,160,48,.5); letter-spacing: .18em; }
.ferr-phase-title h3 { font-family: var(--serif); font-size: 1.1rem; font-weight: 400; color: #F5F0E8; }
.ferr-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 1px; background: rgba(200,160,48,.07);
  border: 1px solid rgba(200,160,48,.07);
}
.f-card { background: var(--bg2); padding: 1.35rem; transition: background .2s; cursor: default; }
.f-card:hover { background: var(--bg3); }
.f-icon { font-size: 1.2rem; margin-bottom: .5rem; display: block; }
.f-num { font-family: var(--mono); font-size: .6rem; color: rgba(200,160,48,.4); letter-spacing: .14em; margin-bottom: .4rem; }
.f-name { font-size: .875rem; font-weight: 500; color: #F5F0E8; margin-bottom: .3rem; line-height: 1.3; }
.f-desc { font-size: .73rem; color: #888880; line-height: 1.6; }

/* =====================
   COMO FUNCIONA
   ===================== */
.como { background: var(--bg); }
.como-steps {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 0; margin-top: 3rem; position: relative;
}
.como-steps::before {
  content: ''; position: absolute;
  top: 1.3rem; left: 16.66%; right: 16.66%; height: 1px;
  background: linear-gradient(to right, var(--gold-dark), var(--gold), var(--gold-dark));
  opacity: .22;
}
.como-step { padding: 2rem; text-align: center; }
.step-n {
  width: 42px; height: 42px;
  border: 1px solid rgba(200,160,48,.4); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--mono); font-size: .76rem; color: var(--gold);
  margin: 0 auto 1.25rem; background: var(--bg);
  position: relative; z-index: 1;
}
.como-step h3 { font-family: var(--serif); font-size: 1.1rem; font-weight: 400; color: #F5F0E8; margin-bottom: .6rem; }
.como-step p { font-size: .85rem; color: var(--muted); line-height: 1.85; }

/* =====================
   DEPOIMENTOS
   ===================== */
.depo { background: var(--bg2); }
.depo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-top: 3rem; }
.depo-card {
  padding: 2rem; border: 1px solid rgba(200,160,48,.12);
  border-radius: 4px; background: var(--bg3); position: relative;
}
.depo-card::before {
  content: '\201C'; position: absolute; top: -.5rem; left: 1.5rem;
  font-family: var(--serif); font-size: 4rem; color: var(--gold);
  opacity: .16; line-height: 1;
}
.depo-text { font-size: .875rem; color: #EDE8DF; line-height: 1.85; margin-bottom: 1.25rem; font-style: italic; }
.depo-author { display: flex; align-items: center; gap: .75rem; }
.depo-av {
  width: 36px; height: 36px; border-radius: 50%;
  border: 1px solid rgba(200,160,48,.3);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--serif); font-size: .76rem;
  color: #0E0E0E; font-weight: 700; flex-shrink: 0;
}
.depo-name { font-size: .82rem; font-weight: 500; color: #F5F0E8; }
.depo-role { font-size: .72rem; color: var(--dim); }

/* =====================
   PRICING
   ===================== */
.pricing { background: var(--bg); }
.pricing-wrap { max-width: 480px; margin: 3rem auto 0; }
.pricing-card {
  padding: 3rem 2.5rem;
  border: 1px solid var(--gold); border-radius: 4px;
  background: rgba(200,160,48,.03); position: relative; text-align: center;
}
.pricing-tag {
  position: absolute; top: -1px; left: 50%; transform: translateX(-50%);
  background: var(--gold); color: #0E0E0E;
  font-family: var(--mono); font-size: .62rem; font-weight: 700;
  letter-spacing: .14em; text-transform: uppercase;
  padding: .28rem .9rem; white-space: nowrap;
}
.pricing-name { font-family: var(--serif); font-size: 1.4rem; color: #F5F0E8; margin-bottom: .5rem; }
.pricing-sub { font-size: .82rem; color: var(--muted); margin-bottom: 2rem; }
.pricing-old { font-size: .9rem; color: var(--dim); text-decoration: line-through; margin-bottom: .25rem; }
.pricing-discount {
  display: inline-block;
  background: rgba(200,160,48,.15); color: var(--gold);
  font-family: var(--mono); font-size: .68rem; letter-spacing: .1em;
  padding: .2rem .6rem; border-radius: 2px; margin-bottom: .75rem;
}
.pricing-val { display: flex; align-items: baseline; justify-content: center; gap: 4px; margin-bottom: .5rem; }
.pricing-val .curr { font-size: 1rem; color: var(--muted); align-self: flex-start; margin-top: .7rem; }
.pricing-val .num { font-family: var(--serif); font-size: 3.5rem; color: #F5F0E8; line-height: 1; }
.pricing-period { font-size: .82rem; color: var(--muted); margin-bottom: 2.5rem; }
.pricing-features { list-style: none; text-align: left; margin-bottom: 2.5rem; }
.pricing-features li {
  font-size: .875rem; color: #EDE8DF;
  padding: .55rem 0; border-bottom: 1px solid rgba(200,160,48,.07);
  display: flex; align-items: center; gap: .6rem;
}
.pricing-features li::before { content: '✓'; color: var(--gold); font-weight: 600; flex-shrink: 0; }
.btn-pricing {
  display: block; background: var(--gold); color: #0E0E0E;
  padding: 1rem; border-radius: 2px;
  font-size: .95rem; font-weight: 700;
  text-decoration: none; letter-spacing: .06em;
  transition: background .2s, transform .15s; margin-bottom: 1.5rem;
}
.btn-pricing:hover { background: var(--gold-light); transform: translateY(-1px); }
.pricing-guarantees { display: flex; justify-content: center; gap: 1.5rem; flex-wrap: wrap; }
.guarantee-item { display: flex; align-items: center; gap: .4rem; font-size: .75rem; color: var(--muted); }

/* =====================
   FAQ
   ===================== */
.faq-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-top: 3rem; }
.faq-card { padding: 1.75rem; border: 1px solid rgba(200,160,48,.1); border-radius: 4px; background: var(--bg3); }
.faq-icon { font-size: 1.1rem; margin-bottom: .75rem; display: block; }
.faq-q { font-size: .9rem; font-weight: 500; color: #F5F0E8; margin-bottom: .5rem; }
.faq-a { font-size: .82rem; color: var(--muted); line-height: 1.8; }

/* =====================
   CTA FINAL
   ===================== */
.cta-final {
  text-align: center; padding: 8rem 2rem;
  position: relative; overflow: hidden;
}
.cta-final::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse 50% 60% at 50% 50%, rgba(200,160,48,.07) 0%, transparent 70%);
}
.cta-final h2 {
  font-family: var(--serif);
  font-size: clamp(2.2rem, 5vw, 3.8rem);
  font-weight: 400; line-height: 1.2; color: #F5F0E8;
  position: relative; margin-bottom: 1.5rem;
}
.cta-final h2 em { font-style: italic; color: var(--gold); }
.cta-final p { color: var(--muted); max-width: 460px; margin: 0 auto 2.5rem; position: relative; font-size: .95rem; line-height: 1.85; }

/* =====================
   FOOTER
   ===================== */
.landing-footer { border-top: 1px solid rgba(200,160,48,.08); padding: 2.5rem 2rem; }
.footer-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
.footer-logo { font-family: var(--serif); color: var(--gold); font-size: 1.2rem; letter-spacing: .14em; }
.footer-copy { font-size: .72rem; color: var(--dim); }
.footer-links { display: flex; gap: 1.5rem; }
.footer-links a { font-size: .72rem; color: var(--dim); text-decoration: none; transition: color .2s; }
.footer-links a:hover { color: var(--gold-light); }

/* =====================
   RESPONSIVO
   ===================== */
@media (max-width: 768px) {
  .landing-nav { padding: 1rem 1.25rem; }
  .nav-links { display: none; }
  .problema-grid,
  .fases-grid,
  .como-steps,
  .depo-grid,
  .faq-grid { grid-template-columns: 1fr; }
  .ferr-grid { grid-template-columns: repeat(2, 1fr); }
  .prob-span { grid-column: span 1; }
  .como-steps::before { display: none; }
  .hero-stat-row { gap: 1.5rem; flex-wrap: wrap; justify-content: center; }
  .footer-inner { flex-direction: column; gap: 1.5rem; text-align: center; }
  .pricing-guarantees { flex-direction: column; align-items: center; }
}
```

---

## 3. `src/components/landing/Navbar.tsx`

```tsx
import Link from 'next/link'

export function Navbar() {
  return (
    <nav className="landing-nav">
      <Link href="/" className="nav-logo">KAIROS</Link>
      <div className="nav-links">
        <Link href="#problema">O problema</Link>
        <Link href="#ferramentas">Ferramentas</Link>
        <Link href="#precos">Preços</Link>
        <Link href="/sign-in" className="nav-cta">Entrar</Link>
      </div>
    </nav>
  )
}
```

---

## 4. `src/components/landing/Hero.tsx`

```tsx
import Link from 'next/link'

const avatars = [
  { initials: 'AV', bg: '#C8A030' },
  { initials: 'LM', bg: '#DDB95A' },
  { initials: 'RS', bg: '#9A6E08' },
  { initials: 'JC', bg: '#C8A030' },
  { initials: 'PB', bg: '#DDB95A' },
]

export function Hero() {
  return (
    <section className="hero">
      <div className="hero-glow" />
      <svg className="hero-spiral" viewBox="0 0 560 560" fill="none">
        <path
          d="M280 280 m0,-240 a240,240 0 0,1 0,480 a200,200 0 0,1 0,-400 a160,160 0 0,1 0,320 a120,120 0 0,1 0,-240 a80,80 0 0,1 0,160 a40,40 0 0,1 0,-80 a10,10 0 0,1 0,20"
          stroke="#C8A030" strokeWidth="1.2" fill="none"
        />
        <circle cx="280" cy="280" r="5" fill="#C8A030" />
      </svg>

      <div className="hero-badge">
        <span className="badge-dot" />
        Sistema Completo · 16 Ferramentas
      </div>

      <h1>Transforme sua vida<br />em <em>12 meses.</em></h1>

      <p className="hero-sub">
        Um sistema passo a passo com 16 ferramentas guiadas para clareza, hábitos e propósito.
        Sem tela em branco. Sem confusão.
      </p>

      <div className="social-proof">
        <div className="avatars">
          {avatars.map((a) => (
            <div key={a.initials} className="avatar" style={{ background: a.bg }}>
              {a.initials}
            </div>
          ))}
        </div>
        <div>
          <div className="proof-text"><strong>+1.200 pessoas</strong> já iniciaram sua jornada</div>
          <div className="stars">★★★★★ <span className="stars-label">4.9 de média</span></div>
        </div>
      </div>

      <div className="hero-actions">
        <Link href="#precos" className="btn-primary">Quero começar minha virada →</Link>
        <Link href="#como-funciona" className="btn-ghost">Como funciona?</Link>
      </div>

      <div className="hero-stat-row">
        {[
          { n: '16', l: 'Ferramentas' },
          { n: '4',  l: 'Fases' },
          { n: '12', l: 'Meses' },
          { n: '100%', l: 'Em português' },
        ].map((s) => (
          <div key={s.l} className="hero-stat">
            <span className="hero-stat-n">{s.n}</span>
            <span className="hero-stat-l">{s.l}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
```

---

## 5. `src/components/landing/Problema.tsx`

```tsx
const problemas = [
  { n: '01', icon: '🧭', titulo: 'Falta de direção',       desc: 'Você tem vontade de mudar, mas não sabe por onde começar. Cada dia parece igual ao anterior.', span: false },
  { n: '02', icon: '🗂️', titulo: 'Fragmentação',           desc: 'Começa vários projetos e não termina nenhum. A energia se dispersa sem gerar resultado.',       span: false },
  { n: '03', icon: '⏳', titulo: 'Procrastinação',          desc: 'Sabe o que precisa fazer, mas adia sempre para amanhã. O amanhã nunca chega.',                   span: false },
  { n: '04', icon: '🌫️', titulo: 'Falta de clareza',       desc: 'Não consegue visualizar como será sua vida daqui 1 ano. O futuro parece indefinido.',             span: false },
  { n: '05', icon: '📚', titulo: 'Excesso de informação',  desc: 'Consome muito conteúdo mas coloca pouco em prática. Informação sem sistema não vira ação.',        span: true  },
]

export function Problema() {
  return (
    <section className="section problema" id="problema">
      <div className="container">
        <div className="section-label">Você se identifica?</div>
        <h2 className="section-title">Você está aqui.</h2>
        <p className="identifica-sub">
          Reconhece algum desses cenários? A maioria das pessoas que querem mudar passa por pelo menos três deles.
        </p>

        <div className="problema-grid">
          {problemas.map((p) => (
            <div key={p.n} className={`prob-card${p.span ? ' prob-span' : ''}`}>
              <span className="prob-n">{p.n}</span>
              <div className="prob-top">
                <span className="prob-icon">{p.icon}</span>
                <h3>{p.titulo}</h3>
              </div>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="problema-cta">
          <p>&ldquo;Se você reconheceu pelo menos um desses cenários, o Kairos foi feito para você.&rdquo;</p>
        </div>
      </div>
    </section>
  )
}
```

---

## 6. `src/components/landing/Metodologia.tsx`

```tsx
const fases = [
  {
    n: '01', icon: '🔍', titulo: 'Autoconhecimento',
    desc: 'Descubra quem você é, onde está hoje e quais são seus valores mais profundos.',
    tools: ['Raio-X 360°', 'Mapa de Valores', 'Propósito de Vida', 'Visão de Futuro'],
  },
  {
    n: '02', icon: '🎯', titulo: 'Visão e Metas',
    desc: 'Defina com clareza onde quer chegar e estabeleça seus OKRs e plano de 12 meses.',
    tools: ['OKRs Pessoais', 'Plano de 12 Meses', 'Finanças Pessoais', 'Rotina Ideal'],
  },
  {
    n: '03', icon: '🚀', titulo: 'Hábitos e Energia',
    desc: 'Construa a rotina que te leva lá: saúde, produtividade e relacionamentos.',
    tools: ['Saúde e Energia', 'Relacionamentos', 'Espiritualidade', 'Energia Diária'],
  },
  {
    n: '04', icon: '🧠', titulo: 'Crescimento e Revisão',
    desc: 'Elimine bloqueios, registre sua evolução e ajuste o rumo mensalmente.',
    tools: ['Aprendizado', 'Diário de Bordo', 'Conquistas', 'Revisão Mensal'],
  },
]

export function Metodologia() {
  return (
    <section className="section" id="metodologia">
      <div className="container">
        <div className="section-label">A metodologia</div>
        <h2 className="section-title">Sua jornada de <em>12 meses.</em></h2>
        <p className="fases-sub">
          4 fases progressivas que se constroem uma sobre a outra, transformando todas as áreas da sua vida de forma estruturada.
        </p>
        <div className="fases-grid">
          {fases.map((f) => (
            <div key={f.n} className="fase-card">
              <div className="fase-num">{f.n}</div>
              <span className="fase-icon">{f.icon}</span>
              <h3>{f.titulo}</h3>
              <p>{f.desc}</p>
              <ul className="fase-tools">
                {f.tools.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

## 7. `src/components/landing/Ferramentas.tsx`

```tsx
const fases = [
  {
    n: 'FASE 01', titulo: '🔍 Autoconhecimento',
    ferramentas: [
      { icon: '🎯', num: 'F01', nome: 'Raio-X 360°',       desc: 'Diagnóstico completo de onde você está hoje' },
      { icon: '🧭', num: 'F02', nome: 'Mapa de Valores',    desc: 'Identifique o que realmente importa para você' },
      { icon: '⭐', num: 'F03', nome: 'Propósito de Vida',  desc: 'Descubra sua missão e razão de existir' },
      { icon: '🔮', num: 'F04', nome: 'Visão de Futuro',    desc: 'Visualize em detalhes como será sua vida ideal' },
    ],
  },
  {
    n: 'FASE 02', titulo: '🎯 Visão e Metas',
    ferramentas: [
      { icon: '📊', num: 'F05', nome: 'OKRs Pessoais',      desc: 'Objetivos e resultados-chave que guiam sua jornada' },
      { icon: '📅', num: 'F06', nome: 'Plano de 12 Meses',  desc: 'Cronograma claro mês a mês de cada objetivo' },
      { icon: '💰', num: 'F07', nome: 'Finanças Pessoais',  desc: 'Controle e planejamento financeiro integrado' },
      { icon: '🌅', num: 'F08', nome: 'Rotina Ideal',       desc: 'Monte sua rotina de manhã, tarde e noite' },
    ],
  },
  {
    n: 'FASE 03', titulo: '🚀 Hábitos e Energia',
    ferramentas: [
      { icon: '💪', num: 'F09', nome: 'Saúde e Energia',    desc: 'Hábitos de movimento, sono e alimentação' },
      { icon: '🤝', num: 'F10', nome: 'Relacionamentos',    desc: 'Cuide das conexões que importam de verdade' },
      { icon: '🧘', num: 'F11', nome: 'Espiritualidade',    desc: 'Prática contemplativa e conexão com o sagrado' },
      { icon: '⚡', num: 'F12', nome: 'Energia Diária',     desc: 'Rastreie e maximize seus níveis de energia' },
    ],
  },
  {
    n: 'FASE 04', titulo: '🧠 Crescimento e Revisão',
    ferramentas: [
      { icon: '🎓', num: 'F13', nome: 'Aprendizado',        desc: 'Gerencie leituras, cursos e novos conhecimentos' },
      { icon: '📔', num: 'F14', nome: 'Diário de Bordo',    desc: 'Registro contínuo da sua jornada e reflexões' },
      { icon: '🏆', num: 'F15', nome: 'Conquistas',         desc: 'Celebre cada vitória — pequena ou grande' },
      { icon: '🔄', num: 'F16', nome: 'Revisão Mensal',     desc: 'Check-in estruturado para ajustar o rumo' },
    ],
  },
]

export function Ferramentas() {
  return (
    <section className="section ferr" id="ferramentas">
      <div className="container">
        <div className="section-label">O que está incluído</div>
        <h2 className="section-title">16 ferramentas para <em>transformar sua vida.</em></h2>
        <div className="ferr-phases">
          {fases.map((fase) => (
            <div key={fase.n}>
              <div className="ferr-phase-title">
                <span className="ph-n">{fase.n}</span>
                <h3>{fase.titulo}</h3>
              </div>
              <div className="ferr-grid">
                {fase.ferramentas.map((f) => (
                  <div key={f.num} className="f-card">
                    <span className="f-icon">{f.icon}</span>
                    <div className="f-num">{f.num}</div>
                    <div className="f-name">{f.nome}</div>
                    <div className="f-desc">{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

## 8. `src/components/landing/ComoFunciona.tsx`

```tsx
const steps = [
  { n: '01', titulo: 'Conheça-se',          desc: 'Comece pelo diagnóstico completo. Entenda onde você está, o que te move e o que te trava. Sem isso, qualquer ação é chute.' },
  { n: '02', titulo: 'Planeje com clareza', desc: 'Use as ferramentas estratégicas para definir seus OKRs, desenhar sua rotina ideal e criar um plano que respeita quem você é.' },
  { n: '03', titulo: 'Execute e acompanhe', desc: 'O dashboard mostra sua evolução em tempo real. Cada ferramenta salva seu progresso. Você nunca perde o fio.' },
]

export function ComoFunciona() {
  return (
    <section className="section como" id="como-funciona">
      <div className="container">
        <div className="section-label">Como funciona</div>
        <h2 className="section-title">Três passos. <em>Uma virada.</em></h2>
        <div className="como-steps">
          {steps.map((s) => (
            <div key={s.n} className="como-step">
              <div className="step-n">{s.n}</div>
              <h3>{s.titulo}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

## 9. `src/components/landing/Depoimentos.tsx`

```tsx
const depoimentos = [
  { initials: 'AV', bg: '#C8A030', texto: '"Em 3 meses já tinha clareza suficiente para pedir demissão e abrir meu negócio. O sistema me deu a estrutura que eu não conseguia criar sozinha."', nome: 'Ana Vitória',   role: 'Designer, 28 anos' },
  { initials: 'LM', bg: '#DDB95A', texto: '"Finalmente consegui parar de procrastinar e colocar meus planos em prática. As ferramentas de revisão mensal mudaram minha relação com metas."',          nome: 'Lucas Mendes',   role: 'Engenheiro, 34 anos' },
  { initials: 'RS', bg: '#9A6E08', texto: '"O Mapa de Valores foi um divisor de águas. Percebi que estava perseguindo objetivos que não eram meus. Hoje vivo muito mais alinhada."',                nome: 'Rafaela Santos', role: 'Professora, 31 anos' },
]

export function Depoimentos() {
  return (
    <section className="section depo" id="depoimentos">
      <div className="container">
        <div className="section-label">Resultados reais</div>
        <h2 className="section-title">Quem já <em>virou o jogo.</em></h2>
        <div className="depo-grid">
          {depoimentos.map((d) => (
            <div key={d.initials} className="depo-card">
              <p className="depo-text">{d.texto}</p>
              <div className="depo-author">
                <div className="depo-av" style={{ background: d.bg }}>{d.initials}</div>
                <div>
                  <div className="depo-name">{d.nome}</div>
                  <div className="depo-role">{d.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

## 10. `src/components/landing/Pricing.tsx`

```tsx
import Link from 'next/link'

const features = [
  '16 ferramentas guiadas e prontas para usar',
  '4 fases de transformação progressiva',
  'Raio-X 360° das suas áreas de vida',
  'Plano de 12 meses personalizado',
  'Rotina ideal com blocos de tempo',
  'Controle financeiro integrado',
  'Revisões mensais estruturadas',
  'Acesso vitalício — sem assinatura',
  'Atualizações gratuitas para sempre',
]

export function Pricing() {
  return (
    <section className="section pricing" id="precos">
      <div className="container">
        <div className="section-label" style={{ textAlign: 'center' }}>Comece sua transformação hoje</div>
        <h2 className="section-title" style={{ textAlign: 'center' }}>
          Um investimento único.<br /><em>Acesso vitalício.</em>
        </h2>
        <div className="pricing-wrap">
          <div className="pricing-card">
            <div className="pricing-tag">✦ Oferta de lançamento — vagas limitadas ✦</div>
            <div className="pricing-name">Kairos</div>
            <div className="pricing-sub">Sistema Completo de Transformação de Vida</div>
            <div className="pricing-old">De R$ 297</div>
            <div className="pricing-discount">− 33% de desconto</div>
            <div className="pricing-val">
              <span className="curr">R$</span>
              <span className="num">197</span>
            </div>
            <div className="pricing-period">Pagamento único · Acesso vitalício</div>
            <ul className="pricing-features">
              {features.map((f) => <li key={f}>{f}</li>)}
            </ul>
            <Link href="/sign-up" className="btn-pricing">Quero o Kairos agora →</Link>
            <div className="pricing-guarantees">
              <div className="guarantee-item"><span>🔒</span>Compra 100% segura · SSL</div>
              <div className="guarantee-item"><span>🛡️</span>Garantia de 7 dias</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

---

## 11. `src/components/landing/FAQ.tsx`

```tsx
const faqs = [
  { icon: '📱', q: 'Qual plataforma?',       a: 'Notion — disponível em todas as plataformas, mobile e desktop. Você acessa de qualquer lugar.' },
  { icon: '⏱️', q: 'Quanto tempo leva?',     a: 'Cada ferramenta leva de 20 a 60 minutos. Você vai no seu ritmo, sem pressão.' },
  { icon: '🔄', q: 'Posso usar todo ano?',   a: 'Sim! O sistema foi projetado para ser revisado e reiniciado anualmente. É um sistema para a vida.' },
  { icon: '🛡️', q: 'E se eu não gostar?',   a: 'Garantia de 7 dias. Reembolso total, sem perguntas. Você não tem nada a perder.' },
]

export function FAQ() {
  return (
    <section className="section" id="faq">
      <div className="container">
        <div className="section-label">Dúvidas frequentes</div>
        <h2 className="section-title">Antes de começar.</h2>
        <div className="faq-grid">
          {faqs.map((f) => (
            <div key={f.q} className="faq-card">
              <span className="faq-icon">{f.icon}</span>
              <div className="faq-q">{f.q}</div>
              <div className="faq-a">{f.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

## 12. `src/components/landing/CTAFinal.tsx`

```tsx
import Link from 'next/link'

export function CTAFinal() {
  return (
    <section className="cta-final">
      <h2>Kairos.<br /><em>O seu momento.</em></h2>
      <p>Cada dia que passa sem direção é um dia que não volta. A virada começa com um passo. Esse passo começa aqui.</p>
      <Link href="/sign-up" className="btn-primary">Quero começar minha virada →</Link>
    </section>
  )
}
```

---

## 13. `src/components/landing/Footer.tsx`

```tsx
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="landing-footer">
      <div className="footer-inner">
        <div className="footer-logo">KAIROS</div>
        <div className="footer-copy">© 2025 Kairos · Todos os direitos reservados</div>
        <div className="footer-links">
          <Link href="#">Privacidade</Link>
          <Link href="#">Termos</Link>
          <Link href="#">Contato</Link>
        </div>
      </div>
    </footer>
  )
}
```

---

## 14. Adicionar fonte no `src/app/layout.tsx`

Certifique-se de que o `layout.tsx` tem as fontes do Google:

```tsx
import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kairos — Seu Momento de Virada',
  description: 'O maior sistema de transformação pessoal em português do Brasil.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="pt-BR">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400&display=swap"
            rel="stylesheet"
          />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

---

## Resumo dos arquivos criados

| Arquivo | Descrição |
|---|---|
| `src/app/page.tsx` | Página principal — importa todos os componentes |
| `src/styles/landing.css` | Todos os estilos da landing |
| `src/components/landing/Navbar.tsx` | Barra de navegação fixa |
| `src/components/landing/Hero.tsx` | Seção hero com espiral e social proof |
| `src/components/landing/Problema.tsx` | "Você se identifica?" — 5 problemas |
| `src/components/landing/Metodologia.tsx` | 4 fases da jornada |
| `src/components/landing/Ferramentas.tsx` | 16 ferramentas por fase |
| `src/components/landing/ComoFunciona.tsx` | 3 passos |
| `src/components/landing/Depoimentos.tsx` | 3 depoimentos |
| `src/components/landing/Pricing.tsx` | Pricing único R$197 |
| `src/components/landing/FAQ.tsx` | 4 perguntas frequentes |
| `src/components/landing/CTAFinal.tsx` | Call to action final |
| `src/components/landing/Footer.tsx` | Rodapé |
| `src/app/layout.tsx` | Adicionar fontes Google |
