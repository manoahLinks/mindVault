import { useEffect, useState } from "react";
import { api } from "../api/client";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  Bot,
  ShieldCheck,
  XCircle,
  CheckCircle2,
  Wallet,
  Globe,
  DollarSign,
  Activity,
  Clock,
} from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { cn } from "../lib/utils";
import { copyToClipboard } from "../lib/clipboard";

interface AgentStatus {
  agent: {
    name: string;
    walletAddress: string;
    network: string;
    endpoint: string;
    pricePerVerification: string;
    currency: string;
    status: string;
  };
  stats: {
    totalVerifications: number;
    verified: number;
    rejected: number;
    totalEarned: string;
    avgConfidence: string;
  };
  recentActivity: {
    id: string;
    resourceTitle: string;
    isOriginal: boolean;
    confidence: number;
    flags: string[];
    checkedAt: string;
  }[];
}

export function Agent() {
  const [data, setData] = useState<AgentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    api<AgentStatus>("/agent/status")
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = async (text: string, field: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) return <p className="text-slate-500">Failed to load agent status.</p>;

  const { agent, stats, recentActivity } = data;
  const approvalRate = stats.totalVerifications > 0
    ? Math.round((stats.verified / stats.totalVerifications) * 100)
    : 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 pb-20"
    >
      {/* Agent Identity */}
      <motion.div variants={itemVariants}>
        <div className="glass-dark rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Bot className="w-7 h-7 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">{agent.name}</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Autonomous content verification service powered by x402
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <span className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                {agent.status}
              </span>
            </div>
          </div>

          {/* Agent details grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <DetailRow
              icon={Wallet}
              label="Wallet"
              value={`${agent.walletAddress.slice(0, 8)}...${agent.walletAddress.slice(-8)}`}
              copyValue={agent.walletAddress}
              copied={copiedField === "wallet"}
              onCopy={() => handleCopy(agent.walletAddress, "wallet")}
            />
            <DetailRow
              icon={Globe}
              label="Endpoint"
              value="POST /verify-content"
              copyValue={agent.endpoint}
              copied={copiedField === "endpoint"}
              onCopy={() => handleCopy(agent.endpoint, "endpoint")}
            />
            <DetailRow
              icon={DollarSign}
              label="Price"
              value={`$${agent.pricePerVerification} ${agent.currency} per request`}
            />
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <StatCard
            icon={Activity}
            label="Verifications"
            value={stats.totalVerifications.toString()}
            sub="total requests"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            icon={DollarSign}
            label="Revenue"
            value={`$${parseFloat(stats.totalEarned).toFixed(4)}`}
            sub={agent.currency}
            highlight
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            icon={CheckCircle2}
            label="Approval Rate"
            value={`${approvalRate}%`}
            sub={`${stats.verified} approved / ${stats.rejected} rejected`}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            icon={ShieldCheck}
            label="Avg Confidence"
            value={`${Math.round(parseFloat(stats.avgConfidence) * 100)}%`}
            sub="verification certainty"
          />
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-5">
          <Clock className="w-5 h-5 text-slate-600" />
          <h2 className="text-xl font-bold">Recent Verifications</h2>
          <Badge variant="slate">{recentActivity.length}</Badge>
        </div>

        {recentActivity.length === 0 ? (
          <div className="glass-dark rounded-2xl p-12 text-center">
            <Bot className="w-12 h-12 text-slate-800 mx-auto mb-3" />
            <p className="text-slate-500">No verifications yet. Publish a resource to see the agent in action.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className="glass-dark rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                      item.isOriginal ? "bg-emerald-500/10" : "bg-red-500/10"
                    )}>
                      {item.isOriginal ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">
                        {item.resourceTitle}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant={item.isOriginal ? "emerald" : "rose"}>
                          {item.isOriginal ? "Verified" : "Rejected"}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {Math.round(item.confidence * 100)}% confidence
                        </span>
                      </div>
                      {item.flags.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {item.flags.map((flag, i) => (
                            <p key={i} className="text-xs text-slate-400 flex items-start gap-2">
                              <span className={item.isOriginal ? "text-emerald-500" : "text-red-500"}>
                                {item.isOriginal ? "+" : "-"}
                              </span>
                              {flag}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-slate-600 shrink-0">
                    {new Date(item.checkedAt).toLocaleString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, sub, highlight }: {
  icon: any;
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div className="glass-dark rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-slate-600" />
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">
          {label}
        </span>
      </div>
      <p className={cn(
        "text-2xl font-extrabold font-mono mb-1",
        highlight ? "text-emerald-400" : "text-white"
      )}>
        {value}
      </p>
      <p className="text-xs text-slate-600">{sub}</p>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, copyValue, copied, onCopy }: {
  icon: any;
  label: string;
  value: string;
  copyValue?: string;
  copied?: boolean;
  onCopy?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-white/5",
        copyValue && "cursor-pointer hover:border-white/10 transition-colors"
      )}
      onClick={onCopy}
    >
      <Icon className="w-4 h-4 text-indigo-400 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-600">{label}</p>
        <p className="text-sm text-white font-mono truncate">{value}</p>
      </div>
      {copyValue && (
        <span className="text-[10px] text-slate-500 shrink-0">
          {copied ? "Copied!" : "Click to copy"}
        </span>
      )}
    </div>
  );
}
