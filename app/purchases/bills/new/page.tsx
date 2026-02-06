"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { 
  X, FileText, ChevronDown, Search, Plus, MoreVertical, Upload, HelpCircle
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function NewBillPage() {
  const [items, setItems] = useState([
    { id: 1, name: "", account: "", reorderQty: "", qty: "1.00", rate: "0.00", tax: "", customerDetails: "", amount: "0.00" }
  ])

  const addNewRow = () => {
    setItems([...items, { 
      id: items.length + 1, 
      name: "", 
      account: "", 
      reorderQty: "", 
      qty: "1.00", 
      rate: "0.00", 
      tax: "", 
      customerDetails: "", 
      amount: "0.00" 
    }])
  }

  const removeRow = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  return (
    <DashboardLayout activeItem="Purchases" activeSubItem="Bills">
      <div className="flex-1 overflow-auto bg-background">
        <div className="w-full px-6 py-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <h1 className="text-xl font-semibold">New Bill</h1>
            </div>
            <Link href="/purchases/bills">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Vendor Name */}
            <div className="grid grid-cols-[180px_1fr] gap-4 items-start">
              <label className="text-sm text-red-500 pt-2">Vendor Name*</label>
              <div className="flex gap-2 max-w-md">
                <Select>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select a Vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendor1">Edison (Seagul Group)</SelectItem>
                    <SelectItem value="vendor2">Oatey</SelectItem>
                    <SelectItem value="vendor3">Westlake Canada Inc.</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" className="h-9 w-9 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Bill# */}
            <div className="grid grid-cols-[180px_1fr] gap-4 items-start">
              <label className="text-sm text-red-500 pt-2">Bill#*</label>
              <Input className="h-9 max-w-md" />
            </div>

            {/* Order Number */}
            <div className="grid grid-cols-[180px_1fr] gap-4 items-start">
              <label className="text-sm pt-2">Order Number</label>
              <Input className="h-9 max-w-md" />
            </div>

            {/* Bill Date */}
            <div className="grid grid-cols-[180px_1fr] gap-4 items-start">
              <label className="text-sm text-red-500 pt-2">Bill Date*</label>
              <Input className="h-9 max-w-md" placeholder="MMM dd, yyyy" />
            </div>

            {/* Due Date & Payment Terms */}
            <div className="grid grid-cols-[180px_1fr] gap-4 items-start">
              <label className="text-sm pt-2">Due Date</label>
              <div className="flex gap-8 items-center">
                <Input className="h-9 max-w-md" defaultValue="Jan 28, 2026" />
                <div className="flex items-center gap-3">
                  <label className="text-sm whitespace-nowrap">Payment Terms</label>
                  <Select defaultValue="due-on-receipt">
                    <SelectTrigger className="h-9 w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="due-on-receipt">Due on Receipt</SelectItem>
                      <SelectItem value="net-10">Net 10</SelectItem>
                      <SelectItem value="net-15">Net 15</SelectItem>
                      <SelectItem value="net-30">Net 30</SelectItem>
                      <SelectItem value="net-60">Net 60</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Accounts Payable */}
            <div className="grid grid-cols-[180px_1fr] gap-4 items-start">
              <label className="text-sm pt-2 flex items-center gap-1">
                Accounts Payable
                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
              </label>
              <Select defaultValue="accounts-payable">
                <SelectTrigger className="h-9 max-w-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accounts-payable">Accounts Payable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tax Options */}
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <Select defaultValue="tax-exclusive">
                  <SelectTrigger className="h-8 w-[140px] border-0 p-0 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tax-exclusive">Tax Exclusive</SelectItem>
                    <SelectItem value="tax-inclusive">Tax Inclusive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
                <Select defaultValue="at-transaction-level">
                  <SelectTrigger className="h-8 w-[160px] border-0 p-0 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="at-transaction-level">At Transaction Level</SelectItem>
                    <SelectItem value="at-line-item-level">At Line Item Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Item Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b">
                <h3 className="text-sm font-medium">Item Table</h3>
                <Button variant="link" className="h-auto p-0 text-xs text-primary gap-1">
                  <span className="text-primary">Bulk Actions</span>
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/20">
                      <th className="px-3 py-2 text-left font-medium text-xs w-8"></th>
                      <th className="px-3 py-2 text-left font-medium text-xs min-w-[200px]">ITEM DETAILS</th>
                      <th className="px-3 py-2 text-left font-medium text-xs w-[140px]">ACCOUNT</th>
                      <th className="px-3 py-2 text-left font-medium text-xs w-[100px]">REORDER QTY</th>
                      <th className="px-3 py-2 text-left font-medium text-xs w-[80px]">QUANTITY</th>
                      <th className="px-3 py-2 text-left font-medium text-xs w-[80px]">
                        <div className="flex items-center gap-1">
                          RATE
                          <HelpCircle className="w-3 h-3 text-muted-foreground" />
                        </div>
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-xs w-[120px]">TAX</th>
                      <th className="px-3 py-2 text-left font-medium text-xs w-[140px]">CUSTOMER DETAILS</th>
                      <th className="px-3 py-2 text-right font-medium text-xs w-[80px]">AMOUNT</th>
                      <th className="px-3 py-2 w-[60px]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="px-3 py-2">
                          <MoreVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <Input 
                              className="h-8 border-0 bg-transparent p-0 text-sm" 
                              placeholder="Type or click to select an item."
                            />
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <Select>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select an account" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="inventory">Inventory Asset</SelectItem>
                              <SelectItem value="expense">Expense</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-3 py-2">
                          <Input className="h-8 text-xs text-center" />
                        </td>
                        <td className="px-3 py-2">
                          <Input className="h-8 text-xs text-center" defaultValue="1.00" />
                        </td>
                        <td className="px-3 py-2">
                          <Input className="h-8 text-xs text-center" defaultValue="0.00" />
                        </td>
                        <td className="px-3 py-2">
                          <Select>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select a Tax" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hst">HST (13%)</SelectItem>
                              <SelectItem value="gst">GST (5%)</SelectItem>
                              <SelectItem value="none">No Tax</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-3 py-2">
                          <Select>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select Customer" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="customer1">Customer 1</SelectItem>
                              <SelectItem value="customer2">Customer 2</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-3 py-2 text-right">0.00</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-destructive"
                              onClick={() => removeRow(item.id)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add New Row */}
              <div className="px-4 py-3 border-t">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-xs text-primary gap-1"
                  onClick={addNewRow}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add New Row
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end">
              <div className="w-[400px] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Sub Total</span>
                  <span className="text-sm">0.00</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm">Discount</span>
                  <div className="flex items-center gap-2">
                    <Input className="h-8 w-16 text-xs text-center" defaultValue="0" />
                    <span className="text-sm">%</span>
                  </div>
                  <span className="text-sm">0.00</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Input className="h-8 w-24 text-xs" placeholder="Adjustment" />
                  <div className="flex items-center gap-2">
                    <Input className="h-8 w-20 text-xs text-center" />
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm">0.00</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-sm font-semibold">0.00</span>
                </div>
              </div>
            </div>

            {/* Notes & Attachments */}
            <div className="grid grid-cols-2 gap-8 pt-4 border-t">
              <div>
                <label className="text-sm font-medium mb-2 block">Notes</label>
                <Textarea className="min-h-[80px] text-sm" />
                <p className="text-xs text-muted-foreground mt-1">It will not be shown in PDF</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Attach File(s) to Bill</label>
                <Button variant="outline" size="sm" className="h-9 gap-2 bg-transparent">
                  <Upload className="w-4 h-4" />
                  Upload File
                  <ChevronDown className="w-3 h-3" />
                </Button>
                <p className="text-xs text-muted-foreground mt-2">You can upload a maximum of 5 files, 10MB each</p>
              </div>
            </div>

            {/* Additional Fields */}
            <div className="pt-4 border-t">
              <p className="text-sm">
                <span className="font-medium">Additional Fields:</span>{" "}
                <span className="text-muted-foreground">
                  Start adding custom fields for your payments made by going to{" "}
                </span>
                <span className="text-primary">Settings</span>
                <span className="text-muted-foreground"> → </span>
                <span className="text-primary">Purchases</span>
                <span className="text-muted-foreground"> → </span>
                <span className="text-primary">Bills</span>
                <span className="text-muted-foreground">.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="h-9 bg-transparent">
              Save as Draft
            </Button>
            <Button size="sm" className="h-9 bg-primary hover:bg-primary/90">
              Save as Open
            </Button>
            <Link href="/purchases/bills">
              <Button variant="ghost" size="sm" className="h-9">
                Cancel
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>PDF Template:</span>
            <span className="text-muted-foreground">{`'Standard Template'`}</span>
            <Button variant="link" className="h-auto p-0 text-xs text-primary">Change</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
