import Hero        from "@/components/landing/Hero";
import Problema     from "@/components/landing/Problema";
import Solucao      from "@/components/landing/Solucao";
import Ferramentas  from "@/components/landing/Ferramentas";
import Pricing      from "@/components/landing/Pricing";
import Footer       from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="w-full">
      <Hero />
      <Problema />
      <Solucao />
      <Ferramentas />
      <Pricing />
      <Footer />
    </main>
  );
}