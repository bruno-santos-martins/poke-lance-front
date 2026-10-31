import { ArrowRight, ChevronLeft, ChevronRight, Mail, PackageCheck, Search, UserRound } from "lucide-react";
import { API_BASE_URL as API } from "../../../../shared/api/request";
import { ModalClose, TextInput } from "../../../../shared/components";
import type { FormController } from "../../../../shared/forms/formTypes";
import { formatDate, formatDateTime, formatPokemonId } from "../../../../shared/utils";
import type { DepositFormValues } from "../../schemas/deposit.schema";
import type { SellerAuditEntry, SellerAuctionedLot, SellerReport, Wallet } from "../../AuctionPage.types";

type SellerModalsProps = {
  formatCurrency: (amount: number) => string;
  walletModal: {
    open: boolean;
    wallet: Wallet | null;
    form: FormController<DepositFormValues>;
    onClose: () => void;
  };
  financialReport: {
    open: boolean;
    report: SellerReport | null;
    onClose: () => void;
  };
  audit: {
    open: boolean;
    entries: SellerAuditEntry[];
    visibleEntries: SellerAuditEntry[];
    loading: boolean;
    filter: string;
    filteredCount: number;
    fromDate: string;
    toDate: string;
    page: number;
    pageCount: number;
    onClose: () => void;
    onFilterChange: (value: string) => void;
    onFromDateChange: (value: string) => void;
    onToDateChange: (value: string) => void;
    onPageChange: (page: number) => void;
  };
  auctionedCards: {
    open: boolean;
    cards: SellerAuctionedLot[];
    visibleCards: SellerAuctionedLot[];
    filteredCount: number;
    loading: boolean;
    search: string;
    page: number;
    pageCount: number;
    onClose: () => void;
    onSearchChange: (value: string) => void;
    onPageChange: (page: number) => void;
    onOpenHistory: (card: SellerAuctionedLot) => void;
    onShowWinner: (winner: SellerAuctionedLot["winner"]) => void;
  };
  winner: {
    selected: SellerAuctionedLot["winner"];
    onClose: () => void;
  };
};

const auditActionLabel: Record<string, string> = {
  USER_REGISTERED: "Conta criada",
  USER_LOGGED_IN: "Sessão iniciada",
  LOT_CREATED: "Lote criado",
  BID_PLACED: "Lance registado",
  LOT_CANCELLED: "Lote cancelado",
  LOT_SETTLED: "Leilão liquidado"
};

function auditDescription(entry: SellerAuditEntry, formatCurrency: (amount: number) => string): string {
  const details = entry.details;
  if (entry.action === "LOT_CREATED" && typeof details.startingBid === "number") {
    return `Lance inicial: ${formatCurrency(details.startingBid)}`;
  }
  if (entry.action === "BID_PLACED" && typeof details.amount === "number") {
    const released = typeof details.releasedAmount === "number" ? details.releasedAmount : 0;
    return `Lance de ${formatCurrency(details.amount)}${released > 0 ? ` · ${formatCurrency(released)} liberados do lance anterior` : ""}`;
  }
  if (entry.action === "LOT_CANCELLED" && typeof details.refundedAmount === "number") {
    return details.refundedAmount > 0
      ? `Lote cancelado · estorno de ${formatCurrency(details.refundedAmount)}`
      : "Lote cancelado sem lance vigente";
  }
  if (entry.action === "LOT_SETTLED" && typeof details.amount === "number") {
    return details.amount > 0 ? `Arremate liquidado: ${formatCurrency(details.amount)}` : "Lote encerrado sem lances";
  }
  return entry.lotTitle ?? "Evento registado";
}

