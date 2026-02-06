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
import { Plus, X, ChevronDown, ChevronRight, MoreHorizontal, Pencil, Mail, FileText, Paperclip, SortAsc, Download, Upload, Settings, RefreshCw, AlertTriangle } from "lucide-react"
import Link from "next/link"

const payments = [
  { id: 1, vendor: "Edison (Seagul Group)", paymentNo: "2223", date: "Jan 27, 2026", mode: "Bank Transfer", status: "PAID", amount: 6613.49, bills: ["PI-P20260127"], reference: "30%-PI-P202..." },
  { id: 2, vendor: "Westlake Canada Inc.", paymentNo: "2222", date: "Jan 27, 2026", mode: "Bank Transfer", status: "PAID", amount: 11517.06, bills: ["721-860794"] },
  { id: 3, vendor: "Bow", paymentNo: "2220", date: "Jan 27, 2026", mode: "Bank Transfer", status: "PAID", amount: 11230.77, bills: ["870051", "870218", "870052", "870139"] },
  { id: 4, vendor: "HONG KONG HAILIANG METAL TRADING LIMITED", paymentNo: "2221", date: "Jan 26, 2026", mode: "Bank Transfer", status: "PAID", amount: 23602.56, bills: ["26HLHK02E700"] },
  { id: 5, vendor: "ICMA Spa", paymentNo: "2218", date: "Jan 22, 2026", mode: "Bank Transfer", status: "PAID", amount: 20327.04, bills: ["I020004673"], currency: "EUR", reference: "30%-Deposit" },
  { id: 6, vendor: "Reliance Worldwide Corporation (RWC)", paymentNo: "2217", date: "Jan 20, 2026", mode: "Bank Transfer", status: "PAID", amount: 5548.20, bills: ["502650"] },
  { id: 7, vendor: "Westlake Canada Inc.", paymentNo: "2216", date: "Jan 20, 2026", mode: "Bank Transfer", status: "PAID", amount: 17935.72, bills: ["721-857952", "721-857665", "721-858999", "721-858191", "721-859402"] },
  { id: 8, vendor: "Dahl", paymentNo: "2215", date: "Jan 14, 2026", mode: "Cheque", status: "PAID", amount: 4964.37, bills: ["108128", "108686"], reference: "2764" },
  { id: 9, vendor: "WATTS", paymentNo: "2214", date: "Jan 14, 2026", mode: "Cheque", status: "PAID", amount: 20848.82, bills: ["I1858260", "I1857910", "I1856981", "I1858637", "I1856862"], reference: "2769" },
  { id: 10, vendor: "Oatey", paymentNo: "2213", date: "Jan 14, 2026", mode: "Cheque", status: "PAID", amount: 4119.44, bills: ["60588702", "60588850", "60577673", "60590163"], reference: "2770" },
  { id: 11, vendor: "LynCar", paymentNo: "2212", date: "Jan 14, 2026", mode: "Cheque", status: "PAID", amount: 1586.66, bills: ["3231156-00"], reference: "2767" },
  { id: 12, vendor: "Grundfos", paymentNo: "2211", date: "Jan 14, 2026", mode: "Cheque", status: "PAID", amount: 9618.11, bills: ["3600520290"], reference: "2766" },
  { id: 13, vendor: "Franklin Electric", paymentNo: "2210", date: "Jan 14, 2026", mode: "Cheque", status: "PAID", amount: 4339.20, bills: ["5945151 RI"], reference: "2765" },
  { id: 14, vendor: "CB Supply", paymentNo: "2209", date: "Jan 14, 2026", mode: "Cheque", status: "PAID", amount: 18846.96, bills: ["2157596"], reference: "2763" },
  { id: 15, vendor: "Bow", paymentNo: "2208", date: "Jan 13, 2026", mode: "Bank Transfer", status: "PAID", amount: 16614.88, bills: ["869925"] },
  { id: 16, vendor: "ICPH", paymentNo: "2219", date: "Jan 09, 2026", mode: "Credit Card", status: "PAID", amount: 2604.65, bills: ["300003267"] },
  { id: 17, vendor: "Welke Global Logistics ( USD )", paymentNo: "2207", date: "Jan 07, 2026", mode: "Cheque", status: "PAID", amount: 985.00, bills: ["S00019745/A", "S00019762"], reference: "000161" },
  { id: 18, vendor: "Welke Customs Brokers ( CAD )", paymentNo: "2206", date: "Jan 07, 2026", mode: "Cheque", status: "PAID", amount: 388.74, bills: ["S00019745", "S00019762/A"], reference: "2762" },
  { id: 19, vendor: "SMS", paymentNo: "2205", date: "Jan 07, 2026", mode: "Cheque", status: "PAID", amount: 8862.49, bills: ["196501"], reference: "2761" },
]

