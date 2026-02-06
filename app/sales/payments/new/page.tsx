"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { X, Settings, Upload, HelpCircle, Search, Paperclip, Trash2, Loader2 } from "lucide-react"
import type { Invoice } from "@/lib/invoices-types"

const API_BASE = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_API_ORIGIN || ""

interface CustomerOption {
  id: number
  name: string
  companyName: string
  email?: string
}

const PAYMENT_MODES = ["Cheque", "Bank Transfer", "Credit Card", "Debit Card", "Cash", "Other"] as const
const DEPOSIT_OPTIONS = ["TD CAD", "TD USD", "Petty Cash"] as const

function formatDate(iso: string): string {
  if (!iso || iso.length < 10) return iso
  try {
    return new Date(iso.slice(0, 10) + "Z").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

export default function RecordPaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [customerSearchQuery, setCustomerSearchQuery] = useState("")
  const [customerResults, setCustomerResults] = useState<CustomerOption[]>([])
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("")
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerOption | null>(null)
  const [unpaidInvoices, setUnpaidInvoices] = useState<Invoice[]>([])
  const [invoicesLoading, setInvoicesLoading] = useState(false)
  const [nextNumber, setNextNumber] = useState("")
  const [nextNumberLoading, setNextNumberLoading] = useState(true)
  const [paymentDate, setPaymentDate] = useState("")
  const [paymentNumber, setPaymentNumber] = useState("")
  const [mode, setMode] = useState<string>("Cheque")
  const [depositTo, setDepositTo] = useState<string>("TD CAD")
  const [referenceNumber, setReferenceNumber] = useState("")
  const [notes, setNotes] = useState("")
  // For each invoice row: amount to apply (user input). Key = invoice id.
  const [paymentByInvoiceId, setPaymentByInvoiceId] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const customerDropdownRef = useRef<HTMLDivElement>(null)
  // Attachments state
  const attachmentFileInputRef = useRef<HTMLInputElement>(null)
  const [attachments, setAttachments] = useState<File[]>([])
  const [attachmentUploading, setAttachmentUploading] = useState(false)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setCustomerDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Pre-select customer when ?customerId=X in URL
  useEffect(() => {
    const customerIdParam = searchParams.get("customerId")
    if (customerIdParam) {
      fetch(`${API_BASE}/api/zoho/customers/${customerIdParam}/`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.id && !data.error) {
            const name = data.companyName || data.name || ""
            setSelectedCustomerId(String(data.id))
            setSelectedCustomer({ id: data.id, name: data.name || "", companyName: data.companyName || name, email: data.email || "" })
            setCustomerSearchQuery("")
          }
        })
        .catch(() => {})
    }
  }, [searchParams])

  useEffect(() => {
    let cancelled = false
    async function fetchNext() {
      try {
        const res = await fetch(`${API_BASE}/api/zoho/payments/next-number/`)
        const data = await res.json()
        if (!cancelled && data.nextNumber != null) {
          setNextNumber(String(data.nextNumber))
          setPaymentNumber(String(data.nextNumber))
        }
      } finally {
        if (!cancelled) setNextNumberLoading(false)
      }
    }
    fetchNext()
    return () => { cancelled = true }
  }, [])

  // Debounced customer search
  useEffect(() => {
    const q = customerSearchQuery.trim()
    if (!q) {
      setCustomerResults([])
      return
    }
    const timer = setTimeout(() => {
      fetch(`${API_BASE}/api/zoho/customers/?search=${encodeURIComponent(q)}&limit=20`)
        .then((r) => r.json())
        .then((data) => {
          setCustomerResults(data.customers ?? [])
        })
        .catch(() => setCustomerResults([]))
    }, 300)
    return () => clearTimeout(timer)
  }, [customerSearchQuery])

  useEffect(() => {
    if (!selectedCustomerId) {
      setUnpaidInvoices([])
      setPaymentByInvoiceId({})
      return
    }
    let cancelled = false
    setInvoicesLoading(true)
    fetch(`${API_BASE}/api/zoho/invoices/?customerId=${encodeURIComponent(selectedCustomerId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        const list: Invoice[] = (data.invoices ?? []).filter(
          (inv: Invoice) => (inv.balanceDue ?? 0) > 0
        )
        setUnpaidInvoices(list)
        setPaymentByInvoiceId({})
      })
      .finally(() => {
        if (!cancelled) setInvoicesLoading(false)
      })
    return () => { cancelled = true }
  }, [selectedCustomerId])

  // Default payment date to today (YYYY-MM-DD)
  useEffect(() => {
    if (!paymentDate) {
      const today = new Date()
      setPaymentDate(today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0"))
    }
  }, [paymentDate])

  function setPaymentForInvoice(invoiceId: string, value: string) {
    setPaymentByInvoiceId((prev) => ({ ...prev, [invoiceId]: value }))
  }

  function payInFull(inv: Invoice) {
    const due = (inv.balanceDue ?? inv.total ?? 0)
    setPaymentByInvoiceId((prev) => ({ ...prev, [inv.id]: due > 0 ? String(due) : "" }))
  }

  const totalApplied = unpaidInvoices.reduce((sum, inv) => {
    const v = paymentByInvoiceId[inv.id]
    const num = parseFloat(v ?? "0") || 0
    return sum + num
  }, 0)

  // For v1 we support one invoice per payment: pick the first invoice with amount > 0
  const appliedInvoices = unpaidInvoices.filter((inv) => {
    const v = paymentByInvoiceId[inv.id]
    return (parseFloat(v ?? "0") || 0) > 0
  })
  const singleInvoice = appliedInvoices.length === 1 ? appliedInvoices[0] : appliedInvoices.length > 1 ? appliedInvoices[0] : null
  const singleAmount = singleInvoice ? (parseFloat(paymentByInvoiceId[singleInvoice.id] ?? "0") || 0) : 0

  async function handleSave() {
    setSaveError(null)
    if (!selectedCustomerId) {
      setSaveError("Please select a customer.")
      return
    }
    if (!singleInvoice || singleAmount <= 0) {
      setSaveError("Please apply a payment amount to exactly one unpaid invoice.")
      return
    }
    const dateToSend = paymentDate && paymentDate.length >= 10 ? paymentDate.slice(0, 10) : new Date().toISOString().slice(0, 10)
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/api/zoho/payments/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: singleInvoice.id,
          amount: singleAmount,
          date: dateToSend,
          referenceNumber: referenceNumber.trim() || undefined,
          mode: mode || "Cheque",
          depositTo: depositTo.trim() || undefined,
          notes: notes.trim() || undefined,
          paymentNumber: paymentNumber.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create payment")
      
      // Upload attachments if any
      if (attachments.length > 0 && data.id) {
        setAttachmentUploading(true)
        for (const file of attachments) {
          const formData = new FormData()
          formData.append("file", file)
          formData.append("title", file.name)
          formData.append("document_type", "receipt")
          try {
            await fetch(`${API_BASE}/api/zoho/payments/${data.id}/attachments/`, {
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
      
      router.push(`/sales/payments?id=${data.id}`)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save payment")
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout activeItem="Sales" activeSubItem="Payments Received">
      <div className="flex-1 overflow-auto bg-background -m-3">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-base font-medium">Record Payment</h1>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => router.back()}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Customer - searchable */}
            <div className="flex items-center gap-3">
              <Label className="w-32 text-xs text-primary shrink-0">Customer Name*</Label>
              <div className="flex-1 max-w-lg relative" ref={customerDropdownRef}>
                <div className="flex gap-1">
                  <Input
                    className="flex-1 h-8 text-xs"
                    value={selectedCustomer ? (selectedCustomer.companyName || selectedCustomer.name) : customerSearchQuery}
                    onChange={(e) => {
                      const v = e.target.value
                      setCustomerSearchQuery(v)
                      if (selectedCustomerId) {
                        setSelectedCustomerId("")
                        setSelectedCustomer(null)
                      }
                      setCustomerDropdownOpen(!!v.trim())
                    }}
                    onFocus={() => {
                      if (customerSearchQuery.trim()) setCustomerDropdownOpen(true)
                      if (selectedCustomer) setCustomerSearchQuery(selectedCustomer.companyName || selectedCustomer.name || "")
                    }}
                    placeholder="Type to search customers..."
                  />
                  <Button type="button" size="icon" className="h-8 w-8 shrink-0 bg-primary hover:bg-primary/90" aria-label="Search customers">
                    <Search className="w-3.5 h-3.5" />
                  </Button>
                </div>
                {customerDropdownOpen && customerResults.length > 0 && (
                  <ul className="absolute z-50 top-full left-0 mt-1 w-full min-w-[280px] rounded-md border bg-popover text-popover-foreground shadow-md max-h-60 overflow-auto">
                    {customerResults.map((c) => (
                      <li
                        key={c.id}
                        className="px-3 py-2 text-sm cursor-pointer hover:bg-muted/80 border-b last:border-0"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setSelectedCustomer(c)
                          setSelectedCustomerId(String(c.id))
                          setCustomerSearchQuery("")
                          setCustomerResults([])
                          setCustomerDropdownOpen(false)
                        }}
                      >
                        <div className="font-medium">{c.companyName || c.name || `Customer ${c.id}`}</div>
                        {(c.name !== c.companyName || c.email) && (
                          <div className="text-muted-foreground text-xs truncate mt-0.5">
                            {[c.companyName && c.name !== c.companyName ? c.name : null, c.email].filter(Boolean).join(" · ")}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {selectedCustomer && (
                <div className="bg-primary text-primary-foreground px-2.5 py-1 rounded text-xs flex items-center gap-1.5 shrink-0">
                  {selectedCustomer.companyName || selectedCustomer.name}
                </div>
              )}
            </div>

            {/* Payment # */}
            <div className="flex items-center gap-3">
              <Label className="w-32 text-xs text-primary shrink-0">Payment #*</Label>
              <div className="flex items-center gap-1 max-w-[200px]">
                <Input
                  value={paymentNumber}
                  onChange={(e) => setPaymentNumber(e.target.value)}
                  className="flex-1 h-8 text-xs"
                  placeholder={nextNumberLoading ? "Loading…" : "155"}
                />
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" disabled>
                  <Settings className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Payment Date */}
            <div className="flex items-center gap-3">
              <Label className="w-32 text-xs text-primary shrink-0">Payment Date*</Label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="h-8 text-xs max-w-[200px]"
              />
            </div>

            {/* Payment Mode */}
            <div className="flex items-center gap-3">
              <Label className="w-32 text-xs text-muted-foreground shrink-0">Payment Mode</Label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger className="h-8 text-xs max-w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_MODES.map((m) => (
                    <SelectItem key={m} value={m} className="text-xs">
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Deposit To */}
            <div className="flex items-center gap-3">
              <Label className="w-32 text-xs text-muted-foreground shrink-0">Deposit To</Label>
              <Select value={depositTo} onValueChange={setDepositTo}>
                <SelectTrigger className="h-8 text-xs max-w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPOSIT_OPTIONS.map((d) => (
                    <SelectItem key={d} value={d} className="text-xs">
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reference# */}
            <div className="flex items-center gap-3">
              <Label className="w-32 text-xs text-muted-foreground shrink-0">Reference#</Label>
              <Input
                className="h-8 text-xs max-w-[200px]"
                placeholder=""
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </div>

            {/* Unpaid Invoices */}
            <div className="pt-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium">Unpaid Invoices</h3>
              </div>
              {!selectedCustomerId ? (
                <p className="text-xs text-muted-foreground">Select a customer to see unpaid invoices.</p>
              ) : invoicesLoading ? (
                <p className="text-xs text-muted-foreground">Loading invoices…</p>
              ) : (
                <div className="border rounded overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-[10px] font-medium py-1.5 px-2">DATE</TableHead>
                        <TableHead className="text-[10px] font-medium py-1.5 px-2">INVOICE NUMBER</TableHead>
                        <TableHead className="text-[10px] font-medium py-1.5 px-2 text-right">INVOICE AMOUNT</TableHead>
                        <TableHead className="text-[10px] font-medium py-1.5 px-2 text-right">AMOUNT DUE</TableHead>
                        <TableHead className="text-[10px] font-medium py-1.5 px-2">
                          PAYMENT RECEIVED ON <HelpCircle className="w-2.5 h-2.5 inline ml-0.5" />
                        </TableHead>
                        <TableHead className="text-[10px] font-medium py-1.5 px-2 text-right">PAYMENT</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unpaidInvoices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="py-4 text-center text-xs text-muted-foreground">
                            No unpaid invoices for this customer.
                          </TableCell>
                        </TableRow>
                      ) : (
                        unpaidInvoices.map((inv) => (
                          <TableRow key={inv.id}>
                            <TableCell className="py-1.5 px-2">
                              <div className="text-xs">{formatDate(inv.date)}</div>
                              <div className="text-[10px] text-muted-foreground">Due: {inv.dueDate ? formatDate(inv.dueDate) : "—"}</div>
                            </TableCell>
                            <TableCell className="py-1.5 px-2 text-xs">
                              <Link href={`/sales/invoices?id=${inv.id}`} className="text-primary hover:underline">
                                {inv.invoiceNumber}
                              </Link>
                            </TableCell>
                            <TableCell className="py-1.5 px-2 text-xs text-right">
                              {(inv.total ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="py-1.5 px-2 text-xs text-right">
                              {(inv.balanceDue ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="py-1.5 px-2">
                              <Input
                                type="date"
                                value={paymentDate}
                                onChange={(e) => setPaymentDate(e.target.value)}
                                className="h-7 text-xs w-[130px]"
                              />
                            </TableCell>
                            <TableCell className="py-1.5 px-2">
                              <div className="flex flex-col items-end gap-0.5">
                                <Input
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  className="h-7 text-xs text-right w-[100px]"
                                  value={paymentByInvoiceId[inv.id] ?? ""}
                                  onChange={(e) => setPaymentForInvoice(inv.id, e.target.value)}
                                  placeholder="0"
                                />
                                <Button
                                  variant="link"
                                  className="text-primary p-0 h-auto text-[10px]"
                                  onClick={() => payInFull(inv)}
                                >
                                  Pay in Full
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground mt-1">Apply payment to one invoice. Amount Due = balance remaining.</p>
            </div>

            {/* Summary */}
            <div className="flex justify-end pt-2">
              <div className="w-64 border rounded p-3 bg-muted/20">
                <div className="flex justify-between py-1 border-b text-xs">
                  <span className="font-medium">Total applied</span>
                  <span>{totalApplied.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="pt-2 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount used for Payments :</span>
                    <span>{totalApplied.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="flex items-start gap-3 pt-2">
              <Label className="w-32 text-xs text-muted-foreground pt-2 shrink-0">Notes</Label>
              <Textarea rows={2} className="text-xs resize-none flex-1 max-w-lg" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Internal use. Not visible to customer" />
            </div>

            {/* Attachments */}
            <div className="flex items-start gap-3 pt-2">
              <Label className="w-32 text-xs text-muted-foreground pt-2 shrink-0">Attachments</Label>
              <div className="flex-1 max-w-lg">
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

            {saveError && <p className="text-xs text-destructive">{saveError}</p>}
          </div>

          <div className="flex items-center gap-2 mt-4 pt-3 border-t">
            <Button size="sm" className="h-7 text-xs bg-primary hover:bg-primary/90" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => router.back()} disabled={saving}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
