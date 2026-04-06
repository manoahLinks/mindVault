import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api/client";
import { VerificationBadge } from "../components/VerificationBadge";
import { Navigate } from "react-router-dom";

interface RecentPayment {
  payerAddress: string;
  amount: string;
  paidAt: string;
}

interface ResourceStat {
  id: string;
  title: string;
  price: string;
  verificationStatus: "pending" | "verified" | "rejected" | "skipped";
  listed: boolean;
  accessUrl: string;
  createdAt: string;
  totalSales: number;
  totalEarned: string;
  recentPayments: RecentPayment[];
}

interface Analytics {
  summary: {
    totalEarned: string;
    currency: string;
    totalSales: number;
    totalResources: number;
    listedResources: number;
    verification: {
      verified: number;
      rejected: number;
      pending: number;
    };
  };
  resources: ResourceStat[];
}

export function Dashboard() {
  const { apiKey } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedResource, setExpandedResource] = useState<string | null>(null);

  const fetchAnalytics = () => {
    if (!apiKey) return;
    api<Analytics>("/publishers/me/analytics", { apiKey })
      .then(setAnalytics)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchAnalytics, [apiKey]);

  const handleDelist = async (id: string) => {
    if (!apiKey) return;
    try {
      await api(`/resources/${id}`, { method: "DELETE", apiKey });
      fetchAnalytics();
    } catch (err) {
      console.error(err);
    }
  };

  if (!apiKey) return <Navigate to="/publish" />;

  if (loading) return <p className="text-gray-500">Loading dashboard...</p>;
  if (!analytics) return <p className="text-gray-500">Failed to load analytics.</p>;

  const { summary } = analytics;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Publisher Dashboard</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-xl border border-gray-800 bg-gray-900/50">
          <p className="text-sm text-gray-500 mb-1">Total Earned</p>
          <p className="text-2xl font-bold text-green-400">
            ${parseFloat(summary.totalEarned).toFixed(4)}
          </p>
          <p className="text-xs text-gray-600">{summary.currency}</p>
        </div>
        <div className="p-5 rounded-xl border border-gray-800 bg-gray-900/50">
          <p className="text-sm text-gray-500 mb-1">Total Sales</p>
          <p className="text-2xl font-bold text-white">{summary.totalSales}</p>
          <p className="text-xs text-gray-600">payments received</p>
        </div>
        <div className="p-5 rounded-xl border border-gray-800 bg-gray-900/50">
          <p className="text-sm text-gray-500 mb-1">Resources</p>
          <p className="text-2xl font-bold text-white">
            {summary.listedResources}
            <span className="text-sm text-gray-500 font-normal">
              /{summary.totalResources}
            </span>
          </p>
          <p className="text-xs text-gray-600">listed / total</p>
        </div>
        <div className="p-5 rounded-xl border border-gray-800 bg-gray-900/50">
          <p className="text-sm text-gray-500 mb-1">Verification</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-green-400">
              {summary.verification.verified} verified
            </span>
            {summary.verification.rejected > 0 && (
              <span className="text-sm text-red-400">
                {summary.verification.rejected} rejected
              </span>
            )}
            {summary.verification.pending > 0 && (
              <span className="text-sm text-yellow-400">
                {summary.verification.pending} pending
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Resources list */}
      <h2 className="text-xl font-semibold mb-4">Your Resources</h2>

      {analytics.resources.length === 0 ? (
        <p className="text-gray-500">No resources yet. Publish your first!</p>
      ) : (
        <div className="space-y-3">
          {analytics.resources.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden"
            >
              {/* Resource row */}
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-900 transition"
                onClick={() =>
                  setExpandedResource(expandedResource === r.id ? null : r.id)
                }
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-white truncate">
                      {r.title}
                    </h3>
                    <VerificationBadge status={r.verificationStatus} />
                    {r.listed && (
                      <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400">
                        Listed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>${r.price} USDC</span>
                    <span>{r.totalSales} sales</span>
                    <span>${parseFloat(r.totalEarned).toFixed(4)} earned</span>
                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {r.listed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelist(r.id);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 text-sm hover:bg-red-600/30 transition"
                    >
                      Delist
                    </button>
                  )}
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${
                      expandedResource === r.id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Expanded details */}
              {expandedResource === r.id && (
                <div className="px-4 pb-4 border-t border-gray-800">
                  {/* Access URL */}
                  <div className="mt-3 mb-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                      Access URL
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs text-indigo-300 bg-gray-800 px-3 py-2 rounded font-mono break-all">
                        {r.accessUrl}
                      </code>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(r.accessUrl);
                        }}
                        className="px-3 py-2 rounded-lg bg-gray-800 text-gray-400 text-xs hover:text-white transition shrink-0"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {r.recentPayments.length > 0 ? (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                        Recent Payments
                      </p>
                      <div className="space-y-2">
                        {r.recentPayments.map((p, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-sm py-2 border-b border-gray-800/50 last:border-0"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-green-400 font-medium">
                                +${p.amount} USDC
                              </span>
                              <span className="text-gray-500 font-mono text-xs">
                                from {p.payerAddress.slice(0, 6)}...
                                {p.payerAddress.slice(-4)}
                              </span>
                            </div>
                            <span className="text-gray-600 text-xs">
                              {new Date(p.paidAt).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-gray-600">
                      No payments yet for this resource.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
