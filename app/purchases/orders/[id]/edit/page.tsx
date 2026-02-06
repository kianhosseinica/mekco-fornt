"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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
  X, Settings, Search, Plus, Upload, ImageIcon, HelpCircle, 
  Pencil, ChevronDown, ChevronRight, MoreVertical, GripVertical
} from "lucide-react"

interface LineItem {
  id: number
  itemName: string
  itemDescription: string
  account: string
  reorderQty: string
  quantity: string
  rate: string
  tax: string
  amount: number
}

// Sample data for the order being edited
const orderData = {
  id: 1,
  orderNo: "MKRIC-502667",
  vendor: "Global Xpress",
  vendorDetails: {
    billingAddress: {
      street: "3615 Laird Rd",
      unit: "Unit 14",
      city: "Mississauga",
      province: "Ontario L5L 5Z8",
      country: "Canada",
      fax: "416-849-0570"
    },
    shippingAddress: null
  },
  deliveryAddress: {
    type: "organization",
    name: "Mekco Supply",
    street: "16-110 West Beaver Creek Rd.",
    city: "Richmond Hill, Ontario",
    postalCode: "Canada , L4B 1J9",
    phone: "+1(905)597-4597"
  },
  reference: "3/8 Rods x 880 bundle",
  date: "Jan 27, 2026",
  deliveryDate: "",
  paymentTerms: "Net 30",
  revision: "1",
  prepaidFreight: "CAD",
  shipmentPreference: "",
  items: [
    {
      id: 1,
      itemName: "3/8\" x 10' ALL THREADED ROD",
      itemDescription: "Zinc Plated\nTotal Qty in Master Bundle: 880\nQty in each Bundle 20",
      account: "Cost of Goods Sold",
      reorderQty: "",
      quantity: "880",
      rate: "2.5",
      tax: "GST/HST [13%]",
      amount: 2200.00
    }
  ],
  notes: "",
  termsConditions: "",
  emailContacts: [
    { email: "Badr <badr@globalxpress.ca>", checked: true },
    { email: "<saima@globalxpress.ca>", checked: false },
    { email: "<sales@globalxpress.ca>", checked: false }
  ]
}

