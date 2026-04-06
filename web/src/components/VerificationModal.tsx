import { useEffect, useState, useRef } from "react";
import { api } from "../api/client";

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
  { key: "submitted", label: "Resource submitted" },
  { key: "payment", label: "Processing x402 payment" },
  { key: "analyzing", label: "AI agent analyzing content" },
  { key: "complete", label: "Verification complete" },
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
  const pollRef = useRef<ReturnType<typeof setInterval>>();
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    // Poll verification status every 2s
    const poll = () => {
      api<VerificationDetails>(`/resources/${resourceId}/verification`)
        .then(setDetails)
        .catch(console.error);
    };
    poll();
    pollRef.current = setInterval(poll, 2000);

    // Elapsed timer
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);

    return () => {
      clearInterval(pollRef.current);
      clearInterval(timerRef.current);
    };
  }, [resourceId]);

  // Stop polling once complete
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Content Verification</h2>
          <span className="text-sm text-gray-500 font-mono">{elapsed}s</span>
        </div>

        {/* Resource title */}
        {details && (
          <p className="text-sm text-gray-400 mb-6 truncate">
            Verifying: <span className="text-gray-300">{details.title}</span>
          </p>
        )}

        {/* Progress steps */}
        <div className="space-y-4 mb-8">
          {STEPS.map((step, i) => {
            const isActive = i === currentStep;
            const isDone = i < currentStep || (i === 3 && isComplete);
            const isFuture = i > currentStep && !isComplete;

            return (
              <div key={step.key} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 transition-all duration-500 ${
                    isDone
                      ? "bg-green-500/20 text-green-400"
                      : isActive
                      ? "bg-indigo-500/20 text-indigo-400 ring-2 ring-indigo-500/50"
                      : "bg-gray-800 text-gray-600"
                  }`}
                >
                  {isDone ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`text-sm transition-colors ${
                    isDone
                      ? "text-green-400"
                      : isActive
                      ? "text-white"
                      : "text-gray-600"
                  }`}
                >
                  {step.label}
                  {isActive && !isComplete && (
                    <span className="inline-block ml-1 animate-pulse">...</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* Result */}
        {isComplete && details.verification && (
          <div
            className={`p-4 rounded-lg border mb-6 ${
              details.status === "verified"
                ? "bg-green-500/10 border-green-500/30"
                : "bg-red-500/10 border-red-500/30"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className={`text-lg font-semibold ${
                  details.status === "verified" ? "text-green-400" : "text-red-400"
                }`}
              >
                {details.status === "verified" ? "Content Verified" : "Content Rejected"}
              </span>
              <span className="text-sm text-gray-400">
                Confidence: {Math.round(details.verification.confidence * 100)}%
              </span>
            </div>

            {details.verification.flags.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                  {details.status === "verified" ? "Notes" : "Reasons"}
                </p>
                <ul className="space-y-1">
                  {details.verification.flags.map((flag, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className={details.status === "verified" ? "text-green-500" : "text-red-500"}>
                        {details.status === "verified" ? "+" : "-"}
                      </span>
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {details.status === "verified" && (
              <p className="mt-3 text-sm text-green-400/80">
                Your resource is now listed in the marketplace.
              </p>
            )}
            {details.status === "rejected" && (
              <p className="mt-3 text-sm text-red-400/80">
                Your resource was not listed. You can try publishing different content.
              </p>
            )}
          </div>
        )}

        {/* Still pending with no result */}
        {!isComplete && (
          <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-400">
                The AI verification agent is reviewing your content for originality.
                This typically takes 10–30 seconds.
              </p>
            </div>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className={`w-full py-3 rounded-lg font-medium transition ${
            isComplete
              ? "bg-indigo-600 text-white hover:bg-indigo-500"
              : "bg-gray-800 text-gray-400 hover:text-white"
          }`}
        >
          {isComplete ? "Done" : "Close (verification continues in background)"}
        </button>
      </div>
    </div>
  );
}
