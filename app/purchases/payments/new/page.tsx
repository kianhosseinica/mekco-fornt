"use client"

  import { useState, useRef } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { X, Settings, ChevronDown, ChevronRight, HelpCircle, AlertTriangle, Upload, Paperclip, Trash2 } from "lucide-react"
import Link from "next/link"

const unpaidBills = [
  { date: "Jan 12, 2026", dueDate: "Feb 11, 2026", billNo: "461893", poNo: "MKRIC-502604", billAmount: 11087.33, amountDue: 11087.33 },
]

export default function NewPaymentPage() {
  const [selectedVendor, setSelectedVendor] = useState("+osb")
  const [payFullAmount, setPayFullAmount] = useState(false)
  const [bills, setBills] = useState(unpaidBills.map(b => ({ ...b, paymentMadeOn: "Jan 28, 2026", payment: 0 })))
  
  // Attachments state
  const attachmentFileInputRef = useRef<HTMLInputElement>(null)
  const [attachments, setAttachments] = useState<File[]>([])

  const totalPayment = bills.reduce((sum, bill) => sum + bill.payment, 0)
  const totalAmountDue = bills.reduce((sum, bill) => sum + bill.amountDue, 0)

  const updatePayment = (index: number, value: number) => {
    const newBills = [...bills]
    newBills[index].payment = value
    setBills(newBills)
  }

  const payInFull = (index: number) => {
    const newBills = [...bills]
    newBills[index].payment = newBills[index].amountDue
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
            <h1 className="text-lg font-semibold">Record Payment</h1>
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
                <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                  <SelectTrigger className="h-9 max-w-md">
                    <SelectValue placeholder="Select a vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+osb">+osb</SelectItem>
                    <SelectItem value="bow">Bow</SelectItem>
                    <SelectItem value="watts">WATTS</SelectItem>
                    <SelectItem value="oatey">Oatey</SelectItem>
                  </SelectContent>
                </Select>
                {selectedVendor && (
                  <Button variant="default" size="sm" className="h-9 text-xs gap-1 shrink-0">
                    {selectedVendor}&apos;s Details
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Payment # */}
            <div className="flex items-center gap-4">
              <Label className="text-sm text-primary w-40 shrink-0">Payment #*</Label>
              <div className="flex items-center gap-2 max-w-md">
                <Input className="h-9 flex-1" defaultValue="2222" />
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* Payment Made */}
            <div className="flex items-start gap-4">
              <Label className="text-sm text-primary w-40 shrink-0 pt-2">Payment Made*</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm bg-muted border border-r-0 rounded-l-md">CAD</span>
                    <Input className="h-9 w-32 rounded-l-none" placeholder="0.00" />
                  </div>
                  <Label className="text-sm text-muted-foreground">Bank Charges (if any)</Label>
                  <Input className="h-9 w-24" placeholder="0" />
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="payFull" 
                    checked={payFullAmount} 
                    onCheckedChange={(checked) => setPayFullAmount(checked as boolean)} 
                  />
                  <Label htmlFor="payFull" className="text-sm cursor-pointer">
                    Pay full amount (${totalAmountDue.toLocaleString('en-US', { minimumFractionDigits: 2 })})
                  </Label>
                </div>
              </div>
            </div>

            {/* Payment Date */}
            <div className="flex items-center gap-4">
              <Label className="text-sm text-primary w-40 shrink-0">Payment Date*</Label>
              <Input className="h-9 max-w-md" type="text" defaultValue="Jan 28, 2026" />
            </div>

            {/* Payment Mode */}
            <div className="flex items-center gap-4">
              <Label className="text-sm w-40 shrink-0">Payment Mode</Label>
              <Select defaultValue="cheque">
                <SelectTrigger className="h-9 max-w-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
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
                    <TableHead className="text-[10px] font-medium py-2 px-3 w-[120px]">Date</TableHead>
                    <TableHead className="text-[10px] font-medium py-2 px-3 w-[80px]">Bill#</TableHead>
                    <TableHead className="text-[10px] font-medium py-2 px-3 w-[120px]">PO#</TableHead>
                    <TableHead className="text-[10px] font-medium py-2 px-3 text-right w-[100px]">Bill Amount</TableHead>
                    <TableHead className="text-[10px] font-medium py-2 px-3 text-right w-[100px]">Amount Due</TableHead>
                    <TableHead className="text-[10px] font-medium py-2 px-3 w-[140px]">
                      <div className="flex items-center gap-1">
                        <span className="whitespace-nowrap">Payment Made on</span>
                        <HelpCircle className="w-3 h-3 shrink-0" />
                      </div>
                    </TableHead>
                    <TableHead className="text-[10px] font-medium py-2 px-3 text-right w-[120px]">Payment</TableHead>
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
                          className="h-8 text-xs w-full" 
                          defaultValue={bill.paymentMadeOn}
                        />
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <div className="flex flex-col items-end gap-1">
                          <Input 
                            className="h-8 text-xs text-right w-full" 
                            value={bill.payment}
                            onChange={(e) => updatePayment(idx, Number(e.target.value) || 0)}
                          />
                          <Button 
                            variant="link" 
                            className="text-primary text-[10px] p-0 h-auto"
                            onClick={() => payInFull(idx)}
                          >
                            Pay in Full
                          </Button>
                        </div>
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
                <span className="font-medium w-24 text-right">{totalPayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Summary Box */}
            <div className="flex justify-end">
              <div className="border rounded-lg p-4 w-80 space-y-2 bg-muted/20">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <span>0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount used for Payments:</span>
                  <span>0.00</span>
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
              <input
                type="file"
                ref={attachmentFileInputRef}
                className="hidden"
                multiple
                onChange={(e) => {
                  const files = e.target.files ? Array.from(e.target.files) : []
                  if (files.length > 0) {
                    setAttachments((prev) => [...prev, ...files].slice(0, 5))
                  }
                  e.target.value = ""
                }}
              />
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 text-xs gap-1 bg-transparent"
                  onClick={() => attachmentFileInputRef.current?.click()}
                  disabled={attachments.length >= 5}
                >
                  <Paperclip className="w-3 h-3" />
                  Attach Files
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">You can upload a maximum of 5 files, 10MB each</p>
              {attachments.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {attachments.map((file, idx) => (
                    <li key={idx} className="flex items-center justify-between gap-2 text-xs bg-muted/30 rounded px-2 py-1 max-w-md">
                      <span className="truncate flex-1">
                        <Paperclip className="w-3 h-3 inline mr-1" />
                        {file.name}
                      </span>
                      <span className="text-muted-foreground shrink-0">
                        {(file.size / 1024).toFixed(0)} KB
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-destructive hover:text-destructive shrink-0"
                        onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
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
          <Button variant="outline" size="sm" className="h-9 text-xs px-4 bg-transparent">Save as Draft</Button>
          <Button size="sm" className="h-9 text-xs px-4 bg-primary">Save as Paid</Button>
          <Link href="/purchases/payments">
            <Button variant="ghost" size="sm" className="h-9 text-xs px-4">Cancel</Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
