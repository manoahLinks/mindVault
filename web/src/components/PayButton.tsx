import { useState } from "react";
import { useWallet } from "../hooks/useWallet";

interface PayButtonProps {
  resourceId: string;
  price: string;
  onSuccess: (data: any) => void;
}

export function PayButton({ resourceId, price, onSuccess }: PayButtonProps) {
  const { connected, paidFetch, connect } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    if (!paidFetch) return;

    setLoading(true);
    setError(null);

    try {
      const res = await paidFetch(`/api/resources/${resourceId}`);

      if (!res.ok) {
        throw new Error(`Payment failed: ${res.status}`);
      }

      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data = await res.json();
        onSuccess(data);
      } else {
        // File download
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download =
          res.headers.get("content-disposition")?.split("filename=")[1]?.replace(/"/g, "") ||
          "download";
        a.click();
        URL.revokeObjectURL(url);
        onSuccess({ downloaded: true });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <button
        onClick={connect}
        className="w-full py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition"
      >
        Connect Wallet to Pay
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Processing Payment..." : `Pay $${price} USDC`}
      </button>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
