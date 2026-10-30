import { Gavel } from "lucide-react";
import type { BrandLockupProps } from "./BrandLockup.types";

export function BrandLockup({
  href,
  showTagline = false,
  iconSize = 19,
  className
}: BrandLockupProps) {
  const brandClasses = ["brand", className].filter(Boolean).join(" ");

  return (
    <a className={brandClasses} href={href} aria-label="PokéLance">
      <span className="brand-mark"><Gavel size={iconSize} /></span>
      <span>
        poké<span className="brand-light">lance</span>
        {showTagline && <small>LEILÕES EM TEMPO REAL</small>}
      </span>
    </a>
  );
}
