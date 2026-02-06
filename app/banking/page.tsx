"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { PageHeader } from "@/components/dashboard/page-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, ChevronDown, TrendingDown, Building2, Wallet, Clock } from "lucide-react"
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"

const chartData = [
  { date: "25 Dec", cashInHand: 3500, bankBalance: -9500000 },
  { date: "27 Dec", cashInHand: 3500, bankBalance: -9600000 },
  { date: "29 Dec", cashInHand: 3500, bankBalance: -9700000 },
  { date: "31 Dec", cashInHand: 3500, bankBalance: -9800000 },
  { date: "01 Jan", cashInHand: 3500, bankBalance: -10000000 },
  { date: "03 Jan", cashInHand: 3500, bankBalance: -10200000 },
  { date: "05 Jan", cashInHand: 3500, bankBalance: -10500000 },
  { date: "07 Jan", cashInHand: 3500, bankBalance: -10800000 },
  { date: "09 Jan", cashInHand: 3500, bankBalance: -11000000 },
  { date: "11 Jan", cashInHand: 3500, bankBalance: -11200000 },
  { date: "13 Jan", cashInHand: 3500, bankBalance: -11400000 },
  { date: "15 Jan", cashInHand: 3600, bankBalance: -11500000 },
  { date: "17 Jan", cashInHand: 3600, bankBalance: -11550000 },
  { date: "19 Jan", cashInHand: 3673, bankBalance: -11593000 },
  { date: "21 Jan", cashInHand: 3673, bankBalance: -11593502 },
  { date: "23 Jan", cashInHand: 3673, bankBalance: -11593502 },
]

const accounts = [
  { id: 1, name: "Petty Cash", type: "cash", uncategorized: "", pending: "", bankAmount: "$0.00", booksAmount: "$3,673.50" },
  { id: 2, name: "TD CAD", type: "bank", uncategorized: "", pending: "$0.00", bankAmount: "$0.00", booksAmount: "$-10,162,217.60" },
  { id: 3, name: "TD USD", type: "bank", uncategorized: "", pending: "$0.00", bankAmount: "$0.00", booksAmount: "$-1,407,389.71" },
  { id: 4, name: "Undeposited Funds", type: "cash", uncategorized: "", pending: "$0.00", bankAmount: "$0.00", booksAmount: "$0.00" },
]

export default function BankingPage() {
  return (
    <DashboardLayout activeItem="Banking">
      <PageHeader
        title="Banking Overview"
        searchPlaceholder="Search in Banking ( / )"
        customActions={
          <div className="flex items-center gap-2">
            <Link href="#" className="text-primary text-sm hover:underline">
              Auto-upload bank statements from email
            </Link>
            <Button variant="outline" size="sm">Import Statement</Button>
            <Button size="sm">Add Bank or Credit Card</Button>
          </div>
        }
      />

      <div className="p-4 md:p-6">
        {/* Auto-upload Banner */}
        <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 shrink-0">
              <svg viewBox="0 0 64 64" className="w-full h-full">
                <circle cx="32" cy="32" r="28" fill="#e0f2f1" />
                <rect x="20" y="24" width="24" height="16" rx="2" fill="#4db6ac" />
                <rect x="24" y="20" width="16" height="4" rx="1" fill="#80cbc4" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-1">Auto-upload bank statements from email</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Enable Auto-upload in Zoho Books
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full" />
                  Set up Auto-forwarding
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full" />
                  Add Statements to Bank
                </span>
              </div>
              <Link href="#" className="text-primary text-sm hover:underline">
                Set Up Now →
              </Link>
            </div>
            <Button variant="ghost" size="icon">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Chart Card */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">All Accounts</h3>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Last 30 days
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cash In Hand</p>
                <p className="text-lg font-semibold">$3,673.50</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bank Balance</p>
                <p className="text-lg font-semibold">$-11,593,502.56</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-primary text-sm mb-4">
            <TrendingDown className="w-4 h-4" />
            <span>Hide Chart</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(value) => `${value / 1000000}M`}
                />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="bankBalance" 
                  stroke="#14b8a6" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-muted-foreground rounded" />
              <span>Cash In Hand</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-primary rounded" />
              <span>Bank Balance</span>
            </div>
          </div>
        </Card>

        {/* Accounts Table */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-medium">Active Accounts</h3>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="bg-card rounded-lg border overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="p-3 text-left font-medium">ACCOUNT DETAILS</th>
                  <th className="p-3 text-left font-medium">UNCATEGORIZED</th>
                  <th className="p-3 text-left font-medium">PENDING CHECKS</th>
                  <th className="p-3 text-right font-medium">AMOUNT IN BANK</th>
                  <th className="p-3 text-right font-medium">AMOUNT IN ZOHO BOOKS</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {account.type === "bank" ? (
                          <Building2 className="w-5 h-5 text-primary" />
                        ) : (
                          <Wallet className="w-5 h-5 text-muted-foreground" />
                        )}
                        <Link href="#" className="text-primary hover:underline text-sm">
                          {account.name}
                        </Link>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-foreground">{account.uncategorized}</td>
                    <td className="p-3 text-sm text-foreground">{account.pending}</td>
                    <td className="p-3 text-sm text-right text-foreground">{account.bankAmount}</td>
                    <td className="p-3 text-sm text-right text-foreground">{account.booksAmount}</td>
                    <td className="p-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
