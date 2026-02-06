"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  ChevronDown,
  Plus,
  MoreHorizontal,
  Search,
  RefreshCw,
  X,
  ImageIcon,
  Pencil,
  Copy,
  EyeOff,
  Trash,
  Lock,
  ArrowUpDown,
  Import,
  Download,
  Settings,
  RotateCcw,
  Columns,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Info
} from "lucide-react"

interface WarehouseDetail {
  warehouse: string
  unitType: string
  quantity: number
}

interface Item {
  id: number
  name: string
  sku: string
  purchaseDesc: string
  purchaseRate: number
  description: string
  rate: number
  stockOnHand: number
  usageUnit: number
  itemType: string
  createdSource: string
  taxPreference: string
  inventoryAccount: string
  valuationMethod: string
  costPrice: number
  purchaseAccount: string
  sellingPrice: number
  salesAccount: string
  openingStock: number
  committedStock: number
  availableForSale: number
  toBeInvoiced: number
  toBeBilled: number
  draftedQty?: number
  orderedQty?: number
  acknowledgedQty?: number
  shippedReceivingQty?: number
  backOrderedQty?: number
  billedQty?: number
  defectiveQty?: number
  returnedQty?: number
  warehouseDetails?: WarehouseDetail[]
  imageUrl?: string | null
  imageUrls?: string[]
  imageEntries?: { url: string; id: number | null; kind: string }[]
  // Full detail (from item_detail API) – product
  slug?: string
  additionalInfo?: string | null
  keyFeatures?: string | null
  specificationsSummary?: string | null
  onlinePrice?: number | null
  quantity?: number
  systemId?: string | null
  categoryId?: number | null
  categoryName?: string | null
  subcategoryId?: number | null
  subcategoryName?: string | null
  brandId?: number | null
  brandName?: string | null
  vendorId?: number | null
  vendorName?: string | null
  weight?: number | null
  length?: number | null
  width?: number | null
  height?: number | null
  publishToEcommerce?: boolean
  displaySize?: string | null
  displayColor?: string | null
  trending?: boolean
  bestSelling?: boolean
  mostPopular?: boolean
  justArrived?: boolean
  isRefundable?: boolean
  disableSinglePieceSales?: boolean
  mekcoNetCurrency?: string | null
  mekcoNetValue?: number | null
  currencyRateId?: number | null
  displaySizeId?: number | null
  // Full detail – variation only
  productName?: string | null
  productSlug?: string | null
  size?: string | null
  sizeId?: number | null
  color?: string | null
  variationId?: string | null
  manufacturerSku?: string | null
  ean?: string | null
  upc?: string | null
  customSku?: string | null
  bagSku?: string | null
  boxSku?: string | null
  priceSingle?: number
  stockSingle?: number
  discountPrice?: number | null
  bagSize?: number
  priceBag?: number | null
  boxSize?: number
  priceBox?: number | null
  bagWeight?: number | null
  bagLength?: number | null
  bagWidth?: number | null
  bagHeight?: number | null
  boxWeight?: number | null
  boxLength?: number | null
  boxWidth?: number | null
  boxHeight?: number | null
  polyBagSku?: string | null
  polyBagSize?: number
  pricePolyBag?: number | null
  polyBagWeight?: number | null
  polyBagLength?: number | null
  polyBagWidth?: number | null
  polyBagHeight?: number | null
  masterCartonSku?: string | null
  masterCartonSize?: number
  priceMasterCarton?: number | null
  masterCartonWeight?: number | null
  masterCartonLength?: number | null
  masterCartonWidth?: number | null
  masterCartonHeight?: number | null
  palletSkidSku?: string | null
  palletSkidSize?: number
  pricePalletSkid?: number | null
  palletSkidWeight?: number | null
  palletSkidLength?: number | null
  palletSkidWidth?: number | null
  palletSkidHeight?: number | null
}

const API_BASE = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_API_ORIGIN || ""

type ViewMode = "table" | "detail" | "new" | "edit" | "adjust"

