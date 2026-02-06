"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X, Upload, Info, AlertTriangle, ChevronRight } from "lucide-react"

interface RecordPaymentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RecordPaymentForm({ open, onOpenChange }: RecordPaymentFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState("A Prime Plumbing Ltd.")
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Record Payment</DialogTitle>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        {/* Info Banner */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-start gap-2 text-sm">
          <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            Encourage faster payments, reduce outstanding invoices and improve cash flow by offering discounts to customers who pay within the specified period.{" "}
            <Button variant="link" className="text-primary p-0 h-auto">Enable Early Payment Discount Now</Button>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4 mt-4">
          {/* Customer Name */}
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <Label className="text-destructive">Customer Name*</Label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A Prime Plumbing Ltd.">A Prime Plumbing Ltd.</SelectItem>
                  <SelectItem value="Alpha Plumbing">Alpha Plumbing</SelectItem>
                  <SelectItem value="BMF Plumbing">BMF Plumbing Ltd</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="mt-6 bg-primary text-primary-foreground">
              {selectedCustomer}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Amount Received */}
          <div className="space-y-2">
            <Label className="text-destructive">Amount Received*</Label>
            <div className="flex gap-2">
              <span className="flex items-center px-3 bg-muted text-muted-foreground text-sm rounded-l-md border border-r-0">CAD</span>
              <Input className="rounded-l-none" />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="full-amount" />
              <Label htmlFor="full-amount" className="font-normal text-sm">
                Received full amount ($6,214.20)
              </Label>
            </div>
          </div>

          {/* Bank Charges */}
          <div className="space-y-2">
            <Label>Bank Charges (if any)</Label>
            <Input />
          </div>

          {/* Payment Date and Number */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-destructive">Payment Date*</Label>
              <Input type="date" defaultValue="2026-01-23" />
            </div>
            <div className="space-y-2">
              <Label className="text-destructive">Payment #*</Label>
              <div className="flex gap-2">
                <Input defaultValue="155" />
                <Button variant="ghost" size="icon">
                  <Info className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Payment Mode and Deposit To */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Payment Mode</Label>
              <Select defaultValue="cheque">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                  <SelectItem value="credit-card">Credit Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-destructive">Deposit To*</Label>
              <Select defaultValue="td-cad">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="td-cad">TD CAD</SelectItem>
                  <SelectItem value="td-usd">TD USD</SelectItem>
                  <SelectItem value="petty-cash">Petty Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reference */}
          <div className="space-y-2">
            <Label>Reference#</Label>
            <Input />
          </div>

          {/* Unpaid Invoices Table */}
          <div className="border rounded-lg">
            <div className="flex items-center justify-between p-3 border-b bg-muted/50">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Unpaid Invoices</h3>
                <Button variant="ghost" size="sm" className="gap-1 text-sm">
                  <span>Filter by Date Range</span>
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </Button>
              </div>
              <Button variant="link" className="text-primary">Clear Applied Amount</Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left p-3 font-medium">DATE</th>
                    <th className="text-left p-3 font-medium">INVOICE NUMBER</th>
                    <th className="text-right p-3 font-medium">INVOICE AMOUNT</th>
                    <th className="text-right p-3 font-medium">AMOUNT DUE</th>
                    <th className="text-center p-3 font-medium">PAYMENT RECEIVED ON</th>
                    <th className="text-right p-3 font-medium">PAYMENT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3">
                      <div>Apr 11, 2022</div>
                      <div className="text-xs text-muted-foreground">Due Date: Apr 11, 2022</div>
                    </td>
                    <td className="p-3 text-primary">INV-000195</td>
                    <td className="p-3 text-right">6,214.2</td>
                    <td className="p-3 text-right">6,214.2</td>
                    <td className="p-3 text-center">
                      <Input type="date" defaultValue="2026-01-23" className="w-36 mx-auto" />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-2">
                        <Input className="w-20 text-right" defaultValue="0" />
                        <Button variant="link" className="text-primary p-0">Pay in Full</Button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t text-xs text-muted-foreground">
              **List contains only SENT invoices
            </div>

            <div className="p-3 border-t flex justify-end">
              <div className="text-right">
                <span className="font-medium">Total</span>
                <span className="ml-8">0.00</span>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2 text-sm">
              <div className="flex justify-between py-1">
                <span>Amount Received :</span>
                <span>0.00</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Amount used for Payments :</span>
                <span>0.00</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Amount Refunded :</span>
                <span>0.00</span>
              </div>
              <div className="flex justify-between py-1 text-destructive">
                <div className="flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Amount in Excess:</span>
                </div>
                <span>$ 0.00</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (Internal use. Not visible to customer)</Label>
            <Textarea />
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label>Attachments</Label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              You can upload a maximum of 5 files, 5MB each
            </p>
          </div>

          {/* Thank you note */}
          <div className="flex items-center gap-2">
            <Checkbox id="thank-you" />
            <Label htmlFor="thank-you" className="font-normal text-sm">
              Send a "Thank you" note for this payment
            </Label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t">
          <Button className="bg-primary hover:bg-primary/90">Save</Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
