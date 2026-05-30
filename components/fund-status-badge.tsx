import { Ban, CheckCircle2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"

export function FundStatusBadge({ status }: { status: string }) {
  if (status.includes("暂停")) {
    return (
      <Badge variant="secondary" className="gap-1 text-slate-600">
        <Ban className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

  return (
    <Badge variant="success" className="gap-1">
      <CheckCircle2 className="h-3 w-3" />
      {status || "未知"}
    </Badge>
  )
}
