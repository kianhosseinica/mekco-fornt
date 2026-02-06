"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HelpCircle, Upload } from "lucide-react"

export default function NewCustomerPage() {
  const router = useRouter()
  const [customerType, setCustomerType] = useState<"business" | "individual">("business")
  const [taxPreference, setTaxPreference] = useState<"taxable" | "tax-exempt">("taxable")

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <h1 className="text-xl font-semibold text-foreground mb-8">New Customer</h1>

          <div className="space-y-6">
            {/* Customer Type */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                Customer Type
                <HelpCircle className="w-3 h-3 text-muted-foreground" />
              </Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={customerType === "business"}
                    onChange={() => setCustomerType("business")}
                    className="w-4 h-4 text-primary"
                  />
                  <span>Business</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={customerType === "individual"}
                    onChange={() => setCustomerType("individual")}
                    className="w-4 h-4 text-primary"
                  />
                  <span>Individual</span>
                </label>
              </div>
            </div>

            {/* Primary Contact */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                Primary Contact
                <HelpCircle className="w-3 h-3 text-muted-foreground" />
              </Label>
              <div className="flex gap-2">
                <Select>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Salutation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mr">Mr.</SelectItem>
                    <SelectItem value="mrs">Mrs.</SelectItem>
                    <SelectItem value="ms">Ms.</SelectItem>
                    <SelectItem value="dr">Dr.</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="First Name" className="flex-1" />
                <Input placeholder="Last Name" className="flex-1" />
              </div>
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input placeholder="" />
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label className="text-destructive flex items-center gap-1">
                Display Name*
                <HelpCircle className="w-3 h-3 text-muted-foreground" />
              </Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select or type to add" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company">Company Name</SelectItem>
                  <SelectItem value="contact">Contact Name</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                Email Address
                <HelpCircle className="w-3 h-3 text-muted-foreground" />
              </Label>
              <Input type="email" placeholder="" />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                Phone
                <HelpCircle className="w-3 h-3 text-muted-foreground" />
              </Label>
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

            {/* Customer Language */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                Customer Language
                <HelpCircle className="w-3 h-3 text-muted-foreground" />
              </Label>
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
            <Tabs defaultValue="other-details" className="mt-6">
              <TabsList className="border-b w-full justify-start rounded-none bg-transparent h-auto p-0">
                <TabsTrigger value="other-details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">
                  Other Details
                </TabsTrigger>
                <TabsTrigger value="address" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">
                  Address
                </TabsTrigger>
                <TabsTrigger value="contact-persons" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">
                  Contact Persons
                </TabsTrigger>
                <TabsTrigger value="custom-fields" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">
                  Custom Fields
                </TabsTrigger>
                <TabsTrigger value="reporting-tags" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">
                  Reporting Tags
                </TabsTrigger>
                <TabsTrigger value="remarks" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">
                  Remarks
                </TabsTrigger>
              </TabsList>

              <TabsContent value="other-details" className="mt-6 space-y-6">
                {/* Tax Preference */}
                <div className="space-y-2">
                  <Label className="text-destructive">Tax Preference*</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={taxPreference === "taxable"}
                        onChange={() => setTaxPreference("taxable")}
                        className="w-4 h-4 text-primary"
                      />
                      <span>Taxable</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={taxPreference === "tax-exempt"}
                        onChange={() => setTaxPreference("tax-exempt")}
                        className="w-4 h-4 text-primary"
                      />
                      <span>Tax Exempt</span>
                    </label>
                  </div>
                </div>

                {/* Tax Rate */}
                <div className="space-y-2">
                  <Label className="text-destructive">Tax Rate*</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Tax" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hst-13">HST 13%</SelectItem>
                      <SelectItem value="gst-5">GST 5%</SelectItem>
                      <SelectItem value="pst-8">PST 8%</SelectItem>
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
                      <SelectItem value="cad">CAD- Canadian Dollar</SelectItem>
                      <SelectItem value="usd">USD- US Dollar</SelectItem>
                      <SelectItem value="eur">EUR- Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Accounts Receivable */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    Accounts Receivable
                    <HelpCircle className="w-3 h-3 text-muted-foreground" />
                  </Label>
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
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-sm">
                      CAD
                    </span>
                    <Input className="rounded-l-none" placeholder="" />
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
                      <SelectItem value="net-45">Net 45</SelectItem>
                      <SelectItem value="net-60">Net 60</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Enable Portal */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    Enable Portal?
                    <HelpCircle className="w-3 h-3 text-muted-foreground" />
                  </Label>
                  <div className="flex items-center gap-2">
                    <Checkbox id="enable-portal" />
                    <Label htmlFor="enable-portal" className="font-normal">
                      Allow portal access for this customer
                    </Label>
                  </div>
                </div>

                {/* Documents */}
                <div className="space-y-2">
                  <Label>Documents</Label>
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <Upload className="w-4 h-4" />
                    Upload File
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    You can upload a maximum of 10 files, 10MB each
                  </p>
                </div>

                {/* Add more details */}
                <Button variant="link" className="text-primary p-0 h-auto">
                  Add more details
                </Button>

                {/* Customer Owner */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">Customer Owner:</span> Assign a user as the customer owner to provide access only to the data of this customer.{" "}
                    <Button variant="link" className="text-primary p-0 h-auto">
                      Learn More
                    </Button>
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="address" className="mt-6">
                <p className="text-muted-foreground">Address details form...</p>
              </TabsContent>

              <TabsContent value="contact-persons" className="mt-6">
                <p className="text-muted-foreground">Contact persons form...</p>
              </TabsContent>

              <TabsContent value="custom-fields" className="mt-6">
                <p className="text-muted-foreground">Custom fields form...</p>
              </TabsContent>

              <TabsContent value="reporting-tags" className="mt-6">
                <p className="text-muted-foreground">Reporting tags form...</p>
              </TabsContent>

              <TabsContent value="remarks" className="mt-6">
                <p className="text-muted-foreground">Remarks form...</p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t">
            <Button className="bg-primary hover:bg-primary/90">
              Save
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
