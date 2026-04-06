import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";
import { PayButton } from "../components/PayButton";
import { VerificationBadge } from "../components/VerificationBadge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Calendar, 
  Download, 
  Globe, 
  Key, 
  Layers, 
  Receipt, 
  ShieldCheck, 
  User 
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";

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

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
        <Skeleton className="h-10 w-24" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">Resource not found</h1>
        <Link to="/catalog">
          <Button variant="outline">Back to Catalog</Button>
        </Link>
      </div>
    );
  }

  const receipt: PaymentReceipt | null = accessResult?.receipt || null;

  return (
    <div className="max-w-6xl mx-auto">
      <Link
        to="/catalog"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Badge variant="indigo" className="flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {resource.resourceType}
              </Badge>
              <VerificationBadge status={resource.verificationStatus} />
              {resource.mimeType && (
                <Badge variant="slate">{resource.mimeType}</Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight leading-tight">
              {resource.title}
            </h1>
            {resource.description && (
              <p className="text-xl text-slate-400 leading-relaxed max-w-3xl">
                {resource.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8 border-t border-white/5">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-600">
                Publisher
              </label>
              <div className="flex items-center gap-2 text-white font-medium">
                <User className="w-4 h-4 text-indigo-400" />
                {resource.publisherName}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-600">
                Published On
              </label>
              <div className="flex items-center gap-2 text-white font-medium">
                <Calendar className="w-4 h-4 text-indigo-400" />
                {new Date(resource.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>

          {/* Access URL Section */}
          <div className="p-1.5 bg-gradient-to-br from-white/10 to-transparent rounded-2xl">
            <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-[14px] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <Globe className="w-4 h-4" />
                  Access URL for Agents
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(resource.accessUrl);
                  }}
                  className="h-8 text-xs bg-white/5"
                >
                  Copy URL
                </Button>
              </div>
              <div className="p-3 bg-slate-950/80 rounded-lg border border-white/5 font-mono text-sm text-indigo-300 break-all leading-loose">
                {resource.accessUrl}
              </div>
              <p className="text-xs text-slate-500 italic">
                Secure link using x402 protocol. All programmatic access is gated.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar / Checkout */}
        <aside className="space-y-6">
          <div className="sticky top-24">
            <div className="p-1 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 rounded-3xl">
              <div className="bg-slate-900 backdrop-blur-3xl p-8 rounded-[22px] shadow-2xl space-y-8">
                <div className="space-y-2">
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-white">
                      ${resource.price}
                    </span>
                    <span className="text-xl font-bold text-indigo-400 pb-1">
                      USDC
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    Pay once, access forever.
                  </p>
                </div>

                <div className="space-y-4 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    Secure Purchase
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <Download className="w-5 h-5 text-indigo-500" />
                    Instant Access
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {accessResult ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold mb-3">
                          <CheckCircle2 className="w-5 h-5" />
                          Access Granted
                        </div>
                        {accessResult.url && (
                          <a
                            href={accessResult.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 w-full justify-center px-4 py-3 bg-indigo-600 rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/30"
                          >
                            <Download className="w-5 h-5" />
                            Open Resource
                          </a>
                        )}
                        {accessResult.downloaded && (
                          <p className="text-sm text-slate-400 text-center mt-3 font-medium">
                            File downloaded successfully.
                          </p>
                        )}
                      </div>

                      {/* Receipt Card */}
                      {receipt && (
                        <div className="p-5 bg-white/5 rounded-xl border border-white/5 space-y-4">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                            <Receipt className="w-4 h-4" />
                            Payment Receipt
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500">Payment ID</span>
                              <span className="text-slate-300 font-mono">
                                {receipt.paymentId.slice(0, 8)}...
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500">Date</span>
                              <span className="text-slate-300">
                                {new Date(receipt.paidAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs pt-2 border-t border-white/5">
                              <span className="text-slate-500 font-bold">Total Paid</span>
                              <span className="text-white font-bold">
                                {receipt.amount} {receipt.currency}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <PayButton
                      resourceId={resource.id}
                      price={resource.price}
                      onSuccess={setAccessResult}
                    />
                  )}
                </AnimatePresence>

                <div className="pt-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-600">
                    <Key className="w-3 h-3" />
                    Payer: {resource.publisherWallet.slice(0, 6)}...{resource.publisherWallet.slice(-4)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
