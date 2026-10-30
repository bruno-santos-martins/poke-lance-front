import AuctionPage from "./pages/AuctionPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import ReceiptPage from "./pages/ReceiptPage";

export default function App() {
  const receiptId = window.location.pathname.match(/^\/receipt\/([0-9a-f-]{36})$/i)?.[1];
  if (receiptId) return <ReceiptPage id={receiptId} />;
  if (window.location.pathname === "/como-funciona") return <HowItWorksPage />;
  return <AuctionPage />;
}
