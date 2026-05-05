import { Badge } from "@/components/ui/badge";
import { SocketStatus } from "@/features/types/socket.types";
import { cn } from "@/features/utils/cn";

const STATUS_STYLES: Record<SocketStatus, string> = {
  connected: "border-emerald-200 bg-emerald-50 text-emerald-700",
  connecting: "border-amber-200 bg-amber-50 text-amber-700",
  disconnected: "border-slate-200 bg-slate-100 text-slate-700",
  error: "border-red-200 bg-red-50 text-red-700",
};

export function SocketStatusBadge({ status }: { status: SocketStatus }) {
  return (
    <Badge className={cn("gap-2 rounded-full px-3 py-1", STATUS_STYLES[status])}>
      <span className="relative flex h-2.5 w-2.5">
        <span className={cn("inline-flex h-2.5 w-2.5 rounded-full", {
          "bg-emerald-500": status === "connected",
          "bg-amber-500": status === "connecting",
          "bg-slate-500": status === "disconnected",
          "bg-red-500": status === "error",
        })} />
      </span>
      <span className="capitalize">{status}</span>
    </Badge>
  );
}
