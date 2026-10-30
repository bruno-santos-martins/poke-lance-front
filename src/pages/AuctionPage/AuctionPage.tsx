import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { AlertTriangle, ArrowDownToLine, ArrowRight, ChevronLeft, ChevronRight, Gavel, Mail, PackageCheck, Search, ShieldCheck, UserRound, X } from "lucide-react";
import { API_BASE_URL as API } from "../../shared/api/request";
import { Badge, Countdown, ModalClose, type BadgeTone, PokemonTypeBadge } from "../../shared/components";
import { SiteFooter } from "../../shared/layout";
import { convertReaisToCentavos, formatCurrencyBRL, formatDate, formatDateTime, formatPokemonId } from "../../shared/utils";
import "./AuctionPage.css";
import { AuctionHeader } from "./components/AuctionHeader";
import { AuctionHero } from "./components/AuctionHero";
import { AuctionListings } from "./components/AuctionListings";
import { TrustStrip } from "./components/TrustStrip";

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

const money = formatCurrencyBRL;
const pokemonStatLabels: Record<string, string> = {
  hp: "PV",
  attack: "Ataque",
  defense: "Defesa",
  "special-attack": "Ataque especial",
  "special-defense": "Defesa especial",
  speed: "Velocidade"
};
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
const auditActionLabel: Record<string, string> = {
  USER_REGISTERED: "Conta criada",
  USER_LOGGED_IN: "Sessão iniciada",
  LOT_CREATED: "Lote criado",
  BID_PLACED: "Lance registado",
  LOT_CANCELLED: "Lote cancelado",
  LOT_SETTLED: "Leilão liquidado"
};
function auditDescription(entry: SellerAuditEntry): string {
  const details = entry.details;
  if (entry.action === "LOT_CREATED" && typeof details.startingBid === "number") {
    return `Lance inicial: ${money(details.startingBid)}`;
  }
  if (entry.action === "BID_PLACED" && typeof details.amount === "number") {
    const released = typeof details.releasedAmount === "number" ? details.releasedAmount : 0;
    return `Lance de ${money(details.amount)}${released > 0 ? ` · ${money(released)} liberados do lance anterior` : ""}`;
  }
  if (entry.action === "LOT_CANCELLED" && typeof details.refundedAmount === "number") {
    return details.refundedAmount > 0
      ? `Lote cancelado · estorno de ${money(details.refundedAmount)}`
      : "Lote cancelado sem lance vigente";
  }
  if (entry.action === "LOT_SETTLED" && typeof details.amount === "number") {
    return details.amount > 0 ? `Arremate liquidado: ${money(details.amount)}` : "Lote encerrado sem lances";
  }
  return entry.lotTitle ?? "Evento registado";
}

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
  const [pokemonQuery, setPokemonQuery] = useState("");
  const [pokemonSuggestions, setPokemonSuggestions] = useState<PokemonSuggestion[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonPreview | null>(null);
  const [pokemonDetailsLoading, setPokemonDetailsLoading] = useState(false);
  const [pokemonDetailsError, setPokemonDetailsError] = useState("");
  const pokemonDetailsRequest = useRef<AbortController | null>(null);
  const [activePokemonSuggestion, setActivePokemonSuggestion] = useState(0);
  const [searchingPokemon, setSearchingPokemon] = useState(false);
  const [pokemonSearchCompleted, setPokemonSearchCompleted] = useState(false);
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

  async function selectPokemon(pokemon: PokemonSuggestion) {
    pokemonDetailsRequest.current?.abort();
    const controller = new AbortController();
    pokemonDetailsRequest.current = controller;
    setPokemonQuery(pokemon.name);
    setPokemonSuggestions([]);
    setPokemonSearchCompleted(false);
    setSelectedPokemon(null);
    setPokemonDetailsError("");
    setPokemonDetailsLoading(true);
    try {
      const details = await request<PokemonPreview>(`/pokemon/${pokemon.id}`, undefined, { signal: controller.signal });
      if (!controller.signal.aborted) setSelectedPokemon(details);
    } catch (reason) {
      if (!controller.signal.aborted) setPokemonDetailsError((reason as Error).message);
    } finally {
      if (!controller.signal.aborted) setPokemonDetailsLoading(false);
    }
  }

  useEffect(() => { void loadLots(); }, [loadLots]);
  useEffect(() => {
    const query = pokemonQuery.trim();
    if (!createOpen || pokemonDetailsLoading || selectedPokemon?.name === query.toLowerCase() || query.length < 2 && !/^\d+$/.test(query)) {
      setPokemonSuggestions([]);
      setSearchingPokemon(false);
      return;
    }

    setPokemonSuggestions([]);
    setPokemonSearchCompleted(false);
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setSearchingPokemon(true);
      setPokemonSearchCompleted(false);
      void request<PokemonSuggestion[]>(`/pokemon/search?q=${encodeURIComponent(query)}`, undefined, { signal: controller.signal })
        .then((results) => {
          setPokemonSuggestions(results);
          setActivePokemonSuggestion(0);
          setPokemonSearchCompleted(true);
        })
        .catch((reason: Error) => {
          if (!controller.signal.aborted) setError(reason.message);
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearchingPokemon(false);
        });
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [createOpen, pokemonQuery, selectedPokemon, pokemonDetailsLoading]);
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
          setPokemonQuery("");
          setPokemonSuggestions([]);
          setSelectedPokemon(null);
          setPokemonDetailsError("");
          pokemonDetailsRequest.current?.abort();
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
        {authOpen && <div className="modal auth-modal"><ModalClose onClose={() => setAuthOpen(false)} /><div className="modal-kicker">BEM-VINDO À POKÉLANCE</div><h2>{authMode === "login" ? "Entra na disputa." : "Cria a tua conta."}</h2><p>Acompanha os lotes, faz lances e começa a tua coleção.</p><form onSubmit={submitAuth} className="form-stack">
          {authMode === "register" && <><label>Nome completo<input name="name" required minLength={2} placeholder="Como te chamamos?" /></label><label>Perfil<select name="role"><option value="BIDDER">Licitante</option><option value="AUCTIONEER">Leiloeiro</option></select></label></>}
          <label>E-mail<input name="email" type="email" required placeholder="tu@email.com" /></label><label>Senha<input name="password" type="password" required minLength={8} placeholder="Mínimo de 8 caracteres" /></label><button className="button button-primary full-button" disabled={busy}>{busy ? "Aguarda..." : authMode === "login" ? "Entrar" : "Criar conta"} <ArrowRight size={16} /></button></form>
          <div className="modal-switch">{authMode === "login" ? "Ainda não tens conta?" : "Já tens uma conta?"} <button onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}>{authMode === "login" ? "Regista-te" : "Entrar"}</button></div></div>}

        {createOpen && <div className="modal"><ModalClose onClose={() => setCreateOpen(false)} /><div className="modal-kicker">NOVO LEILÃO</div><h2>Coloca uma carta na vitrine.</h2><p>A imagem oficial será descarregada e guardada no servidor no momento da criação.</p><form className="form-stack" onSubmit={createLot}>
          <label>Pokémon por nome ou ID
            <div className="pokemon-search">
              <input
                name="pokemon"
                required
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={pokemonSuggestions.length > 0}
                aria-controls="pokemon-suggestions"
                autoComplete="off"
                placeholder="ex.: pikachu ou 25"
                value={pokemonQuery}
                onChange={(event) => {
                  pokemonDetailsRequest.current?.abort();
                  setPokemonQuery(event.target.value);
                  setSelectedPokemon(null);
                  setPokemonDetailsLoading(false);
                  setPokemonDetailsError("");
                  setPokemonSearchCompleted(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown" && pokemonSuggestions.length) {
                    event.preventDefault();
                    setActivePokemonSuggestion((index) => (index + 1) % pokemonSuggestions.length);
                  } else if (event.key === "ArrowUp" && pokemonSuggestions.length) {
                    event.preventDefault();
                    setActivePokemonSuggestion((index) => (index - 1 + pokemonSuggestions.length) % pokemonSuggestions.length);
                  } else if (event.key === "Enter" && pokemonSuggestions[activePokemonSuggestion]) {
                    event.preventDefault();
                    void selectPokemon(pokemonSuggestions[activePokemonSuggestion]);
                  } else if (event.key === "Escape") {
                    setPokemonSuggestions([]);
                  }
                }}
              />
              {searchingPokemon && <span className="pokemon-search-status">A pesquisar...</span>}
              {pokemonSuggestions.length > 0 && <div className="pokemon-suggestions" id="pokemon-suggestions" role="listbox">
                {pokemonSuggestions.map((pokemon, index) => <button
                  type="button"
                  role="option"
                  aria-selected={index === activePokemonSuggestion}
                  className={index === activePokemonSuggestion ? "active" : ""}
                  key={pokemon.id}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActivePokemonSuggestion(index)}
                  onClick={() => void selectPokemon(pokemon)}
                >
                  <span className="pokemon-suggestion-id">#{formatPokemonId(pokemon.id)}</span>
                  <span className="pokemon-suggestion-name">{pokemon.name}</span>
                  <ArrowRight size={14} />
                </button>)}
              </div>}
              {pokemonSearchCompleted && !searchingPokemon && pokemonSuggestions.length === 0 && <div className="pokemon-suggestions pokemon-no-results">Nenhum Pokémon encontrado.</div>}
            </div>
            {pokemonDetailsLoading && <span className="pokemon-hint">A carregar imagem e informações do Pokémon...</span>}
            {pokemonDetailsError && <span className="pokemon-details-error">{pokemonDetailsError}</span>}
            {selectedPokemon ? <>
              <span className="pokemon-selected">Pokémon selecionado: #{formatPokemonId(selectedPokemon.id)} · {selectedPokemon.name}</span>
              <section className="pokemon-preview" aria-label={`Pré-visualização de ${selectedPokemon.name}`}>
                <div className="pokemon-preview-art">
                  <img src={selectedPokemon.imageUrl} alt={`Imagem de ${selectedPokemon.name}`} />
                </div>
                <div className="pokemon-preview-details">
                  <span className="pokemon-preview-number">POKÉMON Nº {formatPokemonId(selectedPokemon.id)}</span>
                  <h3>{selectedPokemon.name}</h3>
                  <div className="pokemon-preview-types">{selectedPokemon.types.map((type) =>
                    <PokemonTypeBadge type={type} key={type} />
                  )}</div>
                  <div className="pokemon-preview-measures">
                    <span><small>ALTURA</small><b>{(selectedPokemon.height / 10).toLocaleString("pt-BR")} m</b></span>
                    <span><small>PESO</small><b>{(selectedPokemon.weight / 10).toLocaleString("pt-BR")} kg</b></span>
                  </div>
                  <div className="pokemon-preview-stats">
                    {Object.entries(selectedPokemon.stats).map(([name, value]) => <span key={name}>
                      <small>{pokemonStatLabels[name] ?? name.replaceAll("-", " ")}</small><b>{value}</b>
                    </span>)}
                  </div>
                </div>
              </section>
            </> : !pokemonDetailsLoading && !pokemonDetailsError && <span className="pokemon-hint">Digite pelo menos 2 letras ou um ID para pesquisar.</span>}
          </label>
          <div className="form-row"><label>Lance inicial (R$)<input name="startingBid" type="number" min="1" step="0.01" required placeholder="10.00" /></label><label>Incremento (R$)<input name="increment" type="number" min="1" step="0.01" defaultValue="1.00" required /></label></div><label>Duração do leilão<select name="duration"><option value="60">1 hora</option><option value="360">6 horas</option><option value="1440">24 horas</option><option value="10080">7 dias</option></select></label><button className="button button-primary full-button" disabled={busy || !selectedPokemon}>{busy ? "A guardar..." : "Criar lote"} <ArrowRight size={16} /></button></form></div>}

        {walletOpen && <div className="modal"><ModalClose onClose={() => setWalletOpen(false)} /><div className="modal-kicker">CARTEIRA SIMULADA</div><h2>O teu saldo.</h2><div className="wallet-summary"><div><small>DISPONÍVEL</small><b>{money(wallet?.available ?? 0)}</b></div><div><small>COMPROMETIDO</small><b>{money(wallet?.committed ?? 0)}</b></div><div><small>SALDO TOTAL</small><b>{money(wallet?.balance ?? 0)}</b></div></div><form className="deposit-form wallet-deposit" onSubmit={addFunds}><label>Adicionar saldo simulado<input value={deposit} onChange={(event) => setDeposit(event.target.value)} type="number" min="1" step="0.01" placeholder="Valor em R$" required /></label><button className="button button-primary" disabled={busy}>Depositar</button></form><p>Os depósitos são simulados e atualizam a carteira imediatamente.</p></div>}

        {reportOpen && <div className="modal"><ModalClose onClose={() => setReportOpen(false)} /><div className="modal-kicker">RELATÓRIO FINANCEIRO</div><h2>Resumo dos arremates.</h2>{!report ? <p>A carregar relatório...</p> : <><div className="report-total"><small>TOTAL RECEBIDO</small><b>{money(report.totalReceived)}</b></div><div className="report-list">{report.lots.length ? report.lots.map((item) => <div key={item.id}><span><b>{item.title}</b><small>{formatDate(item.settledAt, "Sem data")} · {item.winner ?? "Sem vencedor"}</small></span><strong>{money(item.amount)}</strong></div>) : <p>Ainda não existem lotes liquidados.</p>}</div></>}</div>}

        {sellerAuditOpen && <div className="modal seller-audit-modal">
          <ModalClose onClose={() => setSellerAuditOpen(false)} />
          <div className="modal-kicker">REGISTRO DE ATIVIDADES</div>
          <h2>Auditoria dos teus lotes</h2>
          <p>Criações, lances, cancelamentos e liquidações, com responsável e data.</p>
          <div className="seller-audit-filters">
            <label className="seller-audit-search"><Search size={16} /><input value={sellerAuditPokemonFilter} onChange={(event) => { setSellerAuditPokemonFilter(event.target.value); setSellerAuditPage(1); }} placeholder="Filtrar por Pokémon..." aria-label="Filtrar auditoria por Pokémon" /></label>
            <label>De<input type="date" value={sellerAuditFromDate} onChange={(event) => { setSellerAuditFromDate(event.target.value); setSellerAuditPage(1); }} aria-label="Data inicial da auditoria" /></label>
            <label>Até<input type="date" value={sellerAuditToDate} onChange={(event) => { setSellerAuditToDate(event.target.value); setSellerAuditPage(1); }} aria-label="Data final da auditoria" /></label>
          </div>
          {sellerAuditLoading ? <p>A carregar a auditoria...</p> : filteredSellerAudit.length ? <>
            <div className="seller-audit-count">{filteredSellerAudit.length} {filteredSellerAudit.length === 1 ? "evento encontrado" : "eventos encontrados"}</div>
            <div className="seller-audit-list">
            {visibleSellerAudit.map((entry) => <article className="seller-audit-entry" key={entry.id}>
              <div className="seller-audit-entry-heading">
                <b>{auditActionLabel[entry.action] ?? entry.action}</b>
                <time dateTime={entry.createdAt}>{formatDateTime(entry.createdAt)}</time>
              </div>
              <span>{entry.lotTitle ?? (entry.entityType === "USER" ? "Conta" : "Carteira")} · {entry.actorName} ({entry.actorRole === "SYSTEM" ? "Sistema" : entry.actorRole === "AUCTIONEER" ? "Leiloeiro" : "Licitante"})</span>
              <small>{auditDescription(entry)}</small>
            </article>)}
            </div>
            {sellerAuditPageCount > 1 && <div className="auctioned-pagination seller-audit-pagination">
              <button type="button" className="button button-outline button-small" disabled={sellerAuditPage <= 1} onClick={() => setSellerAuditPage((page) => page - 1)}><ChevronLeft size={15} /> Anterior</button>
              <span>Página {sellerAuditPage} de {sellerAuditPageCount}</span>
              <button type="button" className="button button-outline button-small" disabled={sellerAuditPage >= sellerAuditPageCount} onClick={() => setSellerAuditPage((page) => page + 1)}>Próxima <ChevronRight size={15} /></button>
            </div>}
          </> : <p className="report-empty">{sellerAudit.length ? "Nenhum evento corresponde aos filtros." : "Ainda não há eventos para os teus lotes."}</p>}
        </div>}

        {auctionedCardsOpen && <div className="modal auctioned-cards-modal">
          <ModalClose onClose={() => setAuctionedCardsOpen(false)} />
          <div className="modal-kicker">LOTE ENCERRADO E LIQUIDADO</div>
          <h2>Cartas leiloadas</h2>
          <p>Consulte os lotes arrematados e abra o histórico completo de lances.</p>
          <label className="auctioned-search"><Search size={16} /><input value={auctionedCardsSearch} onChange={(event) => setAuctionedCardsSearch(event.target.value)} placeholder="Buscar por nome ou número..." /></label>
          {auctionedCardsLoading ? <p className="report-empty">A carregar as cartas leiloadas...</p> : <>
            <div className="auctioned-cards-count">{filteredAuctionedCards.length} {filteredAuctionedCards.length === 1 ? "carta encontrada" : "cartas encontradas"}</div>
            {visibleAuctionedCards.length ? <div className="auctioned-cards-grid">
              {visibleAuctionedCards.map((card) => <article className="auctioned-card" key={card.id}>
                <img src={`${API}${card.imagePath}`} alt="" />
                <span className="auctioned-card-info"><b>{card.title}</b><small>Nº {formatPokemonId(card.pokemonId)} · {card.bidCount} {card.bidCount === 1 ? "lance" : "lances"}</small><small>{formatDate(card.settledAt, "Data indisponível")}</small></span>
                <strong>{money(card.amount)}</strong>
                <div className="auctioned-card-actions">
                  <button type="button" className="auctioned-card-action" onClick={() => void showAuctionedLotHistory(card)}>Ver histórico <ArrowRight size={14} /></button>
                  <button type="button" className="auctioned-card-action" disabled={!card.winner} onClick={() => { setSelectedWinner(card.winner); }}><UserRound size={14} /> Ver ganhador</button>
                </div>
              </article>)}
            </div> : <div className="acquired-cards-empty"><PackageCheck size={24} /><b>{auctionedCards.length ? "Nenhuma carta encontrada" : "Ainda não há cartas leiloadas"}</b><span>{auctionedCards.length ? "Tente buscar por outro nome ou número." : "Os lotes vendidos aparecerão aqui após a liquidação."}</span></div>}
            {auctionedCardsPageCount > 1 && <div className="auctioned-pagination">
              <button className="button button-outline button-small" disabled={auctionedCardsPage <= 1} onClick={() => setAuctionedCardsPage((page) => page - 1)}><ChevronLeft size={15} /> Anterior</button>
              <span>Página {auctionedCardsPage} de {auctionedCardsPageCount}</span>
              <button className="button button-outline button-small" disabled={auctionedCardsPage >= auctionedCardsPageCount} onClick={() => setAuctionedCardsPage((page) => page + 1)}>Próxima <ChevronRight size={15} /></button>
            </div>}
          </>}
        </div>}

        {selectedWinner && <div className="modal winner-contact-modal">
          <ModalClose onClose={() => setSelectedWinner(null)} />
          <div className="modal-kicker">DADOS DO GANHADOR</div>
          <h2>Entre em contato</h2>
          <p>Este licitante venceu o lote. Use o e-mail abaixo para combinar os próximos passos.</p>
          <div className="winner-contact-details">
            <UserRound size={20} />
            <div><small>Nome</small><b>{selectedWinner.name}</b></div>
          </div>
          <div className="winner-contact-details">
            <Mail size={20} />
            <div><small>E-mail</small><b>{selectedWinner.email}</b></div>
          </div>
          <a className="button button-primary winner-contact-email" href={`mailto:${selectedWinner.email}`}>
            <Mail size={16} /> Enviar e-mail
          </a>
        </div>}

        {bidderReportOpen && <div className="modal bidder-report-modal">
          <ModalClose onClose={() => setBidderReportOpen(false)} />
          <div className="modal-kicker">ÁREA DO LICITANTE</div>
          <h2>O teu relatório</h2>
          <p>Consulte os seus lances e todas as movimentações da carteira.</p>
          {bidderReportLoading ? <p>A carregar o relatório...</p> : bidderReportError ? <div className="report-load-error"><p>{bidderReportError}</p><button className="button button-outline button-small" onClick={() => void showBidderReport()}>Tentar novamente</button></div> : bidderReport && <>
            <div className="wallet-summary bidder-report-summary">
              <div><small>SALDO TOTAL</small><b>{money(bidderReport.wallet.balance)}</b></div>
              <div><small>COMPROMETIDO</small><b>{money(bidderReport.wallet.committed)}</b></div>
              <div><small>DISPONÍVEL</small><b>{money(bidderReport.wallet.available)}</b></div>
            </div>
            <section className="bidder-report-section">
              <div className="report-section-heading"><h3>Histórico de lances</h3><span>{bidderReport.bids.length} {bidderReport.bids.length === 1 ? "lance" : "lances"}</span></div>
              {bidderReport.bids.length ? <div className="bidder-report-list">{bidderReport.bids.map((bid) => <div className="bidder-report-row" key={bid.id}>
                <div className="report-entry-main"><b>{bid.lotTitle}</b><small>{formatDateTime(bid.createdAt)}</small></div>
                <strong>{money(bid.amount)}</strong>
                <Badge size="compact" tone={bidStatusTone[bid.status]}>{bidStatusLabel[bid.status]}</Badge>
              </div>)}</div> : <p className="report-empty">Ainda não fizeste nenhum lance.</p>}
            </section>
            <section className="bidder-report-section">
              <div className="report-section-heading"><h3>Extrato da carteira</h3><span>{bidderReport.transactions.length} {bidderReport.transactions.length === 1 ? "movimentação" : "movimentações"}</span></div>
              {bidderReport.transactions.length ? <div className="bidder-report-list">{bidderReport.transactions.map((transaction) => <div className="bidder-report-row transaction-row" key={transaction.id}>
                <div className="report-entry-main"><b>{transaction.description}</b><small>{formatDateTime(transaction.createdAt)}</small></div>
                <strong className={transactionDirection(transaction.type) === "positive" ? "transaction-positive" : transactionDirection(transaction.type) === "negative" ? "transaction-negative" : ""}>{transactionDirection(transaction.type) === "positive" ? "+" : transactionDirection(transaction.type) === "negative" ? "−" : ""}{money(transaction.amount)}</strong>
                <Badge size="compact">{transactionTypeLabel[transaction.type]}</Badge>
              </div>)}</div> : <p className="report-empty">Ainda não existem movimentações registadas.</p>}
            </section>
          </>}
        </div>}

        {acquiredCardsOpen && <div className="modal acquired-cards-modal">
          <ModalClose onClose={() => setAcquiredCardsOpen(false)} />
          <div className="modal-kicker">A TUA COLEÇÃO</div>
          <h2>Cartas adquiridas</h2>
          <p>Cartas que arremataste em leilões já liquidados.</p>
          {bidderReportLoading ? <p>A carregar as cartas...</p> : bidderReportError ? <div className="report-load-error"><p>{bidderReportError}</p><button className="button button-outline button-small" onClick={() => void showAcquiredCards()}>Tentar novamente</button></div> : bidderReport && bidderReport.acquiredCards.length ? <div className="acquired-cards-grid">
            {bidderReport.acquiredCards.map((card) => <article className="acquired-card" key={card.id}>
              <img src={`${API}${card.imagePath}`} alt={card.title} />
              <div className="acquired-card-info"><b>{card.title}</b><span>{money(card.amount)}</span><small>Arrematada em {formatDate(card.settledAt)}</small></div>
              <a className="button button-outline button-small" href={`/receipt/${card.id}`} target="_blank" rel="noreferrer">Comprovativo <ArrowRight size={14} /></a>
            </article>)}
          </div> : bidderReport && <div className="acquired-cards-empty"><PackageCheck size={24} /><b>A tua coleção ainda está vazia</b><span>Quando venceres um leilão, a carta aparecerá aqui.</span></div>}
        </div>}

        {selected && (
          <div className="modal lot-modal">
            <ModalClose onClose={() => { setSelected(null); setAudit(null); }} />
            {audit ? (
              <>
                <div className="modal-kicker">AUDITORIA PÚBLICA</div>
                <h2>Histórico do lote</h2>
                <div className={`audit-status ${audit.valid ? "valid" : "invalid"}`}><ShieldCheck size={19} /> {audit.valid ? "Cadeia íntegra — histórico verificado" : "ATENÇÃO — adulteração detetada"}</div>
                <div className="audit-list">{audit.bids.length ? audit.bids.map((entry) => <div className="audit-item" key={entry.sequence}><div><b>#{entry.sequence} · {entry.bidder}</b><small>{formatDateTime(entry.timestamp)}</small></div><strong>{money(entry.amount)}</strong><code>{entry.hash}</code></div>) : <p>Ainda não existem lances para validar.</p>}</div>
                <button className="button button-outline full-button" onClick={() => setAudit(null)}>Voltar ao lote</button>
              </>
            ) : (
              <div className="lot-detail">
                <div className="detail-art"><span>Nº {formatPokemonId(selected.pokemonId)}</span><img src={`${API}${selected.imagePath}`} alt={selected.title} /></div>
                <div className="detail-copy">
                  <div className="modal-kicker">LOTE DE COLECIONADOR</div>
                  <h2>{selected.title}</h2>
                  <div className="type-tags">{selected.types.map((type) => <PokemonTypeBadge type={type} key={type} />)}</div>
                  <p className="detail-meta">ALTURA {selected.height / 10} M <span>·</span> PESO {selected.weight / 10} KG</p>
                  <div className="stats-grid">{Object.entries(selected.stats ?? {}).map(([name, value]) => <div key={name}><span>{name.replace("-", " ")}</span><b>{value}</b></div>)}</div>
                  <div className="detail-price"><small>LANCE ATUAL</small><b>{money(selected.currentBid ?? selected.startingBid)}</b></div>
                  <Countdown endsAt={selected.endsAt} />
                  {selected.status === "OPEN" && user?.role === "BIDDER" && <form className="bid-form" onSubmit={makeBid}><label>O teu lance (R$)<input type="number" min="0.01" step="0.01" required value={bidValue} onChange={(event) => setBidValue(event.target.value)} placeholder={`mín. ${((selected.currentBid ?? selected.startingBid) + (selected.currentBid === null ? 0 : selected.minimumIncrement)) / 100}`} /></label><button className="button button-primary full-button" disabled={busy}>{busy ? "A enviar..." : "Fazer lance"} <Gavel size={16} /></button><small>Disponível: {money(wallet?.available ?? 0)} · Incremento mínimo: {money(selected.minimumIncrement)}</small></form>}
                  {selected.status === "OPEN" && !user && <button className="button button-primary full-button" onClick={() => { setSelected(null); beginAuth(); }}>Entra para fazer um lance <ArrowRight size={16} /></button>}
                  {selected.status === "OPEN" && user?.role === "AUCTIONEER" && selected.sellerId === user.id && <button type="button" className="button button-outline full-button" disabled={busy} onClick={() => setLotPendingCancellation(selected)}>{selected.currentBid ? "Cancelar lote e estornar lance" : "Cancelar lote"}</button>}
                  {user?.role === "BIDDER" && <form className="deposit-form" onSubmit={addFunds}><label>Adicionar saldo simulado<input value={deposit} onChange={(event) => setDeposit(event.target.value)} type="number" min="1" step="0.01" placeholder="Valor em R$" required /></label><button className="icon-button" aria-label="Adicionar saldo"><ArrowDownToLine size={17} /></button></form>}
                  <div className="detail-actions"><button onClick={() => void showAudit(selected)}><ShieldCheck size={16} /> Ver auditoria da cadeia</button>{selected.status === "CLOSED" && <a href={`/receipt/${selected.id}`} target="_blank" rel="noreferrer">Comprovativo <ArrowRight size={14} /></a>}</div>
                </div>
              </div>
            )}
          </div>
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
