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
        <Link href="/sign-up" className="btn-primary" style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem' }}>
          Começar grátis
        </Link>
      </div>
    </nav>
  )
}
