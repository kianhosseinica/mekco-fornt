"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
import { 
  X, Settings, Search, Pencil, Plus, ChevronDown, MoreVertical, 
  HelpCircle, Upload, RefreshCw, ImageIcon, Lock
} from "lucide-react"

export default function NewPurchaseOrderPage() {
  const router = useRouter()
  const [addressType, setAddressType] = useState("organization")
  const [itemRows, setItemRows] = useState([
    { id: 1, itemDetails: "", account: "", reorderQty: "", quantity: "1.00", rate: "0.00", tax: "", amount: "0.00" }
  ])

  const addNewRow = () => {
    setItemRows([...itemRows, {
      id: itemRows.length + 1,
      itemDetails: "",
      account: "",
      reorderQty: "",
      quantity: "1.00",
      rate: "0.00",
      tax: "",
      amount: "0.00"
    }])
  }

  const removeRow = (id: number) => {
    if (itemRows.length > 1) {
      setItemRows(itemRows.filter(row => row.id !== id))
    }
  }

  return (
    <DashboardLayout activeItem="Purchases" activeSubItem="Purchase Orders">
      <div className="flex-1 overflow-auto bg-background">
        <div className="w-full px-6 py-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-muted-foreground" />
              <h1 className="text-xl font-semibold text-foreground">New Purchase Order</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-5">
            {/* Vendor Name */}
            <div className="flex items-start gap-4">
              <Label className="w-40 text-sm pt-2.5 text-destructive shrink-0">Vendor Name*</Label>
              <div className="flex items-center gap-2 flex-1">
                <Select>
                  <SelectTrigger className="max-w-md">
                    <SelectValue placeholder="Select a Vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global-xpress">Global Xpress</SelectItem>
                    <SelectItem value="apollo">Apollo Valves</SelectItem>
                    <SelectItem value="bow">Bow</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="icon" className="h-9 w-9 bg-primary hover:bg-primary/90 shrink-0">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="flex items-start gap-4">
              <Label className="w-40 text-sm pt-2.5 text-destructive shrink-0">Delivery Address*</Label>
              <div className="flex-1 space-y-3">
                <RadioGroup value={addressType} onValueChange={setAddressType} className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="organization" id="organization" />
                    <Label htmlFor="organization" className="text-sm font-normal">Organization</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="customer" id="customer" />
                    <Label htmlFor="customer" className="text-sm font-normal">Customer</Label>
                  </div>
                </RadioGroup>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Mekco Supply</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Pencil className="w-3 h-3" />
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground space-y-0.5">
                  <p>16-110 West Beaver Creek Rd.</p>
                  <p>Richmond Hill, Ontario</p>
                  <p>Canada , L4B 1J9</p>
                  <p>+1(905)597-4597</p>
                </div>
                <Button variant="link" className="h-auto p-0 text-sm text-primary">
                  Change destination to deliver
                </Button>
              </div>
            </div>

            {/* Purchase Order# */}
            <div className="flex items-start gap-4">
              <Label className="w-40 text-sm pt-2.5 text-destructive shrink-0">Purchase Order#*</Label>
              <div className="flex items-center gap-1 max-w-md flex-1">
                <Input defaultValue="MKRIC-502668" className="flex-1" />
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Reference# */}
            <div className="flex items-start gap-4">
              <Label className="w-40 text-sm pt-2.5 shrink-0">Reference#</Label>
              <Input className="max-w-md" />
            </div>

            {/* Date */}
            <div className="flex items-start gap-4">
              <Label className="w-40 text-sm pt-2.5 shrink-0">Date</Label>
              <Input type="text" defaultValue="Jan 27, 2026" className="max-w-md" />
            </div>

            {/* Delivery Date & Payment Terms */}
            <div className="flex items-start gap-4">
              <Label className="w-40 text-sm pt-2.5 shrink-0">Delivery Date</Label>
              <div className="flex items-start gap-6 flex-1">
                <Input type="text" placeholder="MMM dd, yyyy" className="max-w-[200px]" />
                <div className="flex items-start gap-2">
                  <Label className="text-sm pt-2.5 shrink-0">Payment Terms</Label>
                  <Select defaultValue="due-on-receipt">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="due-on-receipt">Due on Receipt</SelectItem>
                      <SelectItem value="net-15">Net 15</SelectItem>
                      <SelectItem value="net-30">Net 30</SelectItem>
                      <SelectItem value="net-45">Net 45</SelectItem>
                      <SelectItem value="net-60">Net 60</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Revision & Prepaid Freight */}
            <div className="flex items-start gap-4">
              <Label className="w-40 text-sm pt-2.5 shrink-0">Revision</Label>
              <div className="flex items-start gap-6 flex-1">
                <Input type="text" defaultValue="1" className="max-w-[200px]" />
                <div className="flex items-start gap-2">
                  <Label className="text-sm pt-2.5 shrink-0 text-muted-foreground">PREPAID FREIGHT /<br />Minimum Order Amount</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-sm">
                      CAD
                    </span>
                    <Input className="rounded-l-none w-[120px]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipment Preference */}
            <div className="flex items-start gap-4">
              <Label className="w-40 text-sm pt-2.5 shrink-0">Shipment Preference</Label>
              <Select>
                <SelectTrigger className="max-w-md">
                  <SelectValue placeholder="Choose the shipment preference or type to add" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Shipping</SelectItem>
                  <SelectItem value="express">Express Shipping</SelectItem>
                  <SelectItem value="pickup">Customer Pickup</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tax Settings */}
            <div className="flex items-center gap-4 py-2">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <Select defaultValue="exclusive">
                  <SelectTrigger className="w-[140px] h-8 text-xs">
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
                  <SelectTrigger className="w-[160px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transaction">At Transaction Level</SelectItem>
                    <SelectItem value="item">At Item Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Item Table */}
            <div className="border rounded bg-card">
              <div className="flex items-center justify-between p-3 border-b">
                <h3 className="text-sm font-medium">Item Table</h3>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Bulk Actions
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-8 py-2 px-2"></TableHead>
                      <TableHead className="text-[10px] font-medium py-2 px-2">ITEM DETAILS</TableHead>
                      <TableHead className="text-[10px] font-medium py-2 px-2 w-[140px]">ACCOUNT</TableHead>
                      <TableHead className="text-[10px] font-medium py-2 px-2 text-center w-[90px]">REORDER QTY</TableHead>
                      <TableHead className="text-[10px] font-medium py-2 px-2 text-center w-[80px]">QUANTITY</TableHead>
                      <TableHead className="text-[10px] font-medium py-2 px-2 text-center w-[80px]">
                        <div className="flex items-center justify-center gap-1">RATE <HelpCircle className="w-3 h-3" /></div>
                      </TableHead>
                      <TableHead className="text-[10px] font-medium py-2 px-2 w-[100px]">TAX</TableHead>
                      <TableHead className="text-[10px] font-medium py-2 px-2 text-right w-[80px]">AMOUNT</TableHead>
                      <TableHead className="w-12 py-2 px-2"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="py-2 px-2">
                          <div className="flex flex-col gap-0.5 text-muted-foreground cursor-move">
                            <MoreVertical className="w-3 h-3 rotate-90" />
                          </div>
                        </TableCell>
                        <TableCell className="py-2 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 border rounded flex items-center justify-center bg-muted/30 shrink-0">
                              <ImageIcon className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <Input 
                              className="h-8 text-xs border-0 shadow-none px-0 focus-visible:ring-0" 
                              placeholder="Type or click to select an item." 
                              defaultValue={row.itemDetails} 
                            />
                          </div>
                        </TableCell>
                        <TableCell className="py-2 px-2">
                          <Select>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select an account" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="inventory">Inventory Asset</SelectItem>
                              <SelectItem value="cogs">Cost of Goods Sold</SelectItem>
                              <SelectItem value="expense">Expense</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="py-2 px-2">
                          <Input className="h-8 text-xs text-center" defaultValue={row.reorderQty} />
                        </TableCell>
                        <TableCell className="py-2 px-2">
                          <Input className="h-8 text-xs text-center" defaultValue={row.quantity} />
                        </TableCell>
                        <TableCell className="py-2 px-2">
                          <Input className="h-8 text-xs text-center" defaultValue={row.rate} />
                        </TableCell>
                        <TableCell className="py-2 px-2">
                          <Select>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select a Tax" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gst">GST/HST [13%]</SelectItem>
                              <SelectItem value="exempt">Exempt</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="py-2 px-2 text-right text-xs">{row.amount}</TableCell>
                        <TableCell className="py-2 px-2">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-destructive" 
                              onClick={() => removeRow(row.id)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center gap-3 p-3 border-t">
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 bg-transparent" onClick={addNewRow}>
                  <Plus className="w-3 h-3 text-primary" />
                  Add New Row
                  <ChevronDown className="w-3 h-3" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 bg-transparent">
                  <Plus className="w-3 h-3 text-primary" />
                  Add Items in Bulk
                </Button>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-80 space-y-3 border rounded p-4 bg-muted/20">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Sub Total</span>
                  <span>0.00</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Discount</span>
                  <div className="flex items-center gap-2">
                    <Input className="h-7 w-16 text-xs text-right" defaultValue="0" />
                    <span className="text-xs">%</span>
                    <span className="w-16 text-right">0.00</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <Input className="h-7 w-24 text-xs" placeholder="Adjustment" />
                  <div className="flex items-center gap-2">
                    <Input className="h-7 w-16 text-xs text-right" />
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="w-16 text-right">0.00</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t pt-3">
                  <span>Total</span>
                  <span>0.00</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-sm">Notes</Label>
              <Textarea 
                rows={3} 
                className="resize-none" 
                placeholder="Will be displayed on purchase order"
              />
            </div>

            {/* Terms & Conditions and Attachments */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm">Terms & Conditions</Label>
                <Textarea 
                  rows={4} 
                  className="resize-none" 
                  placeholder="Enter the terms and conditions of your business to be displayed in your transaction"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Attach File(s) to Purchase Order</Label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Upload className="w-3.5 h-3.5" />
                    Upload File
                  </Button>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  You can upload a maximum of 10 files, 10MB each
                </p>
              </div>
            </div>

            {/* Additional Fields */}
            <div className="pt-4 border-t">
              <p className="text-sm">
                <span className="font-medium">Additional Fields:</span>{" "}
                <span className="text-muted-foreground">Start adding custom fields for your purchase orders by going to </span>
                <Button variant="link" className="text-primary p-0 h-auto text-sm">Settings</Button>
                <span className="text-muted-foreground"> ➡ </span>
                <Button variant="link" className="text-primary p-0 h-auto text-sm">Purchases</Button>
                <span className="text-muted-foreground"> ➡ </span>
                <Button variant="link" className="text-primary p-0 h-auto text-sm">Purchase Orders</Button>
                <span className="text-muted-foreground">.</span>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <div className="flex items-center gap-3">
              <Button variant="outline" className="bg-transparent">
                Save as Draft
              </Button>
              <Button className="bg-primary hover:bg-primary/90">
                Save and Send
              </Button>
              <Button variant="outline" onClick={() => router.back()} className="bg-transparent">
                Cancel
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">PDF Template:</span>
              <span>&apos;Standard Template&apos;</span>
              <Button variant="link" className="text-primary p-0 h-auto text-sm">Change</Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
