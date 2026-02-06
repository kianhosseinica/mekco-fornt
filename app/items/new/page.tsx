"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X, ImageIcon, HelpCircle } from "lucide-react"

export default function NewItemPage() {
  const router = useRouter()
  const [itemType, setItemType] = useState<"goods" | "service">("goods")
  const [taxPreference, setTaxPreference] = useState<"taxable" | "non-taxable">("taxable")
  const [sellable, setSellable] = useState(true)
  const [purchasable, setPurchasable] = useState(true)
  const [trackInventory, setTrackInventory] = useState(false)

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-semibold text-foreground">New Item</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Form */}
            <div className="flex-1 space-y-6">
              {/* Type */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Type
                  <HelpCircle className="w-3 h-3 text-muted-foreground" />
                </Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={itemType === "goods"}
                      onChange={() => setItemType("goods")}
                      className="w-4 h-4 text-primary"
                    />
                    <span>Goods</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={itemType === "service"}
                      onChange={() => setItemType("service")}
                      className="w-4 h-4 text-primary"
                    />
                    <span>Service</span>
                  </label>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label className="text-destructive">Name*</Label>
                <Input placeholder="" />
              </div>

              {/* SKU */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  SKU
                  <HelpCircle className="w-3 h-3 text-muted-foreground" />
                </Label>
                <Input placeholder="" />
              </div>

              {/* Unit */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Unit
                  <HelpCircle className="w-3 h-3 text-muted-foreground" />
                </Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select or type to add" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pcs">Pieces</SelectItem>
                    <SelectItem value="kg">Kilograms</SelectItem>
                    <SelectItem value="m">Meters</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* UPC and Reorder QTY */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>UPC</Label>
                  <Input placeholder="" />
                </div>
                <div className="space-y-2">
                  <Label>Reorder QTY</Label>
                  <Input placeholder="" />
                </div>
              </div>

              {/* Sales Information */}
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Sales Information</h3>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="sellable"
                      checked={sellable}
                      onCheckedChange={(checked) => setSellable(checked as boolean)}
                    />
                    <Label htmlFor="sellable" className="text-sm">Sellable</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-destructive">Selling Price*</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-sm">
                      CAD
                    </span>
                    <Input className="rounded-l-none" placeholder="" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-destructive">Account*</Label>
                  <Select defaultValue="sales">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="" rows={3} />
                </div>

                <div className="space-y-2">
                  <Label className="text-destructive">Tax Preference *</Label>
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
                        checked={taxPreference === "non-taxable"}
                        onChange={() => setTaxPreference("non-taxable")}
                        className="w-4 h-4 text-primary"
                      />
                      <span>Non-Taxable</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Purchase Information */}
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Purchase Information</h3>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="purchasable"
                      checked={purchasable}
                      onCheckedChange={(checked) => setPurchasable(checked as boolean)}
                    />
                    <Label htmlFor="purchasable" className="text-sm">Purchasable</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-destructive">Cost Price*</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-sm">
                      CAD
                    </span>
                    <Input className="rounded-l-none" placeholder="" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-destructive">Account*</Label>
                  <Select defaultValue="cogs">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cogs">Cost of Goods Sold</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="" rows={3} />
                </div>

                <div className="space-y-2">
                  <Label>Preferred Vendor</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vendor1">Vendor 1</SelectItem>
                      <SelectItem value="vendor2">Vendor 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Track Inventory */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="trackInventory"
                    checked={trackInventory}
                    onCheckedChange={(checked) => setTrackInventory(checked as boolean)}
                  />
                  <Label htmlFor="trackInventory" className="flex items-center gap-1">
                    Track Inventory for this item
                    <HelpCircle className="w-3 h-3 text-muted-foreground" />
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  You cannot enable/disable inventory tracking once you{"'"}ve created transactions for this item
                </p>
              </div>
            </div>

            {/* Image Upload */}
            <div className="lg:w-64">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag image(s) here or
                </p>
                <Button variant="link" className="text-primary">
                  Browse images
                </Button>
              </div>
            </div>
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
