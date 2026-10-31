import { useCallback, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { AlertTriangle, X } from "lucide-react";
import { API_BASE_URL as API } from "../../shared/api/request";
import { SiteFooter } from "../../shared/layout";
import { convertReaisToCentavos, formatCurrencyBRL } from "../../shared/utils";
import "./AuctionPage.css";
import { AuctionHeader } from "./components/AuctionHeader";
import { AuctionHero } from "./components/AuctionHero";
import { AuctionListings } from "./components/AuctionListings";
import { TrustStrip } from "./components/TrustStrip";
import { AuthModal, BidderModals, CreateLotModal, LotDetailsModal, SellerModals } from "./components/modals";

import type {
  Audit,
  BidderReport,
  Lot,
  PokemonPreview,
  PokemonSuggestion,
  SellerAuditEntry,
  SellerAuctionedLot,
  SellerReport,
  User,
  Wallet
} from "./AuctionPage.types";

async function request<T>(path: string, token?: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers }
  });
  let data: { error?: string; [key: string]: unknown };
  try { data = await response.json() as { error?: string; [key: string]: unknown }; }
  catch { throw new Error("O servidor devolveu uma resposta inválida."); }
  if (!response.ok) throw new Error(data.error ?? "Não foi possível concluir o pedido.");
  return data as T;
}

function searchPokemon(query: string, signal: AbortSignal): Promise<PokemonSuggestion[]> {
  return request<PokemonSuggestion[]>(`/pokemon/search?q=${encodeURIComponent(query)}`, undefined, { signal });
}

function loadPokemon(id: number, signal: AbortSignal): Promise<PokemonPreview> {
  return request<PokemonPreview>(`/pokemon/${id}`, undefined, { signal });
}

const money = formatCurrencyBRL;

