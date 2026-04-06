import { useEffect, useState, useRef } from "react";
import { api } from "../api/client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Bot, 
  ShieldCheck, 
  ArrowRight,
  Loader2
} from "lucide-react";
import { Button } from "./ui/Button";
import { cn } from "../lib/utils";

interface VerificationDetails {
  resourceId: string;
  title: string;
  status: "pending" | "verified" | "rejected" | "skipped";
  listed: boolean;
  publishedAt: string;
  verification: {
    isOriginal: boolean;
    confidence: number;
    flags: string[];
    checkedAt: string;
  } | null;
}

const STEPS = [
  { key: "submitted", label: "Resource submitted", icon: ShieldCheck },
  { key: "payment", label: "Processing x402 payment", icon: Sparkles },
  { key: "analyzing", label: "AI agent analyzing content", icon: Bot },
  { key: "complete", label: "Verification complete", icon: CheckCircle2 },
];

export function VerificationModal({
  resourceId,
  onClose,
}: {
  resourceId: string;
  onClose: () => void;
}) {
  const [details, setDetails] = useState<VerificationDetails | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const startTime = useRef(Date.now());
  const pollRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const poll = () => {
      api<VerificationDetails>(`/resources/${resourceId}/verification`)
        .then(setDetails)
        .catch(console.error);
    };
    poll();
    pollRef.current = setInterval(poll, 2000);

    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);

    return () => {
      clearInterval(pollRef.current);
      clearInterval(timerRef.current);
    };
  }, [resourceId]);

  useEffect(() => {
    if (details && details.status !== "pending") {
      clearInterval(pollRef.current);
    }
  }, [details]);

  const currentStep =
    !details || details.status === "pending"
      ? elapsed < 3
        ? 0
        : elapsed < 8
        ? 1
        : 2
      : 3;

  const isComplete = details && details.status !== "pending";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        onClick={isComplete ? onClose : undefined}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-slate-900 border border-white/10 rounded-[32px] p-8 max-w-lg w-full shadow-2xl overflow-hidden"
      >
        {/* Animated Background Element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">AI Verification</h2>
              <p className="text-sm text-slate-500 font-medium">Audit in progress...</p>
            </div>
            <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5 font-mono text-xs text-indigo-400">
              {elapsed}s
            </div>
          </div>

          {/* Resource Status */}
          {details && (
            <div className="px-4 py-3 bg-slate-950/50 rounded-xl border border-white/5 mb-8 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <BoxIcon className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-600">Checking Resource</p>
                <p className="text-sm font-semibold text-slate-300 truncate">{details.title}</p>
              </div>
            </div>
          )}

          {/* Steps */}
          <div className="space-y-6 mb-10">
            {STEPS.map((step, i) => {
              const isActive = i === currentStep;
              const isDone = i < currentStep || (i === 3 && isComplete);
              const StepIcon = step.icon;

              return (
                <div key={step.key} className="flex items-center gap-4 group">
                  <div className="relative transition-all duration-500">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500",
                        isDone
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : isActive
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                          : "bg-slate-800 text-slate-600 border border-transparent"
                      )}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : isActive ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={cn(
                        "absolute top-10 left-1/2 w-px h-6 -translate-x-1/2 transition-colors duration-500",
                        isDone ? "bg-emerald-500/30" : "bg-slate-800"
                      )} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      "text-sm font-bold transition-colors duration-500",
                      isDone ? "text-emerald-400" : isActive ? "text-white" : "text-slate-600"
                    )}>
                      {step.label}
                    </p>
                    {isActive && !isComplete && (
                      <p className="text-xs text-slate-500 animate-pulse mt-0.5">Contacting oracle...</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Results Area */}
          <AnimatePresence mode="wait">
            {isComplete && details.verification ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-6 rounded-[24px] border border-white/5 mb-8 overflow-hidden relative group",
                  details.status === "verified"
                    ? "bg-emerald-500/5"
                    : "bg-rose-500/5"
                )}
              >
                {/* Result Ornament */}
                <div className={cn(
                  "absolute top-0 right-0 w-32 h-32 blur-[40px] opacity-20 pointer-events-none transition-transform group-hover:scale-125",
                  details.status === "verified" ? "bg-emerald-500" : "bg-rose-500"
                )} />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={cn(
                      "text-lg font-extrabold flex items-center gap-2",
                      details.status === "verified" ? "text-emerald-400" : "text-rose-400"
                    )}>
                      {details.status === "verified" ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <XCircle className="w-6 h-6" />
                      )}
                      {details.status === "verified" ? "Verification Successful" : "Resource Rejected"}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 mb-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Confidence Score</span>
                    <span className="text-sm font-mono font-bold text-white">
                      {Math.round(details.verification.confidence * 100)}%
                    </span>
                  </div>

                  {details.verification.flags.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Analysis Notes</p>
                      <div className="space-y-1.5">
                        {details.verification.flags.map((flag, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                            <div className={cn(
                              "mt-1.5 w-1 h-1 rounded-full shrink-0",
                              details.status === "verified" ? "bg-emerald-500" : "bg-rose-500"
                            )} />
                            {flag}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <Button
            onClick={onClose}
            variant={isComplete ? "primary" : "outline"}
            className="w-full h-12 text-base font-bold transition-all"
          >
            {isComplete ? "Continue to Vault" : "Run in Background"}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function BoxIcon(props: any) {
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
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}
