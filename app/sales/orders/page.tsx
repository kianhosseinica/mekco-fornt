"use client"
/* eslint-disable @next/next/no-img-element */

import { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react"
import { useSearchParams } from "next/navigation"
import { createPortal } from "react-dom"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
import { Plus, MoreHorizontal, X, ChevronDown, ChevronRight, ChevronLeft, ArrowUpDown, Import, Download, Settings, RotateCcw, Columns, Mail, Circle, Search, Upload, HelpCircle, Sparkles, ImageIcon, MoreVertical, Pencil, Printer, FileText, Lock, Copy, Ban, CheckCircle, ShoppingCart, Monitor, RefreshCw, History, Undo2, Paperclip, Loader2 } from "lucide-react"
import Link from "next/link"
import type { SalesOrder as SalesOrderType, SalesOrderLineItem, SalesOrderHistoryEntry } from "@/lib/sales-orders-types"
import { SALES_ORDER_STATUSES } from "@/lib/sales-orders-types"
import { format } from "date-fns"

const API_BASE = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_API_ORIGIN || ""

type SalesOrder = SalesOrderType

const getStatusColor = (status: string) => {
  switch (status) {
    case "Draft": return "text-muted-foreground"
    case "Sent / Issued": return "text-blue-600"
    case "Confirmed / Acknowledged": return "text-teal-600"
    case "Packing Slip": return "text-amber-600"
    case "Received / Completed": return "text-green-600"
    case "Has Back Order (B/O)": return "text-orange-600"
    case "Billed / Invoiced": return "text-emerald-700"
    case "Has Return(s) / RGA": return "text-purple-600"
    case "ETA": return "text-cyan-600"
    case "Closed": return "text-slate-500"
    default: return "text-foreground"
  }
}

function formatDisplayDate(isoOrDisplay: string) {
  if (!isoOrDisplay) return ""
  try {
    const d = new Date(isoOrDisplay)
    if (!isNaN(d.getTime())) return format(d, "MMM d, yyyy")
  } catch { }
  return isoOrDisplay
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

const defaultItemRow = (): { id: number; itemDetails: string; reorderQty: string; quantity: string; rate: string; discount: string; tax: string; amount: string; imageUrl?: string } => ({
  id: Date.now(),
  itemDetails: "",
  reorderQty: "",
  quantity: "1",
  rate: "0",
  discount: "0",
  tax: "",
  amount: "0",
  imageUrl: "",
})

export default function SalesOrdersPage() {
  const searchParams = useSearchParams()
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null)
  const [showPdfView, setShowPdfView] = useState(true)
  const [invoicesExpanded, setInvoicesExpanded] = useState(true)
  const [itemRows, setItemRows] = useState(() => [defaultItemRow()])
  // Inline editing mode for order detail view
  const [editingLineItems, setEditingLineItems] = useState(false)
  const [editLineItems, setEditLineItems] = useState<{ id: string; itemDetails: string; quantity: string; rate: string; amount: string }[]>([])
  const [editItemsSaving, setEditItemsSaving] = useState(false)
  // Order history
  const [showHistory, setShowHistory] = useState(false)
  const [orderHistory, setOrderHistory] = useState<SalesOrderHistoryEntry[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [revertLoading, setRevertLoading] = useState<number | null>(null)
  // Status transition modal - edit items before changing status
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<SalesOrderType["status"] | null>(null)
  const [statusModalItems, setStatusModalItems] = useState<{ id: string; itemDetails: string; quantity: string; rate: string; amount: string; imageUrl?: string }[]>([])
  const [statusModalSaving, setStatusModalSaving] = useState(false)
  // Status modal item search
  const [statusItemSearchQuery, setStatusItemSearchQuery] = useState("")
  const [statusItemResults, setStatusItemResults] = useState<{ id: number; name: string; sku: string; upc: string; ean: string; rate: number; imageUrl?: string }[]>([])
  const [statusActiveItemRowId, setStatusActiveItemRowId] = useState<string | null>(null)
  const statusItemSearchRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const statusItemContainerRef = useRef<HTMLDivElement>(null)
  const statusItemInputRef = useRef<HTMLInputElement>(null)
  const statusItemDropdownRef = useRef<HTMLDivElement>(null)
  const [statusItemDropdownRect, setStatusItemDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null)
  // Convert to Invoice modal state
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [convertItems, setConvertItems] = useState<{ id: string; itemDetails: string; quantity: string; remainingQuantity: string; rate: string; amount: string; imageUrl?: string; salesOrderLineItemId?: string }[]>([])
  const [convertSaving, setConvertSaving] = useState(false)
  const [convertRemainingLoading, setConvertRemainingLoading] = useState(false)
  // Linked invoices for the selected order
  const [linkedInvoices, setLinkedInvoices] = useState<{ id: string; invoiceNumber: string; date: string; dueDate: string; status: string; total: number; balanceDue: number }[]>([])
  const [linkedInvoicesLoading, setLinkedInvoicesLoading] = useState(false)
  const [nextNumber, setNextNumber] = useState<string>("")
  const [saveLoading, setSaveLoading] = useState(false)
  const [emailTo, setEmailTo] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailAttachPdf, setEmailAttachPdf] = useState(true)
  const [sendEmailLoading, setSendEmailLoading] = useState(false)
  const [formCustomerName, setFormCustomerName] = useState("")
  const [formCustomerId, setFormCustomerId] = useState<number | undefined>(undefined)
  const [formCustomerEmail, setFormCustomerEmail] = useState("")
  const [formReference, setFormReference] = useState("")
  const [formDate, setFormDate] = useState("")
  const [formExpectedShipmentDate, setFormExpectedShipmentDate] = useState("")
  const [formStatus, setFormStatus] = useState<SalesOrderType["status"]>("Draft")
  const [formShippingCharges, setFormShippingCharges] = useState("0")
  const [formAdjustment, setFormAdjustment] = useState("0")
  const [formCustomerNotes, setFormCustomerNotes] = useState("")
  const [formTermsAndConditions, setFormTermsAndConditions] = useState("")
  const [formEmailRecipients, setFormEmailRecipients] = useState<{ id: string; email: string; selected: boolean }[]>([])
  const orderFileInputRef = useRef<HTMLInputElement>(null)
  const [orderAttachmentFiles, setOrderAttachmentFiles] = useState<{ name: string; size: number }[]>([])
  const pdfPreviewRef = useRef<HTMLDivElement>(null)
  // Attachment state for detail view (persisted to backend)
  const attachmentFileInputRef = useRef<HTMLInputElement>(null)
  const [attachmentUploading, setAttachmentUploading] = useState(false)
  const [orderAttachments, setOrderAttachments] = useState<{ id: number; title: string; documentType: string; filename: string; url: string; uploadedAt: string }[]>([])
  // Customer search dropdown
  const [customerSearchQuery, setCustomerSearchQuery] = useState("")
  const [customerResults, setCustomerResults] = useState<{ id: number; name: string; companyName: string; email: string }[]>([])
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false)
  const customerSearchRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const customerContainerRef = useRef<HTMLDivElement>(null)
  // Item search dropdown (per row)
  const [itemSearchQuery, setItemSearchQuery] = useState("")
  const [itemResults, setItemResults] = useState<{ id: number; name: string; sku: string; upc: string; ean: string; rate: number; imageUrl?: string }[]>([])
  const [activeItemRowId, setActiveItemRowId] = useState<number | null>(null)
  const itemSearchRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const itemContainerRef = useRef<HTMLDivElement>(null)
  const itemInputRef = useRef<HTMLInputElement | null>(null)
  const itemDropdownRef = useRef<HTMLDivElement>(null)
  const [itemDropdownRect, setItemDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null)
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setListError(null)
    try {
      const res = await fetch(`${API_BASE}/api/zoho/sales-orders/`)
      const data = await res.json()
      if (res.ok && Array.isArray(data.orders)) {
        setSalesOrders(data.orders)
      } else {
        setListError(data?.error || `Failed to load (${res.status})`)
      }
    } catch (e) {
      setListError(e instanceof Error ? e.message : "Network error")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Fetch attachments when order is selected
  useEffect(() => {
    if (!selectedOrder?.id) {
      setOrderAttachments([])
      return
    }
    let cancelled = false
    fetch(`${API_BASE}/api/zoho/sales-orders/${selectedOrder.id}/attachments/`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.attachments) {
          setOrderAttachments(data.attachments)
        }
      })
      .catch(() => {
        if (!cancelled) setOrderAttachments([])
      })
    return () => { cancelled = true }
  }, [selectedOrder?.id])

  // When URL has ?id=, select that sales order (e.g. from invoice detail link)
  useEffect(() => {
    const idParam = searchParams.get("id")
    if (!idParam || loading) return
    const id = idParam.trim()
    if (!id) return

    const fromList = salesOrders.find((o) => String(o.id) === id)
    if (fromList) {
      setSelectedOrder(fromList)
      return
    }
    // Order might not be in the list (e.g. limit); fetch by id
    let cancelled = false
    fetch(`${API_BASE}/api/zoho/sales-orders/${id}/`)
      .then((r) => (r.ok ? r.json() : null))
      .then((order) => {
        if (cancelled || !order) return
        setSelectedOrder(order)
        setSalesOrders((prev) => {
          if (prev.some((o) => String(o.id) === id)) return prev
          return [order, ...prev]
        })
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [searchParams, salesOrders, loading])

  // Open new form with customer pre-selected when ?customerId=X&new=1
  useEffect(() => {
    const customerIdParam = searchParams.get("customerId")
    const newParam = searchParams.get("new")
    if (customerIdParam && newParam === "1") {
      setShowNewForm(true)
      setSelectedOrder(null)
      fetch(`${API_BASE}/api/zoho/customers/${customerIdParam}/`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.id && !data.error) {
            setFormCustomerId(data.id)
            setFormCustomerName(data.name || data.companyName || "")
            setFormCustomerEmail(data.email || "")
            setCustomerSearchQuery(data.name || data.companyName || "")
          }
        })
        .catch(() => {})
    }
  }, [searchParams])

  // Debounced customer search
  useEffect(() => {
    if (!showNewForm) return
    if (customerSearchRef.current) clearTimeout(customerSearchRef.current)
    const q = customerSearchQuery.trim()
    if (!q) {
      setCustomerResults([])
      return
    }
    customerSearchRef.current = setTimeout(() => {
      fetch(`${API_BASE}/api/zoho/customers/?search=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((data) => {
          setCustomerResults(data.customers?.slice(0, 15) ?? [])
          setCustomerDropdownOpen(true)
        })
        .catch(() => setCustomerResults([]))
    }, 300)
    return () => { if (customerSearchRef.current) clearTimeout(customerSearchRef.current) }
  }, [customerSearchQuery, showNewForm])

  // Debounced item search (name, SKU, UPC, EAN)
  useEffect(() => {
    if (!showNewForm || activeItemRowId === null) return
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
  }, [itemSearchQuery, activeItemRowId, showNewForm])

  // Click outside to close customer dropdown
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (customerDropdownOpen && customerContainerRef.current && !customerContainerRef.current.contains(e.target as Node)) {
        setCustomerDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", onMouseDown)
    return () => document.removeEventListener("mousedown", onMouseDown)
  }, [customerDropdownOpen])

  // Position item dropdown (portal) below the active input
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
      width: Math.max(rect.width, 280),
    })
  }, [activeItemRowId, itemResults])

  // Click outside to close item dropdown (input or portal dropdown)
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

  // Status modal: Item search debounce
  useEffect(() => {
    if (!showStatusModal || statusActiveItemRowId === null) return
    if (statusItemSearchRef.current) clearTimeout(statusItemSearchRef.current)
    const q = statusItemSearchQuery.trim()
    if (!q) {
      setStatusItemResults([])
      return
    }
    statusItemSearchRef.current = setTimeout(() => {
      fetch(`${API_BASE}/api/zoho/items/?search=${encodeURIComponent(q)}&limit=20`)
        .then((r) => r.json())
        .then((data) => {
          setStatusItemResults(data.items ?? [])
        })
        .catch(() => setStatusItemResults([]))
    }, 300)
    return () => { if (statusItemSearchRef.current) clearTimeout(statusItemSearchRef.current) }
  }, [statusItemSearchQuery, statusActiveItemRowId, showStatusModal])

  // Status modal: Position item dropdown (portal) below the active input
  useLayoutEffect(() => {
    if (statusActiveItemRowId === null || statusItemResults.length === 0) {
      setStatusItemDropdownRect(null)
      return
    }
    const el = statusItemInputRef.current
    if (!el) {
      setStatusItemDropdownRect(null)
      return
    }
    const rect = el.getBoundingClientRect()
    setStatusItemDropdownRect({
      top: rect.bottom + 2,
      left: rect.left,
      width: Math.max(rect.width, 280),
    })
  }, [statusActiveItemRowId, statusItemResults])

  // Status modal: Click outside to close item dropdown
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (statusActiveItemRowId === null) return
      const target = e.target as Node
      if (statusItemInputRef.current?.contains(target) || statusItemDropdownRef.current?.contains(target)) return
      setStatusActiveItemRowId(null)
    }
    document.addEventListener("mousedown", onMouseDown)
    return () => document.removeEventListener("mousedown", onMouseDown)
  }, [statusActiveItemRowId])

  useEffect(() => {
    if (showNewForm && !selectedOrder) {
      fetch(`${API_BASE}/api/zoho/sales-orders/next-number/`)
        .then((r) => r.json())
        .then((d) => d.nextNumber && setNextNumber(d.nextNumber))
        .catch(() => { })
    }
  }, [showNewForm, selectedOrder])

  // Reset inline editing and history state when order changes or is deselected
  useEffect(() => {
    setEditingLineItems(false)
    setEditLineItems([])
    setShowHistory(false)
    setOrderHistory([])
  }, [selectedOrder?.id])

  // When opening edit form, fetch latest order from backend so we have current lineItems
  useEffect(() => {
    if (selectedOrder && showNewForm) {
      let cancelled = false
      fetch(`${API_BASE}/api/zoho/sales-orders/${selectedOrder.id}/`)
        .then((r) => r.ok ? r.json() : null)
        .then((order) => {
          if (cancelled || !order) return
          setFormCustomerName(order.customerName ?? "")
          setFormCustomerId(order.customerId)
          setFormCustomerEmail(order.customerEmail ?? "")
          setFormReference(order.reference ?? "")
          setFormDate(order.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10))
          setFormExpectedShipmentDate(order.expectedShipmentDate?.slice(0, 10) ?? "")
          setFormStatus((order.status as SalesOrderType["status"]) ?? "Draft")
          setFormShippingCharges(String(order.shippingCharges ?? 0))
          setFormAdjustment(String(order.adjustment ?? 0))
          setFormCustomerNotes(order.customerNotes ?? "")
          setFormTermsAndConditions(order.termsAndConditions ?? "")
          if (order.customerEmail) setFormEmailRecipients([{ id: "cust", email: order.customerEmail, selected: true }])
          else setFormEmailRecipients([])
          const lines = order.lineItems?.length
            ? order.lineItems.map((li: SalesOrderLineItem, i: number) => ({
              id: i + 1,
              itemDetails: li.itemDetails ?? "",
              reorderQty: li.reorderQty ?? "",
              quantity: li.quantity ?? "1",
              rate: li.rate ?? "0",
              discount: li.discount ?? "0",
              tax: li.tax ?? "",
              amount: String(li.amount ?? "0"),
              imageUrl: li.imageUrl ?? "",
            }))
            : [defaultItemRow()]
          setItemRows(lines)
        })
        .catch(() => { })
      return () => { cancelled = true }
    } else if (showNewForm && !selectedOrder) {
      setFormCustomerName("")
      setFormCustomerId(undefined)
      setFormCustomerEmail("")
      setFormReference("")
      setFormDate(new Date().toISOString().slice(0, 10))
      setFormExpectedShipmentDate("")
      setFormStatus("Draft")
      setFormShippingCharges("0")
      setFormAdjustment("0")
      setFormCustomerNotes("")
      setFormTermsAndConditions("")
      setFormEmailRecipients([])
      setOrderAttachmentFiles([])
      setItemRows([defaultItemRow()])
    }
  }, [selectedOrder?.id, showNewForm])

  // Build quote HTML for print/PDF — exact same layout and styles as on-screen PDF preview
  const getQuotePrintDocument = (order: SalesOrder) => {
    const logoUrl = typeof window !== "undefined" ? `${window.location.origin}/zoho/Mekco-Supply-logo-300px.png` : ""
    const lineItems = order.lineItems?.length ? order.lineItems : [{ itemDetails: "—", quantity: "—", rate: "—", amount: "—" }]
    const subTotal = (order.subTotal ?? order.amount).toFixed(2)
    const taxAmount = ((order.taxAmount ?? 0) || order.amount * 0.13).toFixed(2)
    const totalStr = order.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })
    // Show a ribbon with the current sales order status (e.g. Draft, Confirmed, Billed / Invoiced)
    const ribbonStatus = order.status || ""
    const ribbonHtml = ribbonStatus
      ? `<div style="position:absolute;left:0;top:0;width:128px;height:128px;overflow:hidden;"><div style="position:absolute;top:24px;left:-32px;width:160px;background:#059669;color:white;font-size:12px;padding:6px 0;text-align:center;font-weight:500;transform:rotate(-45deg);box-shadow:0 4px 6px -1px rgb(0 0 0/0.1);">${escapeHtml(
          String(ribbonStatus),
        )}</div></div>`
      : ""
    const rowsHtml = lineItems.map((li: { itemDetails?: string; quantity?: string | number; rate?: string | number; amount?: string | number }, i: number) => `
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:10px 12px;font-size:12px;vertical-align:top;">${i + 1}</td>
        <td style="padding:10px 12px;font-size:12px;">${escapeHtml(String(li.itemDetails || "—"))}</td>
        <td style="padding:10px 12px;font-size:12px;text-align:center;">${escapeHtml(String(li.quantity))}</td>
        <td style="padding:10px 12px;font-size:12px;text-align:right;">${escapeHtml(String(li.rate))}</td>
        <td style="padding:10px 12px;font-size:12px;text-align:right;">${escapeHtml(String(li.amount))}</td>
      </tr>`).join("")
    const bodyHtml = `
    <div style="border:1px solid #e5e7eb;border-radius:8px;background:#fff;position:relative;overflow:hidden;box-shadow:0 1px 3px 0 rgb(0 0 0/0.1);">
      ${ribbonHtml}
      <div style="padding:24px 32px 40px;">
        <div style="display:flex;flex-direction:column;gap:24px;margin-bottom:40px;">
          <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:24px;">
            <div>
              <div style="width:112px;height:64px;border-radius:6px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#fff;flex-shrink:0;margin-bottom:12px;">
                <img alt="Mekco Supply Inc." width="112" height="64" style="object-fit:contain;width:100%;height:100%;padding:4px;" src="${logoUrl}" />
              </div>
              <p style="font-size:14px;font-weight:600;color:#09090b;margin:0;">Mekco Supply Inc.</p>
              <p style="font-size:12px;color:#71717a;margin:2px 0 0 0;">16-110 West Beaver Creek Rd.</p>
              <p style="font-size:12px;color:#71717a;margin:2px 0 0 0;">Richmond Hill, Ontario L4B 1J9</p>
            </div>
            <div style="text-align:right;">
              <h2 style="font-size:30px;font-weight:300;color:#09090b;margin:0 0 8px 0;">Quote</h2>
              <p style="font-size:14px;color:#71717a;margin:0;">Quote# ${escapeHtml(order.salesOrderNumber)}</p>
            </div>
          </div>
        </div>
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:24px;margin-bottom:32px;">
          <div>
            <p style="font-size:12px;color:#71717a;margin:0 0 4px 0;">Bill To</p>
            <p style="font-size:14px;color:#0d9488;font-weight:500;margin:0;">${escapeHtml(order.customerName)}</p>
          </div>
          <div style="text-align:right;">
            <div style="display:flex;justify-content:flex-end;gap:16px;margin-bottom:6px;"><span style="font-size:12px;color:#71717a;">Order Date :</span><span style="font-size:12px;color:#09090b;">${formatDisplayDate(order.date)}</span></div>
            <div style="display:flex;justify-content:flex-end;gap:16px;margin-bottom:6px;"><span style="font-size:12px;color:#71717a;">Expected Shipment Date :</span><span style="font-size:12px;color:#09090b;">${formatDisplayDate(order.expectedShipmentDate) || formatDisplayDate(order.date)}</span></div>
            <div style="display:flex;justify-content:flex-end;gap:16px;"><span style="font-size:12px;color:#71717a;">Ref# :</span><span style="font-size:12px;color:#09090b;">${escapeHtml(order.reference || "—")}</span></div>
          </div>
        </div>
        <div style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin-bottom:24px;">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#0d9488;">
                <th style="padding:10px 12px;font-size:12px;color:#fff;font-weight:500;text-align:left;width:48px;">#</th>
                <th style="padding:10px 12px;font-size:12px;color:#fff;font-weight:500;text-align:left;min-width:200px;">Item & Description</th>
                <th style="padding:10px 12px;font-size:12px;color:#fff;font-weight:500;text-align:center;width:64px;">Qty</th>
                <th style="padding:10px 12px;font-size:12px;color:#fff;font-weight:500;text-align:right;width:80px;">Rate</th>
                <th style="padding:10px 12px;font-size:12px;color:#fff;font-weight:500;text-align:right;width:96px;">Amount</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
        <div style="display:flex;justify-content:flex-end;">
          <div style="width:208px;">
            <div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;"><span style="color:#71717a;">Sub Total</span><span>${subTotal}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;"><span style="color:#71717a;">GST/HST (13%)</span><span>${taxAmount}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:600;padding:8px 12px;margin:0 -12px;margin-top:8px;border-top:1px solid #e5e7eb;background:#f4f4f5;"><span>Total</span><span>$${totalStr}</span></div>
          </div>
        </div>
      </div>
    </div>`
    const title = `Quote - ${order.salesOrderNumber}`
    const fullPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 24px; background: #fff; color: #09090b; font-size: 14px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>${bodyHtml}</body>
</html>`
    return { title, fullPage }
  }

  const handlePrint = () => {
    if (!selectedOrder) return
    const { title, fullPage } = getQuotePrintDocument(selectedOrder)
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(fullPage)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleDownloadPDF = () => {
    if (!selectedOrder) return
    const { title, fullPage } = getQuotePrintDocument(selectedOrder)
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(fullPage)
      printWindow.document.close()
      setTimeout(() => printWindow.print(), 250)
    }
  }

  const addNewRow = () => {
    const newId = itemRows.length > 0 ? Math.max(...itemRows.map((row) => row.id)) + 1 : 1
    setItemRows([...itemRows, { id: newId, itemDetails: "", reorderQty: "", quantity: "1", rate: "0", discount: "0", tax: "", amount: "0", imageUrl: "" }])
  }

  const removeRow = (id: number) => {
    if (itemRows.length > 1) {
      setItemRows(itemRows.filter((row) => row.id !== id))
    }
  }

  const applyItemToRow = (rowId: number, item: { name: string; sku?: string; rate: number; imageUrl?: string }) => {
    setItemRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r
        const rate = Number(item.rate) || 0
        return { ...r, itemDetails: item.name, rate: String(rate), quantity: "1", amount: String(rate), imageUrl: item.imageUrl || "" }
      })
    )
    setActiveItemRowId(null)
    setItemSearchQuery("")
    setItemResults([])
  }

  const updateLineItem = (id: number, field: keyof typeof itemRows[0], value: string) => {
    setItemRows(itemRows.map((row) => {
      if (row.id !== id) return row
      const next = { ...row, [field]: value }
      if (field === "quantity" || field === "rate" || field === "discount") {
        const qty = parseFloat(next.quantity) || 0
        const rate = parseFloat(next.rate) || 0
        const disc = parseFloat(next.discount) || 0
        next.amount = (qty * rate * (1 - disc / 100)).toFixed(2)
      }
      return next
    }))
  }

  const computeLineTotals = () => {
    let sub = 0
    itemRows.forEach((row) => {
      const qty = parseFloat(row.quantity) || 0
      const rate = parseFloat(row.rate) || 0
      const disc = parseFloat(row.discount) || 0
      sub += qty * rate * (1 - disc / 100)
    })
    const shippingCharges = parseFloat(formShippingCharges) || 0
    const adjustment = parseFloat(formAdjustment) || 0
    const taxAmount = sub * 0.13
    const total = sub + shippingCharges + taxAmount + adjustment
    return { subTotal: sub, shippingCharges, adjustment, taxAmount, total }
  }

  // Inline editing functions for order detail view
  const startEditingLineItems = () => {
    if (!selectedOrder) return
    const items = selectedOrder.lineItems?.length
      ? selectedOrder.lineItems.map((li, i) => ({
          id: li.id || `item_${i}`,
          itemDetails: li.itemDetails || "",
          quantity: String(li.quantity || "1"),
          rate: String(li.rate || "0"),
          amount: String(li.amount || "0"),
        }))
      : [{ id: "new_1", itemDetails: "", quantity: "1", rate: "0", amount: "0" }]
    setEditLineItems(items)
    setEditingLineItems(true)
  }

  const cancelEditingLineItems = () => {
    setEditingLineItems(false)
    setEditLineItems([])
  }

  const updateEditLineItem = (id: string, field: "itemDetails" | "quantity" | "rate", value: string) => {
    setEditLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const next = { ...item, [field]: value }
        if (field === "quantity" || field === "rate") {
          const qty = parseFloat(next.quantity) || 0
          const rate = parseFloat(next.rate) || 0
          next.amount = (qty * rate).toFixed(2)
        }
        return next
      })
    )
  }

  const addEditLineItem = () => {
    const newId = `new_${Date.now()}`
    setEditLineItems((prev) => [...prev, { id: newId, itemDetails: "", quantity: "1", rate: "0", amount: "0" }])
  }

  const removeEditLineItem = (id: string) => {
    if (editLineItems.length > 1) {
      setEditLineItems((prev) => prev.filter((item) => item.id !== id))
    }
  }

  const saveEditedLineItems = async () => {
    if (!selectedOrder) return
    setEditItemsSaving(true)
    try {
      // Calculate new totals
      let subTotal = 0
      editLineItems.forEach((item) => {
        subTotal += parseFloat(item.amount) || 0
      })
      const taxAmount = subTotal * 0.13
      const total = subTotal + taxAmount

      const res = await fetch(`${API_BASE}/api/zoho/sales-orders/${selectedOrder.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineItems: editLineItems.map((item) => ({
            id: item.id,
            itemDetails: item.itemDetails,
            quantity: item.quantity,
            rate: item.rate,
            discount: "0",
            tax: "",
            amount: item.amount,
            reorderQty: "",
          })),
          amount: total,
          subTotal: subTotal,
          taxAmount: taxAmount,
          total: total,
        }),
      })
      if (!res.ok) throw new Error("Failed to save")
      const updated = await res.json()
      // Update the selected order and list
      setSelectedOrder(updated)
      setSalesOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
      setEditingLineItems(false)
      setEditLineItems([])
    } catch (err) {
      alert("Failed to save changes. Please try again.")
    } finally {
      setEditItemsSaving(false)
    }
  }

  // Fetch order history
  const fetchOrderHistory = async () => {
    if (!selectedOrder) return
    setHistoryLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/zoho/sales-orders/${selectedOrder.id}/history/`)
      if (res.ok) {
        const data = await res.json()
        setOrderHistory(data.history || [])
      }
    } catch (err) {
      console.error("Failed to fetch history:", err)
    } finally {
      setHistoryLoading(false)
    }
  }

  // Fetch linked invoices for the selected order
  const fetchLinkedInvoices = async (orderId: string) => {
    setLinkedInvoicesLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/zoho/invoices/`)
      if (res.ok) {
        const data = await res.json()
        const linked = (data.invoices || []).filter((inv: { salesOrderId?: string }) => inv.salesOrderId === orderId)
        setLinkedInvoices(linked.map((inv: { id: string; invoiceNumber: string; date: string; dueDate: string; status: string; total: number; balanceDue: number }) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          date: inv.date,
          dueDate: inv.dueDate,
          status: inv.status,
          total: inv.total || 0,
          balanceDue: inv.balanceDue || 0,
        })))
      }
    } catch (err) {
      console.error("Failed to fetch linked invoices:", err)
    } finally {
      setLinkedInvoicesLoading(false)
    }
  }

  // Fetch linked invoices when selected order changes
  useEffect(() => {
    if (selectedOrder) {
      fetchLinkedInvoices(selectedOrder.id)
    } else {
      setLinkedInvoices([])
    }
  }, [selectedOrder?.id])

  // Toggle history panel
  const toggleHistory = () => {
    if (!showHistory) {
      fetchOrderHistory()
    }
    setShowHistory(!showHistory)
  }

  // Revert to a history snapshot
  const handleRevert = async (historyId: number) => {
    if (!selectedOrder) return
    if (!confirm("Are you sure you want to revert to this previous version? This will replace the current order data.")) {
      return
    }
    setRevertLoading(historyId)
    try {
      const res = await fetch(`${API_BASE}/api/zoho/sales-orders/${selectedOrder.id}/revert/${historyId}/`, {
        method: "POST",
      })
      if (!res.ok) throw new Error("Failed to revert")
      const data = await res.json()
      if (data.order) {
        setSelectedOrder(data.order)
        setSalesOrders((prev) => prev.map((o) => (o.id === data.order.id ? data.order : o)))
        // Refresh history
        fetchOrderHistory()
        alert(data.message || "Order reverted successfully")
      }
    } catch (err) {
      alert("Failed to revert. Please try again.")
    } finally {
      setRevertLoading(null)
    }
  }

  const handleSaveOrder = async (
    formData: {
      customerName: string
      salesOrderNumber?: string
      reference: string
      date: string
      expectedShipmentDate: string
      status: SalesOrderType["status"]
      paymentTerms?: string
      deliveryMethod?: string
      salesperson?: string
      validity?: string
      leadTime?: string
      customerNotes?: string
      termsAndConditions?: string
    },
    onSuccess?: (order: SalesOrder) => void | Promise<void>
  ) => {
    const { subTotal, shippingCharges, adjustment, taxAmount, total } = computeLineTotals()
    const lineItems: SalesOrderLineItem[] = itemRows.map((row) => ({
      id: `li_${row.id}`,
      itemDetails: row.itemDetails,
      reorderQty: row.reorderQty,
      quantity: row.quantity,
      rate: row.rate,
      discount: row.discount,
      tax: row.tax,
      amount: String((parseFloat(row.quantity) || 0) * (parseFloat(row.rate) || 0) * (1 - (parseFloat(row.discount) || 0) / 100)),
      imageUrl: row.imageUrl || "",
    }))
    setSaveLoading(true)
    try {
      let saved: SalesOrder
      if (selectedOrder) {
        const res = await fetch(`${API_BASE}/api/zoho/sales-orders/${selectedOrder.id}/`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            customerId: formCustomerId,
            customerEmail: formCustomerEmail,
            amount: total,
            subTotal,
            shippingCharges,
            taxAmount,
            adjustment,
            total,
            customerNotes: formCustomerNotes,
            termsAndConditions: formTermsAndConditions,
            lineItems,
            invoiced: selectedOrder.invoiced,
            payment: selectedOrder.payment,
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err?.error || "Update failed")
        }
        saved = await res.json()
        setSalesOrders((prev) => prev.map((o) => (o.id === saved.id ? saved : o)))
        setSelectedOrder(saved)
        setShowNewForm(false)
        fetchOrders()
      } else {
        const res = await fetch(`${API_BASE}/api/zoho/sales-orders/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            customerId: formCustomerId,
            customerEmail: formCustomerEmail,
            amount: total,
            subTotal,
            shippingCharges,
            taxAmount,
            adjustment,
            total,
            customerNotes: formCustomerNotes,
            termsAndConditions: formTermsAndConditions,
            lineItems,
            invoiced: false,
            payment: "none",
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err?.error || "Create failed")
        }
        saved = await res.json()
        setSalesOrders((prev) => [saved, ...prev])
        setSelectedOrder(saved)
        setShowNewForm(false)
        fetchOrders()
      }
      if (onSuccess) await onSuccess(saved)
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed")
    } finally {
      setSaveLoading(false)
    }
  }

  const handleClone = async () => {
    if (!selectedOrder) return
    try {
      const res = await fetch(`${API_BASE}/api/zoho/sales-orders/${selectedOrder.id}/clone/`, { method: "POST" })
      if (!res.ok) throw new Error("Clone failed")
      const cloned = await res.json()
      setSalesOrders((prev) => [cloned, ...prev])
      setSelectedOrder(cloned)
    } catch (e) {
      console.error(e)
    }
  }

  // Open the status transition modal to review/edit items before changing status
  const openStatusModal = (newStatus: SalesOrderType["status"]) => {
    if (!selectedOrder) return
    // Initialize modal items from current order
    const items = selectedOrder.lineItems?.length
      ? selectedOrder.lineItems.map((li, i) => ({
          id: li.id || `item_${i}`,
          itemDetails: li.itemDetails || "",
          quantity: String(li.quantity || "1"),
          rate: String(li.rate || "0"),
          amount: String(li.amount || "0"),
          imageUrl: li.imageUrl || "",
        }))
      : [{ id: "new_1", itemDetails: "", quantity: "1", rate: "0", amount: "0", imageUrl: "" }]
    setStatusModalItems(items)
    setPendingStatus(newStatus)
    setShowStatusModal(true)
  }

  // Update item in status modal
  const updateStatusModalItem = (id: string, field: "itemDetails" | "quantity" | "rate", value: string) => {
    setStatusModalItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const next = { ...item, [field]: value }
        if (field === "quantity" || field === "rate") {
          const qty = parseFloat(next.quantity) || 0
          const rate = parseFloat(next.rate) || 0
          next.amount = (qty * rate).toFixed(2)
        }
        return next
      })
    )
  }

  // Add item in status modal
  const addStatusModalItem = () => {
    const newId = `new_${Date.now()}`
    setStatusModalItems((prev) => [...prev, { id: newId, itemDetails: "", quantity: "1", rate: "0", amount: "0", imageUrl: "" }])
  }

  // Remove item in status modal
  const removeStatusModalItem = (id: string) => {
    if (statusModalItems.length > 1) {
      setStatusModalItems((prev) => prev.filter((item) => item.id !== id))
    }
  }

  // Apply item search result to status modal row
  const applyStatusItemToRow = (rowId: string, item: { name: string; sku?: string; rate: number; imageUrl?: string }) => {
    setStatusModalItems((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r
        const rate = Number(item.rate) || 0
        return { ...r, itemDetails: item.name, rate: String(rate), quantity: "1", amount: String(rate), imageUrl: item.imageUrl || "" }
      })
    )
    setStatusActiveItemRowId(null)
    setStatusItemSearchQuery("")
    setStatusItemResults([])
  }

  // Confirm status change with edited items
  const confirmStatusChange = async () => {
    if (!selectedOrder || !pendingStatus) return
    setStatusModalSaving(true)
    try {
      // Calculate new totals
      let subTotal = 0
      statusModalItems.forEach((item) => {
        subTotal += parseFloat(item.amount) || 0
      })
      const taxAmount = subTotal * 0.13
      const total = subTotal + taxAmount

      const res = await fetch(`${API_BASE}/api/zoho/sales-orders/${selectedOrder.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: pendingStatus,
          customerName: selectedOrder.customerName,
          customerId: selectedOrder.customerId,
          customerEmail: selectedOrder.customerEmail,
          date: selectedOrder.date,
          reference: selectedOrder.reference,
          expectedShipmentDate: selectedOrder.expectedShipmentDate,
          lineItems: statusModalItems.map((item) => ({
            id: item.id,
            itemDetails: item.itemDetails,
            quantity: item.quantity,
            rate: item.rate,
            discount: "0",
            tax: "",
            amount: item.amount,
            reorderQty: "",
            imageUrl: item.imageUrl || "",
          })),
          amount: total,
          subTotal: subTotal,
          taxAmount: taxAmount,
          total: total,
          invoiced: selectedOrder.invoiced,
          payment: selectedOrder.payment,
        }),
      })
      if (!res.ok) throw new Error("Update failed")
      const updated = await res.json()
      setSalesOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
      setSelectedOrder(updated)
      setShowStatusModal(false)
      setPendingStatus(null)
      setStatusModalItems([])
    } catch (e) {
      console.error(e)
      alert("Failed to update status.")
    } finally {
      setStatusModalSaving(false)
    }
  }

  // Cancel status modal
  const cancelStatusModal = () => {
    setShowStatusModal(false)
    setPendingStatus(null)
    setStatusModalItems([])
  }

  // Legacy direct update (for backwards compatibility)
  const handleUpdateStatus = async (newStatus: SalesOrderType["status"]) => {
    // Open modal instead of direct update
    openStatusModal(newStatus)
  }

  const handleConvertToInvoice = async () => {
    if (!selectedOrder) return
    setConvertRemainingLoading(true)
    try {
      // Fetch remaining items from the API
      const res = await fetch(`${API_BASE}/api/zoho/sales-orders/${selectedOrder.id}/remaining-items/`)
      if (!res.ok) throw new Error("Failed to fetch remaining items")
      const data = await res.json()
      
      const remainingItems = data.remainingItems || []
      if (remainingItems.length === 0) {
        alert("All items have been invoiced. No remaining items to invoice.")
        setConvertRemainingLoading(false)
        return
      }
      
      // Initialize convert items with remaining quantities
      const items = remainingItems.map((item: { id: string; itemDetails: string; remainingQuantity: string; rate: string; imageUrl?: string }, i: number) => ({
        id: `convert_${i}`,
        itemDetails: item.itemDetails || "",
        quantity: item.remainingQuantity || "0",
        remainingQuantity: item.remainingQuantity || "0",
        rate: item.rate || "0",
        amount: String((parseFloat(item.remainingQuantity || "0") * parseFloat(item.rate || "0")).toFixed(2)),
        imageUrl: item.imageUrl || "",
        salesOrderLineItemId: item.id,
      }))
      
      setConvertItems(items)
      setShowConvertModal(true)
    } catch (e) {
      console.error(e)
      alert("Failed to load remaining items.")
    } finally {
      setConvertRemainingLoading(false)
    }
  }

  // Update convert item quantity (must not exceed remaining)
  const updateConvertItem = (id: string, field: "quantity" | "rate", value: string) => {
    setConvertItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const updated = { ...item, [field]: value }
        if (field === "quantity") {
          const qty = parseFloat(value) || 0
          const remaining = parseFloat(item.remainingQuantity) || 0
          // Clamp to remaining quantity
          if (qty > remaining) {
            updated.quantity = item.remainingQuantity
          }
        }
        // Recalculate amount
        const qty = parseFloat(updated.quantity) || 0
        const rate = parseFloat(updated.rate) || 0
        updated.amount = (qty * rate).toFixed(2)
        return updated
      })
    )
  }

  // Remove item from convert list
  const removeConvertItem = (id: string) => {
    if (convertItems.length > 1) {
      setConvertItems((prev) => prev.filter((item) => item.id !== id))
    }
  }

  // Confirm convert to invoice
  const confirmConvertToInvoice = async () => {
    if (!selectedOrder) return
    setConvertSaving(true)
    try {
      // Filter out items with 0 quantity
      const itemsToInvoice = convertItems.filter((item) => parseFloat(item.quantity) > 0)
      if (itemsToInvoice.length === 0) {
        alert("Please select at least one item to invoice.")
        setConvertSaving(false)
        return
      }

      // Calculate totals
      let subTotal = 0
      itemsToInvoice.forEach((item) => {
        subTotal += parseFloat(item.amount) || 0
      })
      const taxAmount = subTotal * 0.13
      const total = subTotal + taxAmount

      // Create invoice via API
      const res = await fetch(`${API_BASE}/api/zoho/invoices/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salesOrderId: selectedOrder.id,
          customerName: selectedOrder.customerName,
          customerId: selectedOrder.customerId,
          customerEmail: selectedOrder.customerEmail,
          date: new Date().toISOString().slice(0, 10),
          dueDate: new Date().toISOString().slice(0, 10),
          lineItems: itemsToInvoice.map((item) => ({
            id: item.id,
            itemDetails: item.itemDetails,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
            imageUrl: item.imageUrl,
            salesOrderLineItemId: item.salesOrderLineItemId,
          })),
          subTotal,
          taxAmount,
          total,
          status: "Draft",
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || "Failed to create invoice")
      }

      const invoice = await res.json()
      
      // Refresh the sales order to get updated invoicing status
      const soRes = await fetch(`${API_BASE}/api/zoho/sales-orders/${selectedOrder.id}/`)
      if (soRes.ok) {
        const updatedOrder = await soRes.json()
        setSalesOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)))
        setSelectedOrder(updatedOrder)
      }

      setShowConvertModal(false)
      setConvertItems([])
      alert(`Invoice created: ${invoice.invoiceNumber}`)
    } catch (e) {
      console.error(e)
      alert(e instanceof Error ? e.message : "Failed to create invoice.")
    } finally {
      setConvertSaving(false)
    }
  }

  // Cancel convert modal
  const cancelConvertModal = () => {
    setShowConvertModal(false)
    setConvertItems([])
  }

  // Next step in workflow: Draft → Sent → Confirm → … → Convert to Invoice → Close. Always returns a step when selectedOrder exists.
  const getNextStep = (): { label: string; onClick: () => void } => {
    const status = String(selectedOrder?.status ?? "").trim()
    const invoiced = Boolean(selectedOrder?.invoiced)
    // Draft first: next step is always Sent (never Convert to Invoice)
    if (status === "Draft") return { label: "Sent", onClick: () => handleUpdateStatus("Sent / Issued") }
    if (status === "Sent / Issued") return { label: "Confirm", onClick: () => handleUpdateStatus("Confirmed / Acknowledged") }
    if (status === "Confirmed / Acknowledged") return { label: "Convert to Invoice", onClick: handleConvertToInvoice }
    if (status === "Packing Slip") return { label: "Convert to Invoice", onClick: handleConvertToInvoice }
    if (status === "Received / Completed") return { label: "Convert to Invoice", onClick: handleConvertToInvoice }
    if (status === "Has Back Order (B/O)") return { label: "Convert to Invoice", onClick: handleConvertToInvoice }
    if (status === "Has Return(s) / RGA") return { label: "Convert to Invoice", onClick: handleConvertToInvoice }
    if (status === "ETA") return { label: "Convert to Invoice", onClick: handleConvertToInvoice }
    if (status === "Billed / Invoiced" || status === "Closed" || invoiced) return { label: "Close", onClick: () => setSelectedOrder(null) }
    if (!invoiced) return { label: "Convert to Invoice", onClick: handleConvertToInvoice }
    // Fallback: unknown status or missing data → show Sent (safe default) or Close
    return status ? { label: "Close", onClick: () => setSelectedOrder(null) } : { label: "Sent", onClick: () => handleUpdateStatus("Sent / Issued") }
  }

  useEffect(() => {
    if (showEmailForm && selectedOrder) {
      setEmailTo(selectedOrder.customerEmail || "")
      setEmailSubject(`Quote from Mekco Supply Inc. (Quote #: ${selectedOrder.salesOrderNumber})`)
    }
  }, [showEmailForm, selectedOrder?.id])

  /** Send quote email for an order (used by email form and by Save and Send / quick Send Email). */
  const sendOrderEmail = async (
    order: SalesOrder,
    to: string,
    options?: { subject?: string; body?: string; attachPdf?: boolean }
  ) => {
    const lineItemsBlock = order.lineItems?.length
      ? order.lineItems.map((li, i) => `${i + 1}. ${li.itemDetails || "—"}  |  Qty: ${li.quantity}  |  Rate: ${li.rate}  |  Amount: ${li.amount}`).join("\n")
      : ""
    const emailBody = options?.body ?? [
      `Dear ${order.customerName},`,
      "",
      "Thank you for your interest. Please find our quote attached to this email (PDF).",
      "",
      "QUOTE SUMMARY",
      "--------------------------------------------------------------------------------",
      `  Quote #:        ${order.salesOrderNumber}`,
      `  Order Date:     ${formatDisplayDate(order.date)}`,
      `  Ref#:           ${order.reference || "—"}`,
      `  Ship By:        ${formatDisplayDate(order.expectedShipmentDate) || "—"}`,
      `  Total Amount:   $${order.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      "",
      ...(lineItemsBlock ? ["LINE ITEMS", "--------------------------------------------------------------------------------", lineItemsBlock, ""] : []),
      "--------------------------------------------------------------------------------",
      "Assuring you of our best services at all times.",
      "",
      "Mekco Supply Inc.",
    ].join("\n")
    const res = await fetch(`${API_BASE}/api/zoho/sales-orders/${order.id}/send-email/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: to.trim(),
        subject: (options?.subject ?? (emailSubject.trim() || `Quote from Mekco Supply Inc. (Quote #: ${order.salesOrderNumber})`)).trim(),
        attachPdf: options?.attachPdf ?? emailAttachPdf,
        body: emailBody,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data?.error || `Send failed (${res.status})`)
    return data
  }

  const handleSendEmail = async () => {
    if (!selectedOrder) return
    const to = emailTo.trim()
    if (!to) {
      alert("Please enter an email address in Send To.")
      return
    }
    setSendEmailLoading(true)
    try {
      await sendOrderEmail(selectedOrder, to, { subject: emailSubject.trim(), attachPdf: emailAttachPdf })
      setShowEmailForm(false)
      alert("Email sent successfully.")
    } catch (e) {
      console.error(e)
      alert(e instanceof Error ? e.message : "Failed to send email.")
    } finally {
      setSendEmailLoading(false)
    }
  }

  /** Send Email button: if customer has email, send immediately (no preview); otherwise open email form. */
  const handleSendEmailClick = () => {
    if (!selectedOrder) return
    const to = (selectedOrder.customerEmail || "").trim()
    if (to) {
      setSendEmailLoading(true)
      sendOrderEmail(selectedOrder, to, { attachPdf: true })
        .then(() => alert("Email sent."))
        .catch((e) => alert(e instanceof Error ? e.message : "Failed to send email."))
        .finally(() => setSendEmailLoading(false))
    } else {
      setShowEmailForm(true)
    }
  }

  // Email Form View
  if (showEmailForm && selectedOrder) {
    return (
      <DashboardLayout activeItem="Sales" activeSubItem="Sales Orders">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
            <h1 className="text-base font-medium">Email To {selectedOrder.customerName}</h1>
          </div>

          {/* Email Form */}
          <div className="flex-1 overflow-auto p-4">
            <div className="max-w-4xl space-y-4">
              {/* From */}
              <div className="grid grid-cols-[80px_1fr] items-center gap-3">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">From <HelpCircle className="w-3 h-3" /></Label>
                <p className="text-xs">Mekco Account Receivable &lt;AR@mekcosupply.com&gt;</p>
              </div>

              {/* Send To - customer's email */}
              <div className="grid grid-cols-[80px_1fr] items-center gap-3">
                <Label className="text-xs text-muted-foreground">Send To</Label>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground block">Customer: {selectedOrder.customerName || "—"}</span>
                  <Input className="h-8 text-xs max-w-md" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} placeholder="Enter customer email" />
                </div>
              </div>

              {/* Subject */}
              <div className="grid grid-cols-[80px_1fr] items-center gap-3">
                <Label className="text-xs text-muted-foreground">Subject</Label>
                <Input className="h-8 text-xs" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
              </div>

              {/* Rich Text Editor Toolbar */}
              <div className="flex items-center gap-1 border rounded-t p-2 bg-muted/30">
                <Button variant="ghost" size="icon" className="h-7 w-7 font-bold">B</Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 italic">I</Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 underline">U</Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 line-through">S</Button>
                <div className="h-5 w-px bg-border mx-1" />
                <Select defaultValue="16">
                  <SelectTrigger className="h-7 w-16 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12" className="text-xs">12 px</SelectItem>
                    <SelectItem value="14" className="text-xs">14 px</SelectItem>
                    <SelectItem value="16" className="text-xs">16 px</SelectItem>
                  </SelectContent>
                </Select>
                <div className="h-5 w-px bg-border mx-1" />
                <Button variant="ghost" size="icon" className="h-7 w-7">&#8801;</Button>
              </div>

              {/* Email Body - full detail */}
              <div className="border border-t-0 rounded-b p-4 min-h-[300px]">
                <p className="text-sm mb-4">Dear {selectedOrder.customerName} team,</p>
                <p className="text-sm mb-4">Thanks for your interest in our services. Please find our quote attached to this mail.</p>
                <p className="text-sm mb-4">An overview of the quote is available below for your reference:</p>
                <p className="text-sm text-muted-foreground mb-4">------------------------------------------------------------------------------------------</p>
                <p className="text-lg font-semibold mb-4">Quote # : {selectedOrder.salesOrderNumber}</p>
                <p className="text-sm text-muted-foreground mb-2">------------------------------------------------------------------------------------------</p>
                <p className="text-sm"><strong>Order Date</strong>&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;{formatDisplayDate(selectedOrder.date)}</p>
                <p className="text-sm"><strong>Reference#</strong>&nbsp;&nbsp;:&nbsp;&nbsp;{selectedOrder.reference || "—"}</p>
                <p className="text-sm"><strong>Expected Shipment</strong>:&nbsp;&nbsp;{formatDisplayDate(selectedOrder.expectedShipmentDate) || "—"}</p>
                <p className="text-sm mb-2"><strong>Amount</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;${selectedOrder.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                {selectedOrder.lineItems?.length ? (
                  <>
                    <p className="text-xs font-medium mt-2 mb-1">Line items:</p>
                    <ul className="text-xs list-disc pl-4 mb-2">
                      {selectedOrder.lineItems.map((li, i) => (
                        <li key={i}>{li.itemDetails} — Qty: {li.quantity}, Rate: {li.rate}, Amount: {li.amount}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
                <p className="text-sm text-muted-foreground mb-4">------------------------------------------------------------------------------------------</p>
                <p className="text-sm">Assuring you of our best services at all times.</p>
              </div>

              {/* Attach PDF */}
              <div className="flex items-center gap-3 bg-muted/30 p-3 rounded">
                <Checkbox checked={emailAttachPdf} onCheckedChange={(v) => setEmailAttachPdf(Boolean(v))} className="h-4 w-4" />
                <span className="text-xs">Attach Sales Order PDF</span>
                <div className="flex-1" />
                <div className="flex items-center gap-2 bg-background rounded px-3 py-1.5">
                  <FileText className="w-4 h-4 text-red-500" />
                  <span className="text-xs">{selectedOrder.salesOrderNumber}</span>
                </div>
              </div>

              <Link href="#" className="text-xs text-primary flex items-center gap-1">
                <Plus className="w-3 h-3" /> Attachments
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 px-4 py-3 border-t bg-background">
            <Button className="bg-primary hover:bg-primary/90 h-8 text-xs" onClick={handleSendEmail} disabled={sendEmailLoading}>
              {sendEmailLoading ? "Sending…" : "Send"}
            </Button>
            <Button variant="ghost" className="h-8 text-xs" onClick={() => setShowEmailForm(false)} disabled={sendEmailLoading}>Cancel</Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Status Transition Form View - Edit items before changing status
  if (showStatusModal && pendingStatus && selectedOrder) {
    const statusSubTotal = statusModalItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
    const statusTax = statusSubTotal * 0.13
    const statusTotal = statusSubTotal + statusTax

    return (
      <DashboardLayout activeItem="Sales" activeSubItem="Sales Orders">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b bg-background sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">&#128722;</span>
              <h1 className="text-sm font-medium">Change Status: {selectedOrder.salesOrderNumber}</h1>
              <div className="flex items-center gap-1 ml-3 px-2 py-1 rounded bg-muted/50">
                <span className="text-xs text-muted-foreground">{selectedOrder.status}</span>
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs font-medium text-teal-600">{pendingStatus}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelStatusModal}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-3">
              {/* Customer Info (Read-only display) */}
              <div className="grid grid-cols-[160px_1fr] items-center gap-3">
                <Label className="text-xs text-primary">Customer Name*</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{selectedOrder.customerName}</span>
                  <div className="flex items-center gap-1 bg-muted/50 rounded px-2 py-0.5 text-xs">
                    <Circle className="w-2 h-2 fill-teal-500 text-teal-500" />
                    CAD
                  </div>
                </div>
              </div>

              {/* Order Number */}
              <div className="grid grid-cols-[160px_1fr] items-center gap-3">
                <Label className="text-xs text-primary">Sales Order#*</Label>
                <Input className="h-8 text-xs max-w-[220px]" value={selectedOrder.salesOrderNumber} readOnly />
              </div>

              {/* Reference */}
              <div className="grid grid-cols-[160px_1fr] items-center gap-3">
                <Label className="text-xs text-muted-foreground">Reference#</Label>
                <Input className="h-8 text-xs max-w-[220px]" value={selectedOrder.reference || ""} readOnly />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-[160px_1fr] items-center gap-3">
                <Label className="text-xs text-primary">Sales Order Date*</Label>
                <Input className="h-8 text-xs max-w-[220px]" type="date" value={selectedOrder.date} readOnly />
              </div>

              <div className="grid grid-cols-[160px_1fr] items-center gap-3">
                <Label className="text-xs text-muted-foreground">Expected Shipment Date</Label>
                <Input className="h-8 text-xs max-w-[220px]" type="date" value={selectedOrder.expectedShipmentDate || ""} readOnly />
              </div>

              {/* Tax Exclusive */}
              <div className="flex items-center gap-2 mt-2">
                <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs">Tax Exclusive</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </div>

              {/* Item Table */}
              <div className="mt-6 border rounded bg-card w-full">
                <div className="flex items-center justify-between p-3 border-b">
                  <h3 className="text-xs font-medium">Item Table</h3>
                  <div className="flex items-center gap-3">
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                      <Search className="w-3 h-3 mr-1" />
                      Scan Item
                    </Button>
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                      <HelpCircle className="w-3 h-3 mr-1" />
                      Bulk Actions
                    </Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="w-10 py-1.5 px-2"></TableHead>
                        <TableHead className="text-[10px] font-medium py-1.5 px-2">ITEM DETAILS</TableHead>
                        <TableHead className="text-[10px] font-medium py-1.5 px-2 text-center w-[90px]">QUANTITY</TableHead>
                        <TableHead className="text-[10px] font-medium py-1.5 px-2 text-center w-[90px]">
                          <div className="flex items-center justify-center gap-1">RATE <HelpCircle className="w-3 h-3" /></div>
                        </TableHead>
                        <TableHead className="text-[10px] font-medium py-1.5 px-2 text-center w-[80px]">DISCOUNT</TableHead>
                        <TableHead className="text-[10px] font-medium py-1.5 px-2 text-center w-[110px]">
                          <div className="flex items-center justify-center gap-1">TAX <HelpCircle className="w-3 h-3" /></div>
                        </TableHead>
                        <TableHead className="text-[10px] font-medium py-1.5 px-2 text-right w-[80px]">AMOUNT</TableHead>
                        <TableHead className="w-16 py-1.5 px-2"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {statusModalItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="py-1.5 px-2">
                            <div className="flex flex-col gap-0.5 text-muted-foreground cursor-move">
                              <MoreHorizontal className="w-3 h-3 rotate-90" />
                            </div>
                          </TableCell>
                          <TableCell className="py-1.5 px-2">
                            <div
                              className="relative flex items-center gap-2"
                              ref={statusActiveItemRowId === item.id ? statusItemContainerRef : undefined}
                            >
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt="" className="w-8 h-8 object-cover rounded border shrink-0" />
                              ) : (
                                <div className="w-8 h-8 border rounded flex items-center justify-center bg-muted/30 shrink-0">
                                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                </div>
                              )}
                              <Input
                                ref={statusActiveItemRowId === item.id ? statusItemInputRef : undefined}
                                className="h-7 text-xs border-0 shadow-none px-0 focus-visible:ring-0 flex-1 min-w-0"
                                placeholder="Type name, SKU, UPC or EAN to search..."
                                value={item.itemDetails}
                                onChange={(e) => {
                                  updateStatusModalItem(item.id, "itemDetails", e.target.value)
                                  setStatusItemSearchQuery(e.target.value)
                                  setStatusActiveItemRowId(item.id)
                                }}
                                onFocus={() => {
                                  setStatusActiveItemRowId(item.id)
                                  setStatusItemSearchQuery(item.itemDetails)
                                }}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="py-1.5 px-2">
                            <Input
                              className="h-7 text-xs text-center"
                              type="number"
                              min="0"
                              value={item.quantity}
                              onChange={(e) => updateStatusModalItem(item.id, "quantity", e.target.value)}
                            />
                          </TableCell>
                          <TableCell className="py-1.5 px-2">
                            <Input
                              className="h-7 text-xs text-center"
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.rate}
                              onChange={(e) => updateStatusModalItem(item.id, "rate", e.target.value)}
                            />
                          </TableCell>
                          <TableCell className="py-1.5 px-2">
                            <div className="flex items-center">
                              <Input className="h-7 text-xs text-center w-12" defaultValue="0" readOnly />
                              <span className="text-xs text-muted-foreground ml-1">%</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-1.5 px-2">
                            <Select defaultValue="gst">
                              <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Select a Tax" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="gst" className="text-xs">GST/HST [13%]</SelectItem>
                                <SelectItem value="exempt" className="text-xs">Exempt</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="py-1.5 px-2 text-right text-xs">{parseFloat(item.amount || "0").toFixed(2)}</TableCell>
                          <TableCell className="py-1.5 px-2">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-red-500"
                                onClick={() => removeStatusModalItem(item.id)}
                                disabled={statusModalItems.length <= 1}
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
                <div className="flex items-center gap-3 p-3 border-t">
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary" onClick={addStatusModalItem}>
                    <Plus className="w-3 h-3 mr-1" />
                    Add New Row
                  </Button>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                    <Plus className="w-3 h-3 mr-1" />
                    Add Items in Bulk
                  </Button>
                </div>
              </div>

              {/* Totals Section */}
              <div className="flex justify-end mt-6">
                <div className="w-full max-w-md space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Sub Total</span>
                    <span className="text-sm font-medium">{statusSubTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Shipping Charges</span>
                    <div className="flex items-center gap-2">
                      <Input className="h-8 text-sm w-20 text-right" defaultValue="0" />
                      <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm w-16 text-right">0.00</span>
                    </div>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">GST/HST [13%]</span>
                      <span className="text-sm">{statusTax.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm" className="h-8 text-sm bg-transparent">Adjustment</Button>
                    <div className="flex items-center gap-2">
                      <Input className="h-8 text-sm w-20 text-right" defaultValue="0" />
                      <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm w-16 text-right">0.00</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-base font-semibold">Total ( $ )</span>
                    <span className="text-base font-semibold">{statusTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Customer Notes & Terms */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Customer Notes</Label>
                  <Textarea className="text-xs min-h-[80px] resize-y" placeholder="Enter any notes to be displayed in your transaction" defaultValue={selectedOrder.customerNotes || ""} />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Terms & Conditions</Label>
                  <Textarea className="text-xs min-h-[80px] resize-y" placeholder="Enter the terms and conditions of your business to be displayed in your transaction" />
                </div>
              </div>
            </div>
          </div>

          {/* Item search dropdown portal for status modal */}
          {isClient &&
            statusItemDropdownRect &&
            statusActiveItemRowId !== null &&
            statusItemResults.length > 0 &&
            typeof document !== "undefined" &&
            createPortal(
              <div
                ref={statusItemDropdownRef}
                className="rounded-md border bg-popover text-popover-foreground shadow-lg max-h-48 overflow-auto z-[100]"
                style={{
                  position: "fixed",
                  top: statusItemDropdownRect.top,
                  left: statusItemDropdownRect.left,
                  width: statusItemDropdownRect.width,
                }}
                role="listbox"
              >
                {statusItemResults.map((it) => (
                  <div
                    key={it.id}
                    role="option"
                    className="px-3 py-2 text-xs cursor-pointer hover:bg-muted/80 border-b last:border-0"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (statusActiveItemRowId !== null) applyStatusItemToRow(statusActiveItemRowId, { name: it.name, sku: it.sku, rate: it.rate, imageUrl: it.imageUrl })
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {it.imageUrl ? (
                        <img src={it.imageUrl} alt="" className="w-8 h-8 object-cover rounded border" />
                      ) : (
                        <div className="w-8 h-8 border rounded flex items-center justify-center bg-muted/30 shrink-0">
                          <ImageIcon className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{it.name}</div>
                        <div className="text-muted-foreground flex gap-2 flex-wrap">
                          {it.sku && <span>SKU: {it.sku}</span>}
                          {it.upc && <span>UPC: {it.upc}</span>}
                          {it.ean && <span>EAN: {it.ean}</span>}
                          <span>${Number(it.rate).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>,
              document.body
            )}

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t bg-background shrink-0">
            <div className="flex items-center gap-2">
              <Button
                className="bg-primary hover:bg-primary/90 h-8 text-xs"
                disabled={statusModalSaving}
                onClick={confirmStatusChange}
              >
                {statusModalSaving ? "Saving…" : `Save & Change to ${pendingStatus}`}
              </Button>
              <Button variant="outline" className="h-8 text-xs bg-transparent" onClick={cancelStatusModal} disabled={statusModalSaving}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Convert to Invoice Form View - Select items and quantities to invoice
  if (showConvertModal && selectedOrder) {
    const convertSubTotal = convertItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
    const convertTax = convertSubTotal * 0.13
    const convertTotal = convertSubTotal + convertTax

    return (
      <DashboardLayout activeItem="Sales" activeSubItem="Sales Orders">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b bg-background sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">&#128196;</span>
              <h1 className="text-sm font-medium">Convert to Invoice: {selectedOrder.salesOrderNumber}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelConvertModal}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-3">
              {/* Customer Info (Read-only display) */}
              <div className="grid grid-cols-[160px_1fr] items-center gap-3">
                <Label className="text-xs text-primary">Customer Name*</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{selectedOrder.customerName}</span>
                  <div className="flex items-center gap-1 bg-muted/50 rounded px-2 py-0.5 text-xs">
                    <Circle className="w-2 h-2 fill-teal-500 text-teal-500" />
                    CAD
                  </div>
                </div>
              </div>

              {/* Sales Order Number */}
              <div className="grid grid-cols-[160px_1fr] items-center gap-3">
                <Label className="text-xs text-muted-foreground">From Sales Order#</Label>
                <span className="text-sm">{selectedOrder.salesOrderNumber}</span>
              </div>

              {/* Invoice Date */}
              <div className="grid grid-cols-[160px_1fr] items-center gap-3">
                <Label className="text-xs text-primary">Invoice Date*</Label>
                <Input className="h-8 text-xs max-w-[220px]" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
              </div>

              {/* Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded p-3 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-1">Partial Invoicing</p>
                  <p>Select items and quantities to include in this invoice. Remaining quantities can be invoiced later.</p>
                </div>
              </div>

              {/* Item Table */}
              <div className="mt-6 border rounded bg-card w-full">
                <div className="flex items-center justify-between p-3 border-b">
                  <h3 className="text-xs font-medium">Items to Invoice</h3>
                </div>
                <div className="overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="w-10 py-1.5 px-2"></TableHead>
                        <TableHead className="text-[10px] font-medium py-1.5 px-2">ITEM DETAILS</TableHead>
                        <TableHead className="text-[10px] font-medium py-1.5 px-2 text-center w-[90px]">REMAINING</TableHead>
                        <TableHead className="text-[10px] font-medium py-1.5 px-2 text-center w-[90px]">QTY TO INVOICE</TableHead>
                        <TableHead className="text-[10px] font-medium py-1.5 px-2 text-center w-[90px]">RATE</TableHead>
                        <TableHead className="text-[10px] font-medium py-1.5 px-2 text-right w-[100px]">AMOUNT</TableHead>
                        <TableHead className="w-12 py-1.5 px-2"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {convertItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="py-1.5 px-2">
                            <div className="flex flex-col gap-0.5 text-muted-foreground">
                              <MoreHorizontal className="w-3 h-3 rotate-90" />
                            </div>
                          </TableCell>
                          <TableCell className="py-1.5 px-2">
                            <div className="flex items-center gap-2">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt="" className="w-8 h-8 object-cover rounded border shrink-0" />
                              ) : (
                                <div className="w-8 h-8 border rounded flex items-center justify-center bg-muted/30 shrink-0">
                                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                </div>
                              )}
                              <span className="text-xs">{item.itemDetails}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-1.5 px-2 text-center">
                            <span className="text-xs text-muted-foreground">{item.remainingQuantity}</span>
                          </TableCell>
                          <TableCell className="py-1.5 px-2">
                            <Input
                              className="h-7 text-xs text-center"
                              type="number"
                              min="0"
                              max={item.remainingQuantity}
                              value={item.quantity}
                              onChange={(e) => updateConvertItem(item.id, "quantity", e.target.value)}
                            />
                          </TableCell>
                          <TableCell className="py-1.5 px-2 text-center">
                            <span className="text-xs">${parseFloat(item.rate).toFixed(2)}</span>
                          </TableCell>
                          <TableCell className="py-1.5 px-2 text-right">
                            <span className="text-xs font-medium">${parseFloat(item.amount || "0").toFixed(2)}</span>
                          </TableCell>
                          <TableCell className="py-1.5 px-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-500 hover:text-red-700"
                              onClick={() => removeConvertItem(item.id)}
                              disabled={convertItems.length <= 1}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Totals Section */}
              <div className="flex justify-end mt-6">
                <div className="w-full max-w-md space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Sub Total</span>
                    <span className="text-sm font-medium">${convertSubTotal.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">GST/HST [13%]</span>
                      <span className="text-sm">${convertTax.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-base font-semibold">Invoice Total ( $ )</span>
                    <span className="text-base font-semibold">${convertTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t bg-background shrink-0">
            <div className="flex items-center gap-2">
              <Button
                className="bg-primary hover:bg-primary/90 h-8 text-xs"
                disabled={convertSaving}
                onClick={confirmConvertToInvoice}
              >
                {convertSaving ? "Creating Invoice…" : "Create Invoice"}
              </Button>
              <Button variant="outline" className="h-8 text-xs bg-transparent" onClick={cancelConvertModal} disabled={convertSaving}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // New/Edit Form View
  if (showNewForm) {
    return (
      <DashboardLayout activeItem="Sales" activeSubItem="Sales Orders">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b bg-background sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">&#128722;</span>
              <h1 className="text-sm font-medium">{selectedOrder ? "Edit Sales Order" : "New Sales Order"}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs bg-transparent">
                <Sparkles className="w-3 h-3 mr-1.5" />
                CoCreate Agent
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Settings className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setShowNewForm(false); setSelectedOrder(null) }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-auto p-4">
            <div className="flex gap-4">
              <div className="flex-1 space-y-3">
                {/* Customer Name - searchable */}
                <div className="grid grid-cols-[160px_1fr] items-center gap-3">
                  <Label className="text-xs text-primary">Customer Name*</Label>
                  <div className="flex gap-1.5 max-w-md relative" ref={customerContainerRef}>
                    <Input
                      className="h-8 text-xs flex-1"
                      value={formCustomerName}
                      onChange={(e) => {
                        setFormCustomerName(e.target.value)
                        setCustomerSearchQuery(e.target.value)
                        if (!e.target.value) { setFormCustomerId(undefined); setFormCustomerEmail("") }
                      }}
                      onFocus={() => {
                        setCustomerSearchQuery(formCustomerName)
                        if (formCustomerName.trim()) setCustomerDropdownOpen(true)
                      }}
                      placeholder="Type to search customers..."
                    />
                    <Button type="button" size="icon" className="h-8 w-8 bg-primary hover:bg-primary/90 shrink-0" aria-label="Search customers">
                      <Search className="w-3.5 h-3.5" />
                    </Button>
                    <div className="flex items-center gap-1 bg-muted/50 rounded px-2 text-xs">
                      <Circle className="w-2 h-2 fill-teal-500 text-teal-500" />
                      CAD
                    </div>
                    {customerDropdownOpen && customerResults.length > 0 && (
                      <ul className="absolute z-50 top-full left-0 mt-1 w-full max-w-md min-w-[280px] rounded-md border bg-popover text-popover-foreground shadow-md max-h-60 overflow-auto">
                        {customerResults.map((c) => (
                          <li
                            key={c.id}
                            className="px-3 py-2 text-xs cursor-pointer hover:bg-muted/80 border-b last:border-0"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setFormCustomerName(c.name)
                              setFormCustomerId(c.id)
                              setFormCustomerEmail(c.email || "")
                              setCustomerSearchQuery("")
                              setCustomerResults([])
                              setCustomerDropdownOpen(false)
                            }}
                          >
                            <div className="font-medium">{c.name}</div>
                            {(c.companyName || c.email) && (
                              <div className="text-muted-foreground truncate">{[c.companyName, c.email].filter(Boolean).join(" · ")}</div>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Billing/Shipping Address */}
                {selectedOrder && (
                  <div className="grid grid-cols-[160px_1fr] items-start gap-3">
                    <div />
                    <div className="flex gap-8">
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1">BILLING ADDRESS</p>
                        <Link href="#" className="text-xs text-primary">New Address</Link>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1">SHIPPING ADDRESS</p>
                        <div className="flex gap-2">
                          <Link href="#" className="text-xs text-primary">New Address</Link>
                          <Link href="#" className="text-xs text-primary">+ Dropshipping Address</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tax */}
                {selectedOrder && (
                  <div className="grid grid-cols-[160px_1fr] items-center gap-3">
                    <div />
                    <p className="text-xs">Tax: <span className="font-medium">GST/HST ( 13% )</span> <Pencil className="w-3 h-3 inline text-primary ml-1" /></p>
                  </div>
                )}

                {/* Sales Order # */}
                <div className="grid grid-cols-[160px_1fr] items-center gap-3">
                  <Label className="text-xs text-primary">Sales Order#*</Label>
                  <div className="flex items-center gap-1.5 max-w-[220px]">
                    <Input className="h-8 text-xs flex-1" value={selectedOrder ? selectedOrder.salesOrderNumber : nextNumber || "—"} readOnly />
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <Settings className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Status */}
                <div className="grid grid-cols-[160px_1fr] items-center gap-3">
                  <Label className="text-xs text-primary">Status</Label>
                  <Select value={formStatus} onValueChange={(v) => setFormStatus(v as SalesOrderType["status"])}>
                    <SelectTrigger className="h-8 text-xs max-w-[220px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SALES_ORDER_STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Reference */}
                <div className="grid grid-cols-[160px_1fr] items-center gap-3">
                  <Label className="text-xs text-muted-foreground">Reference#</Label>
                  <Input className="h-8 text-xs max-w-[220px]" value={formReference} onChange={(e) => setFormReference(e.target.value)} />
                </div>

                {/* Sales Order Date */}
                <div className="grid grid-cols-[160px_1fr] items-center gap-3">
                  <Label className="text-xs text-primary">Sales Order Date*</Label>
                  <Input className="h-8 text-xs max-w-[220px]" type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
                </div>

                {/* Expected Shipment Date */}
                <div className="grid grid-cols-[160px_1fr] items-center gap-3">
                  <Label className="text-xs text-muted-foreground">Expected Shipment Date</Label>
                  <Input className="h-8 text-xs max-w-[220px]" type="date" value={formExpectedShipmentDate} onChange={(e) => setFormExpectedShipmentDate(e.target.value)} placeholder="YYYY-MM-DD" />
                </div>

                {/* Payment Terms */}
                <div className="grid grid-cols-[160px_1fr] items-center gap-3">
                  <Label className="text-xs text-muted-foreground">Payment Terms</Label>
                  <Select defaultValue="receipt">
                    <SelectTrigger className="h-8 text-xs max-w-[220px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receipt" className="text-xs">Due on Receipt</SelectItem>
                      <SelectItem value="net15" className="text-xs">Net 15</SelectItem>
                      <SelectItem value="net30" className="text-xs">Net 30</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Delivery Method */}
                <div className="grid grid-cols-[160px_1fr] items-center gap-3">
                  <Label className="text-xs text-muted-foreground">Delivery Method</Label>
                  <Select>
                    <SelectTrigger className="h-8 text-xs max-w-[220px]"><SelectValue placeholder="Select a delivery method or type to add" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pickup" className="text-xs">Pickup</SelectItem>
                      <SelectItem value="delivery" className="text-xs">Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Salesperson */}
                <div className="grid grid-cols-[160px_1fr] items-center gap-3">
                  <Label className="text-xs text-muted-foreground">Salesperson</Label>
                  <div className="flex items-center gap-1.5 max-w-[220px]">
                    <Select defaultValue="mekco">
                      <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mekco" className="text-xs">Mekco Supply</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Validity & Lead Time */}
                <div className="grid grid-cols-[160px_1fr] items-center gap-3">
                  <Label className="text-xs text-muted-foreground">Validity</Label>
                  <div className="flex gap-4 max-w-md">
                    <Input className="h-8 text-xs flex-1" />
                    <div className="flex items-center gap-2 flex-1">
                      <Label className="text-xs text-muted-foreground whitespace-nowrap">Lead time</Label>
                      <Input className="h-8 text-xs flex-1" />
                    </div>
                  </div>
                </div>

                {/* Tax Exclusive */}
                <div className="flex items-center gap-2 mt-2">
                  <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs">Tax Exclusive</span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </div>

                {/* Item Table */}
                <div className="mt-6 border rounded bg-card w-full">
                  <div className="flex items-center justify-between p-3 border-b">
                    <h3 className="text-xs font-medium">Item Table</h3>
                    <div className="flex items-center gap-3">
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                        <Search className="w-3 h-3 mr-1" />
                        Scan Item
                      </Button>
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                        <HelpCircle className="w-3 h-3 mr-1" />
                        Bulk Actions
                      </Button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="w-10 py-1.5 px-2"></TableHead>
                          <TableHead className="text-[10px] font-medium py-1.5 px-2">ITEM DETAILS</TableHead>
                          <TableHead className="text-[10px] font-medium py-1.5 px-2 text-center w-[100px]">REORDER QTY</TableHead>
                          <TableHead className="text-[10px] font-medium py-1.5 px-2 text-center w-[90px]">QUANTITY</TableHead>
                          <TableHead className="text-[10px] font-medium py-1.5 px-2 text-center w-[90px]">
                            <div className="flex items-center justify-center gap-1">RATE <HelpCircle className="w-3 h-3" /></div>
                          </TableHead>
                          <TableHead className="text-[10px] font-medium py-1.5 px-2 text-center w-[80px]">DISCOUNT</TableHead>
                          <TableHead className="text-[10px] font-medium py-1.5 px-2 text-center w-[110px]">
                            <div className="flex items-center justify-center gap-1">TAX <HelpCircle className="w-3 h-3" /></div>
                          </TableHead>
                          <TableHead className="text-[10px] font-medium py-1.5 px-2 text-right w-[80px]">AMOUNT</TableHead>
                          <TableHead className="w-16 py-1.5 px-2"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {itemRows.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell className="py-1.5 px-2">
                              <div className="flex flex-col gap-0.5 text-muted-foreground cursor-move">
                                <MoreHorizontal className="w-3 h-3 rotate-90" />
                              </div>
                            </TableCell>
                            <TableCell className="py-1.5 px-2">
                              <div
                                className="relative flex items-center gap-2"
                                ref={activeItemRowId === row.id ? itemContainerRef : undefined}
                              >
                                {row.imageUrl ? (
                                  <img src={row.imageUrl} alt="" className="w-8 h-8 object-cover rounded border shrink-0" />
                                ) : (
                                  <div className="w-8 h-8 border rounded flex items-center justify-center bg-muted/30 shrink-0">
                                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                )}
                                <Input
                                  ref={activeItemRowId === row.id ? itemInputRef : undefined}
                                  className="h-7 text-xs border-0 shadow-none px-0 focus-visible:ring-0 flex-1 min-w-0"
                                  placeholder="Type name, SKU, UPC or EAN to search..."
                                  value={row.itemDetails}
                                  onChange={(e) => {
                                    updateLineItem(row.id, "itemDetails", e.target.value)
                                    setItemSearchQuery(e.target.value)
                                    setActiveItemRowId(row.id)
                                  }}
                                  onFocus={() => {
                                    setActiveItemRowId(row.id)
                                    setItemSearchQuery(row.itemDetails)
                                  }}
                                />
                              </div>
                            </TableCell>
                            <TableCell className="py-1.5 px-2">
                              <Input className="h-7 text-xs text-center" value={row.reorderQty} onChange={(e) => updateLineItem(row.id, "reorderQty", e.target.value)} />
                            </TableCell>
                            <TableCell className="py-1.5 px-2">
                              <Input className="h-7 text-xs text-center" value={row.quantity} onChange={(e) => updateLineItem(row.id, "quantity", e.target.value)} />
                            </TableCell>
                            <TableCell className="py-1.5 px-2">
                              <Input className="h-7 text-xs text-center" value={row.rate} onChange={(e) => updateLineItem(row.id, "rate", e.target.value)} />
                            </TableCell>
                            <TableCell className="py-1.5 px-2">
                              <div className="flex items-center">
                                <Input className="h-7 text-xs text-center w-12" value={row.discount} onChange={(e) => updateLineItem(row.id, "discount", e.target.value)} />
                                <span className="text-xs text-muted-foreground ml-1">%</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-1.5 px-2">
                              <Select value={row.tax || ""} onValueChange={(v) => updateLineItem(row.id, "tax", v)}>
                                <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Select a Tax" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="gst" className="text-xs">GST/HST [13%]</SelectItem>
                                  <SelectItem value="exempt" className="text-xs">Exempt</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="py-1.5 px-2 text-right text-xs">{row.amount}</TableCell>
                            <TableCell className="py-1.5 px-2">
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreVertical className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => removeRow(row.id)}>
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex items-center gap-3 p-3 border-t">
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary" onClick={addNewRow}>
                      <Plus className="w-3 h-3 mr-1" />
                      Add New Row
                    </Button>
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                      <Plus className="w-3 h-3 mr-1" />
                      Add Items in Bulk
                    </Button>
                  </div>
                </div>

                {/* Totals Section */}
                <div className="flex justify-end mt-6">
                  <div className="w-full max-w-md space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Sub Total</span>
                      <span className="text-sm font-medium">{computeLineTotals().subTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Shipping Charges</span>
                      <div className="flex items-center gap-1">
                        <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => setFormShippingCharges(String(Math.max(0, (parseFloat(formShippingCharges) || 0) - 1)))}>-</Button>
                        <Input className="h-8 text-sm w-20 text-right" value={formShippingCharges} onChange={(e) => setFormShippingCharges(e.target.value)} />
                        <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => setFormShippingCharges(String((parseFloat(formShippingCharges) || 0) + 1))}>+</Button>
                        <span className="text-sm w-12 text-right shrink-0">{computeLineTotals().shippingCharges.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">GST/HST [13%]</span>
                        <span className="text-sm">{computeLineTotals().taxAmount.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Adjustment</span>
                      <div className="flex items-center gap-1">
                        <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => setFormAdjustment(String((parseFloat(formAdjustment) || 0) - 1))}>-</Button>
                        <Input className="h-8 text-sm w-20 text-right" value={formAdjustment} onChange={(e) => setFormAdjustment(e.target.value)} />
                        <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => setFormAdjustment(String((parseFloat(formAdjustment) || 0) + 1))}>+</Button>
                        <span className="text-sm w-12 text-right shrink-0">{computeLineTotals().adjustment.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-base font-semibold">Total ( $ )</span>
                      <span className="text-base font-semibold">{computeLineTotals().total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Notes & Terms */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Customer Notes</Label>
                    <Textarea className="text-xs min-h-[80px] resize-y" placeholder="Enter any notes to be displayed in your transaction" value={formCustomerNotes} onChange={(e) => setFormCustomerNotes(e.target.value)} />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1.5 block">Terms & Conditions</Label>
                      <Textarea className="text-xs min-h-[80px] resize-y" placeholder="Enter the terms and conditions of your business to be displayed in your transaction" value={formTermsAndConditions} onChange={(e) => setFormTermsAndConditions(e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1.5 block">Attach File(s) to Sales Order</Label>
                      <input
                        ref={orderFileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.gif"
                        className="hidden"
                        onChange={(e) => {
                          const files = e.target.files ? Array.from(e.target.files) : []
                          e.target.value = ""
                          if (orderAttachmentFiles.length + files.length > 10) return
                          setOrderAttachmentFiles((prev) => [...prev, ...files.map((f) => ({ name: f.name, size: f.size }))])
                        }}
                      />
                      <Button type="button" variant="outline" size="sm" className="h-7 text-xs bg-transparent" onClick={() => orderFileInputRef.current?.click()} disabled={orderAttachmentFiles.length >= 10}>
                        <Upload className="w-3 h-3 mr-1.5" /> Upload File <ChevronDown className="w-3 h-3 ml-1.5" />
                      </Button>
                      <p className="text-[10px] text-muted-foreground mt-1">You can upload a maximum of 10 files, 5MB each</p>
                      {orderAttachmentFiles.length > 0 && (
                        <ul className="mt-2 space-y-1 text-xs">
                          {orderAttachmentFiles.map((f, i) => (
                            <li key={i} className="flex items-center justify-between gap-2">
                              <span className="truncate">{f.name}</span>
                              <Button type="button" variant="ghost" size="sm" className="h-5 text-destructive shrink-0" onClick={() => setOrderAttachmentFiles((prev) => prev.filter((_, j) => j !== i))}><X className="w-3 h-3" /></Button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                {/* Email Communications */}
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Label className="text-xs font-medium">Email Communications</Label>
                    <button type="button" className="text-xs text-primary hover:underline" onClick={() => setFormEmailRecipients((prev) => prev.map((p) => ({ ...p, selected: true })))}>Select All</button>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button type="button" variant="link" size="sm" className="h-auto p-0 text-xs text-primary" onClick={() => setFormEmailRecipients((prev) => [...prev, { id: `e_${Date.now()}`, email: "", selected: false }])}>
                      <Plus className="w-3 h-3 mr-1" /> Add New
                    </Button>
                    {formCustomerEmail && (
                      <div className="flex items-center gap-2">
                        <Checkbox className="h-3.5 w-3.5" checked={formEmailRecipients.find((r) => r.id === "cust")?.selected ?? false} onCheckedChange={(c) => {
                          if (formEmailRecipients.some((r) => r.id === "cust")) setFormEmailRecipients((prev) => prev.map((r) => r.id === "cust" ? { ...r, selected: !!c } : r))
                          else setFormEmailRecipients((prev) => [{ id: "cust", email: formCustomerEmail, selected: !!c }, ...prev])
                        }} />
                        <span className="text-xs">{formCustomerEmail}</span>
                      </div>
                    )}
                    {formEmailRecipients.filter((r) => r.id !== "cust").map((r) => (
                      <div key={r.id} className="flex items-center gap-2">
                        <Checkbox className="h-3.5 w-3.5" checked={r.selected} onCheckedChange={(c) => setFormEmailRecipients((prev) => prev.map((p) => p.id === r.id ? { ...p, selected: !!c } : p))} />
                        <Input className="h-7 text-xs w-48" type="email" placeholder="Email" value={r.email} onChange={(e) => setFormEmailRecipients((prev) => prev.map((p) => p.id === r.id ? { ...p, email: e.target.value } : p))} />
                        <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => setFormEmailRecipients((prev) => prev.filter((p) => p.id !== r.id))}><X className="w-3 h-3" /></Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Fields Note */}
                <p className="text-xs text-muted-foreground mt-4">
                  <span className="font-medium">Additional Fields:</span> Add custom fields to your sales orders by going to{" "}
                  <span className="text-primary">Settings</span> ➔{" "}
                  <span className="text-primary">Sales</span> ➔{" "}
                  <span className="text-primary">Sales Orders</span> ➔{" "}
                  <span className="text-primary">Field Customization</span>.
                </p>
              </div>

              {/* Customer Details Panel */}
              {selectedOrder && (
                <div className="shrink-0 w-0">
                  <div className="bg-teal-600 text-white p-3 rounded-t flex items-center justify-between">
                    <span className="text-xs font-medium">{selectedOrder.customerName}&apos;s Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Item search dropdown portal - only after client mount to avoid SSR document access */}
          {isClient &&
            itemDropdownRect &&
            activeItemRowId !== null &&
            itemResults.length > 0 &&
            typeof document !== "undefined" &&
            createPortal(
              <div
                ref={itemDropdownRef}
                className="rounded-md border bg-popover text-popover-foreground shadow-lg max-h-48 overflow-auto z-[100]"
                style={{
                  position: "fixed",
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
                      if (activeItemRowId !== null) applyItemToRow(activeItemRowId, { name: it.name, sku: it.sku, rate: it.rate, imageUrl: it.imageUrl })
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {it.imageUrl ? (
                        <img src={it.imageUrl} alt="" className="w-8 h-8 object-cover rounded border" />
                      ) : (
                        <div className="w-8 h-8 border rounded flex items-center justify-center bg-muted/30 shrink-0">
                          <ImageIcon className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{it.name}</div>
                        <div className="text-muted-foreground flex gap-2 flex-wrap">
                          {it.sku && <span>SKU: {it.sku}</span>}
                          {it.upc && <span>UPC: {it.upc}</span>}
                          {it.ean && <span>EAN: {it.ean}</span>}
                          <span>${Number(it.rate).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>,
              document.body
            )}

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t bg-background shrink-0">
            <div className="flex items-center gap-2">
              <Button className="bg-primary hover:bg-primary/90 h-8 text-xs" disabled={saveLoading} onClick={() => handleSaveOrder({ customerName: formCustomerName, reference: formReference, date: formDate, expectedShipmentDate: formExpectedShipmentDate, status: formStatus })}>
                {saveLoading ? "Saving…" : "Save"}
              </Button>
              <div className="flex">
                <Button variant="outline" className="h-8 text-xs rounded-r-none bg-transparent" disabled={saveLoading} onClick={() => handleSaveOrder(
                  { customerName: formCustomerName, reference: formReference, date: formDate, expectedShipmentDate: formExpectedShipmentDate, status: formStatus },
                  async (order) => {
                    const to = (order.customerEmail || formCustomerEmail || "").trim()
                    if (!to) {
                      alert("No customer email. Add the customer's email above, then use Save and Send.")
                      return
                    }
                    try {
                      await sendOrderEmail(order, to, { attachPdf: true })
                      alert("Saved and email sent.")
                    } catch (e) {
                      alert(e instanceof Error ? e.message : "Failed to send email.")
                    }
                  }
                )}>Save and Send</Button>
                <Button variant="outline" className="h-8 px-1.5 rounded-l-none border-l-0 bg-transparent">
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </div>
              <Button variant="ghost" className="h-8 text-xs" onClick={() => { setShowNewForm(false); setSelectedOrder(null) }}>Cancel</Button>
            </div>
            <div className="text-right text-xs">
              <p className="font-medium">Total Amount: $ {computeLineTotals().total.toFixed(2)}</p>
              <p className="text-muted-foreground">Total Quantity: {itemRows.reduce((sum, r) => sum + (parseFloat(r.quantity) || 0), 0)}</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Detail View (when order is selected)
  if (selectedOrder) {
    return (
      <DashboardLayout activeItem="Sales" activeSubItem="Sales Orders">
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Order List */}
          <div className="w-[240px] border-r flex flex-col shrink-0 bg-background">
            <div className="flex items-center justify-between px-2 py-1.5 border-b">
              <div className="flex items-center gap-1">
                <h1 className="text-xs font-medium">All Sales Orders</h1>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" className="h-6 w-6 bg-primary hover:bg-primary/90" onClick={() => { setSelectedOrder(null); setShowNewForm(true) }}>
                  <Plus className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              {salesOrders.map((order) => (
                <div
                  key={order.id}
                  className={`px-2 py-1.5 border-b cursor-pointer hover:bg-muted/30 transition-colors ${selectedOrder.id === order.id ? "bg-muted/50" : ""}`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex items-start gap-1.5 min-w-0 flex-1">
                      <Checkbox className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{order.customerName}</p>
                        <p className="text-[10px] text-muted-foreground">{order.salesOrderNumber} • {formatDisplayDate(order.date)}</p>
                        {order.reference && <p className="text-[10px] text-muted-foreground truncate">• {order.reference}</p>}
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`text-[10px] font-medium ${getStatusColor(order.status)}`}>{order.status}</span>
                          {order.invoiced && <Mail className="w-3 h-3 text-muted-foreground" />}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs font-semibold shrink-0">${order.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Order Detail */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-medium">{selectedOrder.salesOrderNumber}</h1>
                {/* Invoicing Status Badge */}
                {(() => {
                  const invStatus = (selectedOrder as { invoicingStatus?: string }).invoicingStatus
                  if (invStatus === "completely_invoiced") {
                    return <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">Fully Invoiced</span>
                  } else if (invStatus === "partially_invoiced") {
                    return <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">Partially Invoiced</span>
                  }
                  return null
                })()}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Lock className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Monitor className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedOrder(null)}>
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Action Buttons: Next step (top, by workflow) | Edit | Send Email | PDF/Print | Convert to Invoice | More | Close (end) */}
            <div className="flex items-center gap-1 px-3 py-1.5 border-b">
              {/* Next step at top: Draft→Sent, Sent→Confirm, then Convert to Invoice when ready, then Close */}
              {selectedOrder && (() => {
                const nextStep = getNextStep()
                return (
                  <Button variant="default" size="sm" className="h-7 text-[11px] px-2 bg-teal-600 hover:bg-teal-700" onClick={nextStep.onClick}>
                    {nextStep.label === "Sent" && <Mail className="w-3 h-3 mr-1" />}
                    {nextStep.label === "Confirm" && <CheckCircle className="w-3 h-3 mr-1" />}
                    {nextStep.label === "Convert to Invoice" && <FileText className="w-3 h-3 mr-1" />}
                    {nextStep.label === "Close" && <X className="w-3 h-3 mr-1" />}
                    {nextStep.label}
                  </Button>
                )
              })()}
              <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2" onClick={() => setShowNewForm(true)}>
                <Pencil className="w-3 h-3 mr-1" /> Edit
              </Button>
              {/* Attachment Button */}
              <input
                type="file"
                ref={attachmentFileInputRef}
                className="hidden"
                multiple
                onChange={async (e) => {
                  const files = e.target.files
                  if (!files || files.length === 0 || !selectedOrder?.id) return
                  setAttachmentUploading(true)
                  try {
                    for (let i = 0; i < files.length; i++) {
                      const file = files[i]
                      if (file.size > 10 * 1024 * 1024) {
                        alert(`File "${file.name}" exceeds 10MB limit`)
                        continue
                      }
                      const formData = new FormData()
                      formData.append("file", file)
                      formData.append("title", file.name)
                      formData.append("document_type", "other")
                      const res = await fetch(`${API_BASE}/api/zoho/sales-orders/${selectedOrder.id}/attachments/`, {
                        method: "POST",
                        body: formData,
                        credentials: "include",
                      })
                      const data = await res.json()
                      if (data?.attachments) {
                        setOrderAttachments(data.attachments)
                      }
                    }
                  } catch (err) {
                    console.error("Upload error:", err)
                    alert("Failed to upload attachment")
                  } finally {
                    setAttachmentUploading(false)
                    if (attachmentFileInputRef.current) attachmentFileInputRef.current.value = ""
                  }
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] px-2"
                disabled={attachmentUploading}
                onClick={() => attachmentFileInputRef.current?.click()}
              >
                {attachmentUploading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Paperclip className="w-3 h-3 mr-1" />}
                Attach {orderAttachments.length > 0 && `(${orderAttachments.length})`}
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2" onClick={handleSendEmailClick} disabled={sendEmailLoading}>
                <Mail className="w-3 h-3 mr-1" /> {sendEmailLoading ? "Sending…" : "Send Email"}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2">
                    <FileText className="w-3 h-3 mr-1" /> PDF/Print <ChevronDown className="w-2.5 h-2.5 ml-0.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[120px]">
                  <DropdownMenuItem className="text-[11px] py-1.5 cursor-pointer" onClick={handleDownloadPDF}>
                    <FileText className="w-3 h-3 mr-2" /> PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-[11px] py-1.5 cursor-pointer" onClick={handlePrint}>
                    <Printer className="w-3 h-3 mr-2" /> Print
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {/* Show Convert to Invoice only after Sent/Confirm (not for Draft or Sent / Issued), and allow partial invoicing */}
              {selectedOrder.status !== "Draft" && selectedOrder.status !== "Sent / Issued" && (selectedOrder as { invoicingStatus?: string }).invoicingStatus !== "completely_invoiced" && (
                <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2" onClick={handleConvertToInvoice} disabled={convertRemainingLoading}>
                  <FileText className="w-3 h-3 mr-1" /> 
                  {convertRemainingLoading ? "Loading..." : (selectedOrder as { invoicingStatus?: string }).invoicingStatus === "partially_invoiced" ? "Invoice Remaining" : "Convert to Invoice"}
                </Button>
              )}
              <Button
                variant={showHistory ? "default" : "ghost"}
                size="sm"
                className={`h-7 text-[11px] px-2 ${showHistory ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                onClick={toggleHistory}
              >
                <History className="w-3 h-3 mr-1" /> History
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[180px]">
                  <DropdownMenuItem className="text-[11px] py-1.5 bg-teal-600 text-white focus:bg-teal-700 focus:text-white cursor-pointer">
                    <ShoppingCart className="w-3 h-3 mr-2" /> Convert to Purchase Order
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-[11px] py-1.5 cursor-pointer"><CheckCircle className="w-3 h-3 mr-2" /> Mark shipment as fulfilled</DropdownMenuItem>
                  <DropdownMenuItem className="text-[11px] py-1.5 cursor-pointer"><Ban className="w-3 h-3 mr-2" /> Cancel Items</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-[11px] py-1.5 cursor-pointer">Void</DropdownMenuItem>
                  <DropdownMenuItem className="text-[11px] py-1.5 cursor-pointer" onClick={handleClone}><Copy className="w-3 h-3 mr-2" /> Clone</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-[11px] py-1.5 cursor-pointer" onClick={handleConvertToInvoice}><FileText className="w-3 h-3 mr-2" /> Convert to Invoice</DropdownMenuItem>
                  <DropdownMenuItem className="text-[11px] py-1.5 cursor-pointer"><Lock className="w-3 h-3 mr-2" /> Lock sales order</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex-1 min-w-2" />
              <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-3">
              {/* History Panel */}
              {showHistory && (
                <div className="mb-4 border rounded-lg bg-purple-50 overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-purple-600 text-white">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4" />
                      <span className="text-xs font-medium">Order History</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-white hover:bg-purple-700"
                      onClick={() => setShowHistory(false)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="p-3 max-h-64 overflow-y-auto">
                    {historyLoading ? (
                      <div className="text-xs text-center py-4 text-muted-foreground">Loading history...</div>
                    ) : orderHistory.length === 0 ? (
                      <div className="text-xs text-center py-4 text-muted-foreground">No history yet</div>
                    ) : (
                      <div className="space-y-2">
                        {orderHistory.map((entry, idx) => (
                          <div key={entry.id} className={`border rounded p-2 bg-white ${idx === 0 ? "border-purple-300" : ""}`}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                    entry.action === "created" ? "bg-green-100 text-green-700" :
                                    entry.action === "status_changed" ? "bg-blue-100 text-blue-700" :
                                    entry.action === "items_edited" ? "bg-amber-100 text-amber-700" :
                                    entry.action === "reverted" ? "bg-purple-100 text-purple-700" :
                                    "bg-gray-100 text-gray-700"
                                  }`}>
                                    {entry.action === "created" ? "Created" :
                                     entry.action === "status_changed" ? "Status Changed" :
                                     entry.action === "items_edited" ? "Items Edited" :
                                     entry.action === "reverted" ? "Reverted" :
                                     "Updated"}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {new Date(entry.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                <div className="mt-1 text-xs">
                                  <span className="text-muted-foreground">Status: </span>
                                  <span className="font-medium">{entry.status}</span>
                                  <span className="text-muted-foreground ml-2">Items: </span>
                                  <span className="font-medium">{entry.lineItems?.length || 0}</span>
                                  <span className="text-muted-foreground ml-2">Total: </span>
                                  <span className="font-medium">${entry.amount?.toFixed(2) || "0.00"}</span>
                                </div>
                                {entry.notes && (
                                  <div className="mt-1 text-[10px] text-muted-foreground italic">{entry.notes}</div>
                                )}
                              </div>
                              {idx > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 text-[10px] px-2 shrink-0"
                                  onClick={() => handleRevert(entry.id)}
                                  disabled={revertLoading === entry.id}
                                >
                                  <Undo2 className="w-3 h-3 mr-1" />
                                  {revertLoading === entry.id ? "..." : "Revert"}
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Attachments Section */}
              {orderAttachments.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-1.5 py-0.5 mb-2">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Attachments ({orderAttachments.length})</span>
                  </div>
                  <div className="border rounded overflow-hidden">
                    <div className="divide-y">
                      {orderAttachments.map((att) => (
                        <div key={att.id} className="flex items-center justify-between px-3 py-2 hover:bg-muted/30">
                          <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex-1 truncate">
                            {att.title || att.filename}
                          </a>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 shrink-0"
                            onClick={async () => {
                              if (!confirm(`Delete attachment "${att.title}"?`)) return
                              try {
                                await fetch(`${API_BASE}/api/zoho/sales-orders/${selectedOrder.id}/attachments/${att.id}/`, {
                                  method: "DELETE",
                                  credentials: "include",
                                })
                                setOrderAttachments((prev) => prev.filter((a) => a.id !== att.id))
                              } catch (err) {
                                console.error(err)
                                alert("Failed to delete attachment")
                              }
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Invoices Section - Show if order has linked invoices */}
              {(linkedInvoices.length > 0 || linkedInvoicesLoading) && (
                <div className="mb-4">
                  <div
                    className="flex items-center gap-1.5 cursor-pointer py-0.5"
                    onClick={() => setInvoicesExpanded(!invoicesExpanded)}
                  >
                    {invoicesExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    <span className="text-xs font-medium">Invoices</span>
                    <span className="text-xs text-primary">{linkedInvoices.length}</span>
                    <ChevronRight className="w-3 h-3 ml-auto text-muted-foreground" />
                  </div>

                  {invoicesExpanded && (
                    <div className="mt-2 border rounded overflow-hidden">
                      {linkedInvoicesLoading ? (
                        <div className="p-4 text-center text-xs text-muted-foreground">Loading invoices...</div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/30">
                              <TableHead className="text-[10px] font-medium py-1.5 px-2">DATE</TableHead>
                              <TableHead className="text-[10px] font-medium py-1.5 px-2">INVOICE#</TableHead>
                              <TableHead className="text-[10px] font-medium py-1.5 px-2">STATUS</TableHead>
                              <TableHead className="text-[10px] font-medium py-1.5 px-2">DUE DATE</TableHead>
                              <TableHead className="text-[10px] font-medium py-1.5 px-2 text-right">AMOUNT</TableHead>
                              <TableHead className="text-[10px] font-medium py-1.5 px-2 text-right">BALANCE DUE</TableHead>
                              <TableHead className="w-8 py-1.5 px-2"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {linkedInvoices.map((inv) => (
                              <TableRow key={inv.id} className="hover:bg-muted/20">
                                <TableCell className="py-1.5 px-2 text-xs">{formatDisplayDate(inv.date)}</TableCell>
                                <TableCell className="py-1.5 px-2">
                                  <Link href={`/sales/invoices?invoice=${inv.invoiceNumber}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                                    <FileText className="w-3 h-3" /> {inv.invoiceNumber}
                                  </Link>
                                </TableCell>
                                <TableCell className="py-1.5 px-2 text-xs text-teal-600 font-medium">{inv.status || "—"}</TableCell>
                                <TableCell className="py-1.5 px-2 text-xs">{formatDisplayDate(inv.dueDate)}</TableCell>
                                <TableCell className="py-1.5 px-2 text-xs text-right">${inv.total.toFixed(2)}</TableCell>
                                <TableCell className="py-1.5 px-2 text-xs text-right">${inv.balanceDue.toFixed(2)}</TableCell>
                                <TableCell className="py-1.5 px-2">
                                  <Button variant="ghost" size="icon" className="h-5 w-5">
                                    <MoreHorizontal className="w-3 h-3" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Status */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4">
                <p className="text-xs">Invoice Status : <span className="text-primary font-medium">{selectedOrder.invoiceStatus || "INVOICED"}</span></p>
                <p className="text-xs">Shipment : <span className="text-orange-500 font-medium">{selectedOrder.shipmentStatus || "PENDING"}</span></p>
                <div className="flex-1" />
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">Show PDF View</span>
                  <Switch checked={showPdfView} onCheckedChange={setShowPdfView} className="scale-90" />
                </div>
              </div>

              {/* PDF Preview */}
              {showPdfView && (
                <div className="w-full">
                  {/* Customize Button - outside the PDF document */}
                  <div className="flex justify-start mb-3">
                    <Button variant="outline" size="sm" className="h-8 text-xs bg-transparent">
                      <Settings className="w-3.5 h-3.5 mr-1.5" /> Customize
                      <ChevronDown className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>

                  {/* PDF Document */}
                  <div ref={pdfPreviewRef} className="border rounded-lg bg-white relative overflow-hidden shadow-sm" style={{ isolation: 'isolate' }}>
                    {/* Status Ribbon - always show current sales order status */}
                    {selectedOrder.status && (
                      <div className="absolute left-0 top-0 w-32 h-32 overflow-hidden">
                        <div className="absolute top-6 -left-8 w-40 bg-emerald-600 text-white text-xs py-1.5 text-center font-medium -rotate-45 shadow-md">
                          {selectedOrder.status}
                        </div>
                      </div>
                    )}

                    <div className="p-6 md:p-8 lg:p-10">
                      {/* Header with Logo and Quote Title */}
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-10">
                        {/* Company Logo & Info */}
                        <div>
                          <div className="w-28 h-16 rounded flex items-center justify-center overflow-hidden bg-white shrink-0 mb-3">
                            <img alt="Mekco Supply Inc." width={112} height={64} className="object-contain w-full h-full p-1" src="/zoho/Mekco-Supply-logo-300px.png" />
                          </div>
                          <p className="text-sm font-semibold text-foreground">Mekco Supply Inc.</p>
                          <p className="text-xs text-muted-foreground">16-110 West Beaver Creek Rd.</p>
                          <p className="text-xs text-muted-foreground">Richmond Hill, Ontario L4B 1J9</p>
                        </div>

                        {/* Quote Title */}
                        <div className="text-left sm:text-right">
                          <h2 className="text-3xl md:text-4xl font-light text-foreground mb-2">Quote</h2>
                          <p className="text-sm text-muted-foreground">Quote# {selectedOrder.salesOrderNumber}</p>
                        </div>
                      </div>

                      {/* Order Info Grid */}
                      <div className="flex flex-col sm:flex-row justify-between gap-6 mb-8">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Bill To</p>
                          <Link href={selectedOrder.customerId ? `/sales/customers?id=${selectedOrder.customerId}` : "#"} className="text-sm text-primary font-medium hover:underline">{selectedOrder.customerName}</Link>
                        </div>
                        <div className="space-y-1.5 sm:text-right">
                          <div className="flex sm:justify-end gap-4">
                            <span className="text-xs text-muted-foreground">Order Date :</span>
                            <span className="text-xs">{formatDisplayDate(selectedOrder.date)}</span>
                          </div>
                          <div className="flex sm:justify-end gap-4">
                            <span className="text-xs text-muted-foreground">Expected Shipment Date :</span>
                            <span className="text-xs">{formatDisplayDate(selectedOrder.expectedShipmentDate) || formatDisplayDate(selectedOrder.date)}</span>
                          </div>
                          <div className="flex sm:justify-end gap-4">
                            <span className="text-xs text-muted-foreground">Ref# :</span>
                            <span className="text-xs">{selectedOrder.reference || "—"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Items Table - with inline editing */}
                      <div className="border rounded overflow-hidden mb-6">
                        {/* Edit Items Header */}
                        <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b">
                          <span className="text-xs font-medium">Line Items</span>
                          {!editingLineItems ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 text-[10px] px-2"
                              onClick={startEditingLineItems}
                            >
                              <Pencil className="w-3 h-3 mr-1" /> Edit Items
                            </Button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 text-[10px] px-2"
                                onClick={addEditLineItem}
                              >
                                <Plus className="w-3 h-3 mr-1" /> Add Item
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-[10px] px-2"
                                onClick={cancelEditingLineItems}
                                disabled={editItemsSaving}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                className="h-6 text-[10px] px-2 bg-teal-600 hover:bg-teal-700"
                                onClick={saveEditedLineItems}
                                disabled={editItemsSaving}
                              >
                                {editItemsSaving ? "Saving..." : "Save Changes"}
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-teal-600">
                                <TableHead className="text-xs text-white py-2.5 px-3 w-12 font-medium">#</TableHead>
                                <TableHead className="text-xs text-white py-2.5 px-3 font-medium min-w-[200px]">Item & Description</TableHead>
                                <TableHead className="text-xs text-white py-2.5 px-3 text-center w-20 font-medium">Qty</TableHead>
                                <TableHead className="text-xs text-white py-2.5 px-3 text-right w-24 font-medium">Rate</TableHead>
                                <TableHead className="text-xs text-white py-2.5 px-3 text-right w-24 font-medium">Amount</TableHead>
                                {editingLineItems && (
                                  <TableHead className="text-xs text-white py-2.5 px-3 w-12 font-medium"></TableHead>
                                )}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {editingLineItems ? (
                                // Editing mode - show editable inputs
                                editLineItems.map((item, i) => (
                                  <TableRow key={item.id} className="border-b">
                                    <TableCell className="py-2 px-3 text-xs align-middle">{i + 1}</TableCell>
                                    <TableCell className="py-2 px-3">
                                      <Input
                                        className="h-7 text-xs"
                                        value={item.itemDetails}
                                        onChange={(e) => updateEditLineItem(item.id, "itemDetails", e.target.value)}
                                        placeholder="Item description..."
                                      />
                                    </TableCell>
                                    <TableCell className="py-2 px-3">
                                      <Input
                                        className="h-7 text-xs text-center w-16"
                                        type="number"
                                        min="0"
                                        value={item.quantity}
                                        onChange={(e) => updateEditLineItem(item.id, "quantity", e.target.value)}
                                      />
                                    </TableCell>
                                    <TableCell className="py-2 px-3">
                                      <Input
                                        className="h-7 text-xs text-right w-20"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.rate}
                                        onChange={(e) => updateEditLineItem(item.id, "rate", e.target.value)}
                                      />
                                    </TableCell>
                                    <TableCell className="py-2 px-3 text-xs text-right font-medium">
                                      ${parseFloat(item.amount || "0").toFixed(2)}
                                    </TableCell>
                                    <TableCell className="py-2 px-3">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => removeEditLineItem(item.id)}
                                        disabled={editLineItems.length <= 1}
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                // View mode - show static content
                                (selectedOrder.lineItems?.length ? selectedOrder.lineItems : [{ itemDetails: "—", quantity: "—", rate: "—", amount: "—" }]).map((li, i) => (
                                  <TableRow key={i} className="border-b">
                                    <TableCell className="py-2.5 px-3 text-xs align-top">{i + 1}</TableCell>
                                    <TableCell className="py-2.5 px-3 text-xs">{li.itemDetails || "—"}</TableCell>
                                    <TableCell className="py-2.5 px-3 text-xs text-center">{li.quantity}</TableCell>
                                    <TableCell className="py-2.5 px-3 text-xs text-right">{li.rate}</TableCell>
                                    <TableCell className="py-2.5 px-3 text-xs text-right">{li.amount}</TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </div>
                        {/* Editing mode totals preview */}
                        {editingLineItems && (
                          <div className="px-3 py-2 bg-muted/20 border-t text-xs text-right">
                            <span className="text-muted-foreground">New Total: </span>
                            <span className="font-medium">
                              ${(editLineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) * 1.13).toFixed(2)}
                            </span>
                            <span className="text-muted-foreground ml-1">(incl. 13% HST)</span>
                          </div>
                        )}
                      </div>

                      {/* Totals */}
                      <div className="flex justify-end">
                        <div className="w-full sm:w-52 space-y-1.5">
                          <div className="flex justify-between text-xs py-1">
                            <span className="text-muted-foreground">Sub Total</span>
                            <span>{(selectedOrder.subTotal ?? selectedOrder.amount).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xs py-1">
                            <span className="text-muted-foreground">GST/HST (13%)</span>
                            <span>{((selectedOrder.taxAmount ?? 0) || (selectedOrder.amount * 0.13)).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm font-semibold py-2 border-t bg-muted/30 px-3 -mx-3 mt-2">
                            <span>Total</span>
                            <span>${selectedOrder.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </DashboardLayout>
    )
  }

  // Default List View
  return (
    <DashboardLayout activeItem="Sales" activeSubItem="Sales Orders">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b">
          <div className="flex items-center gap-1.5">
            <h1 className="text-xs font-medium">All Sales Orders</h1>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-1.5">
            <Button className="bg-primary hover:bg-primary/90 h-7 text-xs" onClick={() => setShowNewForm(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              New
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
                <DropdownMenuItem className="flex items-center gap-2 text-xs" onClick={() => fetchOrders()}>Refresh List</DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 text-xs"><Columns className="w-3.5 h-3.5" />Reset Column Width</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table - responsive horizontal scroll */}
        <div className="flex-1 overflow-auto min-h-0">
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading sales orders…</div>
          ) : listError ? (
            <div className="p-8 text-center">
              <p className="text-sm text-destructive mb-2">{listError}</p>
              <Button variant="outline" size="sm" onClick={() => fetchOrders()}>Retry</Button>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-8 py-1.5 px-2"><Checkbox className="h-3 w-3" /></TableHead>
                    <TableHead className="text-[10px] font-medium py-1.5 px-2">DATE</TableHead>
                    <TableHead className="text-[10px] font-medium py-1.5 px-2">SALES ORDER#</TableHead>
                    <TableHead className="text-[10px] font-medium py-1.5 px-2">REFERENCE#</TableHead>
                    <TableHead className="text-[10px] font-medium py-1.5 px-2">CUSTOMER NAME</TableHead>
                    <TableHead className="text-[10px] font-medium py-1.5 px-2">STATUS</TableHead>
                    <TableHead className="text-[10px] font-medium py-1.5 px-2 text-center">INVOICED</TableHead>
                    <TableHead className="text-[10px] font-medium py-1.5 px-2 text-center">PAYMENT</TableHead>
                    <TableHead className="text-[10px] font-medium py-1.5 px-2 text-right">AMOUNT</TableHead>
                    <TableHead className="text-[10px] font-medium py-1.5 px-2">EXPECTED SHIPMENT DATE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="py-8 text-center text-sm text-muted-foreground">No sales orders yet. Click New to create one.</TableCell>
                    </TableRow>
                  ) : (
                    salesOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                        <TableCell className="py-1.5 px-2" onClick={(e) => e.stopPropagation()}><Checkbox className="h-3 w-3" /></TableCell>
                        <TableCell className="py-1.5 px-2 text-xs">{formatDisplayDate(order.date)}</TableCell>
                        <TableCell className="py-1.5 px-2">
                          <span className="text-xs text-primary hover:underline">{order.salesOrderNumber}</span>
                        </TableCell>
                        <TableCell className="py-1.5 px-2 text-xs text-muted-foreground">{order.reference || "—"}</TableCell>
                        <TableCell className="py-1.5 px-2 text-xs">{order.customerName}</TableCell>
                        <TableCell className="py-1.5 px-2">
                          <span className={`text-xs ${getStatusColor(order.status)}`}>{order.status}</span>
                        </TableCell>
                        <TableCell className="py-1.5 px-2 text-center">
                          <Mail className={`w-3.5 h-3.5 mx-auto ${order.invoiced ? "text-muted-foreground" : "text-muted-foreground/30"}`} />
                        </TableCell>
                        <TableCell className="py-1.5 px-2 text-center">
                          <Circle className={`w-2.5 h-2.5 mx-auto ${order.payment === "none" ? "text-muted-foreground/30" : "text-teal-600"}`} fill="currentColor" />
                        </TableCell>
                        <TableCell className="py-1.5 px-2 text-xs text-right">${order.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="py-1.5 px-2 text-xs">{formatDisplayDate(order.expectedShipmentDate)}</TableCell>
                      </TableRow>
                    )))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
