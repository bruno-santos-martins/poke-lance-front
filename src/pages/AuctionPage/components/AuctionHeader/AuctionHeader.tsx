import { ArrowRight, ClipboardList, FileText, LogOut, PackageCheck, Plus, WalletCards } from "lucide-react";
import { ThemeToggle } from "../../../../shared/components";
import { SiteHeader } from "../../../../shared/layout";
import type { User, Wallet } from "../../AuctionPage.types";

type AuctionHeaderProps = {
  user: User | null;
  wallet: Wallet | null;
  profileMenuOpen: boolean;
  formatCurrency: (amount: number) => string;
  onOpenWallet: () => void;
  onCreateLot: () => void;
  onToggleProfileMenu: () => void;
  onOpenAuctionedCards: () => void;
  onOpenReports: () => void;
  onOpenAudit: () => void;
  onOpenAcquiredCards: () => void;
  onLogout: () => void;
  onLogin: () => void;
};

export function AuctionHeader({
  user,
  wallet,
  profileMenuOpen,
  formatCurrency,
  onOpenWallet,
  onCreateLot,
  onToggleProfileMenu,
  onOpenAuctionedCards,
  onOpenReports,
  onOpenAudit,
  onOpenAcquiredCards,
  onLogout,
  onLogin
}: AuctionHeaderProps) {
  return (
    <SiteHeader
      brandHref="/"
      navigationItems={[
        { label: "Vitrine", href: "#vitrine", isActive: true },
        { label: "Como funciona", href: "/como-funciona" }
      ]}
      actionsClassName="header-actions"
      actions={
        <>
          <ThemeToggle />
          {user?.role === "BIDDER" && wallet && (
            <button className="wallet-pill" data-cy="wallet-pill" onClick={onOpenWallet}>
              <WalletCards size={16} />
              <span><b>{formatCurrency(wallet.available)}</b><small> disponível</small></span>
            </button>
          )}
          {user?.role === "AUCTIONEER" && wallet && (
            <div className="wallet-pill">
              <WalletCards size={16} />
              <span><b>{formatCurrency(wallet.balance)}</b><small> recebido</small></span>
            </div>
          )}
          {user?.role === "AUCTIONEER" && (
            <button className="button button-primary button-small" onClick={onCreateLot}>
              <Plus size={16} /> Criar lote
            </button>
          )}
          {user ? (
            <>
              <div className="profile-menu-wrap">
                <button
                    type="button"
                    className="user-avatar"
                  data-cy="user-avatar"
                  aria-label={`Abrir perfil de ${user.name}`}
                  aria-expanded={profileMenuOpen}
                  onClick={onToggleProfileMenu}
                >
                  {user.name.slice(0, 1).toUpperCase()}
                </button>
                {profileMenuOpen && (
                  <div className="profile-menu" role="menu">
                    <div className="profile-menu-name">{user.name}</div>
                    {user.role === "AUCTIONEER" && (
                      <button type="button" role="menuitem" onClick={onOpenAuctionedCards}>
                        <PackageCheck size={15} /> Cartas leiloadas
                      </button>
                    )}
                    {user.role === "AUCTIONEER" && (
                      <button type="button" role="menuitem" onClick={onOpenAudit}>
                        <ClipboardList size={15} /> Auditoria
                      </button>
                    )}
                    <button type="button" role="menuitem" onClick={onOpenReports}>
                      <FileText size={15} /> Relatórios
                    </button>
                    {user.role === "BIDDER" && (
                      <button type="button" role="menuitem" onClick={onOpenAcquiredCards}>
                        <PackageCheck size={15} /> Cartas adquiridas
                      </button>
                    )}
                  </div>
                )}
              </div>
              <button className="button button-outline button-small logout-button" data-cy="btn-logout" onClick={onLogout} title="Terminar sessão">
                <LogOut size={14} /> Sair
              </button>
            </>
          ) : (
            <button className="button button-outline button-small" data-cy="btn-login" onClick={onLogin}>
              Entrar <ArrowRight size={15} />
            </button>
          )}
        </>
      }
    />
  );
}
