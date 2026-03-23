export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-dark-green to-brand-medium-green px-6 py-20 text-center">
      <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
        <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl leading-tight">
          Transforme Sua Vida em 12 Meses
        </h1>

        <p className="text-lg text-white/80 sm:text-xl max-w-xl leading-relaxed">
          Um Sistema Completo com 16 Ferramentas Guiadas. Sem Tela em Branco.
          Sem Confusão.
        </p>

        <a
          href="#comecar"
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-brand-gold px-8 py-4 text-base font-bold text-brand-dark-green transition-all duration-150 hover:brightness-90 hover:-translate-y-0.5 active:translate-y-0"
        >
          Comece Sua Jornada
        </a>
      </div>
    </section>
  );
}
