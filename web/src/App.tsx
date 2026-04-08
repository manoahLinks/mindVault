import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./context/WalletContext";
import { AuthProvider } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Catalog } from "./pages/Catalog";
import { ResourceDetail } from "./pages/ResourceDetail";
import { Publish } from "./pages/Publish";
import { Dashboard } from "./pages/Dashboard";
import { Leaderboard } from "./pages/Leaderboard";
import { useAuth } from "./hooks/useAuth";

function WalletWithAuth({ children }: { children: React.ReactNode }) {
  const { checkWallet, clearAuth } = useAuth();

  return (
    <WalletProvider
      onConnect={(address) => checkWallet(address)}
      onDisconnect={() => clearAuth()}
    >
      {children}
    </WalletProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WalletWithAuth>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/resource/:id" element={<ResourceDetail />} />
              <Route path="/publish" element={<Publish />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </WalletWithAuth>
    </AuthProvider>
  );
}
