import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import type { SignAuthEntry, SignTransaction } from "@stellar/stellar-sdk/contract";

export function createWalletKitSigner(address: string): {
  address: string;
  signAuthEntry: SignAuthEntry;
  signTransaction: SignTransaction;
} {
  return {
    address,
    signAuthEntry: async (authEntry, opts) => {
      return StellarWalletsKit.signAuthEntry(authEntry, {
        address: opts?.address || address,
        networkPassphrase: opts?.networkPassphrase,
      });
    },
    signTransaction: async (xdr, opts) => {
      return StellarWalletsKit.signTransaction(xdr, {
        address: opts?.address || address,
        networkPassphrase: opts?.networkPassphrase,
      });
    },
  };
}
