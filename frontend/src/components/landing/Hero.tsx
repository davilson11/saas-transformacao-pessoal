"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  /* Parallax sutil no fundo */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const onScroll = () => {
      const y = window.scrollY;
      el.style.setProperty("--parallax-y", `${y * 0.3}px`);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="topo"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background:
          "linear-gradient(145deg, #162c20 0%, #1E392A 45%, #2D5A4F 100%)",
      }}
    >
      {/* Padrão de pontos decorativo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(129,178,154,0.12) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          transform: "translateY(var(--parallax-y, 0))",
        }}
      />

      {/* Glow central */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(224,165,95,0.10) 0%, transparent 70%)",
        }}
      />

      <div className="container relative z-10 py-24 flex flex-col items-center text-center gap-8">

        {/* Badge topo */}
        <div className="animate-fade-up badge badge-white">
          ✦ Sistema Completo · 16 Ferramentas
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-up delay-100 max-w-3xl"
          style={{ color: "#F4F1DE" }}
        >
          Transforme Sua Vida{" "}
          <span
            style={{
              color: "transparent",
              backgroundImage:
                "linear-gradient(90deg, #E0A55F, #f5c98a, #E0A55F)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              animation: "shimmer 3s linear infinite",
            }}
          >
            em 12 Meses
          </span>
        </h1>

        {/* Subtítulo */}
        <p
          className="animate-fade-up delay-200 text-lg sm:text-xl max-w-xl leading-relaxed"
          style={{ color: "rgba(244,241,222,0.75)" }}
        >
          Um sistema passo a passo com 16 ferramentas guiadas para clareza,
          hábitos e propósito. Sem tela em branco. Sem confusão.
        </p>

        {/* CTA principal */}
        <div className="animate-fade-up delay-300 flex flex-col items-center gap-3">
          <Link
            href="/dashboard"
            className="btn-gold"
            style={{
              fontSize: "1.0625rem",
              padding: "17px 44px",
              borderRadius: 14,
              fontWeight: 700,
              letterSpacing: "0.01em",
              boxShadow: "0 0 0 0 rgba(224,165,95,0.7)",
              animation: "pulse-glow 3s ease-in-out infinite",
              textDecoration: "none",
            }}
          >
            Começar agora — é grátis →
          </Link>
          <div className="flex items-center gap-4">
            <a href="#comecar" className="btn-outline text-sm">
              Quero Começar Minha Virada
            </a>
            <a href="#solucao" className="btn-outline text-sm">
              Como funciona?
            </a>
          </div>
        </div>

        {/* Social proof */}
        <div
          className="animate-fade-up delay-400 flex flex-col sm:flex-row items-center gap-4 pt-2"
          style={{ color: "rgba(244,241,222,0.55)", fontSize: "13px" }}
        >
          {/* Avatares */}
          <div className="flex -space-x-2">
            {["#4a7c59", "#5a8c69", "#6a9c79", "#7aac89", "#8abc99"].map(
              (bg, i) => (
                <div
                  key={i}
                  className="rounded-full border-2 flex items-center justify-center font-semibold text-xs"
                  style={{
                    width: 32,
                    height: 32,
                    background: bg,
                    borderColor: "#1E392A",
                    color: "#F4F1DE",
                    fontSize: 11,
                  }}
                >
                  {["AV", "LM", "RS", "JC", "PB"][i]}
                </div>
              )
            )}
          </div>
          <span>
            <strong style={{ color: "rgba(244,241,222,0.85)", fontWeight: 600 }}>
              +1.200 pessoas
            </strong>{" "}
            já iniciaram sua jornada
          </span>
          <span className="hidden sm:block" style={{ opacity: 0.3 }}>·</span>
          <span>⭐⭐⭐⭐⭐ 4.9 de média</span>
        </div>

        {/* Scroll indicator */}
        <div
          className="animate-fade-up delay-500 absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ color: "rgba(244,241,222,0.3)", fontSize: 11 }}
        >
          <span style={{ letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Role para baixo
          </span>
          <div
            style={{
              width: 1,
              height: 40,
              background:
                "linear-gradient(to bottom, rgba(244,241,222,0.4), transparent)",
            }}
          />
        </div>
      </div>
    </section>
  );
}