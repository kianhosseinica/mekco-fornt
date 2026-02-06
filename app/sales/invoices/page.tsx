"use client"
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
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
import Link from "next/link"
import { Switch } from "@/components/ui/switch"
import { FileWarning, Sparkles, ChevronDown, ChevronRight, X, Settings, Plus, MoreHorizontal, Upload, HelpCircle, ImageIcon, MoreVertical, Scan, ArrowLeft, Pencil, Mail, Share2, Bell, FileText, Printer, CreditCard, Copy, Ban, Eye, Lock, Trash2, ClipboardList, ChevronLeft, Bold, Italic, Underline, Strikethrough, List, AlignLeft, Link2, ImagePlusIcon as ImageLucide, Monitor, Search, Loader2, Paperclip } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import type { Invoice, InvoiceLineItem, RemainingLineItem, INVOICE_STATUSES } from "@/lib/invoices-types"

const API_BASE = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_API_ORIGIN || ""

// Format date for display
function formatDisplayDate(isoOrDisplay: string) {
  if (!isoOrDisplay) return ""
  try {
    const d = new Date(isoOrDisplay)
    if (!isNaN(d.getTime())) return format(d, "MMM d, yyyy")
  } catch { }
  return isoOrDisplay
}

// Get status display text and style
const getStatusStyle = (status: string) => {
  if (status === "Paid") return "text-teal-600"
  if (status === "Partially Paid") return "text-blue-600"
  if (status === "Overdue" || status.includes("OVERDUE")) return "text-orange-500"
  if (status === "Void") return "text-gray-400"
  if (status === "Draft") return "text-gray-500"
  if (status === "Sent") return "text-purple-600"
  return "text-muted-foreground"
}

const getStatusDisplayText = (invoice: Invoice) => {
  if (invoice.status === "Overdue" || (invoice.balanceDue > 0 && invoice.dueDate)) {
    const dueDate = new Date(invoice.dueDate)
    const today = new Date()
    const diffDays = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays > 0) {
      return `OVERDUE BY ${diffDays} DAYS`
    }
  }
  return invoice.status.toUpperCase()
}

