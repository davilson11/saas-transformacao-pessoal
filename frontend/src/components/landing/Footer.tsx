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
