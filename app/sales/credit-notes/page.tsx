"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  Plus, X, Search, Settings, ChevronDown, HelpCircle, ImageIcon, MoreVertical, MoreHorizontal,
  Pencil, Mail, FileText, Printer, Copy, Ban, ClipboardList, Trash2, Lock, Monitor, RefreshCw, Paperclip, Loader2
} from "lucide-react"
import Link from "next/link"
import type { CreditNote, UnpaidInvoice, CreditNoteLineItem } from "@/lib/credit-notes-types"

const API_BASE = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_API_ORIGIN || ""

function formatDate(isoDate: string): string {
  if (!isoDate || isoDate.length < 10) return isoDate
  try {
    const d = new Date(isoDate.slice(0, 10) + "T00:00:00")
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  } catch {
    return isoDate
  }
}

function getCreditNotePrintDocument(cn: CreditNote): string {
  const dateStr = formatDate(cn.date)
  const lineItems = cn.lineItems || []
  let rowsHtml = ""
  if (lineItems.length > 0) {
    lineItems.forEach((li, idx) => {
      rowsHtml += `<tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:12px 16px;font-size:13px;">${idx + 1}</td>
        <td style="padding:12px 16px;font-size:13px;">${(li.itemDetails || "").replace(/</g, "&lt;")}</td>
        <td style="padding:12px 16px;font-size:13px;text-align:center;">${li.quantity || ""}</td>
        <td style="padding:12px 16px;font-size:13px;text-align:right;">${li.rate || ""}</td>
        <td style="padding:12px 16px;font-size:13px;text-align:right;">${li.amount || ""}</td>
      </tr>`
    })
  } else {
    rowsHtml = `<tr><td colspan="5" style="padding:16px;text-align:center;color:#6b7280;">No line items</td></tr>`
  }

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><title>Credit Note - ${cn.creditNoteNumber}</title>
<style>@page{size:A4;margin:10mm}*{box-sizing:border-box}body{font-family:system-ui,sans-serif;margin:0;padding:20px;color:#09090b;}</style>
</head>
<body>
  <div style="max-width:800px;margin:0 auto;padding:32px;border:1px solid #e5e7eb;border-radius:8px;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;">
      <div>
        <img src="/Mekco-Supply-logo-300px.png" alt="Mekco" style="width:140px;height:80px;object-fit:contain;margin-bottom:12px;" />
        <p style="font-weight:600;margin:0;font-size:16px;">Mekco Supply Inc.</p>
        <p style="font-size:13px;color:#6b7280;margin:4px 0;">16-110 West Beaver Creek Rd.</p>
        <p style="font-size:13px;color:#6b7280;margin:0;">Richmond Hill, Ontario L4B 1J9</p>
      </div>
      <div style="text-align:right;">
        <h1 style="font-size:28px;font-weight:600;margin:0 0 8px;color:#0f766e;">CREDIT NOTE</h1>
        <p style="font-size:16px;color:#6b7280;margin:0;"># ${cn.creditNoteNumber.replace(/</g, "&lt;")}</p>
        <p style="font-size:14px;color:#6b7280;margin:12px 0 0;">Date: ${dateStr}</p>
        <div style="margin-top:16px;background:#0f766e;color:#fff;padding:12px 20px;border-radius:6px;display:inline-block;">
          <p style="font-size:11px;margin:0 0 4px;">Credits Remaining</p>
          <p style="font-size:20px;font-weight:600;margin:0;">$${cn.creditsRemaining.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
        </div>
      </div>
    </div>
    <div style="margin-bottom:24px;">
      <p style="font-size:13px;color:#6b7280;margin:0 0 6px;">Bill To</p>
      <p style="font-size:16px;color:#0f766e;font-weight:500;margin:0;">${cn.customerName.replace(/</g, "&lt;")}</p>
    </div>
    <div style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr style="background:#0f766e;">
          <th style="padding:12px 16px;font-size:12px;text-align:left;color:#fff;">#</th>
          <th style="padding:12px 16px;font-size:12px;text-align:left;color:#fff;">Item & Description</th>
          <th style="padding:12px 16px;font-size:12px;text-align:center;color:#fff;">Qty</th>
          <th style="padding:12px 16px;font-size:12px;text-align:right;color:#fff;">Rate</th>
          <th style="padding:12px 16px;font-size:12px;text-align:right;color:#fff;">Amount</th>
        </tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>
    <div style="display:flex;justify-content:flex-end;">
      <div style="width:280px;">
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e7eb;">
          <span style="font-size:13px;color:#6b7280;">Sub Total</span>
          <span style="font-size:13px;">$${cn.subTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e7eb;">
          <span style="font-size:13px;color:#6b7280;">Tax (GST/HST 13%)</span>
          <span style="font-size:13px;">$${(cn.taxAmount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:12px 8px;background:#f4f4f5;margin-top:8px;border-radius:4px;">
          <span style="font-size:14px;font-weight:600;">Total</span>
          <span style="font-size:14px;font-weight:600;">$${cn.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;margin-top:8px;">
          <span style="font-size:13px;color:#6b7280;">Credits Remaining</span>
          <span style="font-size:13px;color:#0f766e;font-weight:500;">$${cn.creditsRemaining.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
    <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb;">
      <p style="font-size:13px;color:#6b7280;margin:0;">Thank you for your business.</p>
    </div>
  </div>
</body></html>`
}

export default function CreditNotesPage() {
  const searchParams = useSearchParams()
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [selectedCreditNote, setSelectedCreditNote] = useState<CreditNote | null>(null)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [showRefundForm, setShowRefundForm] = useState(false)
  const [showApplyCreditsModal, setShowApplyCreditsModal] = useState(false)
  const [unpaidInvoices, setUnpaidInvoices] = useState<UnpaidInvoice[]>([])
  const [applyAmounts, setApplyAmounts] = useState<Record<string, string>>({})

  // Email form state
  const [emailTo, setEmailTo] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailAttachPdf, setEmailAttachPdf] = useState(true)
  const [emailSending, setEmailSending] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  // Refund form state
  const [refundAmount, setRefundAmount] = useState("")
  const [refundMode, setRefundMode] = useState("Cheque")
  const [refundReference, setRefundReference] = useState("")
  const [refundFromAccount, setRefundFromAccount] = useState("TD CAD")
  const [refundDescription, setRefundDescription] = useState("")
  const [refundSaving, setRefundSaving] = useState(false)
  const [refundError, setRefundError] = useState<string | null>(null)

  // Apply credits state
  const [applySaving, setApplySaving] = useState(false)
  const [applyError, setApplyError] = useState<string | null>(null)

  // Attachment state
  const attachmentFileInputRef = useRef<HTMLInputElement>(null)
  const [attachmentUploading, setAttachmentUploading] = useState(false)
  const [creditNoteAttachments, setCreditNoteAttachments] = useState<{ id: number; title: string; documentType: string; filename: string; url: string; uploadedAt: string }[]>([])

  useEffect(() => {
    fetchCreditNotes()
  }, [])

  // Fetch attachments when credit note is selected
  useEffect(() => {
    if (!selectedCreditNote?.id) {
      setCreditNoteAttachments([])
      return
    }
    let cancelled = false
    fetch(`${API_BASE}/api/zoho/credit-notes/${selectedCreditNote.id}/attachments/`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.attachments) {
          setCreditNoteAttachments(data.attachments)
        }
      })
      .catch(() => {
        if (!cancelled) setCreditNoteAttachments([])
      })
    return () => { cancelled = true }
  }, [selectedCreditNote?.id])

  async function fetchCreditNotes() {
    setLoading(true)
    setListError(null)
    try {
      const res = await fetch(`${API_BASE}/api/zoho/credit-notes/`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load credit notes")
      setCreditNotes(data.creditNotes ?? [])
    } catch (e) {
      setListError(e instanceof Error ? e.message : "Failed to load credit notes")
    } finally {
      setLoading(false)
    }
  }

  async function fetchCreditNoteDetail(id: string) {
    try {
      const res = await fetch(`${API_BASE}/api/zoho/credit-notes/${id}/`)
      const data = await res.json()
      if (res.ok) {
        setSelectedCreditNote(data)
        setCreditNotes(prev => prev.map(cn => cn.id === data.id ? data : cn))
      }
    } catch (e) {
      console.error("Failed to fetch credit note detail:", e)
    }
  }

  async function fetchUnpaidInvoices(customerId: number) {
    try {
      const res = await fetch(`${API_BASE}/api/zoho/invoices/unpaid/?customerId=${customerId}`)
      const data = await res.json()
      if (res.ok) {
        setUnpaidInvoices(data.invoices ?? [])
        setApplyAmounts({})
      }
    } catch (e) {
      console.error("Failed to fetch unpaid invoices:", e)
    }
  }

  // Select from URL param
  const idFromUrl = searchParams.get("id")
  useEffect(() => {
    if (!idFromUrl) return
    const found = creditNotes.find(cn => cn.id === idFromUrl)
    if (found) {
      setSelectedCreditNote(found)
      fetchCreditNoteDetail(idFromUrl)
    }
  }, [idFromUrl, creditNotes])

  async function handleSendEmail() {
    if (!selectedCreditNote) return
    setEmailSending(true)
    setEmailError(null)
    try {
      const res = await fetch(`${API_BASE}/api/zoho/credit-notes/${selectedCreditNote.id}/send-email/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: emailTo.trim(),
          subject: emailSubject.trim() || `Credit Note #${selectedCreditNote.creditNoteNumber} from Mekco Supply Inc.`,
          attachPdf: emailAttachPdf,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to send email")
      setShowEmailForm(false)
    } catch (e) {
      setEmailError(e instanceof Error ? e.message : "Failed to send email")
    } finally {
      setEmailSending(false)
    }
  }

  async function handleRefund() {
    if (!selectedCreditNote) return
    setRefundSaving(true)
    setRefundError(null)
    try {
      const res = await fetch(`${API_BASE}/api/zoho/credit-notes/${selectedCreditNote.id}/refund/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(refundAmount) || selectedCreditNote.creditsRemaining,
          mode: refundMode,
          referenceNumber: refundReference.trim(),
          fromAccount: refundFromAccount,
          description: refundDescription.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to process refund")
      setSelectedCreditNote(data.creditNote)
      setCreditNotes(prev => prev.map(cn => cn.id === data.creditNote.id ? data.creditNote : cn))
      setShowRefundForm(false)
    } catch (e) {
      setRefundError(e instanceof Error ? e.message : "Failed to process refund")
    } finally {
      setRefundSaving(false)
    }
  }

  async function handleApplyCredits() {
    if (!selectedCreditNote) return
    setApplySaving(true)
    setApplyError(null)
    try {
      // Apply to each invoice with amount > 0
      for (const [invoiceId, amountStr] of Object.entries(applyAmounts)) {
        const amount = parseFloat(amountStr)
        if (amount > 0) {
          const res = await fetch(`${API_BASE}/api/zoho/credit-notes/${selectedCreditNote.id}/apply/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ invoiceId, amount }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || "Failed to apply credits")
          setSelectedCreditNote(data.creditNote)
          setCreditNotes(prev => prev.map(cn => cn.id === data.creditNote.id ? data.creditNote : cn))
        }
      }
      setShowApplyCreditsModal(false)
    } catch (e) {
      setApplyError(e instanceof Error ? e.message : "Failed to apply credits")
    } finally {
      setApplySaving(false)
    }
  }

  async function handleVoid() {
    if (!selectedCreditNote) return
    if (!confirm("Are you sure you want to void this credit note?")) return
    try {
      const res = await fetch(`${API_BASE}/api/zoho/credit-notes/${selectedCreditNote.id}/void/`, {
        method: "POST",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to void credit note")
      setSelectedCreditNote(data.creditNote)
      setCreditNotes(prev => prev.map(cn => cn.id === data.creditNote.id ? data.creditNote : cn))
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to void credit note")
    }
  }

  async function handleDelete() {
    if (!selectedCreditNote) return
    if (!confirm("Are you sure you want to delete this credit note?")) return
    try {
      const res = await fetch(`${API_BASE}/api/zoho/credit-notes/${selectedCreditNote.id}/`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to delete credit note")
      setCreditNotes(prev => prev.filter(cn => cn.id !== selectedCreditNote.id))
      setSelectedCreditNote(null)
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete credit note")
    }
  }

  // Email Form
  if (showEmailForm && selectedCreditNote) {
    return (
      <DashboardLayout activeItem="Sales" activeSubItem="Credit Notes">
        <div className="max-w-4xl mx-auto -m-3 p-4">
          <h1 className="text-base font-medium mb-4">Email To {selectedCreditNote.customerName}</h1>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Label className="w-20 text-xs text-muted-foreground">From</Label>
              <p className="text-xs">Mekco Account Receivable {"<AR@mekcosupply.com>"}</p>
                              </div>
            <div className="flex items-center gap-3">
              <Label className="w-20 text-xs text-muted-foreground">Send To</Label>
              <Input
                className="h-8 text-xs flex-1 max-w-md"
                placeholder="email@example.com"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
              />
                  </div>
            <div className="flex items-center gap-3">
              <Label className="w-20 text-xs text-muted-foreground">Subject</Label>
              <Input
                className="h-8 text-xs flex-1"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder={`Credit Note #${selectedCreditNote.creditNoteNumber} from Mekco Supply Inc.`}
              />
                </div>
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-teal-600 text-white text-center py-10">
                <p className="text-lg font-light">Credit Note</p>
                    </div>
              <div className="p-6 bg-white">
                <p className="text-sm mb-4">Dear {selectedCreditNote.customerName} team,</p>
                <p className="text-sm mb-6">We have issued a credit note for your account. The credit can be applied to future invoices.</p>
                <div className="border rounded py-4 text-center max-w-md mx-auto">
                  <p className="text-sm font-medium mb-1">Credit Note Amount</p>
                  <p className="text-lg text-teal-600 font-semibold">${selectedCreditNote.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <Checkbox id="attach-pdf" checked={emailAttachPdf} onCheckedChange={(v) => setEmailAttachPdf(v === true)} />
                <Label htmlFor="attach-pdf" className="text-xs">Attach Credit Note PDF</Label>
              </div>
              </div>
            {emailError && <p className="text-xs text-destructive">{emailError}</p>}
            <div className="flex items-center gap-2 pt-4">
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={handleSendEmail} disabled={emailSending || !emailTo.trim()}>
                {emailSending ? "Sending…" : "Send"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowEmailForm(false)} disabled={emailSending}>Cancel</Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Refund Form
  if (showRefundForm && selectedCreditNote) {
    return (
      <DashboardLayout activeItem="Sales" activeSubItem="Credit Notes">
        <div className="flex flex-col md:flex-row h-auto md:h-[calc(100vh-120px)] -m-3">
          {/* Left Panel */}
          <div className="w-full md:w-[240px] border-b md:border-b-0 md:border-r flex flex-col shrink-0 bg-background max-h-[200px] md:max-h-none">
            <div className="flex items-center justify-between px-2 py-1.5 border-b">
                <h1 className="text-xs font-medium">All Credit Notes</h1>
            </div>
            <div className="flex-1 overflow-auto">
              {creditNotes.slice(0, 8).map((note) => (
                <div
                  key={note.id}
                  className={`px-2 py-1.5 border-b cursor-pointer hover:bg-muted/30 ${selectedCreditNote?.id === note.id ? "bg-muted/50" : ""}`}
                  onClick={() => { setSelectedCreditNote(note); setShowRefundForm(false); fetchCreditNoteDetail(note.id) }}
                >
                        <p className="text-xs font-medium truncate">{note.customerName}</p>
                  <p className="text-[10px] text-muted-foreground">{note.creditNoteNumber}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Right Panel - Refund Form */}
          <div className="flex-1 p-4">
            <h1 className="text-base font-medium mb-4">Refund Credits</h1>
            <div className="border rounded-lg p-4 max-w-2xl mb-4 bg-muted/20">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Credit Note:</span>
                  <p className="font-medium">{selectedCreditNote.creditNoteNumber}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total:</span>
                  <p className="font-medium">${selectedCreditNote.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                </div>
                  <div>
                  <span className="text-muted-foreground">Available:</span>
                  <p className="font-medium text-teal-600">${selectedCreditNote.creditsRemaining.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>
            <div className="border rounded-lg p-4 max-w-2xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <Label className="md:w-32 text-xs text-primary">Refund Amount*</Label>
                <div className="flex items-center gap-1 flex-1">
                  <span className="bg-muted text-xs px-2 py-1.5 rounded-l border">CAD</span>
                  <Input
                    className="h-8 text-xs rounded-l-none flex-1"
                    type="number"
                    step="0.01"
                    max={selectedCreditNote.creditsRemaining}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    placeholder={selectedCreditNote.creditsRemaining.toString()}
                  />
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <Label className="md:w-24 text-xs">Mode</Label>
                  <Select value={refundMode} onValueChange={setRefundMode}>
                    <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                      <SelectItem value="Cheque" className="text-xs">Cheque</SelectItem>
                      <SelectItem value="Bank Transfer" className="text-xs">Bank Transfer</SelectItem>
                      <SelectItem value="Cash" className="text-xs">Cash</SelectItem>
                      <SelectItem value="Credit Card" className="text-xs">Credit Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <Label className="md:w-24 text-xs text-primary">From Account*</Label>
                  <Select value={refundFromAccount} onValueChange={setRefundFromAccount}>
                    <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                      <SelectItem value="TD CAD" className="text-xs">TD CAD</SelectItem>
                      <SelectItem value="TD USD" className="text-xs">TD USD</SelectItem>
                      <SelectItem value="Petty Cash" className="text-xs">Petty Cash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <Label className="md:w-24 text-xs">Reference#</Label>
                <Input className="h-8 text-xs flex-1" value={refundReference} onChange={(e) => setRefundReference(e.target.value)} />
                </div>
              <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4">
                <Label className="md:w-24 text-xs md:pt-2">Description</Label>
                <Textarea className="text-xs flex-1" rows={3} value={refundDescription} onChange={(e) => setRefundDescription(e.target.value)} />
              </div>
              </div>
            {refundError && <p className="text-xs text-destructive mt-2">{refundError}</p>}
            <div className="flex items-center gap-2 mt-4">
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={handleRefund} disabled={refundSaving}>
                {refundSaving ? "Processing…" : "Save"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowRefundForm(false)} disabled={refundSaving}>Cancel</Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Apply Credits Modal
  if (showApplyCreditsModal && selectedCreditNote) {
    return (
      <DashboardLayout activeItem="Sales" activeSubItem="Credit Notes">
        <div className="flex flex-col md:flex-row h-auto md:h-[calc(100vh-120px)] -m-3">
          <div className="w-full md:w-[240px] border-b md:border-b-0 md:border-r shrink-0 bg-background/50 opacity-50 pointer-events-none hidden md:flex flex-col">
            <div className="px-2 py-1.5 border-b"><h1 className="text-xs font-medium">All Credit Notes</h1></div>
            </div>
          <div className="flex-1 flex items-start justify-center pt-4 bg-black/20">
            <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl mx-4 border">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-base font-medium">Apply Credits to Invoices</h2>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowApplyCreditsModal(false)}>
                  <X className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
              <div className="p-6">
                <div className="flex items-center gap-8 mb-6">
                    <div>
                    <p className="text-[10px] text-muted-foreground">Credit Note#</p>
                    <p className="text-xs font-medium">{selectedCreditNote.creditNoteNumber}</p>
                    </div>
                    <div>
                    <p className="text-[10px] text-muted-foreground">Available Credits</p>
                    <p className="text-xs font-medium">${selectedCreditNote.creditsRemaining.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-3">Unpaid Invoices</h3>
                  <div className="border rounded overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="text-[10px] font-medium py-2 px-3">INVOICE #</TableHead>
                          <TableHead className="text-[10px] font-medium py-2 px-3">DATE</TableHead>
                          <TableHead className="text-[10px] font-medium py-2 px-3 text-right">TOTAL</TableHead>
                          <TableHead className="text-[10px] font-medium py-2 px-3 text-right">BALANCE DUE</TableHead>
                          <TableHead className="text-[10px] font-medium py-2 px-3 text-right">CREDITS TO APPLY</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {unpaidInvoices.length === 0 ? (
                          <TableRow><TableCell colSpan={5} className="py-4 text-center text-xs text-muted-foreground">No unpaid invoices found for this customer</TableCell></TableRow>
                        ) : unpaidInvoices.map((inv) => (
                          <TableRow key={inv.id}>
                            <TableCell className="py-2 px-3 text-xs text-primary">{inv.invoiceNumber}</TableCell>
                            <TableCell className="py-2 px-3 text-xs">{formatDate(inv.date)}</TableCell>
                            <TableCell className="py-2 px-3 text-xs text-right">${inv.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                            <TableCell className="py-2 px-3 text-xs text-right">${inv.balanceDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                            <TableCell className="py-2 px-3">
                              <div className="flex items-center justify-end gap-2">
                                    <Input 
                                  className="h-6 text-xs w-20 text-right"
                                  type="number"
                                  step="0.01"
                                  max={Math.min(inv.balanceDue, selectedCreditNote.creditsRemaining)}
                                  value={applyAmounts[inv.id] || ""}
                                  onChange={(e) => setApplyAmounts(prev => ({ ...prev, [inv.id]: e.target.value }))}
                                />
                                <Button 
                                  variant="link"
                                  size="sm"
                                  className="h-auto p-0 text-[10px]"
                                  onClick={() => setApplyAmounts(prev => ({ ...prev, [inv.id]: Math.min(inv.balanceDue, selectedCreditNote.creditsRemaining).toString() }))}
                                >
                                  Pay in Full
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  </div>
                <div className="flex justify-end">
                  <div className="w-64 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Credits to Apply:</span>
                      <span>${Object.values(applyAmounts).reduce((sum, v) => sum + (parseFloat(v) || 0), 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                  <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Remaining:</span>
                      <span>${(selectedCreditNote.creditsRemaining - Object.values(applyAmounts).reduce((sum, v) => sum + (parseFloat(v) || 0), 0)).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                    </div>
                  </div>
                {applyError && <p className="text-xs text-destructive mt-2">{applyError}</p>}
                    </div>
              <div className="flex items-center gap-2 px-6 py-4 border-t">
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={handleApplyCredits} disabled={applySaving}>
                  {applySaving ? "Saving…" : "Save"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowApplyCreditsModal(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Credit Note Detail View
  if (selectedCreditNote) {
    return (
      <DashboardLayout activeItem="Sales" activeSubItem="Credit Notes">
        <div className="flex flex-col md:flex-row h-auto md:h-[calc(100vh-120px)] -m-3">
          {/* Left Panel */}
          <div className="w-full md:w-[240px] border-b md:border-b-0 md:border-r flex flex-col shrink-0 bg-background max-h-[280px] md:max-h-none">
            <div className="flex items-center justify-between px-2 py-1.5 border-b">
                <h1 className="text-xs font-medium">All Credit Notes</h1>
              <Link href="/sales/credit-notes/new">
                <Button size="icon" className="h-6 w-6 bg-primary hover:bg-primary/90"><Plus className="w-3 h-3" /></Button>
              </Link>
            </div>
            <div className="flex-1 overflow-auto">
              {creditNotes.map((note) => (
                <div
                  key={note.id}
                  className={`px-2 py-1.5 border-b cursor-pointer hover:bg-muted/30 ${selectedCreditNote.id === note.id ? "bg-muted/50" : ""}`}
                  onClick={() => { setSelectedCreditNote(note); fetchCreditNoteDetail(note.id) }}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{note.customerName}</p>
                      <p className="text-[10px] text-muted-foreground">{note.creditNoteNumber} • {formatDate(note.date)}</p>
                      <span className={`text-[10px] font-medium ${note.status === "Open" ? "text-teal-600" : note.status === "Void" ? "text-gray-500" : "text-red-500"}`}>{note.status.toUpperCase()}</span>
                      </div>
                    <p className="text-xs font-semibold shrink-0">${note.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Detail */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <h1 className="text-sm font-medium">{selectedCreditNote.creditNoteNumber}</h1>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedCreditNote(null)}><X className="w-3.5 h-3.5" /></Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-1 px-3 py-1.5 border-b">
              <Link href={`/sales/credit-notes/new?edit=${selectedCreditNote.id}`}>
                <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2"><Pencil className="w-3 h-3 mr-1" /> Edit</Button>
              </Link>
              {/* Attachment Button */}
              <input
                type="file"
                ref={attachmentFileInputRef}
                className="hidden"
                multiple
                onChange={async (e) => {
                  const files = e.target.files
                  if (!files || files.length === 0 || !selectedCreditNote?.id) return
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
                      const res = await fetch(`${API_BASE}/api/zoho/credit-notes/${selectedCreditNote.id}/attachments/`, {
                        method: "POST",
                        body: formData,
                        credentials: "include",
                      })
                      const data = await res.json()
                      if (data?.attachments) {
                        setCreditNoteAttachments(data.attachments)
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
                Attach {creditNoteAttachments.length > 0 && `(${creditNoteAttachments.length})`}
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2" onClick={() => {
                setEmailTo(selectedCreditNote.customerEmail || "")
                setEmailSubject(`Credit Note #${selectedCreditNote.creditNoteNumber} from Mekco Supply Inc.`)
                setEmailError(null)
                setShowEmailForm(true)
              }}>
                <Mail className="w-3 h-3 mr-1" /> Email
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2">
                    <FileText className="w-3 h-3 mr-1" /> PDF/Print <ChevronDown className="w-2.5 h-2.5 ml-0.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem className="text-[11px] py-1.5 cursor-pointer" onClick={() => {
                    window.open(`${API_BASE}/api/zoho/credit-notes/${selectedCreditNote.id}/pdf/`, "_blank")
                  }}><FileText className="w-3 h-3 mr-2" /> PDF</DropdownMenuItem>
                  <DropdownMenuItem className="text-[11px] py-1.5 cursor-pointer" onClick={() => {
                    const doc = getCreditNotePrintDocument(selectedCreditNote)
                    const w = window.open("", "_blank")
                    if (w) { w.document.write(doc); w.document.close(); w.focus(); w.print() }
                  }}><Printer className="w-3 h-3 mr-2" /> Print</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2" onClick={() => {
                if (selectedCreditNote.customerId) fetchUnpaidInvoices(selectedCreditNote.customerId)
                setShowApplyCreditsModal(true)
              }} disabled={selectedCreditNote.creditsRemaining <= 0}>
                <FileText className="w-3 h-3 mr-1" /> Apply to Invoices
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2" onClick={() => {
                setRefundAmount(selectedCreditNote.creditsRemaining.toString())
                setRefundMode("Cheque")
                setRefundReference("")
                setRefundFromAccount("TD CAD")
                setRefundDescription("")
                setRefundError(null)
                setShowRefundForm(true)
              }} disabled={selectedCreditNote.creditsRemaining <= 0}>
                <RefreshCw className="w-3 h-3 mr-1" /> Refund
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-3 h-3" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem className="text-[11px] py-1.5 cursor-pointer" onClick={handleVoid} disabled={selectedCreditNote.status === "Void"}><Ban className="w-3 h-3 mr-2" /> Void</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-[11px] py-1.5 cursor-pointer text-red-500" onClick={handleDelete}><Trash2 className="w-3 h-3 mr-2" /> Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 min-w-0">
              <div className="border rounded-lg bg-white relative overflow-hidden shadow-sm max-w-2xl mx-auto w-full">
                {selectedCreditNote.status === "Open" && (
                  <div className="absolute left-0 top-0 w-32 h-32 overflow-hidden">
                    <div className="absolute top-6 -left-8 w-40 bg-teal-500 text-white text-xs py-1.5 text-center font-medium -rotate-45 shadow-md">Open</div>
                    </div>
                )}
                {selectedCreditNote.status === "Void" && (
                  <div className="absolute left-0 top-0 w-32 h-32 overflow-hidden">
                    <div className="absolute top-6 -left-8 w-40 bg-gray-500 text-white text-xs py-1.5 text-center font-medium -rotate-45 shadow-md">Void</div>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                    <div>
                      <div className="w-28 h-16 rounded flex items-center justify-center overflow-hidden bg-white shrink-0 mb-3">
                        <img alt="Mekco Supply Inc." width={112} height={64} className="object-contain w-full h-full p-1" src="/Mekco-Supply-logo-300px.png" />
                      </div>
                      <p className="text-sm font-semibold">Mekco Supply Inc.</p>
                      <p className="text-xs text-muted-foreground">16-110 West Beaver Creek Rd.</p>
                      <p className="text-xs text-muted-foreground">Richmond Hill, Ontario L4B 1J9</p>
                    </div>
                    <div className="text-right">
                      <h2 className="text-2xl font-light mb-1">CREDIT NOTE</h2>
                      <p className="text-xs text-muted-foreground"># {selectedCreditNote.creditNoteNumber}</p>
                      <div className="mt-4">
                        <p className="text-[10px] text-muted-foreground">Credits Remaining</p>
                        <p className="text-lg font-semibold">${selectedCreditNote.creditsRemaining.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Bill To</p>
                      {selectedCreditNote.customerId ? (
                        <Link href={`/sales/customers?id=${selectedCreditNote.customerId}`} className="text-sm text-primary font-medium hover:underline">{selectedCreditNote.customerName}</Link>
                      ) : (
                        <span className="text-sm font-medium">{selectedCreditNote.customerName}</span>
                      )}
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex justify-end gap-4">
                        <span className="text-xs text-muted-foreground">Credit Date :</span>
                        <span className="text-xs">{formatDate(selectedCreditNote.date)}</span>
                      </div>
                      {selectedCreditNote.referenceNumber && (
                      <div className="flex justify-end gap-4">
                        <span className="text-xs text-muted-foreground">Ref# :</span>
                        <span className="text-xs">{selectedCreditNote.referenceNumber}</span>
                      </div>
                      )}
                    </div>
                  </div>

                  <div className="border rounded overflow-x-auto mb-4">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-teal-600">
                          <TableHead className="text-xs text-white py-2 px-3 w-10 font-medium">#</TableHead>
                          <TableHead className="text-xs text-white py-2 px-3 font-medium">Item & Description</TableHead>
                          <TableHead className="text-xs text-white py-2 px-3 text-center w-14 font-medium">Qty</TableHead>
                          <TableHead className="text-xs text-white py-2 px-3 text-right w-20 font-medium">Rate</TableHead>
                          <TableHead className="text-xs text-white py-2 px-3 text-right w-20 font-medium">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(selectedCreditNote.lineItems || []).length === 0 ? (
                          <TableRow><TableCell colSpan={5} className="py-4 text-center text-xs text-muted-foreground">No line items</TableCell></TableRow>
                        ) : selectedCreditNote.lineItems.map((li, idx) => (
                          <TableRow key={idx} className="border-b">
                            <TableCell className="py-2 px-3 text-xs">{idx + 1}</TableCell>
                            <TableCell className="py-2 px-3 text-xs">{li.itemDetails}</TableCell>
                            <TableCell className="py-2 px-3 text-xs text-center">{li.quantity}</TableCell>
                            <TableCell className="py-2 px-3 text-xs text-right">{li.rate}</TableCell>
                            <TableCell className="py-2 px-3 text-xs text-right">{li.amount}</TableCell>
                        </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex justify-end">
                    <div className="w-52 space-y-1">
                      <div className="flex justify-between text-xs py-0.5">
                          <span className="text-muted-foreground">Sub Total</span>
                        <span>${selectedCreditNote.subTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                        </div>
                      {(selectedCreditNote.taxAmount ?? 0) > 0 && (
                      <div className="flex justify-between text-xs py-0.5">
                          <span className="text-muted-foreground">Tax (GST/HST 13%)</span>
                          <span>${(selectedCreditNote.taxAmount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                      </div>
                      )}
                      <div className="flex justify-between text-xs font-semibold py-1.5 border-t mt-1">
                        <span>Total</span>
                        <span>${selectedCreditNote.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                      </div>
                      {selectedCreditNote.creditsUsed > 0 && (
                        <div className="flex justify-between text-xs py-0.5">
                          <span className="text-muted-foreground">Credits Applied</span>
                          <span className="text-red-500">-${selectedCreditNote.creditsUsed.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      {selectedCreditNote.refundedAmount > 0 && (
                        <div className="flex justify-between text-xs py-0.5">
                          <span className="text-muted-foreground">Refunded</span>
                          <span className="text-red-500">-${selectedCreditNote.refundedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs py-1.5 bg-muted/30 px-2 -mx-2">
                        <span className="font-medium">Credits Remaining</span>
                        <span className="font-semibold">${selectedCreditNote.creditsRemaining.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attachments Section */}
              {creditNoteAttachments.length > 0 && (
                <div className="mt-6 max-w-2xl mx-auto">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Paperclip className="w-3.5 h-3.5" />
                    <h3 className="text-sm font-medium">Attachments ({creditNoteAttachments.length})</h3>
                  </div>
                  <div className="border rounded overflow-hidden">
                    <div className="divide-y">
                      {creditNoteAttachments.map((att) => (
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
                                await fetch(`${API_BASE}/api/zoho/credit-notes/${selectedCreditNote.id}/attachments/${att.id}/`, {
                                  method: "DELETE",
                                  credentials: "include",
                                })
                                setCreditNoteAttachments((prev) => prev.filter((a) => a.id !== att.id))
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

              {/* Applications History */}
              {(selectedCreditNote.applications?.length ?? 0) > 0 && (
                <div className="mt-6 max-w-2xl mx-auto">
                  <h3 className="text-sm font-medium mb-3">Credits Applied</h3>
                  <div className="border rounded overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="text-[10px] font-medium py-2 px-3">INVOICE #</TableHead>
                          <TableHead className="text-[10px] font-medium py-2 px-3">DATE</TableHead>
                          <TableHead className="text-[10px] font-medium py-2 px-3 text-right">AMOUNT</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedCreditNote.applications?.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell className="py-2 px-3 text-xs text-primary">{app.invoiceNumber}</TableCell>
                            <TableCell className="py-2 px-3 text-xs">{formatDate(app.date)}</TableCell>
                            <TableCell className="py-2 px-3 text-xs text-right">${app.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
              </div>
                </div>
              )}

              {/* Refunds History */}
              {(selectedCreditNote.refunds?.length ?? 0) > 0 && (
                <div className="mt-6 max-w-2xl mx-auto">
                  <h3 className="text-sm font-medium mb-3">Refunds</h3>
                  <div className="border rounded overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="text-[10px] font-medium py-2 px-3">DATE</TableHead>
                          <TableHead className="text-[10px] font-medium py-2 px-3">MODE</TableHead>
                          <TableHead className="text-[10px] font-medium py-2 px-3">FROM ACCOUNT</TableHead>
                          <TableHead className="text-[10px] font-medium py-2 px-3 text-right">AMOUNT</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedCreditNote.refunds?.map((ref) => (
                          <TableRow key={ref.id}>
                            <TableCell className="py-2 px-3 text-xs">{formatDate(ref.date)}</TableCell>
                            <TableCell className="py-2 px-3 text-xs">{ref.mode}</TableCell>
                            <TableCell className="py-2 px-3 text-xs">{ref.fromAccount || "—"}</TableCell>
                            <TableCell className="py-2 px-3 text-xs text-right text-red-500">-${ref.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* More Information */}
              <div className="mt-6 max-w-2xl mx-auto">
                <h3 className="text-sm font-medium mb-3">More Information</h3>
                <div className="flex flex-wrap gap-8 text-xs">
                  {selectedCreditNote.salesperson && (
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">Salesperson</span>
                      <span>: {selectedCreditNote.salesperson}</span>
                  </div>
                  )}
                  {selectedCreditNote.subject && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground">Subject</span>
                      <span>: {selectedCreditNote.subject}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Main List View
  return (
    <DashboardLayout activeItem="Sales" activeSubItem="Credit Notes">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border-b">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">All Credit Notes</h1>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2">
          <Link href="/sales/credit-notes/new">
            <Button size="sm" className="text-xs"><Plus className="w-3 h-3 mr-1" /> New</Button>
          </Link>
          <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent"><MoreVertical className="h-4 w-4" /></Button>
        </div>
      </div>

      {listError && <p className="text-sm text-destructive p-4">{listError}</p>}
      {loading ? (
        <p className="text-sm text-muted-foreground p-4">Loading credit notes…</p>
      ) : (
      <div className="p-4">
        <div className="bg-card rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-10 py-2 px-3"><Checkbox /></TableHead>
                <TableHead className="text-[10px] font-medium py-2 px-3">DATE</TableHead>
                <TableHead className="text-[10px] font-medium py-2 px-3">CREDIT NOTE#</TableHead>
                  <TableHead className="text-[10px] font-medium py-2 px-3">REFERENCE</TableHead>
                <TableHead className="text-[10px] font-medium py-2 px-3">CUSTOMER NAME</TableHead>
                <TableHead className="text-[10px] font-medium py-2 px-3">INVOICE#</TableHead>
                <TableHead className="text-[10px] font-medium py-2 px-3">STATUS</TableHead>
                <TableHead className="text-[10px] font-medium py-2 px-3 text-right">AMOUNT</TableHead>
                <TableHead className="text-[10px] font-medium py-2 px-3 text-right">BALANCE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {creditNotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-8 text-center text-sm text-muted-foreground">
                      No credit notes yet. Create one using the New button.
                    </TableCell>
                  </TableRow>
                ) : creditNotes.map((note) => (
                <TableRow 
                    key={note.id}
                  className="hover:bg-muted/30 cursor-pointer"
                    onClick={() => { setSelectedCreditNote(note); fetchCreditNoteDetail(note.id) }}
                >
                  <TableCell className="py-2 px-3" onClick={(e) => e.stopPropagation()}><Checkbox /></TableCell>
                    <TableCell className="py-2 px-3 text-xs">{formatDate(note.date)}</TableCell>
                    <TableCell className="py-2 px-3 text-xs"><span className="text-primary hover:underline">{note.creditNoteNumber}</span></TableCell>
                    <TableCell className="py-2 px-3 text-xs">{note.referenceNumber || "—"}</TableCell>
                  <TableCell className="py-2 px-3 text-xs">{note.customerName}</TableCell>
                    <TableCell className="py-2 px-3 text-xs">{note.invoiceNumber || "—"}</TableCell>
                  <TableCell className="py-2 px-3 text-xs">
                      <span className={note.status === "Open" ? "text-teal-600" : note.status === "Void" ? "text-gray-500" : "text-red-500"}>{note.status.toUpperCase()}</span>
                  </TableCell>
                    <TableCell className="py-2 px-3 text-xs text-right">${note.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="py-2 px-3 text-xs text-right">${note.creditsRemaining.toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      )}
    </DashboardLayout>
  )
}