export default function AuctionPage() {
  const [token, setToken] = useState(() => localStorage.getItem("auction-token") ?? "");
  const [user, setUser] = useState<User | null>(() => JSON.parse(localStorage.getItem("auction-user") ?? "null") as User | null);
  const [lots, setLots] = useState<Lot[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [selected, setSelected] = useState<Lot | null>(null);
  const [lotPendingCancellation, setLotPendingCancellation] = useState<Lot | null>(null);
  const [audit, setAudit] = useState<Audit | null>(null);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [busy, setBusy] = useState(false);
  const [deposit, setDeposit] = useState("");
  const [bidValue, setBidValue] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonPreview | null>(null);
  const [walletOpen, setWalletOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [report, setReport] = useState<SellerReport | null>(null);
  const [sellerAuditOpen, setSellerAuditOpen] = useState(false);
  const [sellerAudit, setSellerAudit] = useState<SellerAuditEntry[]>([]);
  const [sellerAuditLoading, setSellerAuditLoading] = useState(false);
  const [sellerAuditPokemonFilter, setSellerAuditPokemonFilter] = useState("");
  const [sellerAuditFromDate, setSellerAuditFromDate] = useState("");
  const [sellerAuditToDate, setSellerAuditToDate] = useState("");
  const [sellerAuditPage, setSellerAuditPage] = useState(1);
  const [bidderReportOpen, setBidderReportOpen] = useState(false);
  const [bidderReport, setBidderReport] = useState<BidderReport | null>(null);
  const [bidderReportLoading, setBidderReportLoading] = useState(false);
  const [bidderReportError, setBidderReportError] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [acquiredCardsOpen, setAcquiredCardsOpen] = useState(false);
  const [auctionedCardsOpen, setAuctionedCardsOpen] = useState(false);
  const [auctionedCards, setAuctionedCards] = useState<SellerAuctionedLot[]>([]);
  const [auctionedCardsLoading, setAuctionedCardsLoading] = useState(false);
  const [auctionedCardsSearch, setAuctionedCardsSearch] = useState("");
  const [auctionedCardsPage, setAuctionedCardsPage] = useState(1);
  const [selectedWinner, setSelectedWinner] = useState<SellerAuctionedLot["winner"]>(null);

  const loadLots = useCallback(async () => {
    try { setLots(await request<Lot[]>("/lots")); } catch (reason) { setError((reason as Error).message); }
  }, []);
  const loadWallet = useCallback(async () => {
    if (token && user?.role === "BIDDER") {
      try { setWallet(await request<Wallet>("/wallet", token)); } catch (reason) { setError((reason as Error).message); }
    } else setWallet(null);
  }, [token, user]);

  useEffect(() => { void loadLots(); }, [loadLots]);
  useEffect(() => {
    const socket = io(API, { auth: token ? { token } : {} });
    const refreshSelected = () => {
      void loadLots();
      if (selected) void request<Lot>(`/lots/${selected.id}`).then(setSelected).catch((reason: Error) => setError(reason.message));
    };
    socket.on("lots:updated", () => { void loadLots(); });
    socket.on("bid:placed", refreshSelected);
    socket.on("lot:updated", refreshSelected);
    socket.on("wallet:updated", (updatedWallet: Wallet) => setWallet(updatedWallet));
    if (selected) socket.emit("lot:join", selected.id);
    return () => { if (selected) socket.emit("lot:leave", selected.id); socket.disconnect(); };
  }, [selected, loadLots, token]);
  useEffect(() => { void loadWallet(); }, [loadWallet]);
  useEffect(() => {
    if (!notice && !error) return;
    const id = window.setTimeout(() => { setNotice(""); setError(""); }, 4500);
    return () => window.clearTimeout(id);
  }, [notice, error]);

  const filtered = useMemo(() => lots.filter((lot) => lot.title.toLowerCase().includes(query.toLowerCase()) || lot.types.some((type) => type.includes(query.toLowerCase()))), [lots, query]);
  const filteredAuctionedCards = useMemo(() => {
    const search = auctionedCardsSearch.trim().toLowerCase();
    return auctionedCards.filter((lot) => lot.title.toLowerCase().includes(search) || String(lot.pokemonId).includes(search));
  }, [auctionedCards, auctionedCardsSearch]);
  const auctionedCardsPageCount = Math.max(1, Math.ceil(filteredAuctionedCards.length / 20));
  const visibleAuctionedCards = filteredAuctionedCards.slice((auctionedCardsPage - 1) * 20, auctionedCardsPage * 20);
  const filteredSellerAudit = useMemo(() => {
    const pokemonFilter = sellerAuditPokemonFilter.trim().toLocaleLowerCase();
    return sellerAudit.filter((entry) => {
      const pokemonName = (entry.lotTitle ?? (typeof entry.details.title === "string" ? entry.details.title : "")).toLocaleLowerCase();
      const entryDate = new Date(entry.createdAt);
      const localDate = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, "0")}-${String(entryDate.getDate()).padStart(2, "0")}`;
      return (!pokemonFilter || pokemonName.includes(pokemonFilter))
        && (!sellerAuditFromDate || localDate >= sellerAuditFromDate)
        && (!sellerAuditToDate || localDate <= sellerAuditToDate);
    });
  }, [sellerAudit, sellerAuditPokemonFilter, sellerAuditFromDate, sellerAuditToDate]);
  const sellerAuditPageCount = Math.max(1, Math.ceil(filteredSellerAudit.length / 6));
  const visibleSellerAudit = filteredSellerAudit.slice((sellerAuditPage - 1) * 6, sellerAuditPage * 6);
  const closeSession = () => { localStorage.removeItem("auction-token"); localStorage.removeItem("auction-user"); setToken(""); setUser(null); setWallet(null); };
  const beginAuth = () => { setError(""); setAuthOpen(true); };

  async function submitAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await request<{ token: string; user: User }>("/auth/" + authMode, undefined, { method: "POST", body: JSON.stringify({ name: form.get("name"), email: form.get("email"), password: form.get("password"), role: form.get("role") }) });
      localStorage.setItem("auction-token", result.token); localStorage.setItem("auction-user", JSON.stringify(result.user));
      setToken(result.token); setUser(result.user); setAuthOpen(false); setNotice(`Bem-vindo, ${result.user.name}!`);
    } catch (reason) { setError((reason as Error).message); }
    finally { setBusy(false); }
  }

  async function makeBid(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selected) return; setBusy(true); setError("");
    try {
      await request(`/lots/${selected.id}/bids`, token, { method: "POST", body: JSON.stringify({ amount: convertReaisToCentavos(Number(bidValue)) }) });
      setNotice("Lance registado e saldo comprometido."); setBidValue(""); await Promise.all([loadLots(), loadWallet()]);
      setSelected(await request<Lot>(`/lots/${selected.id}`));
    } catch (reason) { setError((reason as Error).message); }
    finally { setBusy(false); }
  }

  async function addFunds(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true);
    try { await request("/wallet/deposits", token, { method: "POST", body: JSON.stringify({ amount: convertReaisToCentavos(Number(deposit)) }) }); setDeposit(""); setNotice("Saldo adicionado à carteira."); await loadWallet(); }
    catch (reason) { setError((reason as Error).message); }
    finally { setBusy(false); }
  }

  async function showAudit(lot: Lot) {
    setSelected(lot); setAudit(null); setError("");
    try { setAudit(await request<Audit>(`/lots/${lot.id}/audit`)); }
    catch (reason) { setError((reason as Error).message); }
  }

  async function createLot(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true);
    const form = new FormData(event.currentTarget);
    if (!selectedPokemon) {
      setError("Escolha um Pokémon na lista de sugestões.");
      setBusy(false);
      return;
    }
    try {
      await request("/lots", token, { method: "POST", body: JSON.stringify({ pokemon: String(selectedPokemon.id), startingBid: convertReaisToCentavos(Number(form.get("startingBid"))), minimumIncrement: convertReaisToCentavos(Number(form.get("increment"))), durationMinutes: Number(form.get("duration")) }) });
      setCreateOpen(false); setNotice("Lote criado com imagem armazenada localmente."); await loadLots();
    } catch (reason) { setError((reason as Error).message); }
    finally { setBusy(false); }
  }

  async function cancelLot(lot: Lot) {
    setBusy(true);
    try {
      const result = await request<{ refundedAmount: number; imageCleanupWarning?: string }>(`/lots/${lot.id}`, token, { method: "DELETE" });
      setLotPendingCancellation(null);
      setSelected(null);
      const cancellationNotice = result.refundedAmount > 0
        ? `Lote cancelado. ${money(result.refundedAmount)} devolvidos ao licitante.`
        : "Lote cancelado.";
      setNotice(result.imageCleanupWarning
        ? `${cancellationNotice} ${result.imageCleanupWarning}`
        : cancellationNotice);
      await loadLots();
    }
    catch (reason) { setError((reason as Error).message); }
    finally { setBusy(false); }
  }

  async function showSellerAudit() {
    setProfileMenuOpen(false);
    setError("");
    setSellerAudit([]);
    setSellerAuditPokemonFilter("");
    setSellerAuditFromDate("");
    setSellerAuditToDate("");
    setSellerAuditPage(1);
    setSellerAuditOpen(true);
    setSellerAuditLoading(true);
    try { setSellerAudit(await request<SellerAuditEntry[]>("/seller/audit", token)); }
    catch (reason) { setSellerAuditOpen(false); setError((reason as Error).message); }
    finally { setSellerAuditLoading(false); }
  }

  async function showReport() {
    setProfileMenuOpen(false);
    setError(""); setReport(null); setReportOpen(true);
    try { setReport(await request<SellerReport>("/seller/reports", token)); }
    catch (reason) { setReportOpen(false); setError((reason as Error).message); }
  }

  async function showAuctionedCards() {
    setProfileMenuOpen(false);
    setError("");
    setAuctionedCards([]);
    setAuctionedCardsSearch("");
    setAuctionedCardsPage(1);
    setAuctionedCardsOpen(true);
    setAuctionedCardsLoading(true);
    try { setAuctionedCards(await request<SellerAuctionedLot[]>("/seller/auctioned-lots", token)); }
    catch (reason) { setAuctionedCardsOpen(false); setError((reason as Error).message); }
    finally { setAuctionedCardsLoading(false); }
  }

  async function showAuctionedLotHistory(card: SellerAuctionedLot) {
    setAuctionedCardsOpen(false);
    try {
      const lot = await request<Lot>(`/lots/${card.id}`);
      await showAudit(lot);
    } catch (reason) { setError((reason as Error).message); }
  }

  async function showBidderReport() {
    setProfileMenuOpen(false);
    setError("");
    setBidderReportError("");
    setBidderReport(null);
    setBidderReportOpen(true);
    setBidderReportLoading(true);
    try { setBidderReport(await request<BidderReport>("/bidder/report", token)); }
    catch (reason) {
      const message = (reason as Error).message;
      setBidderReportError(message);
      setError(message);
    }
    finally { setBidderReportLoading(false); }
  }

  async function showAcquiredCards() {
    setProfileMenuOpen(false);
    setError("");
    setBidderReportError("");
    setBidderReport(null);
    setAcquiredCardsOpen(true);
    setBidderReportLoading(true);
    try { setBidderReport(await request<BidderReport>("/bidder/report", token)); }
    catch (reason) {
      const message = (reason as Error).message;
      setBidderReportError(message);
      setError(message);
    }
    finally { setBidderReportLoading(false); }
  }

  useEffect(() => { setAuctionedCardsPage(1); }, [auctionedCardsSearch]);
  useEffect(() => { setAuctionedCardsPage((page) => Math.min(page, auctionedCardsPageCount)); }, [auctionedCardsPageCount]);

  return (
    <div className="app-shell">
      <AuctionHeader
        user={user}
        wallet={wallet}
        profileMenuOpen={profileMenuOpen}
        formatCurrency={money}
        onOpenWallet={() => setWalletOpen(true)}
        onCreateLot={() => {
          setSelectedPokemon(null);
          setCreateOpen(true);
        }}
        onToggleProfileMenu={() => setProfileMenuOpen((open) => !open)}
        onOpenAuctionedCards={() => void showAuctionedCards()}
        onOpenReports={() => user?.role === "BIDDER" ? void showBidderReport() : void showReport()}
        onOpenAudit={() => void showSellerAudit()}
        onOpenAcquiredCards={() => void showAcquiredCards()}
        onLogout={closeSession}
        onLogin={beginAuth}
      />

      <main>
        <AuctionHero openLotCount={lots.length} />
        <TrustStrip />
        <AuctionListings
          lots={filtered}
          query={query}
          formatCurrency={money}
          onQueryChange={setQuery}
          onShowAudit={(lot) => void showAudit(lot)}
          onOpenLot={(lot) => {
            setAudit(null);
            setSelected(lot);
          }}
        />
        <SiteFooter
          brandHref="/"
          copyrightMessage="Feito para quem coleciona com paixão. © 2025 PokéLance."
          integrityLabel="Integridade verificável"
        />
      </main>

      {(authOpen || createOpen || selected || walletOpen || reportOpen || sellerAuditOpen || bidderReportOpen || acquiredCardsOpen || auctionedCardsOpen || selectedWinner) && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) { setAuthOpen(false); setCreateOpen(false); setSelected(null); setAudit(null); setWalletOpen(false); setReportOpen(false); setSellerAuditOpen(false); setBidderReportOpen(false); setAcquiredCardsOpen(false); setAuctionedCardsOpen(false); setSelectedWinner(null); } }}>
        {authOpen && (
          <AuthModal
            mode={authMode}
            busy={busy}
            onClose={() => setAuthOpen(false)}
            onSubmit={submitAuth}
            onToggleMode={() => setAuthMode((mode) => mode === "login" ? "register" : "login")}
          />
        )}

        {createOpen && (
          <CreateLotModal
            busy={busy}
            selectedPokemon={selectedPokemon}
            searchPokemon={searchPokemon}
            loadPokemon={loadPokemon}
            onClose={() => setCreateOpen(false)}
            onSubmit={createLot}
            onPokemonSelectionChange={setSelectedPokemon}
          />
        )}

        <SellerModals
          formatCurrency={money}
          walletModal={{
            open: walletOpen,
            wallet,
            deposit,
            busy,
            onClose: () => setWalletOpen(false),
            onDepositChange: setDeposit,
            onAddFunds: addFunds
          }}
          financialReport={{
            open: reportOpen,
            report,
            onClose: () => setReportOpen(false)
          }}
          audit={{
            open: sellerAuditOpen,
            entries: sellerAudit,
            visibleEntries: visibleSellerAudit,
            filteredCount: filteredSellerAudit.length,
            loading: sellerAuditLoading,
            filter: sellerAuditPokemonFilter,
            fromDate: sellerAuditFromDate,
            toDate: sellerAuditToDate,
            page: sellerAuditPage,
            pageCount: sellerAuditPageCount,
            onClose: () => setSellerAuditOpen(false),
            onFilterChange: (value) => {
              setSellerAuditPokemonFilter(value);
              setSellerAuditPage(1);
            },
            onFromDateChange: (value) => {
              setSellerAuditFromDate(value);
              setSellerAuditPage(1);
            },
            onToDateChange: (value) => {
              setSellerAuditToDate(value);
              setSellerAuditPage(1);
            },
            onPageChange: setSellerAuditPage
          }}
          auctionedCards={{
            open: auctionedCardsOpen,
            cards: auctionedCards,
            visibleCards: visibleAuctionedCards,
            filteredCount: filteredAuctionedCards.length,
            loading: auctionedCardsLoading,
            search: auctionedCardsSearch,
            page: auctionedCardsPage,
            pageCount: auctionedCardsPageCount,
            onClose: () => setAuctionedCardsOpen(false),
            onSearchChange: setAuctionedCardsSearch,
            onPageChange: setAuctionedCardsPage,
            onOpenHistory: (card) => void showAuctionedLotHistory(card),
            onShowWinner: setSelectedWinner
          }}
          winner={{
            selected: selectedWinner,
            onClose: () => setSelectedWinner(null)
          }}
        />

        <BidderModals
          report={bidderReport}
          loading={bidderReportLoading}
          error={bidderReportError}
          reportOpen={bidderReportOpen}
          acquiredCardsOpen={acquiredCardsOpen}
          formatCurrency={money}
          onCloseReport={() => setBidderReportOpen(false)}
          onRetryReport={() => void showBidderReport()}
          onCloseAcquiredCards={() => setAcquiredCardsOpen(false)}
          onRetryAcquiredCards={() => void showAcquiredCards()}
        />

        {selected && (
          <LotDetailsModal
            lot={selected}
            audit={audit}
            user={user}
            wallet={wallet}
            bidValue={bidValue}
            deposit={deposit}
            busy={busy}
            formatCurrency={money}
            onClose={() => {
              setSelected(null);
              setAudit(null);
            }}
            onBackToLot={() => setAudit(null)}
            onBidValueChange={setBidValue}
            onDepositChange={setDeposit}
            onMakeBid={makeBid}
            onAddFunds={addFunds}
            onShowAudit={(lot) => void showAudit(lot)}
            onBeginAuth={() => {
              setSelected(null);
              beginAuth();
            }}
            onCancelLot={setLotPendingCancellation}
          />
        )}
      </div>}
      {lotPendingCancellation && <div
        className="modal-backdrop cancellation-backdrop"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && !busy) setLotPendingCancellation(null);
        }}
      >
        <section className="modal cancellation-modal" role="alertdialog" aria-modal="true" aria-labelledby="cancel-lot-title" aria-describedby="cancel-lot-description">
          <button type="button" className="cancellation-close" aria-label="Fechar confirmação" disabled={busy} onClick={() => setLotPendingCancellation(null)}>
            <X size={18} />
          </button>
          <div className="cancellation-icon"><AlertTriangle size={22} /></div>
          <div className="modal-kicker">CANCELAMENTO DE LOTE</div>
          <h2 id="cancel-lot-title">Cancelar {lotPendingCancellation.title}?</h2>
          <p id="cancel-lot-description">
            {lotPendingCancellation.currentBid
              ? "O lote será removido da vitrine. O valor do lance atual será estornado à carteira do licitante e o histórico será mantido."
              : "O lote será removido da vitrine. Esta ação não pode ser desfeita."}
          </p>
          <div className="cancellation-actions">
            <button type="button" className="button button-outline" disabled={busy} onClick={() => setLotPendingCancellation(null)}>Manter lote</button>
            <button type="button" className="button cancellation-confirm" disabled={busy} onClick={() => void cancelLot(lotPendingCancellation)}>
              {busy ? "A cancelar..." : "Confirmar cancelamento"}
            </button>
          </div>
        </section>
      </div>}
      {(notice || error) && <div className={`toast ${error ? "toast-error" : ""}`}><span>{error || notice}</span><button onClick={() => { setError(""); setNotice(""); }}><X size={15} /></button></div>}
    </div>
  );
}
