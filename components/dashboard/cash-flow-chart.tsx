"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { ChevronDown } from "lucide-react"

const cashFlowData = [
  { month: "Jan", value: -10000000 },
  { month: "Feb", value: -10000000 },
  { month: "Mar", value: -10500000 },
  { month: "Apr", value: -10500000 },
  { month: "May", value: -11000000 },
  { month: "Jun", value: -11000000 },
  { month: "Jul", value: -11000000 },
  { month: "Aug", value: -11200000 },
  { month: "Sep", value: -11200000 },
  { month: "Oct", value: -11400000 },
  { month: "Nov", value: -11500000 },
  { month: "Dec", value: -11600000 },
]

const formatYAxis = (value: number) => {
  const absValue = Math.abs(value) / 1000000
  return `-${absValue} M`
}

export function CashFlowChart() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Cash Flow</CardTitle>
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            This Fiscal Year
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Chart */}
          <div className="flex-1 h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashFlowData} margin={{ top: 5, right: 5, left: 10, bottom: 5 }}>
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatYAxis}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  domain={[-12000000, 0]}
                />
                <Tooltip 
                  formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, "Cash Flow"]}
                  contentStyle={{ 
                    backgroundColor: "white", 
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2d3748"
                  strokeWidth={2}
                  dot={{ fill: "#2d3748", strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Summary */}
          <div className="lg:w-56 space-y-4 text-left lg:text-right grid grid-cols-2 lg:block gap-4">
            <div>
              <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                Cash as on Jan 01, 2026
              </div>
              <p className="text-xl font-semibold">$-11,297,462.50</p>
            </div>

            <div>
              <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                Incoming
              </div>
              <p className="text-lg font-medium">$0.00 <span className="text-teal-600">( + )</span></p>
            </div>

            <div>
              <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                Outgoing
              </div>
              <p className="text-lg font-medium">$292,366.56 <span className="text-red-500">( - )</span></p>
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Cash as on Dec 31, 2026
              </div>
              <p className="text-xl font-semibold">$-11,589,829.06 <span className="text-muted-foreground">( = )</span></p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
