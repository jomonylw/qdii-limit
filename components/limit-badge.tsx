import { AlertTriangle, CheckCircle2, Gauge, HelpCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { FundRecord } from "@/lib/types"

export function LimitBadge({ fund }: { fund: FundRecord }) {
  switch (fund.limitLevel) {
    case "low":
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          {fund.formattedLimit}
        </Badge>
      )
    case "medium":
      return (
        <Badge variant="warning" className="gap-1">
          <Gauge className="h-3 w-3" />
          {fund.formattedLimit}
        </Badge>
      )
    case "high":
      return (
        <Badge variant="info" className="gap-1">
          <Gauge className="h-3 w-3" />
          {fund.formattedLimit}
        </Badge>
      )
    case "none":
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          {fund.formattedLimit}
        </Badge>
      )
    default:
      return (
        <Badge variant="secondary" className="gap-1">
          <HelpCircle className="h-3 w-3" />
          {fund.formattedLimit}
        </Badge>
      )
  }
}