export default function InvoicesPage() {
  const searchParams = useSearchParams()
  
  // API data state
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [nextNumber, setNextNumber] = useState<string>("")
  
  // UI state
  const [showNewForm, setShowNewForm] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [salesOrdersExpanded, setSalesOrdersExpanded] = useState(true)
  const [saveLoading, setSaveLoading] = useState(false)
  const [sendEmailLoading, setSendEmailLoading] = useState(false)
  
  // Form state (new / edit invoice)
  const [formCustomerName, setFormCustomerName] = useState("")
  const [formCustomerId, setFormCustomerId] = useState<number | undefined>(undefined)
  const [formCustomerEmail, setFormCustomerEmail] = useState("")
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10))
  const [formDueDate, setFormDueDate] = useState("")
  const [formPaymentTerms, setFormPaymentTerms] = useState("Due on Receipt")
  const [formCustomerNotes, setFormCustomerNotes] = useState("")
  const [formSalesOrderId, setFormSalesOrderId] = useState<string | null>(null)

  // Email form state
  const [emailTo, setEmailTo] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailAttachStatement, setEmailAttachStatement] = useState(false)
  const [emailAttachPdf, setEmailAttachPdf] = useState(true)
  
  // Item rows for the form
  const [itemRows, setItemRows] = useState<{ id: number; itemDetails: string; quantity: string; rate: string; amount: string; imageUrl?: string; salesOrderLineItemId?: string }[]>([
    { id: 1, itemDetails: "", quantity: "1", rate: "0", amount: "0" }
  ])
  
  // Customer search
  const [customerSearchQuery, setCustomerSearchQuery] = useState("")
  const [customerResults, setCustomerResults] = useState<{ id: number; name: string; companyName: string; email: string }[]>([])
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false)
  const customerDropdownRef = useRef<HTMLDivElement>(null)
  
  // Attachment state
  const attachmentFileInputRef = useRef<HTMLInputElement>(null)
  const [attachmentUploading, setAttachmentUploading] = useState(false)
  const [invoiceAttachments, setInvoiceAttachments] = useState<{ id: number; title: string; documentType: string; filename: string; url: string; uploadedAt: string }[]>([])

  // Fetch invoices
  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/api/zoho/invoices/`)
      if (!res.ok) throw new Error("Failed to fetch invoices")
      const data = await res.json()
      setInvoices(data.invoices || [])
      setListError(null)
    } catch (e) {
      setListError(e instanceof Error ? e.message : "Failed to load invoices")
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch next invoice number
  const fetchNextNumber = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/zoho/invoices/next-number/`)
      if (res.ok) {
        const data = await res.json()
        setNextNumber(data.nextNumber || "")
      }
    } catch { }
  }, [])

  // Initial load
  useEffect(() => {
    fetchInvoices()
    fetchNextNumber()
  }, [fetchInvoices, fetchNextNumber])

  // Fetch attachments when invoice is selected
  useEffect(() => {
    if (!selectedInvoice?.id) {
      setInvoiceAttachments([])
      return
    }
    let cancelled = false
    fetch(`${API_BASE}/api/zoho/invoices/${selectedInvoice.id}/attachments/`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.attachments) {
          setInvoiceAttachments(data.attachments)
        }
      })
      .catch(() => {
        if (!cancelled) setInvoiceAttachments([])
      })
    return () => { cancelled = true }
  }, [selectedInvoice?.id])

  // Auto-select invoice from URL parameter
  useEffect(() => {
    const invoiceParam = searchParams.get('invoice')
    const invoiceId = searchParams.get('id')
    if (invoiceParam && invoices.length > 0) {
      const foundInvoice = invoices.find(inv => inv.invoiceNumber === invoiceParam)
      if (foundInvoice) {
        setSelectedInvoice(foundInvoice)
      }
    } else if (invoiceId && invoices.length > 0) {
      const foundInvoice = invoices.find(inv => inv.id === invoiceId)
      if (foundInvoice) {
        setSelectedInvoice(foundInvoice)
      }
    }
  }, [searchParams, invoices])

  // Open new form with customer pre-selected when ?customerId=X&new=1
  useEffect(() => {
    const customerIdParam = searchParams.get('customerId')
    const newParam = searchParams.get('new')
    if (customerIdParam && newParam === '1') {
      setShowNewForm(true)
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

  // Customer search effect
  useEffect(() => {
    if (!customerSearchQuery.trim()) {
      setCustomerResults([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/zoho/customers/?search=${encodeURIComponent(customerSearchQuery)}&limit=20`)
        if (res.ok) {
          const data = await res.json()
          setCustomerResults(data.customers || [])
        }
      } catch { }
    }, 300)
    return () => clearTimeout(timer)
  }, [customerSearchQuery])

  // Close customer dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setCustomerDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const addNewRow = () => {
    const newId = itemRows.length > 0 ? Math.max(...itemRows.map(r => r.id)) + 1 : 1
    setItemRows([...itemRows, { id: newId, itemDetails: "", quantity: "1", rate: "0", amount: "0" }])
  }

  const removeRow = (id: number) => {
    if (itemRows.length > 1) {
      setItemRows(itemRows.filter(row => row.id !== id))
    }
  }

  const updateLineItem = (id: number, field: string, value: string) => {
    setItemRows(itemRows.map(row => {
      if (row.id !== id) return row
      const updated = { ...row, [field]: value }
      if (field === "quantity" || field === "rate") {
        const qty = parseFloat(updated.quantity) || 0
        const rate = parseFloat(updated.rate) || 0
        updated.amount = (qty * rate).toFixed(2)
      }
      return updated
    }))
  }

  const computeLineTotals = () => {
    let sub = 0
    itemRows.forEach(row => {
      const qty = parseFloat(row.quantity) || 0
      const rate = parseFloat(row.rate) || 0
      sub += qty * rate
    })
    const tax = sub * 0.13
    return { subTotal: sub, taxAmount: tax, total: sub + tax }
  }

  // Build printable HTML for an invoice (used for PDF/Print)
  const getInvoicePrintDocument = (invoice: Invoice) => {
    const logoUrl =
      typeof window !== "undefined" ? `${window.location.origin}/Mekco-Supply-logo-300px.png` : "/Mekco-Supply-logo-300px.png"
    const items = invoice.lineItems && invoice.lineItems.length > 0 ? invoice.lineItems : []
    const rowsHtml =
      items.length > 0
        ? items
            .map(
              (li, i) => `
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:8px 10px;font-size:12px;">${i + 1}</td>
          <td style="padding:8px 10px;font-size:12px;">${String(li.itemDetails || "")}</td>
          <td style="padding:8px 10px;font-size:12px;text-align:center;">${String(li.quantity || "")}</td>
          <td style="padding:8px 10px;font-size:12px;text-align:right;">${String(li.rate || "")}</td>
          <td style="padding:8px 10px;font-size:12px;text-align:right;">${String(li.amount || "")}</td>
        </tr>`,
            )
            .join("")
        : `
        <tr>
          <td colspan="5" style="padding:12px 10px;font-size:12px;text-align:center;color:#6b7280;">No line items</td>
        </tr>`

    const bodyHtml = `
  <div style="max-width:800px;margin:0 auto;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;">
      <div>
        <div style="width:112px;height:64px;border-radius:8px;overflow:hidden;background:#ffffff;border:1px solid #e5e7eb;margin-bottom:12px;display:flex;align-items:center;justify-content:center;">
          <img src="${logoUrl}" alt="Mekco Supply Inc." style="max-width:100%;max-height:100%;padding:4px;object-fit:contain;" />
        </div>
        <p style="font-size:14px;font-weight:600;margin:0;">Mekco Supply Inc.</p>
        <p style="font-size:12px;color:#6b7280;margin:2px 0;">16-110 West Beaver Creek Rd.</p>
        <p style="font-size:12px;color:#6b7280;margin:2px 0;">Richmond Hill, Ontario L4B 1J9</p>
      </div>
      <div style="text-align:right;">
        <h1 style="font-size:28px;font-weight:300;margin:0 0 4px;">Invoice</h1>
        <p style="font-size:13px;color:#6b7280;margin:0 0 16px;"># ${invoice.invoiceNumber}</p>
        <div>
          <p style="font-size:11px;color:#6b7280;margin:0;">Balance Due</p>
          <p style="font-size:18px;font-weight:600;margin:2px 0 0;">$${(invoice.balanceDue || invoice.total || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}</p>
        </div>
      </div>
    </div>

    <div style="display:flex;justify-content:space-between;margin-bottom:24px;">
      <div>
        <p style="font-size:11px;color:#6b7280;margin:0 0 4px;">Bill To</p>
        <p style="font-size:13px;color:#0f766e;font-weight:500;margin:0;">${invoice.customerName}</p>
      </div>
      <div style="text-align:right;font-size:12px;">
        <div style="margin-bottom:2px;">
          <span style="color:#6b7280;">Invoice Date :</span>
          <span style="margin-left:8px;">${invoice.date}</span>
        </div>
        <div style="margin-bottom:2px;">
          <span style="color:#6b7280;">Due Date :</span>
          <span style="margin-left:8px;">${invoice.dueDate}</span>
        </div>
        ${
          invoice.salesOrderNumber
            ? `<div><span style="color:#6b7280;">Sales Order# :</span><span style="margin-left:8px;">${invoice.salesOrderNumber}</span></div>`
            : ""
        }
      </div>
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      <thead>
        <tr style="background:#0f766e;color:#ffffff;">
          <th style="padding:8px 10px;font-size:11px;text-align:left;width:32px;">#</th>
          <th style="padding:8px 10px;font-size:11px;text-align:left;">Item & Description</th>
          <th style="padding:8px 10px;font-size:11px;text-align:center;width:64px;">Qty</th>
          <th style="padding:8px 10px;font-size:11px;text-align:right;width:80px;">Rate</th>
          <th style="padding:8px 10px;font-size:11px;text-align:right;width:96px;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div style="display:flex;justify-content:flex-end;margin-top:8px;">
      <div style="width:260px;font-size:12px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
          <span>Sub Total</span>
          <span>$${(invoice.subTotal ?? invoice.total ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
        </div>
        <div style="border-top:1px solid #e5e7eb;padding-top:6px;margin-top:6px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
            <span>GST/HST (13%)</span>
            <span>$${(invoice.taxAmount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
        <div style="border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px;font-weight:600;">
          <div style="display:flex;justify-content:space-between;">
            <span>Total</span>
            <span>$${(invoice.total || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>
  </div>`

    const title = `Invoice - ${invoice.invoiceNumber}`
    const fullPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 24px; background: #ffffff; color: #09090b; font-size: 14px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>${bodyHtml}</body>
</html>`
    return { title, fullPage }
  }

  // Open email form with sensible defaults
  const handleOpenEmailForm = () => {
    if (!selectedInvoice) return
    setEmailTo(selectedInvoice.customerEmail || "")
    setEmailSubject(`Invoice - ${selectedInvoice.invoiceNumber} from Mekco Supply Inc.`)
    setShowEmailForm(true)
  }

  // Open edit form for the selected invoice, ensuring we have latest details
  const handleEditInvoice = async () => {
    if (!selectedInvoice) return
    try {
      const res = await fetch(`${API_BASE}/api/zoho/invoices/${selectedInvoice.id}/`)
      if (res.ok) {
        const full = (await res.json()) as Invoice
        setEditingInvoice(full)
      } else {
        setEditingInvoice(selectedInvoice)
      }
    } catch {
      setEditingInvoice(selectedInvoice)
    }
  }

  // Send invoice email via API
  const handleSendEmail = async () => {
    if (!selectedInvoice) return
    const to = (emailTo || selectedInvoice.customerEmail || "").trim()
    if (!to) {
      alert("Please enter a recipient email.")
      return
    }
    const subject = emailSubject || `Invoice - ${selectedInvoice.invoiceNumber} from Mekco Supply Inc.`
    const amount = selectedInvoice.total || selectedInvoice.balanceDue || 0
    const bodyLines = [
      `Invoice ${selectedInvoice.invoiceNumber}`,
      "",
      `Customer: ${selectedInvoice.customerName}`,
      `Invoice Amount: $${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      `Balance Due: $${(selectedInvoice.balanceDue || amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
    ]
    const message = bodyLines.join("\n")

    setSendEmailLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/zoho/invoices/${selectedInvoice.id}/send-email/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          subject,
          message,
          attachPdf: emailAttachPdf,
          attachStatement: emailAttachStatement,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || "Failed to send email")
      }
      alert("Invoice email sent.")
      setShowEmailForm(false)
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to send invoice email.")
    } finally {
      setSendEmailLoading(false)
    }
  }

  // Save invoice - optionally open email form after save
  const handleSaveInvoice = async (openEmailAfter = false) => {
    const { subTotal, taxAmount, total } = computeLineTotals()
    const lineItems: InvoiceLineItem[] = itemRows.map(row => ({
      id: `li_${row.id}`,
      itemDetails: row.itemDetails,
      quantity: row.quantity,
      rate: row.rate,
      amount: row.amount,
      imageUrl: row.imageUrl || "",
      salesOrderLineItemId: row.salesOrderLineItemId,
    }))

    setSaveLoading(true)
    try {
      const payload = {
        customerName: formCustomerName,
        customerId: formCustomerId,
        customerEmail: formCustomerEmail,
        date: formDate,
        dueDate: formDueDate || formDate,
        paymentTerms: formPaymentTerms,
        customerNotes: formCustomerNotes,
        salesOrderId: formSalesOrderId,
        lineItems,
        subTotal,
        taxAmount,
        total,
        status: openEmailAfter ? "Sent" : "Draft",
      }

      let res: Response
      if (editingInvoice) {
        res = await fetch(`${API_BASE}/api/zoho/invoices/${editingInvoice.id}/`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch(`${API_BASE}/api/zoho/invoices/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || "Save failed")
      }

      const saved = await res.json() as Invoice
      await fetchInvoices()
      await fetchNextNumber()
      setSelectedInvoice(saved)
      setShowNewForm(false)
      setEditingInvoice(null)
      resetForm()

      // If openEmailAfter, open the email form with the saved invoice
      if (openEmailAfter && saved) {
        setEmailTo(saved.customerEmail || "")
        setEmailSubject(`Invoice - ${saved.invoiceNumber} from Mekco Supply Inc.`)
        setShowEmailForm(true)
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to save invoice")
    } finally {
      setSaveLoading(false)
    }
  }

  const resetForm = () => {
    setFormCustomerName("")
    setFormCustomerId(undefined)
    setFormCustomerEmail("")
    setFormDate(new Date().toISOString().slice(0, 10))
    setFormDueDate("")
    setFormPaymentTerms("Due on Receipt")
    setFormCustomerNotes("")
    setFormSalesOrderId(null)
    setItemRows([{ id: 1, itemDetails: "", quantity: "1", rate: "0", amount: "0" }])
  }

  // Initialize form when editing
  useEffect(() => {
    if (editingInvoice) {
      setFormCustomerName(editingInvoice.customerName || "")
      setFormCustomerId(editingInvoice.customerId || undefined)
      setFormCustomerEmail(editingInvoice.customerEmail || "")
      setFormDate(editingInvoice.date?.slice(0, 10) || new Date().toISOString().slice(0, 10))
      setFormDueDate(editingInvoice.dueDate?.slice(0, 10) || "")
      setFormPaymentTerms(editingInvoice.paymentTerms || "Due on Receipt")
      setFormCustomerNotes(editingInvoice.customerNotes || "")
      setFormSalesOrderId(editingInvoice.salesOrderId || null)
      const lines = editingInvoice.lineItems?.length
        ? editingInvoice.lineItems.map((li, i) => ({
            id: i + 1,
            itemDetails: li.itemDetails || "",
            quantity: li.quantity || "1",
            rate: li.rate || "0",
            amount: li.amount || "0",
            imageUrl: li.imageUrl,
            salesOrderLineItemId: li.salesOrderLineItemId,
          }))
        : [{ id: 1, itemDetails: "", quantity: "1", rate: "0", amount: "0" }]
      setItemRows(lines)
    } else if (showNewForm && !editingInvoice) {
      resetForm()
    }
  }, [editingInvoice, showNewForm])

  if (showNewForm || editingInvoice) {
    const isEditing = !!editingInvoice
    const currentInvoice = editingInvoice
    return (
      <DashboardLayout activeItem="Sales" activeSubItem="Invoices">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b bg-background sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">&#128196;</span>
              <h1 className="text-sm font-medium">{isEditing ? "Edit Invoice" : "New Invoice"}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs bg-transparent">
                <Sparkles className="w-3 h-3 mr-1.5" />
                CoCreate Agent
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Settings className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setShowNewForm(false); setEditingInvoice(null) }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-3">
              {/* Customer Name - Searchable */}
              <div className="flex flex-col md:grid md:grid-cols-[140px_1fr] md:items-center gap-1 md:gap-3">
                <Label className="text-xs text-primary">Customer Name*</Label>
                <div className="relative w-full md:max-w-md" ref={customerDropdownRef}>
                  <div className="flex gap-1.5">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input
                        className="h-7 text-xs pl-7 w-full"
                        placeholder="Search customers..."
                        value={formCustomerName || customerSearchQuery}
                        onChange={(e) => {
                          setCustomerSearchQuery(e.target.value)
                          setFormCustomerName(e.target.value)
                          setCustomerDropdownOpen(true)
                          if (!e.target.value.trim()) {
                            setFormCustomerId(undefined)
                            setFormCustomerEmail("")
                          }
                        }}
                        onFocus={() => setCustomerDropdownOpen(true)}
                      />
                    </div>
                  </div>
                  {customerDropdownOpen && customerResults.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-auto">
                      {customerResults.map((cust) => (
                        <div
                          key={cust.id}
                          className="px-3 py-2 hover:bg-muted cursor-pointer text-xs"
                          onClick={() => {
                            setFormCustomerName(cust.companyName || cust.name)
                            setFormCustomerId(cust.id)
                            setFormCustomerEmail(cust.email || "")
                            setCustomerSearchQuery("")
                            setCustomerDropdownOpen(false)
                          }}
                        >
                          <div className="font-medium">{cust.companyName || cust.name}</div>
                          {cust.email && <div className="text-muted-foreground text-[10px]">{cust.email}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Billing/Shipping Address (shown when editing) */}
              {isEditing && (
                <div className="flex flex-col md:grid md:grid-cols-[140px_1fr] md:items-start gap-1 md:gap-3">
                  <div className="hidden md:block" />
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1">BILLING ADDRESS</p>
                      <Link href="#" className="text-xs text-primary">New Address</Link>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1">SHIPPING ADDRESS</p>
                      <div className="flex gap-2">
                        <Link href="#" className="text-xs text-primary">New Address</Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tax (shown when editing) */}
              {isEditing && (
                <div className="flex flex-col md:grid md:grid-cols-[140px_1fr] md:items-center gap-1 md:gap-3">
                  <div className="hidden md:block" />
                  <p className="text-xs">Tax: <span className="font-medium">GST/HST ( 13% )</span> <Pencil className="w-3 h-3 inline text-primary ml-1" /></p>
                </div>
              )}

              {/* Invoice # */}
              <div className="flex flex-col md:grid md:grid-cols-[140px_1fr] md:items-center gap-1 md:gap-3">
                <Label className="text-xs text-primary">Invoice#*</Label>
                <div className="flex items-center gap-1.5 w-full md:max-w-[220px]">
                  <Input
                    className="h-7 text-xs flex-1"
                    value={currentInvoice?.invoiceNumber || nextNumber || ""}
                    readOnly={isEditing}
                  />
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                    <Settings className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Sales Order Number */}
              <div className="flex flex-col md:grid md:grid-cols-[140px_1fr] md:items-center gap-1 md:gap-3">
                <Label className="text-xs text-muted-foreground">Sales Order#</Label>
                <Input className="h-7 text-xs w-full md:max-w-[220px]" value={currentInvoice?.salesOrderNumber || ""} readOnly />
              </div>

              {/* Invoice Date, Terms, Due Date */}
              <div className="flex flex-col md:grid md:grid-cols-[140px_1fr] md:items-center gap-1 md:gap-3">
                <Label className="text-xs text-primary">Invoice Date*</Label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full">
                  <Input
                    className="h-7 text-xs w-full sm:w-[180px]"
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Label className="text-xs text-muted-foreground shrink-0">Terms</Label>
                    <Select value={formPaymentTerms} onValueChange={setFormPaymentTerms}>
                      <SelectTrigger className="h-7 text-xs w-full sm:w-[140px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Due on Receipt" className="text-xs">Due on Receipt</SelectItem>
                        <SelectItem value="Net 15" className="text-xs">Net 15</SelectItem>
                        <SelectItem value="Net 30" className="text-xs">Net 30</SelectItem>
                        <SelectItem value="Net 45" className="text-xs">Net 45</SelectItem>
                        <SelectItem value="Net 60" className="text-xs">Net 60</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Label className="text-xs text-muted-foreground shrink-0">Due Date</Label>
                    <Input
                      className="h-7 text-xs w-full sm:w-[140px]"
                      type="date"
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Accounts Receivable */}
              <div className="flex flex-col md:grid md:grid-cols-[140px_1fr] md:items-center gap-1 md:gap-3">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">Accounts Receivable <HelpCircle className="w-3 h-3" /></Label>
                <Select defaultValue="ar">
                  <SelectTrigger className="h-7 text-xs w-full md:max-w-[220px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar" className="text-xs">Accounts Receivable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Salesperson */}
              <div className="flex flex-col md:grid md:grid-cols-[140px_1fr] md:items-center gap-1 md:gap-3">
                <Label className="text-xs text-muted-foreground">Salesperson</Label>
                <div className="flex items-center gap-1.5 w-full md:max-w-[220px]">
                  <Select defaultValue="mekco">
                    <SelectTrigger className="h-7 text-xs flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mekco" className="text-xs">Mekco Supply</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 shrink-0">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Subject */}
              <div className="flex flex-col md:grid md:grid-cols-[140px_1fr] md:items-start gap-1 md:gap-3">
                <Label className="text-xs text-muted-foreground flex items-center gap-1 pt-1.5">Subject <HelpCircle className="w-3 h-3" /></Label>
                <Textarea className="text-xs min-h-[60px] resize-y w-full md:max-w-md" placeholder="Let your customer know what this Invoice is for" />
              </div>

              {/* Item Table */}
              <div className="mt-6 border rounded bg-card w-full">
                <div className="flex items-center justify-between p-3 border-b">
                  <h3 className="text-xs font-medium">Item Table</h3>
                  <div className="flex items-center gap-3">
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                      <Scan className="w-3 h-3 mr-1" />
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
                            <div className="flex items-center gap-2">
                              {row.imageUrl ? (
                                <img src={row.imageUrl} alt="" className="w-8 h-8 border rounded object-cover shrink-0" />
                              ) : (
                                <div className="w-8 h-8 border rounded flex items-center justify-center bg-muted/30 shrink-0">
                                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                </div>
                              )}
                              <Input
                                className="h-7 text-xs border-0 shadow-none px-0 focus-visible:ring-0"
                                placeholder="Type or click to select an item."
                                value={row.itemDetails}
                                onChange={(e) => updateLineItem(row.id, "itemDetails", e.target.value)}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="py-1.5 px-2">
                            <Input className="h-7 text-xs text-center" value="" readOnly />
                          </TableCell>
                          <TableCell className="py-1.5 px-2">
                            <Input
                              className="h-7 text-xs text-center"
                              type="number"
                              step="0.01"
                              value={row.quantity}
                              onChange={(e) => updateLineItem(row.id, "quantity", e.target.value)}
                            />
                          </TableCell>
                          <TableCell className="py-1.5 px-2">
                            <Input
                              className="h-7 text-xs text-center"
                              type="number"
                              step="0.01"
                              value={row.rate}
                              onChange={(e) => updateLineItem(row.id, "rate", e.target.value)}
                            />
                          </TableCell>
                          <TableCell className="py-1.5 px-2">
                            <div className="flex items-center">
                              <Input className="h-7 text-xs text-center w-12" defaultValue="0" />
                              <span className="text-xs text-muted-foreground ml-1">%</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-1.5 px-2">
                            <Select defaultValue="hst">
                              <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Select a Tax" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hst" className="text-xs">HST 13%</SelectItem>
                                <SelectItem value="none" className="text-xs">No Tax</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="py-1.5 px-2 text-right text-xs font-medium">
                            {parseFloat(row.amount || "0").toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
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
              {(() => {
                const { subTotal, taxAmount, total } = computeLineTotals()
                return (
                  <div className="flex justify-end">
                    <div className="w-72 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">Sub Total</span>
                        <span>{subTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs gap-2">
                        <div>
                          <span className="text-muted-foreground">HST (13%)</span>
                        </div>
                        <span>{taxAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs gap-2">
                        <div>
                          <span className="text-muted-foreground">Shipping Charges</span>
                          <Link href="#" className="block text-primary text-[10px]">Configure Account</Link>
                        </div>
                        <div className="flex items-center gap-1">
                          <Input className="h-6 text-xs w-20 text-right" defaultValue="0.00" />
                          <HelpCircle className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <span>0.00</span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-2 border-t font-medium">
                        <span>Total ( $ )</span>
                        <span>{total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Customer Notes & Terms */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Customer Notes</Label>
                  <Textarea className="text-xs min-h-[80px] resize-y" defaultValue="Thanks for your business." />
                  <p className="text-[10px] text-muted-foreground mt-1">Will be displayed on the invoice</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Terms & Conditions</Label>
                    <Textarea className="text-xs min-h-[80px] resize-y" placeholder="Enter the terms and conditions of your business to be displayed in your transaction" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Attach File(s) to Invoice</Label>
                    <Button variant="outline" size="sm" className="h-7 text-xs bg-transparent">
                      <Upload className="w-3 h-3 mr-1.5" />
                      Upload File
                      <ChevronDown className="w-3 h-3 ml-1.5" />
                    </Button>
                    <p className="text-[10px] text-muted-foreground mt-1">You can upload a maximum of 10 files, 10MB each</p>
                  </div>
                </div>
              </div>

              {/* Payment Options */}
              <div className="mt-4">
                <div className="flex items-center gap-2 text-xs mb-3">
                  <span>Select an online payment option to get paid faster</span>
                  <div className="flex items-center gap-1">
                    <div className="w-6 h-4 bg-red-500 rounded-sm flex items-center justify-center">
                      <span className="text-[8px] text-white font-bold">MC</span>
                    </div>
                    <div className="w-6 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                      <span className="text-[8px] text-white font-bold">VISA</span>
                    </div>
                  </div>
                  <Link href="#" className="text-primary flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" />
                    Payment Gateway
                  </Link>
                </div>
                <RadioGroup defaultValue="standard" className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                    <RadioGroupItem value="paypal" id="paypal" className="h-3 w-3" />
                    <Label htmlFor="paypal" className="text-xs font-normal cursor-pointer">PayPal</Label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RadioGroupItem value="standard" id="standard" className="h-3 w-3" />
                    <Label htmlFor="standard" className="text-xs font-normal cursor-pointer">Standard</Label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RadioGroupItem value="business" id="business" className="h-3 w-3" />
                    <Label htmlFor="business" className="text-xs font-normal cursor-pointer">Business</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Additional Fields Note */}
              <p className="text-xs text-muted-foreground mt-4">
                <span className="font-medium">Additional Fields:</span> Start adding custom fields for your invoices by going to{" "}
                <span className="text-primary">Settings</span> ➔{" "}
                <span className="text-primary">Sales</span> ➔{" "}
                <span className="text-primary">Invoices</span>.
              </p>
            </div>
          </div>

          {/* Footer */}
          {(() => {
            const { total } = computeLineTotals()
            const totalQty = itemRows.reduce((acc, row) => acc + (parseFloat(row.quantity) || 0), 0)
            return (
              <div className="flex items-center justify-between px-4 py-2 border-t bg-background shrink-0">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="h-7 text-xs bg-transparent"
                    onClick={() => handleSaveInvoice(false)}
                    disabled={saveLoading}
                  >
                    {saveLoading ? "Saving…" : "Save as Draft"}
                  </Button>
                  <div className="flex">
                    <Button
                      className="bg-primary hover:bg-primary/90 h-7 text-xs rounded-r-none"
                      onClick={() => handleSaveInvoice(true)}
                      disabled={saveLoading}
                    >
                      {saveLoading ? "Saving…" : "Save and Send"}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 h-7 px-1.5 rounded-l-none border-l border-primary-foreground/20">
                          <ChevronDown className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem className="text-xs" onClick={() => handleSaveInvoice(false)}>Save as Draft</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs" onClick={() => handleSaveInvoice(true)}>Save and Send</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <Button variant="ghost" className="h-7 text-xs" onClick={() => { setShowNewForm(false); setEditingInvoice(null) }}>Cancel</Button>
                </div>
                <div className="text-right text-xs">
                  <p className="font-medium">Total Amount: $ {total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p className="text-muted-foreground">Total Quantity: {totalQty.toFixed(2)}</p>
                </div>
              </div>
            )
          })()}
        </div>
      </DashboardLayout>
    )
  }

  // Email Form View
  if (showEmailForm && selectedInvoice) {
    return (
      <DashboardLayout activeItem="Sales" activeSubItem="Invoices">
        <div className="max-w-4xl mx-auto -m-3 p-4">
          <h1 className="text-base font-medium mb-4">Email To {selectedInvoice.customerName}</h1>
          
          <div className="space-y-3">
            {/* From */}
            <div className="flex items-center gap-3">
              <Label className="w-20 text-xs text-muted-foreground flex items-center gap-1">From <HelpCircle className="w-3 h-3" /></Label>
              <p className="text-xs">Mekco Account Receivable {"<AR@mekcosupply.com>"}</p>
            </div>

            {/* Send To */}
            <div className="flex items-center gap-3">
              <Label className="w-20 text-xs text-muted-foreground">Send To</Label>
              <div className="flex-1">
                <span className="text-xs text-muted-foreground block mb-1">
                  Customer: {selectedInvoice.customerName || "—"}
                </span>
                <Input
                  className="h-8 text-xs max-w-md"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder={selectedInvoice.customerEmail || "Enter customer email"}
                />
              </div>
            </div>

            {/* Subject */}
            <div className="flex items-center gap-3">
              <Label className="w-20 text-xs text-muted-foreground">Subject</Label>
              <Input
                className="h-8 text-xs flex-1"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder={`Invoice - ${selectedInvoice.invoiceNumber} from Mekco Supply Inc.`}
              />
            </div>

            {/* Rich Text Toolbar */}
            <div className="flex items-center gap-1 border-b pb-2">
              <Button variant="ghost" size="icon" className="h-7 w-7"><Bold className="w-3.5 h-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7"><Italic className="w-3.5 h-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7"><Underline className="w-3.5 h-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7"><Strikethrough className="w-3.5 h-3.5" /></Button>
              <div className="w-px h-5 bg-border mx-1" />
              <Select defaultValue="18">
                <SelectTrigger className="h-7 w-16 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12 px</SelectItem>
                  <SelectItem value="14">14 px</SelectItem>
                  <SelectItem value="16">16 px</SelectItem>
                  <SelectItem value="18">18 px</SelectItem>
                  <SelectItem value="24">24 px</SelectItem>
                </SelectContent>
              </Select>
              <div className="w-px h-5 bg-border mx-1" />
              <Button variant="ghost" size="icon" className="h-7 w-7"><List className="w-3.5 h-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7"><AlignLeft className="w-3.5 h-3.5" /></Button>
              <div className="w-px h-5 bg-border mx-1" />
              <Button variant="ghost" size="icon" className="h-7 w-7"><Link2 className="w-3.5 h-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7"><ImageIcon className="w-3.5 h-3.5" /></Button>
            </div>

            {/* Email Body */}
            <div className="border rounded-lg overflow-hidden">
              {/* Teal Header */}
              <div className="bg-teal-600 text-white text-center py-12">
                <div className="border-l-2 border-white inline-block pl-2">
                  <p className="text-lg">Invoice #{selectedInvoice.invoiceNumber}</p>
                </div>
              </div>
              
              {/* Email Content */}
              <div className="p-6 bg-white">
                <p className="text-sm mb-4">Dear {selectedInvoice.customerName} team,</p>
                <p className="text-sm mb-6">
                  Thank you for your business. Your invoice can be viewed, printed and downloaded as PDF from the attachment or link below.
                  You can also choose to pay it online.
                </p>
                
                <div className="bg-muted/30 border rounded py-4 text-center space-y-1">
                  <p className="text-sm font-medium">INVOICE AMOUNT</p>
                  <p className="text-lg font-semibold">
                    ${((selectedInvoice.total || selectedInvoice.balanceDue || 0)).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Balance Due: ${((selectedInvoice.balanceDue || selectedInvoice.total || 0)).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="attach-statement"
                    checked={emailAttachStatement}
                    onCheckedChange={(v) => setEmailAttachStatement(Boolean(v))}
                  />
                <Label htmlFor="attach-statement" className="text-xs">Attach Customer Statement</Label>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="attach-pdf"
                    checked={emailAttachPdf}
                    onCheckedChange={(v) => setEmailAttachPdf(Boolean(v))}
                  />
                  <Label htmlFor="attach-pdf" className="text-xs">Attach Invoice PDF</Label>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="w-4 h-4 text-red-500" />
                  <span>{selectedInvoice.invoiceNumber}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4">
              <Button
                size="sm"
                className="bg-teal-600 hover:bg-teal-700"
                onClick={handleSendEmail}
                disabled={sendEmailLoading}
              >
                {sendEmailLoading ? "Sending…" : "Send"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowEmailForm(false)} disabled={sendEmailLoading}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Invoice Detail View (Split Panel)
  if (selectedInvoice) {
    const isOverdue = selectedInvoice.status.includes("OVERDUE")
    return (
      <DashboardLayout activeItem="Sales" activeSubItem="Invoices">
        <div className="flex h-[calc(100vh-120px)] -m-3">
          {/* Left Panel - Invoice List */}
          <div className="w-[240px] border-r flex flex-col shrink-0 bg-background">
            <div className="flex items-center justify-between px-2 py-1.5 border-b">
              <div className="flex items-center gap-1">
                <h1 className="text-xs font-medium">All Invoices</h1>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" className="h-6 w-6 bg-primary hover:bg-primary/90" onClick={() => { setSelectedInvoice(null); setShowNewForm(true) }}>
                  <Plus className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              {invoices.map((invoice) => (
                <div
                  key={invoice.invoiceNumber}
                  className={`px-2 py-1.5 border-b cursor-pointer hover:bg-muted/30 transition-colors ${selectedInvoice.invoiceNumber === invoice.invoiceNumber ? "bg-muted/50" : ""}`}
                  onClick={() => setSelectedInvoice(invoice)}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex items-start gap-1.5 min-w-0 flex-1">
                      <Checkbox className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{invoice.customerName}</p>
                        <p className="text-[10px] text-muted-foreground">{invoice.invoiceNumber} • {formatDisplayDate(invoice.date)}</p>
                        {invoice.salesOrderNumber && <p className="text-[10px] text-muted-foreground truncate">• {invoice.salesOrderNumber}</p>}
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`text-[10px] font-medium ${getStatusStyle(invoice.status)}`}>{invoice.status}</span>
                          {invoice.status === "Paid" && <Mail className="w-3 h-3 text-muted-foreground" />}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs font-semibold shrink-0">${(invoice.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Invoice Detail */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <h1 className="text-sm font-medium">{selectedInvoice.invoiceNumber}</h1>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Lock className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Monitor className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedInvoice(null)}>
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 px-3 py-1.5 border-b">
              <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2" onClick={handleEditInvoice}>
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
                  if (!files || files.length === 0 || !selectedInvoice?.id) return
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
                      const res = await fetch(`${API_BASE}/api/zoho/invoices/${selectedInvoice.id}/attachments/`, {
                        method: "POST",
                        body: formData,
                        credentials: "include",
                      })
                      const data = await res.json()
                      if (data?.attachments) {
                        setInvoiceAttachments(data.attachments)
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
                Attach {invoiceAttachments.length > 0 && `(${invoiceAttachments.length})`}
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2" onClick={handleOpenEmailForm}>
                <Mail className="w-3 h-3 mr-1" /> Send Email
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] px-2"
                onClick={() => {
                  if (!selectedInvoice) return
                  const url = `${window.location.origin}/api/zoho/invoices/${selectedInvoice.id}/pdf/`
                  if (navigator.clipboard?.writeText) {
                    navigator.clipboard.writeText(url).then(
                      () => alert("Invoice link copied to clipboard."),
                      () => alert(url),
                    )
                  } else {
                    alert(url)
                  }
                }}
              >
                <Share2 className="w-3 h-3 mr-1" /> Share
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2">
                    <Bell className="w-3 h-3 mr-1" /> Reminders <ChevronDown className="w-2.5 h-2.5 ml-0.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[140px]">
                  <DropdownMenuItem className="text-[11px] py-1.5 cursor-pointer">Set Reminder</DropdownMenuItem>
                  <DropdownMenuItem className="text-[11px] py-1.5 cursor-pointer">View Reminders</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2">
                    <FileText className="w-3 h-3 mr-1" /> PDF/Print <ChevronDown className="w-2.5 h-2.5 ml-0.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[120px]">
                  <DropdownMenuItem
                    className="text-[11px] py-1.5 cursor-pointer"
                    onClick={() => {
                      if (!selectedInvoice) return
                      const { fullPage } = getInvoicePrintDocument(selectedInvoice)
                      const w = window.open("", "_blank")
                      if (w) {
                        w.document.write(fullPage)
                        w.document.close()
                        setTimeout(() => w.print(), 250)
                      }
                    }}
                  >
                    <FileText className="w-3 h-3 mr-2" /> PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-[11px] py-1.5 cursor-pointer"
                    onClick={() => {
                      if (!selectedInvoice) return
                      const { fullPage } = getInvoicePrintDocument(selectedInvoice)
                      const w = window.open("", "_blank")
                      if (w) {
                        w.document.write(fullPage)
                        w.document.close()
                        w.print()
                      }
                    }}
                  >
                    <Printer className="w-3 h-3 mr-2" /> Print
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2">
                    <CreditCard className="w-3 h-3 mr-1" /> Record Payment <ChevronDown className="w-2.5 h-2.5 ml-0.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[160px]">
                  <DropdownMenuItem className="text-[11px] py-1.5 cursor-pointer">Record Payment</DropdownMenuItem>
                  <DropdownMenuItem className="text-[11px] py-1.5 cursor-pointer">Record Refund</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[180px]">
                  <DropdownMenuItem className="text-[11px] py-1.5 bg-teal-600 text-white focus:bg-teal-700 focus:text-white cursor-pointer">
                    <Plus className="w-3 h-3 mr-2" /> Create Credit Note
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-[11px] py-1.5 cursor-pointer"><Copy className="w-3 h-3 mr-2" /> Clone</DropdownMenuItem>
                  <DropdownMenuItem className="text-[11px] py-1.5 cursor-pointer"><Ban className="w-3 h-3 mr-2" /> Void</DropdownMenuItem>
                  <DropdownMenuItem className="text-[11px] py-1.5 cursor-pointer"><ClipboardList className="w-3 h-3 mr-2" /> View Journal</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-[11px] py-1.5 cursor-pointer text-red-500"><Trash2 className="w-3 h-3 mr-2" /> Delete</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-[11px] py-1.5 cursor-pointer"><Lock className="w-3 h-3 mr-2" /> Lock Invoice</DropdownMenuItem>
                  <DropdownMenuItem className="text-[11px] py-1.5 cursor-pointer"><Settings className="w-3 h-3 mr-2" /> Invoice Preferences</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-3">
              {/* Overdue Warning Banner */}
              {isOverdue && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-3">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <p className="text-xs flex-1">
                    <span className="font-medium">{"WHAT'S NEXT?"}</span> Payment is overdue. Send a payment reminder or record payment.{" "}
                    <Link href="#" className="text-primary">Learn More</Link>
                  </p>
                  <Button size="sm" className="h-6 text-[10px] bg-red-500 hover:bg-red-600">Record Payment</Button>
                </div>
              )}

              {/* Payment Gateways */}
              <div className="flex items-center gap-2 mb-4 text-xs">
                <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Configured Payment Gateways:</span>
                <span>PayPal</span>
                <Link href="#" className="text-primary">Change</Link>
              </div>

              {/* Attachments Section */}
              {invoiceAttachments.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-1.5 py-0.5 mb-2">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Attachments ({invoiceAttachments.length})</span>
                  </div>
                  <div className="border rounded overflow-hidden">
                    <div className="divide-y">
                      {invoiceAttachments.map((att) => (
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
                                await fetch(`${API_BASE}/api/zoho/invoices/${selectedInvoice.id}/attachments/${att.id}/`, {
                                  method: "DELETE",
                                  credentials: "include",
                                })
                                setInvoiceAttachments((prev) => prev.filter((a) => a.id !== att.id))
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

              {/* Associated Sales Orders */}
              {selectedInvoice.salesOrderId && (
                <div className="mb-4">
                  <div
                    className="flex items-center gap-1.5 cursor-pointer py-0.5"
                    onClick={() => setSalesOrdersExpanded(!salesOrdersExpanded)}
                  >
                    {salesOrdersExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    <span className="text-xs font-medium">Associated sales orders</span>
                    <span className="text-xs text-primary">1</span>
                    <ChevronDown className="w-3 h-3 ml-auto text-muted-foreground" />
                  </div>
                  {salesOrdersExpanded && (
                    <div className="mt-2 border rounded overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead className="text-[10px] font-medium py-1.5 px-2">Date</TableHead>
                            <TableHead className="text-[10px] font-medium py-1.5 px-2">Sales Order#</TableHead>
                            <TableHead className="text-[10px] font-medium py-1.5 px-2">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="py-1.5 px-2 text-xs">{formatDisplayDate(selectedInvoice.date)}</TableCell>
                            <TableCell className="py-1.5 px-2">
                              <Link href={`/sales/orders?id=${selectedInvoice.salesOrderId}`} className="text-xs text-primary hover:underline">
                                {selectedInvoice.salesOrderNumber || "—"}
                              </Link>
                            </TableCell>
                            <TableCell className="py-1.5 px-2 text-xs text-teal-600">Linked</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}

              {/* Viewed indicator */}
              <div className="flex justify-end mb-2">
                <div className="flex items-center gap-1 text-xs text-primary">
                  <Mail className="w-3 h-3" />
                  <span>Viewed</span>
                </div>
              </div>

              {/* Invoice PDF Preview */}
              <div className="border rounded-lg bg-white relative overflow-hidden shadow-sm">
                {/* Overdue Ribbon */}
                {isOverdue && (
                  <div className="absolute left-0 top-0 w-32 h-32 overflow-hidden">
                    <div className="absolute top-6 -left-8 w-40 bg-red-500 text-white text-xs py-1.5 text-center font-medium -rotate-45 shadow-md">
                      Overdue
                    </div>
                  </div>
                )}

                <div className="p-6">
                  {/* Header with Logo and Invoice Title */}
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <div className="w-28 h-16 rounded flex items-center justify-center overflow-hidden bg-white shrink-0 mb-3">
                        <img
                          alt="Mekco Supply Inc."
                          width={112}
                          height={64}
                          className="object-contain w-full h-full p-1"
                          src="/Mekco-Supply-logo-300px.png"
                        />
                      </div>
                      <p className="text-sm font-semibold">Mekco Supply Inc.</p>
                      <p className="text-xs text-muted-foreground">16-110 West Beaver Creek Rd.</p>
                      <p className="text-xs text-muted-foreground">Richmond Hill, Ontario L4B 1J9</p>
                    </div>
                    <div className="text-right">
                      <h2 className="text-3xl font-light mb-2">Invoice</h2>
                      <p className="text-sm text-muted-foreground"># {selectedInvoice.invoiceNumber}</p>
                      <div className="mt-4">
                        <p className="text-xs text-muted-foreground">Balance Due</p>
                        <p className="text-xl font-semibold">${selectedInvoice.balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  </div>

                  {/* Invoice Info Grid */}
                  <div className="flex justify-between mb-6">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Bill To</p>
                      <Link href="#" className="text-sm text-primary font-medium">{selectedInvoice.customerName}</Link>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex justify-end gap-4">
                        <span className="text-xs text-muted-foreground">Invoice Date :</span>
                        <span className="text-xs">{selectedInvoice.date}</span>
                      </div>
                      <div className="flex justify-end gap-4">
                        <span className="text-xs text-muted-foreground">Due Date :</span>
                        <span className="text-xs">{formatDisplayDate(selectedInvoice.dueDate)}</span>
                      </div>
                      {selectedInvoice.salesOrderNumber && (
                        <div className="flex justify-end gap-4">
                          <span className="text-xs text-muted-foreground">Sales Order# :</span>
                          <span className="text-xs">{selectedInvoice.salesOrderNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="border rounded overflow-hidden mb-4">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-teal-600">
                          <TableHead className="text-xs text-white py-2 px-3 w-10 font-medium">#</TableHead>
                          <TableHead className="text-xs text-white py-2 px-3 font-medium">Item & Description</TableHead>
                          <TableHead className="text-xs text-white py-2 px-3 text-center w-14 font-medium">Qty</TableHead>
                          <TableHead className="text-xs text-white py-2 px-3 text-right w-16 font-medium">Rate</TableHead>
                          <TableHead className="text-xs text-white py-2 px-3 text-right w-20 font-medium">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="border-b">
                          <TableCell className="py-2 px-3 text-xs">1</TableCell>
                          <TableCell className="py-2 px-3 text-xs">MILWAUKEE-Cable Bit 3/4&quot; x 72&quot;-48-13-8375</TableCell>
                          <TableCell className="py-2 px-3 text-xs text-center">20</TableCell>
                          <TableCell className="py-2 px-3 text-xs text-right">44.0737</TableCell>
                          <TableCell className="py-2 px-3 text-xs text-right">881.47</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Items Total & Totals */}
                  <div className="flex justify-between">
                    <p className="text-xs text-muted-foreground">Items in Total 20</p>
                    <div className="w-52 space-y-1">
                      <div className="flex justify-between text-xs py-0.5">
                        <span className="text-muted-foreground">Sub Total</span>
                        <span>881.47</span>
                      </div>
                      <div className="flex justify-between text-xs py-0.5">
                        <span className="text-muted-foreground">Total Taxable Amount</span>
                        <span>881.47</span>
                      </div>
                      <div className="flex justify-between text-xs py-0.5">
                        <span className="text-muted-foreground">GST/HST (13%)</span>
                        <span>${(selectedInvoice.taxAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold py-1.5 border-t mt-1">
                        <span>Total</span>
                        <span>${(selectedInvoice.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-xs py-1.5 bg-muted/30 px-2 -mx-2">
                        <span className="font-medium">Balance Due</span>
                        <span className="font-semibold">${(selectedInvoice.balanceDue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mt-6 pt-4 border-t">
                    <p className="text-xs font-medium mb-1">Notes</p>
                    <p className="text-xs text-muted-foreground">Thanks for your business.</p>
                  </div>

                  {/* Payment Options */}
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Payment Options</span>
                    <div className="flex items-center gap-1">
                      <div className="bg-blue-900 text-white text-[8px] px-2 py-0.5 rounded font-medium">PayPal</div>
                      <div className="flex gap-0.5">
                        <div className="w-5 h-3 bg-blue-600 rounded-sm"></div>
                        <div className="w-5 h-3 bg-orange-500 rounded-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PDF Template */}
              <div className="flex justify-end items-center gap-2 mt-3 text-xs">
                <span className="text-muted-foreground">{"PDF Template : 'Standard Template'"}</span>
                <Link href="#" className="text-primary">Change</Link>
              </div>

              {/* More Information */}
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-3">More Information</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">Salesperson</span>
                    <span>: Mekco Supply</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground flex items-center gap-1">Email Recipients <HelpCircle className="w-3 h-3" /></span>
                    <span>info@canadalux.com</span>
                  </div>
                </div>
              </div>

              {/* Journal Section */}
              <div className="mt-6">
                <div className="border-b">
                  <button className="text-xs font-medium px-3 py-2 border-b-2 border-primary text-primary">Journal</button>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2">Amount is displayed in your base currency <span className="bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded text-[10px] font-medium">CAD</span></p>
                  <h4 className="text-sm font-medium mb-2">Invoice</h4>
                  <div className="border rounded overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="text-[10px] font-medium py-1.5 px-3">ACCOUNT</TableHead>
                          <TableHead className="text-[10px] font-medium py-1.5 px-3 text-right">DEBIT</TableHead>
                          <TableHead className="text-[10px] font-medium py-1.5 px-3 text-right">CREDIT</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="py-1.5 px-3 text-xs">Accounts Receivable</TableCell>
                          <TableCell className="py-1.5 px-3 text-xs text-right">996.06</TableCell>
                          <TableCell className="py-1.5 px-3 text-xs text-right">0.00</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="py-1.5 px-3 text-xs">Sales</TableCell>
                          <TableCell className="py-1.5 px-3 text-xs text-right">0.00</TableCell>
                          <TableCell className="py-1.5 px-3 text-xs text-right">881.47</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="py-1.5 px-3 text-xs">Tax Payable</TableCell>
                          <TableCell className="py-1.5 px-3 text-xs text-right">0.00</TableCell>
                          <TableCell className="py-1.5 px-3 text-xs text-right">114.59</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="py-1.5 px-3 text-xs">Cost of Goods Sold</TableCell>
                          <TableCell className="py-1.5 px-3 text-xs text-right">937.12</TableCell>
                          <TableCell className="py-1.5 px-3 text-xs text-right">0.00</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="py-1.5 px-3 text-xs">Inventory Asset</TableCell>
                          <TableCell className="py-1.5 px-3 text-xs text-right">0.00</TableCell>
                          <TableCell className="py-1.5 px-3 text-xs text-right">937.12</TableCell>
                        </TableRow>
                        <TableRow className="bg-muted/20 font-medium">
                          <TableCell className="py-1.5 px-3 text-xs"></TableCell>
                          <TableCell className="py-1.5 px-3 text-xs text-right">1,933.18</TableCell>
                          <TableCell className="py-1.5 px-3 text-xs text-right">1,933.18</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeItem="Sales" activeSubItem="Invoices">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <h1 className="text-xs font-medium">All Invoices</h1>
          <button className="text-muted-foreground hover:text-foreground">
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" className="text-teal-600 border-teal-600 bg-transparent h-7 text-xs">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Enable Zia's Insights
          </Button>
          <Button className="bg-teal-600 hover:bg-teal-700 text-white h-7 text-xs" onClick={() => setShowNewForm(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            New
          </Button>
          <Button variant="outline" className="text-muted-foreground bg-transparent h-7 w-7" size="icon">
            <ChevronDown className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      
      {/* Payment Summary */}
      <Card className="p-3 mb-3">
        <p className="text-[10px] uppercase text-muted-foreground mb-3 font-medium">Payment Summary</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
              <FileWarning className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Total Outstanding Receivables</p>
              <p className="text-sm font-semibold">$80,783.82</p>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Due Today</p>
            <p className="text-sm font-semibold text-teal-600">$0.00</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Due Within 30 Days</p>
            <p className="text-sm font-semibold">$0.00</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Overdue Invoice</p>
            <p className="text-sm font-semibold">$80,783.82</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Average No. of Days for Getting Paid</p>
            <p className="text-sm font-semibold">62 Days</p>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading invoices...</span>
        </div>
      ) : listError ? (
        <div className="text-center py-12">
          <p className="text-sm text-red-500">{listError}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={fetchInvoices}>Retry</Button>
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground mb-3">No invoices found</p>
          <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => setShowNewForm(true)}>
            <Plus className="w-4 h-4 mr-1" /> Create Invoice
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-lg border shadow-sm overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-8 py-1.5 px-2"><Checkbox className="h-3 w-3" /></TableHead>
                <TableHead className="text-[10px] font-medium py-1.5 px-2">DATE</TableHead>
                <TableHead className="text-[10px] font-medium py-1.5 px-2">INVOICE#</TableHead>
                <TableHead className="text-[10px] font-medium py-1.5 px-2">SALES ORDER</TableHead>
                <TableHead className="text-[10px] font-medium py-1.5 px-2">CUSTOMER NAME</TableHead>
                <TableHead className="text-[10px] font-medium py-1.5 px-2">STATUS</TableHead>
                <TableHead className="text-[10px] font-medium py-1.5 px-2">DUE DATE</TableHead>
                <TableHead className="text-[10px] font-medium py-1.5 px-2 text-right">AMOUNT</TableHead>
                <TableHead className="text-[10px] font-medium py-1.5 px-2 text-right">BALANCE DUE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedInvoice(invoice)}>
                  <TableCell className="py-1.5 px-2" onClick={(e) => e.stopPropagation()}><Checkbox className="h-3 w-3" /></TableCell>
                  <TableCell className="py-1.5 px-2 text-xs">{formatDisplayDate(invoice.date)}</TableCell>
                  <TableCell className="py-1.5 px-2">
                    <span className="text-xs text-teal-600 hover:underline">{invoice.invoiceNumber}</span>
                  </TableCell>
                  <TableCell className="py-1.5 px-2 text-xs text-muted-foreground">{invoice.salesOrderNumber || "—"}</TableCell>
                  <TableCell className="py-1.5 px-2 text-xs">{invoice.customerName}</TableCell>
                  <TableCell className="py-1.5 px-2">
                    <span className={`text-xs ${getStatusStyle(invoice.status)}`}>{getStatusDisplayText(invoice)}</span>
                  </TableCell>
                  <TableCell className="py-1.5 px-2 text-xs">{formatDisplayDate(invoice.dueDate)}</TableCell>
                  <TableCell className="py-1.5 px-2 text-xs text-right">${(invoice.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell className="py-1.5 px-2 text-xs text-right">${(invoice.balanceDue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </DashboardLayout>
  )
}
