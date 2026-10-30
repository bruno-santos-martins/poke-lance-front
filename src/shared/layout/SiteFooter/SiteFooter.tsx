import { ShieldCheck } from "lucide-react";
import { BrandLockup } from "../BrandLockup";
import type { SiteFooterProps } from "./SiteFooter.types";

export function SiteFooter({
  brandHref,
  copyrightMessage,
  integrityLabel
}: SiteFooterProps) {
  return (
    <footer className="footer">
      <BrandLockup href={brandHref} iconSize={18} />
      <span>{copyrightMessage}</span>
      <span className="footer-secure"><ShieldCheck size={14} /> {integrityLabel}</span>
    </footer>
  );
}
