"use client"

import { useState } from "react"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, X, ChevronDown, RefreshCw, Upload, ImageIcon, MoreVertical, ChevronRight, ArrowUpDown, Import, Download, Settings, RotateCcw, Columns } from "lucide-react"

const adjustments = [
  { id: 1, date: "Jan 20, 2026", reason: "Stock Recount", refNumber: "ADJ-001", status: "Adjusted", type: "Quantity" },
  { id: 2, date: "Jan 18, 2026", reason: "Damaged Goods", refNumber: "ADJ-002", status: "Draft", type: "Value" },
  { id: 3, date: "Jan 15, 2026", reason: "Stock Take", refNumber: "ADJ-003", status: "Adjusted", type: "Quantity" },
]

export default function InventoryAdjustmentsPage() {
  const [showNewForm, setShowNewForm] = useState(false)
  const [mode, setMode] = useState("quantity")
  const [itemRows, setItemRows] = useState([{ id: 1, item: "", qtyAvailable: 0, newQty: 0, qtyAdjusted: "" }])

  const addItemRow = () => {
    setItemRows([...itemRows, { id: itemRows.length + 1, item: "", qtyAvailable: 0, newQty: 0, qtyAdjusted: "" }])
  }

  const removeItemRow = (id: number) => {
    if (itemRows.length > 1) {
      setItemRows(itemRows.filter(row => row.id !== id))
    }
  }

  if (showNewForm) {
    return (
      <DashboardLayout activeItem="Inventory" activeSubItem="Inventory Adjustments">
        <div className="flex-1 overflow-auto">
          <div className="flex items-center justify-between px-4 py-2 border-b bg-background sticky top-0 z-10">
            <h1 className="text-sm font-medium">New Adjustment</h1>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowNewForm(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-4 max-w-3xl">
            <div className="grid grid-cols-[140px_1fr] items-start gap-2 py-1.5">
              <Label className="text-xs text-muted-foreground pt-1.5">Mode of adjustment</Label>
              <RadioGroup value={mode} onValueChange={setMode} className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="quantity" id="quantity" className="h-3 w-3" />
                  <Label htmlFor="quantity" className="text-xs font-normal cursor-pointer">Quantity Adjustment</Label>
                </div>
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="value" id="value" className="h-3 w-3" />
                  <Label htmlFor="value" className="text-xs font-normal cursor-pointer">Value Adjustment</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-[140px_1fr] items-center gap-2 py-1.5">
              <Label className="text-xs text-muted-foreground">Reference Number</Label>
              <div className="flex gap-1 max-w-[220px]">
                <Input className="h-7 text-xs" />
                <Button variant="outline" size="icon" className="h-7 w-7 shrink-0 bg-transparent">
                  <RefreshCw className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-[140px_1fr] items-center gap-2 py-1.5">
              <Label className="text-xs text-primary">Date*</Label>
              <Input className="h-7 text-xs max-w-[220px]" type="date" defaultValue="2026-01-23" />
            </div>

            <div className="grid grid-cols-[140px_1fr] items-center gap-2 py-1.5">
              <Label className="text-xs text-primary">Account*</Label>
              <Select defaultValue="cogs">
                <SelectTrigger className="h-7 text-xs max-w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cogs" className="text-xs">Cost of Goods Sold</SelectItem>
                  <SelectItem value="inventory" className="text-xs">Inventory Asset</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-[140px_1fr] items-center gap-2 py-1.5">
              <Label className="text-xs text-primary">Reason*</Label>
              <Select>
                <SelectTrigger className="h-7 text-xs max-w-[220px]">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recount" className="text-xs">Stock Recount</SelectItem>
                  <SelectItem value="damaged" className="text-xs">Damaged Goods</SelectItem>
                  <SelectItem value="stolen" className="text-xs">Stolen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-[140px_1fr] items-start gap-2 py-1.5">
              <Label className="text-xs text-muted-foreground pt-1.5">Description</Label>
              <Textarea className="text-xs min-h-[60px] max-w-md" placeholder="Max. 500 characters" />
            </div>

            <div className="mt-4 border rounded">
              <div className="flex items-center justify-between px-2 py-1.5 border-b bg-muted/30">
                <h3 className="text-xs font-medium">Item Table</h3>
                <Button variant="link" size="sm" className="text-primary h-auto p-0 text-xs">Bulk Actions</Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-6 py-1.5"></TableHead>
                    <TableHead className="text-[10px] font-medium py-1.5">ITEM DETAILS</TableHead>
                    <TableHead className="text-[10px] font-medium text-right w-28 py-1.5">QUANTITY AVAILABLE</TableHead>
                    <TableHead className="text-[10px] font-medium text-right w-32 py-1.5">NEW QUANTITY ON HAND</TableHead>
                    <TableHead className="text-[10px] font-medium text-right w-28 py-1.5">QUANTITY ADJUSTED</TableHead>
                    <TableHead className="w-10 py-1.5"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="py-1.5 px-1">
                        <MoreVertical className="w-3 h-3 text-muted-foreground cursor-move" />
                      </TableCell>
                      <TableCell className="py-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 border rounded bg-muted/30 flex items-center justify-center shrink-0">
                            <ImageIcon className="w-3 h-3 text-muted-foreground" />
                          </div>
                          <Input className="h-6 text-xs border-0 shadow-none focus-visible:ring-0 px-0" placeholder="Type or click to select an item." />
                        </div>
                      </TableCell>
                      <TableCell className="py-1.5 text-right text-xs text-muted-foreground">0.00</TableCell>
                      <TableCell className="py-1.5"><Input className="h-6 text-xs text-right" /></TableCell>
                      <TableCell className="py-1.5"><Input className="h-6 text-xs text-right" placeholder="Eg. +10, -10" /></TableCell>
                      <TableCell className="py-1.5">
                        <div className="flex items-center">
                          <Button variant="ghost" size="icon" className="h-5 w-5"><MoreVertical className="w-3 h-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive" onClick={() => removeItemRow(row.id)}><X className="w-3 h-3" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center gap-3 p-2 border-t">
                <Button variant="link" size="sm" className="text-primary h-auto p-0 text-xs" onClick={addItemRow}>
                  <Plus className="w-3 h-3 mr-1" />Add New Row
                </Button>
                <Button variant="link" size="sm" className="text-primary h-auto p-0 text-xs">
                  <Plus className="w-3 h-3 mr-1" />Add Items in Bulk
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <Label className="text-xs text-muted-foreground">Attach File(s) to inventory adjustment</Label>
              <div className="mt-1.5">
                <Button variant="outline" size="sm" className="h-7 text-xs bg-transparent">
                  <Upload className="w-3 h-3 mr-1.5" />Upload File<ChevronDown className="w-3 h-3 ml-1.5" />
                </Button>
                <p className="text-[10px] text-muted-foreground mt-1">You can upload a maximum of 5 files, 10MB each</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-6 pt-3 border-t">
              <Button className="bg-primary hover:bg-primary/90 h-7 text-xs">Save as Draft</Button>
              <Button variant="outline" className="h-7 text-xs bg-transparent">Convert to Adjusted</Button>
              <Button variant="ghost" className="h-7 text-xs" onClick={() => setShowNewForm(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeItem="Inventory" activeSubItem="Inventory Adjustments">
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-3 py-1.5 border-b">
          <div className="flex items-center gap-1.5">
            <h1 className="text-xs font-medium">All Inventory Adjustments</h1>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1.5">
            <Button className="bg-primary hover:bg-primary/90 h-7 text-xs" onClick={() => setShowNewForm(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" />New
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-7 w-7 bg-transparent">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2"><ArrowUpDown className="w-3.5 h-3.5" />Sort by</div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2"><Import className="w-3.5 h-3.5" />Import</div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2"><Download className="w-3.5 h-3.5" />Export</div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2 text-xs"><Settings className="w-3.5 h-3.5" />Preferences</DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 text-xs"><RotateCcw className="w-3.5 h-3.5" />Refresh List</DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 text-xs"><Columns className="w-3.5 h-3.5" />Reset Column Width</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-8 py-1.5"><Checkbox className="h-3 w-3" /></TableHead>
                <TableHead className="text-[10px] font-medium py-1.5">DATE</TableHead>
                <TableHead className="text-[10px] font-medium py-1.5">REASON</TableHead>
                <TableHead className="text-[10px] font-medium py-1.5">REFERENCE NUMBER</TableHead>
                <TableHead className="text-[10px] font-medium py-1.5">TYPE</TableHead>
                <TableHead className="text-[10px] font-medium py-1.5">STATUS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adjustments.map((adj) => (
                <TableRow key={adj.id} className="cursor-pointer hover:bg-muted/30">
                  <TableCell className="py-1.5"><Checkbox className="h-3 w-3" /></TableCell>
                  <TableCell className="py-1.5 text-xs">{adj.date}</TableCell>
                  <TableCell className="py-1.5 text-xs text-primary">{adj.reason}</TableCell>
                  <TableCell className="py-1.5 text-xs">{adj.refNumber}</TableCell>
                  <TableCell className="py-1.5 text-xs">{adj.type}</TableCell>
                  <TableCell className="py-1.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${adj.status === "Adjusted" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                      {adj.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  )
}
