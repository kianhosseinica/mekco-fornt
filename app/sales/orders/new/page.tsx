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
import { X, Settings, Search, Plus, Upload, ImageIcon, HelpCircle, RefreshCw } from "lucide-react"
import { useSearchParams } from "next/navigation"
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

export default function NewSalesOrderPage() {
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
              <span className="text-muted-foreground">📋</span>
              <h1 className="text-xl font-semibold text-foreground">New Sales Order</h1>
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
              {/* Sales Order# */}
              <div className="space-y-2">
                <Label className="text-destructive">Sales Order#*</Label>
                <div className="flex gap-2">
                  <Input defaultValue="QT-01012" className="flex-1" />
                  <Button variant="ghost" size="icon">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Reference# */}
              <div className="space-y-2">
                <Label>Reference#</Label>
                <Input placeholder="" />
              </div>

              {/* Sales Order Date */}
              <div className="space-y-2">
                <Label className="text-destructive">Sales Order Date*</Label>
                <Input type="date" defaultValue="2026-01-23" />
              </div>

              {/* Expected Shipment Date */}
              <div className="space-y-2">
                <Label>Expected Shipment Date</Label>
                <Input type="date" placeholder="MMM dd, yyyy" />
              </div>

              {/* Payment Terms */}
              <div className="space-y-2">
                <Label>Payment Terms</Label>
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

              {/* Delivery Method */}
              <div className="space-y-2">
                <Label>Delivery Method</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a delivery method or type to add" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Shipping</SelectItem>
                    <SelectItem value="express">Express Shipping</SelectItem>
                    <SelectItem value="pickup">Pickup</SelectItem>
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

              {/* Validity & Lead time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Validity</Label>
                  <Input placeholder="" />
                </div>
                <div className="space-y-2">
                  <Label>Lead time</Label>
                  <Input placeholder="" />
                </div>
              </div>
            </div>

            {/* Item Table */}
            <div className="border rounded-lg">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-medium">Item Table</h3>
                <Button variant="link" className="text-primary gap-1">
                  <RefreshCw className="w-4 h-4" />
                  Bulk Actions
                </Button>
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
                  {lineItems.map(item => (
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
                      <TableCell><Input value={item.reorderQty} onChange={e => updateLineItem(item.id, 'reorderQty', e.target.value)} className="w-20" /></TableCell>
                      <TableCell><Input value={item.quantity} onChange={e => updateLineItem(item.id, 'quantity', e.target.value)} defaultValue="1.00" className="w-20" /></TableCell>
                      <TableCell><Input value={item.rate} onChange={e => updateLineItem(item.id, 'rate', e.target.value)} defaultValue="0.00" className="w-20" /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Input value={item.discount} onChange={e => updateLineItem(item.id, 'discount', e.target.value)} defaultValue="0" className="w-12" />
                          <span>%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select>
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
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeRow(item.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-4 flex gap-4">
                <Button variant="outline" size="sm" className="gap-1 text-primary bg-transparent" onClick={addNewRow}>
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
                  <span>Shipping Charges</span>
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
                  <span>{calculateSubTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Customer Notes */}
            <div className="space-y-2">
              <Label>Customer Notes</Label>
              <Textarea
                placeholder="Enter any notes to be displayed in your transaction"
                rows={3}
              />
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
                <Label>Attach File(s) to Sales Order</Label>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Upload className="w-4 h-4" />
                  Upload File
                </Button>
                <p className="text-xs text-muted-foreground">
                  You can upload a maximum of 10 files, 5MB each
                </p>
              </div>
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
              <p className="font-medium">Total Amount: $ {calculateSubTotal().toFixed(2)}</p>
              <p className="text-muted-foreground">Total Quantity: {lineItems.reduce((sum, item) => sum + parseFloat(item.quantity) || 0, 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
