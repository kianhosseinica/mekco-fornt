"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { ChevronDown, X, Plus, HelpCircle, Upload, AlertTriangle, Info, Calendar, MoreHorizontal, ArrowUpDown, Import, Download, Settings, RotateCcw, Columns, ChevronRight } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface PaymentReceived {
  date: string
  paymentNumber: string
  reference: string
  customerName: string
  invoiceNumber: string
  mode: string
  amount: number
  unusedAmount: number
  status: string
}

const paymentsReceived: PaymentReceived[] = [
  { date: "Dec 15, 2023", paymentNumber: "154", reference: "2782", customerName: "First Service Residential", invoiceNumber: "INV-000677", mode: "Cheque", amount: 3101.85, unusedAmount: 0.00, status: "PAID" },
  { date: "Nov 27, 2023", paymentNumber: "153", reference: "220000019269", customerName: "First Service Residential", invoiceNumber: "INV-000678", mode: "Cheque", amount: 930.56, unusedAmount: 0.00, status: "PAID" },
  { date: "Aug 30, 2023", paymentNumber: "152", reference: "", customerName: "Canada Lux", invoiceNumber: "INV-000774", mode: "Cheque", amount: 12861.34, unusedAmount: 0.00, status: "PAID" },
  { date: "Aug 30, 2023", paymentNumber: "151", reference: "", customerName: "Canada Lux", invoiceNumber: "INV-000713", mode: "Cheque", amount: 17118.53, unusedAmount: 0.00, status: "PAID" },
  { date: "Aug 30, 2023", paymentNumber: "150", reference: "", customerName: "Canada Lux", invoiceNumber: "INV-000671", mode: "Cheque", amount: 7647.41, unusedAmount: 0.00, status: "PAID" },
  { date: "Aug 04, 2023", paymentNumber: "149", reference: "00000024", customerName: "Canada Lux", invoiceNumber: "INV-000674", mode: "Debit Card", amount: 2404.97, unusedAmount: 0.00, status: "PAID" },
  { date: "Jul 31, 2023", paymentNumber: "148", reference: "00000019", customerName: "Canada Lux", invoiceNumber: "INV-000670", mode: "Debit Card", amount: 3088.93, unusedAmount: 0.00, status: "PAID" },
  { date: "Jun 29, 2023", paymentNumber: "147", reference: "00000014", customerName: "Canada Lux", invoiceNumber: "INV-000669", mode: "Credit Card", amount: 2617.31, unusedAmount: 0.00, status: "PAID" },
  { date: "May 05, 2023", paymentNumber: "146", reference: "P.O. MKRIC-501132", customerName: "Canada Lux", invoiceNumber: "INV-000668", mode: "Cheque", amount: 9116.08, unusedAmount: 0.00, status: "PAID" },
  { date: "Mar 22, 2023", paymentNumber: "145", reference: "2521 (849455)", customerName: "First Service Residential", invoiceNumber: "INV-000666", mode: "Cheque", amount: 3032.92, unusedAmount: 0.00, status: "PAID" },
  { date: "Mar 01, 2023", paymentNumber: "144", reference: "0226", customerName: "Milad", invoiceNumber: "INV-000667", mode: "Cheque", amount: 15800.79, unusedAmount: 0.00, status: "PAID" },
  { date: "Jan 23, 2023", paymentNumber: "143", reference: "Fardi Paid in-person", customerName: "Canada Lux", invoiceNumber: "INV-000665", mode: "Credit Card", amount: 3036.54, unusedAmount: 0.00, status: "PAID" },
  { date: "Oct 22, 2022", paymentNumber: "142", reference: "00000008", customerName: "Canadian Master Plumbing", invoiceNumber: "INV-000346", mode: "Credit Card", amount: 1500.00, unusedAmount: 0.00, status: "PAID" },
]

