import { createContext, useState, type ReactNode } from "react";

interface AuthState {
  apiKey: string | null;
  publisherName: string | null;
  setAuth: (apiKey: string, name: string) => void;
  clearAuth: () => void;
}

export const AuthContext = createContext<AuthState>({
  apiKey: null,
  publisherName: null,
  setAuth: () => {},
  clearAuth: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState<string | null>(
    () => localStorage.getItem("mv_api_key")
  );
  const [publisherName, setPublisherName] = useState<string | null>(
    () => localStorage.getItem("mv_publisher_name")
  );

  const setAuth = (key: string, name: string) => {
    localStorage.setItem("mv_api_key", key);
    localStorage.setItem("mv_publisher_name", name);
    setApiKey(key);
    setPublisherName(name);
  };

  const clearAuth = () => {
    localStorage.removeItem("mv_api_key");
    localStorage.removeItem("mv_publisher_name");
    setApiKey(null);
    setPublisherName(null);
  };

  return (
    <AuthContext.Provider value={{ apiKey, publisherName, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
