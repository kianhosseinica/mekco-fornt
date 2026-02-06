"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { ImageIcon, X } from "lucide-react"

interface NewItemFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editMode?: boolean
  itemData?: {
    name: string
    sku: string
    type: "goods" | "service"
    sellingPrice: string
    costPrice: string
    description: string
  }
}

export function NewItemForm({ open, onOpenChange, editMode = false, itemData }: NewItemFormProps) {
  const [type, setType] = useState<"goods" | "service">(itemData?.type || "goods")
  const [taxPreference, setTaxPreference] = useState("taxable")
  const [trackInventory, setTrackInventory] = useState(true)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{editMode ? "Edit Item" : "New Item"}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <RadioGroup value={type} onValueChange={(v) => setType(v as "goods" | "service")} className="flex gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="goods" id="goods" />
                  <Label htmlFor="goods" className="font-normal">Goods</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="service" id="service" />
                  <Label htmlFor="service" className="font-normal">Service</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="text-destructive">Name*</Label>
              <Input defaultValue={itemData?.name} />
            </div>

            <div className="space-y-2">
              <Label>SKU</Label>
              <Input defaultValue={itemData?.sku} />
            </div>

            <div className="space-y-2">
              <Label>Unit</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select or type to add" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pcs">pcs</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="box">box</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>UPC</Label>
                <Input />
              </div>
              <div className="space-y-2">
                <Label>Reorder QTY</Label>
                <Input type="number" />
              </div>
            </div>

            {/* Sales Information */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Sales Information</h3>
                <div className="flex items-center gap-2">
                  <Checkbox id="sellable" defaultChecked />
                  <Label htmlFor="sellable" className="font-normal text-sm">Sellable</Label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-destructive">Selling Price*</Label>
                  <div className="flex gap-2">
                    <span className="flex items-center px-3 bg-muted text-muted-foreground text-sm rounded-l-md border border-r-0">CAD</span>
                    <Input className="rounded-l-none" defaultValue={itemData?.sellingPrice || "0"} />
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
                  <Textarea defaultValue={itemData?.description} />
                </div>

                <div className="space-y-2">
                  <Label className="text-destructive">Tax Preference *</Label>
                  <RadioGroup value={taxPreference} onValueChange={setTaxPreference} className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="taxable" id="taxable" />
                      <Label htmlFor="taxable" className="font-normal">Taxable</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="non-taxable" id="non-taxable" />
                      <Label htmlFor="non-taxable" className="font-normal">Non-Taxable</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Image Upload */}
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Drag image(s) here or</p>
              <Button variant="link" className="text-primary">Browse images</Button>
            </div>

            {/* Purchase Information */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Purchase Information</h3>
                <div className="flex items-center gap-2">
                  <Checkbox id="purchasable" defaultChecked />
                  <Label htmlFor="purchasable" className="font-normal text-sm">Purchasable</Label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-destructive">Cost Price*</Label>
                  <div className="flex gap-2">
                    <span className="flex items-center px-3 bg-muted text-muted-foreground text-sm rounded-l-md border border-r-0">CAD</span>
                    <Input className="rounded-l-none" defaultValue={itemData?.costPrice || "0"} />
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
                      <SelectItem value="inventory">Inventory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea />
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
            </div>

            {/* Track Inventory */}
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 mb-2">
                <Checkbox 
                  id="track-inventory" 
                  checked={trackInventory}
                  onCheckedChange={(checked) => setTrackInventory(checked as boolean)}
                />
                <Label htmlFor="track-inventory" className="font-medium">Track Inventory for this item</Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                You cannot enable/disable inventory tracking once you've created transactions for this item
              </p>

              {trackInventory && (
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-destructive">Inventory Account*</Label>
                    <Select defaultValue="inventory-asset">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inventory-asset">Inventory Asset</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-destructive">Inventory Valuation Method*</Label>
                    <Select defaultValue="fifo">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fifo">FIFO (First In First Out)</SelectItem>
                        <SelectItem value="lifo">LIFO (Last In First Out)</SelectItem>
                        <SelectItem value="avg">Average Cost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Reorder Point</Label>
                    <Input type="number" />
                  </div>

                  <div className="bg-primary/10 p-3 rounded-md text-sm flex items-start gap-2">
                    <span className="text-primary font-medium">NOTE:</span>
                    <span>You can add opening stock on the Item Details page.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
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
