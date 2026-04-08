import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api/client";
import { VerificationBadge } from "../components/VerificationBadge";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  Wallet, 
  Layers, 
  ShieldCheck, 
  ChevronDown, 
  Copy, 
  LayoutDashboard,
  Trash2,
  DollarSign,
  History,
  ArrowUpRight
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { cn } from "../lib/utils";
import { copyToClipboard } from "../lib/clipboard";
import { getAccessUrl } from "../lib/urls";

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
  accessUrl?: string;
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
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchAnalytics = () => {
    if (!apiKey) return;
    api<Analytics>("/publishers/me/analytics", { apiKey })
      .then(setAnalytics)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchAnalytics, [apiKey]);

  const handleDelist = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!apiKey) return;
    if (!confirm("Are you sure you want to delist this resource?")) return;
    try {
      await api(`/resources/${id}`, { method: "DELETE", apiKey });
      fetchAnalytics();
    } catch (err) {
      console.error(err);
    }
  };

  if (!apiKey) return <Navigate to="/publish" />;

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!analytics) return <p className="text-slate-500">Failed to load analytics.</p>;

  const { summary } = analytics;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12 pb-24"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-xs mb-1">
            <LayoutDashboard className="w-4 h-4" />
            <span>Management Console</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Publisher Dashboard</h1>
        </div>
        <a href="/publish">
          <Button>Publish New Resource</Button>
        </a>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          icon={Wallet} 
          label="Total Revenue" 
          value={`$${parseFloat(summary.totalEarned).toFixed(4)}`} 
          subValue={summary.currency}
          color="emerald"
        />
        <SummaryCard 
          icon={TrendingUp} 
          label="Total Sales" 
          value={summary.totalSales} 
          subValue="successful transactions"
          color="indigo"
        />
        <SummaryCard 
          icon={Layers} 
          label="Network Assets" 
          value={summary.listedResources} 
          subValue={`out of ${summary.totalResources} total`}
          color="cyan"
        />
        <SummaryCard 
          icon={ShieldCheck} 
          label="Audit Success" 
          value={`${summary.verification.verified}`} 
          subValue={`${summary.verification.pending} currently pending`}
          color="violet"
        />
      </div>

      {/* Resources List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <History className="w-6 h-6 text-slate-700" />
            Recently Published Resources
          </h2>
          <Badge variant="slate">{analytics.resources.length} Total</Badge>
        </div>

        {analytics.resources.length === 0 ? (
          <div className="p-16 text-center glass-dark rounded-3xl border border-dashed border-white/10">
            <Layers className="w-16 h-16 text-slate-800 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Resources Yet</h3>
            <p className="text-slate-500">Publish your first digital asset to start tracking analytics.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {analytics.resources.map((r) => (
              <motion.div
                key={r.id}
                variants={itemVariants}
                className={cn(
                  "rounded-[24px] border transition-all duration-300 overflow-hidden",
                  expandedResource === r.id 
                    ? "bg-slate-900 border-white/10 shadow-2xl" 
                    : "bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/10"
                )}
              >
                {/* Main Row */}
                <div
                  className="p-6 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedResource(expandedResource === r.id ? null : r.id)}
                >
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white truncate">{r.title}</h3>
                      <VerificationBadge status={r.verificationStatus} />
                      {r.listed && (
                        <Badge variant="indigo" className="h-5">Live</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5 text-indigo-400">
                        <DollarSign className="w-3.5 h-3.5" />
                        {r.price} USDC
                      </span>
                      <span className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {r.totalSales} Sales
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5" />
                        ${parseFloat(r.totalEarned).toFixed(4)} Earned
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {r.listed && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleDelist(r.id, e)}
                        className="h-9 px-4 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delist
                      </Button>
                    )}
                    <div className={cn(
                      "w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transition-transform",
                      expandedResource === r.id ? "rotate-180" : ""
                    )}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedResource === r.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5"
                    >
                      <div className="p-6 space-y-8 bg-slate-950/30">
                        {/* URL Management */}
                        <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5">
                          <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-600 mb-3">
                            Resource Management Link
                          </p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 text-sm text-indigo-300 font-mono break-all bg-black/40 px-3 py-2 rounded-lg">
                              {getAccessUrl(r.id)}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async (e) => {
                                e.stopPropagation();
                                const ok = await copyToClipboard(getAccessUrl(r.id));
                                if (ok) {
                                  setCopiedId(r.id);
                                  setTimeout(() => setCopiedId(null), 2000);
                                }
                              }}
                              className="bg-white/5"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              {copiedId === r.id ? "Copied!" : "Copy"}
                            </Button>
                          </div>
                        </div>

                        {/* Recent Payments Table-like list */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold flex items-center gap-2">
                            <History className="w-4 h-4 text-indigo-400" />
                            Recent Transaction History
                          </h4>
                          {r.recentPayments.length > 0 ? (
                            <div className="space-y-2">
                              {r.recentPayments.map((p, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                      <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-emerald-400">
                                        +${p.amount} USDC
                                      </p>
                                      <p className="text-xs text-slate-500 font-mono">
                                        Payer: {p.payerAddress.slice(0, 8)}...{p.payerAddress.slice(-8)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-xs font-semibold text-slate-500">
                                      {new Date(p.paidAt).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500 italic">No payments detected for this resource yet.</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function SummaryCard({ icon: Icon, label, value, subValue, color }: any) {
  const colors: any = {
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20 shadow-indigo-500/5",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5",
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20 shadow-cyan-500/5",
    violet: "text-violet-400 bg-violet-500/10 border-violet-500/20 shadow-violet-500/5",
  };

  return (
    <div className={cn(
      "p-6 rounded-[28px] border bg-slate-900/40 backdrop-blur-xl shadow-lg transition-all hover:scale-[1.02] hover:-translate-y-1",
      colors[color]
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-2xl bg-black/20 flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500 mb-1">{label}</p>
      <p className="text-3xl font-extrabold text-white tracking-tight leading-none mb-2">{value}</p>
      <p className="text-xs font-medium text-slate-500">{subValue}</p>
    </div>
  );
}
