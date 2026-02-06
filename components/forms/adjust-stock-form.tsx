"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { X } from "lucide-react"

interface AdjustStockFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemName: string
  currentQty: number
  costPrice: number
}

export function AdjustStockForm({ open, onOpenChange, itemName, currentQty, costPrice }: AdjustStockFormProps) {
  const [adjustmentType, setAdjustmentType] = useState("quantity")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg">Adjust Stock - {itemName}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Adjustment Type */}
          <RadioGroup value={adjustmentType} onValueChange={setAdjustmentType} className="flex gap-4">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="quantity" id="quantity-adj" />
              <Label htmlFor="quantity-adj" className="font-normal">Quantity Adjustment</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="value" id="value-adj" />
              <Label htmlFor="value-adj" className="font-normal">Value Adjustment</Label>
            </div>
          </RadioGroup>

          {/* Date and Account */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-destructive">Date*</Label>
              <Input type="date" defaultValue="2026-01-23" />
            </div>
            <div className="space-y-2">
              <Label className="text-destructive">Account*</Label>
              <Select defaultValue="cogs">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cogs">Cost of Goods Sold</SelectItem>
                  <SelectItem value="inventory">Inventory Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reference Number */}
          <div className="space-y-2">
            <Label>Reference Number</Label>
            <Input />
          </div>

          {/* Quantity Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantity Available</Label>
              <Input value={currentQty} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>New Quantity on hand</Label>
              <Input type="number" placeholder="0.00" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-destructive">Quantity Adjusted*</Label>
              <Input placeholder="Eg. +10, -10" />
            </div>
            <div className="space-y-2">
              <Label>Cost Price</Label>
              <Input value={costPrice} disabled className="bg-muted" />
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label className="text-destructive">Reason*</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="damaged">Damaged Goods</SelectItem>
                <SelectItem value="stolen">Stolen</SelectItem>
                <SelectItem value="recount">Stock Recount</SelectItem>
                <SelectItem value="returned">Returned to Supplier</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea placeholder="Max 500 characters" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t">
          <Button className="bg-primary hover:bg-primary/90">Save as Draft</Button>
          <Button variant="outline">Convert to Adjusted</Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