export default function ItemsPage() {
  const searchParams = useSearchParams()
  const searchQuery = (searchParams.get("search") ?? "").trim()
  const [viewMode, setViewMode] = useState<ViewMode>("table")
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [trackInventory, setTrackInventory] = useState(false)
  const [adjustType, setAdjustType] = useState<"quantity" | "value">("quantity")
  const [itemsList, setItemsList] = useState<Item[]>([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const ITEMS_PER_PAGE = 20
  const [detailImageUrls, setDetailImageUrls] = useState<string[]>([])
  const [detailImageEntries, setDetailImageEntries] = useState<{ url: string; id: number | null; kind: string }[]>([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [imageActionLoading, setImageActionLoading] = useState(false)
  const detailImageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  useEffect(() => {
    setLoadingItems(true)
    const params = new URLSearchParams()
    if (searchQuery) params.set("search", searchQuery)
    params.set("limit", String(ITEMS_PER_PAGE))
    params.set("page", String(currentPage))
    const url = `${API_BASE}/api/zoho/items/?${params.toString()}`
    fetch(url)
      .then((res) => res.json())
      .then((data: { items?: Item[]; total?: number }) => {
        const apiItems = data?.items ?? []
        setTotalItems(data?.total ?? apiItems.length)
        setItemsList(apiItems.map((i) => ({
          ...i,
          warehouseDetails: (i.warehouseDetails ?? []).map((wd) => ({
            warehouse: wd.warehouse ?? "",
            unitType: wd.unitType ?? "Pieces",
            quantity: wd.quantity ?? 0,
          })),
        })))
      })
      .catch(() => { })
      .finally(() => setLoadingItems(false))
  }, [searchQuery, currentPage])

  const handleItemClick = (item: Item) => {
    setSelectedItem(item)
    const urls = item.imageUrls?.length ? item.imageUrls : item.imageUrl ? [item.imageUrl] : []
    setDetailImageUrls(urls)
    setDetailImageEntries(item.imageEntries ?? urls.map((url) => ({ url, id: null, kind: "product" as const })))
    setSelectedImageIndex(0)
    setViewMode("detail")
  }

  const handleNewItem = () => {
    setSelectedItem(null)
    setTrackInventory(false)
    setViewMode("new")
  }

  const handleEditItem = async () => {
    if (!selectedItem) return
    setTrackInventory(true)
    try {
      const res = await fetch(`${API_BASE}/api/zoho/items/${selectedItem.id}/`)
      if (res.ok) {
        const full = await res.json()
        setSelectedItem((prev) => (prev ? { ...prev, ...full } : null))
      }
      setViewMode("edit")
    } catch {
      setViewMode("edit")
    }
  }

  const handleAdjustStock = () => {
    setViewMode("adjust")
  }

  const handleClose = () => {
    setViewMode("table")
    setSelectedItem(null)
  }

  const handleBack = () => {
    if (viewMode === "adjust" || viewMode === "edit") {
      setViewMode("detail")
    } else {
      setViewMode("table")
    }
  }

  const handleDetailRemoveImage = async (index: number) => {
    if (!selectedItem) return
    setImageActionLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/zoho/items/${selectedItem.id}/images/remove/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || res.statusText)
      }
      setDetailImageUrls((prev) => prev.filter((_, i) => i !== index))
      setDetailImageEntries((prev) => prev.filter((_, i) => i !== index))
      setSelectedImageIndex((i) => {
        if (index < i) return i - 1
        if (index === i) return Math.max(0, Math.min(i, detailImageUrls.length - 2))
        return i
      })
    } catch (err) {
      console.error(err)
    } finally {
      setImageActionLoading(false)
    }
  }

  const handleDetailChangeImage = () => {
    detailImageInputRef.current?.click()
  }

  const handleDetailImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file || !file.type.startsWith("image/") || !selectedItem) return
    setImageActionLoading(true)
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch(`${API_BASE}/api/zoho/items/${selectedItem.id}/images/`, {
        method: "POST",
        body: form,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || res.statusText)
      }
      const data = await res.json()
      setDetailImageUrls((prev) => [...prev, data.url])
      setDetailImageEntries((prev) => [...prev, { url: data.url, id: data.id, kind: data.kind ?? "product" }])
      setSelectedImageIndex(detailImageUrls.length)
    } catch (err) {
      console.error(err)
    } finally {
      setImageActionLoading(false)
    }
  }

  // IMAGE 1: Table View
  const renderTableView = () => (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-end mb-2">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-7 text-xs" onClick={handleNewItem}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          New
        </Button>
      </div>
      <div className="overflow-x-auto border rounded -mx-2 sm:mx-0 max-w-full">
        <table className="w-full min-w-[800px] text-xs">
          <thead className="bg-muted/30">
            <tr className="border-b">
              <th className="w-8 py-1.5 px-2"><Checkbox className="h-3 w-3" /></th>
              <th className="w-8 py-1.5 px-1"></th>
              <th className="py-1.5 px-2 text-left font-medium text-muted-foreground text-[10px]">NAME</th>
              <th className="py-1.5 px-2 text-left font-medium text-muted-foreground text-[10px]">SKU</th>
              <th className="py-1.5 px-2 text-left font-medium text-muted-foreground text-[10px]">PURCHASE DESCRIPTION</th>
              <th className="py-1.5 px-2 text-right font-medium text-muted-foreground text-[10px]">PURCHASE RATE</th>
              <th className="py-1.5 px-2 text-left font-medium text-muted-foreground text-[10px]">DESCRIPTION</th>
              <th className="py-1.5 px-2 text-right font-medium text-muted-foreground text-[10px]">RATE</th>
              <th className="py-1.5 px-2 text-right font-medium text-muted-foreground text-[10px]">STOCK ON HAND</th>
              <th className="py-1.5 px-2 text-right font-medium text-muted-foreground text-[10px]">USAGE UNIT</th>
            </tr>
          </thead>
          <tbody>
            {loadingItems && itemsList.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-muted-foreground text-sm">
                  Loading items...
                </td>
              </tr>
            ) : (
              itemsList.map((item) => (
                <tr
                  key={item.id}
                  className="border-b hover:bg-muted/30 cursor-pointer"
                  onClick={() => handleItemClick(item)}
                >
                  <td className="py-1.5 px-2" onClick={(e) => e.stopPropagation()}><Checkbox className="h-3 w-3" /></td>
                  <td className="py-1.5 px-1">
                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center overflow-hidden shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </td>
                  <td className="py-1.5 px-2">
                    <span className="text-primary hover:underline text-xs">{item.name}</span>
                  </td>
                  <td className="py-1.5 px-2 text-muted-foreground">{item.sku}</td>
                  <td className="py-1.5 px-2 text-muted-foreground max-w-[180px] truncate">{item.purchaseDesc}</td>
                  <td className="py-1.5 px-2 text-right">${item.purchaseRate.toFixed(2)}</td>
                  <td className="py-1.5 px-2 text-muted-foreground max-w-[180px] truncate">{item.description}</td>
                  <td className="py-1.5 px-2 text-right">${item.rate.toFixed(2)}</td>
                  <td className="py-1.5 px-2 text-right">{item.stockOnHand}</td>
                  <td className="py-1.5 px-2 text-right">{item.usageUnit}</td>
                </tr>
              )))}
          </tbody>
        </table>
      </div>
      {viewMode === "table" && totalItems > 0 && (
        <div className="flex items-center justify-between mt-3 text-xs">
          <span className="text-muted-foreground">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="px-2 text-muted-foreground">
              Page {currentPage} of {Math.ceil(totalItems / ITEMS_PER_PAGE) || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              disabled={currentPage >= Math.ceil(totalItems / ITEMS_PER_PAGE)}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )

  // IMAGE 3: Detail View with Sidebar
  const renderDetailView = () => (
    <div className="flex-1 overflow-y-auto min-h-0">
      <div className="px-3 py-2 border-b bg-card flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-sm font-medium truncate max-w-[400px]">{selectedItem?.name}</h1>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleEditItem}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button className="bg-primary hover:bg-primary/90 h-7 text-xs" onClick={handleAdjustStock}>
            Adjust Stock
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-7 text-xs bg-transparent">
                More
                <ChevronDown className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem className="gap-2 text-xs"><Copy className="w-3.5 h-3.5" />Clone Item</DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-xs"><EyeOff className="w-3.5 h-3.5" />Mark as Inactive</DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-xs text-destructive"><Trash className="w-3.5 h-3.5" />Delete</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Button size="sm" className="w-full bg-primary hover:bg-primary/90 h-6 text-xs">
                  <Lock className="w-3 h-3 mr-1" />
                  Lock Item
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleClose}>
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <div className="border-b bg-card px-3">
          <TabsList className="h-auto bg-transparent p-0">
            <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-2 text-xs">Overview</TabsTrigger>
            <TabsTrigger value="transactions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-2 text-xs">Transactions</TabsTrigger>
            <TabsTrigger value="history" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-2 text-xs">History</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="p-4 sm:p-6 m-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-muted-foreground text-[10px]">Item Type</span><p className="mt-0.5">{selectedItem?.itemType}</p></div>
                <div><span className="text-muted-foreground text-[10px]">SKU</span><p className="mt-0.5">{selectedItem?.sku}</p></div>
                <div><span className="text-muted-foreground text-[10px]">Created Source</span><p className="mt-0.5">{selectedItem?.createdSource}</p></div>
                <div><span className="text-muted-foreground text-[10px]">Tax Preference</span><p className="mt-0.5">{selectedItem?.taxPreference}</p></div>
                <div><span className="text-muted-foreground text-[10px]">Inventory Account</span><p className="mt-0.5">{selectedItem?.inventoryAccount}</p></div>
                <div><span className="text-muted-foreground text-[10px]">Inventory Valuation Method</span><p className="mt-0.5">{selectedItem?.valuationMethod}</p></div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-medium">Purchase Information</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-muted-foreground text-[10px]">Cost Price</span><p className="mt-0.5">${selectedItem?.costPrice.toFixed(2)}</p></div>
                  <div><span className="text-muted-foreground text-[10px]">Purchase Account</span><p className="mt-0.5">{selectedItem?.purchaseAccount}</p></div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-medium">Sales Information</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-muted-foreground text-[10px]">Selling Price</span><p className="mt-0.5">${selectedItem?.sellingPrice.toFixed(2)}</p></div>
                  <div><span className="text-muted-foreground text-[10px]">Sales Account</span><p className="mt-0.5">{selectedItem?.salesAccount}</p></div>
                  <div className="col-span-2"><span className="text-muted-foreground text-[10px]">Description</span><p className="mt-0.5">{selectedItem?.description}</p></div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-medium">Reporting Tags</h3>
                <p className="text-xs text-muted-foreground">No reporting tag has been associated with this item.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-medium">Warehouse details (quantities per warehouse)</h3>
                <div className="border rounded text-xs overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="py-1.5 px-2 text-left font-medium text-muted-foreground">Warehouse</th>
                        <th className="py-1.5 px-2 text-left font-medium text-muted-foreground">Unit type</th>
                        <th className="py-1.5 px-2 text-right font-medium text-muted-foreground">Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedItem?.warehouseDetails?.length ?? 0) > 0 ? (
                        selectedItem?.warehouseDetails?.map((wd, i) => (
                          <tr key={i} className="border-t">
                            <td className="py-1.5 px-2">{wd.warehouse}</td>
                            <td className="py-1.5 px-2">{wd.unitType}</td>
                            <td className="py-1.5 px-2 text-right">{wd.quantity}</td>
                          </tr>
                        ))
                      ) : (
                        <tr className="border-t">
                          <td colSpan={3} className="py-3 px-2 text-muted-foreground">No warehouse details yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Implementation pending (purchases/invoices).</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border rounded overflow-hidden bg-muted/20">
                {detailImageUrls.length > 0 ? (
                  <div className="p-3 space-y-3">
                    <div className="relative flex items-center justify-center">
                      {detailImageUrls.length > 1 && (
                        <Button type="button" variant="outline" size="icon" className="absolute left-0 z-10 h-8 w-8 rounded-full shrink-0" onClick={() => setSelectedImageIndex((i) => (i <= 0 ? detailImageUrls.length - 1 : i - 1))} aria-label="Previous image">
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                      )}
                      <div className="min-h-[280px] w-full max-w-[320px] rounded border bg-muted/30 overflow-hidden flex items-center justify-center">
                        <img src={detailImageUrls[selectedImageIndex]} alt="" className="max-h-[320px] w-full object-contain" />
                      </div>
                      {detailImageUrls.length > 1 && (
                        <Button type="button" variant="outline" size="icon" className="absolute right-0 z-10 h-8 w-8 rounded-full shrink-0" onClick={() => setSelectedImageIndex((i) => (i >= detailImageUrls.length - 1 ? 0 : i + 1))} aria-label="Next image">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {detailImageUrls.length > 1 ? (
                      <div className="flex flex-wrap gap-2">
                        {detailImageUrls.map((url, idx) => (
                          <div key={idx} className={`relative group rounded border overflow-hidden shrink-0 cursor-pointer ${selectedImageIndex === idx ? "ring-2 ring-primary" : ""}`} onClick={() => setSelectedImageIndex(idx)}>
                            <img src={url} alt="" className="w-16 h-16 object-cover" />
                            <button type="button" onClick={(e) => { e.stopPropagation(); handleDetailRemoveImage(idx); }} disabled={imageActionLoading} className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs" aria-label="Remove"><X className="w-2.5 h-2.5" /></button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <div className="flex items-center gap-2 flex-wrap">
                      {detailImageUrls.length > 1 && (
                        <Button type="button" variant="outline" size="icon" className="h-7 w-7 shrink-0" onClick={() => setSelectedImageIndex((i) => (i <= 0 ? detailImageUrls.length - 1 : i - 1))} aria-label="Previous image"><ChevronLeft className="h-3.5 w-3.5" /></Button>
                      )}
                      <Button type="button" variant="outline" size="sm" className="text-xs h-7" onClick={handleDetailChangeImage} disabled={imageActionLoading}>Change image</Button>
                      <Button type="button" variant="outline" size="sm" className="text-xs h-7" onClick={() => handleDetailRemoveImage(selectedImageIndex)} disabled={imageActionLoading || detailImageUrls.length === 0}>Remove</Button>
                      {detailImageUrls.length > 1 && (
                        <Button type="button" variant="outline" size="icon" className="h-7 w-7 shrink-0" onClick={() => setSelectedImageIndex((i) => (i >= detailImageUrls.length - 1 ? 0 : i + 1))} aria-label="Next image"><ChevronRight className="h-3.5 w-3.5" /></Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded p-4 text-center">
                    <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">Drag image(s) here or</p>
                    <button type="button" className="text-xs text-primary hover:underline" onClick={handleDetailChangeImage}>Browse images</button>
                  </div>
                )}
                <input ref={detailImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleDetailImageFileChange} />
              </div>

              <div className="space-y-3 overflow-x-hidden">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs text-muted-foreground">Opening Stock</span>
                  <button className="text-xs text-primary flex items-center gap-1"><Pencil className="w-3 h-3" />Edit</button>
                </div>
                <p className="text-lg font-semibold">{selectedItem?.openingStock}</p>

                <div><span className="text-xs text-muted-foreground">Stock on Hand</span><p className="text-lg font-semibold">{selectedItem?.stockOnHand}</p></div>
                <div><span className="text-xs text-muted-foreground">Committed Stock</span><p className="text-lg font-semibold">{selectedItem?.committedStock}</p></div>
                <div><span className="text-xs text-muted-foreground">Available for Sale</span><p className="text-lg font-semibold">{selectedItem?.availableForSale}</p></div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                  <div><p className="text-lg font-semibold">{selectedItem?.toBeInvoiced ?? 0} <span className="text-[10px] text-muted-foreground font-normal">Qty</span></p><p className="text-[10px] text-muted-foreground">To be Invoiced</p></div>
                  <div><p className="text-lg font-semibold">{selectedItem?.toBeBilled ?? 0} <span className="text-[10px] text-muted-foreground font-normal">Qty</span></p><p className="text-[10px] text-muted-foreground">To be Billed</p></div>
                  <div><p className="text-lg font-semibold">{selectedItem?.draftedQty ?? 0} <span className="text-[10px] text-muted-foreground font-normal">Qty</span></p><p className="text-[10px] text-muted-foreground">Drafted QTY</p></div>
                  <div><p className="text-lg font-semibold">{selectedItem?.orderedQty ?? 0} <span className="text-[10px] text-muted-foreground font-normal">Qty</span></p><p className="text-[10px] text-muted-foreground">Ordered QTY</p></div>
                  <div><p className="text-lg font-semibold">{selectedItem?.acknowledgedQty ?? 0} <span className="text-[10px] text-muted-foreground font-normal">Qty</span></p><p className="text-[10px] text-muted-foreground">Acknowledged Qty</p></div>
                  <div><p className="text-lg font-semibold">{selectedItem?.shippedReceivingQty ?? 0} <span className="text-[10px] text-muted-foreground font-normal">Qty</span></p><p className="text-[10px] text-muted-foreground">Shipped (Receiving) QTY</p></div>
                  <div><p className="text-lg font-semibold">{selectedItem?.backOrderedQty ?? 0} <span className="text-[10px] text-muted-foreground font-normal">Qty</span></p><p className="text-[10px] text-muted-foreground">Back ordered QTY</p></div>
                  <div><p className="text-lg font-semibold">{selectedItem?.billedQty ?? 0} <span className="text-[10px] text-muted-foreground font-normal">Qty</span></p><p className="text-[10px] text-muted-foreground">Billed Qty</p></div>
                  <div><p className="text-lg font-semibold">{selectedItem?.defectiveQty ?? 0} <span className="text-[10px] text-muted-foreground font-normal">Qty</span></p><p className="text-[10px] text-muted-foreground">Defective QTY</p></div>
                  <div><p className="text-lg font-semibold">{selectedItem?.returnedQty ?? 0} <span className="text-[10px] text-muted-foreground font-normal">Qty</span></p><p className="text-[10px] text-muted-foreground">Returned QTY</p></div>
                </div>

                <div className="pt-3 border-t">
                  <span className="text-xs text-muted-foreground">Reorder Point</span>
                  <button className="text-xs text-primary block mt-0.5">+ Add</button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="transactions" className="p-6 m-0">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Customers Transactions</h3>
              <p className="text-xs text-muted-foreground mb-2">Relation:</p>
              <ol className="list-decimal list-inside text-xs space-y-1">
                <li>Sales</li>
                <li>Returns/Refunds</li>
              </ol>
              <p className="text-muted-foreground text-xs mt-3">No transactions yet.</p>
            </div>
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium mb-2">Vendors Transactions</h3>
              <p className="text-xs text-muted-foreground mb-2">Relation:</p>
              <ol className="list-decimal list-inside text-xs space-y-1">
                <li>Purchases</li>
                <li>Returns/Refunds</li>
              </ol>
              <p className="text-muted-foreground text-xs mt-3">No transactions yet.</p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="history" className="p-6 m-0">
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs px-2 py-1 rounded bg-muted">Add</span>
              <span className="text-xs px-2 py-1 rounded bg-muted">Delete</span>
              <span className="text-xs px-2 py-1 rounded bg-muted">Update</span>
              <span className="text-xs px-2 py-1 rounded bg-muted">Transfer</span>
            </div>
            <p className="text-xs text-muted-foreground">Full log: who updated, when, what updated. Implementation pending (purchases/invoices).</p>
            <p className="text-muted-foreground text-xs">No history available.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )

  // IMAGE 2: New Item Form – full product + variations, fixed layout (not responsive)
  const [newHasVariations, setNewHasVariations] = useState(false)
  const [newVariationCount, setNewVariationCount] = useState(1)

  type Option = { id: number; name: string }
  type SubcategoryOption = { id: number; name: string; categoryId: number }
  type CurrencyRateOption = { id: number; name: string; currency: string; rateToCad: number }
  const [itemOptions, setItemOptions] = useState<{
    sizes: Option[]
    categories: Option[]
    subcategories: SubcategoryOption[]
    brands: Option[]
    vendors: Option[]
    currencyRates: CurrencyRateOption[]
  }>({
    sizes: [],
    categories: [],
    subcategories: [],
    brands: [],
    vendors: [],
    currencyRates: [],
  })
  useEffect(() => {
    fetch(`${API_BASE}/api/zoho/items/options/`)
      .then((res) => res.json())
      .then((data: { sizes?: Option[]; categories?: Option[]; subcategories?: SubcategoryOption[]; brands?: Option[]; vendors?: Option[]; currencyRates?: CurrencyRateOption[] }) => {
        setItemOptions({
          sizes: data.sizes ?? [],
          categories: data.categories ?? [],
          subcategories: data.subcategories ?? [],
          brands: data.brands ?? [],
          vendors: data.vendors ?? [],
          currencyRates: data.currencyRates ?? [],
        })
      })
      .catch(() => { })
  }, [])

  const renderNewItemForm = () => (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium">New Item</h1>
        <Button variant="ghost" size="icon" onClick={handleClose}><X className="w-5 h-5" /></Button>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Basic product details */}
        <div className="space-y-4 col-span-2 border-b pb-6">
          <h3 className="font-medium">Basic</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2"><input type="radio" name="newType" defaultChecked className="w-4 h-4 accent-primary" />Goods</label>
                <label className="flex items-center gap-2"><input type="radio" name="newType" className="w-4 h-4" />Service</label>
              </div>
            </div>
            <div className="space-y-2"><Label className="text-destructive">Name*</Label><Input /></div>
            <div className="space-y-2"><Label>SKU</Label><Input /></div>
            <div className="space-y-2"><Label>Slug</Label><Input /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea className="resize-none" rows={2} /></div>
            <div className="space-y-2"><Label>Additional Info</Label><Textarea className="resize-none" rows={2} /></div>
            <div className="space-y-2"><Label>Key Features</Label><Textarea className="resize-none" rows={2} /></div>
            <div className="space-y-2"><Label>Specifications Summary</Label><Textarea className="resize-none" rows={2} /></div>
          </div>
        </div>

        {/* Product identifiers */}
        <div className="space-y-4 border-b pb-6">
          <h3 className="font-medium">Identifiers</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Custom SKU</Label><Input /></div>
            <div className="space-y-2"><Label>Manufacturer SKU</Label><Input /></div>
            <div className="space-y-2"><Label>UPC</Label><Input /></div>
            <div className="space-y-2"><Label>EAN</Label><Input /></div>
          </div>
        </div>

        {/* Product pricing & cost */}
        <div className="space-y-4 border-b pb-6">
          <h3 className="font-medium">Pricing & Cost (Product)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Cost / Default cost*</Label><div className="flex"><span className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-sm">CAD</span><Input className="rounded-l-none" type="number" step="0.01" /></div></div>
            <div className="space-y-2"><Label>Selling / Price*</Label><div className="flex"><span className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-sm">CAD</span><Input className="rounded-l-none" type="number" step="0.01" /></div></div>
            <div className="space-y-2"><Label>Discount Price</Label><Input type="number" step="0.01" /></div>
            <div className="space-y-2"><Label>Online Price</Label><Input type="number" step="0.01" /></div>
            <div className="space-y-2"><Label>Mekco NET Currency</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger><SelectContent><SelectItem value="_none_">—</SelectItem><SelectItem value="CAD">CAD</SelectItem><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2"><Label>Mekco NET Value</Label><Input type="number" step="0.0001" /></div>
            <div className="space-y-2"><Label>Currency Rate</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select rate" /></SelectTrigger><SelectContent><SelectItem value="_none_">—</SelectItem>{itemOptions.currencyRates.map((r) => (<SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>))}</SelectContent></Select>
            </div>
          </div>
        </div>

        {/* Product stock */}
        <div className="space-y-4 border-b pb-6">
          <h3 className="font-medium">Stock</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Quantity</Label><Input type="number" /></div>
            <div className="space-y-2"><Label>Reorder Point</Label><Input type="number" /></div>
          </div>
        </div>

        {/* Category & vendor */}
        <div className="space-y-4 border-b pb-6">
          <h3 className="font-medium">Category & Vendor</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Category</Label><Select><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{itemOptions.categories.map((c) => (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Subcategory</Label><Select><SelectTrigger><SelectValue placeholder="Select subcategory" /></SelectTrigger><SelectContent>{itemOptions.subcategories.map((s) => (<SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>))}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Brand</Label><Select><SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger><SelectContent>{itemOptions.brands.map((b) => (<SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>))}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Vendor</Label><Select><SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger><SelectContent>{itemOptions.vendors.map((v) => (<SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>))}</SelectContent></Select></div>
          </div>
        </div>

        {/* Product dimensions */}
        <div className="space-y-4 border-b pb-6">
          <h3 className="font-medium">Dimensions (Product)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Weight (lbs)</Label><Input type="number" step="0.01" /></div>
            <div className="space-y-2"><Label>Length (in)</Label><Input type="number" step="0.01" /></div>
            <div className="space-y-2"><Label>Width (in)</Label><Input type="number" step="0.01" /></div>
            <div className="space-y-2"><Label>Height (in)</Label><Input type="number" step="0.01" /></div>
          </div>
        </div>

        {/* E-commerce & flags */}
        <div className="space-y-4 border-b pb-6">
          <h3 className="font-medium">E-commerce & Flags</h3>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2"><Checkbox />Publish to ecommerce</label>
            <div className="space-y-2"><Label>Display Size</Label><Select><SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger><SelectContent><SelectItem value="_none_">—</SelectItem>{itemOptions.sizes.map((s) => (<SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>))}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Display Color</Label><Input /></div>
            <label className="flex items-center gap-2"><Checkbox />Trending</label>
            <label className="flex items-center gap-2"><Checkbox />Best selling</label>
            <label className="flex items-center gap-2"><Checkbox />Most popular</label>
            <label className="flex items-center gap-2"><Checkbox />Just arrived</label>
          </div>
        </div>

        {/* Sales & refund */}
        <div className="space-y-4 border-b pb-6 col-span-2">
          <h3 className="font-medium">Sales & Refund</h3>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2"><Checkbox defaultChecked />Allow single piece sales</label>
            <label className="flex items-center gap-2"><Checkbox defaultChecked />Is refundable</label>
          </div>
        </div>

        {/* Inventory config */}
        <div className="space-y-4 col-span-2 border-b pb-6">
          <h3 className="font-medium">Inventory</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Inventory Account</Label><Select defaultValue="inv"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="inv">Inventory Asset</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Valuation Method</Label><Select defaultValue="fifo"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="fifo">FIFO (First In First Out)</SelectItem></SelectContent></Select></div>
          </div>
        </div>

        {/* Has variations toggle */}
        <div className="space-y-4 col-span-2 border-b pb-6">
          <h3 className="font-medium">Variations</h3>
          <div className="flex items-center gap-3 mb-3">
            <Checkbox checked={newHasVariations} onCheckedChange={(v: boolean | "indeterminate") => setNewHasVariations(v === true)} />
            <span className="text-sm">This product has variations</span>
          </div>

          {newHasVariations && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">Add variation options (size, color, pricing, packaging) like in admin.</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setNewVariationCount((c) => c + 1)}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add variation
                </Button>
              </div>

              {Array.from({ length: newVariationCount }).map((_, idx) => (
                <div key={idx} className="border rounded-md p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm">Variation #{idx + 1}</h4>
                    {newVariationCount > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setNewVariationCount((c) => Math.max(1, c - 1))}
                        aria-label="Remove variation"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Size</Label><Select><SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger><SelectContent><SelectItem value="_none_">—</SelectItem>{itemOptions.sizes.map((s) => (<SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>))}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>Color</Label><Input /></div>
                    <div className="space-y-2"><Label>Custom SKU</Label><Input /></div>
                    <div className="space-y-2"><Label>Manufacturer SKU</Label><Input /></div>
                    <div className="space-y-2"><Label>UPC</Label><Input /></div>
                    <div className="space-y-2"><Label>EAN</Label><Input /></div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-medium text-xs">Pricing & Stock (Single)</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Cost (Default cost)</Label><Input type="number" step="0.01" /></div>
                      <div className="space-y-2"><Label>Price Single</Label><Input type="number" step="0.01" /></div>
                      <div className="space-y-2"><Label>Discount Price</Label><Input type="number" step="0.01" /></div>
                      <div className="space-y-2"><Label>Stock Single</Label><Input type="number" /></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-medium text-xs">Bag / Box</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Bag SKU</Label><Input /></div>
                      <div className="space-y-2"><Label>Bag Size</Label><Input type="number" /></div>
                      <div className="space-y-2"><Label>Price Bag</Label><Input type="number" step="0.01" /></div>
                      <div className="space-y-2"><Label>Box SKU</Label><Input /></div>
                      <div className="space-y-2"><Label>Box Size</Label><Input type="number" /></div>
                      <div className="space-y-2"><Label>Price Box</Label><Input type="number" step="0.01" /></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-medium text-xs">Dimensions (Single)</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Weight (lbs)</Label><Input type="number" step="0.01" /></div>
                      <div className="space-y-2"><Label>Length (in)</Label><Input type="number" step="0.01" /></div>
                      <div className="space-y-2"><Label>Width (in)</Label><Input type="number" step="0.01" /></div>
                      <div className="space-y-2"><Label>Height (in)</Label><Input type="number" step="0.01" /></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-medium text-xs">Poly bag</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Poly Bag SKU</Label><Input /></div>
                      <div className="space-y-2"><Label>Poly Bag Size</Label><Input type="number" /></div>
                      <div className="space-y-2"><Label>Price Poly Bag</Label><Input type="number" step="0.01" /></div>
                      <div className="space-y-2"><Label>Poly Bag Weight</Label><Input type="number" step="0.01" /></div>
                      <div className="space-y-2"><Label>Poly Bag L×W×H</Label><div className="flex gap-2"><Input placeholder="L" type="number" /><Input placeholder="W" type="number" /><Input placeholder="H" type="number" /></div></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-medium text-xs">Master carton</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Master Carton SKU</Label><Input /></div>
                      <div className="space-y-2"><Label>Master Carton Size</Label><Input type="number" /></div>
                      <div className="space-y-2"><Label>Price Master Carton</Label><Input type="number" step="0.01" /></div>
                      <div className="space-y-2"><Label>Master Carton Weight</Label><Input type="number" step="0.01" /></div>
                      <div className="space-y-2"><Label>Master Carton L×W×H</Label><div className="flex gap-2"><Input placeholder="L" type="number" /><Input placeholder="W" type="number" /><Input placeholder="H" type="number" /></div></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-medium text-xs">Pallet / Skid</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Pallet Skid SKU</Label><Input /></div>
                      <div className="space-y-2"><Label>Pallet Skid Size</Label><Input type="number" /></div>
                      <div className="space-y-2"><Label>Price Pallet Skid</Label><Input type="number" step="0.01" /></div>
                      <div className="space-y-2"><Label>Pallet Skid Weight</Label><Input type="number" step="0.01" /></div>
                      <div className="space-y-2"><Label>Pallet Skid L×W×H</Label><div className="flex gap-2"><Input placeholder="L" type="number" /><Input placeholder="W" type="number" /><Input placeholder="H" type="number" /></div></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-6 mt-6 border-t">
        <Button className="bg-primary hover:bg-primary/90">Save</Button>
        <Button variant="outline" onClick={handleClose}>Cancel</Button>
      </div>
    </div>
  )

  // IMAGE 5: Edit Item Form – all fields, fixed layout (not responsive)
  const isVariation = selectedItem?.itemType === "variation"
  const renderEditItemForm = () => (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium">Edit Item {isVariation ? `(Variation)` : ""}</h1>
        <Button variant="ghost" size="icon" onClick={handleBack}><X className="w-5 h-5" /></Button>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Basic */}
        <div className="space-y-4 col-span-2 border-b pb-6">
          <h3 className="font-medium">Basic</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Type</Label><div className="flex gap-4"><label className="flex items-center gap-2"><input type="radio" name="editType" defaultChecked className="w-4 h-4 accent-primary" />Goods</label><label className="flex items-center gap-2"><input type="radio" name="editType" className="w-4 h-4" />Service</label></div></div>
            <div className="space-y-2"><Label className="text-destructive">Name*</Label><Input defaultValue={selectedItem?.name} /></div>
            <div className="space-y-2"><Label>SKU</Label><Input defaultValue={selectedItem?.sku} /></div>
            <div className="space-y-2"><Label>Slug</Label><Input defaultValue={selectedItem?.slug} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea defaultValue={selectedItem?.description} className="resize-none" rows={2} /></div>
            <div className="space-y-2"><Label>Additional Info</Label><Textarea defaultValue={selectedItem?.additionalInfo ?? ""} className="resize-none" rows={2} /></div>
            <div className="space-y-2"><Label>Key Features</Label><Textarea defaultValue={selectedItem?.keyFeatures ?? ""} className="resize-none" rows={2} /></div>
            <div className="space-y-2"><Label>Specifications Summary</Label><Textarea defaultValue={selectedItem?.specificationsSummary ?? ""} className="resize-none" rows={2} /></div>
          </div>
        </div>

        {/* Variation-only: product link, size, color, variation id */}
        {isVariation && (
          <div className="space-y-4 col-span-2 border-b pb-6">
            <h3 className="font-medium">Variation</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Product</Label><Input defaultValue={selectedItem?.productName ?? ""} readOnly className="bg-muted" /></div>
              <div className="space-y-2"><Label>Variation ID</Label><Input defaultValue={selectedItem?.variationId ?? ""} readOnly className="bg-muted" /></div>
              <div className="space-y-2"><Label>Size</Label>
                <Select value={selectedItem?.sizeId != null ? String(selectedItem.sizeId) : "_none_"}>
                  <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none_">—</SelectItem>
                    {itemOptions.sizes.map((s) => (<SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Color</Label><Input defaultValue={selectedItem?.color ?? ""} /></div>
            </div>
          </div>
        )}

        {/* Identifiers */}
        <div className="space-y-4 border-b pb-6">
          <h3 className="font-medium">Identifiers</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Custom SKU</Label><Input defaultValue={selectedItem?.customSku ?? selectedItem?.sku} /></div>
            <div className="space-y-2"><Label>Manufacturer SKU</Label><Input defaultValue={selectedItem?.manufacturerSku ?? ""} /></div>
            <div className="space-y-2"><Label>UPC</Label><Input defaultValue={selectedItem?.upc ?? ""} /></div>
            <div className="space-y-2"><Label>EAN</Label><Input defaultValue={selectedItem?.ean ?? ""} /></div>
            {!isVariation && <div className="space-y-2"><Label>System ID</Label><Input defaultValue={selectedItem?.systemId ?? ""} readOnly className="bg-muted" /></div>}
          </div>
        </div>

        {/* Pricing – product or single */}
        <div className="space-y-4 border-b pb-6">
          <h3 className="font-medium">Pricing & Cost</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Cost / Default cost*</Label><div className="flex"><span className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-sm">CAD</span><Input className="rounded-l-none" defaultValue={selectedItem?.costPrice ?? selectedItem?.purchaseRate} type="number" step="0.01" /></div></div>
            <div className="space-y-2"><Label>Selling / Rate*</Label><div className="flex"><span className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-sm">CAD</span><Input className="rounded-l-none" defaultValue={selectedItem?.sellingPrice ?? selectedItem?.rate} type="number" step="0.01" /></div></div>
            <div className="space-y-2"><Label>Discount Price</Label><Input defaultValue={selectedItem?.discountPrice ?? ""} type="number" step="0.01" /></div>
            {!isVariation && <div className="space-y-2"><Label>Online Price</Label><Input defaultValue={selectedItem?.onlinePrice ?? ""} type="number" step="0.01" /></div>}
            <div className="space-y-2"><Label>Mekco NET Currency</Label>
              <Select value={selectedItem?.mekcoNetCurrency || "_none_"}>
                <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none_">—</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Mekco NET Value</Label><Input defaultValue={selectedItem?.mekcoNetValue ?? ""} type="number" step="0.0001" /></div>
            <div className="space-y-2"><Label>Currency Rate</Label>
              <Select value={selectedItem?.currencyRateId != null ? String(selectedItem.currencyRateId) : "_none_"}>
                <SelectTrigger><SelectValue placeholder="Select rate" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none_">—</SelectItem>
                  {itemOptions.currencyRates.map((r) => (<SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Stock */}
        <div className="space-y-4 border-b pb-6">
          <h3 className="font-medium">Stock</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Stock on Hand / Quantity</Label><Input defaultValue={selectedItem?.stockOnHand ?? selectedItem?.stockSingle ?? selectedItem?.quantity ?? 0} type="number" /></div>
            {isVariation && <div className="space-y-2"><Label>Stock Single</Label><Input defaultValue={selectedItem?.stockSingle ?? 0} type="number" /></div>}
          </div>
        </div>

        {/* Variation: Single / Bag / Box */}
        {isVariation && (
          <>
            <div className="space-y-4 border-b pb-6">
              <h3 className="font-medium">Single / Bag / Box</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Price Single</Label><Input defaultValue={selectedItem?.priceSingle ?? selectedItem?.rate} type="number" step="0.01" /></div>
                <div className="space-y-2"><Label>Bag Size</Label><Input defaultValue={selectedItem?.bagSize ?? 0} type="number" /></div>
                <div className="space-y-2"><Label>Price Bag</Label><Input defaultValue={selectedItem?.priceBag ?? ""} type="number" step="0.01" /></div>
                <div className="space-y-2"><Label>Box Size</Label><Input defaultValue={selectedItem?.boxSize ?? 0} type="number" /></div>
                <div className="space-y-2"><Label>Price Box</Label><Input defaultValue={selectedItem?.priceBox ?? ""} type="number" step="0.01" /></div>
                <div className="space-y-2"><Label>Bag SKU</Label><Input defaultValue={selectedItem?.bagSku ?? ""} /></div>
                <div className="space-y-2"><Label>Box SKU</Label><Input defaultValue={selectedItem?.boxSku ?? ""} /></div>
              </div>
            </div>
            <div className="space-y-4 border-b pb-6">
              <h3 className="font-medium">Dimensions (single)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Weight (lbs)</Label><Input defaultValue={selectedItem?.weight ?? ""} type="number" step="0.01" /></div>
                <div className="space-y-2"><Label>Length (in)</Label><Input defaultValue={selectedItem?.length ?? ""} type="number" step="0.01" /></div>
                <div className="space-y-2"><Label>Width (in)</Label><Input defaultValue={selectedItem?.width ?? ""} type="number" step="0.01" /></div>
                <div className="space-y-2"><Label>Height (in)</Label><Input defaultValue={selectedItem?.height ?? ""} type="number" step="0.01" /></div>
              </div>
            </div>
            <div className="space-y-4 border-b pb-6">
              <h3 className="font-medium">Bag dimensions</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Bag Weight</Label><Input defaultValue={selectedItem?.bagWeight ?? ""} type="number" step="0.01" /></div>
                <div className="space-y-2"><Label>Bag L×W×H</Label><div className="flex gap-2"><Input defaultValue={selectedItem?.bagLength ?? ""} placeholder="L" type="number" /><Input defaultValue={selectedItem?.bagWidth ?? ""} placeholder="W" type="number" /><Input defaultValue={selectedItem?.bagHeight ?? ""} placeholder="H" type="number" /></div></div>
              </div>
            </div>
            <div className="space-y-4 border-b pb-6">
              <h3 className="font-medium">Box dimensions</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Box Weight</Label><Input defaultValue={selectedItem?.boxWeight ?? ""} type="number" step="0.01" /></div>
                <div className="space-y-2"><Label>Box L×W×H</Label><div className="flex gap-2"><Input defaultValue={selectedItem?.boxLength ?? ""} placeholder="L" type="number" /><Input defaultValue={selectedItem?.boxWidth ?? ""} placeholder="W" type="number" /><Input defaultValue={selectedItem?.boxHeight ?? ""} placeholder="H" type="number" /></div></div>
              </div>
            </div>
            <div className="space-y-4 border-b pb-6">
              <h3 className="font-medium">Poly bag</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Poly Bag SKU</Label><Input defaultValue={selectedItem?.polyBagSku ?? ""} /></div>
                <div className="space-y-2"><Label>Poly Bag Size</Label><Input defaultValue={selectedItem?.polyBagSize ?? 0} type="number" /></div>
                <div className="space-y-2"><Label>Price Poly Bag</Label><Input defaultValue={selectedItem?.pricePolyBag ?? ""} type="number" step="0.01" /></div>
                <div className="space-y-2"><Label>Poly Bag Weight</Label><Input defaultValue={selectedItem?.polyBagWeight ?? ""} type="number" step="0.01" /></div>
                <div className="space-y-2"><Label>Poly Bag L×W×H</Label><div className="flex gap-2"><Input defaultValue={selectedItem?.polyBagLength ?? ""} placeholder="L" type="number" /><Input defaultValue={selectedItem?.polyBagWidth ?? ""} placeholder="W" type="number" /><Input defaultValue={selectedItem?.polyBagHeight ?? ""} placeholder="H" type="number" /></div></div>
              </div>
            </div>
            <div className="space-y-4 border-b pb-6">
              <h3 className="font-medium">Master carton</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Master Carton SKU</Label><Input defaultValue={selectedItem?.masterCartonSku ?? ""} /></div>
                <div className="space-y-2"><Label>Master Carton Size</Label><Input defaultValue={selectedItem?.masterCartonSize ?? 0} type="number" /></div>
                <div className="space-y-2"><Label>Price Master Carton</Label><Input defaultValue={selectedItem?.priceMasterCarton ?? ""} type="number" step="0.01" /></div>
                <div className="space-y-2"><Label>Master Carton Weight</Label><Input defaultValue={selectedItem?.masterCartonWeight ?? ""} type="number" step="0.01" /></div>
                <div className="space-y-2"><Label>Master Carton L×W×H</Label><div className="flex gap-2"><Input defaultValue={selectedItem?.masterCartonLength ?? ""} placeholder="L" type="number" /><Input defaultValue={selectedItem?.masterCartonWidth ?? ""} placeholder="W" type="number" /><Input defaultValue={selectedItem?.masterCartonHeight ?? ""} placeholder="H" type="number" /></div></div>
              </div>
            </div>
            <div className="space-y-4 border-b pb-6">
              <h3 className="font-medium">Pallet / Skid</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Pallet Skid SKU</Label><Input defaultValue={selectedItem?.palletSkidSku ?? ""} /></div>
                <div className="space-y-2"><Label>Pallet Skid Size</Label><Input defaultValue={selectedItem?.palletSkidSize ?? 0} type="number" /></div>
                <div className="space-y-2"><Label>Price Pallet Skid</Label><Input defaultValue={selectedItem?.pricePalletSkid ?? ""} type="number" step="0.01" /></div>
                <div className="space-y-2"><Label>Pallet Skid Weight</Label><Input defaultValue={selectedItem?.palletSkidWeight ?? ""} type="number" step="0.01" /></div>
                <div className="space-y-2"><Label>Pallet Skid L×W×H</Label><div className="flex gap-2"><Input defaultValue={selectedItem?.palletSkidLength ?? ""} placeholder="L" type="number" /><Input defaultValue={selectedItem?.palletSkidWidth ?? ""} placeholder="W" type="number" /><Input defaultValue={selectedItem?.palletSkidHeight ?? ""} placeholder="H" type="number" /></div></div>
              </div>
            </div>
          </>
        )}

        {/* Product-only: category, brand, vendor, dimensions, flags */}
        {!isVariation && (
          <>
            <div className="space-y-4 border-b pb-6">
              <h3 className="font-medium">Category & Vendor</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Category</Label>
                  <Select value={selectedItem?.categoryId != null ? String(selectedItem.categoryId) : "_none_"}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none_">—</SelectItem>
                      {itemOptions.categories.map((c) => (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Subcategory</Label>
                  <Select value={selectedItem?.subcategoryId != null ? String(selectedItem.subcategoryId) : "_none_"}>
                    <SelectTrigger><SelectValue placeholder="Select subcategory" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none_">—</SelectItem>
                      {itemOptions.subcategories.filter((s) => selectedItem?.categoryId == null || s.categoryId === selectedItem.categoryId).map((s) => (<SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Brand</Label>
                  <Select value={selectedItem?.brandId != null ? String(selectedItem.brandId) : "_none_"}>
                    <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none_">—</SelectItem>
                      {itemOptions.brands.map((b) => (<SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Vendor</Label>
                  <Select value={selectedItem?.vendorId != null ? String(selectedItem.vendorId) : "_none_"}>
                    <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none_">—</SelectItem>
                      {itemOptions.vendors.map((v) => (<SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="space-y-4 border-b pb-6">
              <h3 className="font-medium">Dimensions</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Weight (lbs)</Label><Input defaultValue={selectedItem?.weight ?? ""} type="number" step="0.01" /></div>
                <div className="space-y-2"><Label>Length (in)</Label><Input defaultValue={selectedItem?.length ?? ""} type="number" step="0.01" /></div>
                <div className="space-y-2"><Label>Width (in)</Label><Input defaultValue={selectedItem?.width ?? ""} type="number" step="0.01" /></div>
                <div className="space-y-2"><Label>Height (in)</Label><Input defaultValue={selectedItem?.height ?? ""} type="number" step="0.01" /></div>
              </div>
            </div>
            <div className="space-y-4 border-b pb-6">
              <h3 className="font-medium">E-commerce & Flags</h3>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2"><Checkbox defaultChecked={selectedItem?.publishToEcommerce} />Publish to ecommerce</label>
                <div className="space-y-2"><Label>Display Size</Label>
                  <Select value={selectedItem?.displaySizeId != null ? String(selectedItem.displaySizeId) : "_none_"}>
                    <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none_">—</SelectItem>
                      {itemOptions.sizes.map((s) => (<SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Display Color</Label><Input defaultValue={selectedItem?.displayColor ?? ""} /></div>
                <label className="flex items-center gap-2"><Checkbox defaultChecked={selectedItem?.trending} />Trending</label>
                <label className="flex items-center gap-2"><Checkbox defaultChecked={selectedItem?.bestSelling} />Best selling</label>
                <label className="flex items-center gap-2"><Checkbox defaultChecked={selectedItem?.mostPopular} />Most popular</label>
                <label className="flex items-center gap-2"><Checkbox defaultChecked={selectedItem?.justArrived} />Just arrived</label>
              </div>
            </div>
          </>
        )}

        {/* Sales restrictions (both) */}
        <div className="space-y-4 border-b pb-6 col-span-2">
          <h3 className="font-medium">Sales & Refund</h3>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2"><Checkbox defaultChecked={selectedItem?.disableSinglePieceSales === false} />Allow single piece sales</label>
            <label className="flex items-center gap-2"><Checkbox defaultChecked={selectedItem?.isRefundable !== false} />Is refundable</label>
          </div>
        </div>

        {/* Inventory account (optional) */}
        <div className="space-y-4 col-span-2">
          <h3 className="font-medium">Inventory</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Inventory Account</Label><Select defaultValue="inv"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="inv">Inventory Asset</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Valuation Method</Label><Select defaultValue="fifo"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="fifo">FIFO (First In First Out)</SelectItem></SelectContent></Select></div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-6 mt-6 border-t">
        <Button className="bg-primary hover:bg-primary/90">Save</Button>
        <Button variant="outline" onClick={handleBack}>Cancel</Button>
      </div>
    </div>
  )

  // IMAGE 4: Adjust Stock Form with Sidebar
  const renderAdjustStockForm = () => (
    <div className="flex-1 overflow-y-auto p-6 min-h-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium">Adjust Stock - {selectedItem?.name}</h1>
        <Button variant="ghost" size="icon" onClick={handleBack}><X className="w-5 h-5" /></Button>
      </div>

      <div className="max-w-2xl">
        <div className="flex gap-4 mb-6">
          <label className="flex items-center gap-2">
            <input type="radio" name="adjustType" checked={adjustType === "quantity"} onChange={() => setAdjustType("quantity")} className="w-4 h-4 accent-primary" />
            Quantity Adjustment
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="adjustType" checked={adjustType === "value"} onChange={() => setAdjustType("value")} className="w-4 h-4" />
            Value Adjustment
          </label>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2"><Label className="text-destructive">Date*</Label><Input type="date" defaultValue="2026-01-23" /></div>
            <div className="space-y-2"><Label>Quantity Available</Label><Input value={selectedItem?.stockOnHand} readOnly className="bg-muted" /></div>
            <div className="space-y-2"><Label>New Quantity on hand</Label><Input placeholder="0.00" /></div>
            <div className="space-y-2"><Label className="text-destructive">Quantity Adjusted*</Label><Input placeholder="Eg. +10, -10" /></div>
            <div className="space-y-2"><Label>Cost Price</Label><Input defaultValue={selectedItem?.costPrice} /></div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2"><Label className="text-destructive">Account*</Label><Select defaultValue="cogs"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="cogs">Cost of Goods Sold</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Reference Number</Label><Input /></div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-destructive">Reason*</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select a reason" /></SelectTrigger><SelectContent><SelectItem value="damaged">Damaged goods</SelectItem><SelectItem value="stocktake">Stocktake variance</SelectItem><SelectItem value="theft">Theft or loss</SelectItem><SelectItem value="recount">Stock recount</SelectItem></SelectContent></Select>
          </div>
          <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Max 500 characters" className="resize-none" rows={4} /></div>
        </div>

        <div className="flex gap-2 pt-6 mt-6">
          <Button className="bg-primary hover:bg-primary/90">Save as Draft</Button>
          <Button variant="outline">Convert to Adjusted</Button>
          <Button variant="ghost" onClick={handleBack}>Cancel</Button>
        </div>
      </div>
    </div>
  )

  return (
    <DashboardLayout activeItem="Items" activeSubItem="Items">
      {viewMode === "table" && renderTableView()}
      {viewMode === "detail" && selectedItem && renderDetailView()}
      {viewMode === "new" && renderNewItemForm()}
      {viewMode === "edit" && selectedItem && renderEditItemForm()}
      {viewMode === "adjust" && selectedItem && renderAdjustStockForm()}
    </DashboardLayout>
  )
}
