import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export function AuctionHero({ openLotCount }: { openLotCount: number }) {
  return (
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow"><span className="live-dot" /> O próximo lance pode ser teu</div>
        <h1>Encontre a sua<br /><span>próxima raridade.</span></h1>
        <p>Cartas Pokémon, disputas ao vivo e transparência em cada lance. A tua coleção começa aqui.</p>
        <a className="button button-dark" href="#vitrine">Explorar leilões <ArrowRight size={17} /></a>
        <div className="hero-trust">
          <span><ShieldCheck size={15} /> Histórico verificável</span>
          <span><Sparkles size={15} /> Lances em tempo real</span>
        </div>
      </div>
      <div className="hero-art">
        <div className="hero-orbit orbit-one" />
        <div className="hero-orbit orbit-two" />
        <div className="hero-glow" />
        <div className="hero-ball"><span /></div>
        <div className="floating-tag"><span className="live-dot" /> LEILÃO AO VIVO</div>
        <div className="hero-stat">
          <b>{openLotCount.toString().padStart(2, "0")}</b>
          <span>lotes abertos</span>
        </div>
      </div>
      <div className="hero-index">01 <span>/ 03</span></div>
    </section>
  );
}
