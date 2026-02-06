"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Play, FileText, Receipt, CircleDollarSign, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function ExpensesPage() {
  return (
    <DashboardLayout activeItem="Purchases" activeSubItem="Expenses">
      <PageHeader
        title="Receipts Inbox"
        secondaryTitle="All Expenses"
        searchPlaceholder="Search in Expenses ( / )"
        showNewButton
        customActions={
          <select className="border rounded px-3 py-1.5 text-sm bg-background">
            <option>Upload Expense</option>
          </select>
        }
      />

      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {/* Video Card */}
        <div className="bg-card border rounded-lg p-6 mb-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-40 h-28 bg-muted rounded-lg flex items-center justify-center shrink-0">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Play className="w-5 h-5 text-primary-foreground ml-1" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-bold">Z</span>
              </div>
              <span className="text-sm text-muted-foreground">Zoho Books</span>
            </div>
            <p className="text-sm text-muted-foreground">How to record and manage expenses</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Time To Manage Your Expenses!</h1>
          <p className="text-muted-foreground mb-6">
            Create and manage expenses that are part of your organization's operating costs.
          </p>
          <Button className="bg-primary hover:bg-primary/90 mb-3">
            RECORD EXPENSE
          </Button>
          <div>
            <Link href="#" className="text-primary hover:underline text-sm">
              Import Expenses
            </Link>
          </div>
        </div>

        {/* Life Cycle Section */}
        <div className="border-t pt-8">
          <h2 className="text-lg font-medium text-center mb-8">Life cycle of an Expense</h2>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-2 mb-8">
            {/* Flow Chart */}
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">EXPENSE INCURRED</span>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground hidden md:block" />
            <div className="flex items-center gap-2 p-3 border rounded-lg bg-primary/10">
              <Receipt className="w-4 h-4 text-primary" />
              <span className="text-sm">RECORD EXPENSE</span>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground hidden md:block" />
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">BILLABLE</span>
              </div>
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">NON-BILLABLE</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground hidden md:block" />
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">CONVERT TO INVOICE</span>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground hidden md:block" />
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <CircleDollarSign className="w-4 h-4 text-primary" />
              <span className="text-sm">GET REIMBURSED</span>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-medium mb-4">In the Expenses module, you can:</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                Record a single expense or record expenses in bulk.
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                Set mileage rates and record expenses based on the distance travelled.
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                Convert an expense into an invoice to get it reimbursed.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Promo */}
        <div className="mt-8 bg-muted/50 border rounded-lg p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
            <Receipt className="w-6 h-6 text-orange-500" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-sm">Try Zoho's advanced travel and expense reporting software</h4>
            <p className="text-xs text-muted-foreground">
              Manage employee travel and expenses, simplify mileage reimbursements, and streamline card expenses with Zoho Expense.
              <Link href="#" className="text-primary hover:underline ml-1">Learn More</Link>
            </p>
          </div>
          <Button variant="outline" size="sm">
            Buy Expense Claim Addon
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
