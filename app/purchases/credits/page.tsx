"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, X, Search, ChevronDown, Pencil, FileText, MoreHorizontal, Paperclip } from "lucide-react"
import Link from "next/link"

const credits = [
  { id: 1, date: "Jan 23, 2026", creditNo: "100114354", refNo: "MKRIC-502650", vendor: "Reliance Worldwide Corporation (RWC)", status: "OPEN", amount: 73.91, balance: 73.91 },
  { id: 2, date: "Jan 13, 2026", creditNo: "60601821", refNo: "MKRIC-502628", vendor: "Oatey", status: "CLOSED", amount: 227.22, balance: 0.00 },
  { id: 3, date: "Jan 07, 2026", creditNo: "INC-0465071", refNo: "MKRIC-502589-SS", vendor: "Boshart", status: "CLOSED", amount: 14.26, balance: 0.00 },
  { id: 4, date: "Jan 02, 2026", creditNo: "60591878", refNo: "MKRIC-502607", vendor: "Oatey", status: "CLOSED", amount: 119.68, balance: 0.00 },
  { id: 5, date: "Dec 30, 2025", creditNo: "60590504", refNo: "MKRIC-502628", vendor: "Oatey", status: "CLOSED", amount: 676.73, balance: 0.00 },
  { id: 6, date: "Dec 15, 2025", creditNo: "0000156979", refNo: "Warranty-Mehdi Mehdizadeh", vendor: "Hydronic Systems Canada Inc.", status: "CLOSED", amount: 282.52, balance: 0.00 },
  { id: 7, date: "Dec 03, 2025", creditNo: "I1853933", refNo: "Warranty MKRIC-502164", vendor: "WATTS", status: "CLOSED", amount: 104.90, balance: 0.00 },
  { id: 8, date: "Nov 27, 2025", creditNo: "285951", refNo: "Q3-2025 - Rebate", vendor: "Bow", status: "CLOSED", amount: 9550.03, balance: 0.00 },
  { id: 9, date: "Nov 27, 2025", creditNo: "INC-0455009", refNo: "", vendor: "Boshart", status: "CLOSED", amount: 29.32, balance: 0.00 },
  { id: 10, date: "Nov 04, 2025", creditNo: "Defective Rings", refNo: "", vendor: "HONG KONG HAILIANG METAL TRADING LIMITED", status: "CLOSED", amount: 5000.00, balance: 0.00 },
  { id: 11, date: "Oct 09, 2025", creditNo: "SPCR25-000447", refNo: "MKRIC-502493", vendor: "Saniflo", status: "CLOSED", amount: 262.63, balance: 0.00 },
  { id: 12, date: "Oct 09, 2025", creditNo: "PCR25-000448", refNo: "MKRIC-502478", vendor: "Saniflo", status: "CLOSED", amount: 182.75, balance: 0.00 },
  { id: 13, date: "Sep 29, 2025", creditNo: "1000128697", refNo: "", vendor: "Excalibur Water", status: "OPEN", amount: 20.34, balance: 20.34 },
  { id: 14, date: "Sep 08, 2025", creditNo: "284640", refNo: "MKRIC-502425", vendor: "Bow", status: "CLOSED", amount: 2505.01, balance: 0.00 },
  { id: 15, date: "Aug 15, 2025", creditNo: "Short Payment Waived", refNo: "MKOVS-502363", vendor: "Cixi welday plastic product co.Ltd", status: "CLOSED", amount: 19.20, balance: 0.00 },
  { id: 16, date: "Aug 13, 2025", creditNo: "284184", refNo: "Q2-2025 - Rebate", vendor: "Bow", status: "CLOSED", amount: 8682.35, balance: 0.00 },
  { id: 17, date: "Jul 02, 2025", creditNo: "I1815596", refNo: "MKRIC-502260", vendor: "WATTS", status: "CLOSED", amount: 644.89, balance: 0.00 },
]