const journalEntries = [
  { payment: "870051", entries: [{ account: "Accounts Payable", debit: 244.83, credit: 0 }, { account: "Prepaid Expenses", debit: 0, credit: 244.83 }] },
  { payment: "870052", entries: [{ account: "Prepaid Expenses", debit: 0, credit: 440.41 }, { account: "Accounts Payable", debit: 440.41, credit: 0 }] },
  { payment: "870139", entries: [{ account: "Accounts Payable", debit: 488.22, credit: 0 }, { account: "Prepaid Expenses", debit: 0, credit: 488.22 }] },
  { payment: "870218", entries: [{ account: "Accounts Payable", debit: 10057.31, credit: 0 }, { account: "Prepaid Expenses", debit: 0, credit: 10057.31 }] },
]

const paymentForBills = [
  { billNumber: "870051", billDate: "Dec 18, 2025", billAmount: 244.83, paymentAmount: 244.83 },
  { billNumber: "870052", billDate: "Dec 18, 2025", billAmount: 440.41, paymentAmount: 440.41 },
  { billNumber: "870139", billDate: "Dec 23, 2025", billAmount: 488.22, paymentAmount: 488.22 },
  { billNumber: "870218", billDate: "Dec 24, 2025", billAmount: 10057.31, paymentAmount: 10057.31 },
]

