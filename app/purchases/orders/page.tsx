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
  Pencil, Mail, FileText, CheckCircle, Settings, Sparkles, Monitor, Search
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

const purchaseOrders = [
  { id: 1, date: "Jan 27, 2026", orderNo: "MKRIC-502667", reference: "3/8 Rods x 880 bundle", vendor: "Global Xpress", status: "DRAFT", billedStatus: "", amount: "$2,486.00", deliveryDate: "" },
  { id: 2, date: "Jan 27, 2026", orderNo: "MKRIC-502666", reference: "Prepaid shipping is $4000 NET", vendor: "Apollo Valves", status: "DRAFT", billedStatus: "", amount: "$4,789.66", deliveryDate: "" },
  { id: 3, date: "Jan 26, 2026", orderNo: "MKRIC-502665", reference: "Pipes", vendor: "Bow", status: "ISSUED", billedStatus: "", amount: "$17,770.29", deliveryDate: "" },
  { id: 4, date: "Jan 26, 2026", orderNo: "MKOVS-502665", reference: "Mixing Valve - 1/2\" and 3/4\"", vendor: "Edison (Seagul Group)", status: "ISSUED", billedStatus: "BILLED", amount: "$22,044.96", deliveryDate: "" },
  { id: 5, date: "Jan 26, 2026", orderNo: "MKRIC-502664", reference: "Sadegh - Golden House GTA - PICKUP", vendor: "Klein Internation Ltd.", status: "ISSUED", billedStatus: "", amount: "$0.00", deliveryDate: "" },
]

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(
      "text-xs font-medium",
      status === "ISSUED" && "text-primary",
      status === "DRAFT" && "text-muted-foreground"
    )}>
      {status}
    </span>
  )
}

