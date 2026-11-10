"use client"

import * as React from "react"
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ExternalLink } from "lucide-react"

import { FundStatusBadge } from "@/components/fund-status-badge"
import { ChannelLimitBadge } from "@/components/limit-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ChannelKey, FundRecord } from "@/lib/types"

function getRegionLabel(region: FundRecord["regionCategory"]) {
  const labels: Record<FundRecord["regionCategory"], string> = {
    us: "美国",
    hongkong: "香港",
    "china-offshore": "中国离岸",
    global: "全球",
    "asia-pacific": "亚太",
    japan: "日本",
    india: "印度",
    vietnam: "越南",
    germany: "德国",
    europe: "欧洲/英国",
    emerging: "新兴市场",
    "other-region": "其他地区",
  }
  return labels[region]
}

function getThemeLabel(theme: FundRecord["themeCategory"]) {
  const labels: Record<FundRecord["themeCategory"], string> = {
    nasdaq100: "纳指100",
    sp500: "标普500",
    "hangseng-tech": "恒生科技",
    hangseng: "恒生指数",
    tech: "科技主题",
    "hongkong-tech": "港股科技",
    "hongkong-biotech": "港股医药",
    "china-internet": "中国互联网",
    biotech: "生物科技",
    bond: "债券",
    commodity: "商品/能源",
    reits: "REITs",
    "other-qdii": "其他QDII",
  }
  return labels[theme]
}

function SortButton({
  label,
  column,
}: {
  label: string
  column: { toggleSorting: (desc?: boolean) => void; getIsSorted: () => false | "asc" | "desc" }
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  )
}

function getAlipayUrl(code: string) {
  return `https://www.fund123.cn/matiaria?fundCode=${code}`
}

function getLicaitongUrl(code: string) {
  return `https://www.tencentwm.com/mb/v5/pc/frame/index.shtml?fc=${code}`
}

function getTiantianUrl(code: string) {
  return `https://fund.eastmoney.com/${code}.html`
}

const linkClassName =
  "underline-offset-4 transition-colors hover:text-blue-600 hover:underline dark:hover:text-blue-400"

const chipClassName =
  "rounded-md border px-2 py-1 text-xs font-medium transition-colors hover:underline underline-offset-4"

function getSortableSubscribeAmount(fund: FundRecord) {
  const quote = fund.channels.distribution
  if (quote.status === "paused") return -1
  return quote.dailyLimit ?? -1
}

function getSortableDirectAmount(fund: FundRecord) {
  const quote = fund.channels.direct
  if (quote.status !== "open") return -1
  return quote.dailyLimit ?? 0
}

function FundNameCell({ fund }: { fund: FundRecord }) {
  return (
    <div className="min-w-[260px]">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-medium">{fund.name}</span>
        <Badge variant="secondary" className="shrink-0">
          {getRegionLabel(fund.regionCategory)}
        </Badge>
        <Badge variant="outline" className="shrink-0">
          {getThemeLabel(fund.themeCategory)}
        </Badge>
      </div>
    </div>
  )
}