export default function EditPurchaseOrderPage() {
  const router = useRouter()
  
  const [lineItems, setLineItems] = useState<LineItem[]>(orderData.items)
  const [deliveryAddressType, setDeliveryAddressType] = useState(orderData.deliveryAddress.type)

  const addNewRow = () => {
    const newId = lineItems.length > 0 ? Math.max(...lineItems.map(item => item.id)) + 1 : 1
    setLineItems([...lineItems, {
      id: newId,
      itemName: "",
      itemDescription: "",
      account: "",
      reorderQty: "",
      quantity: "1.00",
      rate: "0.00",
      tax: "",
      amount: 0
    }])
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
        if (field === 'quantity' || field === 'rate') {
          const qty = parseFloat(updated.quantity) || 0
          const rate = parseFloat(updated.rate) || 0
          updated.amount = qty * rate
        }
        return updated
      }
      return item
    }))
  }

  const calculateSubTotal = () => lineItems.reduce((sum, item) => sum + item.amount, 0)
  const calculateTax = () => calculateSubTotal() * 0.13
  const calculateTotal = () => calculateSubTotal() + calculateTax()
  const calculateTotalQuantity = () => lineItems.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0)

  return (
    <DashboardLayout activeItem="Purchases" activeSubItem="Purchase Orders">
      <div className="flex-1 overflow-auto bg-background">
        <div className="px-6 py-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-lg">
                <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <h1 className="text-xl font-semibold text-foreground">Edit Purchase Order</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Vendor Name */}
            <div className="flex items-start gap-6">
              <Label className="text-destructive w-32 pt-2 shrink-0">Vendor Name*</Label>
              <div className="flex-1">
                <div className="flex gap-2 mb-4">
                  <Select defaultValue={orderData.vendor}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Global Xpress">Global Xpress</SelectItem>
                      <SelectItem value="Apollo Valves">Apollo Valves</SelectItem>
                      <SelectItem value="Bow">Bow</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="icon" className="bg-primary shrink-0">
                    <Search className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-1 px-3 py-1 border rounded-md bg-muted/50">
                    <span className="text-sm">CAD</span>
                  </div>
                  <Button variant="outline" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                    Global Xpress&apos;s Details
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Billing & Shipping Addresses */}
                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground font-medium">BILLING ADDRESS</span>
                      <Pencil className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <div className="text-sm space-y-0.5">
                      <p>{orderData.vendorDetails.billingAddress.street}</p>
                      <p>{orderData.vendorDetails.billingAddress.unit}</p>
                      <p>{orderData.vendorDetails.billingAddress.city}</p>
                      <p>{orderData.vendorDetails.billingAddress.province}</p>
                      <p>{orderData.vendorDetails.billingAddress.country}</p>
                      <p>Fax Number: {orderData.vendorDetails.billingAddress.fax}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground font-medium">SHIPPING ADDRESS</span>
                      <Pencil className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <Button variant="link" className="text-primary p-0 h-auto text-sm">
                      New Address
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="flex items-start gap-6">
              <Label className="text-destructive w-32 pt-2 shrink-0">Delivery Address*</Label>
              <div className="flex-1">
                <RadioGroup 
                  value={deliveryAddressType} 
                  onValueChange={setDeliveryAddressType}
                  className="flex gap-6 mb-3"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="organization" id="org" />
                    <Label htmlFor="org" className="font-normal">Organization</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="customer" id="customer" />
                    <Label htmlFor="customer" className="font-normal">Customer</Label>
                  </div>
                </RadioGroup>
                
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">{orderData.deliveryAddress.name}</span>
                  <Pencil className="w-3 h-3 text-muted-foreground cursor-pointer" />
                </div>
                
                <div className="text-sm text-muted-foreground space-y-0.5 mb-2">
                  <p>{orderData.deliveryAddress.street}</p>
                  <p>{orderData.deliveryAddress.city}</p>
                  <p>{orderData.deliveryAddress.postalCode}</p>
                  <p>{orderData.deliveryAddress.phone}</p>
                </div>
                
                <Button variant="link" className="text-primary p-0 h-auto text-sm">
                  Change destination to deliver
                </Button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Purchase Order# */}
              <div className="flex items-center gap-6">
                <Label className="text-destructive w-32 shrink-0">Purchase Order#*</Label>
                <div className="flex gap-2 flex-1 max-w-md">
                  <Input defaultValue={orderData.orderNo} className="flex-1" />
                  <Button variant="ghost" size="icon">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Reference# */}
              <div className="flex items-center gap-6">
                <Label className="w-32 shrink-0">Reference#</Label>
                <Input defaultValue={orderData.reference} className="flex-1 max-w-md" />
              </div>

              {/* Date */}
              <div className="flex items-center gap-6">
                <Label className="w-32 shrink-0">Date</Label>
                <Input defaultValue={orderData.date} className="flex-1 max-w-md" />
              </div>

              {/* Delivery Date & Payment Terms */}
              <div className="flex items-center gap-6">
                <Label className="w-32 shrink-0">Delivery Date</Label>
                <div className="flex gap-6 flex-1">
                  <Input placeholder="MMM dd, yyyy" className="max-w-[200px]" />
                  <div className="flex items-center gap-2">
                    <Label className="shrink-0">Payment Terms</Label>
                    <Select defaultValue="net30">
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="due-receipt">Due on Receipt</SelectItem>
                        <SelectItem value="net30">Net 30</SelectItem>
                        <SelectItem value="net60">Net 60</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Revision & Prepaid Freight */}
              <div className="flex items-center gap-6">
                <Label className="w-32 shrink-0">Revision</Label>
                <div className="flex gap-6 flex-1">
                  <Input defaultValue={orderData.revision} className="max-w-[200px]" />
                  <div className="flex items-center gap-2">
                    <Label className="shrink-0 text-xs">PREPAID FREIGHT / Minimum Order Amount</Label>
                    <Input defaultValue={orderData.prepaidFreight} className="w-[200px]" />
                  </div>
                </div>
              </div>

              {/* Shipment Preference */}
              <div className="flex items-center gap-6">
                <Label className="w-32 shrink-0">Shipment Preference</Label>
                <Select>
                  <SelectTrigger className="max-w-md">
                    <SelectValue placeholder="Choose the shipment preference or type to add" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pickup">Pickup</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Item Table */}
            <div className="border rounded-lg mt-8">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-medium">Item Table</h3>
                <Button variant="link" className="text-primary gap-1">
                  <Settings className="w-4 h-4" />
                  Bulk Actions
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="text-xs">
                    <TableHead className="w-8"></TableHead>
                    <TableHead className="w-[280px]">ITEM DETAILS</TableHead>
                    <TableHead className="w-[180px]">ACCOUNT</TableHead>
                    <TableHead className="w-24">REORDER QTY</TableHead>
                    <TableHead className="w-24">QUANTITY</TableHead>
                    <TableHead className="w-20">RATE <HelpCircle className="w-3 h-3 inline" /></TableHead>
                    <TableHead className="w-28">TAX</TableHead>
                    <TableHead className="text-right w-24">AMOUNT</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <div className="w-10 h-10 border rounded bg-muted/50 flex items-center justify-center shrink-0">
                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{item.itemName}</p>
                            <p className="text-xs text-muted-foreground whitespace-pre-line">{item.itemDescription}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select defaultValue={item.account}>
                          <SelectTrigger className="text-xs h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cost of Goods Sold">Cost of Goods Sold</SelectItem>
                            <SelectItem value="Inventory">Inventory</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input 
                          className="w-20 h-8 text-sm" 
                          value={item.reorderQty}
                          onChange={(e) => updateLineItem(item.id, 'reorderQty', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          value={item.quantity} 
                          className="w-20 h-8 text-sm" 
                          onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          value={item.rate} 
                          className="w-16 h-8 text-sm" 
                          onChange={(e) => updateLineItem(item.id, 'rate', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Select defaultValue={item.tax}>
                            <SelectTrigger className="w-24 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="GST/HST [13%]">GST/HST [13...</SelectItem>
                              <SelectItem value="GST [5%]">GST [5%]</SelectItem>
                            </SelectContent>
                          </Select>
                          <X className="w-3 h-3 text-muted-foreground cursor-pointer" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm">{item.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MoreVertical className="w-4 h-4 text-muted-foreground cursor-pointer" />
                          <X 
                            className="w-4 h-4 text-destructive cursor-pointer"
                            onClick={() => removeRow(item.id)}
                          />
                        </div>
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
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
                <Button variant="outline" size="sm" className="gap-1 text-primary bg-transparent">
                  <Plus className="w-4 h-4" />
                  Add Items in Bulk
                </Button>
              </div>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end">
              <div className="w-[420px] border rounded-lg p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold text-base">Sub Total</span>
                    <p className="text-sm text-muted-foreground">Total Quantity : {calculateTotalQuantity()}</p>
                  </div>
                  <span className="font-semibold text-lg">{calculateSubTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm">Discount</span>
                    <Button variant="link" className="text-primary p-0 h-auto text-xs block">
                      Apply after tax
                    </Button>
                  </div>
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
                    <span className="w-24 text-right font-medium">0.00</span>
                  </div>
                </div>
                <div className="flex justify-between border-t pt-4">
                  <span className="text-sm">GST/HST [13%]</span>
                  <span className="font-medium text-base">{calculateTax().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Input placeholder="Adjustment" className="w-28 h-9" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Input className="w-20 h-9 text-right" defaultValue="0" />
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="w-24 text-right font-medium">0.00</span>
                  </div>
                </div>
                <div className="flex justify-between font-bold border-t pt-4 text-lg">
                  <span>Total ( $ )</span>
                  <span>{calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Will be displayed on purchase order"
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
                <Label>Attach File(s) to Purchase Order</Label>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Upload className="w-4 h-4" />
                  Upload File
                  <ChevronDown className="w-3 h-3" />
                </Button>
                <p className="text-xs text-muted-foreground">
                  You can upload a maximum of 10 files, 10MB each
                </p>
              </div>
            </div>

            {/* Email Communications */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label>Email Communications</Label>
                <Button variant="link" className="text-primary p-0 h-auto text-sm">
                  Select All
                </Button>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button variant="outline" size="sm" className="gap-1 text-primary bg-transparent">
                  <Plus className="w-4 h-4" />
                  Add New
                </Button>
                {orderData.emailContacts.map((contact, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Checkbox defaultChecked={contact.checked} />
                    <span className="text-sm">{contact.email}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <div className="flex items-center gap-3">
              <Button className="bg-primary hover:bg-primary/90">
                Save
              </Button>
              <Button variant="outline" className="bg-transparent">
                Save and Send
              </Button>
              <Button variant="outline" className="bg-transparent" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              PDF Template: &apos;Standard Template&apos;
              <Button variant="link" className="text-primary p-0 h-auto ml-2">
                Change
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
