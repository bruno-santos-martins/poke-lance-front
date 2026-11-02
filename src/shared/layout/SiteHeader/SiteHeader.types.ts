import type { ReactNode } from "react";

export type SiteNavigationItem = {
  label: string;
  href: string;
};

export type SiteHeaderProps = {
  brandHref: string;
  navigationItems: SiteNavigationItem[];
  actions: ReactNode;
  actionsClassName?: string;
};
