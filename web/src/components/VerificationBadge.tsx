const statusConfig = {
  pending: { label: "Pending", className: "bg-yellow-500/20 text-yellow-400" },
  verified: { label: "Verified", className: "bg-green-500/20 text-green-400" },
  rejected: { label: "Rejected", className: "bg-red-500/20 text-red-400" },
  skipped: { label: "Skipped", className: "bg-gray-500/20 text-gray-400" },
};

export function VerificationBadge({
  status,
}: {
  status: keyof typeof statusConfig;
}) {
  const config = statusConfig[status] ?? statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
