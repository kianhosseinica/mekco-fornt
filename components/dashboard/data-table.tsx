"use client"

import React from "react"

import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { MoreHorizontal, Search } from "lucide-react"

export interface Column<T> {
  key: keyof T | string
  label: string
  render?: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  className?: string
}

export function DataTable<T extends Record<string, unknown>>({ columns, data, className }: DataTableProps<T>) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b bg-muted/30">
            <th className="w-8 py-1.5 px-2">
              <Checkbox className="h-3 w-3" />
            </th>
            {columns.map((col) => (
              <th 
                key={String(col.key)} 
                className={cn(
                  "py-1.5 px-2 text-left font-medium text-muted-foreground uppercase text-[10px]",
                  col.className
                )}
              >
                {col.label}
              </th>
            ))}
            <th className="w-8 py-1.5 px-2">
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx} className="border-b hover:bg-muted/30 transition-colors">
              <td className="py-1.5 px-2">
                <Checkbox className="h-3 w-3" />
              </td>
              {columns.map((col) => (
                <td key={String(col.key)} className={cn("py-1.5 px-2", col.className)}>
                  {col.render 
                    ? col.render(item) 
                    : String(item[col.key as keyof T] ?? "")}
                </td>
              ))}
              <td className="py-1.5 px-2">
                <button className="text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