interface UnpaidInvoice {
  date: string
  dueDate: string
  invoiceNumber: string
  invoiceAmount: number
  amountDue: number
  paymentReceivedOn: string
  payment: number
}

const unpaidInvoices: UnpaidInvoice[] = [
  { date: "Apr 11, 2022", dueDate: "Apr 11, 2022", invoiceNumber: "INV-000195", invoiceAmount: 6214.2, amountDue: 6214.2, paymentReceivedOn: "Jan 23, 2026", payment: 0 },
]

export default function PaymentsReceivedPage() {
  const [showNewForm, setShowNewForm] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState("A Prime Plumbing Ltd.")

  if (showNewForm) {
    return (
      <DashboardLayout activeItem="Sales" activeSubItem="Payments Received">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b bg-background sticky top-0 z-10 shrink-0">
            <h1 className="text-sm font-medium">Record Payment</h1>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowNewForm(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-3 max-w-4xl">
              {/* Info Banner */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded text-xs">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <span>Encourage faster payments, reduce outstanding invoices and improve cash flow by offering discounts to customers who pay within the specified period. </span>
                  <Link href="#" className="text-primary">Enable Early Payment Discount Now</Link>
                </div>
                <Button variant="ghost" size="icon" className="h-5 w-5 -mr-1 -mt-1">
                  <X className="w-3 h-3" />
                </Button>
              </div>

              {/* Customer Name */}
              <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                <Label className="text-xs text-primary">Customer Name*</Label>
                <div className="flex gap-1.5 max-w-md">
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger className="h-7 text-xs flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A Prime Plumbing Ltd." className="text-xs">A Prime Plumbing Ltd.</SelectItem>
                      <SelectItem value="canada-lux" className="text-xs">Canada Lux</SelectItem>
                      <SelectItem value="alpha" className="text-xs">Alpha Canadian Plumbers</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedCustomer && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded text-xs">
                      <span>A Prime Plumbing Ltd...</span>
                      <ChevronDown className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>

              {/* Amount Received */}
              <div className="grid grid-cols-[140px_1fr] items-start gap-3">
                <Label className="text-xs text-primary pt-1.5">Amount Received*</Label>
                <div>
                  <div className="flex max-w-md">
                    <span className="inline-flex items-center px-2 text-xs bg-muted border border-r-0 rounded-l text-muted-foreground shrink-0">CAD</span>
                    <Input className="h-7 text-xs rounded-l-none flex-1" />
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Checkbox className="h-3 w-3" />
                    <span className="text-xs">Received full amount ($6,214.20)</span>
                  </div>
                </div>
              </div>

              {/* Bank Charges */}
              <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                <Label className="text-xs text-muted-foreground">Bank Charges (if any)</Label>
                <Input className="h-7 text-xs max-w-md" />
              </div>

              {/* Payment Date */}
              <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                <Label className="text-xs text-primary">Payment Date*</Label>
                <Input className="h-7 text-xs max-w-md" type="text" defaultValue="Jan 23, 2026" />
              </div>

              {/* Payment # */}
              <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                <Label className="text-xs text-primary">Payment #*</Label>
                <div className="flex items-center gap-1.5 max-w-md">
                  <Input className="h-7 text-xs flex-1" defaultValue="155" />
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                    <Settings className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Payment Mode */}
              <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                <Label className="text-xs text-muted-foreground">Payment Mode</Label>
                <Select defaultValue="cheque">
                  <SelectTrigger className="h-7 text-xs max-w-md"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cheque" className="text-xs">Cheque</SelectItem>
                    <SelectItem value="cash" className="text-xs">Cash</SelectItem>
                    <SelectItem value="bank" className="text-xs">Bank Transfer</SelectItem>
                    <SelectItem value="card" className="text-xs">Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Deposit To */}
              <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                <Label className="text-xs text-primary">Deposit To*</Label>
                <Select defaultValue="td">
                  <SelectTrigger className="h-7 text-xs max-w-md"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="td" className="text-xs">TD CAD</SelectItem>
                    <SelectItem value="petty" className="text-xs">Petty Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reference# */}
              <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                <Label className="text-xs text-muted-foreground">Reference#</Label>
                <Input className="h-7 text-xs max-w-md" />
              </div>

              {/* Unpaid Invoices Table */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xs font-medium">Unpaid Invoices</h3>
                    <Button variant="outline" size="sm" className="h-6 text-[10px] bg-transparent">
                      <Calendar className="w-3 h-3 mr-1" />
                      Filter by Date Range
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">Clear Applied Amount</Button>
                </div>
                
                <div className="border rounded overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-[10px] font-medium py-1.5 px-3">DATE</TableHead>
                        <TableHead className="text-[10px] font-medium py-1.5 px-3">INVOICE NUMBER</TableHead>
                        <TableHead className="text-[10px] font-medium py-1.5 px-3 text-right">INVOICE AMOUNT</TableHead>
                        <TableHead className="text-[10px] font-medium py-1.5 px-3 text-right">AMOUNT DUE</TableHead>
                        <TableHead className="text-[10px] font-medium py-1.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">PAYMENT RECEIVED ON <HelpCircle className="w-3 h-3" /></div>
                        </TableHead>
                        <TableHead className="text-[10px] font-medium py-1.5 px-3 text-right">PAYMENT</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unpaidInvoices.map((inv, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="py-2 px-3">
                            <div className="text-xs">{inv.date}</div>
                            <div className="text-[10px] text-muted-foreground">Due Date: {inv.dueDate}</div>
                          </TableCell>
                          <TableCell className="py-2 px-3 text-xs">{inv.invoiceNumber}</TableCell>
                          <TableCell className="py-2 px-3 text-xs text-right">{inv.invoiceAmount.toLocaleString()}</TableCell>
                          <TableCell className="py-2 px-3 text-xs text-right">{inv.amountDue.toLocaleString()}</TableCell>
                          <TableCell className="py-2 px-3">
                            <Input className="h-7 text-xs text-center w-32 mx-auto" defaultValue={inv.paymentReceivedOn} />
                          </TableCell>
                          <TableCell className="py-2 px-3">
                            <div className="flex flex-col items-end gap-1">
                              <Input className="h-7 text-xs text-right w-24" defaultValue={inv.payment.toString()} />
                              <Link href="#" className="text-[10px] text-primary">Pay in Full</Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-[10px] text-muted-foreground">**List contains only SENT invoices</p>

                {/* Total */}
                <div className="flex justify-end">
                  <div className="flex items-center gap-8 text-xs">
                    <span className="font-medium">Total</span>
                    <span>0.00</span>
                  </div>
                </div>
              </div>

              {/* Amount Summary */}
              <div className="flex justify-end mt-4">
                <div className="w-72 space-y-1.5 border rounded p-3 bg-muted/20">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Amount Received :</span>
                    <span>0.00</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Amount used for Payments :</span>
                    <span>0.00</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Amount Refunded :</span>
                    <span>0.00</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1.5 border-t">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <AlertTriangle className="w-3 h-3 text-orange-500" />
                      Amount in Excess:
                    </span>
                    <span>$ 0.00</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mt-4">
                <Label className="text-xs text-muted-foreground mb-1.5 block">Notes (Internal use. Not visible to customer)</Label>
                <Textarea className="text-xs min-h-[80px] resize-y" />
              </div>

              {/* Attachments */}
              <div className="mt-4">
                <Label className="text-xs text-muted-foreground mb-1.5 block">Attachments</Label>
                <Button variant="outline" size="sm" className="h-7 text-xs bg-transparent">
                  <Upload className="w-3 h-3 mr-1.5" />
                  Upload File
                  <ChevronDown className="w-3 h-3 ml-1.5" />
                </Button>
                <p className="text-[10px] text-muted-foreground mt-1">You can upload a maximum of 5 files, 5MB each</p>
              </div>

              {/* Send Thank You Note */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <Checkbox className="h-3 w-3" />
                <span className="text-xs">Send a &quot;Thank you&quot; note for this payment</span>
              </div>

              {/* Additional Fields Note */}
              <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
                <span className="font-medium">Additional Fields:</span> Start adding custom fields for your payments received by going to{" "}
                <span className="text-primary">Settings</span> ➔{" "}
                <span className="text-primary">Sales</span> ➔{" "}
                <span className="text-primary">Payments Received</span>.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 px-4 py-2 border-t bg-background shrink-0">
            <Button className="bg-primary hover:bg-primary/90 h-7 text-xs">Save</Button>
            <Button variant="ghost" className="h-7 text-xs" onClick={() => setShowNewForm(false)}>Cancel</Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeItem="Sales" activeSubItem="Payments Received">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-medium">All Received Payments</h1>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button className="bg-primary hover:bg-primary/90 h-8 text-xs px-3" onClick={() => setShowNewForm(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              New
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-7 w-7 bg-transparent">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2"><ArrowUpDown className="w-3.5 h-3.5" />Sort by</div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2"><Import className="w-3.5 h-3.5" />Import</div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2"><Download className="w-3.5 h-3.5" />Export</div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2 text-xs"><Settings className="w-3.5 h-3.5" />Preferences</DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 text-xs"><RotateCcw className="w-3.5 h-3.5" />Refresh List</DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 text-xs"><Columns className="w-3.5 h-3.5" />Reset Column Width</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-8 py-1.5 px-2"><Checkbox className="h-3 w-3" /></TableHead>
                <TableHead className="text-[10px] font-medium py-1.5 px-2">DATE</TableHead>
                <TableHead className="text-[10px] font-medium py-1.5 px-2">PAYMENT #</TableHead>
                <TableHead className="text-[10px] font-medium py-1.5 px-2">REFERENCE NUMBER</TableHead>
                <TableHead className="text-[10px] font-medium py-1.5 px-2">CUSTOMER NAME</TableHead>
                <TableHead className="text-[10px] font-medium py-1.5 px-2">INVOICE#</TableHead>
                <TableHead className="text-[10px] font-medium py-1.5 px-2">MODE</TableHead>
                <TableHead className="text-[10px] font-medium py-1.5 px-2 text-right">AMOUNT</TableHead>
                <TableHead className="text-[10px] font-medium py-1.5 px-2 text-right">UNUSED AMOUNT</TableHead>
                <TableHead className="text-[10px] font-medium py-1.5 px-2">STATUS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentsReceived.map((payment, idx) => (
                <TableRow key={idx} className="hover:bg-muted/30">
                  <TableCell className="py-1.5 px-2"><Checkbox className="h-3 w-3" /></TableCell>
                  <TableCell className="py-1.5 px-2 text-xs">{payment.date}</TableCell>
                  <TableCell className="py-1.5 px-2">
                    <Link href="#" className="text-xs text-primary hover:underline">{payment.paymentNumber}</Link>
                  </TableCell>
                  <TableCell className="py-1.5 px-2 text-xs text-muted-foreground">{payment.reference}</TableCell>
                  <TableCell className="py-1.5 px-2 text-xs">{payment.customerName}</TableCell>
                  <TableCell className="py-1.5 px-2">
                    <Link href="#" className="text-xs text-primary hover:underline">{payment.invoiceNumber}</Link>
                  </TableCell>
                  <TableCell className="py-1.5 px-2 text-xs">{payment.mode}</TableCell>
                  <TableCell className="py-1.5 px-2 text-xs text-right">${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell className="py-1.5 px-2 text-xs text-right">${payment.unusedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell className="py-1.5 px-2">
                    <span className="text-[10px] font-medium text-green-600">{payment.status}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  )
}
