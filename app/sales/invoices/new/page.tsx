"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { X, Settings, Search, Plus, Upload, ImageIcon, HelpCircle, RefreshCw, Scan } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Loading from "./loading"

interface LineItem {
  id: number
  itemName: string
  reorderQty: string
  quantity: string
  rate: string
  discount: string
  tax: string
  amount: number
}

const createEmptyItem = (id: number): LineItem => ({
  id,
  itemName: "",
  reorderQty: "",
  quantity: "1.00",
  rate: "0.00",
  discount: "0",
  tax: "",
  amount: 0
})

export default function NewInvoicePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [lineItems, setLineItems] = useState<LineItem[]>([createEmptyItem(1)])

  const addNewRow = () => {
    const newId = lineItems.length > 0 ? Math.max(...lineItems.map(item => item.id)) + 1 : 1
    setLineItems([...lineItems, createEmptyItem(newId)])
  }

  const removeRow = (id: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id))
    }
  }

  const updateLineItem = (id: number, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        if (field === 'quantity' || field === 'rate' || field === 'discount') {
          const qty = parseFloat(updated.quantity) || 0
          const rate = parseFloat(updated.rate) || 0
          const discount = parseFloat(updated.discount) || 0
          updated.amount = qty * rate * (1 - discount / 100)
        }
        return updated
      }
      return item
    }))
  }

  const calculateSubTotal = () => lineItems.reduce((sum, item) => sum + item.amount, 0)

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">📄</span>
              <h1 className="text-xl font-semibold text-foreground">New Invoice</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2 bg-transparent">
                <RefreshCw className="w-4 h-4" />
                CoCreate Agent
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Customer Name */}
            <div className="space-y-2">
              <Label className="text-destructive">Customer Name*</Label>
              <div className="flex gap-2">
                <Select>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select or add a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer1">Customer 1</SelectItem>
                    <SelectItem value="customer2">Customer 2</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="icon" className="bg-primary">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Invoice# */}
              <div className="space-y-2">
                <Label className="text-destructive">Invoice#*</Label>
                <div className="flex gap-2">
                  <Input defaultValue="INV-000680" className="flex-1" />
                  <Button variant="ghost" size="icon">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Order Number */}
              <div className="space-y-2">
                <Label>Order Number</Label>
                <Input placeholder="" />
              </div>

              {/* Invoice Date */}
              <div className="space-y-2">
                <Label className="text-destructive">Invoice Date*</Label>
                <Input type="date" defaultValue="2026-01-23" />
              </div>

              {/* Terms and Due Date */}
              <div className="flex gap-4">
                <div className="space-y-2 flex-1">
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
                <div className="space-y-2 flex-1">
                  <Label>Due Date</Label>
                  <Input type="date" defaultValue="2026-01-23" />
                </div>
              </div>

              {/* Accounts Receivable */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Accounts Receivable
                  <HelpCircle className="w-3 h-3 text-muted-foreground" />
                </Label>
                <Select defaultValue="ar">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">Accounts Receivable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Salesperson */}
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
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                Subject
                <HelpCircle className="w-3 h-3 text-muted-foreground" />
              </Label>
              <Textarea
                placeholder="Let your customer know what this Invoice is for"
                rows={2}
              />
            </div>

            {/* Item Table */}
            <div className="border rounded-lg">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-medium">Item Table</h3>
                <div className="flex gap-2">
                  <Button variant="link" className="text-primary gap-1">
                    <Scan className="w-4 h-4" />
                    Scan Item
                  </Button>
                  <Button variant="link" className="text-primary gap-1">
                    <RefreshCw className="w-4 h-4" />
                    Bulk Actions
                  </Button>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">ITEM DETAILS</TableHead>
                    <TableHead>REORDER QTY</TableHead>
                    <TableHead>QUANTITY</TableHead>
                    <TableHead>RATE <HelpCircle className="w-3 h-3 inline" /></TableHead>
                    <TableHead>DISCOUNT</TableHead>
                    <TableHead>TAX <HelpCircle className="w-3 h-3 inline" /></TableHead>
                    <TableHead className="text-right">AMOUNT</TableHead>
                    <TableHead className="w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-8 h-8 text-muted-foreground shrink-0" />
                          <Input
                            className="flex-1"
                            placeholder="Type or click to select an item."
                            value={item.itemName}
                            onChange={(e) => updateLineItem(item.id, 'itemName', e.target.value)}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          className="w-20"
                          value={item.reorderQty}
                          onChange={(e) => updateLineItem(item.id, 'reorderQty', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.quantity}
                          className="w-20"
                          onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.rate}
                          className="w-20"
                          onChange={(e) => updateLineItem(item.id, 'rate', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Input
                            value={item.discount}
                            className="w-12"
                            onChange={(e) => updateLineItem(item.id, 'discount', e.target.value)}
                          />
                          <span>%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={item.tax}
                          onValueChange={(val) => updateLineItem(item.id, 'tax', val)}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue placeholder="Select a Tax" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hst">HST 13%</SelectItem>
                            <SelectItem value="gst">GST 5%</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">{item.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => removeRow(item.id)}
                          disabled={lineItems.length === 1}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-4 flex flex-wrap gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-primary bg-transparent"
                  onClick={addNewRow}
                >
                  <Plus className="w-4 h-4" />
                  Add New Row
                </Button>
                <Button variant="outline" size="sm" className="gap-1 text-primary bg-transparent">
                  <Plus className="w-4 h-4" />
                  Add Items in Bulk
                </Button>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-80 space-y-2">
                <div className="flex justify-between py-2">
                  <span>Sub Total</span>
                  <span>{calculateSubTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div>
                    <span>Shipping Charges</span>
                    <Button variant="link" className="text-primary p-0 h-auto ml-2 text-xs">
                      Configure Account
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input className="w-24" />
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    <span>0.00</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <Input placeholder="Adjustment" className="w-32" />
                  <div className="flex items-center gap-2">
                    <Input className="w-24" />
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    <span>0.00</span>
                  </div>
                </div>
                <div className="flex justify-between py-2 font-semibold border-t pt-4">
                  <span>Total ( $ )</span>
                  <span>0.00</span>
                </div>
              </div>
            </div>

            {/* Customer Notes */}
            <div className="space-y-2">
              <Label>Customer Notes</Label>
              <Textarea
                defaultValue="Thanks for your business."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">Will be displayed on the invoice</p>
            </div>

            {/* Terms & Conditions and Attachments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Terms & Conditions</Label>
                <Textarea
                  placeholder="Enter the terms and conditions of your business to be displayed in your transaction"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Attach File(s) to Invoice</Label>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Upload className="w-4 h-4" />
                  Upload File
                </Button>
                <p className="text-xs text-muted-foreground">
                  You can upload a maximum of 10 files, 10MB each
                </p>
              </div>
            </div>

            {/* Payment Gateway */}
            <div className="flex items-center gap-2 text-sm">
              <span>Select an online payment option to get paid faster</span>
              <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs">VISA</span>
              <Button variant="link" className="text-primary p-0 h-auto">
                Payment Gateway
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <div className="flex items-center gap-3">
              <Button variant="outline">Save as Draft</Button>
              <div className="flex">
                <Button className="bg-primary hover:bg-primary/90 rounded-r-none">
                  Save and Send
                </Button>
                <Button className="bg-primary hover:bg-primary/90 rounded-l-none border-l border-primary-foreground/20 px-2">
                  ▼
                </Button>
              </div>
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
            <div className="text-right text-sm">
              <p className="font-medium">Total Amount: $ 0.00</p>
              <p className="text-muted-foreground">Total Quantity: 0</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export const dynamic = "force-dynamic"
