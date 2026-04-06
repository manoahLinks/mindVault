import { Badge } from "./ui/Badge";
import { CheckCircle2, Clock, XCircle, Slash } from "lucide-react";

const statusConfig = {
  pending: { label: "Pending", variant: "amber" as const, icon: Clock },
  verified: { label: "Verified", variant: "emerald" as const, icon: CheckCircle2 },
  rejected: { label: "Rejected", variant: "rose" as const, icon: XCircle },
  skipped: { label: "Skipped", variant: "slate" as const, icon: Slash },
};

export function VerificationBadge({
  status,
}: {
  status: keyof typeof statusConfig;
}) {
  const config = statusConfig[status] ?? statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}
