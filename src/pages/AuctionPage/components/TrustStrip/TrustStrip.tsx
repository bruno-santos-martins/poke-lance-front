import { BadgeCheck, Clock3, Heart, ShieldCheck } from "lucide-react";

export function TrustStrip() {
  return (
    <section className="trust-strip" id="como-funciona">
      <span><BadgeCheck size={18} /> Lances protegidos</span><i />
      <span><ShieldCheck size={18} /> Auditoria pública</span><i />
      <span><Clock3 size={18} /> Prorrogação anti-sniping</span><i />
      <span><Heart size={18} /> Colecionismo de verdade</span>
    </section>
  );
}
