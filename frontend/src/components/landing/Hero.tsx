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
        16 Ferramentas · Sistema Completo
      </div>

      <h1>
        Você não precisa de<br />
        <em>mais motivação.</em>
      </h1>

      <p className="hero-sub">
        Precisa saber quem você é e pra onde ir. O Kairos é um sistema de
        desenvolvimento pessoal com 16 ferramentas guiadas para você se
        conhecer, criar uma estratégia real e executar sua transformação —
        um dia de cada vez.
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
          <div className="proof-text">Seja um dos primeiros a transformar sua vida com o Kairos</div>
          <div className="stars">★★★★★ <span className="stars-label">Acesso antecipado aberto</span></div>
        </div>
      </div>

      <div className="hero-actions">
        <Link href="/sign-up" className="btn-primary">Começar 7 dias grátis →</Link>
        <Link href="#como-funciona" className="btn-ghost">Ver como funciona</Link>
      </div>
      <p style={{
        fontSize: '0.78rem',
        color: 'rgba(245,240,232,0.45)',
        marginTop: '0.5rem',
        letterSpacing: '0.02em',
      }}>
        ✓ Acesso completo · ✓ Sem cartão · ✓ Cancele quando quiser
      </p>

      <div className="hero-stat-row">
        {[
          { n: '16',   l: 'Ferramentas' },
          { n: '4',    l: 'Fases' },
          { n: '12',   l: 'Meses de conteúdo' },
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
