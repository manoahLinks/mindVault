import { createContext, useState, useCallback, type ReactNode } from "react";
import { api } from "../api/client";

interface AuthState {
  apiKey: string | null;
  publisherName: string | null;
  publisherWallet: string | null;
  isPublisher: boolean;
  loading: boolean;
  setAuth: (apiKey: string, name: string, wallet: string) => void;
  clearAuth: () => void;
  checkWallet: (walletAddress: string) => Promise<void>;
}

export const AuthContext = createContext<AuthState>({
  apiKey: null,
  publisherName: null,
  publisherWallet: null,
  isPublisher: false,
  loading: false,
  setAuth: () => {},
  clearAuth: () => {},
  checkWallet: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState<string | null>(
    () => localStorage.getItem("mv_api_key")
  );
  const [publisherName, setPublisherName] = useState<string | null>(
    () => localStorage.getItem("mv_publisher_name")
  );
  const [publisherWallet, setPublisherWallet] = useState<string | null>(
    () => localStorage.getItem("mv_publisher_wallet")
  );
  const [loading, setLoading] = useState(false);

  const setAuth = useCallback((key: string, name: string, wallet: string) => {
    localStorage.setItem("mv_api_key", key);
    localStorage.setItem("mv_publisher_name", name);
    localStorage.setItem("mv_publisher_wallet", wallet);
    setApiKey(key);
    setPublisherName(name);
    setPublisherWallet(wallet);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem("mv_api_key");
    localStorage.removeItem("mv_publisher_name");
    localStorage.removeItem("mv_publisher_wallet");
    setApiKey(null);
    setPublisherName(null);
    setPublisherWallet(null);
  }, []);

  // Check if a wallet address has a publisher account
  const checkWallet = useCallback(async (walletAddress: string) => {
    // If we already have auth for this wallet, skip
    if (apiKey && publisherWallet === walletAddress) return;

    setLoading(true);
    try {
      const data = await api<{ id: string; name: string; walletAddress: string }>(
        `/publishers/wallet/${walletAddress}`
      );
      // Publisher exists — but we need the API key to be stored from registration
      // Just store the name and wallet so the UI knows they're a publisher
      if (!apiKey) {
        // They registered before but don't have the API key in this browser
        // Store what we can — they'll need to use the key they got at registration
        localStorage.setItem("mv_publisher_name", data.name);
        localStorage.setItem("mv_publisher_wallet", data.walletAddress);
        setPublisherName(data.name);
        setPublisherWallet(data.walletAddress);
      }
    } catch {
      // No publisher found for this wallet — that's fine, not registered yet
    } finally {
      setLoading(false);
    }
  }, [apiKey, publisherWallet]);

  return (
    <AuthContext.Provider
      value={{
        apiKey,
        publisherName,
        publisherWallet,
        isPublisher: !!publisherName,
        loading,
        setAuth,
        clearAuth,
        checkWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
