"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { 
  Plus, MoreHorizontal, ChevronDown, ChevronLeft, ChevronRight, X, 
  Pencil, FileText, DollarSign, Settings, Sparkles, Monitor, Search,
  ChevronUp, Paperclip
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const bills = [
  { 
    id: 1, 
    billNo: "PI-P20260127", 
    orderNo: "MKOVS-502665",
    date: "Jan 27, 2026", 
    dueDate: "Jan 27, 2026",
    vendor: "Edison (Seagul Group)", 
    vendorAddress: "3615 Laird Rd\nUnit 14\nMississauga\nL5L 5Z8 Ontario\nCanada",
    status: "OPEN", 
    terms: "Due on Receipt",
    amount: 22044.96, 
    balanceDue: 22044.96,
    currency: "USD",
    attachments: 2,
    purchaseOrders: [
      { date: "Jan 26, 2026", poNumber: "MKOVS-502665", status: "Issued" }
    ],
    items: [
      { 
        id: 1, 
        name: "5M - Potable Water Thermostatic Mixing Valve 1/2\" - 5M-TMV12", 
        description: "1/2\" thermostatic mixing valves with additional three PEX fittings USD21.80",
        qty: 504, 
        rate: 21.80, 
        amount: 10987.20 
      },
      { 
        id: 2, 
        name: "5M - Potable Water Thermostatic Mixing Valve 3/4\" - 5M-TMV34", 
        description: "3/4\" thermostatic mixing valves with additional three PEX fittings USD21.94",
        qty: 504, 
        rate: 21.94, 
        amount: 11057.76 
      },
    ],
    journal: [
      { account: "Accounts Payable", debit: 0.00, credit: 22044.96 },
      { account: "Inventory Asset", debit: 22044.96, credit: 0.00 },
    ]
  },
  { 
    id: 2, 
    billNo: "60615002", 
    orderNo: "",
    date: "Jan 26, 2026", 
    dueDate: "Feb 25, 2026",
    vendor: "Oatey", 
    vendorAddress: "",
    status: "OPEN", 
    terms: "Net 30",
    amount: 3360.29, 
    balanceDue: 3360.29,
    currency: "CAD",
    attachments: 0,
    purchaseOrders: [],
    items: [],
    journal: []
  },
  { 
    id: 3, 
    billNo: "721-860794", 
    orderNo: "",
    date: "Jan 23, 2026", 
    dueDate: "Jan 19, 2026",
    vendor: "Westlake Canada Inc.", 
    vendorAddress: "",
    status: "OVERDUE BY 4 DAYS", 
    terms: "Net 30",
    amount: 11517.06, 
    balanceDue: 11517.06,
    currency: "CAD",
    attachments: 0,
    purchaseOrders: [],
    items: [],
    journal: []
  },
  { 
    id: 4, 
    billNo: "26HLHK02E700", 
    orderNo: "",
    date: "Jan 14, 2026", 
    dueDate: "Jan 14, 2026",
    vendor: "HONG KONG HAILIANG ME...", 
    vendorAddress: "",
    status: "OVERDUE BY 13 DAYS", 
    terms: "Due on Receipt",
    amount: 78675.20, 
    balanceDue: 78675.20,
    currency: "USD",
    attachments: 0,
    purchaseOrders: [],
    items: [],
    journal: []
  },
  { 
    id: 5, 
    billNo: "870921", 
    orderNo: "",
    date: "Jan 23, 2026", 
    dueDate: "Jan 19, 2026",
    vendor: "Bow", 
    vendorAddress: "",
    status: "OVERDUE BY 4 DAYS", 
    terms: "Due on Receipt",
    amount: 6807.01, 
    balanceDue: 6807.01,
    currency: "CAD",
    attachments: 1,
    purchaseOrders: [],
    items: [],
    journal: []
  },
  { 
    id: 6, 
    billNo: "91169", 
    orderNo: "",
    date: "Jan 07, 2026", 
    dueDate: "Feb 06, 2026",
    vendor: "Armco", 
    vendorAddress: "",
    status: "OPEN", 
    terms: "Net 30",
    amount: 4558.19, 
    balanceDue: 4558.19,
    currency: "CAD",
    attachments: 0,
    purchaseOrders: [],
    items: [],
    journal: []
  },
  { 
    id: 7, 
    billNo: "2160909", 
    orderNo: "",
    date: "Jan 22, 2026", 
    dueDate: "Feb 21, 2026",
    vendor: "CB Supply", 
    vendorAddress: "",
    status: "OPEN", 
    terms: "Net 30",
    amount: 1292.99, 
    balanceDue: 1292.99,
    currency: "CAD",
    attachments: 0,
    purchaseOrders: [],
    items: [],
    journal: []
  },
  { 
    id: 8, 
    billNo: "I1864015", 
    orderNo: "",
    date: "Jan 23, 2026", 
    dueDate: "Feb 22, 2026",
    vendor: "WATTS", 
    vendorAddress: "",
    status: "OPEN", 
    terms: "Net 30",
    amount: 1079.15, 
    balanceDue: 1079.15,
    currency: "CAD",
    attachments: 0,
    purchaseOrders: [],
    items: [],
    journal: []
  },
  { 
    id: 9, 
    billNo: "I1863993", 
    orderNo: "",
    date: "Jan 23, 2026", 
    dueDate: "Feb 22, 2026",
    vendor: "WATTS", 
    vendorAddress: "",
    status: "OPEN", 
    terms: "Net 30",
    amount: 2071.74, 
    balanceDue: 2071.74,
    currency: "CAD",
    attachments: 0,
    purchaseOrders: [],
    items: [],
    journal: []
  },
  { 
    id: 10, 
    billNo: "0000157312", 
    orderNo: "",
    date: "Jan 22, 2026", 
    dueDate: "Feb 01, 2026",
    vendor: "Hydronic Systems Canada I...", 
    vendorAddress: "",
    status: "OPEN", 
    terms: "Net 10",
    amount: 17686.76, 
    balanceDue: 17686.76,
    currency: "CAD",
    attachments: 0,
    purchaseOrders: [],
    items: [],
    journal: []
  },
]

