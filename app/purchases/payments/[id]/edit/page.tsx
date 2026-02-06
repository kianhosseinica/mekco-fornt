"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { X, Settings, ChevronDown, ChevronRight, HelpCircle, AlertTriangle, Upload, Paperclip } from "lucide-react"
import Link from "next/link"

const billsData = [
  { date: "Dec 18, 2025", dueDate: "Dec 18, 2025", billNo: "870051", poNo: "MKRIC-502571", billAmount: 244.83, amountDue: 244.83, paymentMadeOn: "Jan 27, 2026", payment: 244.83 },
  { date: "Dec 18, 2025", dueDate: "Dec 18, 2025", billNo: "870052", poNo: "MKRIC-502591", billAmount: 440.41, amountDue: 440.41, paymentMadeOn: "Jan 27, 2026", payment: 440.41 },
  { date: "Dec 23, 2025", dueDate: "Dec 23, 2025", billNo: "870139", poNo: "MKRIC-502591", billAmount: 488.22, amountDue: 488.22, paymentMadeOn: "Jan 27, 2026", payment: 488.22 },
  { date: "Dec 24, 2025", dueDate: "Dec 24, 2025", billNo: "870218", poNo: "MKRIC-502624", billAmount: 10057.31, amountDue: 10057.31, paymentMadeOn: "Jan 27, 2026", payment: 10057.31 },
  { date: "Jan 06, 2026", dueDate: "Jan 06, 2026", billNo: "870397", poNo: "MKRIC-502636", billAmount: 17942.21, amountDue: 17942.21, paymentMadeOn: "Jan 27, 2026", payment: 0 },
  { date: "Jan 07, 2026", dueDate: "Jan 07, 2026", billNo: "870437", poNo: "MKRIC-502643", billAmount: 6866.8, amountDue: 6866.8, paymentMadeOn: "Jan 27, 2026", payment: 0 },
  { date: "Jan 13, 2026", dueDate: "Jan 13, 2026", billNo: "870597", poNo: "MKRIC-502550", billAmount: 176.13, amountDue: 176.13, paymentMadeOn: "Jan 27, 2026", payment: 0 },
  { date: "Jan 16, 2026", dueDate: "Jan 16, 2026", billNo: "870708", poNo: "MKRIC-502624", billAmount: 571.84, amountDue: 571.84, paymentMadeOn: "Jan 27, 2026", payment: 0 },
  { date: "Jan 19, 2026", dueDate: "Jan 19, 2026", billNo: "870733", poNo: "MKRIC-502645", billAmount: 11366.54, amountDue: 11366.54, paymentMadeOn: "Jan 27, 2026", payment: 0 },
  { date: "Jan 23, 2026", dueDate: "Jan 23, 2026", billNo: "870921", poNo: "MKRIC-502653", billAmount: 6807.01, amountDue: 6807.01, paymentMadeOn: "Jan 27, 2026", payment: 0 },
]

