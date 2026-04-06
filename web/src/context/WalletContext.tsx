import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import {
  StellarWalletsKit,
  Networks,
} from "@creit.tech/stellar-wallets-kit";
// @ts-ignore — subpath export
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils";
import { wrapFetchWithPayment } from "@x402/fetch";
import { x402Client } from "@x402/core/client";
import { ExactStellarScheme } from "@x402/stellar/exact/client";
import { createWalletKitSigner } from "../lib/walletAdapter";

interface WalletState {
  address: string | null;
  connected: boolean;
  connecting: boolean;
  paidFetch: typeof fetch | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const WalletContext = createContext<WalletState>({
  address: null,
  connected: false,
  connecting: false,
  paidFetch: null,
  connect: async () => {},
  disconnect: () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const initialized = useRef(false);
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [paidFetch, setPaidFetch] = useState<typeof fetch | null>(null);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      StellarWalletsKit.init({
        network: Networks.TESTNET,
        modules: defaultModules(),
      });
    }
  }, []);

  const setupPaidFetch = useCallback(
    (signer: ReturnType<typeof createWalletKitSigner>) => {
      const scheme = new ExactStellarScheme(signer);
      const client = new x402Client().register("stellar:testnet", scheme);
      const wrappedFetch = wrapFetchWithPayment(fetch, client);
      setPaidFetch(() => wrappedFetch);
    },
    []
  );

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      const { address: addr } = await StellarWalletsKit.authModal();
      setAddress(addr);
      const signer = createWalletKitSigner(addr);
      setupPaidFetch(signer);
    } catch {
      // User cancelled or no wallet
    } finally {
      setConnecting(false);
    }
  }, [setupPaidFetch]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setPaidFetch(null);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        connected: !!address,
        connecting,
        paidFetch,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
