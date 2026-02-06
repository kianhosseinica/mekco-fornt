"use client"
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import Link from "next/link"
import {
  ChevronDown,
  Plus,
  MoreHorizontal,
  X,
  Pencil,
  Mail,
  FileText,
  Printer,
  RotateCcw,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  AlignLeft,
  Link2,
  ImageIcon,
  Upload,
  Info,
  HelpCircle,
  Monitor,
  Lock,
  Paperclip,
  User,
  Settings,
  Loader2,
} from "lucide-react"
import type { Payment, Refund } from "@/lib/payments-types"

const API_BASE = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_API_ORIGIN || ""

function formatPaymentDate(isoDate: string): string {
  if (!isoDate || isoDate.length < 10) return isoDate
  try {
    const d = new Date(isoDate.slice(0, 10) + "Z")
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  } catch {
    return isoDate
  }
}

function getPaymentReceiptDocument(payment: Payment): string {
  const dateStr = formatPaymentDate(payment.date)
  const invoiceDateStr = payment.invoiceDate ? formatPaymentDate(payment.invoiceDate) : payment.invoiceDate
  const invoiceAmount = (payment.invoiceAmount ?? 0)
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><title>Payment Receipt - ${payment.paymentNumber}</title>
<style>@page{size:A4;margin:10mm}*{box-sizing:border-box}body{font-family:system-ui,sans-serif;margin:0;padding:20px;color:#09090b;}</style>
</head>
<body>
  <div style="width:100%;border:1px solid #e5e7eb;border-radius:8px;padding:32px;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;">
      <div>
        <img src="/Mekco-Supply-logo-300px.png" alt="Mekco" style="width:140px;height:80px;object-fit:contain;margin-bottom:12px;" />
        <p style="font-weight:600;margin:0;font-size:16px;">Mekco Supply Inc.</p>
        <p style="font-size:13px;color:#6b7280;margin:4px 0;">16-110 West Beaver Creek Rd.</p>
        <p style="font-size:13px;color:#6b7280;margin:0;">Richmond Hill, Ontario L4B 1J9</p>
      </div>
      <div style="text-align:right;">
        <h1 style="font-size:28px;font-weight:600;margin:0 0 8px;color:#0f766e;">PAYMENT RECEIPT</h1>
        <p style="font-size:16px;color:#6b7280;margin:0;"># ${(payment.paymentNumber || "").replace(/</g, "&lt;")}</p>
        <p style="font-size:14px;color:#6b7280;margin:12px 0 0;">Date: ${dateStr.replace(/</g, "&lt;")}</p>
      </div>
    </div>
    <div style="margin-bottom:24px;">
      <p style="font-size:13px;color:#6b7280;margin:0 0 6px;">Received From</p>
      <p style="font-size:16px;color:#0f766e;font-weight:500;margin:0;">${(payment.customerName || "").replace(/</g, "&lt;")}</p>
    </div>
    <div style="background:#f4f4f5;border:1px solid #e5e7eb;border-radius:8px;padding:24px;margin-bottom:24px;">
      <p style="font-size:14px;font-weight:500;color:#6b7280;margin:0 0 8px;">Amount Received</p>
      <p style="font-size:28px;font-weight:600;margin:0;color:#09090b;">$${payment.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
      <p style="font-size:13px;color:#6b7280;margin:8px 0 0;">Mode: ${(payment.mode || "").replace(/</g, "&lt;")}</p>
      ${payment.depositTo ? `<p style="font-size:13px;color:#6b7280;margin:4px 0 0;">Deposit To: ${payment.depositTo.replace(/</g, "&lt;")}</p>` : ""}
      ${payment.referenceNumber ? `<p style="font-size:13px;color:#6b7280;margin:4px 0 0;">Reference: ${payment.referenceNumber.replace(/</g, "&lt;")}</p>` : ""}
    </div>
    <div style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;">
      <div style="background:#f4f4f5;padding:12px 16px;"><p style="font-size:14px;font-weight:500;margin:0;">Payment for</p></div>
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr style="background:#f4f4f5;"><th style="padding:12px 16px;font-size:13px;text-align:left;">Invoice #</th><th style="padding:12px 16px;font-size:13px;text-align:left;">Invoice Date</th><th style="padding:12px 16px;font-size:13px;text-align:right;">Invoice Amount</th><th style="padding:12px 16px;font-size:13px;text-align:right;">Amount Paid</th></tr></thead>
        <tbody><tr style="border-top:1px solid #e5e7eb;"><td style="padding:12px 16px;font-size:13px;">${(payment.invoiceNumber || "—").replace(/</g, "&lt;")}</td><td style="padding:12px 16px;font-size:13px;">${(invoiceDateStr || "").replace(/</g, "&lt;")}</td><td style="padding:12px 16px;font-size:13px;text-align:right;">$${invoiceAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td><td style="padding:12px 16px;font-size:13px;text-align:right;">$${payment.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td></tr></tbody>
      </table>
    </div>
    <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e5e7eb;">
      <p style="font-size:13px;color:#6b7280;margin:0;">Thank you for your payment.</p>
    </div>
  </div>
</body></html>`
}

export default function PaymentsReceivedPage() {
  const searchParams = useSearchParams()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showRefundForm, setShowRefundForm] = useState(false)
  const [journalView, setJournalView] = useState<"accrual" | "cash">("accrual")
  const [showEditModal, setShowEditModal] = useState(false)
  // Email form state
  const [emailTo, setEmailTo] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const [emailAttachPdf, setEmailAttachPdf] = useState(true)
  const [emailSending, setEmailSending] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  // Edit form state - all editable fields
  const [editReferenceNumber, setEditReferenceNumber] = useState("")
  const [editNotes, setEditNotes] = useState("")
  const [editDate, setEditDate] = useState("")
  const [editMode, setEditMode] = useState("")
  const [editDepositTo, setEditDepositTo] = useState("")
  const [editAmount, setEditAmount] = useState("")
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  // Refund form state
  const [refundAmount, setRefundAmount] = useState("")
  const [refundDate, setRefundDate] = useState("")
  const [refundMode, setRefundMode] = useState("Cheque")
  const [refundReference, setRefundReference] = useState("")
  const [refundFromAccount, setRefundFromAccount] = useState("TD CAD")
  const [refundDescription, setRefundDescription] = useState("")
  const [refundSaving, setRefundSaving] = useState(false)
  const [refundError, setRefundError] = useState<string | null>(null)
  // Attachment state
  const attachmentFileInputRef = useRef<HTMLInputElement>(null)
  const [attachmentUploading, setAttachmentUploading] = useState(false)
  const [paymentAttachments, setPaymentAttachments] = useState<{ id: number; title: string; documentType: string; filename: string; url: string; uploadedAt: string }[]>([])

  useEffect(() => {
    let cancelled = false
    async function fetchPayments() {
      setLoading(true)
      setListError(null)
      try {
        const res = await fetch(`${API_BASE}/api/zoho/payments/`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to load payments")
        if (!cancelled) setPayments(data.payments ?? [])
      } catch (e) {
        if (!cancelled) setListError(e instanceof Error ? e.message : "Failed to load payments")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchPayments()
    return () => { cancelled = true }
  }, [])

  // Fetch attachments when payment is selected
  useEffect(() => {
    if (!selectedPayment?.id) {
      setPaymentAttachments([])
      return
    }
    let cancelled = false
    fetch(`${API_BASE}/api/zoho/payments/${selectedPayment.id}/attachments/`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.attachments) {
          setPaymentAttachments(data.attachments)
        }
      })
      .catch(() => {
        if (!cancelled) setPaymentAttachments([])
      })
    return () => { cancelled = true }
  }, [selectedPayment?.id])

  // Fetch full payment detail (with refunds) when a payment is selected
  async function fetchPaymentDetail(paymentId: string) {
    try {
      const res = await fetch(`${API_BASE}/api/zoho/payments/${paymentId}/`)
      const data = await res.json()
      if (res.ok) {
        setSelectedPayment(data)
        // Also update in the list
        setPayments((prev) => prev.map((p) => (p.id === data.id ? data : p)))
      }
    } catch (e) {
      console.error("Failed to fetch payment detail:", e)
    }
  }

  // Select payment from URL ?id= (e.g. after creating a new payment)
  const idFromUrl = searchParams.get("id")
  useEffect(() => {
    if (!idFromUrl) return
    // First set from list for quick display, then fetch full detail
    const found = payments.find((p) => p.id === idFromUrl)
    if (found) {
      setSelectedPayment(found)
      fetchPaymentDetail(idFromUrl)
    }
  }, [idFromUrl, payments])

  async function handleSendEmail() {
    if (!selectedPayment) return
    setEmailSending(true)
    setEmailError(null)
    try {
      const res = await fetch(`${API_BASE}/api/zoho/payments/${selectedPayment.id}/send-email/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: emailTo.trim(),
          subject: emailSubject.trim() || `Payment Receipt #${selectedPayment.paymentNumber} from Mekco Supply Inc.`,
          message: emailMessage.trim(),
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

  async function handleSaveEdit() {
    if (!selectedPayment) return
    setEditSaving(true)
    setEditError(null)
    try {
      const res = await fetch(`${API_BASE}/api/zoho/payments/${selectedPayment.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceNumber: editReferenceNumber.trim(),
          notes: editNotes.trim(),
          date: editDate && editDate.length >= 10 ? editDate.slice(0, 10) : selectedPayment.date.slice(0, 10),
          mode: editMode || selectedPayment.mode,
          depositTo: editDepositTo || selectedPayment.depositTo,
          amount: editAmount ? parseFloat(editAmount) : selectedPayment.amount,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update payment")
      setPayments((prev) => prev.map((p) => (p.id === data.id ? data : p)))
      setSelectedPayment(data)
      setShowEditForm(false)
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "Failed to update payment")
    } finally {
      setEditSaving(false)
    }
  }

  async function handleRefund() {
    if (!selectedPayment) return
    setRefundSaving(true)
    setRefundError(null)
    try {
      const res = await fetch(`${API_BASE}/api/zoho/payments/${selectedPayment.id}/refund/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: refundAmount ? parseFloat(refundAmount) : selectedPayment.amount,
          date: refundDate || new Date().toISOString().slice(0, 10),
          mode: refundMode,
          referenceNumber: refundReference.trim(),
          fromAccount: refundFromAccount,
          description: refundDescription.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to process refund")
      setPayments((prev) => prev.map((p) => (p.id === data.payment.id ? data.payment : p)))
      setSelectedPayment(data.payment)
      setShowRefundForm(false)
    } catch (e) {
      setRefundError(e instanceof Error ? e.message : "Failed to process refund")
    } finally {
      setRefundSaving(false)
    }
  }

  // Email Form View
  if (showEmailForm && selectedPayment) {
    return (
      <DashboardLayout activeItem="Sales" activeSubItem="Payments Received">
        <div className="max-w-4xl mx-auto -m-3 p-4">
          <h1 className="text-base font-medium mb-4">Email To {selectedPayment.customerName}</h1>

          <div className="space-y-3">
            {/* From */}
            <div className="flex items-center gap-3">
              <Label className="w-20 text-xs text-muted-foreground flex items-center gap-1">From <HelpCircle className="w-3 h-3" /></Label>
              <p className="text-xs">Mekco Account Receivable {"<AR@mekcosupply.com>"}</p>
            </div>

            {/* Send To */}
            <div className="flex items-center gap-3">
              <Label className="w-20 text-xs text-muted-foreground">Send To</Label>
              <Input
                className="h-8 text-xs flex-1 max-w-md"
                placeholder="email@example.com"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
              />
            </div>

            {/* Subject */}
            <div className="flex items-center gap-3">
              <Label className="w-20 text-xs text-muted-foreground">Subject</Label>
              <Input
                className="h-8 text-xs flex-1"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Payment Received by Mekco Supply Inc."
              />
            </div>

            {/* Message (optional) */}
            <div className="flex items-start gap-3">
              <Label className="w-20 text-xs text-muted-foreground pt-2">Message</Label>
              <Textarea
                className="text-xs flex-1 min-h-[80px]"
                placeholder="Optional message..."
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
              />
            </div>

            {/* Email preview */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-teal-600 text-white text-center py-10">
                <p className="text-lg font-light">Payment Received</p>
              </div>
              <div className="p-6 bg-white">
                <p className="text-sm mb-4">Dear {selectedPayment.customerName} team,</p>
                <p className="text-sm mb-6">Thank you for your payment. It was a pleasure doing business with you. We look forward to work together again!</p>
                <div className="border rounded py-4 text-center max-w-md mx-auto">
                  <p className="text-sm font-medium mb-1">Payment Received</p>
                  <p className="text-lg text-teal-600 font-semibold">${selectedPayment.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="attach-pdf"
                    checked={emailAttachPdf}
                    onCheckedChange={(v) => setEmailAttachPdf(v === true)}
                  />
                  <Label htmlFor="attach-pdf" className="text-xs">Attach Payment Receipt PDF</Label>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground border rounded px-2 py-1">
                  <FileText className="w-4 h-4 text-red-500" />
                  <span>Payment-{selectedPayment.paymentNumber}</span>
                </div>
              </div>
            </div>

            {emailError && <p className="text-xs text-destructive">{emailError}</p>}

            {/* Actions */}
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

  // Refund Form View
  if (showRefundForm && selectedPayment) {
    return (
      <DashboardLayout activeItem="Sales" activeSubItem="Payments Received">
        <div className="flex h-[calc(100vh-120px)] -m-3">
          {/* Left Panel - Payment List */}
          <div className="w-[240px] border-r flex flex-col shrink-0 bg-background">
            <div className="flex items-center justify-between px-2 py-1.5 border-b">
              <div className="flex items-center gap-1">
                <h1 className="text-xs font-medium">All Received Pa...</h1>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" className="h-6 w-6 bg-primary hover:bg-primary/90">
                  <Plus className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className={`px-2 py-1.5 border-b cursor-pointer hover:bg-muted/30 transition-colors ${selectedPayment?.id === payment.id ? "bg-muted/50" : ""}`}
                  onClick={() => { setSelectedPayment(payment); setShowRefundForm(false); fetchPaymentDetail(payment.id) }}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex items-start gap-1.5 min-w-0 flex-1">
                      <Checkbox className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{payment.customerName}</p>
                        <p className="text-[10px] text-muted-foreground">{payment.paymentNumber} <FileText className="w-2.5 h-2.5 inline" /> • {payment.date}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">{payment.mode}</span>
                          <HelpCircle className="w-2.5 h-2.5 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <p className="text-xs font-semibold">${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      <Lock className="w-3 h-3 text-muted-foreground mt-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Refund Form */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <div className="p-4">
              <h1 className="text-base font-medium mb-4">Refund</h1>

              {/* Customer Info */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Customer Name</p>
                  <p className="text-sm font-medium">{selectedPayment.customerName}</p>
                </div>
              </div>

              {/* Payment Info Summary */}
              <div className="border rounded-lg p-3 max-w-2xl mb-4 bg-muted/20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Original Amount:</span>
                    <p className="font-medium">${(selectedPayment.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Already Refunded:</span>
                    <p className="font-medium text-red-600">${(selectedPayment.amountRefunded ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Available for Refund:</span>
                    <p className="font-medium text-teal-600">${((selectedPayment.amount ?? 0) - (selectedPayment.amountRefunded ?? 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Payment #:</span>
                    <p className="font-medium">{selectedPayment.paymentNumber}</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 max-w-2xl space-y-4">
                {/* Total Refund Amount */}
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <Label className="md:w-32 text-xs text-primary">Total Refund Amount*</Label>
                  <div className="flex items-center gap-1 flex-1">
                    <span className="bg-muted text-xs px-2 py-1.5 rounded-l border">CAD</span>
                    <Input
                      className="h-8 text-xs rounded-l-none flex-1"
                      type="number"
                      step="0.01"
                      max={(selectedPayment.amount ?? 0) - (selectedPayment.amountRefunded ?? 0)}
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Refunded On */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <Label className="md:w-24 text-xs text-primary">Refunded On*</Label>
                    <Input
                      className="h-8 text-xs flex-1"
                      type="date"
                      value={refundDate}
                      onChange={(e) => setRefundDate(e.target.value)}
                    />
                  </div>

                  {/* Payment Mode */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <Label className="md:w-24 text-xs text-muted-foreground">Payment Mode</Label>
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Reference# */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <Label className="md:w-24 text-xs text-muted-foreground">Reference#</Label>
                    <Input
                      className="h-8 text-xs flex-1"
                      value={refundReference}
                      onChange={(e) => setRefundReference(e.target.value)}
                    />
                  </div>

                  {/* From Account */}
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

                {/* Description */}
                <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4">
                  <Label className="md:w-24 text-xs text-muted-foreground md:pt-2">Description</Label>
                  <Textarea
                    className="text-xs flex-1"
                    rows={3}
                    placeholder="Enter description for this refund..."
                    value={refundDescription}
                    onChange={(e) => setRefundDescription(e.target.value)}
                  />
                </div>
              </div>

              {refundError && <p className="text-xs text-destructive mt-2">{refundError}</p>}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4">
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={handleRefund} disabled={refundSaving}>
                  {refundSaving ? "Processing…" : "Save"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowRefundForm(false)} disabled={refundSaving}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Edit Payment Form View (Full Page)
  if (showEditForm && selectedPayment) {
    return (
      <DashboardLayout activeItem="Sales" activeSubItem="Payments Received">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b bg-background sticky top-0 z-10 shrink-0">
            <h1 className="text-base font-medium">Edit Payment</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs bg-transparent">
                First Service Residen...
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowEditForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-auto p-4">
            {/* Info Banner */}
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded px-3 py-2 text-xs mb-4">
              <Info className="w-4 h-4 text-blue-500 shrink-0" />
              <p className="flex-1">
                Encourage faster payments, reduce outstanding invoices and improve cash flow by offering discounts to customers who pay within the specified period.{" "}
                <Link href="#" className="text-primary">Enable Early Payment Discount Now</Link>
              </p>
              <button><X className="w-3 h-3 text-muted-foreground" /></button>
            </div>

            <div className="space-y-4 max-w-2xl">
              {/* Customer Name (read-only) */}
              <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                <Label className="text-xs text-primary">Customer Name</Label>
                <Input className="h-8 text-xs bg-muted" value={selectedPayment.customerName} readOnly />
              </div>

              {/* Amount Received */}
              <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                <Label className="text-xs text-primary">Amount Received*</Label>
                <div className="flex items-center gap-1">
                  <span className="bg-muted text-xs px-2 py-1.5 rounded-l border">CAD</span>
                  <Input
                    className="h-8 text-xs rounded-l-none flex-1"
                    type="number"
                    step="0.01"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                  />
                </div>
              </div>

              {/* Payment Date */}
              <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                <Label className="text-xs text-primary">Payment Date*</Label>
                <Input
                  className="h-8 text-xs"
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                />
              </div>

              {/* Payment # (read-only) */}
              <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                <Label className="text-xs text-primary">Payment #</Label>
                <div className="flex items-center gap-1">
                  <Input className="h-8 text-xs flex-1 bg-muted" value={selectedPayment.paymentNumber} readOnly />
                </div>
              </div>

              {/* Payment Mode */}
              <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                <Label className="text-xs text-muted-foreground">Payment Mode</Label>
                <Select value={editMode} onValueChange={setEditMode}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cheque" className="text-xs">Cheque</SelectItem>
                    <SelectItem value="Credit Card" className="text-xs">Credit Card</SelectItem>
                    <SelectItem value="Debit Card" className="text-xs">Debit Card</SelectItem>
                    <SelectItem value="Bank Transfer" className="text-xs">Bank Transfer</SelectItem>
                    <SelectItem value="Cash" className="text-xs">Cash</SelectItem>
                    <SelectItem value="Other" className="text-xs">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Deposit To */}
              <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                <Label className="text-xs text-primary">Deposit To*</Label>
                <Select value={editDepositTo} onValueChange={setEditDepositTo}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TD CAD" className="text-xs">TD CAD</SelectItem>
                    <SelectItem value="TD USD" className="text-xs">TD USD</SelectItem>
                    <SelectItem value="Petty Cash" className="text-xs">Petty Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reference# */}
              <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                <Label className="text-xs text-muted-foreground">Reference#</Label>
                <Input
                  className="h-8 text-xs"
                  value={editReferenceNumber}
                  onChange={(e) => setEditReferenceNumber(e.target.value)}
                />
              </div>
            </div>

            {editError && <p className="text-xs text-destructive mb-2">{editError}</p>}

            {/* Unpaid Invoices Section */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium">Unpaid Invoices</h3>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px]">
                    <FileText className="w-3 h-3 mr-1" /> Filter by Date Range <ChevronDown className="w-2.5 h-2.5 ml-1" />
                  </Button>
                </div>
                <Button variant="link" className="text-xs h-auto p-0 text-primary">Clear Applied Amount</Button>
              </div>

                <div className="border rounded overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-[10px] font-medium py-1.5 px-2 w-[120px]">DATE</TableHead>
                      <TableHead className="text-[10px] font-medium py-1.5 px-2 w-[120px]">INVOICE NUMBER</TableHead>
                      <TableHead className="text-[10px] font-medium py-1.5 px-2 text-right w-[120px]">INVOICE AMOUNT</TableHead>
                      <TableHead className="text-[10px] font-medium py-1.5 px-2 text-right w-[100px]">AMOUNT DUE</TableHead>
                      <TableHead className="text-[10px] font-medium py-1.5 px-2 w-[140px]">PAYMENT RECEIVED ON <HelpCircle className="w-2.5 h-2.5 inline" /></TableHead>
                      <TableHead className="text-[10px] font-medium py-1.5 px-2 text-right w-[100px]">PAYMENT</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="py-1.5 px-2 text-xs w-[120px]">
                        <div>{selectedPayment.invoiceDate ? formatPaymentDate(selectedPayment.invoiceDate) : "—"}</div>
                        <div className="text-[10px] text-muted-foreground">Due Date: {selectedPayment.invoiceDate ? formatPaymentDate(selectedPayment.invoiceDate) : "—"}</div>
                      </TableCell>
                      <TableCell className="py-1.5 px-2 text-xs text-primary w-[120px]">{selectedPayment.invoiceNumber || "—"}</TableCell>
                      <TableCell className="py-1.5 px-2 text-xs text-right w-[120px]">{(selectedPayment.invoiceAmount ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="py-1.5 px-2 text-xs text-right w-[100px]">{(selectedPayment.invoiceAmount ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="py-1.5 px-2 w-[140px]">
                        <Input
                          type="date"
                          className="h-7 text-xs"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="py-1.5 px-2 w-[100px]">
                        <Input
                          type="number"
                          step="0.01"
                          className="h-7 text-xs text-right"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <p className="text-[10px] text-primary mt-1">**List contains only SENT invoices</p>

              {/* Totals */}
              <div className="flex justify-between mt-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium">Total</span>
                  <span>{selectedPayment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="w-64 space-y-1 border rounded p-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Amount Received :</span>
                    <span>{selectedPayment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Amount used for Payments :</span>
                    <span>{selectedPayment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Amount Refunded :</span>
                    <span>{(selectedPayment.amountRefunded ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <span className="text-orange-500">&#9888;</span> Amount in Excess:
                    </span>
                    <span>$ 0.00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mt-4 max-w-2xl">
              <Label className="text-xs text-muted-foreground">Notes (Internal use. Not visible to customer)</Label>
              <Textarea
                className="text-xs mt-1"
                rows={2}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
              />
            </div>

            {/* Attachments */}
            <div className="mt-4 max-w-2xl">
              <Label className="text-xs text-muted-foreground">Attachments</Label>
              <div className="mt-1">
                <Button variant="outline" size="sm" className="h-7 text-xs bg-transparent">
                  <Upload className="w-3 h-3 mr-1" /> Upload File <ChevronDown className="w-2.5 h-2.5 ml-1" />
                </Button>
                <p className="text-[10px] text-muted-foreground mt-1">You can upload a maximum of 5 files, 5MB each</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-6 pt-4 border-t max-w-2xl">
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={handleSaveEdit} disabled={editSaving}>
                {editSaving ? "Saving…" : "Save"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowEditForm(false)} disabled={editSaving}>Cancel</Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Payment Detail View (Split Panel)
  if (selectedPayment) {
    return (
      <DashboardLayout activeItem="Sales" activeSubItem="Payments Received">
        <div className="flex flex-col md:flex-row h-auto md:h-[calc(100vh-120px)] -m-3">
          {/* Left Panel - Payment List */}
          <div className="w-full md:w-[240px] border-b md:border-b-0 md:border-r flex flex-col shrink-0 bg-background max-h-[280px] md:max-h-none">
            <div className="flex items-center justify-between px-2 py-1.5 border-b">
              <div className="flex items-center gap-1">
                <h1 className="text-xs font-medium">All Received Pa...</h1>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-1">
                <Link href="/sales/payments/new">
                  <Button size="icon" className="h-6 w-6 bg-primary hover:bg-primary/90">
                    <Plus className="w-3 h-3" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className={`px-2 py-1.5 border-b cursor-pointer hover:bg-muted/30 transition-colors ${selectedPayment.id === payment.id ? "bg-muted/50" : ""}`}
                  onClick={() => { setSelectedPayment(payment); fetchPaymentDetail(payment.id) }}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex items-start gap-1.5 min-w-0 flex-1">
                      <Checkbox className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{payment.customerName}</p>
                        <p className="text-[10px] text-muted-foreground">{payment.paymentNumber} <FileText className="w-2.5 h-2.5 inline" /> • {formatPaymentDate(payment.date)}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">{payment.mode}</span>
                          <HelpCircle className="w-2.5 h-2.5 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <p className="text-xs font-semibold">${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      <Lock className="w-3 h-3 text-muted-foreground mt-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Payment Detail */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <h1 className="text-sm font-medium">{selectedPayment.paymentNumber}</h1>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Lock className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Monitor className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedPayment(null)}>
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 px-3 py-1.5 border-b">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] px-2"
                onClick={() => {
                  setEditReferenceNumber(selectedPayment.referenceNumber ?? "")
                  setEditNotes(selectedPayment.notes ?? "")
                  setEditDate(selectedPayment.date?.slice(0, 10) ?? "")
                  setEditMode(selectedPayment.mode ?? "Cheque")
                  setEditDepositTo(selectedPayment.depositTo ?? "TD CAD")
                  setEditAmount(String(selectedPayment.amount ?? 0))
                  setEditError(null)
                  setShowEditForm(true)
                }}
              >
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
                  if (!files || files.length === 0 || !selectedPayment?.id) return
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
                      const res = await fetch(`${API_BASE}/api/zoho/payments/${selectedPayment.id}/attachments/`, {
                        method: "POST",
                        body: formData,
                        credentials: "include",
                      })
                      const data = await res.json()
                      if (data?.attachments) {
                        setPaymentAttachments(data.attachments)
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
                Attach {paymentAttachments.length > 0 && `(${paymentAttachments.length})`}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] px-2"
                onClick={() => {
                  setEmailTo(selectedPayment.customerEmail || "")
                  setEmailSubject(`Payment Receipt #${selectedPayment.paymentNumber} from Mekco Supply Inc.`)
                  setEmailMessage("")
                  setEmailAttachPdf(true)
                  setEmailError(null)
                  setShowEmailForm(true)
                }}
              >
                <Mail className="w-3 h-3 mr-1" /> Send Email
              </Button>
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
                      const origin = typeof window !== "undefined" ? window.location.origin : ""
                      window.open(`${origin}/api/zoho/payments/${selectedPayment.id}/pdf/`, "_blank")
                    }}
                  >
                    <FileText className="w-3 h-3 mr-2" /> PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-[11px] py-1.5 cursor-pointer"
                    onClick={() => {
                      const doc = getPaymentReceiptDocument(selectedPayment)
                      const w = window.open("", "_blank")
                      if (w) {
                        w.document.write(doc)
                        w.document.close()
                        w.focus()
                        w.print()
                      }
                    }}
                  >
                    <Printer className="w-3 h-3 mr-2" /> Print
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] px-2"
                onClick={() => {
                  const availableForRefund = (selectedPayment.amount ?? 0) - (selectedPayment.amountRefunded ?? 0)
                  setRefundAmount(String(availableForRefund > 0 ? availableForRefund : 0))
                  setRefundDate(new Date().toISOString().slice(0, 10))
                  setRefundMode(selectedPayment.mode || "Cheque")
                  setRefundReference("")
                  setRefundFromAccount(selectedPayment.depositTo || "TD CAD")
                  setRefundDescription("")
                  setRefundError(null)
                  setShowRefundForm(true)
                }}
                disabled={(selectedPayment.amount ?? 0) <= (selectedPayment.amountRefunded ?? 0)}
              >
                <RotateCcw className="w-3 h-3 mr-1" /> Refund
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 min-w-0">
              {/* Payment Receipt Card */}
              <div className="border rounded-lg bg-white shadow-sm max-w-2xl mx-auto w-full">
                <div className="p-6">
                  {/* Header with Logo */}
                  <div className="flex gap-6 mb-6">
                    <div className="w-28 h-16 rounded flex items-center justify-center overflow-hidden bg-white shrink-0">
                      <img alt="Mekco Supply Inc." width={112} height={64} className="object-contain w-full h-full p-1" src="/Mekco-Supply-logo-300px.png" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Mekco Supply Inc.</p>
                      <p className="text-xs text-muted-foreground">16-110 West Beaver Creek Rd.</p>
                      <p className="text-xs text-muted-foreground">Richmond Hill, Ontario L4B 1J9</p>
                    </div>
                  </div>

                  <hr className="my-6" />

                  {/* Payment Receipt Title */}
                  <h2 className="text-center text-sm font-medium tracking-wider mb-6">PAYMENT RECEIPT</h2>

                  {/* Payment Info */}
                  <div className="flex justify-between mb-6">
                    <div className="space-y-3">
                      <div className="flex gap-4">
                        <span className="text-xs text-muted-foreground w-28">Payment Date</span>
                        <span className="text-xs">{formatPaymentDate(selectedPayment.date)}</span>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-xs text-muted-foreground w-28">Reference Number</span>
                        <span className="text-xs">{selectedPayment.referenceNumber || "-"}</span>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-xs text-muted-foreground w-28">Payment Mode</span>
                        <span className="text-xs">{selectedPayment.mode}</span>
                      </div>
                    </div>

                    {/* Amount Box */}
                    <div className="bg-teal-600 text-white rounded px-6 py-4 text-center">
                      <p className="text-xs mb-1">Amount Received</p>
                      <p className="text-xl font-semibold">${selectedPayment.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>

                  {/* Received From */}
                  <div className="mb-6">
                    <p className="text-xs text-muted-foreground mb-1">Received From</p>
                    {selectedPayment.customerId != null ? (
                      <Link href={`/sales/customers?id=${selectedPayment.customerId}`} className="text-sm text-primary font-medium hover:underline">
                        {selectedPayment.customerName}
                      </Link>
                    ) : (
                      <span className="text-sm font-medium">{selectedPayment.customerName}</span>
                    )}
                  </div>

                  <hr className="my-6" />

                  {/* Payment For */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Payment for</h3>
                    <div className="border rounded overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead className="text-[10px] font-medium py-1.5 px-2">Invoice Number</TableHead>
                            <TableHead className="text-[10px] font-medium py-1.5 px-2">Invoice Date</TableHead>
                            <TableHead className="text-[10px] font-medium py-1.5 px-2 text-right">Invoice Amount</TableHead>
                            <TableHead className="text-[10px] font-medium py-1.5 px-2 text-right">Payment Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="py-1.5 px-2">
                              {selectedPayment.invoiceId ? (
                                <Link href={`/sales/invoices?id=${selectedPayment.invoiceId}`} className="text-xs text-primary hover:underline">
                                  {selectedPayment.invoiceNumber}
                                </Link>
                              ) : (
                                <span className="text-xs">{selectedPayment.invoiceNumber || "—"}</span>
                              )}
                            </TableCell>
                            <TableCell className="py-1.5 px-2 text-xs">{selectedPayment.invoiceDate ? formatPaymentDate(selectedPayment.invoiceDate) : "—"}</TableCell>
                            <TableCell className="py-1.5 px-2 text-xs text-right">${(selectedPayment.invoiceAmount ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                            <TableCell className="py-1.5 px-2 text-xs text-right">${selectedPayment.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </div>

              {/* PDF Template */}
              <div className="flex justify-center items-center gap-2 mt-3 text-xs">
                <span className="text-muted-foreground">{"PDF Template : 'Elite Template'"}</span>
                <Link href="#" className="text-primary">Change</Link>
              </div>

              {/* More Information */}
              <div className="mt-6 max-w-2xl mx-auto">
                <h3 className="text-sm font-medium mb-3">More Information</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-24">Deposit To</span>
                    <span>: <Link href="#" className="text-primary">{selectedPayment.depositTo}</Link></span>
                  </div>
                  {selectedPayment.notes && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-24">Notes</span>
                      <span>: {selectedPayment.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Attachments Section */}
              {paymentAttachments.length > 0 && (
                <div className="mt-6 max-w-2xl mx-auto">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Paperclip className="w-3.5 h-3.5" />
                    <h3 className="text-sm font-medium">Attachments ({paymentAttachments.length})</h3>
                  </div>
                  <div className="border rounded overflow-hidden">
                    <div className="divide-y">
                      {paymentAttachments.map((att) => (
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
                                await fetch(`${API_BASE}/api/zoho/payments/${selectedPayment.id}/attachments/${att.id}/`, {
                                  method: "DELETE",
                                  credentials: "include",
                                })
                                setPaymentAttachments((prev) => prev.filter((a) => a.id !== att.id))
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

              {/* Refund History Section */}
              {(selectedPayment.refunds && selectedPayment.refunds.length > 0) && (
                <div className="mt-6 max-w-2xl mx-auto">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium">Refund History</h3>
                    <span className="text-xs text-muted-foreground">
                      Total Refunded: ${(selectedPayment.amountRefunded ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="border rounded overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="text-[10px] font-medium py-1.5 px-3">REFUND #</TableHead>
                          <TableHead className="text-[10px] font-medium py-1.5 px-3">DATE</TableHead>
                          <TableHead className="text-[10px] font-medium py-1.5 px-3">MODE</TableHead>
                          <TableHead className="text-[10px] font-medium py-1.5 px-3">FROM ACCOUNT</TableHead>
                          <TableHead className="text-[10px] font-medium py-1.5 px-3">REFERENCE</TableHead>
                          <TableHead className="text-[10px] font-medium py-1.5 px-3 text-right">AMOUNT</TableHead>
                          <TableHead className="text-[10px] font-medium py-1.5 px-3">STATUS</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedPayment.refunds.map((refund: Refund) => (
                          <TableRow key={refund.id}>
                            <TableCell className="py-1.5 px-3 text-xs text-primary font-medium">{refund.refundNumber}</TableCell>
                            <TableCell className="py-1.5 px-3 text-xs">{formatPaymentDate(refund.date)}</TableCell>
                            <TableCell className="py-1.5 px-3 text-xs">{refund.mode}</TableCell>
                            <TableCell className="py-1.5 px-3 text-xs">{refund.fromAccount || "—"}</TableCell>
                            <TableCell className="py-1.5 px-3 text-xs">{refund.referenceNumber || "—"}</TableCell>
                            <TableCell className="py-1.5 px-3 text-xs text-right text-red-600">
                              -${refund.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="py-1.5 px-3">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                refund.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                                refund.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                                "bg-gray-100 text-gray-700"
                              }`}>
                                {refund.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {selectedPayment.refunds.length > 0 && selectedPayment.refunds[0].description && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <span className="font-medium">Latest refund note:</span> {selectedPayment.refunds[0].description}
                    </div>
                  )}
                </div>
              )}

              {/* Payment Summary */}
              {(selectedPayment.amountRefunded ?? 0) > 0 && (
                <div className="mt-6 max-w-2xl mx-auto">
                  <div className="border rounded p-4 bg-muted/20">
                    <h4 className="text-sm font-medium mb-3">Payment Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Original Amount:</span>
                        <span>${selectedPayment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Amount Refunded:</span>
                        <span className="text-red-600">-${(selectedPayment.amountRefunded ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between text-xs font-medium">
                        <span>Net Amount:</span>
                        <span>${((selectedPayment.amount ?? 0) - (selectedPayment.amountRefunded ?? 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Available for Refund:</span>
                        <span className="text-teal-600">${((selectedPayment.amount ?? 0) - (selectedPayment.amountRefunded ?? 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Journal Section */}
              <div className="mt-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-between border-b">
                  <button className="text-xs font-medium px-3 py-2 border-b-2 border-primary text-primary">Journal</button>
                  <div className="flex items-center gap-1">
                    <Button
                      variant={journalView === "accrual" ? "default" : "outline"}
                      size="sm"
                      className="h-6 text-[10px] px-2"
                      onClick={() => setJournalView("accrual")}
                    >
                      Accrual
                    </Button>
                    <Button
                      variant={journalView === "cash" ? "default" : "outline"}
                      size="sm"
                      className="h-6 text-[10px] px-2"
                      onClick={() => setJournalView("cash")}
                    >
                      Cash
                    </Button>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2">
                    Amount is displayed in your base currency{" "}
                    <span className="bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded text-[10px] font-medium">CAD</span>
                  </p>
                  <h4 className="text-sm font-medium mb-2">Invoice Payment - {selectedPayment.invoiceNumber}</h4>
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
                          <TableCell className="py-1.5 px-3 text-xs text-right">0.00</TableCell>
                          <TableCell className="py-1.5 px-3 text-xs text-right">{selectedPayment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="py-1.5 px-3 text-xs">{selectedPayment.depositTo}</TableCell>
                          <TableCell className="py-1.5 px-3 text-xs text-right">{selectedPayment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="py-1.5 px-3 text-xs text-right">0.00</TableCell>
                        </TableRow>
                        <TableRow className="bg-muted/20 font-medium">
                          <TableCell className="py-1.5 px-3 text-xs"></TableCell>
                          <TableCell className="py-1.5 px-3 text-xs text-right">{selectedPayment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="py-1.5 px-3 text-xs text-right">{selectedPayment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
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

  // Default List View
  return (
    <DashboardLayout activeItem="Sales" activeSubItem="Payments Received">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <h1 className="text-xs font-medium">All Received Payments</h1>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-1.5">
          <Link href="/sales/payments/new">
            <Button size="sm" className="h-7 text-xs bg-primary hover:bg-primary/90">
              <Plus className="w-3 h-3 mr-1" /> New
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreHorizontal className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {listError && (
        <p className="text-sm text-destructive mb-2">{listError}</p>
      )}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading payments…</p>
      ) : (
      <div className="bg-card rounded-lg border shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8 py-2 px-2"><Checkbox className="h-3.5 w-3.5" /></TableHead>
              <TableHead className="text-[10px] font-medium py-2 px-2">Date</TableHead>
              <TableHead className="text-[10px] font-medium py-2 px-2">Payment #</TableHead>
              <TableHead className="text-[10px] font-medium py-2 px-2">Reference Number</TableHead>
              <TableHead className="text-[10px] font-medium py-2 px-2">Customer Name</TableHead>
              <TableHead className="text-[10px] font-medium py-2 px-2">Invoice#</TableHead>
              <TableHead className="text-[10px] font-medium py-2 px-2">Mode</TableHead>
              <TableHead className="text-[10px] font-medium py-2 px-2 text-right">Amount</TableHead>
              <TableHead className="text-[10px] font-medium py-2 px-2 text-right">Unused Amount</TableHead>
              <TableHead className="text-[10px] font-medium py-2 px-2">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={10} className="py-8 text-center text-sm text-muted-foreground">
                  No payments yet. Create one from the New button or record a payment on an invoice.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id} className="hover:bg-muted/30">
                  <TableCell className="py-1.5 px-2"><Checkbox className="h-3.5 w-3.5" /></TableCell>
                  <TableCell className="py-1.5 px-2 text-xs">{formatPaymentDate(payment.date)}</TableCell>
                  <TableCell className="py-1.5 px-2">
                    <button onClick={() => { setSelectedPayment(payment); fetchPaymentDetail(payment.id) }} className="text-xs text-teal-600 hover:underline">
                      {payment.paymentNumber}
                    </button>
                  </TableCell>
                  <TableCell className="py-1.5 px-2 text-xs">{payment.referenceNumber || "—"}</TableCell>
                  <TableCell className="py-1.5 px-2 text-xs">{payment.customerName}</TableCell>
                  <TableCell className="py-1.5 px-2 text-xs">{payment.invoiceNumber || "—"}</TableCell>
                  <TableCell className="py-1.5 px-2 text-xs">{payment.mode}</TableCell>
                  <TableCell className="py-1.5 px-2 text-xs text-right">${payment.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell className="py-1.5 px-2 text-xs text-right">${(payment.unusedAmount ?? 0).toFixed(2)}</TableCell>
                  <TableCell className="py-1.5 px-2 text-xs text-teal-600">{payment.status}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      )}
    </DashboardLayout>
  )
}
