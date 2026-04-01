'use client';

export default function Footer() {
  const ano = new Date().getFullYear();

  return (
    <footer
      className="py-10 px-4"
      style={{
        background: "#111f17",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">

        {/* Logo / nome */}
        <div className="flex items-center gap-2">
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: 20,
              color: "var(--color-brand-cream)",
              letterSpacing: "-0.02em",
            }}
          >
            Kairos
          </span>
          <span
            style={{
              width: 6,
              height: 6,
              background: "var(--color-brand-gold)",
              borderRadius: "50%",
              display: "inline-block",
              marginBottom: 1,
            }}
          />
        </div>

        {/* Links */}
        <div
          className="flex items-center gap-6 text-sm"
          style={{ color: "rgba(244,241,222,0.4)" }}
        >
          <a
            href="#topo"
            className="transition-colors duration-150"
            style={{ color: "inherit", textDecoration: "none" }}
            onMouseEnter={(e) =>
              ((e.target as HTMLAnchorElement).style.color =
                "rgba(244,241,222,0.8)")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLAnchorElement).style.color =
                "rgba(244,241,222,0.4)")
            }
          >
            Início
          </a>
          <a
            href="#solucao"
            className="transition-colors duration-150"
            style={{ color: "inherit", textDecoration: "none" }}
            onMouseEnter={(e) =>
              ((e.target as HTMLAnchorElement).style.color =
                "rgba(244,241,222,0.8)")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLAnchorElement).style.color =
                "rgba(244,241,222,0.4)")
            }
          >
            Como Funciona
          </a>
          <a
            href="#comecar"
            className="transition-colors duration-150"
            style={{ color: "inherit", textDecoration: "none" }}
            onMouseEnter={(e) =>
              ((e.target as HTMLAnchorElement).style.color =
                "rgba(244,241,222,0.8)")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLAnchorElement).style.color =
                "rgba(244,241,222,0.4)")
            }
          >
            Preço
          </a>
        </div>

        {/* Copy */}
        <p style={{ fontSize: 12, color: "rgba(244,241,222,0.25)" }}>
          © {ano} Kairos. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}