const distributionColumns: ColumnDef<FundRecord>[] = [
  {
    accessorKey: "code",
    header: ({ column }) => <SortButton label="代码" column={column} />,
    cell: ({ row }) => (
      <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-300">
        {row.original.code}
      </span>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => <SortButton label="基金简称" column={column} />,
    cell: ({ row }) => <FundNameCell fund={row.original} />,
  },
  {
    accessorKey: "type",
    header: ({ column }) => <SortButton label="基金类型" column={column} />,
    cell: ({ row }) => <span className="text-slate-600 dark:text-slate-300">{row.original.type}</span>,
  },
  {
    id: "channels",
    header: "代销渠道核实",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex min-w-[210px] flex-wrap gap-2">
        <a
          href={getAlipayUrl(row.original.code)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${chipClassName} border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300`}
        >
          支付宝
        </a>
        <a
          href={getLicaitongUrl(row.original.code)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${chipClassName} border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300`}
        >
          理财通
        </a>
        <a
          href={getTiantianUrl(row.original.code)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${chipClassName} border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300`}
        >
          天天基金
        </a>
      </div>
    ),
  },
  {
    accessorKey: "subscribeStatus",
    header: ({ column }) => <SortButton label="代销申购状态" column={column} />,
    cell: ({ row }) => (
      <FundStatusBadge status={row.original.channels.distribution.statusText} kind={row.original.channels.distribution.status} />
    ),
  },
  {
    accessorKey: "maxSubscribeAmount",
    header: ({ column }) => <SortButton label="代销日累计限额" column={column} />,
    cell: ({ row }) => <ChannelLimitBadge quote={row.original.channels.distribution} />,
    sortingFn: (a, b) => getSortableSubscribeAmount(a.original) - getSortableSubscribeAmount(b.original),
  },
  {
    accessorKey: "date",
    header: ({ column }) => <SortButton label="净值日期" column={column} />,
    cell: ({ row }) => <span className="text-slate-600 dark:text-slate-300">{row.original.date}</span>,
  },
]

const directColumns: ColumnDef<FundRecord>[] = [
  {
    accessorKey: "code",
    header: ({ column }) => <SortButton label="代码" column={column} />,
    cell: ({ row }) => (
      <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-300">
        {row.original.code}
      </span>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => <SortButton label="基金简称" column={column} />,
    cell: ({ row }) => <FundNameCell fund={row.original} />,
  },
  {
    id: "fundCompany",
    header: ({ column }) => <SortButton label="基金公司" column={column} />,
    accessorFn: (fund) => fund.fundCompany?.name ?? "",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-slate-600 dark:text-slate-300">
        {row.original.fundCompany?.name ?? "—"}
      </span>
    ),
  },
  {
    id: "directStatus",
    header: ({ column }) => <SortButton label="直销申购状态" column={column} />,
    accessorFn: (fund) => fund.channels.direct.status,
    cell: ({ row }) => {
      const quote = row.original.channels.direct
      return (
        <div className="flex min-w-[190px] flex-col gap-1">
          <FundStatusBadge status={quote.statusText} kind={quote.status} />
          {quote.note ? (
            <span className="text-xs leading-5 text-slate-400 dark:text-slate-500">{quote.note}</span>
          ) : null}
        </div>
      )
    },
  },
  {
    id: "directLimit",
    header: ({ column }) => <SortButton label="直销单日限额" column={column} />,
    accessorFn: (fund) => fund.channels.direct.dailyLimit ?? -1,
    cell: ({ row }) => <ChannelLimitBadge quote={row.original.channels.direct} />,
    sortingFn: (a, b) => getSortableDirectAmount(a.original) - getSortableDirectAmount(b.original),
  },
  {
    id: "directSource",
    header: "依据公告",
    enableSorting: false,
    cell: ({ row }) => {
      const quote = row.original.channels.direct
      return (
        <div className="flex min-w-[200px] flex-col gap-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
          {quote.sourceUrl ? (
            <a
              href={quote.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={quote.sourceLabel}
              className={`line-clamp-2 max-w-[240px] ${linkClassName}`}
            >
              {quote.sourceLabel}
            </a>
          ) : (
            <span className="line-clamp-2 max-w-[240px]">{quote.sourceLabel}</span>
          )}
          <span className="text-slate-400 dark:text-slate-500">{quote.updatedAt ?? "尚未核对"}</span>
        </div>
      )
    },
  },
  {
    id: "directAction",
    header: () => <span className="whitespace-nowrap">核实入口</span>,
    enableSorting: false,
    cell: ({ row }) => {
      const quote = row.original.channels.direct
      if (!quote.sourceUrl) {
        return <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
      }
      return (
        <a
          href={quote.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-blue-700 dark:text-blue-300 ${linkClassName}`}
        >
          {quote.status === "unknown" ? "查公司直销" : "公告原文"}
          <ExternalLink className="h-3 w-3 shrink-0" />
        </a>
      )
    },
  },
]

export function FundTable({ funds, channel }: { funds: FundRecord[]; channel: ChannelKey }) {
  const columns = channel === "direct" ? directColumns : distributionColumns
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: channel === "direct" ? "directLimit" : "maxSubscribeAmount", desc: true },
  ])

  React.useEffect(() => {
    setSorting([{ id: channel === "direct" ? "directLimit" : "maxSubscribeAmount", desc: true }])
  }, [channel])

  const table = useReactTable({
    data: funds,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
  })

  return (
    <div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur dark:bg-slate-900/95">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400">
                    <div className="font-medium text-slate-700 dark:text-slate-200">没有匹配的基金</div>
                    <div className="text-sm">尝试清空主题、切换地区或查看全部状态。</div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-3 border-t border-slate-200/80 bg-slate-50/70 px-4 py-3 text-sm text-slate-500 dark:border-slate-800/80 dark:bg-slate-900/40 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <div className="tabular-nums">
          第 {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1} 页 · 共{" "}
          {funds.length.toLocaleString("zh-CN")} 条
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg bg-white/80 dark:bg-slate-950/60"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            上一页
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg bg-white/80 dark:bg-slate-950/60"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            下一页
          </Button>
        </div>
      </div>
    </div>
  )
}
