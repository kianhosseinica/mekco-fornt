"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { X, Search, ChevronRight, ChevronDown, Paperclip, HelpCircle, ImageIcon, MoreVertical, Plus, Upload, DollarSign, Pencil } from "lucide-react"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface LineItem {
  id: number
  itemName: string
  itemDescription: string
  sku: string
  account: string
  reorderQty: number
  quantity: number
  rate: number
  tax: string
  customerDetails: string
  amount: number
}

export default function EditBillPage() {
  const [vendorName, setVendorName] = useState("Edison (Seagul Group)")
  const [billNo, setBillNo] = useState("PI-P20260127")
  const [orderNumber, setOrderNumber] = useState("MKOVS-502665")
  const [billDate, setBillDate] = useState("Jan 27, 2026")
  const [dueDate, setDueDate] = useState("Jan 27, 2026")
  const [paymentTerms, setPaymentTerms] = useState("Due on Receipt")
  const [accountsPayable, setAccountsPayable] = useState("Accounts Payable")
  const [notes, setNotes] = useState("")
  
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: 1,
      itemName: "5M - Potable Water Thermostatic Mixing Valve 1/2\" - 5M-TMV12",
      itemDescription: "1/2\" thermostatic mixing valves with additional three PEX fittings USD21.80",
      sku: "5M-TMV12",
      account: "Inventory Asset",
      reorderQty: 0,
      quantity: 504,
      rate: 21.8,
      tax: "GST/HST [13%]",
      customerDetails: "",
      amount: 10987.20
    },
    {
      id: 2,
      itemName: "5M - Potable Water Thermostatic Mixing Valve 3/4\" - 5M-TMV34",
      itemDescription: "3/4\" thermostatic mixing valves with additional three PEX fittings USD21.94",
      sku: "5M-TMV34",
      account: "Inventory Asset",
      reorderQty: 0,
      quantity: 504,
      rate: 21.94,
      tax: "GST/HST [13%]",
      customerDetails: "",
      amount: 11057.76
    },
  ])

  const addLineItem = () => {
    const newItem: LineItem = {
      id: lineItems.length + 1,
      itemName: "",
      itemDescription: "",
      sku: "",
      account: "Inventory Asset",
      reorderQty: 0,
      quantity: 1,
      rate: 0,
      tax: "",
      customerDetails: "",
      amount: 0
    }
    setLineItems([...lineItems, newItem])
  }

  const removeLineItem = (id: number) => {
    setLineItems(lineItems.filter(item => item.id !== id))
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
    <DashboardLayout activeItem="Purchases" activeSubItem="Bills">
      <div className="flex-1 overflow-auto bg-background">
        <div className="px-6 py-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                <span className="text-lg">📄</span>
              </div>
              <h1 className="text-xl font-semibold">Edit Bill</h1>
            </div>
            <Link href="/purchases/bills">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Vendor Section */}
          <div className="grid grid-cols-[160px_1fr] gap-4 items-start mb-6">
            <label className="text-sm font-medium text-destructive pt-2">Vendor Name*</label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Select value={vendorName} onValueChange={setVendorName}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Edison (Seagul Group)">Edison (Seagul Group)</SelectItem>
                    <SelectItem value="Global Xpress">Global Xpress</SelectItem>
                    <SelectItem value="Bow">Bow</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" className="shrink-0 bg-transparent">
                  <Search className="w-4 h-4" />
                </Button>
                <span className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded text-sm">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  USD
                </span>
                <Button variant="default" className="gap-1">
                  Edison (Seagul Group...
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">BILLING ADDRESS</p>
                <Link href="#" className="text-primary hover:underline">New Address</Link>
              </div>
            </div>
          </div>

          {/* Bill Info Row 1 */}
          <div className="grid grid-cols-[160px_1fr_auto] gap-4 items-center mb-4">
            <label className="text-sm font-medium text-destructive">Bill#*</label>
            <div className="flex items-center gap-4">
              <Input value={billNo} onChange={(e) => setBillNo(e.target.value)} className="max-w-xs" />
              <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                <Paperclip className="w-4 h-4" />
                Files attached (2)
              </Button>
            </div>
          </div>

          {/* Bill Info Row 2 */}
          <div className="grid grid-cols-[160px_1fr] gap-4 items-center mb-4">
            <label className="text-sm font-medium">Order Number</label>
            <Input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} className="max-w-xs" />
          </div>

          {/* Bill Info Row 3 */}
          <div className="grid grid-cols-[160px_1fr] gap-4 items-center mb-4">
            <label className="text-sm font-medium text-destructive">Bill Date*</label>
            <Input value={billDate} onChange={(e) => setBillDate(e.target.value)} className="max-w-xs" />
          </div>

          {/* Bill Info Row 4 - Due Date & Payment Terms */}
          <div className="grid grid-cols-[160px_1fr_160px_1fr] gap-4 items-center mb-4">
            <label className="text-sm font-medium">Due Date</label>
            <Input value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="max-w-xs" />
            <label className="text-sm font-medium">Payment Terms</label>
            <Select value={paymentTerms} onValueChange={setPaymentTerms}>
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                <SelectItem value="Net 15">Net 15</SelectItem>
                <SelectItem value="Net 30">Net 30</SelectItem>
                <SelectItem value="Net 45">Net 45</SelectItem>
                <SelectItem value="Net 60">Net 60</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Accounts Payable */}
          <div className="grid grid-cols-[160px_1fr] gap-4 items-center mb-6">
            <label className="text-sm font-medium flex items-center gap-1">
              Accounts Payable
              <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
            </label>
            <Select value={accountsPayable} onValueChange={setAccountsPayable}>
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Accounts Payable">Accounts Payable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tax Settings */}
          <div className="flex items-center gap-6 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <Select defaultValue="exclusive">
                <SelectTrigger className="w-36 h-8 border-dashed">
                  <SelectValue placeholder="Tax Exclusive" />
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
                  <SelectValue placeholder="At Transaction Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transaction">At Transaction Level</SelectItem>
                  <SelectItem value="line">At Line Item Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="ml-auto text-xs text-muted-foreground">
              (Exchange rate as on creation) 1 USD = 1 CAD <Pencil className="w-3 h-3 text-primary cursor-pointer inline ml-1" />
            </div>
          </div>

          {/* Item Table */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Item Table</h2>
              <Button variant="link" className="text-primary gap-1 h-auto p-0">
                <span className="text-lg">📋</span>
                Bulk Actions
              </Button>
            </div>

            <div className="border rounded-lg overflow-x-auto">
              <Table className="min-w-[1100px]">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[24px] px-1"></TableHead>
                    <TableHead className="w-[320px] px-2">ITEM DETAILS</TableHead>
                    <TableHead className="w-[120px] px-2">ACCOUNT</TableHead>
                    <TableHead className="w-[80px] px-2 text-center">REORDER QTY</TableHead>
                    <TableHead className="w-[70px] px-2 text-center">QUANTITY</TableHead>
                    <TableHead className="w-[60px] px-2 text-center">RATE</TableHead>
                    <TableHead className="w-[100px] px-2">TAX</TableHead>
                    <TableHead className="w-[100px] px-2">CUSTOM...</TableHead>
                    <TableHead className="w-[80px] px-2 text-right">AMOUNT</TableHead>
                    <TableHead className="w-[50px] px-1"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item) => (
                    <TableRow key={item.id} className="align-top">
                      <TableCell className="py-2 px-1">
                        <div className="flex flex-col gap-0.5 cursor-move">
                          <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                          <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                          <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                          <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                          <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                          <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-2">
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 border rounded bg-muted/50 flex items-center justify-center shrink-0">
                            <ImageIcon className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium leading-tight">{item.itemName}</p>
                            <p className="text-[10px] text-muted-foreground">SKU: {item.sku}</p>
                            <textarea
                              className="w-full text-[10px] text-muted-foreground border rounded px-1.5 py-1 resize-none bg-background min-h-[40px] mt-1"
                              value={item.itemDescription}
                              onChange={(e) => updateLineItem(item.id, 'itemDescription', e.target.value)}
                              placeholder="Add item notes..."
                              rows={2}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-2">
                        <Select 
                          value={item.account} 
                          onValueChange={(val) => updateLineItem(item.id, 'account', val)}
                        >
                          <SelectTrigger className="h-7 text-[10px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Inventory Asset">Inventory Asset</SelectItem>
                            <SelectItem value="Cost of Goods Sold">Cost of Goods Sold</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="link" className="text-primary p-0 h-auto text-[10px] mt-0.5">
                          Recent Transactions
                        </Button>
                      </TableCell>
                      <TableCell className="py-2 px-2 text-center">
                        <Input 
                          type="number"
                          value={item.reorderQty}
                          onChange={(e) => updateLineItem(item.id, 'reorderQty', Number(e.target.value))}
                          className="h-8 text-xs text-center w-16 mx-auto px-1"
                        />
                      </TableCell>
                      <TableCell className="py-2 px-2 text-center">
                        <Input 
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, 'quantity', Number(e.target.value))}
                          className="h-8 text-xs text-center w-16 mx-auto px-1"
                        />
                      </TableCell>
                      <TableCell className="py-2 px-2 text-center">
                        <Input 
                          type="number"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => updateLineItem(item.id, 'rate', Number(e.target.value))}
                          className="h-8 text-xs text-center w-16 mx-auto px-1"
                        />
                      </TableCell>
                      <TableCell className="py-2 px-2">
                        <Select 
                          value={item.tax} 
                          onValueChange={(val) => updateLineItem(item.id, 'tax', val)}
                        >
                          <SelectTrigger className="h-7 text-[10px]">
                            <SelectValue placeholder="Select a Tax" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GST/HST [13%]">GST/HST [13...]</SelectItem>
                            <SelectItem value="GST [5%]">GST [5%]</SelectItem>
                            <SelectItem value="No Tax">No Tax</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="py-2 px-2">
                        <Select 
                          value={item.customerDetails} 
                          onValueChange={(val) => updateLineItem(item.id, 'customerDetails', val)}
                        >
                          <SelectTrigger className="h-7 text-[10px]">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="customer1">Customer 1</SelectItem>
                            <SelectItem value="customer2">Customer 2</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="py-2 px-2 text-right text-xs font-medium">
                        {item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="py-2 px-1">
                        <div className="flex items-center gap-0.5">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-5 w-5">
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="text-xs">Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-xs">Duplicate</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5 text-destructive"
                            onClick={() => removeLineItem(item.id)}
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

            <div className="flex items-center gap-4 mt-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                    <Plus className="w-4 h-4" />
                    Add New Row
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={addLineItem} className="text-xs">Add Item</DropdownMenuItem>
                  <DropdownMenuItem className="text-xs">Add Service</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Totals & Notes Section */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            {/* Left - Notes */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">Notes</label>
                <Textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder=""
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground mt-1">It will not be shown in PDF</p>
              </div>
            </div>

            {/* Right - Totals & Attachments */}
            <div className="space-y-4">
              {/* Totals Box */}
              <div className="border rounded-lg p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-base">Sub Total</span>
                  <span className="font-semibold text-lg tabular-nums">{calculateSubTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Discount</span>
                  <div className="flex items-center gap-2">
                    <Input className="w-20 h-9 text-right" defaultValue="0" />
                    <Select defaultValue="%">
                      <SelectTrigger className="w-16 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="%">%</SelectItem>
                        <SelectItem value="$">$</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="w-24 text-right font-medium tabular-nums">0.00</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Input placeholder="Adjustment" className="w-28 h-9" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Input className="w-20 h-9 text-right" defaultValue="0" />
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="w-24 text-right font-medium tabular-nums">0.00</span>
                  </div>
                </div>
                <div className="flex justify-between items-center font-bold border-t pt-4 text-lg">
                  <span>Total ( $ )</span>
                  <span className="tabular-nums">{calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Attachments */}
              <div>
                <p className="text-sm font-medium mb-2">Attach File(s) to Bill</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="gap-1 bg-transparent">
                    <Upload className="w-4 h-4" />
                    Upload File
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                  <span className="flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 rounded text-sm">
                    <Paperclip className="w-3 h-3" />
                    2
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Checkbox id="showAttachments" />
                  <label htmlFor="showAttachments" className="text-xs text-muted-foreground">
                    Display attachments in vendor portal and emails
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mt-1">You can upload a maximum of 5 files, 10MB each</p>
              </div>
            </div>
          </div>

          {/* Additional Fields Info */}
          <div className="mb-6 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Additional Fields:</span>{" "}
            Start adding custom fields for your payments made by going to{" "}
            <Link href="#" className="text-primary hover:underline">Settings</Link>
            {" "}➤{" "}
            <Link href="#" className="text-primary hover:underline">Purchases</Link>
            {" "}➤{" "}
            <Link href="#" className="text-primary hover:underline">Bills</Link>.
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between py-4 border-t">
            <div className="flex items-center gap-2">
              <Button className="bg-primary hover:bg-primary/90">Save</Button>
              <Button variant="outline" className="bg-transparent">Cancel</Button>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">PDF Template:</span>
              <span>{"'Standard Template'"}</span>
              <Link href="#" className="text-primary hover:underline">Change</Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
