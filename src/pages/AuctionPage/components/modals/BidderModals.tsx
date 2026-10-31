import { ArrowRight, PackageCheck } from "lucide-react";
import { API_BASE_URL as API } from "../../../../shared/api/request";
import { Badge, ModalClose, type BadgeTone } from "../../../../shared/components";
import { formatDate, formatDateTime } from "../../../../shared/utils";
import type { BidderReport } from "../../AuctionPage.types";

const bidStatusLabel: Record<BidderReport["bids"][number]["status"], string> = {
  LEADING: "Liderando",
  OUTBID: "Superado",
  WON: "Arrematado",
  LOST: "Encerrado",
  CANCELLED: "Cancelado"
};

const bidStatusTone: Record<BidderReport["bids"][number]["status"], BadgeTone> = {
  LEADING: "success",
  OUTBID: "danger",
  WON: "success",
  LOST: "danger",
  CANCELLED: "neutral"
};

const transactionTypeLabel: Record<BidderReport["transactions"][number]["type"], string> = {
  OPENING_BALANCE: "Saldo inicial",
  OPENING_COMMITMENT: "Compromisso inicial",
  DEPOSIT: "Depósito",
  BID_COMMITTED: "Lance comprometido",
  BID_RELEASED: "Lance liberado",
  BID_REFUNDED: "Lance estornado",
  AUCTION_DEBIT: "Arremate pago",
  AUCTION_CREDIT: "Arremate recebido"
};

function transactionDirection(type: BidderReport["transactions"][number]["type"]): "positive" | "negative" | "neutral" {
  if (type === "OPENING_BALANCE" || type === "DEPOSIT" || type === "BID_RELEASED" || type === "BID_REFUNDED" || type === "AUCTION_CREDIT") return "positive";
  if (type === "OPENING_COMMITMENT" || type === "BID_COMMITTED" || type === "AUCTION_DEBIT") return "negative";
  return "neutral";
}

type BidderModalsProps = {
  report: BidderReport | null;
  loading: boolean;
  error: string;
  reportOpen: boolean;
  acquiredCardsOpen: boolean;
  formatCurrency: (amount: number) => string;
  onCloseReport: () => void;
  onRetryReport: () => void;
  onCloseAcquiredCards: () => void;
  onRetryAcquiredCards: () => void;
};

export function BidderModals({
  report,
  loading,
  error,
  reportOpen,
  acquiredCardsOpen,
  formatCurrency,
  onCloseReport,
  onRetryReport,
  onCloseAcquiredCards,
  onRetryAcquiredCards
}: BidderModalsProps) {
  return (
    <>
      {reportOpen && (
        <div className="modal bidder-report-modal">
          <ModalClose onClose={onCloseReport} />
          <div className="modal-kicker">ÁREA DO LICITANTE</div>
          <h2>O teu relatório</h2>
          <p>Consulte os seus lances e todas as movimentações da carteira.</p>
          {loading ? <p>A carregar o relatório...</p> : error ? (
            <div className="report-load-error">
              <p>{error}</p>
              <button className="button button-outline button-small" onClick={onRetryReport}>Tentar novamente</button>
            </div>
          ) : report && (
            <>
              <div className="wallet-summary bidder-report-summary">
                <div><small>SALDO TOTAL</small><b>{formatCurrency(report.wallet.balance)}</b></div>
                <div><small>COMPROMETIDO</small><b>{formatCurrency(report.wallet.committed)}</b></div>
                <div><small>DISPONÍVEL</small><b>{formatCurrency(report.wallet.available)}</b></div>
              </div>
              <section className="bidder-report-section">
                <div className="report-section-heading">
                  <h3>Histórico de lances</h3>
                  <span>{report.bids.length} {report.bids.length === 1 ? "lance" : "lances"}</span>
                </div>
                {report.bids.length ? (
                  <div className="bidder-report-list">
                    {report.bids.map((bid) => (
                      <div className="bidder-report-row" key={bid.id}>
                        <div className="report-entry-main">
                          <b>{bid.lotTitle}</b>
                          <small>{formatDateTime(bid.createdAt)}</small>
                        </div>
                        <strong>{formatCurrency(bid.amount)}</strong>
                        <Badge size="compact" tone={bidStatusTone[bid.status]}>{bidStatusLabel[bid.status]}</Badge>
                      </div>
                    ))}
                  </div>
                ) : <p className="report-empty">Ainda não fizeste nenhum lance.</p>}
              </section>
              <section className="bidder-report-section">
                <div className="report-section-heading">
                  <h3>Extrato da carteira</h3>
                  <span>{report.transactions.length} {report.transactions.length === 1 ? "movimentação" : "movimentações"}</span>
                </div>
                {report.transactions.length ? (
                  <div className="bidder-report-list">
                    {report.transactions.map((transaction) => {
                      const direction = transactionDirection(transaction.type);
                      const amountPrefix = direction === "positive" ? "+" : direction === "negative" ? "−" : "";
                      return (
                        <div className="bidder-report-row transaction-row" key={transaction.id}>
                          <div className="report-entry-main">
                            <b>{transaction.description}</b>
                            <small>{formatDateTime(transaction.createdAt)}</small>
                          </div>
                          <strong className={direction === "neutral" ? "" : `transaction-${direction}`}>
                            {amountPrefix}{formatCurrency(transaction.amount)}
                          </strong>
                          <Badge size="compact">{transactionTypeLabel[transaction.type]}</Badge>
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="report-empty">Ainda não existem movimentações registadas.</p>}
              </section>
            </>
          )}
        </div>
      )}

      {acquiredCardsOpen && (
        <div className="modal acquired-cards-modal">
          <ModalClose onClose={onCloseAcquiredCards} />
          <div className="modal-kicker">A TUA COLEÇÃO</div>
          <h2>Cartas adquiridas</h2>
          <p>Cartas que arremataste em leilões já liquidados.</p>
          {loading ? <p>A carregar as cartas...</p> : error ? (
            <div className="report-load-error">
              <p>{error}</p>
              <button className="button button-outline button-small" onClick={onRetryAcquiredCards}>Tentar novamente</button>
            </div>
          ) : report?.acquiredCards.length ? (
            <div className="acquired-cards-grid">
              {report.acquiredCards.map((card) => (
                <article className="acquired-card" key={card.id}>
                  <img src={`${API}${card.imagePath}`} alt={card.title} />
                  <div className="acquired-card-info">
                    <b>{card.title}</b>
                    <span>{formatCurrency(card.amount)}</span>
                    <small>Arrematada em {formatDate(card.settledAt)}</small>
                  </div>
                  <a className="button button-outline button-small" href={`/receipt/${card.id}`} target="_blank" rel="noreferrer">
                    Comprovativo <ArrowRight size={14} />
                  </a>
                </article>
              ))}
            </div>
          ) : report && (
            <div className="acquired-cards-empty">
              <PackageCheck size={24} />
              <b>A tua coleção ainda está vazia</b>
              <span>Quando venceres um leilão, a carta aparecerá aqui.</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}
