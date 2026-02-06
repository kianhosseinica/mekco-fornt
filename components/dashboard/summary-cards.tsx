"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, ChevronDown } from "lucide-react"

interface SummaryCardProps {
  title: string
  subtitle: string
  total: string
  current: string
  overdue: string
  currentColor: string
  overdueColor: string
  currentPercent: number
}

export function SummaryCard({
  title,
  subtitle,
  total,
  current,
  overdue,
  currentColor,
  overdueColor,
  currentPercent,
}: SummaryCardProps) {
  return (
    <Card className="flex-1">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          <button className="flex items-center gap-1 text-teal-600 text-sm hover:text-teal-700">
            <PlusCircle className="w-4 h-4" />
            <span>New</span>
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-1">{subtitle}</p>
        <p className="text-2xl font-semibold mb-4">{total}</p>
        
        {/* Progress Bar */}
        <div className="h-2 rounded-full overflow-hidden flex mb-3">
          <div 
            className="h-full" 
            style={{ width: `${currentPercent}%`, backgroundColor: currentColor }}
          />
          <div 
            className="h-full flex-1" 
            style={{ backgroundColor: overdueColor }}
          />
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentColor }} />
            <span className="text-muted-foreground">Current :</span>
            <span className="font-medium">{current}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: overdueColor }} />
            <span className="text-muted-foreground">Overdue :</span>
            <span className="font-medium">{overdue}</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function SummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SummaryCard
        title="Total Receivables"
        subtitle="Total Unpaid Invoices"
        total="$80,783.82"
        current="$0.00"
        overdue="$80,783.82"
        currentColor="#38b2ac"
        overdueColor="#f6ad55"
        currentPercent={0}
      />
      <SummaryCard
        title="Total Payables"
        subtitle="Total Unpaid Bills"
        total="$350,051.41"
        current="$138,497.76"
        overdue="$211,553.65"
        currentColor="#38b2ac"
        overdueColor="#f6ad55"
        currentPercent={40}
      />
    </div>
  )
}