export default function VendorCreditsPage() {
  const [selectedCredit, setSelectedCredit] = useState<typeof credits[0] | null>(null)
  const [viewMode, setViewMode] = useState<"split" | "table">("table")
  const [showPdfView, setShowPdfView] = useState(true)

  if (viewMode === "table") {
    return (
      <DashboardLayout activeItem="Purchases" activeSubItem="Vendor Credits">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">All Vendor Credits</h1>
            <ChevronDown className="w-4 h-4 text-muted-foreground cursor-pointer" />
          </div>
          <div className="flex items-center gap-2">
            <Link href="/purchases/credits/new">
              <Button size="sm" className="text-xs">
                <Plus className="w-3 h-3 mr-1" />
                New
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-xs" onClick={() => setViewMode("split")}>Split View</DropdownMenuItem>
                <DropdownMenuItem className="text-xs">Sort by</DropdownMenuItem>
                <DropdownMenuItem className="text-xs">Import</DropdownMenuItem>
                <DropdownMenuItem className="text-xs">Export</DropdownMenuItem>
                <DropdownMenuItem className="text-xs">Preferences</DropdownMenuItem>
                <DropdownMenuItem className="text-xs">Refresh List</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Full Table */}
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-10 py-2 px-3"><Checkbox /></TableHead>
                <TableHead className="text-[10px] font-medium py-2 px-3">DATE</TableHead>
                <TableHead className="text-[10px] font-medium py-2 px-3">CREDIT NOTE#</TableHead>
                <TableHead className="text-[10px] font-medium py-2 px-3">REFERENCE NUMBER</TableHead>
                <TableHead className="text-[10px] font-medium py-2 px-3">VENDOR NAME</TableHead>
                <TableHead className="text-[10px] font-medium py-2 px-3">STATUS</TableHead>
                <TableHead className="text-[10px] font-medium py-2 px-3 text-right">AMOUNT</TableHead>
                <TableHead className="text-[10px] font-medium py-2 px-3 text-right">BALANCE</TableHead>
                <TableHead className="text-[10px] font-medium py-2 px-3">BILL#</TableHead>
                <TableHead className="w-10 py-2 px-3"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {credits.map((credit) => (
                <TableRow key={credit.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => { setSelectedCredit(credit); setViewMode("split"); }}>
                  <TableCell className="py-2 px-3"><Checkbox /></TableCell>
                  <TableCell className="py-2 px-3 text-xs">{credit.date}</TableCell>
                  <TableCell className="py-2 px-3 text-xs">
                    <span className="text-primary hover:underline">{credit.creditNo}</span>
                  </TableCell>
                  <TableCell className="py-2 px-3 text-xs">{credit.refNo}</TableCell>
                  <TableCell className="py-2 px-3 text-xs">{credit.vendor}</TableCell>
                  <TableCell className="py-2 px-3 text-xs">
                    <span className={credit.status === "OPEN" ? "text-primary" : "text-orange-600"}>{credit.status}</span>
                  </TableCell>
                  <TableCell className="py-2 px-3 text-xs text-right">${credit.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell className="py-2 px-3 text-xs text-right">${credit.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell className="py-2 px-3 text-xs"></TableCell>
                  <TableCell className="py-2 px-3"><Paperclip className="w-3 h-3 text-muted-foreground" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DashboardLayout>
    )
  }

  // Default to first credit if none selected when in split mode
  const displayCredit = selectedCredit || credits[0]

  return (
    <DashboardLayout activeItem="Purchases" activeSubItem="Vendor Credits">
      <div className="flex h-full">
        {/* Left Panel - Credits List */}
        <div className="w-[380px] border-r flex flex-col shrink-0">
          {/* List Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium">All Vendor Credi...</h2>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-1">
              <Link href="/purchases/credits/new">
                <Button size="icon" className="h-7 w-7">
                  <Plus className="w-4 h-4" />
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-7 w-7 bg-transparent">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-xs" onClick={() => setViewMode("table")}>Table View</DropdownMenuItem>
                  <DropdownMenuItem className="text-xs">Import</DropdownMenuItem>
                  <DropdownMenuItem className="text-xs">Export</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Credits List */}
          <div className="flex-1 overflow-auto">
            {credits.map((credit) => (
              <div
                key={credit.id}
                className={`flex items-start gap-3 p-3 border-b cursor-pointer hover:bg-muted/30 ${selectedCredit?.id === credit.id ? "bg-muted/50" : ""}`}
                onClick={() => setSelectedCredit(credit)}
              >
                <Checkbox className="mt-1" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{credit.vendor}</p>
                      <p className="text-xs text-muted-foreground">{credit.creditNo} &bull; {credit.date}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium">${credit.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                  <p className={`text-xs mt-1 ${credit.status === "OPEN" ? "text-primary" : "text-orange-600"}`}>
                    {credit.status}
                  </p>
                </div>
                <Paperclip className="w-3.5 h-3.5 text-muted-foreground mt-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Detail View */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Detail Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <h2 className="text-lg font-semibold">{displayCredit.creditNo}</h2>
            <div className="flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-muted-foreground" />
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b">
            <Link href={`/purchases/credits/${displayCredit.id}/edit`}>
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
                <DropdownMenuItem className="text-xs">PDF</DropdownMenuItem>
                <DropdownMenuItem className="text-xs">Print</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Apply to Bills
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-xs">Refund</DropdownMenuItem>
                <DropdownMenuItem className="text-xs">Void</DropdownMenuItem>
                <DropdownMenuItem className="text-xs">Clone</DropdownMenuItem>
                <DropdownMenuItem className="text-xs">View Journal</DropdownMenuItem>
                <DropdownMenuItem className="text-xs text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* PDF Toggle */}
          <div className="flex items-center justify-end px-4 py-2 border-b">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Show PDF View</span>
              <Switch checked={showPdfView} onCheckedChange={setShowPdfView} />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            {showPdfView ? (
              <div className="p-4 bg-muted/30">
                {/* Customize Button - responsive placement above PDF */}
                <div className="flex justify-end mb-3 max-w-3xl mx-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" className="h-7 text-xs">
                        Customize
                        <ChevronDown className="w-3 h-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem className="text-xs">Edit Template</DropdownMenuItem>
                      <DropdownMenuItem className="text-xs">Change Template</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="max-w-3xl mx-auto">
                  <div className="bg-white dark:bg-card border rounded-lg shadow-sm p-8 relative overflow-hidden">
                    {/* Open Banner */}
                    {displayCredit.status === "OPEN" && (
                      <div className="absolute left-0 top-0 w-24 h-24 overflow-hidden pointer-events-none z-10">
                        <div className="absolute top-5 -left-6 w-32 bg-primary text-white text-center text-xs font-medium py-1 -rotate-45 shadow">
                          Open
                        </div>
                      </div>
                    )}

                    {/* Document Title */}
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        {/* Company Logo */}
                        <div className="w-32 h-20 bg-primary rounded flex items-center justify-center mb-4">
                          <span className="text-white font-bold text-xl">MEKCO</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <h1 className="text-3xl font-bold text-foreground mb-2">VENDOR CREDITS</h1>
                        <p className="text-sm">CreditNote# {displayCredit.creditNo}</p>
                        <div className="mt-4 text-right">
                          <p className="text-xs text-muted-foreground">Credits Remaining</p>
                          <p className="text-2xl font-bold">${displayCredit.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                    </div>

                    {/* Company Info */}
                    <div className="mb-6">
                      <p className="font-semibold">Mekco Supply Inc.</p>
                      <p className="text-sm text-muted-foreground">16-110 West Beaver Creek Rd.</p>
                      <p className="text-sm text-muted-foreground">Richmond Hill, Ontario L4B 1J9</p>
                    </div>

                    {/* Vendor Address and Details */}
                    <div className="flex justify-between mb-8">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Vendor Address</p>
                        <p className="text-sm text-primary font-medium">{displayCredit.vendor}</p>
                        <p className="text-sm text-muted-foreground">74 Alex Avenue,</p>
                        <p className="text-sm text-muted-foreground">Vaughan</p>
                        <p className="text-sm text-muted-foreground">L4L 5X1 Ontario</p>
                        <p className="text-sm text-muted-foreground">Canada</p>
                      </div>
                      <div className="text-right">
                        <div className="mb-2">
                          <span className="text-sm text-muted-foreground">Date : </span>
                          <span className="text-sm">{displayCredit.date}</span>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Reference number : </span>
                          <span className="text-sm">{displayCredit.refNo}</span>
                        </div>
                      </div>
                    </div>

                    {/* Items Table */}
                    <Table className="mb-6">
                      <TableHeader>
                        <TableRow className="bg-primary">
                          <TableHead className="text-white text-xs py-2 w-10">#</TableHead>
                          <TableHead className="text-white text-xs py-2">Item & Description</TableHead>
                          <TableHead className="text-white text-xs py-2 text-right">Qty</TableHead>
                          <TableHead className="text-white text-xs py-2 text-right">Rate</TableHead>
                          <TableHead className="text-white text-xs py-2 text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="text-xs py-2">1</TableCell>
                          <TableCell className="text-xs py-2">
                            <div>
                              <p className="font-medium">Invoice</p>
                              <p className="text-muted-foreground">100114354</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs py-2 text-right">1</TableCell>
                          <TableCell className="text-xs py-2 text-right">73.91</TableCell>
                          <TableCell className="text-xs py-2 text-right">73.91</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>

                    {/* Totals */}
                    <div className="flex justify-end">
                      <div className="w-64 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Sub Total</span>
                          <span>73.91</span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold border-t pt-2">
                          <span>Total</span>
                          <span>${displayCredit.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold bg-muted/50 p-2 rounded">
                          <span>Credits Remaining</span>
                          <span>${displayCredit.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4">
                {/* Non-PDF Detail View */}
                <div className="space-y-6">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold">Mekco Supply Inc.</p>
                      <p className="text-sm text-muted-foreground">16-110 West Beaver Creek Rd.</p>
                      <p className="text-sm text-muted-foreground">Richmond Hill, Ontario L4B 1J9</p>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Vendor Address</p>
                      <p className="text-sm text-primary font-medium">{displayCredit.vendor}</p>
                      <p className="text-sm text-muted-foreground">74 Alex Avenue,</p>
                      <p className="text-sm text-muted-foreground">Vaughan</p>
                      <p className="text-sm text-muted-foreground">L4L 5X1 Ontario</p>
                      <p className="text-sm text-muted-foreground">Canada</p>
                    </div>
                    <div className="text-right">
                      <div className="mb-2">
                        <span className="text-sm text-muted-foreground">Date : </span>
                        <span className="text-sm">{displayCredit.date}</span>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Reference number : </span>
                        <span className="text-sm">{displayCredit.refNo}</span>
                      </div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-primary">
                        <TableHead className="text-white text-xs py-2 w-10">#</TableHead>
                        <TableHead className="text-white text-xs py-2">Item & Description</TableHead>
                        <TableHead className="text-white text-xs py-2 text-right">Qty</TableHead>
                        <TableHead className="text-white text-xs py-2 text-right">Rate</TableHead>
                        <TableHead className="text-white text-xs py-2 text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="text-xs py-2">1</TableCell>
                        <TableCell className="text-xs py-2">
                          <div>
                            <p className="font-medium">Invoice</p>
                            <p className="text-muted-foreground">100114354</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs py-2 text-right">1</TableCell>
                        <TableCell className="text-xs py-2 text-right">73.91</TableCell>
                        <TableCell className="text-xs py-2 text-right">73.91</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  {/* Totals */}
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Sub Total</span>
                        <span>73.91</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold border-t pt-2">
                        <span>Total</span>
                        <span>${displayCredit.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold bg-muted/50 p-2 rounded">
                        <span>Credits Remaining</span>
                        <span>${displayCredit.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Journal Section */}
            <div className="border-t p-4">
              <div className="flex items-center gap-4 mb-4">
                <h3 className="text-sm font-semibold border-b-2 border-primary pb-1">Journal</h3>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <p className="text-xs text-muted-foreground">Amount is displayed in your base currency</p>
                <span className="text-xs bg-primary text-white px-2 py-0.5 rounded">CAD</span>
              </div>
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2">Vendor Credits</h4>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-[10px] font-medium py-2">ACCOUNT</TableHead>
                      <TableHead className="text-[10px] font-medium py-2 text-right">DEBIT</TableHead>
                      <TableHead className="text-[10px] font-medium py-2 text-right">CREDIT</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-xs py-2">Accounts Payable</TableCell>
                      <TableCell className="text-xs py-2 text-right">73.91</TableCell>
                      <TableCell className="text-xs py-2 text-right">0.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-xs py-2">Cost of Goods Sold</TableCell>
                      <TableCell className="text-xs py-2 text-right">0.00</TableCell>
                      <TableCell className="text-xs py-2 text-right">73.91</TableCell>
                    </TableRow>
                    <TableRow className="font-semibold">
                      <TableCell className="text-xs py-2"></TableCell>
                      <TableCell className="text-xs py-2 text-right">73.91</TableCell>
                      <TableCell className="text-xs py-2 text-right">73.91</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
