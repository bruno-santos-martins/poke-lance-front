import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";
import { io } from "socket.io-client";
import { AlertTriangle } from "lucide-react";
import { API_BASE_URL as API, ApiError, request } from "../../shared/api/request";
import { ToastNotification } from "../../shared/components";
import { SiteFooter } from "../../shared/layout";
import { formatCurrencyBRL } from "../../shared/utils";
import "./AuctionPage.css";
import { AuctionHeader } from "./components/AuctionHeader";
import { AuctionHero } from "./components/AuctionHero";
import { AuctionListings } from "./components/AuctionListings";
import { TrustStrip } from "./components/TrustStrip";
import { AuthModal, BidderModals, ConfirmationModal, CreateLotModal, LotDetailsModal, SellerModals } from "./components/modals";
import { useAuthForm } from "./hooks/useAuthForm";
import { useBidForm } from "./hooks/useBidForm";
import { useCreateLotForm } from "./hooks/useCreateLotForm";
import { useDepositForm } from "./hooks/useDepositForm";

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

function searchPokemon(query: string, signal: AbortSignal): Promise<PokemonSuggestion[]> {
  return request<PokemonSuggestion[]>(`/pokemon/search?q=${encodeURIComponent(query)}`, { signal });
}

function loadPokemon(id: number, signal: AbortSignal): Promise<PokemonPreview> {
  return request<PokemonPreview>(`/pokemon/${id}`, { signal });
}

const money = formatCurrencyBRL;

