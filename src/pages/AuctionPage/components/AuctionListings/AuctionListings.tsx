import { ArrowRight, Gavel, Search, ShieldCheck } from "lucide-react";
import { API_BASE_URL } from "../../../../shared/api/request";
import { Countdown, PokemonTypeBadge, TextInput } from "../../../../shared/components";
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
          <div className="searchbox">
            <Search size={16} />
            <TextInput
              variant="search"
              aria-label="Pesquisar Pokémon"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Pesquisar Pokémon..."
            />
          </div>
          <div className="live-label"><span className="live-dot" /> AO VIVO</div>
        </div>
      </div>
      {!lots.length ? (
        <div className="empty-state" data-cy="empty-state">
          <div className="empty-icon"><Gavel /></div>
          <h3>Nenhum lote por aqui</h3>
          <p>Volta mais tarde para encontrar novas cartas na vitrine.</p>
        </div>
      ) : (
        <div className="lot-grid">
          {lots.map((lot, index) => (
            <article className="lot-card" data-type={lot.types[0] ?? "normal"} data-cy="lot-card" key={lot.id}>
              <button
                type="button"
                className="tcg-card"
                onClick={() => onOpenLot(lot)}
                aria-label={`Ver detalhes de ${lot.title}`}
              >
                <div className="tcg-header">
                  <span className="tcg-name">{lot.title}</span>
                  {lot.stats?.["hp"] != null && (
                    <span className="tcg-hp"><em>HP</em> {lot.stats["hp"]}</span>
                  )}
                </div>
                <div className="tcg-art">
                  <img src={`${API_BASE_URL}${lot.imagePath}`} alt={lot.title} />
                </div>
                <div className="tcg-info">
                  <span className="tcg-number">Nº {formatPokemonId(lot.pokemonId)}</span>
                  <div className="type-tags">
                    {lot.types.map((type) => (
                      <PokemonTypeBadge type={type} key={type} />
                    ))}
                  </div>
                </div>
              </button>
              <div className="card-auction">
                <div className="card-auction-row">
                  <div>
                    <div className="card-subtitle">LOTE #{String(index + 1).padStart(3, "0")}</div>
                    <h3 className="card-auction-name">{lot.title}</h3>
                  </div>
                  <div>
                    <small className="card-bid-label">LANCE ATUAL</small>
                    <strong className="card-bid-value" data-cy="card-current-bid">{formatCurrency(lot.currentBid ?? lot.startingBid)}</strong>
                  </div>
                </div>
                <div className="card-footer">
                  <div className="bid-count"><Gavel size={14} /><span>{lot.latestBidder ?? "Sem lances"}</span></div>
                  <Countdown endsAt={lot.endsAt} />
                  <div className="card-actions">
                    <button type="button" title="Validar auditoria" onClick={() => onShowAudit(lot)} className="icon-button">
                      <ShieldCheck size={17} />
                    </button>
                    <button type="button" className="button button-primary button-small" data-cy="btn-open-lot" onClick={() => onOpenLot(lot)}>
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
