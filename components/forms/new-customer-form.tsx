"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Upload } from "lucide-react"

interface NewCustomerFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewCustomerForm({ open, onOpenChange }: NewCustomerFormProps) {
  const [customerType, setCustomerType] = useState("business")
  const [taxPreference, setTaxPreference] = useState("taxable")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>New Customer</DialogTitle>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Customer Type */}
          <div className="space-y-2">
            <Label>Customer Type</Label>
            <RadioGroup value={customerType} onValueChange={setCustomerType} className="flex gap-4">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="business" id="business" />
                <Label htmlFor="business" className="font-normal">Business</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="individual" id="individual" />
                <Label htmlFor="individual" className="font-normal">Individual</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Primary Contact */}
          <div className="space-y-2">
            <Label>Primary Contact</Label>
            <div className="grid grid-cols-3 gap-2">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Salutation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mr">Mr.</SelectItem>
                  <SelectItem value="mrs">Mrs.</SelectItem>
                  <SelectItem value="ms">Ms.</SelectItem>
                  <SelectItem value="dr">Dr.</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="First Name" />
              <Input placeholder="Last Name" />
            </div>
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input />
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label className="text-destructive">Display Name*</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select or type to add" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="company">Company Name</SelectItem>
                <SelectItem value="full">Full Name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input type="email" />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label>Phone</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex gap-2">
                <Select defaultValue="+1">
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+1">+1</SelectItem>
                    <SelectItem value="+44">+44</SelectItem>
                    <SelectItem value="+91">+91</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Work Phone" className="flex-1" />
              </div>
              <div className="flex gap-2">
                <Select defaultValue="+1">
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+1">+1</SelectItem>
                    <SelectItem value="+44">+44</SelectItem>
                    <SelectItem value="+91">+91</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Mobile" className="flex-1" />
              </div>
            </div>
          </div>

          {/* Customer Language */}
          <div className="space-y-2">
            <Label>Customer Language</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="other-details" className="w-full">
            <TabsList className="w-full justify-start border-b bg-transparent h-auto p-0">
              <TabsTrigger value="other-details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none">
                Other Details
              </TabsTrigger>
              <TabsTrigger value="address" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none">
                Address
              </TabsTrigger>
              <TabsTrigger value="contact-persons" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none">
                Contact Persons
              </TabsTrigger>
              <TabsTrigger value="custom-fields" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none">
                Custom Fields
              </TabsTrigger>
              <TabsTrigger value="reporting-tags" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none">
                Reporting Tags
              </TabsTrigger>
              <TabsTrigger value="remarks" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none">
                Remarks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="other-details" className="space-y-4 pt-4">
              {/* Tax Preference */}
              <div className="space-y-2">
                <Label className="text-destructive">Tax Preference*</Label>
                <RadioGroup value={taxPreference} onValueChange={setTaxPreference} className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="taxable" id="tax-taxable" />
                    <Label htmlFor="tax-taxable" className="font-normal">Taxable</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="tax-exempt" id="tax-exempt" />
                    <Label htmlFor="tax-exempt" className="font-normal">Tax Exempt</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Tax Rate */}
              <div className="space-y-2">
                <Label className="text-destructive">Tax Rate*</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Tax" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hst">HST (13%)</SelectItem>
                    <SelectItem value="gst">GST (5%)</SelectItem>
                    <SelectItem value="pst">PST (8%)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  To associate more than one tax, you need to create a tax group in Settings.
                </p>
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select defaultValue="cad">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cad">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="usd">USD - US Dollar</SelectItem>
                    <SelectItem value="eur">EUR - Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Accounts Receivable */}
              <div className="space-y-2">
                <Label>Accounts Receivable</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">Accounts Receivable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Opening Balance */}
              <div className="space-y-2">
                <Label>Opening Balance</Label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 bg-muted text-muted-foreground text-sm rounded-l-md border border-r-0">CAD</span>
                  <Input className="rounded-l-none" defaultValue="0" />
                </div>
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
                    <SelectItem value="net-60">Net 60</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Enable Portal */}
              <div className="space-y-2">
                <Label>Enable Portal?</Label>
                <div className="flex items-center gap-2">
                  <Checkbox id="enable-portal" />
                  <Label htmlFor="enable-portal" className="font-normal text-sm">
                    Allow portal access for this customer
                  </Label>
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-2">
                <Label>Documents</Label>
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

              {/* Add more details */}
              <Button variant="link" className="text-primary p-0">
                Add more details
              </Button>

              {/* Customer Owner */}
              <div className="pt-4 border-t">
                <p className="text-sm">
                  <span className="font-medium">Customer Owner:</span>{" "}
                  <span className="text-muted-foreground">
                    Assign a user as the customer owner to provide access only to the data of this customer.{" "}
                    <Button variant="link" className="text-primary p-0 h-auto">Learn More</Button>
                  </span>
                </p>
              </div>
            </TabsContent>

            <TabsContent value="address" className="pt-4">
              <p className="text-muted-foreground">Address fields will appear here</p>
            </TabsContent>

            <TabsContent value="contact-persons" className="pt-4">
              <p className="text-muted-foreground">Contact persons will appear here</p>
            </TabsContent>

            <TabsContent value="custom-fields" className="pt-4">
              <p className="text-muted-foreground">Custom fields will appear here</p>
            </TabsContent>

            <TabsContent value="reporting-tags" className="pt-4">
              <p className="text-muted-foreground">Reporting tags will appear here</p>
            </TabsContent>

            <TabsContent value="remarks" className="pt-4">
              <p className="text-muted-foreground">Remarks will appear here</p>
            </TabsContent>
          </Tabs>
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