export function SellerModals({
  formatCurrency,
  walletModal,
  financialReport,
  audit,
  auctionedCards,
  winner
}: SellerModalsProps) {
  return (
    <>
      {walletModal.open && (
        <div className="modal">
          <ModalClose onClose={walletModal.onClose} />
          <div className="modal-kicker">CARTEIRA SIMULADA</div>
          <h2>O teu saldo.</h2>
          <div className="wallet-summary">
            <div><small>DISPONÍVEL</small><b>{formatCurrency(walletModal.wallet?.available ?? 0)}</b></div>
            <div><small>COMPROMETIDO</small><b>{formatCurrency(walletModal.wallet?.committed ?? 0)}</b></div>
            <div><small>SALDO TOTAL</small><b>{formatCurrency(walletModal.wallet?.balance ?? 0)}</b></div>
          </div>
          <form className="deposit-form wallet-deposit" onSubmit={walletModal.form.handleSubmit}>
            <TextInput
              label="Adicionar saldo simulado"
              {...walletModal.form.register("amount", { valueAsNumber: true })}
              type="number"
              min="1"
              step="0.01"
              placeholder="Valor em R$"
              required
            />
            {walletModal.form.errors.amount?.message && <small role="alert">{String(walletModal.form.errors.amount.message)}</small>}
            <button className="button button-primary" disabled={walletModal.form.isSubmitting || !walletModal.form.isValid}>Depositar</button>
          </form>
          <p>Os depósitos são simulados e atualizam a carteira imediatamente.</p>
        </div>
      )}

      {financialReport.open && (
        <div className="modal">
          <ModalClose onClose={financialReport.onClose} />
          <div className="modal-kicker">RELATÓRIO FINANCEIRO</div>
          <h2>Resumo dos arremates.</h2>
          {!financialReport.report ? <p>A carregar relatório...</p> : (
            <>
              <div className="report-total">
                <small>TOTAL RECEBIDO</small>
                <b>{formatCurrency(financialReport.report.totalReceived)}</b>
              </div>
              <div className="report-list">
                {financialReport.report.lots.length ? financialReport.report.lots.map((item) => (
                  <div key={item.id}>
                    <span>
                      <b>{item.title}</b>
                      <small>{formatDate(item.settledAt, "Sem data")} · {item.winner ?? "Sem vencedor"}</small>
                    </span>
                    <strong>{formatCurrency(item.amount)}</strong>
                  </div>
                )) : <p>Ainda não existem lotes liquidados.</p>}
              </div>
            </>
          )}
        </div>
      )}

      {audit.open && (
        <div className="modal seller-audit-modal">
          <ModalClose onClose={audit.onClose} />
          <div className="modal-kicker">REGISTRO DE ATIVIDADES</div>
          <h2>Auditoria dos teus lotes</h2>
          <p>Criações, lances, cancelamentos e liquidações, com responsável e data.</p>
          <div className="seller-audit-filters">
            <div className="seller-audit-search">
              <Search size={16} />
              <TextInput
                variant="search"
                value={audit.filter}
                onChange={(event) => audit.onFilterChange(event.target.value)}
                placeholder="Filtrar por Pokémon..."
                aria-label="Filtrar auditoria por Pokémon"
              />
            </div>
            <TextInput label="De" type="date" value={audit.fromDate} onChange={(event) => audit.onFromDateChange(event.target.value)} aria-label="Data inicial da auditoria" />
            <TextInput label="Até" type="date" value={audit.toDate} onChange={(event) => audit.onToDateChange(event.target.value)} aria-label="Data final da auditoria" />
          </div>
          {audit.loading ? <p>A carregar a auditoria...</p> : audit.filteredCount ? (
            <>
              <div className="seller-audit-count">
                {audit.filteredCount} {audit.filteredCount === 1 ? "evento encontrado" : "eventos encontrados"}
              </div>
              <div className="seller-audit-list">
                {audit.visibleEntries.map((entry) => (
                  <article className="seller-audit-entry" key={entry.id}>
                    <div className="seller-audit-entry-heading">
                      <b>{auditActionLabel[entry.action] ?? entry.action}</b>
                      <time dateTime={entry.createdAt}>{formatDateTime(entry.createdAt)}</time>
                    </div>
                    <span>
                      {entry.lotTitle ?? (entry.entityType === "USER" ? "Conta" : "Carteira")} · {entry.actorName} ({entry.actorRole === "SYSTEM" ? "Sistema" : entry.actorRole === "AUCTIONEER" ? "Leiloeiro" : "Licitante"})
                    </span>
                    <small>{auditDescription(entry, formatCurrency)}</small>
                  </article>
                ))}
              </div>
              {audit.pageCount > 1 && (
                <div className="auctioned-pagination seller-audit-pagination">
                  <button type="button" className="button button-outline button-small" disabled={audit.page <= 1} onClick={() => audit.onPageChange(audit.page - 1)}>
                    <ChevronLeft size={15} /> Anterior
                  </button>
                  <span>Página {audit.page} de {audit.pageCount}</span>
                  <button type="button" className="button button-outline button-small" disabled={audit.page >= audit.pageCount} onClick={() => audit.onPageChange(audit.page + 1)}>
                    Próxima <ChevronRight size={15} />
                  </button>
                </div>
              )}
            </>
          ) : <p className="report-empty">{audit.entries.length ? "Nenhum evento corresponde aos filtros." : "Ainda não há eventos para os teus lotes."}</p>}
        </div>
      )}

      {auctionedCards.open && (
        <div className="modal auctioned-cards-modal">
          <ModalClose onClose={auctionedCards.onClose} />
          <div className="modal-kicker">LOTE ENCERRADO E LIQUIDADO</div>
          <h2>Cartas leiloadas</h2>
          <p>Consulte os lotes arrematados e abra o histórico completo de lances.</p>
          <div className="auctioned-search">
            <Search size={16} />
            <TextInput
              variant="search"
              aria-label="Buscar carta por nome ou número"
              value={auctionedCards.search}
              onChange={(event) => auctionedCards.onSearchChange(event.target.value)}
              placeholder="Buscar por nome ou número..."
            />
          </div>
          {auctionedCards.loading ? <p className="report-empty">A carregar as cartas leiloadas...</p> : (
            <>
              <div className="auctioned-cards-count">
                {auctionedCards.filteredCount} {auctionedCards.filteredCount === 1 ? "carta encontrada" : "cartas encontradas"}
              </div>
              {auctionedCards.visibleCards.length ? (
                <div className="auctioned-cards-grid">
                  {auctionedCards.visibleCards.map((card) => (
                    <article className="auctioned-card" key={card.id}>
                      <img src={`${API}${card.imagePath}`} alt="" />
                      <span className="auctioned-card-info">
                        <b>{card.title}</b>
                        <small>Nº {formatPokemonId(card.pokemonId)} · {card.bidCount} {card.bidCount === 1 ? "lance" : "lances"}</small>
                        <small>{formatDate(card.settledAt, "Data indisponível")}</small>
                      </span>
                      <strong>{formatCurrency(card.amount)}</strong>
                      <div className="auctioned-card-actions">
                        <button type="button" className="auctioned-card-action" onClick={() => auctionedCards.onOpenHistory(card)}>
                          Ver histórico <ArrowRight size={14} />
                        </button>
                        <button type="button" className="auctioned-card-action" disabled={!card.winner} onClick={() => auctionedCards.onShowWinner(card.winner)}>
                          <UserRound size={14} /> Ver ganhador
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="acquired-cards-empty">
                  <PackageCheck size={24} />
                  <b>{auctionedCards.cards.length ? "Nenhuma carta encontrada" : "Ainda não há cartas leiloadas"}</b>
                  <span>{auctionedCards.cards.length ? "Tente buscar por outro nome ou número." : "Os lotes vendidos aparecerão aqui após a liquidação."}</span>
                </div>
              )}
              {auctionedCards.pageCount > 1 && (
                <div className="auctioned-pagination">
                  <button className="button button-outline button-small" disabled={auctionedCards.page <= 1} onClick={() => auctionedCards.onPageChange(auctionedCards.page - 1)}>
                    <ChevronLeft size={15} /> Anterior
                  </button>
                  <span>Página {auctionedCards.page} de {auctionedCards.pageCount}</span>
                  <button className="button button-outline button-small" disabled={auctionedCards.page >= auctionedCards.pageCount} onClick={() => auctionedCards.onPageChange(auctionedCards.page + 1)}>
                    Próxima <ChevronRight size={15} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {winner.selected && (
        <div className="modal winner-contact-modal">
          <ModalClose onClose={winner.onClose} />
          <div className="modal-kicker">DADOS DO GANHADOR</div>
          <h2>Entre em contato</h2>
          <p>Este licitante venceu o lote. Use o e-mail abaixo para combinar os próximos passos.</p>
          <div className="winner-contact-details">
            <UserRound size={20} />
            <div><small>Nome</small><b>{winner.selected.name}</b></div>
          </div>
          <div className="winner-contact-details">
            <Mail size={20} />
            <div><small>E-mail</small><b>{winner.selected.email}</b></div>
          </div>
          <a className="button button-primary winner-contact-email" href={`mailto:${winner.selected.email}`}>
            <Mail size={16} /> Enviar e-mail
          </a>
        </div>
      )}
    </>
  );
}
