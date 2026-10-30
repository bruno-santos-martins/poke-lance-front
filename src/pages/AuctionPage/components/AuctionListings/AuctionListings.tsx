import { ArrowRight, Gavel, Heart, Search, ShieldCheck } from "lucide-react";
import { API_BASE_URL } from "../../../../shared/api/request";
import { Countdown, PokemonTypeBadge } from "../../../../shared/components";
import { formatPokemonId } from "../../../../shared/utils";
import type { Lot } from "../../AuctionPage.types";

type AuctionListingsProps = {
  lots: Lot[];
  query: string;
  formatCurrency: (amount: number) => string;
  onQueryChange: (query: string) => void;
  onShowAudit: (lot: Lot) => void;
  onOpenLot: (lot: Lot) => void;
};

export function AuctionListings({
  lots,
  query,
  formatCurrency,
  onQueryChange,
  onShowAudit,
  onOpenLot
}: AuctionListingsProps) {
  return (
    <section className="auction-section" id="vitrine">
      <div className="section-heading">
        <div>
          <div className="section-kicker">A seleção do momento</div>
          <h2>Leilões <span>em destaque</span></h2>
        </div>
        <div className="section-tools">
          <label className="searchbox">
            <Search size={16} />
            <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Pesquisar Pokémon..." />
          </label>
          <div className="live-label"><span className="live-dot" /> AO VIVO</div>
        </div>
      </div>
      {!lots.length ? (
        <div className="empty-state">
          <div className="empty-icon"><Gavel /></div>
          <h3>Nenhum lote por aqui</h3>
          <p>Volta mais tarde para encontrar novas cartas na vitrine.</p>
        </div>
      ) : (
        <div className="lot-grid">
          {lots.map((lot, index) => (
            <article className="lot-card" key={lot.id}>
              <button
                className="card-image"
                onClick={() => onOpenLot(lot)}
                aria-label={`Ver detalhes de ${lot.title}`}
              >
                <span className="card-number">Nº {formatPokemonId(lot.pokemonId)}</span>
                <span className="card-heart"><Heart size={16} /></span>
                <img src={`${API_BASE_URL}${lot.imagePath}`} alt={lot.title} />
                <span className="card-image-caption">ARTWORK ORIGINAL · POKÉMON</span>
              </button>
              <div className="card-content">
                <div className="card-title-row">
                  <div>
                    <div className="card-subtitle">LOTE #{String(index + 1).padStart(3, "0")}</div>
                    <h3>{lot.title}</h3>
                  </div>
                  <div className="type-tags">
                    {lot.types.map((type) => (
                      <PokemonTypeBadge type={type} key={type} />
                    ))}
                  </div>
                </div>
                <div className="bid-info">
                  <div><small>LANCE ATUAL</small><strong>{formatCurrency(lot.currentBid ?? lot.startingBid)}</strong></div>
                  <div className="bid-count"><Gavel size={15} /><span>{lot.latestBidder ?? "Sem lances"}</span></div>
                </div>
                <div className="card-footer">
                  <Countdown endsAt={lot.endsAt} />
                  <div className="card-actions">
                    <button title="Validar auditoria" onClick={() => onShowAudit(lot)} className="icon-button">
                      <ShieldCheck size={17} />
                    </button>
                    <button className="button button-primary button-small" onClick={() => onOpenLot(lot)}>
                      Ver lote <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
