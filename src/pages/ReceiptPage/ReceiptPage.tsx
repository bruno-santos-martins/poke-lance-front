import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, BadgeCheck, ShieldCheck, X } from "lucide-react";
import { API_BASE_URL as API, request } from "../../shared/api/request";
import { ThemeToggle } from "../../shared/components";
import { BrandLockup } from "../../shared/layout";
import { formatCurrencyBRL, formatDateTime } from "../../shared/utils";
import "./ReceiptPage.css";

type Receipt = {
  title: string;
  imagePath: string;
  amount: number;
  winner: string | null;
  isCurrentUserWinner: boolean;
  settledAt: string;
  receiptUrl: string;
};

async function loadReceipt(receiptId: string): Promise<Receipt> {
  return request<Receipt>(`/receipts/${receiptId}`);
}

export default function ReceiptPage() {
  const { id = "" } = useParams<{ id: string }>();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    void loadReceipt(id)
      .then(setReceipt)
      .catch((reason: Error) => setError(reason.message));
  }, [id]);

  return (
    <main className="receipt-page">
      <div className="receipt-theme-toggle"><ThemeToggle /></div>
      <BrandLockup href="/" className="receipt-brand" />
      <section className="receipt-card">
        {error ? (
          <>
            <div className="receipt-icon"><X /></div>
            <h1>Comprovativo indisponível</h1>
            <p>{error}</p>
          </>
        ) : !receipt ? (
          <p>A carregar comprovativo...</p>
        ) : (
          <>
            <div className="receipt-icon"><BadgeCheck /></div>
            <div className="modal-kicker">ARREMATE CONFIRMADO</div>
            <h1>{receipt.title}</h1>
            <img className="receipt-image" src={`${API}${receipt.imagePath}`} alt={receipt.title} />
            <div className="receipt-amount">
              <small>VALOR LIQUIDADO</small>
              <b>{formatCurrencyBRL(receipt.amount)}</b>
            </div>
            {!receipt.isCurrentUserWinner && (
              <div className="receipt-line">
                <span>Arrematado por</span>
                <strong>{receipt.winner ?? "Sem vencedor"}</strong>
              </div>
            )}
            <div className="receipt-line">
              <span>Liquidado em</span>
              <strong>{formatDateTime(receipt.settledAt, "Data indisponível")}</strong>
            </div>
            <div className="receipt-privacy">
              <ShieldCheck size={16} /> Identidade do licitante protegida por pseudónimo.
            </div>
            <Link className="button button-outline full-button receipt-return" to="/">
              Voltar à vitrine <ArrowRight size={16} />
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