function StatusBadge({ status }: { status: string }) {
  const isOverdue = status.includes("OVERDUE")
  const isOpen = status === "OPEN"
  const isPaid = status === "PAID"
  
  return (
    <span className={cn(
      "text-xs font-medium",
      isOverdue && "text-orange-500",
      isOpen && "text-primary",
      isPaid && "text-green-600"
    )}>
      {status}
    </span>
  )
}

export default function BillsPage() {
  const [selectedBill, setSelectedBill] = useState<typeof bills[0] | null>(null)
  const [showPdfView, setShowPdfView] = useState(true)
  const [purchaseOrdersExpanded, setPurchaseOrdersExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<"details" | "journal">("details")

  // Table View (no selection)
  if (!selectedBill) {
    return (
      <DashboardLayout activeItem="Purchases" activeSubItem="Bills">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Tabs */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-6">
              <span className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">Uploaded Documents</span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">All Bills</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none border-r">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M3 12h18M3 18h18" />
                  </svg>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                  </svg>
                </Button>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-1 bg-transparent">
                    Upload Bill
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem className="text-xs">Upload from Computer</DropdownMenuItem>
                  <DropdownMenuItem className="text-xs">Upload from Cloud</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href="/purchases/bills/new">
                <Button size="sm" className="h-8 bg-primary hover:bg-primary/90 gap-1.5">
                  <Plus className="w-4 h-4" />
                  New
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4 p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Outstanding Payables</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold">$446,624.67</p>
                  <Button variant="link" className="h-auto p-0 text-xs text-primary">Refresh</Button>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Due Today</p>
              <p className="text-lg font-semibold text-primary">$0.00</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Due Within 30 Days</p>
              <p className="text-lg font-semibold">$150,860.12</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">OverDue Bills</p>
              <p className="text-lg font-semibold text-orange-500">$295,764.55</p>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-background">
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="px-3 py-3 w-[40px]">
                    <Checkbox />
                  </th>
                  <th className="px-3 py-3 text-left font-medium w-[100px]">DATE</th>
                  <th className="px-3 py-3 text-left font-medium w-[120px]">BILL#</th>
                  <th className="px-3 py-3 text-left font-medium w-[140px]">REFERENCE NUMBER</th>
                  <th className="px-3 py-3 text-left font-medium">VENDOR NAME</th>
                  <th className="px-3 py-3 text-left font-medium w-[140px]">STATUS</th>
                  <th className="px-3 py-3 text-left font-medium w-[100px]">DUE DATE</th>
                  <th className="px-3 py-3 text-right font-medium w-[100px]">AMOUNT</th>
                  <th className="px-3 py-3 text-right font-medium w-[100px]">BALANCE DUE</th>
                  <th className="px-3 py-3 w-[40px]">
                    <Search className="w-4 h-4 text-muted-foreground" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => (
                  <tr 
                    key={bill.id} 
                    className="border-b hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedBill(bill)}
                  >
                    <td className="px-3 py-3">
                      <Checkbox onClick={(e) => e.stopPropagation()} />
                    </td>
                    <td className="px-3 py-3 text-sm">{bill.date}</td>
                    <td className="px-3 py-3">
                      <span className="text-sm text-primary hover:underline">{bill.billNo}</span>
                    </td>
                    <td className="px-3 py-3 text-sm">{bill.orderNo}</td>
                    <td className="px-3 py-3 text-sm truncate">{bill.vendor}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={bill.status} />
                    </td>
                    <td className="px-3 py-3 text-sm">{bill.dueDate}</td>
                    <td className="px-3 py-3 text-sm text-right">${bill.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-3 py-3 text-sm text-right">${bill.balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-3 py-3">
                      {bill.attachments > 0 && (
                        <Paperclip className="w-4 h-4 text-muted-foreground" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Split View (with selection)
  return (
    <DashboardLayout activeItem="Purchases" activeSubItem="Bills">
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - List */}
        <div className="flex flex-col w-[280px] border-r bg-background shrink-0">
          {/* Header */}
          <div className="flex items-center justify-between px-2 py-2 border-b">
            <div className="flex items-center gap-1">
              <h1 className="text-xs font-medium truncate">All Bills</h1>
              <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
            </div>
            <div className="flex items-center gap-1">
              <Link href="/purchases/bills/new">
                <Button size="icon" className="h-6 w-6 bg-primary hover:bg-primary/90">
                  <Plus className="w-3 h-3" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-auto">
            {bills.map((bill) => (
              <div
                key={bill.id}
                onClick={() => setSelectedBill(bill)}
                className={cn(
                  "flex items-start gap-2 px-2 py-1.5 border-b cursor-pointer hover:bg-muted/50 transition-colors",
                  selectedBill?.id === bill.id && "bg-muted/50"
                )}
              >
                <Checkbox className="mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-medium truncate">{bill.vendor}</span>
                    <span className="text-xs font-medium shrink-0">${bill.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="truncate">{bill.billNo}</span>
                    <span>•</span>
                    <span className="shrink-0">{bill.date}</span>
                  </div>
                  <StatusBadge status={bill.status} />
                </div>
                {bill.attachments > 0 && (
                  <Paperclip className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-3 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Total Count:</span>
              <Button variant="link" className="h-auto p-0 text-xs text-primary">View</Button>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="w-3.5 h-3.5" />
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <span>1 - 10</span>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Detail View */}
        {selectedBill && (
          <div className="flex-1 flex flex-col bg-background overflow-hidden">
            {/* Detail Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-medium">{selectedBill.billNo}</h2>
              <div className="flex items-center gap-2">
                {selectedBill.attachments > 0 && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Paperclip className="w-4 h-4" />
                    {selectedBill.attachments}
                  </span>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setSelectedBill(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b">
              <Link href={`/purchases/bills/${selectedBill.id}/edit`}>
                <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5">
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    PDF/Print
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem className="text-xs">Download PDF</DropdownMenuItem>
                  <DropdownMenuItem className="text-xs">Print</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    Record Payment
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem className="text-xs">Record Payment</DropdownMenuItem>
                  <DropdownMenuItem className="text-xs">Pay via Check</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-xs bg-primary text-primary-foreground">Void</DropdownMenuItem>
                  <DropdownMenuItem className="text-xs">Expected Payment Date</DropdownMenuItem>
                  <DropdownMenuItem className="text-xs">Clone</DropdownMenuItem>
                  <DropdownMenuItem className="text-xs">View Purchase Orders</DropdownMenuItem>
                  <DropdownMenuItem className="text-xs">Create Vendor Credits</DropdownMenuItem>
                  <DropdownMenuItem className="text-xs">View Journal</DropdownMenuItem>
                  <DropdownMenuItem className="text-xs text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* What's Next Banner */}
            {selectedBill.status === "OPEN" && (
              <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-950/20 border-b">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="text-sm"><strong>{"WHAT'S NEXT?"}</strong> This bill is in the open status. You can now record payment for this bill.</span>
                <Button size="sm" className="h-7 text-xs bg-primary hover:bg-primary/90 ml-auto">
                  Record Payment
                </Button>
              </div>
            )}

            {/* Purchase Orders Section */}
            {selectedBill.purchaseOrders.length > 0 && (
              <div className="border-b">
                <button
                  onClick={() => setPurchaseOrdersExpanded(!purchaseOrdersExpanded)}
                  className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Purchase Orders</span>
                    <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                      {selectedBill.purchaseOrders.length}
                    </span>
                  </div>
                  {purchaseOrdersExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                {purchaseOrdersExpanded && (
                  <div className="px-4 pb-3">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-xs text-muted-foreground">
                          <th className="text-left py-2 font-medium">Date</th>
                          <th className="text-left py-2 font-medium">Purchase Order#</th>
                          <th className="text-left py-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBill.purchaseOrders.map((po, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="py-2">{po.date}</td>
                            <td className="py-2">
                              <Link href="#" className="text-primary hover:underline">{po.poNumber}</Link>
                            </td>
                            <td className="py-2 text-primary">{po.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* PDF Toggle & Customize */}
            <div className="flex items-center justify-end px-4 py-2 gap-2">
              <span className="text-sm">Show PDF View</span>
              <Switch checked={showPdfView} onCheckedChange={setShowPdfView} />
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto">
              {showPdfView ? (
                <div className="p-4 bg-muted/30">
                  {/* Customize Button - responsive placement above PDF */}
                  <div className="flex justify-end mb-3 max-w-3xl mx-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" className="h-7 text-xs bg-primary hover:bg-primary/90 gap-1">
                          <Sparkles className="w-3 h-3" />
                          Customize
                          <ChevronDown className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-xs">Edit Template</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs">Change Template</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="max-w-3xl mx-auto">
                    <div className="bg-white dark:bg-card border rounded-lg shadow-sm p-8 relative overflow-hidden">
                      {/* Open Banner */}
                      {selectedBill.status === "OPEN" && (
                        <div className="absolute left-0 top-0 w-24 h-24 overflow-hidden pointer-events-none z-10">
                          <div className="absolute top-5 -left-6 w-32 bg-primary text-white text-center text-xs font-medium py-1 -rotate-45 shadow">
                            Open
                          </div>
                        </div>
                      )}

                      {/* Company Header */}
                      <div className="flex justify-between mb-8">
                        <div>
                          <div className="w-16 h-16 bg-primary/10 rounded flex items-center justify-center mb-2">
                            <span className="text-primary font-bold text-sm">MEKCO</span>
                          </div>
                          <p className="text-sm font-semibold">Mekco Supply Inc.</p>
                          <p className="text-xs text-muted-foreground">16-110 West Beaver Creek Rd.</p>
                          <p className="text-xs text-muted-foreground">Richmond Hill, Ontario L4B 1J9</p>
                        </div>
                        <div className="text-right">
                          <h1 className="text-2xl font-bold mb-1">Bill</h1>
                          <p className="text-sm text-muted-foreground">Bill# {selectedBill.billNo}</p>
                          <p className="text-xs text-muted-foreground mt-2">Balance Due</p>
                          <p className="text-xl font-bold">${selectedBill.balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>

                      {/* Order Info */}
                      <div className="flex justify-end gap-8 mb-6 text-sm">
                        <div className="text-right space-y-1">
                          <div><span className="text-muted-foreground">Order Number :</span><span className="ml-4">{selectedBill.orderNo || '-'}</span></div>
                          <div><span className="text-muted-foreground">Bill Date :</span><span className="ml-4">{selectedBill.date}</span></div>
                          <div><span className="text-muted-foreground">DueDate :</span><span className="ml-4">{selectedBill.dueDate}</span></div>
                          <div><span className="text-muted-foreground">Terms :</span><span className="ml-4">{selectedBill.terms}</span></div>
                        </div>
                      </div>

                      {/* Bill From */}
                      <div className="mb-6">
                        <p className="text-xs text-muted-foreground mb-1">Bill From</p>
                        <Link href="#" className="text-sm font-medium text-primary hover:underline">{selectedBill.vendor}</Link>
                      </div>

                      {/* Items Table */}
                      <table className="w-full mb-4">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="text-left text-xs font-medium p-2 w-8">#</th>
                            <th className="text-left text-xs font-medium p-2">Item & Description</th>
                            <th className="text-right text-xs font-medium p-2 w-16">Qty</th>
                            <th className="text-right text-xs font-medium p-2 w-16">Rate</th>
                            <th className="text-right text-xs font-medium p-2 w-24">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedBill.items.length > 0 ? (
                            selectedBill.items.map((item, idx) => (
                              <tr key={item.id} className="border-b">
                                <td className="text-sm p-2">{idx + 1}</td>
                                <td className="text-sm p-2">
                                  <p>{item.name}</p>
                                  <p className="text-xs text-muted-foreground">{item.description}</p>
                                </td>
                                <td className="text-sm p-2 text-right">{item.qty}</td>
                                <td className="text-sm p-2 text-right">{item.rate.toFixed(2)}</td>
                                <td className="text-sm p-2 text-right">{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                              </tr>
                            ))
                          ) : (
                            <tr className="border-b">
                              <td colSpan={5} className="text-sm p-4 text-center text-muted-foreground">No items</td>
                            </tr>
                          )}
                        </tbody>
                      </table>

                      {/* Totals */}
                      <div className="flex justify-end">
                        <div className="text-sm w-56">
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Sub Total</span>
                            <span>{selectedBill.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between py-1 font-semibold">
                            <span>Total</span>
                            <span>${selectedBill.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between py-1 font-semibold bg-muted/50 px-2 -mx-2 mt-2">
                            <span>Balance Due</span>
                            <span>${selectedBill.balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <p className="text-muted-foreground text-sm">PDF view is disabled</p>
                </div>
              )}

              {/* Journal Section */}
              {selectedBill.journal.length > 0 && (
                <div className="border-t p-4">
                  <div className="flex items-center gap-4 border-b mb-4">
                    <button
                      onClick={() => setActiveTab("journal")}
                      className={cn(
                        "pb-2 text-sm font-medium border-b-2 -mb-px",
                        activeTab === "journal" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
                      )}
                    >
                      Journal
                    </button>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2">
                    Amount is displayed in your base currency <span className="bg-primary text-primary-foreground px-1.5 py-0.5 rounded text-xs">{selectedBill.currency}</span>
                  </p>

                  <h3 className="font-semibold mb-3">Bill</h3>

                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs text-muted-foreground">
                        <th className="text-left py-2 font-medium">ACCOUNT</th>
                        <th className="text-right py-2 font-medium">DEBIT</th>
                        <th className="text-right py-2 font-medium">CREDIT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBill.journal.map((entry, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="py-2">{entry.account}</td>
                          <td className="py-2 text-right">{entry.debit.toFixed(2)}</td>
                          <td className="py-2 text-right">{entry.credit.toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="font-semibold">
                        <td className="py-2"></td>
                        <td className="py-2 text-right">{selectedBill.journal.reduce((sum, e) => sum + e.debit, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="py-2 text-right">{selectedBill.journal.reduce((sum, e) => sum + e.credit, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