export default function PurchaseOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<typeof purchaseOrders[0] | null>(null)
  const [showPdfView, setShowPdfView] = useState(true)

  // Table View (no selection)
  if (!selectedOrder) {
    return (
      <DashboardLayout activeItem="Purchases" activeSubItem="Purchase Orders">
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-medium">All Purchase Orders</h1>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2">
              <Link href="/purchases/orders/new">
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

          {/* Table */}
          <div className="flex-1 overflow-auto px-0">
            <table className="w-full table-fixed">
              <thead className="sticky top-0 bg-background">
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="px-3 py-3 w-[40px]">
                    <Checkbox />
                  </th>
                  <th className="px-3 py-3 text-left font-medium w-[100px]">DATE</th>
                  <th className="px-3 py-3 text-left font-medium w-[140px]">PURCHASE ORDER#</th>
                  <th className="px-3 py-3 text-left font-medium">REFERENCE#</th>
                  <th className="px-3 py-3 text-left font-medium w-[180px]">VENDOR NAME</th>
                  <th className="px-3 py-3 text-left font-medium w-[80px]">STATUS</th>
                  <th className="px-3 py-3 text-left font-medium w-[110px]">BILLED STATUS</th>
                  <th className="px-3 py-3 text-right font-medium w-[100px]">AMOUNT</th>
                  <th className="px-3 py-3 text-left font-medium w-[110px]">DELIVERY DATE</th>
                  <th className="px-3 py-3 w-[40px]">
                    <Search className="w-4 h-4 text-muted-foreground" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="border-b hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-3 py-3">
                      <Checkbox onClick={(e) => e.stopPropagation()} />
                    </td>
                    <td className="px-3 py-3 text-sm">{order.date}</td>
                    <td className="px-3 py-3">
                      <span className="text-sm text-primary hover:underline">{order.orderNo}</span>
                    </td>
                    <td className="px-3 py-3 text-sm truncate">{order.reference}</td>
                    <td className="px-3 py-3 text-sm truncate">{order.vendor}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-3 py-3">
                      {order.billedStatus && (
                        <span className="text-xs font-medium text-amber-600">{order.billedStatus}</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm text-right">{order.amount}</td>
                    <td className="px-3 py-3 text-sm">{order.deliveryDate}</td>
                    <td className="px-3 py-3">
                      {order.status === "ISSUED" && (
                        <Settings className="w-4 h-4 text-muted-foreground" />
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
    <DashboardLayout activeItem="Purchases" activeSubItem="Purchase Orders">
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - List */}
        <div className="flex flex-col w-[280px] border-r bg-background shrink-0">
          {/* Header */}
          <div className="flex items-center justify-between px-2 py-2 border-b">
            <div className="flex items-center gap-1">
              <h1 className="text-xs font-medium truncate">All Purchase Or...</h1>
              <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
            </div>
            <div className="flex items-center gap-1">
              <Link href="/purchases/orders/new">
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
            {purchaseOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={cn(
                  "flex items-start gap-2 px-2 py-1.5 border-b cursor-pointer hover:bg-muted/50 transition-colors",
                  selectedOrder?.id === order.id && "bg-muted/50"
                )}
              >
                <Checkbox className="mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-medium truncate">{order.vendor}</span>
                    <span className="text-xs font-medium shrink-0">{order.amount}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="truncate">{order.orderNo}</span>
                    <span>•</span>
                    <span className="shrink-0">{order.date}</span>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                {order.status === "ISSUED" && (
                  <Settings className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
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
              <span>10 per page</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <span>1 - 5</span>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Detail View */}
        {selectedOrder && (
          <div className="flex-1 flex flex-col bg-background overflow-hidden">
            {/* Detail Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-medium">{selectedOrder.orderNo}</h2>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setSelectedOrder(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b">
              <Link href={`/purchases/orders/${selectedOrder.id}/edit`}>
                <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5">
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                Send Email
              </Button>
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
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                Mark as Issued
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-xs">Mark as Issued</DropdownMenuItem>
                  <DropdownMenuItem className="text-xs">Convert to Bill</DropdownMenuItem>
                  <DropdownMenuItem className="text-xs">Clone</DropdownMenuItem>
                  <DropdownMenuItem className="text-xs text-destructive">Delete</DropdownMenuItem>
                  <DropdownMenuItem className="text-xs">Mark as Received</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* What's Next Banner */}
            <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-950/20 border-b">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-sm"><strong>WHAT&apos;S NEXT?</strong> Send this purchase order to your vendor or mark it as issued.</span>
              <Button size="sm" className="h-7 text-xs bg-primary hover:bg-primary/90 ml-auto">
                Send Purchase Order
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs bg-transparent">
                Mark as Issued
              </Button>
            </div>

            {/* PDF Toggle & Customize */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-2">
                <span className="text-sm">Show PDF View</span>
                <Switch checked={showPdfView} onCheckedChange={setShowPdfView} />
              </div>
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

            {/* PDF Preview */}
            {showPdfView && (
              <div className="flex-1 overflow-auto p-4 bg-muted/30">
                <div className="relative max-w-3xl mx-auto">
                  <div className="bg-white dark:bg-card border rounded-lg shadow-sm p-8 relative overflow-hidden">
                    {/* Draft Banner - Top Left Corner Ribbon */}
                    {selectedOrder.status === "DRAFT" && (
                      <div className="absolute left-0 top-0 w-24 h-24 overflow-hidden pointer-events-none z-10">
                        <div className="absolute top-5 -left-6 w-32 bg-gray-400 text-white text-center text-xs font-medium py-1 -rotate-45 shadow">
                          Draft
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
                        <h1 className="text-2xl font-bold mb-1">Purchase Order</h1>
                        <p className="text-sm text-muted-foreground"># {selectedOrder.orderNo}</p>
                      </div>
                    </div>

                    {/* Vendor & Delivery Info */}
                    <div className="grid grid-cols-2 gap-8 mb-6">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Vendor Address</p>
                        <p className="text-sm font-medium text-primary">{selectedOrder.vendor}</p>
                        <p className="text-xs text-muted-foreground">3615 Laird Rd</p>
                        <p className="text-xs text-muted-foreground">Unit 14</p>
                        <p className="text-xs text-muted-foreground">Mississauga</p>
                        <p className="text-xs text-muted-foreground">L5L 5Z8 Ontario</p>
                        <p className="text-xs text-muted-foreground">Canada</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Deliver To</p>
                        <p className="text-sm font-medium">Mekco Supply</p>
                        <p className="text-xs text-muted-foreground">16-110 West Beaver Creek Rd.</p>
                        <p className="text-xs text-muted-foreground">Richmond Hill, Ontario L4B 1J9</p>
                      </div>
                    </div>

                    {/* Date & Revision */}
                    <div className="flex justify-end gap-8 mb-6 text-sm">
                      <div className="text-right">
                        <span className="text-muted-foreground">Date :</span>
                        <span className="ml-4">Jan 27, 2026</span>
                      </div>
                      <div className="text-right">
                        <span className="text-muted-foreground">Revision :</span>
                        <span className="ml-4">1</span>
                      </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full mb-4">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left text-xs font-medium p-2 w-8">#</th>
                          <th className="text-left text-xs font-medium p-2">Item & Description</th>
                          <th className="text-right text-xs font-medium p-2 w-16">Qty</th>
                          <th className="text-right text-xs font-medium p-2 w-16">Price</th>
                          <th className="text-right text-xs font-medium p-2 w-20">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="text-sm p-2">1</td>
                          <td className="text-sm p-2">
                            <p>3/8&quot; x 10&apos; ALL THREADED ROD</p>
                            <p className="text-xs text-muted-foreground">Zinc Plated</p>
                            <p className="text-xs text-muted-foreground">Total Qty in Master Bundle: 880</p>
                            <p className="text-xs text-muted-foreground">Qty in each Bundle 20</p>
                          </td>
                          <td className="text-sm p-2 text-right">880</td>
                          <td className="text-sm p-2 text-right">2.50</td>
                          <td className="text-sm p-2 text-right">2,200.00</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-between items-start">
                      <p className="text-sm">Items in Total 880</p>
                      <div className="text-sm w-48">
                        <div className="flex justify-between py-1">
                          <span>Sub Total</span>
                          <span>2,200.00</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>GST/HST (13%)</span>
                          <span>286.00</span>
                        </div>
                        <div className="flex justify-between py-1 font-semibold border-t mt-1 pt-2">
                          <span>Total</span>
                          <span>$2,486.00</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PDF Template Footer */}
            <div className="flex items-center justify-end px-4 py-2 border-t text-sm">
              <span className="text-muted-foreground">PDF Template : &apos;Standard Template&apos;</span>
              <Button variant="link" className="text-primary p-0 h-auto ml-2">Change</Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
