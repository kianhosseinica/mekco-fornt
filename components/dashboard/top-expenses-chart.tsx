"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { ChevronDown } from "lucide-react"

const expensesData = [
  { name: "Cost of Goods Sold", value: 458925.10, color: "#38b2ac" },
]

export function TopExpensesChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Top Expenses</CardTitle>
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            Last 12 Months
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Donut Chart */}
          <div className="relative w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {expensesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xs text-muted-foreground">All Expenses</p>
              <p className="text-sm font-semibold">$458925.10</p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1">
            {expensesData.map((item) => (
              <div key={item.name} className="flex items-center gap-3 py-2">
                <span 
                  className="w-3 h-3 rounded-sm shrink-0" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-muted-foreground">{item.name}</span>
                <span className="text-sm font-medium ml-auto">
                  ${item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