export default function EditPaymentPage() {
  const params = useParams()
  const [bills, setBills] = useState(billsData)
  
  const totalPaid = bills.reduce((sum, bill) => sum + bill.payment, 0)
  const amountUsedForPayments = bills.filter(b => b.payment > 0).reduce((sum, bill) => sum + bill.payment, 0)

  const updatePayment = (index: number, value: number) => {
    const newBills = [...bills]
    newBills[index].payment = value
    setBills(newBills)
  }

  return (
    <DashboardLayout activeItem="Purchases" activeSubItem="Payments Made">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <span className="text-lg">$</span>
            </div>
            <h1 className="text-lg font-semibold">Edit Payment</h1>
          </div>
          <Link href="/purchases/payments">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <div className="space-y-4">
            {/* Vendor Name */}
            <div className="flex items-center gap-4">
              <Label className="text-sm text-primary w-40 shrink-0">Vendor Name*</Label>
              <div className="flex items-center gap-3 flex-1">
                <Input className="h-9 max-w-md" defaultValue="Bow" readOnly />
                <Button variant="default" size="sm" className="h-9 text-xs gap-1 shrink-0">
                  Bow&apos;s Details
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Payment # */}
            <div className="flex items-center gap-4">
              <Label className="text-sm text-primary w-40 shrink-0">Payment #*</Label>
              <div className="flex items-center gap-2 max-w-md">
                <Input className="h-9 flex-1" defaultValue="2220" />
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* Payment Made */}
            <div className="flex items-center gap-4">
              <Label className="text-sm text-primary w-40 shrink-0">Payment Made*</Label>
              <div className="flex items-center gap-4">
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-sm bg-muted border border-r-0 rounded-l-md">CAD</span>
                  <Input className="h-9 w-32 rounded-l-none" defaultValue="11230.77" />
                </div>
                <Label className="text-sm text-muted-foreground">Bank Charges (if any)</Label>
                <Input className="h-9 w-24" defaultValue="0" />
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            {/* Payment Date */}
            <div className="flex items-center gap-4">
              <Label className="text-sm text-primary w-40 shrink-0">Payment Date*</Label>
              <Input className="h-9 max-w-md" type="text" defaultValue="Jan 27, 2026" />
            </div>

            {/* Payment Mode */}
            <div className="flex items-center gap-4">
              <Label className="text-sm w-40 shrink-0">Payment Mode</Label>
              <Select defaultValue="bank">
                <SelectTrigger className="h-9 max-w-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="card">Credit Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Paid Through */}
            <div className="flex items-center gap-4">
              <Label className="text-sm text-primary w-40 shrink-0">Paid Through*</Label>
              <Select defaultValue="td">
                <SelectTrigger className="h-9 max-w-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="td">TD CAD</SelectItem>
                  <SelectItem value="rbc">RBC CAD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reference# */}
            <div className="flex items-center gap-4">
              <Label className="text-sm w-40 shrink-0">Reference#</Label>
              <Input className="h-9 max-w-md" />
            </div>

            {/* Clear Applied Amount */}
            <div className="flex justify-end pt-4">
              <Button variant="link" className="text-primary text-xs p-0 h-auto">
                Clear Applied Amount
              </Button>
            </div>

            {/* Bills Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-[10px] font-medium py-2 px-3">Date</TableHead>
                    <TableHead className="text-[10px] font-medium py-2 px-3">Bill#</TableHead>
                    <TableHead className="text-[10px] font-medium py-2 px-3">PO#</TableHead>
                    <TableHead className="text-[10px] font-medium py-2 px-3 text-right">Bill Amount</TableHead>
                    <TableHead className="text-[10px] font-medium py-2 px-3 text-right">Amount Due</TableHead>
                    <TableHead className="text-[10px] font-medium py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        Payment Made on
                        <HelpCircle className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-[10px] font-medium py-2 px-3 text-right">Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.map((bill, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="py-2 px-3">
                        <div className="text-xs">{bill.date}</div>
                        <div className="text-[10px] text-muted-foreground">Due Date: {bill.dueDate}</div>
                      </TableCell>
                      <TableCell className="py-2 px-3 text-xs">{bill.billNo}</TableCell>
                      <TableCell className="py-2 px-3 text-xs">{bill.poNo}</TableCell>
                      <TableCell className="py-2 px-3 text-xs text-right">{bill.billAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="py-2 px-3 text-xs text-right">{bill.amountDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="py-2 px-3">
                        <Input 
                          className="h-8 text-xs text-center w-28 mx-auto" 
                          defaultValue={bill.paymentMadeOn}
                        />
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <Input 
                          className="h-8 text-xs text-right w-24 ml-auto" 
                          value={bill.payment}
                          onChange={(e) => updatePayment(idx, Number(e.target.value) || 0)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Total */}
            <div className="flex justify-end">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">Total :</span>
                <span className="font-medium w-24 text-right">{totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Summary Box */}
            <div className="flex justify-end">
              <div className="border rounded-lg p-4 w-80 space-y-2 bg-muted/20">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <span>{totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount used for Payments:</span>
                  <span>{amountUsedForPayments.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Refunded:</span>
                  <span>0.00</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    Amount in Excess:
                  </span>
                  <span>$ 0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bank Charges :</span>
                  <span>$ 0.00</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="pt-4">
              <Label className="text-sm text-muted-foreground mb-2 block">Notes (Internal use. Not visible to vendor)</Label>
              <Textarea className="text-sm min-h-[100px]" />
            </div>

            {/* Attachments */}
            <div className="pt-4">
              <Label className="text-sm text-muted-foreground mb-2 block">Attachments</Label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="h-9 text-xs gap-1 bg-transparent">
                  <Upload className="w-3 h-3" />
                  Upload File
                  <ChevronDown className="w-3 h-3" />
                </Button>
                <div className="flex items-center gap-1 bg-primary text-white rounded-full px-2 py-1">
                  <Paperclip className="w-3 h-3" />
                  <span className="text-xs">1</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">You can upload a maximum of 5 files, 10MB each</p>
            </div>

            {/* Additional Fields */}
            <div className="pt-4 text-sm">
              <span className="font-medium">Additional Fields:</span>{" "}
              <span className="text-muted-foreground">Start adding custom fields for your payments made by going to </span>
              <Link href="#" className="text-primary">Settings</Link>
              <span className="text-muted-foreground"> &gt; </span>
              <Link href="#" className="text-primary">Purchases</Link>
              <span className="text-muted-foreground"> &gt; </span>
              <Link href="#" className="text-primary">Payments Made</Link>.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-6 py-4 border-t bg-background">
          <Button size="sm" className="h-9 text-xs px-4">Save</Button>
          <Link href="/purchases/payments">
            <Button variant="outline" size="sm" className="h-9 text-xs px-4 bg-transparent">Cancel</Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
