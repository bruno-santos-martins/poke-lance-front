import { ArrowDownToLine, ArrowRight, Gavel, ShieldCheck } from "lucide-react";
import { API_BASE_URL as API } from "../../../../shared/api/request";
import { Countdown, ModalClose, PokemonTypeBadge, TextInput } from "../../../../shared/components";
import type { FormController } from "../../../../shared/forms/formTypes";
import { formatDateTime, formatPokemonId } from "../../../../shared/utils";
import type { BidFormValues } from "../../schemas/bid.schema";
import type { DepositFormValues } from "../../schemas/deposit.schema";
import type { Audit, Lot, User, Wallet } from "../../AuctionPage.types";

type LotDetailsModalProps = {
  lot: Lot;
  audit: Audit | null;
  user: User | null;
  wallet: Wallet | null;
  bidForm: FormController<BidFormValues>;
  depositForm: FormController<DepositFormValues>;
  cancelling: boolean;
  formatCurrency: (amount: number) => string;
  onClose: () => void;
  onBackToLot: () => void;
  onShowAudit: (lot: Lot) => void;
  onBeginAuth: () => void;
  onCancelLot: (lot: Lot) => void;
};

export function LotDetailsModal({
  lot,
  audit,
  user,
  wallet,
  bidForm,
  depositForm,
  cancelling,
  formatCurrency,
  onClose,
  onBackToLot,
  onShowAudit,
  onBeginAuth,
  onCancelLot
}: LotDetailsModalProps) {
  return (
    <div className="modal lot-modal">
      <ModalClose onClose={onClose} />
      {audit ? (
        <>
          <div className="modal-kicker">AUDITORIA PÚBLICA</div>
          <h2>Histórico do lote</h2>
          <div className={`audit-status ${audit.valid ? "valid" : "invalid"}`}>
            <ShieldCheck size={19} />
            {audit.valid ? "Cadeia íntegra — histórico verificado" : "ATENÇÃO — adulteração detetada"}
          </div>
          <div className="audit-list">
            {audit.bids.length ? audit.bids.map((entry) => (
              <div className="audit-item" key={entry.sequence}>
                <div>
                  <b>#{entry.sequence} · {entry.bidder}</b>
                  <small>{formatDateTime(entry.timestamp)}</small>
                </div>
                <strong>{formatCurrency(entry.amount)}</strong>
                <code>{entry.hash}</code>
              </div>
            )) : <p>Ainda não existem lances para validar.</p>}
          </div>
          <button className="button button-outline full-button" onClick={onBackToLot}>Voltar ao lote</button>
        </>
      ) : (
        <div className="lot-detail">
          <div className="detail-art">
            <span>Nº {formatPokemonId(lot.pokemonId)}</span>
            <img src={`${API}${lot.imagePath}`} alt={lot.title} />
          </div>
          <div className="detail-copy">
            <div className="modal-kicker">LOTE DE COLECIONADOR</div>
            <h2>{lot.title}</h2>
            <div className="type-tags">
              {lot.types.map((type) => <PokemonTypeBadge type={type} key={type} />)}
            </div>
            <p className="detail-meta">
              ALTURA {lot.height / 10} M <span>·</span> PESO {lot.weight / 10} KG
            </p>
            <div className="stats-grid">
              {Object.entries(lot.stats ?? {}).map(([name, value]) => (
                <div key={name}><span>{name.replace("-", " ")}</span><b>{value}</b></div>
              ))}
            </div>
            <div className="detail-price">
              <small>LANCE ATUAL</small>
              <b>{formatCurrency(lot.currentBid ?? lot.startingBid)}</b>
            </div>
            <Countdown endsAt={lot.endsAt} />
            {lot.status === "OPEN" && user?.role === "BIDDER" && (
              <form className="bid-form" onSubmit={bidForm.handleSubmit}>
                <TextInput
                  label="O teu lance (R$)"
                  {...bidForm.register("amount", { valueAsNumber: true })}
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  placeholder={`mín. ${((lot.currentBid ?? lot.startingBid) + (lot.currentBid === null ? 0 : lot.minimumIncrement)) / 100}`}
                />
                {bidForm.errors.amount?.message && <small role="alert">{String(bidForm.errors.amount.message)}</small>}
                <button className="button button-primary full-button" disabled={bidForm.isSubmitting || !bidForm.isValid}>
                  {bidForm.isSubmitting ? "A enviar..." : "Fazer lance"} <Gavel size={16} />
                </button>
                <small>
                  Disponível: {formatCurrency(wallet?.available ?? 0)} · Incremento mínimo: {formatCurrency(lot.minimumIncrement)}
                </small>
              </form>
            )}
            {lot.status === "OPEN" && !user && (
              <button className="button button-primary full-button" onClick={onBeginAuth}>
                Entra para fazer um lance <ArrowRight size={16} />
              </button>
            )}
            {lot.status === "OPEN" && user?.role === "AUCTIONEER" && lot.sellerId === user.id && (
              <button
                type="button"
                className="button button-outline full-button"
                disabled={cancelling}
                onClick={() => onCancelLot(lot)}
              >
                {lot.currentBid ? "Cancelar lote e estornar lance" : "Cancelar lote"}
              </button>
            )}
            {user?.role === "BIDDER" && (
              <form className="deposit-form" onSubmit={depositForm.handleSubmit}>
                <TextInput
                  label="Adicionar saldo simulado"
                  {...depositForm.register("amount", { valueAsNumber: true })}
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Valor em R$"
                  required
                />
                {depositForm.errors.amount?.message && <small role="alert">{String(depositForm.errors.amount.message)}</small>}
                <button className="icon-button" aria-label="Adicionar saldo" disabled={depositForm.isSubmitting || !depositForm.isValid}>
                  <ArrowDownToLine size={17} />
                </button>
              </form>
            )}
            <div className="detail-actions">
              <button onClick={() => onShowAudit(lot)}><ShieldCheck size={16} /> Ver auditoria da cadeia</button>
              {lot.status === "CLOSED" && (
                <a href={`/receipt/${lot.id}`} target="_blank" rel="noreferrer">
                  Comprovativo <ArrowRight size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
