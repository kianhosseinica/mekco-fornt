"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { 
  Search, 
  MoreVertical, 
  Home, 
  Star, 
  Users, 
  FileText, 
  Clock,
  BarChart3,
  ShoppingCart,
  Warehouse,
  DollarSign,
  Receipt,
  CreditCard,
  Calculator,
  Building2,
  Briefcase,
  Coins,
  Activity,
  Zap,
  Folder
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Loading from "./loading"

const reportCategories = [
  { icon: Home, label: "Home" },
  { icon: Star, label: "Favorites", active: true },
  { icon: Users, label: "Shared Reports" },
  { icon: FileText, label: "My Reports" },
  { icon: Clock, label: "Scheduled Reports" },
]

const reportTypes = [
  { icon: BarChart3, label: "Business Overview" },
  { icon: ShoppingCart, label: "Sales" },
  { icon: Warehouse, label: "Inventory" },
  { icon: Warehouse, label: "Inventory Valuation" },
  { icon: DollarSign, label: "Receivables" },
  { icon: Receipt, label: "Payments Received" },
  { icon: CreditCard, label: "Payables" },
  { icon: Calculator, label: "Purchases and Expenses" },
  { icon: Coins, label: "Taxes" },
  { icon: Building2, label: "Banking" },
  { icon: Briefcase, label: "Projects and Timesheet" },
  { icon: Calculator, label: "Accountant" },
  { icon: Coins, label: "Budgets" },
  { icon: DollarSign, label: "Currency" },
  { icon: Activity, label: "Activity" },
  { icon: Zap, label: "Automation" },
]

const favoriteReports = [
  { name: "Bill Details", category: "Payables", createdBy: "System Generated", lastVisited: "Jan 21, 2026 10:23 AM", starred: true },
]

export default function ReportsPage() {
  const [activeCategory, setActiveCategory] = useState("Favorites")
  const searchParams = useSearchParams()

  return (
    <Suspense fallback={<Loading />}>
      <DashboardLayout activeItem="Reports">
        <div className="flex h-full">
          {/* Left Sidebar */}
          <div className="w-56 border-r bg-card shrink-0 hidden md:block">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">Reports Center</h2>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search reports" className="pl-9" />
              </div>

              {/* Main Categories */}
              <nav className="space-y-1 mb-6">
                {reportCategories.map((cat) => (
                  <button
                    key={cat.label}
                    onClick={() => setActiveCategory(cat.label)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
                      activeCategory === cat.label
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <cat.icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                ))}
              </nav>

              {/* Report Category */}
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2 px-3">
                Report Category
              </div>
              <nav className="space-y-1">
                {reportTypes.map((type) => (
                  <button
                    key={type.label}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    <Folder className="w-4 h-4 text-muted-foreground" />
                    {type.label}
                  </button>
                ))}
              </nav>

              {/* Analytics Promo */}
              <div className="mt-6 p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-medium">Advanced Financial Analytics for Zoho Books</span>
                </div>
                <Link href="#" className="text-xs text-primary hover:underline">
                  Try Zoho Analytics
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-medium">Favorites</h3>
              <div className="flex items-center gap-2">
                <Button>Create Custom Report</Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-card rounded-lg border overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="p-3 text-left font-medium">REPORT NAME</th>
                    <th className="p-3 text-left font-medium">REPORT CATEGORY</th>
                    <th className="p-3 text-left font-medium">CREATED BY</th>
                    <th className="p-3 text-left font-medium">LAST VISITED</th>
                  </tr>
                </thead>
                <tbody>
                  {favoriteReports.map((report, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {report.starred && <Star className="w-4 h-4 fill-amber-400 text-amber-400" />}
                          <Link href="#" className="text-primary hover:underline text-sm">
                            {report.name}
                          </Link>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-foreground">{report.category}</td>
                      <td className="p-3 text-sm text-foreground">{report.createdBy}</td>
                      <td className="p-3 text-sm text-foreground">{report.lastVisited}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </Suspense>
  )
}
