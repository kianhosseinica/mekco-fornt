"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { X, Search, Sparkles, Settings, ChevronDown, ScanLine, LayoutList, Upload, CreditCard } from "lucide-react"

interface NewInvoiceFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewInvoiceForm({ open, onOpenChange }: NewInvoiceFormProps) {
  const [items, setItems] = useState([
    { id: 1, details: "", reorderQty: "", quantity: "1.00", rate: "0.00", discount: "0", tax: "", amount: "0.00" }
  ])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">📄</span>
            <DialogTitle>New Invoice</DialogTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Sparkles className="w-4 h-4" />
              CoCreate Agent
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Customer Name */}
          <div className="space-y-2">
            <Label className="text-destructive">Customer Name*</Label>
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select or add a customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer1">Alpha Plumbing</SelectItem>
                  <SelectItem value="customer2">BMF Plumbing Ltd</SelectItem>
                </SelectContent>
              </Select>
              <Button size="icon" className="bg-primary">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Invoice Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-destructive">Invoice#*</Label>
              <div className="flex gap-2">
                <Input defaultValue="INV-000680" className="flex-1" />
                <Button variant="ghost" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Order Number</Label>
              <Input />
            </div>

            <div className="space-y-2">
              <Label className="text-destructive">Invoice Date*</Label>
              <Input type="date" defaultValue="2026-01-23" />
            </div>

            <div className="space-y-2">
              <Label>Terms</Label>
              <Select defaultValue="due-on-receipt">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="due-on-receipt">Due on Receipt</SelectItem>
                  <SelectItem value="net-15">Net 15</SelectItem>
                  <SelectItem value="net-30">Net 30</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" defaultValue="2026-01-23" />
            </div>

            <div className="space-y-2">
              <Label>Accounts Receivable</Label>
              <Select defaultValue="ar">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">Accounts Receivable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Salesperson</Label>
              <Select defaultValue="mekco">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mekco">Mekco Supply</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subject</Label>
              <Input placeholder="Let your customer know what this Invoice is for" />
            </div>
          </div>

          {/* Item Table */}
          <div className="border rounded-lg">
            <div className="flex items-center justify-between p-3 border-b bg-muted/50">
              <h3 className="font-medium">Item Table</h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ScanLine className="w-4 h-4" />
                  Scan Item
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <LayoutList className="w-4 h-4" />
                  Bulk Actions
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left p-3 font-medium">ITEM DETAILS</th>
                    <th className="text-left p-3 font-medium">REORDER QTY</th>
                    <th className="text-left p-3 font-medium">QUANTITY</th>
                    <th className="text-left p-3 font-medium">RATE</th>
                    <th className="text-left p-3 font-medium">DISCOUNT</th>
                    <th className="text-left p-3 font-medium">TAX</th>
                    <th className="text-right p-3 font-medium">AMOUNT</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">📦</span>
                          <Input placeholder="Type or click to select an item." className="border-0 shadow-none" />
                        </div>
                      </td>
                      <td className="p-3">
                        <Input className="w-20" />
                      </td>
                      <td className="p-3">
                        <Input defaultValue={item.quantity} className="w-20" />
                      </td>
                      <td className="p-3">
                        <Input defaultValue={item.rate} className="w-24" />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Input defaultValue={item.discount} className="w-16" />
                          <span className="text-muted-foreground">%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Select>
                          <SelectTrigger className="w-28">
                            <SelectValue placeholder="Select a Tax" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hst">HST (13%)</SelectItem>
                            <SelectItem value="gst">GST (5%)</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3 text-right">{item.amount}</td>
                      <td className="p-3">
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <X className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t flex items-center gap-4">
              <Button variant="link" className="text-primary p-0 gap-1">
                <span className="text-lg">+</span> Add New Row
              </Button>
              <Button variant="link" className="text-primary p-0 gap-1">
                <span className="text-lg">+</span> Add Items in Bulk
              </Button>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-80 space-y-2">
              <div className="flex justify-between py-2">
                <span>Sub Total</span>
                <span>0.00</span>
              </div>
              <div className="flex justify-between py-2 items-center">
                <span>Shipping Charges</span>
                <div className="flex items-center gap-2">
                  <Input className="w-24 text-right" />
                  <span>0.00</span>
                </div>
              </div>
              <div className="text-xs text-primary cursor-pointer">Configure Account</div>
              <div className="flex justify-between py-2 items-center">
                <Input defaultValue="Adjustment" className="w-28" />
                <div className="flex items-center gap-2">
                  <Input className="w-24 text-right" />
                  <span>0.00</span>
                </div>
              </div>
              <div className="flex justify-between py-3 border-t font-semibold text-lg">
                <span>Total ( $ )</span>
                <span>0.00</span>
              </div>
            </div>
          </div>

          {/* Notes and Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Customer Notes</Label>
              <Textarea defaultValue="Thanks for your business." />
              <p className="text-xs text-muted-foreground">Will be displayed on the invoice</p>
            </div>

            <div className="space-y-2">
              <Label>Terms & Conditions</Label>
              <Textarea placeholder="Enter the terms and conditions of your business to be displayed in your transaction" />
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label>Attach File(s) to Invoice</Label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              You can upload a maximum of 10 files, 10MB each
            </p>
          </div>

          {/* Payment Option */}
          <div className="flex items-center gap-2 text-sm">
            <span>Select an online payment option to get paid faster</span>
            <CreditCard className="w-4 h-4 text-red-500" />
            <CreditCard className="w-4 h-4 text-blue-500" />
            <Button variant="link" className="text-primary p-0">Payment Gateway</Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Button variant="outline">Save as Draft</Button>
            <div className="flex">
              <Button className="bg-primary hover:bg-primary/90 rounded-r-none">Save and Send</Button>
              <Button className="bg-primary hover:bg-primary/90 rounded-l-none border-l border-primary-foreground/20 px-2">
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
          <div className="text-right text-sm">
            <div>Total Amount: <strong>$ 0.00</strong></div>
            <div className="text-muted-foreground">Total Quantity: 0</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
