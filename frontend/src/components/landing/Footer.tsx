import Link from 'next/link'

export function Footer() {
  return (
    <footer className="landing-footer">
      <div className="footer-inner">
        <div className="footer-logo">KAIROS</div>
        <div className="footer-copy">© 2025 Kairos · Todos os direitos reservados</div>
        <div className="footer-links">
          <Link href="/privacidade">Privacidade</Link>
          <Link href="/termos">Termos</Link>
          <Link href="mailto:contato@kairos.app">Contato</Link>
        </div>
      </div>
    </footer>
  )
}
