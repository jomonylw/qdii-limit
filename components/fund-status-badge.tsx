import { Ban, CheckCircle2, HelpCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { ChannelStatus } from "@/lib/types"

function resolveKind(status: string, kind?: ChannelStatus): ChannelStatus {
  if (kind) return kind
  if (status.includes("暂停")) return "paused"
  if (!status || status.includes("待核实") || status.includes("未知")) return "unknown"
  return "open"
}

export function FundStatusBadge({ status, kind }: { status: string; kind?: ChannelStatus }) {
  const resolved = resolveKind(status, kind)

  if (resolved === "paused") {
    return (
      <Badge variant="secondary" className="gap-1 text-slate-600 dark:text-slate-300">
        <Ban className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

  if (resolved === "unknown") {
    return (
      <Badge variant="secondary" className="gap-1 border-dashed text-slate-500 dark:text-slate-400">
        <HelpCircle className="h-3 w-3" />
        {status || "未知"}
      </Badge>
    )
  }

  return (
    <Badge variant="success" className="gap-1">
      <CheckCircle2 className="h-3 w-3" />
      {status}
    </Badge>
  )
}
