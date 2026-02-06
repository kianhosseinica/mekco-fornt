"use client"

import { useState, useEffect, useCallback, useRef, useLayoutEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createPortal } from "react-dom"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { X, Settings, Search, Plus, ImageIcon, HelpCircle, RefreshCw, ChevronDown, Paperclip, Trash2, Loader2 } from "lucide-react"
import type { CreditNoteLineItem } from "@/lib/credit-notes-types"

const API_BASE = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_API_ORIGIN || ""

interface Customer {
  id: number
  name?: string
  companyName?: string
  email?: string
}

interface ItemResult {
  id: number
  name: string
  sku?: string
  upc?: string
  ean?: string
  rate: number
  imageUrl?: string
}

interface LineItem {
  id: number
  itemDetails: string
  account: string
  reorderQty: string
  quantity: string
  rate: string
  discount: string
  tax: string
  amount: number
  imageUrl: string
}

const createEmptyItem = (id: number): LineItem => ({
  id,
  itemDetails: "",
  account: "Sales",
  reorderQty: "",
  quantity: "1",
  rate: "0.00",
  discount: "0",
  tax: "HST 13%",
  amount: 0,
  imageUrl: "",
})

export default function NewCreditNotePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("edit")

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form fields
  const [creditNoteNumber, setCreditNoteNumber] = useState("")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [referenceNumber, setReferenceNumber] = useState("")
  const [subject, setSubject] = useState("")
  const [salesperson, setSalesperson] = useState("Mekco Supply")
  const [customerNotes, setCustomerNotes] = useState("")
  const [termsAndConditions, setTermsAndConditions] = useState("")
  const [shippingCharges, setShippingCharges] = useState("")
  const [adjustment, setAdjustment] = useState("")

  // Customer search
  const [customerId, setCustomerId] = useState<number | null>(null)
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerSearchQuery, setCustomerSearchQuery] = useState("")
  const [customerOptions, setCustomerOptions] = useState<Customer[]>([])
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const customerContainerRef = useRef<HTMLDivElement>(null)
  const customerSearchRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Line items
  const [lineItems, setLineItems] = useState<LineItem[]>([createEmptyItem(1)])

  // Attachments state
  const attachmentFileInputRef = useRef<HTMLInputElement>(null)
  const [attachments, setAttachments] = useState<File[]>([])
  const [attachmentUploading, setAttachmentUploading] = useState(false)

  // Item search
  const [itemSearchQuery, setItemSearchQuery] = useState("")
  const [itemResults, setItemResults] = useState<ItemResult[]>([])
  const [activeItemRowId, setActiveItemRowId] = useState<number | null>(null)
  const itemSearchRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const itemInputRef = useRef<HTMLInputElement | null>(null)
  const itemDropdownRef = useRef<HTMLDivElement>(null)
  const [itemDropdownRect, setItemDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null)

  // Fetch next number on mount
  useEffect(() => {
    if (!editId) {
      fetchNextNumber()
    } else {
      fetchCreditNote(editId)
    }
  }, [editId])

  // Pre-select customer when ?customerId=X in URL
  useEffect(() => {
    const customerIdParam = searchParams.get("customerId")
    if (customerIdParam && !editId) {
      fetch(`${API_BASE}/api/zoho/customers/${customerIdParam}/`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.id && !data.error) {
            const name = data.name || data.companyName || ""
            setCustomerId(data.id)
            setCustomerName(name)
            setCustomerEmail(data.email || "")
            setCustomerSearchQuery(name)
          }
        })
        .catch(() => {})
    }
  }, [searchParams, editId])

  async function fetchNextNumber() {
    try {
      const res = await fetch(`${API_BASE}/api/zoho/credit-notes/next-number/`)
      const data = await res.json()
      if (res.ok) setCreditNoteNumber(data.creditNoteNumber || "")
    } catch (e) {
      console.error("Failed to fetch next number:", e)
    }
  }

  async function fetchCreditNote(id: string) {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/zoho/credit-notes/${id}/`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load credit note")

      setCreditNoteNumber(data.creditNoteNumber || "")
      setDate(data.date?.slice(0, 10) || new Date().toISOString().slice(0, 10))
      setReferenceNumber(data.referenceNumber || "")
      setSubject(data.subject || "")
      setSalesperson(data.salesperson || "Mekco Supply")
      setCustomerNotes(data.customerNotes || "")
      setTermsAndConditions(data.termsAndConditions || "")
      setCustomerId(data.customerId)
      setCustomerName(data.customerName || "")
      setCustomerEmail(data.customerEmail || "")
      setCustomerSearchQuery(data.customerName || "")
      setShippingCharges(data.shippingCharges?.toString() || "")
      setAdjustment(data.adjustment?.toString() || "")

      if (data.lineItems && data.lineItems.length > 0) {
        setLineItems(data.lineItems.map((li: CreditNoteLineItem, idx: number) => ({
          id: idx + 1,
          itemDetails: li.itemDetails || "",
          account: li.account || "Sales",
          reorderQty: li.reorderQty || "",
          quantity: li.quantity || "1",
          rate: li.rate || "0.00",
          discount: li.discount || "0",
          tax: li.tax || "HST 13%",
          amount: parseFloat(li.amount) || 0,
          imageUrl: (li as any).imageUrl || "",
        })))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load credit note")
    } finally {
      setLoading(false)
    }
  }

  // Customer search debounce
  useEffect(() => {
    if (customerSearchRef.current) clearTimeout(customerSearchRef.current)
    const q = customerSearchQuery.trim()
    if (!q || q.length < 2) {
      setCustomerOptions([])
      return
    }
    customerSearchRef.current = setTimeout(() => {
      fetch(`${API_BASE}/api/zoho/customers/?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((data) => {
          setCustomerOptions(data.customers?.slice(0, 10) || [])
        })
        .catch(() => setCustomerOptions([]))
    }, 300)
    return () => { if (customerSearchRef.current) clearTimeout(customerSearchRef.current) }
  }, [customerSearchQuery])

  // Click outside to close customer dropdown
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (showCustomerDropdown && customerContainerRef.current && !customerContainerRef.current.contains(e.target as Node)) {
        setShowCustomerDropdown(false)
      }
    }
    document.addEventListener("mousedown", onMouseDown)
    return () => document.removeEventListener("mousedown", onMouseDown)
  }, [showCustomerDropdown])

  function selectCustomer(c: Customer) {
    const name = c.companyName || c.name || ""
    setCustomerId(c.id)
    setCustomerName(name)
    setCustomerEmail(c.email || "")
    setCustomerSearchQuery(name)
    setShowCustomerDropdown(false)
  }

  // Item search debounce
  useEffect(() => {
    if (activeItemRowId === null) return
    if (itemSearchRef.current) clearTimeout(itemSearchRef.current)
    const q = itemSearchQuery.trim()
    if (!q) {
      setItemResults([])
      return
    }
    itemSearchRef.current = setTimeout(() => {
      fetch(`${API_BASE}/api/zoho/items/?search=${encodeURIComponent(q)}&limit=20`)
        .then((r) => r.json())
        .then((data) => {
          setItemResults(data.items ?? [])
        })
        .catch(() => setItemResults([]))
    }, 300)
    return () => { if (itemSearchRef.current) clearTimeout(itemSearchRef.current) }
  }, [itemSearchQuery, activeItemRowId])

  // Position item dropdown below active input
  useLayoutEffect(() => {
    if (activeItemRowId === null || itemResults.length === 0) {
      setItemDropdownRect(null)
      return
    }
    const el = itemInputRef.current
    if (!el) {
      setItemDropdownRect(null)
      return
    }
    const rect = el.getBoundingClientRect()
    setItemDropdownRect({
      top: rect.bottom + 2,
      left: rect.left,
      width: Math.max(rect.width, 300),
    })
  }, [activeItemRowId, itemResults])

  // Click outside to close item dropdown
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (activeItemRowId === null) return
      const target = e.target as Node
      if (itemInputRef.current?.contains(target) || itemDropdownRef.current?.contains(target)) return
      setActiveItemRowId(null)
    }
    document.addEventListener("mousedown", onMouseDown)
    return () => document.removeEventListener("mousedown", onMouseDown)
  }, [activeItemRowId])

  // Apply selected item to row
  function applyItemToRow(rowId: number, item: ItemResult) {
    setLineItems((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r
        const rate = Number(item.rate) || 0
        const qty = parseFloat(r.quantity) || 1
        return {
          ...r,
          itemDetails: item.name,
          rate: String(rate),
          amount: qty * rate,
          imageUrl: item.imageUrl || "",
        }
      })
    )
    setActiveItemRowId(null)
    setItemSearchQuery("")
    setItemResults([])
  }

  // Line item management
  function addNewRow() {
    const newId = lineItems.length > 0 ? Math.max(...lineItems.map((i) => i.id)) + 1 : 1
    setLineItems([...lineItems, createEmptyItem(newId)])
  }

  function removeRow(id: number) {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((i) => i.id !== id))
    }
  }

  function updateLineItem(id: number, field: keyof LineItem, value: string | number) {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === "quantity" || field === "rate" || field === "discount") {
            const qty = parseFloat(updated.quantity) || 0
            const rate = parseFloat(updated.rate) || 0
            const disc = parseFloat(updated.discount) || 0
            updated.amount = qty * rate * (1 - disc / 100)
          }
          return updated
        }
        return item
      })
    )
  }

  // Calculations
  const subTotal = lineItems.reduce((sum, i) => sum + i.amount, 0)
  const taxRate = 0.13
  const taxAmount = subTotal * taxRate
  const shipping = parseFloat(shippingCharges) || 0
  const adj = parseFloat(adjustment) || 0
  const total = subTotal + taxAmount + shipping + adj

  async function handleSave() {
    if (!customerName.trim()) {
      setError("Customer name is required")
      return
    }

    setSaving(true)
    setError(null)

    const payload = {
      creditNoteNumber: creditNoteNumber.trim(),
      date,
      customerName: customerName.trim(),
      customerId,
      customerEmail: customerEmail.trim(),
      referenceNumber: referenceNumber.trim(),
      subject: subject.trim(),
      salesperson: salesperson.trim(),
      customerNotes: customerNotes.trim(),
      termsAndConditions: termsAndConditions.trim(),
      lineItems: lineItems.map((li) => ({
        itemDetails: li.itemDetails,
        account: li.account,
        reorderQty: li.reorderQty,
        quantity: li.quantity,
        rate: li.rate,
        discount: li.discount,
        tax: li.tax,
        amount: li.amount.toFixed(2),
        imageUrl: li.imageUrl,
      })),
      subTotal,
      taxAmount,
      shippingCharges: shipping || null,
      adjustment: adj || null,
      total,
    }

    try {
      const url = editId
        ? `${API_BASE}/api/zoho/credit-notes/${editId}/`
        : `${API_BASE}/api/zoho/credit-notes/`
      const method = editId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save credit note")

      // Upload attachments if any
      if (attachments.length > 0 && data.id) {
        setAttachmentUploading(true)
        for (const file of attachments) {
          const formData = new FormData()
          formData.append("file", file)
          formData.append("title", file.name)
          formData.append("document_type", "credit_note")
          try {
            await fetch(`${API_BASE}/api/zoho/credit-notes/${data.id}/attachments/`, {
              method: "POST",
              body: formData,
              credentials: "include",
            })
          } catch (err) {
            console.error("Failed to upload attachment:", err)
          }
        }
        setAttachmentUploading(false)
      }

      router.push(`/sales/credit-notes?id=${data.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save credit note")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading…</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeItem="Sales" activeSubItem="Credit Notes">
      <div className="flex-1 overflow-auto">
        <div className="w-full p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold">{editId ? "Edit Credit Note" : "New Credit Note"}</h1>
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {error && <p className="text-sm text-destructive mb-4">{error}</p>}

          <div className="space-y-6">
            {/* Customer Name - Searchable */}
            <div className="space-y-2 max-w-md relative" ref={customerContainerRef}>
              <Label className="text-destructive">Customer Name*</Label>
              <Input
                value={customerSearchQuery}
                onChange={(e) => {
                  setCustomerSearchQuery(e.target.value)
                  setShowCustomerDropdown(true)
                  // Clear customer if typing new text
                  if (e.target.value !== customerName) {
                    setCustomerId(null)
                    setCustomerName("")
                    setCustomerEmail("")
                  }
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                placeholder="Search customer by name..."
                className="h-9"
              />
              {showCustomerDropdown && customerOptions.length > 0 && (
                <div className="absolute z-50 w-full bg-background border rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
                  {customerOptions.map((c) => (
                    <div
                      key={c.id}
                      className="px-3 py-2.5 hover:bg-muted cursor-pointer text-sm border-b last:border-b-0"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectCustomer(c)}
                    >
                      <div className="font-medium">{c.companyName || c.name}</div>
                      {c.email && <div className="text-xs text-muted-foreground">{c.email}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Credit Note# */}
              <div className="space-y-2">
                <Label className="text-destructive">Credit Note#*</Label>
                <div className="flex gap-2">
                  <Input
                    value={creditNoteNumber}
                    onChange={(e) => setCreditNoteNumber(e.target.value)}
                    className="flex-1 h-9"
                  />
                  <Button variant="ghost" size="icon"><Settings className="w-4 h-4" /></Button>
                </div>
              </div>

              {/* Reference# */}
              <div className="space-y-2">
                <Label>Reference#</Label>
                <Input value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} className="h-9" />
              </div>

              {/* Credit Note Date */}
              <div className="space-y-2">
                <Label className="text-destructive">Credit Note Date*</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9" />
              </div>

              {/* Salesperson */}
              <div className="space-y-2">
                <Label>Salesperson</Label>
                <Select value={salesperson} onValueChange={setSalesperson}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mekco Supply">Mekco Supply</SelectItem>
                    <SelectItem value="Kian Hosseini">Kian Hosseini</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">Subject <HelpCircle className="w-3 h-3 text-muted-foreground" /></Label>
              <Textarea
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Let your customer know what this Credit Note is for"
                rows={2}
              />
            </div>

            {/* Item Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                <h3 className="font-medium text-sm">Item Table</h3>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px] min-w-[250px]">ITEM DETAILS</TableHead>
                      <TableHead className="text-[10px] w-24">ACCOUNT</TableHead>
                      <TableHead className="text-[10px] w-16">QTY</TableHead>
                      <TableHead className="text-[10px] w-20">RATE</TableHead>
                      <TableHead className="text-[10px] w-16">DISC %</TableHead>
                      <TableHead className="text-[10px] w-24">TAX</TableHead>
                      <TableHead className="text-[10px] w-20 text-right">AMOUNT</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="py-1.5">
                          <div className="flex items-center gap-2">
                            {/* Item Image */}
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt="" className="w-8 h-8 object-cover rounded border shrink-0" />
                            ) : (
                              <div className="w-8 h-8 border rounded flex items-center justify-center bg-muted/30 shrink-0">
                                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )}
                            {/* Item Search Input */}
                            <Input
                              ref={activeItemRowId === item.id ? itemInputRef : undefined}
                              className="h-8 text-xs flex-1"
                              value={activeItemRowId === item.id ? itemSearchQuery : item.itemDetails}
                              onChange={(e) => {
                                if (activeItemRowId === item.id) {
                                  setItemSearchQuery(e.target.value)
                                } else {
                                  updateLineItem(item.id, "itemDetails", e.target.value)
                                }
                              }}
                              onFocus={() => {
                                setActiveItemRowId(item.id)
                                setItemSearchQuery(item.itemDetails)
                              }}
                              placeholder="Type to search items..."
                            />
                          </div>
                        </TableCell>
                        <TableCell className="py-1.5">
                          <Select value={item.account} onValueChange={(v) => updateLineItem(item.id, "account", v)}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Sales" className="text-xs">Sales</SelectItem>
                              <SelectItem value="Service" className="text-xs">Service</SelectItem>
                              <SelectItem value="Returns" className="text-xs">Returns</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="py-1.5">
                          <Input
                            className="h-8 text-xs w-14"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, "quantity", e.target.value)}
                          />
                        </TableCell>
                        <TableCell className="py-1.5">
                          <Input
                            className="h-8 text-xs w-18"
                            value={item.rate}
                            onChange={(e) => updateLineItem(item.id, "rate", e.target.value)}
                          />
                        </TableCell>
                        <TableCell className="py-1.5">
                          <Input
                            className="h-8 text-xs w-12"
                            value={item.discount}
                            onChange={(e) => updateLineItem(item.id, "discount", e.target.value)}
                          />
                        </TableCell>
                        <TableCell className="py-1.5">
                          <Select value={item.tax} onValueChange={(v) => updateLineItem(item.id, "tax", v)}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="HST 13%" className="text-xs">HST 13%</SelectItem>
                              <SelectItem value="Exempt" className="text-xs">Exempt</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="py-1.5 text-right text-xs font-medium">{item.amount.toFixed(2)}</TableCell>
                        <TableCell className="py-1.5">
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeRow(item.id)}>
                            <X className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="p-3 flex gap-3">
                <Button variant="outline" size="sm" className="gap-1 text-xs bg-transparent" onClick={addNewRow}>
                  <Plus className="w-3 h-3" /> Add Row
                </Button>
              </div>
            </div>

            {/* Item Search Dropdown - Portal */}
            {typeof window !== "undefined" && itemDropdownRect && itemResults.length > 0 && createPortal(
              <div
                ref={itemDropdownRef}
                className="fixed z-[9999] bg-background border rounded-md shadow-lg max-h-60 overflow-auto"
                style={{
                  top: itemDropdownRect.top,
                  left: itemDropdownRect.left,
                  width: itemDropdownRect.width,
                }}
                role="listbox"
              >
                {itemResults.map((it) => (
                  <div
                    key={it.id}
                    role="option"
                    className="px-3 py-2 text-xs cursor-pointer hover:bg-muted/80 border-b last:border-0"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (activeItemRowId !== null) applyItemToRow(activeItemRowId, it)
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {it.imageUrl ? (
                        <img src={it.imageUrl} alt="" className="w-10 h-10 object-cover rounded border" />
                      ) : (
                        <div className="w-10 h-10 border rounded flex items-center justify-center bg-muted/30 shrink-0">
                          <ImageIcon className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{it.name}</p>
                        <div className="text-muted-foreground flex gap-2">
                          {it.sku && <span>SKU: {it.sku}</span>}
                          <span className="font-medium text-teal-600">${it.rate.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>,
              document.body
            )}

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between text-xs py-1">
                  <span>Sub Total</span>
                  <span>${subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs py-1 gap-2">
                  <span>Shipping</span>
                  <Input
                    className="h-7 text-xs w-24 text-right"
                    value={shippingCharges}
                    onChange={(e) => setShippingCharges(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span>Tax (HST 13%)</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs py-1 gap-2">
                  <span>Adjustment</span>
                  <Input
                    className="h-7 text-xs w-24 text-right"
                    value={adjustment}
                    onChange={(e) => setAdjustment(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex justify-between text-sm font-semibold py-2 border-t">
                  <span>Total ( $ )</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Customer Notes */}
            <div className="space-y-2">
              <Label>Customer Notes</Label>
              <Textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="Will be displayed on the credit note"
                rows={3}
              />
            </div>

            {/* Terms & Conditions */}
            <div className="space-y-2">
              <Label>Terms & Conditions</Label>
              <Textarea
                value={termsAndConditions}
                onChange={(e) => setTermsAndConditions(e.target.value)}
                placeholder="Enter the terms and conditions"
                rows={3}
              />
            </div>

            {/* Attachments */}
            <div className="space-y-2">
              <Label>Attachments</Label>
              <div>
                <input
                  type="file"
                  ref={attachmentFileInputRef}
                  className="hidden"
                  multiple
                  onChange={(e) => {
                    const files = e.target.files ? Array.from(e.target.files) : []
                    if (files.length > 0) {
                      setAttachments((prev) => [...prev, ...files].slice(0, 10))
                    }
                    e.target.value = ""
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs bg-transparent"
                  onClick={() => attachmentFileInputRef.current?.click()}
                  disabled={attachments.length >= 10}
                >
                  <Paperclip className="w-3.5 h-3.5 mr-1.5" />
                  Attach Files
                </Button>
                <p className="text-[10px] text-muted-foreground mt-1">You can attach up to 10 files (max 10MB each). Files will be uploaded when you save.</p>
                {attachments.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {attachments.map((file, idx) => (
                      <li key={idx} className="flex items-center justify-between gap-2 text-xs bg-muted/30 rounded px-2 py-1">
                        <span className="truncate flex-1">
                          <Paperclip className="w-3 h-3 inline mr-1" />
                          {file.name}
                        </span>
                        <span className="text-muted-foreground shrink-0">
                          {(file.size / 1024).toFixed(0)} KB
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-destructive hover:text-destructive shrink-0"
                          onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-8 pt-6 border-t">
            <div className="flex flex-wrap items-center gap-3">
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editId ? "Update" : "Save as Open"}
              </Button>
              <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