export default function AuctionPage() {
  const [user, setUser] = useState<User | null>(null);
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
    if (user?.role === "BIDDER") {
      try { setWallet(await request<Wallet>("/wallet")); } catch (reason) { setError((reason as Error).message); }
    } else setWallet(null);
  }, [user]);
  const authForm = useAuthForm({
    mode: authMode,
    onAuthenticated: (result) => {
      setUser(result.user);
      setAuthOpen(false);
      setNotice(`Bem-vindo, ${result.user.name}!`);
    },
    onError: setError
  });
  const createLotForm = useCreateLotForm({
    pokemon: selectedPokemon,
    onCreated: () => {
      setCreateOpen(false);
      setNotice("Lote criado com imagem armazenada localmente.");
      void loadLots();
    },
    onError: setError
  });

  const bidForm = useBidForm({
    lot: selected,
    onBidPlaced: async (lot) => {
      setNotice("Lance registado e saldo comprometido.");
      await Promise.all([loadLots(), loadWallet()]);
      setSelected(await request<Lot>(`/lots/${lot.id}`));
    },
    onError: setError
  });

  const depositForm = useDepositForm({
    onDeposited: async () => {
      setNotice("Saldo adicionado à carteira.");
      await loadWallet();
    },
    onError: setError
  });

  const walletDepositForm = useDepositForm({
    onDeposited: async () => {
      setNotice("Saldo adicionado à carteira.");
      await loadWallet();
    },
    onError: setError
  });

  useEffect(() => {
    localStorage.removeItem("auction-token");
    void request<{ user: User | null }>("/auth/session")
      .then(({ user: sessionUser }) => setUser(sessionUser))
      .catch((reason: unknown) => {
        if (reason instanceof ApiError && reason.status === 401) {
          setUser(null);
          void request("/auth/logout", { method: "POST" }).catch((logoutError: unknown) => {
            setError(logoutError instanceof Error ? logoutError.message : "Não foi possível encerrar a sessão.");
          });
          return;
        }
        setError(reason instanceof Error ? reason.message : "Não foi possível validar a sessão.");
      });
  }, []);

  useEffect(() => { void loadLots(); }, [loadLots]);

  useEffect(() => {
    const socket = io(API, { withCredentials: true });
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
  }, [selected, loadLots]);

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
  const hasOpenModal = Boolean(
    authOpen
    || createOpen
    || selected
    || walletOpen
    || reportOpen
    || sellerAuditOpen
    || bidderReportOpen
    || acquiredCardsOpen
    || auctionedCardsOpen
    || selectedWinner
  );
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
  async function closeSession() {
    try {
      await request("/auth/logout", { method: "POST" });
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setUser(null);
      setWallet(null);
    }
  }
  const beginAuth = () => { setError(""); setAuthOpen(true); };
  const closeAllModals = () => {
    setAuthOpen(false);
    setCreateOpen(false);
    setSelected(null);
    setAudit(null);
    setWalletOpen(false);
    setReportOpen(false);
    setSellerAuditOpen(false);
    setBidderReportOpen(false);
    setAcquiredCardsOpen(false);
    setAuctionedCardsOpen(false);
    setSelectedWinner(null);
  };
  const handleModalBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) closeAllModals();
  };

  async function showAudit(lot: Lot) {
    setSelected(lot); setAudit(null); setError("");
    try { setAudit(await request<Audit>(`/lots/${lot.id}/audit`)); }
    catch (reason) { setError((reason as Error).message); }
  }

  async function cancelLot(lot: Lot) {
    setBusy(true);
    try {
      const result = await request<{ refundedAmount: number; imageCleanupWarning?: string }>(`/lots/${lot.id}`, { method: "DELETE" });
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
    try { setSellerAudit(await request<SellerAuditEntry[]>("/seller/audit")); }
    catch (reason) { setSellerAuditOpen(false); setError((reason as Error).message); }
    finally { setSellerAuditLoading(false); }
  }

  async function showReport() {
    setProfileMenuOpen(false);
    setError(""); setReport(null); setReportOpen(true);
    try { setReport(await request<SellerReport>("/seller/reports")); }
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
    try { setAuctionedCards(await request<SellerAuctionedLot[]>("/seller/auctioned-lots")); }
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
    try { setBidderReport(await request<BidderReport>("/bidder/report")); }
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
    try { setBidderReport(await request<BidderReport>("/bidder/report")); }
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
          createLotForm.reset({ startingBid: undefined, increment: 1, duration: 60 });
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

      {hasOpenModal && (
        <div className="modal-backdrop" onMouseDown={handleModalBackdropMouseDown}>
          {authOpen && (
            <AuthModal
              mode={authMode}
              form={authForm}
              onClose={() => {
                setAuthOpen(false);
                authForm.reset({ name: "", email: "", password: "", role: "BIDDER" });
              }}
              onToggleMode={() => setAuthMode((mode) => mode === "login" ? "register" : "login")}
            />
          )}

          {createOpen && (
            <CreateLotModal
              form={createLotForm}
              selectedPokemon={selectedPokemon}
              searchPokemon={searchPokemon}
              loadPokemon={loadPokemon}
              onClose={() => setCreateOpen(false)}
              onPokemonSelectionChange={setSelectedPokemon}
            />
          )}

          <SellerModals
            formatCurrency={money}
            walletModal={{
              open: walletOpen,
              wallet,
              form: walletDepositForm,
              onClose: () => setWalletOpen(false),
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
              bidForm={bidForm}
              depositForm={depositForm}
              cancelling={busy}
              formatCurrency={money}
              onClose={() => {
                setSelected(null);
                setAudit(null);
              }}
              onBackToLot={() => setAudit(null)}
              onShowAudit={(lot) => void showAudit(lot)}
              onBeginAuth={() => {
                setSelected(null);
                beginAuth();
              }}
              onCancelLot={setLotPendingCancellation}
            />
          )}
        </div>
      )}
      {lotPendingCancellation && (
        <ConfirmationModal
          kicker="CANCELAMENTO DE LOTE"
          title={`Cancelar ${lotPendingCancellation.title}?`}
          description={lotPendingCancellation.currentBid
            ? "O lote será removido da vitrine. O valor do lance atual será estornado à carteira do licitante e o histórico será mantido."
            : "O lote será removido da vitrine. Esta ação não pode ser desfeita."}
          icon={<AlertTriangle size={22} />}
          cancelLabel="Manter lote"
          confirmLabel="Confirmar cancelamento"
          pendingLabel="A cancelar..."
          isPending={busy}
          onCancel={() => setLotPendingCancellation(null)}
          onConfirm={() => void cancelLot(lotPendingCancellation)}
        />
      )}
      {(notice || error) && (
        <ToastNotification
          message={error || notice}
          variant={error ? "error" : "success"}
          onDismiss={() => {
            setError("");
            setNotice("");
          }}
        />
      )}
    </div>
  );
}
