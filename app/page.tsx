"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart"
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart"
import { TopExpensesChart } from "@/components/dashboard/top-expenses-chart"
import { PaypalBanner } from "@/components/dashboard/paypal-banner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function Dashboard() {
  return (
    <DashboardLayout activeItem="Home">
      {/* User Greeting */}
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="w-10 h-10 md:w-12 md:h-12">
          <AvatarFallback className="text-white text-base md:text-lg bg-slate-600">SB</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-lg md:text-xl font-semibold">Hello, Sia B</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Mekco Supply Inc.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 md:gap-6 border-b mb-6 overflow-x-auto">
        <button className="pb-3 text-sm font-medium border-b-2 border-teal-600 text-foreground whitespace-nowrap">
          Dashboard
        </button>
        <button className="pb-3 text-sm text-muted-foreground hover:text-foreground whitespace-nowrap">
          Getting Started
        </button>
        <button className="pb-3 text-sm text-muted-foreground hover:text-foreground whitespace-nowrap">
          Recent Updates
        </button>
      </div>

      {/* PayPal Banner */}
      <div className="mb-6">
        <PaypalBanner />
      </div>

      {/* Summary Cards */}
      <div className="mb-6">
        <SummaryCards />
      </div>

      {/* Cash Flow Chart */}
      <div className="mb-6">
        <CashFlowChart />
      </div>

      {/* Income/Expense & Top Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <IncomeExpenseChart />
        <TopExpensesChart />
      </div>
    </DashboardLayout>
  )
}
