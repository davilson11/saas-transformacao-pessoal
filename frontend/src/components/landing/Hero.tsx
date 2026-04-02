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

      <h1>
        O momento certo para<br />
        <em>virar o jogo</em> é agora.
      </h1>

      <p className="hero-sub">
        Kairos é o maior sistema de desenvolvimento pessoal em português.
        16 ferramentas guiadas para você se conhecer, criar um plano real
        e executar sua transformação.
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
        <Link href="/sign-up" className="btn-primary">Começar gratuitamente</Link>
        <Link href="#como-funciona" className="btn-ghost">Ver como funciona →</Link>
      </div>

      <div className="hero-stat-row">
        {[
          { n: '16',   l: 'Ferramentas' },
          { n: '4',    l: 'Fases' },
          { n: '12',   l: 'Meses' },
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
