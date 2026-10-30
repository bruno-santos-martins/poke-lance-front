import type { SiteHeaderProps } from "./SiteHeader.types";
import { BrandLockup } from "../BrandLockup";
import styles from "./SiteHeader.module.css";

export function SiteHeader({
  brandHref,
  navigationItems,
  actions,
  actionsClassName
}: SiteHeaderProps) {
  const actionClasses = [styles.actions, actionsClassName].filter(Boolean).join(" ");

  return (
    <header className="topbar">
      <BrandLockup href={brandHref} showTagline />
      <nav className="nav-links" aria-label="Navegação principal">
        {navigationItems.map(({ label, href, isActive = false }) => (
          <a
            key={href}
            className={isActive ? "active" : undefined}
            href={href}
            aria-current={isActive ? "page" : undefined}
          >
            {label}
          </a>
        ))}
      </nav>
      <div className={actionClasses}>{actions}</div>
    </header>
  );
}
