"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { ChevronDown } from "lucide-react"

const incomeExpenseData = [
  { month: "Jan", income: 0, expense: 80000 },
  { month: "Feb", income: 0, expense: 0 },
  { month: "Mar", income: 0, expense: 0 },
  { month: "Apr", income: 0, expense: 0 },
  { month: "May", income: 0, expense: 0 },
  { month: "Jun", income: 0, expense: 0 },
  { month: "Jul", income: 0, expense: 0 },
  { month: "Aug", income: 0, expense: 0 },
  { month: "Sep", income: 0, expense: 0 },
  { month: "Oct", income: 0, expense: 0 },
  { month: "Nov", income: 0, expense: 0 },
  { month: "Dec", income: 0, expense: 0 },
]

export function IncomeExpenseChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Income and Expense</CardTitle>
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            This Fiscal Year
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-teal-500" />
              <span className="text-muted-foreground">Total Income</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-coral-500" style={{ backgroundColor: "#ff7f7f" }} />
              <span className="text-muted-foreground">Total Expenses</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm border rounded-md text-muted-foreground hover:bg-muted">
              Accrual
            </button>
            <button className="px-3 py-1 text-sm bg-muted rounded-md font-medium">
              Cash
            </button>
          </div>
        </div>

        {/* Totals */}
        <div className="flex gap-8 mb-4">
          <div>
            <p className="text-xl font-semibold text-teal-600">$0.00</p>
          </div>
          <div>
            <p className="text-xl font-semibold" style={{ color: "#ff7f7f" }}>$80,639.15</p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={incomeExpenseData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#6b7280" }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#6b7280" }}
                tickFormatter={(value) => `${value / 1000}K`}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `$${value.toLocaleString()}`,
                  name === "income" ? "Income" : "Expenses"
                ]}
                contentStyle={{ 
                  backgroundColor: "white", 
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="income" fill="#38b2ac" radius={[2, 2, 0, 0]} />
              <Bar dataKey="expense" fill="#ff7f7f" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          * Income and expense values displayed are exclusive of taxes.
        </p>
      </CardContent>
    </Card>
  )
}
