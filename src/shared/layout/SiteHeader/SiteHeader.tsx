import { NavLink } from "react-router-dom";
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
        {navigationItems.map(({ label, href }) => (
          <NavLink
            key={href}
            to={href}
            className={({ isActive }) => isActive ? "active" : undefined}
            end={href === "/"}
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <div className={actionClasses}>{actions}</div>
    </header>
  );
}
