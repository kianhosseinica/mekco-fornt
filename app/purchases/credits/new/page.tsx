"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { X, Search, Settings, ChevronDown, HelpCircle, MoreVertical, Plus, Upload, DollarSign, ImageIcon } from "lucide-react"

interface LineItem {
  id: number
  itemName: string
  itemSku: string
  itemNotes: string
  account: string
  reorderQty: string
  quantity: number
  rate: number
  tax: string
  amount: number
}

export default function NewVendorCreditsPage() {
  const router = useRouter()
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: 1, itemName: "", itemSku: "", itemNotes: "", account: "", reorderQty: "", quantity: 1, rate: 0, tax: "", amount: 0 }
  ])

  const addLineItem = () => {
    setLineItems([...lineItems, {
      id: lineItems.length + 1,
      itemName: "",
      itemSku: "",
      itemNotes: "",
      account: "",
      reorderQty: "",
      quantity: 1,
      rate: 0,
      tax: "",
      amount: 0
    }])
  }

  const removeLineItem = (id: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id))
    }
  }

  const updateLineItem = (id: number, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        if (field === 'quantity' || field === 'rate') {
          updated.amount = updated.quantity * updated.rate
        }
        return updated
      }
      return item
    }))
  }

  const calculateSubTotal = () => lineItems.reduce((sum, item) => sum + item.amount, 0)
  const calculateTotal = () => calculateSubTotal()

  return (
    <DashboardLayout activeItem="Purchases" activeSubItem="Vendor Credits">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-semibold">New Vendor Credits</h1>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push('/purchases/credits')}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <div className="space-y-4">
            {/* Vendor Name */}
            <div className="grid grid-cols-[180px_1fr] items-center gap-4">
              <Label className="text-sm text-destructive">Vendor Name*</Label>
              <div className="flex gap-2 max-w-md">
                <Select>
                  <SelectTrigger className="h-9 flex-1">
                    <SelectValue placeholder="Select a Vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oatey">Oatey</SelectItem>
                    <SelectItem value="watts">WATTS</SelectItem>
                    <SelectItem value="bow">Bow</SelectItem>
                    <SelectItem value="reliance">Reliance Worldwide Corporation (RWC)</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="icon" className="h-9 w-9 shrink-0">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Credit Note# */}
            <div className="grid grid-cols-[180px_1fr] items-center gap-4">
              <Label className="text-sm text-destructive">Credit Note#*</Label>
              <div className="flex items-center gap-2 max-w-md">
                <Input className="h-9 flex-1" placeholder="" />
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* Order Number */}
            <div className="grid grid-cols-[180px_1fr] items-center gap-4">
              <Label className="text-sm">Order Number</Label>
              <Input className="h-9 max-w-md" />
            </div>

            {/* Vendor Credit Date */}
            <div className="grid grid-cols-[180px_1fr] items-center gap-4">
              <Label className="text-sm">Vendor Credit Date</Label>
              <Input className="h-9 max-w-md" type="text" defaultValue="Jan 28, 2026" />
            </div>

            {/* Accounts Payable */}
            <div className="grid grid-cols-[180px_1fr] items-center gap-4">
              <Label className="text-sm flex items-center gap-1">
                Accounts Payable
                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
              </Label>
              <Select defaultValue="accounts-payable">
                <SelectTrigger className="h-9 max-w-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accounts-payable">Accounts Payable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tax Settings */}
            <div className="flex items-center gap-6 mt-6 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <Select defaultValue="exclusive">
                  <SelectTrigger className="w-36 h-8 border-dashed">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exclusive">Tax Exclusive</SelectItem>
                    <SelectItem value="inclusive">Tax Inclusive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
                <Select defaultValue="transaction">
                  <SelectTrigger className="w-44 h-8 border-dashed">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transaction">At Transaction Level</SelectItem>
                    <SelectItem value="line">At Line Item Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Item Table */}
            <div className="mt-6 border rounded-lg bg-card">
              <div className="flex items-center justify-between p-3 border-b">
                <h3 className="text-sm font-medium">Item Table</h3>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                  <HelpCircle className="w-3 h-3 mr-1" />
                  Bulk Actions
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-8 py-2 px-2"></TableHead>
                      <TableHead className="text-[10px] font-medium py-2 px-2 min-w-[250px]">ITEM DETAILS</TableHead>
                      <TableHead className="text-[10px] font-medium py-2 px-2 w-[140px]">ACCOUNT</TableHead>
                      <TableHead className="text-[10px] font-medium py-2 px-2 text-center w-[90px]">REORDER QTY</TableHead>
                      <TableHead className="text-[10px] font-medium py-2 px-2 text-center w-[80px]">QUANTITY</TableHead>
                      <TableHead className="text-[10px] font-medium py-2 px-2 text-center w-[80px]">
                        <div className="flex items-center justify-center gap-1">RATE <HelpCircle className="w-3 h-3" /></div>
                      </TableHead>
                      <TableHead className="text-[10px] font-medium py-2 px-2 w-[100px]">TAX</TableHead>
                      <TableHead className="text-[10px] font-medium py-2 px-2 text-right w-[80px]">AMOUNT</TableHead>
                      <TableHead className="w-16 py-2 px-2"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="py-2 px-2 align-top">
                          <MoreVertical className="w-3 h-3 text-muted-foreground mt-2" />
                        </TableCell>
                        <TableCell className="py-2 px-2 align-top">
                          <div className="flex items-start gap-2">
                            <div className="w-10 h-10 border rounded bg-muted/50 flex items-center justify-center shrink-0">
                              <ImageIcon className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <Input
                                className="h-8 text-sm"
                                placeholder="Type or click to select an item."
                                value={item.itemName}
                                onChange={(e) => updateLineItem(item.id, 'itemName', e.target.value)}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2 px-2 align-top">
                          <Select value={item.account} onValueChange={(val) => updateLineItem(item.id, 'account', val)}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select an account" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cogs">Cost of Goods Sold</SelectItem>
                              <SelectItem value="inventory">Inventory Asset</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="py-2 px-2 align-top text-center"></TableCell>
                        <TableCell className="py-2 px-2 align-top">
                          <Input
                            className="h-8 text-xs text-center"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, 'quantity', Number(e.target.value) || 0)}
                          />
                        </TableCell>
                        <TableCell className="py-2 px-2 align-top">
                          <Input
                            className="h-8 text-xs text-center"
                            value={item.rate}
                            onChange={(e) => updateLineItem(item.id, 'rate', Number(e.target.value) || 0)}
                          />
                        </TableCell>
                        <TableCell className="py-2 px-2 align-top">
                          <Select value={item.tax} onValueChange={(val) => updateLineItem(item.id, 'tax', val)}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select a Tax" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hst">HST 13%</SelectItem>
                              <SelectItem value="gst">GST 5%</SelectItem>
                              <SelectItem value="none">No Tax</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="py-2 px-2 text-right align-top">
                          <span className="text-sm">{item.amount.toFixed(2)}</span>
                        </TableCell>
                        <TableCell className="py-2 px-2 align-top">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeLineItem(item.id)}>
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Add Row Buttons */}
              <div className="flex items-center gap-4 p-3 border-t">
                <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary" onClick={addLineItem}>
                  <Plus className="w-3 h-3 mr-1" />
                  Add New Row
                </Button>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                  <Plus className="w-3 h-3 mr-1" />
                  Add Items in Bulk
                </Button>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end mt-4">
              <div className="w-[320px] border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Sub Total</span>
                  <span className="font-semibold tabular-nums">{calculateSubTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Discount</span>
                  <div className="flex items-center gap-2">
                    <Input className="w-16 h-8 text-right" defaultValue="0" />
                    <Select defaultValue="%">
                      <SelectTrigger className="w-14 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="%">%</SelectItem>
                        <SelectItem value="$">$</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="w-16 text-right tabular-nums">0.00</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <Input placeholder="Adjustment" className="w-24 h-8" />
                  <div className="flex items-center gap-2">
                    <Input className="w-16 h-8 text-right" defaultValue="0" />
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="w-16 text-right tabular-nums">0.00</span>
                  </div>
                </div>
                <div className="flex justify-between items-center font-bold border-t pt-3">
                  <span>Total</span>
                  <span className="tabular-nums">{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notes and Attachments */}
            <div className="grid grid-cols-2 gap-8 mt-6">
              <div>
                <Label className="text-sm mb-2 block">Notes</Label>
                <Textarea className="min-h-[100px]" placeholder="" />
              </div>
              <div>
                <Label className="text-sm mb-2 block">Attach File(s) to Vendor Credits</Label>
                <Button variant="outline" size="sm" className="h-9 bg-transparent">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                  <ChevronDown className="w-3 h-3 ml-2" />
                </Button>
                <p className="text-xs text-muted-foreground mt-2">You can upload a maximum of 5 files, 10MB each</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t bg-background">
          <Button variant="outline" size="sm" className="bg-transparent">Save as Draft</Button>
          <Button size="sm" className="bg-primary">Save as Open</Button>
          <Button variant="outline" size="sm" className="bg-transparent" onClick={() => router.push('/purchases/credits')}>Cancel</Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
