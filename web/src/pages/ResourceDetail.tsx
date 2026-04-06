import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import { PayButton } from "../components/PayButton";
import { VerificationBadge } from "../components/VerificationBadge";

interface ResourceMeta {
  id: string;
  title: string;
  description: string | null;
  price: string;
  resourceType: string;
  mimeType: string | null;
  verificationStatus: "pending" | "verified" | "rejected" | "skipped";
  publisherName: string;
  publisherWallet: string;
  accessUrl: string;
  createdAt: string;
}

interface PaymentReceipt {
  paymentId: string;
  amount: string;
  currency: string;
  paidTo: string;
  paidAt: string;
}

export function ResourceDetail() {
  const { id } = useParams<{ id: string }>();
  const [resource, setResource] = useState<ResourceMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessResult, setAccessResult] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    api<ResourceMeta>(`/resources/${id}/meta`)
      .then(setResource)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!resource) return <p className="text-gray-500">Resource not found.</p>;

  const receipt: PaymentReceipt | null = accessResult?.receipt || null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-800 text-gray-400 uppercase">
            {resource.resourceType}
          </span>
          <VerificationBadge status={resource.verificationStatus} />
        </div>
        <h1 className="text-3xl font-bold mb-2">{resource.title}</h1>
        {resource.description && (
          <p className="text-gray-400 mb-4">{resource.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>by {resource.publisherName}</span>
          <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Shareable URL */}
      <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/50 mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
          Access URL (for agents & sharing)
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-sm text-indigo-300 bg-gray-800 px-3 py-2 rounded font-mono break-all">
            {resource.accessUrl}
          </code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(resource.accessUrl);
            }}
            className="px-3 py-2 rounded-lg bg-gray-800 text-gray-400 text-sm hover:text-white transition shrink-0"
          >
            Copy
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Any agent or client hitting this URL gets a 402 with payment instructions.
        </p>
      </div>

      {/* Payment info */}
      <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/50 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-indigo-400">
            ${resource.price} USDC
          </span>
          <span className="text-sm text-gray-500">per access</span>
        </div>
        <p className="text-xs text-gray-600 font-mono mb-6">
          Pays to: {resource.publisherWallet.slice(0, 8)}...{resource.publisherWallet.slice(-8)}
        </p>

        {accessResult ? (
          <div className="space-y-4">
            {/* Access result */}
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-green-400 font-medium mb-2">Access Granted!</p>
              {accessResult.url && (
                <a
                  href={accessResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 underline break-all"
                >
                  {accessResult.url}
                </a>
              )}
              {accessResult.downloaded && (
                <p className="text-sm text-gray-400">File downloaded successfully.</p>
              )}
            </div>

            {/* Payment receipt */}
            {receipt && (
              <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                <h3 className="text-sm font-semibold text-white mb-3">Payment Receipt</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount</span>
                    <span className="text-white font-medium">
                      ${receipt.amount} {receipt.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Paid To</span>
                    <span className="text-gray-300 font-mono text-xs">
                      {receipt.paidTo.slice(0, 8)}...{receipt.paidTo.slice(-8)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment ID</span>
                    <span className="text-gray-400 font-mono text-xs">
                      {receipt.paymentId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date</span>
                    <span className="text-gray-400">
                      {new Date(receipt.paidAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Network</span>
                    <span className="text-gray-400">Stellar Testnet</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <PayButton
            resourceId={resource.id}
            price={resource.price}
            onSuccess={setAccessResult}
          />
        )}
      </div>
    </div>
  );
}