export default function PaymentsMadePage() {
  const [selectedPayment, setSelectedPayment] = useState<typeof payments[0] | null>(null)
  const [showPdfView, setShowPdfView] = useState(true)
  const [viewMode, setViewMode] = useState<"split" | "table">("table")

  // Table view (full width)
  if (viewMode === "table") {
    return (
      <DashboardLayout activeItem="Purchases" activeSubItem="Payments Made">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">All Payments</h1>
              <ChevronDown className="w-4 h-4 text-muted-foreground cursor-pointer" onClick={() => setViewMode("split")} />
            </div>
            <div className="flex items-center gap-2">
              <Link href="/purchases/payments/new">
                <Button size="sm" className="h-8 text-xs gap-1">
                  <Plus className="w-3 h-3" />
                  New
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-xs gap-2">
                    <SortAsc className="w-3 h-3" /> Sort by
                    <ChevronRight className="w-3 h-3 ml-auto" />
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs gap-2">
                    <Download className="w-3 h-3" /> Import
                    <ChevronRight className="w-3 h-3 ml-auto" />
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs gap-2">
                    <Upload className="w-3 h-3" /> Export
                    <ChevronRight className="w-3 h-3 ml-auto" />
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs gap-2">
                    <Settings className="w-3 h-3" /> Preferences
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs gap-2">
                    <RefreshCw className="w-3 h-3" /> Refresh List
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Full Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-background">
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="px-3 py-3 w-[40px]"><Checkbox /></th>
                  <th className="px-3 py-3 text-left font-medium w-[100px]">DATE</th>
                  <th className="px-3 py-3 text-left font-medium w-[100px]">PAYMENT #</th>
                  <th className="px-3 py-3 text-left font-medium w-[120px]">REFERENCE#</th>
                  <th className="px-3 py-3 text-left font-medium w-[180px]">VENDOR NAME</th>
                  <th className="px-3 py-3 text-left font-medium">BILL#</th>
                  <th className="px-3 py-3 text-left font-medium w-[110px]">MODE</th>
                  <th className="px-3 py-3 text-left font-medium w-[80px]">STATUS</th>
                  <th className="px-3 py-3 text-right font-medium w-[110px]">AMOUNT</th>
                  <th className="px-3 py-3 text-right font-medium w-[90px]">UNUSED</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr 
                    key={payment.id} 
                    className="border-b hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => { setSelectedPayment(payment); setViewMode("split") }}
                  >
                    <td className="px-3 py-3"><Checkbox onClick={(e) => e.stopPropagation()} /></td>
                    <td className="px-3 py-3 text-sm">{payment.date}</td>
                    <td className="px-3 py-3">
                      <span className="text-sm text-primary hover:underline">{payment.paymentNo}</span>
                    </td>
                    <td className="px-3 py-3 text-sm">{payment.reference || ""}</td>
                    <td className="px-3 py-3 text-sm">{payment.vendor}</td>
                    <td className="px-3 py-3 text-sm truncate max-w-[300px]">{payment.bills.join(",")}</td>
                    <td className="px-3 py-3 text-sm">{payment.mode}</td>
                    <td className="px-3 py-3">
                      <span className="text-sm text-green-600 font-medium">{payment.status}</span>
                    </td>
                    <td className="px-3 py-3 text-sm text-right">
                      {payment.currency === "EUR" ? "€" : "$"}{payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-3 text-sm text-right"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Get active payment for split view
  const activePayment = selectedPayment || payments[0]

  return (
    <DashboardLayout activeItem="Purchases" activeSubItem="Payments Made">
      <div className="flex h-full">
        {/* Left Panel - Payment List */}
        <div className="w-[340px] border-r flex flex-col bg-background">
          {/* Header */}
          <div className="p-3 border-b">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-sm">All Payments</h2>
                <ChevronDown className="w-4 h-4 text-muted-foreground cursor-pointer" onClick={() => setViewMode("table")} />
              </div>
              <div className="flex items-center gap-1">
                <Link href="/purchases/payments/new">
                  <Button size="icon" className="h-7 w-7">
                    <Plus className="w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Payment List */}
          <div className="flex-1 overflow-auto">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className={`p-3 border-b cursor-pointer hover:bg-muted/50 ${activePayment?.id === payment.id ? "bg-muted/50" : ""}`}
                onClick={() => setSelectedPayment(payment)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <Checkbox className="mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{payment.vendor}</p>
                      <p className="text-xs text-muted-foreground">{payment.date} - {payment.mode}</p>
                      <span className="text-xs text-green-600 font-medium">{payment.status}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {payment.currency === "EUR" ? "€" : "$"}{payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <Paperclip className="w-3 h-3 text-muted-foreground ml-auto mt-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Payment Detail */}
        <div className="flex-1 flex flex-col bg-muted/20 overflow-hidden">
          {/* Detail Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-background border-b">
            <h2 className="font-semibold">{activePayment.paymentNo}</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Paperclip className="w-3 h-3" />
                1
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b bg-background">
            <Link href={`/purchases/payments/${activePayment.id}/edit`}>
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
                <DropdownMenuItem className="text-xs">PDF</DropdownMenuItem>
                <DropdownMenuItem className="text-xs">Print</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            {/* PDF Toggle */}
            <div className="flex items-center justify-end gap-2 mb-4">
              <span className="text-sm">Show PDF View</span>
              <Switch checked={showPdfView} onCheckedChange={setShowPdfView} />
            </div>

            {showPdfView ? (
              /* PDF Preview */
              <div className="bg-white border rounded-lg shadow-sm max-w-3xl mx-auto relative overflow-hidden">
                {/* Paid Banner */}
                <div className="absolute left-0 top-0 w-24 h-24 overflow-hidden pointer-events-none z-10">
                  <div className="absolute top-5 -left-6 w-32 bg-primary text-white text-center text-xs font-medium py-1 -rotate-45 shadow">
                    Paid
                  </div>
                </div>

                <div className="p-8">
                  {/* Company Header */}
                  <div className="flex items-start gap-6 mb-8">
                    <div className="w-24 h-24 bg-primary rounded flex items-center justify-center">
                      <span className="text-white font-bold text-lg">MEKCO</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Mekco Supply Inc.</h2>
                      <p className="text-sm text-muted-foreground">16-110 West Beaver Creek Rd.</p>
                      <p className="text-sm text-muted-foreground">Richmond Hill, Ontario L4B 1J9</p>
                    </div>
                  </div>

                  {/* PAYMENTS MADE Title */}
                  <h1 className="text-center text-xl font-semibold tracking-wide mb-8">PAYMENTS MADE</h1>

                  {/* Payment Info */}
                  <div className="flex justify-between mb-8">
                    <div className="space-y-2 text-sm">
                      <div className="flex gap-8">
                        <span className="text-muted-foreground w-32">Payment#</span>
                        <span className="font-medium">{activePayment.paymentNo}</span>
                      </div>
                      <div className="flex gap-8">
                        <span className="text-muted-foreground w-32">Payment Date</span>
                        <span>{activePayment.date}</span>
                      </div>
                      <div className="flex gap-8">
                        <span className="text-muted-foreground w-32">Reference Number</span>
                        <span>{activePayment.reference || "-"}</span>
                      </div>
                      <div className="flex gap-8">
                        <span className="text-muted-foreground w-32">Paid To</span>
                        <span className="text-primary">{activePayment.vendor}</span>
                      </div>
                      <div className="flex gap-8">
                        <span className="text-muted-foreground w-32">Payment Mode</span>
                        <span className="font-medium">{activePayment.mode}</span>
                      </div>
                      <div className="flex gap-8">
                        <span className="text-muted-foreground w-32">Paid Through</span>
                        <span className="text-primary">TD CAD</span>
                      </div>
                    </div>
                    <div className="bg-primary text-white rounded-lg p-4 text-center min-w-[140px]">
                      <p className="text-xs opacity-80">Amount Paid</p>
                      <p className="text-xl font-bold">${activePayment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>

                  {/* Paid To Address */}
                  <div className="mb-8">
                    <p className="text-sm text-muted-foreground mb-2">Paid To</p>
                    <p className="font-medium">{activePayment.vendor}</p>
                    <p className="text-sm text-muted-foreground">5700 Cote De Liesse</p>
                    <p className="text-sm text-muted-foreground">Montreal</p>
                    <p className="text-sm text-muted-foreground">H4T 1B1 Quebec</p>
                  </div>

                  {/* Payment for Table */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-4">Payment for</h3>
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="text-xs py-2">Bill Number</TableHead>
                          <TableHead className="text-xs py-2">Bill Date</TableHead>
                          <TableHead className="text-xs py-2 text-right">Bill Amount</TableHead>
                          <TableHead className="text-xs py-2 text-right">Payment Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentForBills.map((bill, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="text-xs py-2 text-primary">{bill.billNumber}</TableCell>
                            <TableCell className="text-xs py-2">{bill.billDate}</TableCell>
                            <TableCell className="text-xs py-2 text-right">${bill.billAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                            <TableCell className="text-xs py-2 text-right">${bill.paymentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Journal Section */}
            <div className="mt-6 bg-white border rounded-lg p-4 max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h3 className="font-semibold border-b-2 border-primary pb-1">Journal</h3>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Amount is displayed in your base currency</span>
                  <span className="bg-primary text-white px-2 py-0.5 rounded text-[10px]">CAD</span>
                  <div className="flex border rounded overflow-hidden ml-2">
                    <button className="px-2 py-1 text-xs bg-muted">Accrual</button>
                    <button className="px-2 py-1 text-xs">Cash</button>
                  </div>
                </div>
              </div>

              {/* Vendor Payment */}
              <div className="mb-6">
                <h4 className="font-medium text-sm mb-3">Vendor Payment - {activePayment.paymentNo}</h4>
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
                      <TableCell className="text-xs py-2">Prepaid Expenses</TableCell>
                      <TableCell className="text-xs py-2 text-right">{activePayment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-xs py-2 text-right">0.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-xs py-2">TD CAD</TableCell>
                      <TableCell className="text-xs py-2 text-right">0.00</TableCell>
                      <TableCell className="text-xs py-2 text-right">{activePayment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                    <TableRow className="font-medium">
                      <TableCell className="text-xs py-2"></TableCell>
                      <TableCell className="text-xs py-2 text-right">{activePayment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-xs py-2 text-right">{activePayment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Payments Made Entries */}
              {journalEntries.map((entry, idx) => (
                <div key={idx} className="mb-6">
                  <h4 className="font-medium text-sm mb-3">Payments Made - {entry.payment}</h4>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-[10px] font-medium py-2">ACCOUNT</TableHead>
                        <TableHead className="text-[10px] font-medium py-2 text-right">DEBIT</TableHead>
                        <TableHead className="text-[10px] font-medium py-2 text-right">CREDIT</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entry.entries.map((e, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs py-2">{e.account}</TableCell>
                          <TableCell className="text-xs py-2 text-right">{e.debit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-xs py-2 text-right">{e.credit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-medium">
                        <TableCell className="text-xs py-2"></TableCell>
                        <TableCell className="text-xs py-2 text-right">{entry.entries.reduce((s, e) => s + e.debit, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-xs py-2 text-right">{entry.entries.reduce((s, e) => s + e.credit, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
