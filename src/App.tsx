import { Route, Routes } from "react-router-dom";
import AuctionPage from "./pages/AuctionPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import ReceiptPage from "./pages/ReceiptPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AuctionPage />} />
      <Route path="/como-funciona" element={<HowItWorksPage />} />
      <Route path="/receipt/:id" element={<ReceiptPage />} />
    </Routes>
  );
}
