import { useWallet } from "../hooks/useWallet";

export function WalletButton() {
  const { address, connected, connecting, connect, disconnect } = useWallet();

  if (connecting) {
    return (
      <button
        disabled
        className="px-4 py-2 rounded-lg bg-gray-700 text-gray-400 text-sm"
      >
        Connecting...
      </button>
    );
  }

  if (connected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400 font-mono">
          {address.slice(0, 4)}...{address.slice(-4)}
        </span>
        <button
          onClick={disconnect}
          className="px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 text-sm hover:bg-red-600/30 transition"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition"
    >
      Connect Wallet
    </button>
  );
}
