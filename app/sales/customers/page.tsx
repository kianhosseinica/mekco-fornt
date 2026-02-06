"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, MoreHorizontal, X, ChevronDown, ChevronRight, ArrowUpDown, Import, Download, Settings, RotateCcw, Upload, HelpCircle, Mail, AlertTriangle, ExternalLink, Bookmark, Loader2, Search, FileText, Printer, Bold, Italic, Underline, Strikethrough, List, AlignLeft, Link2, ImagePlus, Eye, Pencil, Trash2, Copy, Paperclip } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const API_BASE = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_API_ORIGIN || ""

interface AddressEntry {
  type: string
  attention?: string
  street1?: string
  street2?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}
interface CommentEntry {
  id: number
  content: string
  created_at: string
}
interface DocumentEntry {
  id: number
  title: string
  document_type: string
  uploaded_at: string
  url: string
  filename: string
}
interface Customer {
  id?: number
  name: string
  companyName: string
  email: string
  workPhone: string
  receivables: number
  website?: string
  taxPreference?: string
  portalStatus?: string
  currency?: string
  customerType?: string
  addresses?: AddressEntry[]
  comments?: CommentEntry[]
  documents?: DocumentEntry[]
}

export default function CustomersPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const searchQuery = (searchParams.get("search") ?? "").trim()
  const customerIdParam = searchParams.get("id") ?? "" // Auto-select customer by ID
  const customerQuery = (searchParams.get("customer") ?? "").trim() // Auto-select customer by name (fallback)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCustomers, setTotalCustomers] = useState(0)
  const CUSTOMERS_PER_PAGE = 20
  const [showNewForm, setShowNewForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerType, setCustomerType] = useState("business")
  const [activeDetailTab, setActiveDetailTab] = useState("overview")
  const [invoicesOpen, setInvoicesOpen] = useState(true)
  const [paymentsOpen, setPaymentsOpen] = useState(true)
  const [salesOrdersOpen, setSalesOrdersOpen] = useState(false)
  const [expensesOpen, setExpensesOpen] = useState(false)
  const [recurringExpensesOpen, setRecurringExpensesOpen] = useState(false)
  const [journalsOpen, setJournalsOpen] = useState(false)
  const [billsOpen, setBillsOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(searchQuery)
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [addressModalType, setAddressModalType] = useState<"billing" | "shipping">("billing")
  const [editName, setEditName] = useState("")
  const [editCompanyName, setEditCompanyName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editWorkPhone, setEditWorkPhone] = useState("")
  const [editSaving, setEditSaving] = useState(false)
  const [commentDraft, setCommentDraft] = useState("")
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editingCommentContent, setEditingCommentContent] = useState("")
  const [commentSaving, setCommentSaving] = useState(false)
  const [commentActionLoading, setCommentActionLoading] = useState(false)
  const [addressForm, setAddressForm] = useState({ attention: "", country: "ca", street1: "", street2: "", city: "", state: "", zip: "", phone: "", fax: "" })
  const [detailLoading, setDetailLoading] = useState(false)
  const [addressSaving, setAddressSaving] = useState(false)
  const [newSaving, setNewSaving] = useState(false)
  const [newDisplayName, setNewDisplayName] = useState("")
  const [newCompanyName, setNewCompanyName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newWorkPhone, setNewWorkPhone] = useState("")
  const [newFirstName, setNewFirstName] = useState("")
  const [newLastName, setNewLastName] = useState("")
  const [showSendEmailDialog, setShowSendEmailDialog] = useState(false)
  const statementRef = useRef<HTMLDivElement>(null)
  const documentFileInputRef = useRef<HTMLInputElement>(null)
  const [documentUploading, setDocumentUploading] = useState(false)
  const [documentError, setDocumentError] = useState<string | null>(null)
  // Attachment state for header quick-upload
  const attachmentFileInputRef = useRef<HTMLInputElement>(null)
  const [attachmentUploading, setAttachmentUploading] = useState(false)
  const [emailSendTo, setEmailSendTo] = useState<string[]>([])
  const [emailCc, setEmailCc] = useState<string[]>([])
  const [emailBcc, setEmailBcc] = useState<string[]>([])
  const [emailSendToInput, setEmailSendToInput] = useState("")
  const [emailCcInput, setEmailCcInput] = useState("")
  const [emailBccInput, setEmailBccInput] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [attachStatement, setAttachStatement] = useState(true)
  const [attachUnpaid, setAttachUnpaid] = useState(false)
  const [sendingStatement, setSendingStatement] = useState(false)
  const [customerQueryProcessed, setCustomerQueryProcessed] = useState(false)
  const [customerInvoices, setCustomerInvoices] = useState<{ invoiceNumber: string; date: string; dueDate: string; status: string; total: number; amountPaid: number; balanceDue: number }[]>([])
  const [customerPayments, setCustomerPayments] = useState<{ paymentNumber: string; date: string; amount: number; invoiceNumber?: string }[]>([])
  const [customerCreditNotes, setCustomerCreditNotes] = useState<{ creditNoteNumber: string; date: string; total: number }[]>([])
  const [invoicesLoading, setInvoicesLoading] = useState(false)
  // Transactions tab: invoices, payments, sales orders with ids for linking
  const [txInvoices, setTxInvoices] = useState<{ id: string; invoiceNumber: string; salesOrderId: string | null; date: string; total: number; amountPaid: number; balanceDue: number; status: string }[]>([])
  const [txPayments, setTxPayments] = useState<{ id: string; paymentNumber: string; date: string; referenceNumber: string; mode: string; amount: number; unusedAmount: number }[]>([])
  const [txSalesOrders, setTxSalesOrders] = useState<{ id: string; salesOrderNumber: string; date: string; total: number; status: string }[]>([])
  const [txLoading, setTxLoading] = useState(false)
  const [customerEmailLogs, setCustomerEmailLogs] = useState<{ id: string; toEmail: string; subject: string; details: string; sentAt: string; status: string }[]>([])
  const [emailLogsLoading, setEmailLogsLoading] = useState(false)
  const [statementPeriod, setStatementPeriod] = useState<"this_month" | "last_month" | "last_3_months" | "this_year" | "last_year">("this_month")
  const [statementFilter, setStatementFilter] = useState<"all" | "invoices" | "payments" | "credit_notes">("all")

  useEffect(() => {
    setSearchInput(searchQuery)
  }, [searchQuery])

  // Fetch customer email logs when a customer is selected
  useEffect(() => {
    if (!selectedCustomer?.id) {
      setCustomerEmailLogs([])
      return
    }
    let cancelled = false
    setEmailLogsLoading(true)
    fetch(`${API_BASE}/api/zoho/customers/${selectedCustomer.id}/email-logs/`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.emailLogs) {
          setCustomerEmailLogs(data.emailLogs)
        }
      })
      .catch(() => {
        if (!cancelled) setCustomerEmailLogs([])
      })
      .finally(() => {
        if (!cancelled) setEmailLogsLoading(false)
      })
    return () => { cancelled = true }
  }, [selectedCustomer?.id])

  // Reset processed flag when customer ID or query changes
  useEffect(() => {
    setCustomerQueryProcessed(false)
  }, [customerIdParam, customerQuery])

  // Auto-select customer when coming from another page (e.g., orders page)
  // Priority: ID param first (fetch directly if not in list), then name param as fallback
  useEffect(() => {
    if ((customerIdParam || customerQuery) && !customerQueryProcessed && !loading) {
      let found: Customer | undefined
      
      // First try to find by ID (most reliable)
      if (customerIdParam) {
        const idNum = parseInt(customerIdParam, 10)
        if (!isNaN(idNum)) {
          found = customers.find((c) => c.id === idNum)
          
          // If not found in the list (limit exceeded), fetch directly by ID
          if (!found && customers.length > 0) {
            setCustomerQueryProcessed(true)
            fetch(`${API_BASE}/api/zoho/customers/${idNum}/`)
              .then((res) => res.json())
              .then((data) => {
                if (data && !data.error && data.id) {
                  setSelectedCustomer(data as Customer)
                }
              })
              .catch(() => {})
            return
          }
        }
      }
      
      // Fallback to name search if no ID or not found
      if (!found && customerQuery && customers.length > 0) {
        const queryLower = customerQuery.toLowerCase()
        found = customers.find(
          (c) => c.name?.toLowerCase() === queryLower ||
               c.companyName?.toLowerCase() === queryLower ||
               c.name?.toLowerCase().includes(queryLower) ||
               c.companyName?.toLowerCase().includes(queryLower)
        )
      }
      
      if (found) {
        setSelectedCustomer(found)
      }
      if (customers.length > 0) {
        setCustomerQueryProcessed(true)
      }
    }
  }, [customerIdParam, customerQuery, customers, customerQueryProcessed, loading])

  const handleDownloadStatement = async () => {
    const pdfMake = (await import("pdfmake/build/pdfmake")).default
    const vfsMod = await import("pdfmake/build/vfs_fonts")
    const vfs = (vfsMod as { pdfMake?: { vfs?: Record<string, string> }; default?: Record<string, string> }).pdfMake?.vfs ?? (vfsMod as { default?: Record<string, string> }).default
    if (vfs) pdfMake.vfs = vfs

    const customerName = selectedCustomer?.name || "Customer"
    const filename = `statement_${customerName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`
    const { rows, range } = filteredStatementTransactions
    const invoicedAmount = rows.filter((r) => r.type === "invoice").reduce((sum, r) => sum + r.amount, 0)
    const amountPaid = rows.filter((r) => r.type === "payment").reduce((sum, r) => sum + r.payment, 0)
    const creditsApplied = rows.filter((r) => r.type === "credit_note").reduce((sum, r) => sum + Math.abs(r.amount), 0)
    const balanceDue = invoicedAmount - amountPaid - creditsApplied

    let logoData = ""
    try {
      const logoUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/zoho/Mekco-Supply-logo-300px.png`
      const res = await fetch(logoUrl)
      const blob = await res.blob()
      logoData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve((reader.result as string) || "")
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch {
      logoData = ""
    }

    const transRows = [
      [range.subtitle.split(" to ")[0] || "", "", "***Opening Balance***", "0.00", "", "0.00"],
      ...rows.map((r) => [
        r.date,
        r.transaction,
        r.details,
        r.amount !== 0 ? r.amount.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "",
        r.payment !== 0 ? r.payment.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "",
        r.balance.toLocaleString("en-US", { minimumFractionDigits: 2 }),
      ]),
    ]

    const docDefinition: Record<string, unknown> = {
      pageSize: "A4",
      pageMargins: [40, 40, 40, 40],
      content: [
        {
          columns: [
            logoData
              ? { image: logoData, width: 100, height: 67, marginBottom: 24 }
              : { text: "MEKCO", fontSize: 16, bold: true, marginBottom: 24 },
            {
              stack: [
                { text: "Mekco Supply Inc.", style: "company", alignment: "right" },
                { text: "16-110 West Beaver Creek Rd.", style: "address", alignment: "right" },
                { text: "Richmond Hill, Ontario L4B 1J9", style: "address", alignment: "right" },
              ],
              width: "*",
            },
          ],
          columnGap: 16,
          marginBottom: 32,
        },
        { text: "To", style: "label", marginBottom: 2 },
        { text: customerName, style: "toName", marginBottom: 24 },
        { text: "Statement of Accounts", style: "title", alignment: "right", marginBottom: 2 },
        { text: range.subtitle, style: "subtitle", alignment: "right", marginBottom: 24 },
        {
          table: {
            widths: ["*", 60],
            body: [
              [{ text: "Account Summary", fillColor: "#f3f4f6", bold: true }, { text: "", fillColor: "#f3f4f6" }],
              ["Opening Balance", "$ 0.00"],
              ["Invoiced Amount", `$ ${invoicedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`],
              ["Amount Paid", `$ ${amountPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}`],
              [{ text: "Balance Due", bold: true }, { text: `$ ${balanceDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, bold: true }],
            ],
          },
          marginBottom: 16,
        },
        {
          table: {
            headerRows: 1,
            widths: [60, 70, "*", 60, 60, 60],
            body: [
              [
                { text: "Date", fillColor: "#f3f4f6" },
                { text: "Transactions", fillColor: "#f3f4f6" },
                { text: "Details", fillColor: "#f3f4f6" },
                { text: "Amount", fillColor: "#f3f4f6", alignment: "right" },
                { text: "Payments", fillColor: "#f3f4f6", alignment: "right" },
                { text: "Balance", fillColor: "#f3f4f6", alignment: "right" },
              ],
              ...transRows,
            ],
          },
          marginBottom: 16,
        },
        { text: "Balance Due", bold: true, alignment: "right", marginBottom: 2 },
        { text: `$ ${balanceDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, bold: true, alignment: "right" },
      ],
      styles: {
        company: { fontSize: 14, bold: true },
        address: { fontSize: 10, color: "#6b7280" },
        label: { fontSize: 10, color: "#6b7280" },
        toName: { fontSize: 12, color: "#111827" },
        title: { fontSize: 18, bold: true },
        subtitle: { fontSize: 10, color: "#6b7280" },
      },
      defaultStyle: { fontSize: 10 },
    }

    pdfMake.createPdf(docDefinition).download(filename)
  }

  const handlePrintStatement = () => {
    const el = statementRef.current
    if (!el) return
    const printWindow = window.open("", "_blank")
    if (!printWindow) return
    const content = el.innerHTML
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Statement - ${selectedCustomer?.name || "Customer"}</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; font-size: 14px; color: #111; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-size: 12px; }
            th { font-weight: 500; }
            img { max-width: 112px; height: auto; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  useEffect(() => {
    if (showSendEmailDialog && selectedCustomer) {
      const range = getStatementRange()
      setEmailSendTo(selectedCustomer.email ? [`${selectedCustomer.name} <${selectedCustomer.email}>`] : [])
      setEmailCc(["merano@mekcosupply.com"])
      setEmailBcc(["AR@mekcosupply.com"])
      setEmailSendToInput("")
      setEmailCcInput("")
      setEmailBccInput("")
      setEmailSubject(`Account Statement from ${range.subtitle.replace(" to ", " to ")}`)
      setAttachStatement(true)
      setAttachUnpaid(false)
    }
  }, [showSendEmailDialog, selectedCustomer, statementPeriod])

  const handleSendStatement = async () => {
    if (!selectedCustomer?.id) return
    if (emailSendTo.length === 0) {
      alert("Please add at least one recipient email.")
      return
    }
    const range = getStatementRange()
    const [dateStart, dateEnd] = range.subtitle.split(" to ")
    setSendingStatement(true)
    try {
      const res = await fetch(`${API_BASE}/api/zoho/customers/${selectedCustomer.id}/send-statement/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: emailSendTo,
          cc: emailCc,
          bcc: emailBcc,
          subject: emailSubject,
          attachStatement,
          attachUnpaid,
          dateStart: dateStart?.trim() || range.startISO,
          dateEnd: dateEnd?.trim() || range.endISO,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || "Failed to send email")
      }
      alert("Statement email sent successfully!")
      setShowSendEmailDialog(false)
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to send statement email.")
    } finally {
      setSendingStatement(false)
    }
  }

  useEffect(() => {
    if (!selectedCustomer?.id) return
    let cancelled = false
    setDetailLoading(true)
    fetch(`${API_BASE}/api/zoho/customers/${selectedCustomer.id}/`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        if (data.error) return
        setSelectedCustomer(data as Customer)
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false)
      })
    return () => { cancelled = true }
  }, [selectedCustomer?.id])

  // Statement date range helper
  const getStatementRange = (period: typeof statementPeriod = statementPeriod) => {
    const now = new Date()
    let start: Date
    let end: Date
    switch (period) {
      case "last_month":
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        end = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      case "last_3_months":
        start = new Date(now.getFullYear(), now.getMonth() - 2, 1)
        end = new Date(now)
        break
      case "this_year":
        start = new Date(now.getFullYear(), 0, 1)
        end = new Date(now)
        break
      case "last_year":
        start = new Date(now.getFullYear() - 1, 0, 1)
        end = new Date(now.getFullYear() - 1, 11, 31)
        break
      case "this_month":
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
    }
    const fmt = (d: Date) => {
      const m = d.toLocaleDateString("en-US", { month: "short" })
      const day = String(d.getDate()).padStart(2, "0")
      const yr = d.getFullYear()
      return `${m} ${day}, ${yr}`
    }
    const label = period === "this_month" ? "This Month" : period === "last_month" ? "Last Month" : period === "last_3_months" ? "Last 3 Months" : period === "this_year" ? "This Year" : "Last Year"
    return { start, end, label, subtitle: `${fmt(start)} to ${fmt(end)}`, startISO: start.toISOString().slice(0, 10), endISO: end.toISOString().slice(0, 10) }
  }

  // Build filtered transactions for statement (invoices, payments, credit notes merged and filtered)
  const filteredStatementTransactions = (() => {
    const range = getStatementRange()
    const inRange = (dateStr: string) => {
      if (!dateStr || dateStr.length < 10) return false
      const d = dateStr.slice(0, 10)
      return d >= range.startISO && d <= range.endISO
    }

    const invRows = (statementFilter === "all" || statementFilter === "invoices")
      ? customerInvoices.filter((inv) => inRange(inv.date)).map((inv) => ({
          type: "invoice" as const,
          date: inv.date,
          transaction: "Invoice",
          details: inv.invoiceNumber,
          amount: inv.total,
          payment: inv.amountPaid,
        }))
      : []
    const payRows = (statementFilter === "all" || statementFilter === "payments")
      ? customerPayments.filter((p) => inRange(p.date)).map((p) => ({
          type: "payment" as const,
          date: p.date,
          transaction: "Payment",
          details: p.paymentNumber + (p.invoiceNumber ? ` (${p.invoiceNumber})` : ""),
          amount: 0,
          payment: p.amount,
        }))
      : []
    const cnRows = (statementFilter === "all" || statementFilter === "credit_notes")
      ? customerCreditNotes.filter((cn) => inRange(cn.date)).map((cn) => ({
          type: "credit_note" as const,
          date: cn.date,
          transaction: "Credit Note",
          details: cn.creditNoteNumber,
          amount: -cn.total,
          payment: 0,
        }))
      : []

    const all = [...invRows, ...payRows, ...cnRows].sort((a, b) => a.date.localeCompare(b.date))
    let runningBalance = 0
    const rows = all.map((r) => {
      if (r.type === "invoice") runningBalance += r.amount - r.payment
      else if (r.type === "payment") runningBalance -= r.payment
      else if (r.type === "credit_note") runningBalance += r.amount
      return { ...r, balance: runningBalance }
    })
    return { rows, range }
  })()

  // Fetch customer invoices, payments, credit notes when Statement tab is active
  useEffect(() => {
    if (activeDetailTab !== "statement" || !selectedCustomer?.id) {
      return
    }
    let cancelled = false
    setInvoicesLoading(true)
    Promise.all([
      fetch(`${API_BASE}/api/zoho/invoices/?customerId=${selectedCustomer.id}`).then((r) => r.json()),
      fetch(`${API_BASE}/api/zoho/payments/?customerId=${selectedCustomer.id}`).then((r) => r.json()),
      fetch(`${API_BASE}/api/zoho/credit-notes/?customerId=${selectedCustomer.id}`).then((r) => r.json()),
    ])
      .then(([invData, payData, cnData]) => {
        if (cancelled) return
        const invs = (invData.invoices || []).map((inv: Record<string, unknown>) => ({
          invoiceNumber: inv.invoiceNumber || "",
          date: inv.date || "",
          dueDate: inv.dueDate || "",
          status: inv.status || "",
          total: Number(inv.total) || 0,
          amountPaid: Number(inv.amountPaid) || 0,
          balanceDue: Number(inv.balanceDue) || 0,
        }))
        setCustomerInvoices(invs)
        const pays = (payData.payments || []).map((p: Record<string, unknown>) => ({
          paymentNumber: p.paymentNumber || "",
          date: p.date || "",
          amount: Number(p.amount) || 0,
          invoiceNumber: p.invoiceNumber as string | undefined,
        }))
        setCustomerPayments(pays)
        const cns = (cnData.creditNotes || []).map((cn: Record<string, unknown>) => ({
          creditNoteNumber: cn.creditNoteNumber || "",
          date: cn.date || "",
          total: Number(cn.total) || 0,
        }))
        setCustomerCreditNotes(cns)
      })
      .catch(() => {
        if (!cancelled) {
          setCustomerInvoices([])
          setCustomerPayments([])
          setCustomerCreditNotes([])
        }
      })
      .finally(() => {
        if (!cancelled) setInvoicesLoading(false)
      })
    return () => { cancelled = true }
  }, [activeDetailTab, selectedCustomer?.id])

  // Fetch invoices, payments, sales orders for Transactions tab (with ids for links)
  useEffect(() => {
    if (activeDetailTab !== "transactions" || !selectedCustomer?.id) {
      setTxInvoices([])
      setTxPayments([])
      setTxSalesOrders([])
      return
    }
    let cancelled = false
    setTxLoading(true)
    Promise.all([
      fetch(`${API_BASE}/api/zoho/invoices/?customerId=${selectedCustomer.id}`).then((r) => r.json()),
      fetch(`${API_BASE}/api/zoho/payments/?customerId=${selectedCustomer.id}`).then((r) => r.json()),
      fetch(`${API_BASE}/api/zoho/sales-orders/?customerId=${selectedCustomer.id}`).then((r) => r.json()),
    ])
      .then(([invData, payData, soData]) => {
        if (cancelled) return
        const invs = (invData.invoices || []).map((inv: Record<string, unknown>) => ({
          id: String(inv.id ?? ""),
          invoiceNumber: String(inv.invoiceNumber ?? ""),
          salesOrderId: inv.salesOrderId != null ? String(inv.salesOrderId) : null,
          date: String(inv.date ?? ""),
          total: Number(inv.total) || 0,
          amountPaid: Number(inv.amountPaid) || 0,
          balanceDue: Number(inv.balanceDue) ?? (Number(inv.total) || 0) - (Number(inv.amountPaid) || 0),
          status: String(inv.status ?? ""),
        }))
        setTxInvoices(invs)
        const pays = (payData.payments || []).map((p: Record<string, unknown>) => ({
          id: String(p.id ?? ""),
          paymentNumber: String(p.paymentNumber ?? ""),
          date: String(p.date ?? ""),
          referenceNumber: String((p as Record<string, unknown>).referenceNumber ?? ""),
          mode: String((p as Record<string, unknown>).mode ?? "Cheque"),
          amount: Number(p.amount) || 0,
          unusedAmount: Number((p as Record<string, unknown>).unusedAmount ?? 0) || 0,
        }))
        setTxPayments(pays)
        const orders = (soData.orders || []).map((so: Record<string, unknown>) => ({
          id: String(so.id ?? ""),
          salesOrderNumber: String(so.salesOrderNumber ?? ""),
          date: String(so.date ?? ""),
          total: Number(so.total) || 0,
          status: String(so.status ?? ""),
        }))
        setTxSalesOrders(orders)
      })
      .catch(() => {
        if (!cancelled) {
          setTxInvoices([])
          setTxPayments([])
          setTxSalesOrders([])
        }
      })
      .finally(() => {
        if (!cancelled) setTxLoading(false)
      })
    return () => { cancelled = true }
  }, [activeDetailTab, selectedCustomer?.id])

  // When opening Edit form, refetch full customer detail so we have documents and latest data
  useEffect(() => {
    if (!showEditForm || !selectedCustomer?.id) return
    let cancelled = false
    fetch(`${API_BASE}/api/zoho/customers/${selectedCustomer.id}/`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || data?.error) return
        setSelectedCustomer(data as Customer)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [showEditForm, selectedCustomer?.id])

  useEffect(() => {
    if (showEditForm && selectedCustomer) {
      setEditName(selectedCustomer.name)
      setEditCompanyName(selectedCustomer.companyName)
      setEditEmail(selectedCustomer.email)
      setEditWorkPhone(selectedCustomer.workPhone || "")
      setCustomerType(selectedCustomer.customerType || "business")
    }
  }, [showEditForm, selectedCustomer])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    if (searchQuery) params.set("search", searchQuery)
    params.set("limit", String(CUSTOMERS_PER_PAGE))
    params.set("page", String(currentPage))
    const url = `${API_BASE}/api/zoho/customers/?${params.toString()}`
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        if (data.error) {
          setError(data.error)
          setCustomers([])
          setTotalCustomers(0)
        } else {
          setCustomers(data.customers ?? [])
          setTotalCustomers(data.total ?? data.customers?.length ?? 0)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Failed to load customers")
          setCustomers([])
          setTotalCustomers(0)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [searchQuery, currentPage])

  const applySearch = (q: string) => {
    const next = new URLSearchParams(searchParams.toString())
    const trimmed = q.trim()
    if (trimmed) next.set("search", trimmed)
    else next.delete("search")
    router.replace(trimmed ? `${pathname}?${next.toString()}` : pathname)
  }

  // Debounced search - trigger search as user types after 300ms delay
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== searchQuery) {
        applySearch(searchInput)
      }
    }, 300)
    return () => clearTimeout(handler)
  }, [searchInput])

  // Edit Customer Form
  if (showEditForm && selectedCustomer) {
    return (
      <DashboardLayout activeItem="Sales" activeSubItem="Customers">
        <div className="flex-1 overflow-auto">
          <div className="flex items-center justify-between px-4 py-2 border-b bg-background sticky top-0 z-10">
            <h1 className="text-sm font-medium">Edit Customer</h1>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setShowEditForm(false); setSelectedCustomer(null); }}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-4 max-w-4xl">
            {/* Customer Type */}
            <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start md:items-center gap-1.5 md:gap-3 py-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">Customer Type <HelpCircle className="w-3 h-3" /></Label>
              <RadioGroup value={customerType} onValueChange={setCustomerType} className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="business" id="edit-business" className="h-3.5 w-3.5" />
                  <Label htmlFor="edit-business" className="text-xs font-normal cursor-pointer">Business</Label>
                </div>
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="individual" id="edit-individual" className="h-3.5 w-3.5" />
                  <Label htmlFor="edit-individual" className="text-xs font-normal cursor-pointer">Individual</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Primary Contact */}
            <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start md:items-center gap-1.5 md:gap-3 py-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">Primary Contact <HelpCircle className="w-3 h-3" /></Label>
              <div className="flex flex-col sm:flex-row gap-2 max-w-lg">
                <Select defaultValue="mr">
                  <SelectTrigger className="h-8 text-xs w-full sm:w-24"><SelectValue placeholder="Salutation" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mr" className="text-xs">Mr.</SelectItem>
                    <SelectItem value="mrs" className="text-xs">Mrs.</SelectItem>
                    <SelectItem value="ms" className="text-xs">Ms.</SelectItem>
                  </SelectContent>
                </Select>
                <Input className="h-8 text-xs w-full sm:flex-1" value={(editName || "").split(" ")[0] ?? ""} onChange={(e) => setEditName((editName || "").split(" ").slice(1).join(" ") ? e.target.value + " " + (editName || "").split(" ").slice(1).join(" ") : e.target.value)} placeholder="First" />
                <Input className="h-8 text-xs w-full sm:flex-1" value={(editName || "").split(" ").slice(1).join(" ") ?? ""} onChange={(e) => setEditName((editName || "").split(" ")[0] ? (editName || "").split(" ")[0] + " " + e.target.value : e.target.value)} placeholder="Last Name" />
              </div>
            </div>

            {/* Company Name */}
            <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start md:items-center gap-1.5 md:gap-3 py-2">
              <Label className="text-xs text-muted-foreground">Company Name</Label>
              <Input className="h-8 text-xs w-full max-w-lg" value={editCompanyName} onChange={(e) => setEditCompanyName(e.target.value)} />
            </div>

            {/* Display Name */}
            <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start md:items-center gap-1.5 md:gap-3 py-2">
              <Label className="text-xs text-primary flex items-center gap-1">Display Name* <HelpCircle className="w-3 h-3" /></Label>
              <Input className="h-8 text-xs w-full max-w-lg" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Display name" />
            </div>

            {/* Email */}
            <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start md:items-center gap-1.5 md:gap-3 py-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">Email Address <HelpCircle className="w-3 h-3" /></Label>
              <div className="flex items-center gap-2 w-full max-w-lg">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <Input className="h-8 text-xs flex-1" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              </div>
            </div>

            {/* Phone */}
            <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start md:items-center gap-1.5 md:gap-3 py-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">Phone <HelpCircle className="w-3 h-3" /></Label>
              <div className="flex flex-col sm:flex-row gap-2 max-w-lg">
                <div className="flex gap-1.5 flex-1">
                  <Select defaultValue="+1">
                    <SelectTrigger className="h-8 text-xs w-16 shrink-0"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="+1" className="text-xs">+1</SelectItem></SelectContent>
                  </Select>
                  <Input className="h-8 text-xs flex-1" placeholder="Work Phone" value={editWorkPhone} onChange={(e) => setEditWorkPhone(e.target.value)} />
                </div>
                <div className="flex gap-1.5 flex-1">
                  <Select defaultValue="+1">
                    <SelectTrigger className="h-8 text-xs w-16 shrink-0"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="+1" className="text-xs">+1</SelectItem></SelectContent>
                  </Select>
                  <Input className="h-8 text-xs flex-1" placeholder="Mobile" />
                </div>
              </div>
            </div>

            {/* Customer Language */}
            <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start md:items-center gap-1.5 md:gap-3 py-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">Customer Language <HelpCircle className="w-3 h-3" /></Label>
              <Select>
                <SelectTrigger className="h-8 text-xs w-full max-w-lg"><SelectValue placeholder="Select language" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en" className="text-xs">English</SelectItem>
                  <SelectItem value="fr" className="text-xs">French</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tabs Section */}
            <Tabs defaultValue="other" className="mt-6">
              <TabsList className="h-9 p-0 bg-transparent border-b w-full justify-start rounded-none gap-0">
                <TabsTrigger value="other" className="text-xs h-9 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Other Details</TabsTrigger>
                <TabsTrigger value="address" className="text-xs h-9 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Address</TabsTrigger>
                <TabsTrigger value="contacts" className="text-xs h-9 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Contact Persons</TabsTrigger>
                <TabsTrigger value="custom" className="text-xs h-9 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Custom Fields</TabsTrigger>
                <TabsTrigger value="tags" className="text-xs h-9 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Reporting Tags</TabsTrigger>
                <TabsTrigger value="remarks" className="text-xs h-9 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Remarks</TabsTrigger>
              </TabsList>

              <TabsContent value="other" className="mt-4 space-y-2">
                {/* Tax Preference */}
                <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start md:items-center gap-1.5 md:gap-3 py-2">
                  <Label className="text-xs text-primary">Tax Preference*</Label>
                  <RadioGroup defaultValue="taxable" className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem value="taxable" id="edit-taxable" className="h-3.5 w-3.5" />
                      <Label htmlFor="edit-taxable" className="text-xs font-normal cursor-pointer">Taxable</Label>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem value="exempt" id="edit-exempt" className="h-3.5 w-3.5" />
                      <Label htmlFor="edit-exempt" className="text-xs font-normal cursor-pointer">Tax Exempt</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Tax Rate */}
                <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start gap-1.5 md:gap-3 py-2">
                  <Label className="text-xs text-primary pt-0 md:pt-2">Tax Rate*</Label>
                  <div className="w-full max-w-lg">
                    <Select defaultValue="gst">
                      <SelectTrigger className="h-8 text-xs w-full"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="gst" className="text-xs">GST/HST [13%]</SelectItem></SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground mt-1">To associate more than one tax, you need to create a tax group in Settings.</p>
                  </div>
                </div>

                {/* Currency */}
                <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start md:items-center gap-1.5 md:gap-3 py-2">
                  <Label className="text-xs text-muted-foreground">Currency</Label>
                  <Select defaultValue="cad">
                    <SelectTrigger className="h-8 text-xs w-full max-w-lg"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="cad" className="text-xs">CAD- Canadian Dollar</SelectItem></SelectContent>
                  </Select>
                </div>

                {/* Accounts Receivable */}
                <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start md:items-center gap-1.5 md:gap-3 py-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">Accounts Receivable <HelpCircle className="w-3 h-3" /></Label>
                  <Select>
                    <SelectTrigger className="h-8 text-xs w-full max-w-lg"><SelectValue placeholder="Select an account" /></SelectTrigger>
                    <SelectContent><SelectItem value="ar" className="text-xs">Accounts Receivable</SelectItem></SelectContent>
                  </Select>
                </div>

                {/* Payment Terms */}
                <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start md:items-center gap-1.5 md:gap-3 py-2">
                  <Label className="text-xs text-muted-foreground">Payment Terms</Label>
                  <Select defaultValue="receipt">
                    <SelectTrigger className="h-8 text-xs w-full max-w-lg"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="receipt" className="text-xs">Due on Receipt</SelectItem></SelectContent>
                  </Select>
                </div>

                {/* Documents */}
                <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start gap-1.5 md:gap-3 py-2">
                  <Label className="text-xs text-muted-foreground pt-0 md:pt-2">Documents</Label>
                  <div>
                    <input
                      ref={documentFileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.gif"
                      className="hidden"
                      onChange={async (e) => {
                        const files = e.target.files ? Array.from(e.target.files) : []
                        e.target.value = ""
                        if (!files.length || !selectedCustomer?.id) return
                        const existing = (selectedCustomer.documents?.length ?? 0)
                        if (existing + files.length > 10) {
                          setDocumentError("Maximum 10 files allowed.")
                          return
                        }
                        for (const f of files) {
                          if (f.size > 10 * 1024 * 1024) {
                            setDocumentError(`${f.name} is over 10MB.`)
                            return
                          }
                        }
                        setDocumentError(null)
                        setDocumentUploading(true)
                        try {
                          for (const file of files) {
                            const form = new FormData()
                            form.append("file", file)
                            form.append("title", file.name)
                            const res = await fetch(`${API_BASE}/api/zoho/customers/${selectedCustomer.id}/documents/`, {
                              method: "POST",
                              body: form,
                              credentials: "include",
                            })
                            const data = await res.json()
                            if (data.error) throw new Error(data.error)
                            setSelectedCustomer({ ...data, documents: data.documents ?? selectedCustomer.documents ?? [] } as Customer)
                          }
                          // Refetch full customer so document list is guaranteed up to date
                          const refetch = await fetch(`${API_BASE}/api/zoho/customers/${selectedCustomer.id}/`)
                          const refetchData = await refetch.json()
                          if (!refetchData.error && refetchData.documents) setSelectedCustomer(refetchData as Customer)
                        } catch (err) {
                          setDocumentError(err instanceof Error ? err.message : "Upload failed")
                        } finally {
                          setDocumentUploading(false)
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs bg-transparent"
                      disabled={documentUploading || (selectedCustomer.documents?.length ?? 0) >= 10}
                      onClick={() => documentFileInputRef.current?.click()}
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5" />Upload File<ChevronDown className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                    <p className="text-[10px] text-muted-foreground mt-1">You can upload a maximum of 10 files, 10MB each</p>
                    {documentError && <p className="text-[10px] text-destructive mt-1">{documentError}</p>}
                    {(selectedCustomer.documents?.length ?? 0) > 0 ? (
                      <ul className="mt-2 space-y-1">
                        {selectedCustomer.documents!.map((doc) => (
                          <li key={doc.id} className="flex items-center justify-between gap-2 text-xs">
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">{doc.title || doc.filename}</a>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 text-destructive hover:text-destructive shrink-0"
                              onClick={async () => {
                                if (!selectedCustomer?.id) return
                                try {
                                  const res = await fetch(`${API_BASE}/api/zoho/customers/${selectedCustomer.id}/documents/${doc.id}/`, { method: "DELETE", credentials: "include" })
                                  const data = await res.json()
                                  if (data.error) throw new Error(data.error)
                                  setSelectedCustomer({ ...data, documents: data.documents ?? [] } as Customer)
                                } catch (err) {
                                  console.error(err)
                                }
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[10px] text-muted-foreground mt-2">No documents uploaded yet.</p>
                    )}
                  </div>
                </div>

                {/* Add more details link */}
                <div className="pt-2">
                  <Link href="#" className="text-xs text-primary hover:underline">Add more details</Link>
                </div>
              </TabsContent>

              <TabsContent value="address" className="mt-4">
                <p className="text-xs text-muted-foreground">Address fields will appear here.</p>
              </TabsContent>
              <TabsContent value="contacts" className="mt-4">
                <p className="text-xs text-muted-foreground">Contact persons will appear here.</p>
              </TabsContent>
              <TabsContent value="custom" className="mt-4">
                <p className="text-xs text-muted-foreground">Custom fields will appear here.</p>
              </TabsContent>
              <TabsContent value="tags" className="mt-4">
                <p className="text-xs text-muted-foreground">Reporting tags will appear here.</p>
              </TabsContent>
              <TabsContent value="remarks" className="mt-4">
                <p className="text-xs text-muted-foreground">Remarks will appear here.</p>
              </TabsContent>
            </Tabs>

            {/* Footer */}
            <div className="flex items-center gap-2 mt-8 pt-4 border-t">
              <Button
                type="button"
                className="bg-primary hover:bg-primary/90 h-8 text-xs px-4"
                disabled={editSaving}
                onClick={async () => {
                  if (!selectedCustomer?.id) return
                  setEditSaving(true)
                  try {
                    const res = await fetch(`${API_BASE}/api/zoho/customers/${selectedCustomer.id}/update/`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name: editName.trim(),
                        companyName: editCompanyName.trim(),
                        email: editEmail.trim() || null,
                        workPhone: editWorkPhone.trim() || null,
                        customerType: customerType,
                      }),
                    })
                    const data = await res.json()
                    if (data.error) throw new Error(data.error)
                    const updated = data as Customer
                    setSelectedCustomer(updated)
                    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
                    setShowEditForm(false)
                  } catch (err) {
                    console.error(err)
                  } finally {
                    setEditSaving(false)
                  }
                }}
              >
                {editSaving ? "Saving…" : "Save"}
              </Button>
              <Button type="button" variant="ghost" className="h-8 text-xs" onClick={() => { setShowEditForm(false); setSelectedCustomer(null); }}>Cancel</Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // New Customer Form
  if (showNewForm) {
    return (
      <DashboardLayout activeItem="Sales" activeSubItem="Customers">
        <div className="flex-1 overflow-auto">
          <div className="flex items-center justify-between px-4 py-2 border-b bg-background sticky top-0 z-10">
            <h1 className="text-sm font-medium">New Customer</h1>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowNewForm(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-4 max-w-4xl">
            {/* Customer Type */}
            <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start md:items-center gap-1.5 md:gap-3 py-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">Customer Type <HelpCircle className="w-3 h-3" /></Label>
              <RadioGroup value={customerType} onValueChange={setCustomerType} className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="business" id="business" className="h-3.5 w-3.5" />
                  <Label htmlFor="business" className="text-xs font-normal cursor-pointer">Business</Label>
                </div>
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="individual" id="individual" className="h-3.5 w-3.5" />
                  <Label htmlFor="individual" className="text-xs font-normal cursor-pointer">Individual</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Primary Contact */}
            <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start md:items-center gap-1.5 md:gap-3 py-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">Primary Contact <HelpCircle className="w-3 h-3" /></Label>
              <div className="flex flex-col sm:flex-row gap-2 max-w-lg">
                <Select>
                  <SelectTrigger className="h-8 text-xs w-full sm:w-24"><SelectValue placeholder="Salutation" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mr" className="text-xs">Mr.</SelectItem>
                    <SelectItem value="mrs" className="text-xs">Mrs.</SelectItem>
                    <SelectItem value="ms" className="text-xs">Ms.</SelectItem>
                  </SelectContent>
                </Select>
                <Input className="h-8 text-xs w-full sm:flex-1" placeholder="First Name" value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} />
                <Input className="h-8 text-xs w-full sm:flex-1" placeholder="Last Name" value={newLastName} onChange={(e) => setNewLastName(e.target.value)} />
              </div>
            </div>

            {/* Company Name */}
            <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start md:items-center gap-1.5 md:gap-3 py-2">
              <Label className="text-xs text-muted-foreground">Company Name</Label>
              <Input className="h-8 text-xs w-full max-w-lg" value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)} placeholder="Company name" />
            </div>

            {/* Display Name - typeable */}
            <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start md:items-center gap-1.5 md:gap-3 py-2">
              <Label className="text-xs text-primary flex items-center gap-1">Display Name* <HelpCircle className="w-3 h-3" /></Label>
              <Input className="h-8 text-xs w-full max-w-lg" value={newDisplayName} onChange={(e) => setNewDisplayName(e.target.value)} placeholder="Type display name (e.g. customer or company name)" />
            </div>

            {/* Email */}
            <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start md:items-center gap-1.5 md:gap-3 py-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">Email Address <HelpCircle className="w-3 h-3" /></Label>
              <div className="flex items-center gap-2 w-full max-w-lg">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <Input className="h-8 text-xs flex-1" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@example.com" />
              </div>
            </div>

            {/* Phone */}
            <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start md:items-center gap-1.5 md:gap-3 py-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">Phone <HelpCircle className="w-3 h-3" /></Label>
              <div className="flex flex-col sm:flex-row gap-2 max-w-lg">
                <div className="flex gap-1.5 flex-1">
                  <Select defaultValue="+1">
                    <SelectTrigger className="h-8 text-xs w-16 shrink-0"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="+1" className="text-xs">+1</SelectItem></SelectContent>
                  </Select>
                  <Input className="h-8 text-xs flex-1" placeholder="Work Phone (required)" value={newWorkPhone} onChange={(e) => setNewWorkPhone(e.target.value)} />
                </div>
                <div className="flex gap-1.5 flex-1">
                  <Select defaultValue="+1">
                    <SelectTrigger className="h-8 text-xs w-16 shrink-0"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="+1" className="text-xs">+1</SelectItem></SelectContent>
                  </Select>
                  <Input className="h-8 text-xs flex-1" placeholder="Mobile" />
                </div>
              </div>
            </div>

            {/* Customer Language */}
            <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start md:items-center gap-1.5 md:gap-3 py-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">Customer Language <HelpCircle className="w-3 h-3" /></Label>
              <Select>
                <SelectTrigger className="h-8 text-xs w-full max-w-lg"><SelectValue placeholder="Select language" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en" className="text-xs">English</SelectItem>
                  <SelectItem value="fr" className="text-xs">French</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tabs Section */}
            <Tabs defaultValue="other" className="mt-6">
              <TabsList className="h-9 p-0 bg-transparent border-b w-full justify-start rounded-none gap-0">
                <TabsTrigger value="other" className="text-xs h-9 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Other Details</TabsTrigger>
                <TabsTrigger value="address" className="text-xs h-9 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Address</TabsTrigger>
                <TabsTrigger value="contacts" className="text-xs h-9 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Contact Persons</TabsTrigger>
                <TabsTrigger value="custom" className="text-xs h-9 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Custom Fields</TabsTrigger>
                <TabsTrigger value="tags" className="text-xs h-9 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Reporting Tags</TabsTrigger>
                <TabsTrigger value="remarks" className="text-xs h-9 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Remarks</TabsTrigger>
              </TabsList>

              <TabsContent value="other" className="mt-4 space-y-2">
                {/* Tax Preference */}
                <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start md:items-center gap-1.5 md:gap-3 py-2">
                  <Label className="text-xs text-primary">Tax Preference*</Label>
                  <RadioGroup defaultValue="taxable" className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem value="taxable" id="taxable" className="h-3.5 w-3.5" />
                      <Label htmlFor="taxable" className="text-xs font-normal cursor-pointer">Taxable</Label>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem value="exempt" id="exempt" className="h-3.5 w-3.5" />
                      <Label htmlFor="exempt" className="text-xs font-normal cursor-pointer">Tax Exempt</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Tax Rate */}
                <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start gap-1.5 md:gap-3 py-2">
                  <Label className="text-xs text-primary pt-0 md:pt-2">Tax Rate*</Label>
                  <div className="w-full max-w-lg">
                    <Select>
                      <SelectTrigger className="h-8 text-xs w-full"><SelectValue placeholder="Select a Tax" /></SelectTrigger>
                      <SelectContent><SelectItem value="gst" className="text-xs">GST/HST [13%]</SelectItem></SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground mt-1">To associate more than one tax, you need to create a tax group in Settings.</p>
                  </div>
                </div>

                {/* Currency */}
                <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start md:items-center gap-1.5 md:gap-3 py-2">
                  <Label className="text-xs text-muted-foreground">Currency</Label>
                  <Select defaultValue="cad">
                    <SelectTrigger className="h-8 text-xs w-full max-w-lg"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="cad" className="text-xs">CAD- Canadian Dollar</SelectItem></SelectContent>
                  </Select>
                </div>

                {/* Accounts Receivable */}
                <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start md:items-center gap-1.5 md:gap-3 py-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">Accounts Receivable <HelpCircle className="w-3 h-3" /></Label>
                  <Select>
                    <SelectTrigger className="h-8 text-xs w-full max-w-lg"><SelectValue placeholder="Select an account" /></SelectTrigger>
                    <SelectContent><SelectItem value="ar" className="text-xs">Accounts Receivable</SelectItem></SelectContent>
                  </Select>
                </div>

                {/* Opening Balance */}
                <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start md:items-center gap-1.5 md:gap-3 py-2">
                  <Label className="text-xs text-muted-foreground">Opening Balance</Label>
                  <div className="flex w-full max-w-lg">
                    <span className="inline-flex items-center px-2.5 text-xs bg-muted border border-r-0 rounded-l text-muted-foreground shrink-0">CAD</span>
                    <Input className="h-8 text-xs rounded-l-none flex-1" />
                  </div>
                </div>

                {/* Payment Terms */}
                <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start md:items-center gap-1.5 md:gap-3 py-2">
                  <Label className="text-xs text-muted-foreground">Payment Terms</Label>
                  <Select defaultValue="receipt">
                    <SelectTrigger className="h-8 text-xs w-full max-w-lg"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="receipt" className="text-xs">Due on Receipt</SelectItem></SelectContent>
                  </Select>
                </div>

                {/* Enable Portal */}
                <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start md:items-center gap-1.5 md:gap-3 py-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">Enable Portal? <HelpCircle className="w-3 h-3" /></Label>
                  <div className="flex items-center gap-2">
                    <Checkbox className="h-3.5 w-3.5" />
                    <span className="text-xs">Allow portal access for this customer</span>
                  </div>
                </div>

                {/* Documents */}
                <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start gap-1.5 md:gap-3 py-2">
                  <Label className="text-xs text-muted-foreground pt-0 md:pt-2">Documents</Label>
                  <div>
                    <Button variant="outline" size="sm" className="h-8 text-xs bg-transparent" disabled>
                      <Upload className="w-3.5 h-3.5 mr-1.5" />Upload File<ChevronDown className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                    <p className="text-[10px] text-muted-foreground mt-1">You can upload a maximum of 10 files, 10MB each. Save customer first to upload documents.</p>
                  </div>
                </div>

                {/* Add more details link */}
                <div className="pt-2">
                  <Link href="#" className="text-xs text-primary hover:underline">Add more details</Link>
                </div>
              </TabsContent>

              <TabsContent value="address" className="mt-4">
                <p className="text-xs text-muted-foreground">Address fields will appear here.</p>
              </TabsContent>
              <TabsContent value="contacts" className="mt-4">
                <p className="text-xs text-muted-foreground">Contact persons will appear here.</p>
              </TabsContent>
              <TabsContent value="custom" className="mt-4">
                <p className="text-xs text-muted-foreground">Custom fields will appear here.</p>
              </TabsContent>
              <TabsContent value="tags" className="mt-4">
                <p className="text-xs text-muted-foreground">Reporting tags will appear here.</p>
              </TabsContent>
              <TabsContent value="remarks" className="mt-4">
                <p className="text-xs text-muted-foreground">Remarks will appear here.</p>
              </TabsContent>
            </Tabs>

            {/* Footer */}
            <div className="flex items-center gap-2 mt-8 pt-4 border-t">
              <Button
                type="button"
                className="bg-primary hover:bg-primary/90 h-8 text-xs px-4"
                disabled={newSaving}
                onClick={async () => {
                  const name = newDisplayName.trim()
                  const workPhone = newWorkPhone.trim().replace(/\D/g, "")
                  if (!name) return
                  if (!workPhone) return
                  setNewSaving(true)
                  try {
                    const res = await fetch(`${API_BASE}/api/zoho/customers/`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name,
                        companyName: newCompanyName.trim() || "No Company",
                        email: newEmail.trim() || null,
                        workPhone,
                        customerType: customerType,
                      }),
                    })
                    const data = await res.json()
                    if (data.error) throw new Error(data.error)
                    const created = data as Customer
                    setCustomers((prev) => [created, ...prev])
                    setShowNewForm(false)
                    setSelectedCustomer(created)
                    setNewDisplayName("")
                    setNewCompanyName("")
                    setNewEmail("")
                    setNewWorkPhone("")
                    setNewFirstName("")
                    setNewLastName("")
                  } catch (err) {
                    console.error(err)
                  } finally {
                    setNewSaving(false)
                  }
                }}
              >
                {newSaving ? "Saving…" : "Save"}
              </Button>
              <Button type="button" variant="ghost" className="h-8 text-xs" onClick={() => setShowNewForm(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Customer Detail View
  if (selectedCustomer) {
    return (
      <DashboardLayout activeItem="Sales" activeSubItem="Customers">
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          {/* Left Sidebar - Customer List (hidden on mobile, show on lg+) */}
          <div className="hidden lg:flex w-64 border-r flex-col shrink-0">
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-medium">All Customers</h2>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center gap-1">
                <Button type="button" size="icon" variant="ghost" className="h-6 w-6" onClick={() => setShowNewForm(true)}>
                  <Plus className="w-3.5 h-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <div className="px-2 py-1.5 border-b">
              <form onSubmit={(e) => { e.preventDefault(); applySearch(searchInput); }}>
                <div className="relative">
                  <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    className="w-full pl-6 pr-2 py-1 text-xs border rounded bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onBlur={() => applySearch(searchInput)}
                  />
                </div>
              </form>
            </div>
            <div className="flex-1 overflow-auto">
              {customers.map((customer, idx) => (
                <div
                  key={customer.id ?? idx}
                  className={`px-3 py-2 border-b cursor-pointer hover:bg-muted/50 ${selectedCustomer.name === customer.name ? 'bg-muted/50' : ''}`}
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox className="h-3 w-3" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{customer.name}</p>
                      <p className="text-[10px] text-muted-foreground">${customer.receivables.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-3 py-2 border-t text-[10px] text-muted-foreground flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span>Total Count: {totalCustomers}</span>
              </div>
              {totalCustomers > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    Showing {((currentPage - 1) * CUSTOMERS_PER_PAGE) + 1}–{Math.min(currentPage * CUSTOMERS_PER_PAGE, totalCustomers)} of {totalCustomers}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-[10px] px-2"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <span className="px-1 text-muted-foreground">
                      Page {currentPage} of {Math.ceil(totalCustomers / CUSTOMERS_PER_PAGE) || 1}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-[10px] px-2"
                      disabled={currentPage >= Math.ceil(totalCustomers / CUSTOMERS_PER_PAGE)}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Customer Detail */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Header: back on mobile, title + actions */}
            <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 border-b shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden shrink-0" onClick={() => setSelectedCustomer(null)} aria-label="Back to list">
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </Button>
                <h1 className="text-sm sm:text-base font-medium truncate">{selectedCustomer.name}</h1>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <Button type="button" variant="outline" size="sm" className="h-7 text-xs bg-transparent" onClick={() => setShowEditForm(true)}>Edit</Button>
                {/* Attachment Button */}
                <input
                  type="file"
                  ref={attachmentFileInputRef}
                  className="hidden"
                  multiple
                  onChange={async (e) => {
                    const files = e.target.files
                    if (!files || files.length === 0 || !selectedCustomer?.id) return
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
                        await fetch(`${API_BASE}/api/zoho/customers/${selectedCustomer.id}/documents/`, {
                          method: "POST",
                          body: formData,
                          credentials: "include",
                        })
                      }
                      // Refetch customer to get updated documents
                      const res = await fetch(`${API_BASE}/api/zoho/customers/${selectedCustomer.id}/`)
                      const data = await res.json()
                      if (data && !data.error) {
                        setSelectedCustomer(data)
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
                  size="icon"
                  className="h-7 w-7"
                  disabled={attachmentUploading || !selectedCustomer?.id}
                  onClick={() => attachmentFileInputRef.current?.click()}
                  title="Attach files"
                >
                  {attachmentUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Bookmark className="w-4 h-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 h-7 text-xs">
                      New Transaction <ChevronDown className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="text-[10px] text-muted-foreground font-normal">SALES</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href={selectedCustomer?.id ? `/sales/invoices?customerId=${selectedCustomer.id}&new=1` : "/sales/invoices"} className="flex cursor-pointer">
                        <span className="text-xs">Invoice</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={selectedCustomer?.id ? `/sales/payments/new?customerId=${selectedCustomer.id}` : "/sales/payments/new"} className="flex cursor-pointer">
                        <span className="text-xs">Customer Payment</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={selectedCustomer?.id ? `/sales/orders?customerId=${selectedCustomer.id}&new=1` : "/sales/orders"} className="flex cursor-pointer">
                        <span className="text-xs">Sales Order</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/purchases/expenses" className="flex cursor-pointer">
                        <span className="text-xs">Expense</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/purchases/expenses" className="flex cursor-pointer">
                        <span className="text-xs">Recurring Expense</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/accountant" className="flex cursor-pointer">
                        <span className="text-xs">Journal</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={selectedCustomer?.id ? `/sales/credit-notes/new?customerId=${selectedCustomer.id}` : "/sales/credit-notes/new"} className="flex cursor-pointer">
                        <span className="text-xs">Credit Note</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 text-xs bg-transparent">
                      More <ChevronDown className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-xs text-destructive focus:text-destructive cursor-pointer"
                      onClick={async () => {
                        if (!selectedCustomer?.id || !confirm(`Delete customer "${selectedCustomer.name}"? This cannot be undone.`)) return
                        try {
                          const res = await fetch(`${API_BASE}/api/zoho/customers/${selectedCustomer.id}/delete/`, { method: "DELETE" })
                          const data = await res.json()
                          if (data.error) throw new Error(data.error)
                          setCustomers((prev) => prev.filter((c) => c.id !== selectedCustomer.id))
                          setSelectedCustomer(null)
                          setShowEditForm(false)
                        } catch (err) {
                          console.error(err)
                          alert(err instanceof Error ? err.message : "Delete failed")
                        }
                      }}
                    >
                      <Trash2 className="w-3 h-3 mr-2" />Delete
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-xs cursor-pointer"
                      onClick={() => {
                        setNewDisplayName(selectedCustomer?.name ?? "")
                        setNewCompanyName(selectedCustomer?.companyName ?? "")
                        setNewEmail(selectedCustomer?.email ?? "")
                        setNewWorkPhone(selectedCustomer?.workPhone ?? "")
                        setCustomerType(selectedCustomer?.customerType ?? "business")
                        setSelectedCustomer(null)
                        setShowEditForm(false)
                        setShowNewForm(true)
                      }}
                    >
                      <Copy className="w-3 h-3 mr-2" />Clone
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedCustomer(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b overflow-x-auto">
              <div className="flex items-center gap-0 px-3 sm:px-4 min-w-max">
                {['Overview', 'Comments', 'Transactions', 'Mails', 'Statement'].map((tab) => (
                  <button
                    type="button"
                    key={tab}
                    onClick={() => setActiveDetailTab(tab.toLowerCase())}
                    className={`px-4 py-2 text-xs border-b-2 ${activeDetailTab === tab.toLowerCase() ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto min-h-0">
              {activeDetailTab === 'overview' && (
                <div className="flex flex-col lg:flex-row">
                  {/* Left Column */}
                  <div className="flex-1 border-b lg:border-b-0 lg:border-r p-4 min-w-0">
                    {/* Company Name */}
                    <p className="text-sm text-muted-foreground mb-4">{selectedCustomer.companyName}</p>

                    {/* Contact Info */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                        {selectedCustomer.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{selectedCustomer.name}</p>
                          <Button variant="ghost" size="icon" className="h-5 w-5">
                            <Settings className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">{selectedCustomer.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Link href="#" className="text-xs text-primary hover:underline">Invite to Portal</Link>
                          <Link href="#" className="text-xs text-primary hover:underline">Send Email</Link>
                        </div>
                      </div>
                    </div>

                    {/* ADDRESS Section */}
                    <Collapsible defaultOpen className="mb-4">
                      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 border-t">
                        <span className="text-xs font-medium">ADDRESS</span>
                        <ChevronDown className="w-4 h-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-2 space-y-3">
                        <div>
                          <p className="text-xs font-medium">Billing Address</p>
                          {(() => {
                            const addr = selectedCustomer?.addresses?.find((a) => a.type === "billing")
                            return addr ? (
                              <p className="text-xs text-muted-foreground">
                                {[addr.street1, addr.street2, addr.city, addr.state, addr.zip].filter(Boolean).join(", ")}
                              </p>
                            ) : (
                              <p className="text-xs text-muted-foreground">No Billing Address - <button type="button" className="text-primary hover:underline" onClick={() => { setAddressModalType("billing"); setAddressForm({ attention: "", country: "ca", street1: "", street2: "", city: "", state: "", zip: "", phone: "", fax: "" }); setAddressModalOpen(true); }}>New Address</button></p>
                            )
                          })()}
                        </div>
                        <div>
                          <p className="text-xs font-medium">Shipping Address</p>
                          {(() => {
                            const addr = selectedCustomer?.addresses?.find((a) => a.type === "shipping")
                            return addr ? (
                              <p className="text-xs text-muted-foreground">
                                {[addr.street1, addr.street2, addr.city, addr.state, addr.zip].filter(Boolean).join(", ")}
                              </p>
                            ) : (
                              <p className="text-xs text-muted-foreground">No Shipping Address - <button type="button" className="text-primary hover:underline" onClick={() => { setAddressModalType("shipping"); setAddressForm({ attention: "", country: "ca", street1: "", street2: "", city: "", state: "", zip: "", phone: "", fax: "" }); setAddressModalOpen(true); }}>New Address</button></p>
                            )
                          })()}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* OTHER DETAILS Section */}
                    <Collapsible defaultOpen className="mb-4">
                      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 border-t">
                        <span className="text-xs font-medium">OTHER DETAILS</span>
                        <ChevronDown className="w-4 h-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Customer Type</span>
                          <span className="text-xs">{selectedCustomer.customerType || 'Business'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Default Currency</span>
                          <span className="text-xs">{selectedCustomer.currency || 'CAD'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Tax Preference</span>
                          <span className="text-xs">{selectedCustomer.taxPreference || 'Taxable'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Portal Status</span>
                          <span className="text-xs text-red-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>{selectedCustomer.portalStatus || 'Disabled'}</span>
                        </div>
                        {selectedCustomer.website && (
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">Website URL</span>
                            <Link href={`https://${selectedCustomer.website}`} target="_blank" className="text-xs text-primary hover:underline">{selectedCustomer.website}</Link>
                          </div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>

                    {/* CONTACT PERSONS Section */}
                    <Collapsible className="mb-4">
                      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 border-t">
                        <span className="text-xs font-medium">CONTACT PERSONS</span>
                        <div className="flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5 text-primary" />
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-2">
                        <p className="text-xs text-muted-foreground text-center py-4">No contact persons found.</p>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* DOCUMENTS Section */}
                    <Collapsible defaultOpen className="mb-4">
                      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 border-t">
                        <span className="text-xs font-medium">DOCUMENTS ({selectedCustomer.documents?.length ?? 0})</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="text-primary hover:text-primary/80"
                            onClick={(e) => {
                              e.stopPropagation()
                              attachmentFileInputRef.current?.click()
                            }}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-2">
                        {(selectedCustomer.documents?.length ?? 0) > 0 ? (
                          <ul className="space-y-2">
                            {selectedCustomer.documents!.map((doc) => (
                              <li key={doc.id} className="flex items-center justify-between gap-2 group">
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline truncate flex-1"
                                >
                                  <Paperclip className="w-3 h-3 inline mr-1.5" />
                                  {doc.title || doc.filename}
                                </a>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                  onClick={async () => {
                                    if (!selectedCustomer?.id) return
                                    try {
                                      const res = await fetch(`${API_BASE}/api/zoho/customers/${selectedCustomer.id}/documents/${doc.id}/`, {
                                        method: "DELETE",
                                        credentials: "include",
                                      })
                                      const data = await res.json()
                                      if (data.error) throw new Error(data.error)
                                      setSelectedCustomer({ ...data, documents: data.documents ?? [] } as Customer)
                                    } catch (err) {
                                      console.error(err)
                                    }
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-muted-foreground text-center py-4">No documents uploaded yet.</p>
                        )}
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Customer Portal Info */}
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded p-3 mt-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs">Customer Portal allows your customers to keep track of all the transactions between them and your business.</p>
                          <Link href="#" className="text-xs text-primary hover:underline">Learn More</Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="w-full lg:w-[400px] lg:min-w-[320px] p-4 shrink-0">
                    {/* Payment due period */}
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground">Payment due period</p>
                      <p className="text-sm">Due on Receipt</p>
                    </div>

                    {/* Receivables */}
                    <div className="mb-6">
                      <h3 className="text-sm font-medium mb-2">Receivables</h3>
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead className="text-[10px] py-1.5">CURRENCY</TableHead>
                            <TableHead className="text-[10px] py-1.5 text-right">OUTSTANDING RECEIVABLES</TableHead>
                            <TableHead className="text-[10px] py-1.5 text-right">UNUSED CREDITS</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="text-xs py-2">CAD- Canadian Dollar</TableCell>
                            <TableCell className="text-xs py-2 text-right">${selectedCustomer.receivables.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                            <TableCell className="text-xs py-2 text-right">$0.00</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                      <Link href="#" className="text-xs text-primary hover:underline mt-2 inline-block">Enter Opening Balance</Link>
                    </div>

                    {/* Income Chart */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="text-sm font-medium">Income</h3>
                          <p className="text-[10px] text-muted-foreground">This chart is displayed in the organization's base currency.</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select defaultValue="6months">
                            <SelectTrigger className="h-6 text-[10px] w-auto border-0 p-0 text-primary">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="6months" className="text-xs">Last 6 Months</SelectItem>
                              <SelectItem value="12months" className="text-xs">Last 12 Months</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select defaultValue="accrual">
                            <SelectTrigger className="h-6 text-[10px] w-auto border-0 p-0 text-primary">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="accrual" className="text-xs">Accrual</SelectItem>
                              <SelectItem value="cash" className="text-xs">Cash</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {/* Simple Chart Placeholder */}
                      <div className="h-32 border rounded bg-muted/10 flex items-end px-2 pb-2 gap-1">
                        {['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'].map((month, i) => (
                          <div key={month} className="flex-1 flex flex-col items-center gap-1">
                            <div className={`w-full bg-primary/20 rounded-t ${i === 6 ? 'h-16 bg-amber-400' : 'h-1'}`}></div>
                            <span className="text-[8px] text-muted-foreground">{month}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-center mt-2">Total Income ( Last 6 Months ) - $0.00</p>
                    </div>

                    {/* Activity Timeline */}
                    <div className="border-t pt-4">
                      <div className="space-y-4">
                        {[
                          { date: 'Mar 16, 2023', time: '01:58 PM', title: 'Invoice updated', desc: 'Invoice INV-000667 emailed', by: 'Sia B' },
                          { date: 'Mar 16, 2023', time: '01:57 PM', title: 'Invoice updated', desc: 'Invoice INV-000667 updated', by: 'Sia B' },
                          { date: 'Mar 01, 2023', time: '', title: 'Payments Received added', desc: '', by: '' },
                        ].map((activity, idx) => (
                          <div key={idx} className="flex gap-3">
                            <div className="text-right w-20 shrink-0">
                              <p className="text-[10px] text-muted-foreground">{activity.date}</p>
                              {activity.time && <p className="text-[10px] text-muted-foreground">{activity.time}</p>}
                            </div>
                            <div className="relative">
                              <div className="w-2 h-2 rounded-full bg-muted border-2 border-background absolute left-0 top-1"></div>
                              <div className="pl-4 border-l border-muted ml-1">
                                <p className="text-xs font-medium">{activity.title}</p>
                                {activity.desc && <p className="text-[10px] text-muted-foreground">{activity.desc}</p>}
                                {activity.by && <p className="text-[10px] text-muted-foreground">by {activity.by} - <Link href="#" className="text-primary hover:underline">View Details</Link></p>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeDetailTab === 'transactions' && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm">Go to transactions</span>
                    <ChevronDown className="w-4 h-4" />
                  </div>

                  {/* Invoices Section */}
                  <Collapsible open={invoicesOpen} onOpenChange={setInvoicesOpen} className="mb-4">
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
                      <div className="flex items-center gap-2">
                        <ChevronDown className={`w-4 h-4 transition-transform ${invoicesOpen ? '' : '-rotate-90'}`} />
                        <span className="text-sm font-medium">Invoices</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span>Status: All</span>
                          <ChevronDown className="w-3 h-3" />
                        </div>
                        <Link href={selectedCustomer?.id ? `/sales/invoices?customerId=${selectedCustomer.id}&new=1` : "/sales/invoices"}>
                          <Button variant="ghost" size="sm" className="h-6 text-xs text-primary">
                            <Plus className="w-3 h-3 mr-1" />New
                          </Button>
                        </Link>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      {txLoading ? (
                        <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading…
                        </div>
                      ) : (
                        <>
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/30">
                                <TableHead className="text-[10px] py-1.5">DATE <ChevronDown className="w-3 h-3 inline" /></TableHead>
                                <TableHead className="text-[10px] py-1.5">INVOICE NUMBER</TableHead>
                                <TableHead className="text-[10px] py-1.5">ORDER NUMBER</TableHead>
                                <TableHead className="text-[10px] py-1.5 text-right">AMOUNT</TableHead>
                                <TableHead className="text-[10px] py-1.5 text-right">BALANCE DUE</TableHead>
                                <TableHead className="text-[10px] py-1.5">STATUS</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {txInvoices.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={6} className="text-xs py-6 text-center text-muted-foreground">No invoices found.</TableCell>
                                </TableRow>
                              ) : (
                                txInvoices.map((inv) => (
                                  <TableRow key={inv.id}>
                                    <TableCell className="text-xs py-2">{inv.date ? new Date(inv.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" }) : "-"}</TableCell>
                                    <TableCell className="py-2">
                                      <Link href={`/sales/invoices?id=${inv.id}`} className="text-xs text-primary hover:underline">{inv.invoiceNumber || inv.id}</Link>
                                    </TableCell>
                                    <TableCell className="py-2 text-xs text-muted-foreground">
                                      {inv.salesOrderId ? (
                                        <Link href={`/sales/orders?id=${inv.salesOrderId}`} className="text-primary hover:underline">{(txSalesOrders.find(so => so.id === inv.salesOrderId))?.salesOrderNumber ?? inv.salesOrderId}</Link>
                                      ) : "-"}
                                    </TableCell>
                                    <TableCell className="text-xs py-2 text-right">${inv.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell className="text-xs py-2 text-right">${inv.balanceDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell className={`text-xs py-2 ${inv.status === "Paid" ? "text-green-600" : ""}`}>{inv.status || "-"}</TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                          <div className="flex items-center justify-between py-2 text-[10px] text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <span>Total Count:</span>
                              <Link href={selectedCustomer?.id ? `/sales/invoices?customerId=${selectedCustomer.id}` : "/sales/invoices"} className="text-primary hover:underline">View</Link>
                            </div>
                            <span>{txInvoices.length > 0 ? `1 - ${txInvoices.length}` : "0"}</span>
                          </div>
                        </>
                      )}
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Customer Payments Section */}
                  <Collapsible open={paymentsOpen} onOpenChange={setPaymentsOpen} className="mb-4">
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
                      <div className="flex items-center gap-2">
                        <ChevronDown className={`w-4 h-4 transition-transform ${paymentsOpen ? '' : '-rotate-90'}`} />
                        <span className="text-sm font-medium">Customer Payments</span>
                      </div>
                      <Link href={selectedCustomer?.id ? `/sales/payments/new?customerId=${selectedCustomer.id}` : "/sales/payments/new"}>
                        <Button variant="ghost" size="sm" className="h-6 text-xs text-primary">
                          <Plus className="w-3 h-3 mr-1" />New
                        </Button>
                      </Link>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      {txLoading ? (
                        <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading…
                        </div>
                      ) : (
                        <>
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/30">
                                <TableHead className="text-[10px] py-1.5">DATE <ChevronDown className="w-3 h-3 inline" /></TableHead>
                                <TableHead className="text-[10px] py-1.5">PAYMENT NUMBER</TableHead>
                                <TableHead className="text-[10px] py-1.5">REFERENCE NUMBER</TableHead>
                                <TableHead className="text-[10px] py-1.5">PAYMENT MODE</TableHead>
                                <TableHead className="text-[10px] py-1.5 text-right">AMOUNT</TableHead>
                                <TableHead className="text-[10px] py-1.5 text-right">UNUSED AMOUNT</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {txPayments.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={6} className="text-xs py-6 text-center text-muted-foreground">No payments found.</TableCell>
                                </TableRow>
                              ) : (
                                txPayments.map((p) => (
                                  <TableRow key={p.id}>
                                    <TableCell className="text-xs py-2">{p.date ? new Date(p.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" }) : "-"}</TableCell>
                                    <TableCell className="py-2">
                                      <Link href={`/sales/payments?id=${p.id}`} className="text-xs text-primary hover:underline">{p.paymentNumber || p.id}</Link>
                                    </TableCell>
                                    <TableCell className="text-xs py-2">{p.referenceNumber || "-"}</TableCell>
                                    <TableCell className="text-xs py-2">{p.mode || "-"}</TableCell>
                                    <TableCell className="text-xs py-2 text-right text-primary">${p.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell className="text-xs py-2 text-right text-primary">${p.unusedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                          <div className="flex items-center justify-between py-2 text-[10px] text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <span>Total Count:</span>
                              <Link href={selectedCustomer?.id ? `/sales/payments?customerId=${selectedCustomer.id}` : "/sales/payments"} className="text-primary hover:underline">View</Link>
                            </div>
                            <span>{txPayments.length > 0 ? `1 - ${txPayments.length}` : "0"}</span>
                          </div>
                        </>
                      )}
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Sales Orders Section */}
                  <Collapsible open={salesOrdersOpen} onOpenChange={setSalesOrdersOpen} className="mb-4">
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
                      <div className="flex items-center gap-2">
                        <ChevronDown className={`w-4 h-4 transition-transform ${salesOrdersOpen ? '' : '-rotate-90'}`} />
                        <span className="text-sm font-medium">Sales Orders</span>
                      </div>
                      <Link href={selectedCustomer?.id ? `/sales/orders?customerId=${selectedCustomer.id}&new=1` : "/sales/orders"}>
                        <Button variant="ghost" size="sm" className="h-6 text-xs text-primary">
                          <Plus className="w-3 h-3 mr-1" />New
                        </Button>
                      </Link>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      {txLoading ? (
                        <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading…
                        </div>
                      ) : txSalesOrders.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-4 text-center">No sales orders found.</p>
                      ) : (
                        <>
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/30">
                                <TableHead className="text-[10px] py-1.5">DATE</TableHead>
                                <TableHead className="text-[10px] py-1.5">ORDER NUMBER</TableHead>
                                <TableHead className="text-[10px] py-1.5 text-right">AMOUNT</TableHead>
                                <TableHead className="text-[10px] py-1.5">STATUS</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {txSalesOrders.map((so) => (
                                <TableRow key={so.id}>
                                  <TableCell className="text-xs py-2">{so.date ? new Date(so.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" }) : "-"}</TableCell>
                                  <TableCell className="py-2">
                                    <Link href={`/sales/orders?id=${so.id}`} className="text-xs text-primary hover:underline">{so.salesOrderNumber || so.id}</Link>
                                  </TableCell>
                                  <TableCell className="text-xs py-2 text-right">${so.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                                  <TableCell className="text-xs py-2">{so.status || "-"}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          <div className="flex items-center justify-between py-2 text-[10px] text-muted-foreground">
                            <span>Total Count: <Link href={selectedCustomer?.id ? `/sales/orders?customerId=${selectedCustomer.id}` : "/sales/orders"} className="text-primary hover:underline">View</Link></span>
                            <span>{txSalesOrders.length > 0 ? `1 - ${txSalesOrders.length}` : "0"}</span>
                          </div>
                        </>
                      )}
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Other Sections: Expenses, Recurring Expenses, Journals, Bills */}
                  {[
                    { label: 'Expenses', open: expensesOpen, setOpen: setExpensesOpen, viewHref: '#', newHref: '#' },
                    { label: 'Recurring Expenses', open: recurringExpensesOpen, setOpen: setRecurringExpensesOpen, viewHref: '#', newHref: '#' },
                    { label: 'Journals', open: journalsOpen, setOpen: setJournalsOpen, viewHref: '#', newHref: '#' },
                    { label: 'Bills', open: billsOpen, setOpen: setBillsOpen, viewHref: '/purchases/bills', newHref: '/purchases/bills/new' },
                  ].map((section) => (
                    <Collapsible key={section.label} open={section.open} onOpenChange={section.setOpen} className="mb-2">
                      <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
                        <div className="flex items-center gap-2">
                          <ChevronRight className={`w-4 h-4 transition-transform ${section.open ? 'rotate-90' : ''}`} />
                          <span className="text-sm font-medium">{section.label}</span>
                        </div>
                        <Link href={section.newHref}>
                          <Button variant="ghost" size="sm" className="h-6 text-xs text-primary">
                            <Plus className="w-3 h-3 mr-1" />New
                          </Button>
                        </Link>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <p className="text-xs text-muted-foreground py-4 text-center">
                          No {section.label.toLowerCase()} found. {section.viewHref !== '#' && (
                            <Link href={section.viewHref} className="text-primary hover:underline ml-1">View all {section.label}</Link>
                          )}
                        </p>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              )}

              {activeDetailTab === 'comments' && (
                <div className="p-6">
                  {/* Rich Text Editor */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="flex items-center gap-1 px-3 py-2 border-b bg-muted/30">
                      <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0 font-bold text-sm">B</Button>
                      <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0 italic text-sm">I</Button>
                      <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0 underline text-sm">U</Button>
                    </div>
                    <Textarea
                      placeholder=""
                      className="text-sm min-h-[80px] border-0 rounded-none focus-visible:ring-0 resize-none"
                      value={commentDraft}
                      onChange={(e) => setCommentDraft(e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs mt-3 bg-transparent"
                    disabled={commentSaving}
                    onClick={async () => {
                      const text = commentDraft.trim()
                      if (!text || !selectedCustomer?.id) return
                      setCommentSaving(true)
                      try {
                        const res = await fetch(`${API_BASE}/api/zoho/customers/${selectedCustomer.id}/comments/`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ content: text }),
                        })
                        const data = await res.json()
                        if (data.error) throw new Error(data.error)
                        setSelectedCustomer(data as Customer)
                        setCommentDraft("")
                      } catch (err) {
                        console.error(err)
                      } finally {
                        setCommentSaving(false)
                      }
                    }}
                  >
                    {commentSaving ? "Adding…" : "Add Comment"}
                  </Button>

                  {/* All Comments Section */}
                  <div className="mt-8">
                    <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">ALL COMMENTS</h3>
                    {selectedCustomer?.comments?.length ? (
                      <div className="space-y-3 py-4">
                        {selectedCustomer.comments.map((c) => (
                          <div key={c.id} className="text-sm border-b pb-3 last:border-0 group">
                            {editingCommentId === c.id ? (
                              <>
                                <Textarea
                                  className="min-h-[80px] text-sm mb-2"
                                  value={editingCommentContent}
                                  onChange={(e) => setEditingCommentContent(e.target.value)}
                                  placeholder="Comment text..."
                                />
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant="default"
                                    size="sm"
                                    className="h-7 text-xs"
                                    disabled={commentActionLoading || !editingCommentContent.trim()}
                                    onClick={async () => {
                                      if (!selectedCustomer?.id || !editingCommentContent.trim()) return
                                      setCommentActionLoading(true)
                                      try {
                                        const res = await fetch(`${API_BASE}/api/zoho/customers/${selectedCustomer.id}/comments/${c.id}/`, {
                                          method: "PATCH",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ content: editingCommentContent.trim() }),
                                        })
                                        const data = await res.json()
                                        if (data.error) throw new Error(data.error)
                                        setSelectedCustomer(data as Customer)
                                        setEditingCommentId(null)
                                        setEditingCommentContent("")
                                      } catch (err) {
                                        console.error(err)
                                      } finally {
                                        setCommentActionLoading(false)
                                      }
                                    }}
                                  >
                                    {commentActionLoading ? "Saving…" : "Save"}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs"
                                    disabled={commentActionLoading}
                                    onClick={() => {
                                      setEditingCommentId(null)
                                      setEditingCommentContent("")
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex items-start justify-between gap-2">
                                  <p className="whitespace-pre-wrap flex-1 min-w-0">{c.content}</p>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0 opacity-70 group-hover:opacity-100">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setEditingCommentId(c.id)
                                          setEditingCommentContent(c.content)
                                        }}
                                      >
                                        <Pencil className="h-3.5 w-3.5 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        disabled={commentActionLoading}
                                        onClick={async () => {
                                          if (!selectedCustomer?.id || !confirm("Remove this comment?")) return
                                          setCommentActionLoading(true)
                                          try {
                                            const res = await fetch(`${API_BASE}/api/zoho/customers/${selectedCustomer.id}/comments/${c.id}/`, { method: "DELETE" })
                                            const data = await res.json()
                                            if (data.error) throw new Error(data.error)
                                            setSelectedCustomer(data as Customer)
                                          } catch (err) {
                                            console.error(err)
                                          } finally {
                                            setCommentActionLoading(false)
                                          }
                                        }}
                                      >
                                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                                        Remove
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{c.created_at ? new Date(c.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : ""}</p>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No comments yet.</p>
                    )}
                  </div>
                </div>
              )}

              {activeDetailTab === 'mails' && (
                <div className="p-6">
                  {/* System Mails Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <h3 className="text-sm font-medium">System Mails</h3>
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground gap-1 w-fit">
                      <Mail className="w-4 h-4 shrink-0" />
                      Link Email account
                      <ChevronDown className="w-3 h-3 shrink-0" />
                    </Button>
                  </div>

                  {/* Email List - logs of emails sent to this customer */}
                  {emailLogsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-0 divide-y">
                      {customerEmailLogs.length > 0 ? (
                        customerEmailLogs.map((email) => {
                          const initial = (email.toEmail || "?").charAt(0).toUpperCase()
                          const dateStr = email.sentAt
                            ? new Date(email.sentAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
                            : ""
                          return (
                            <div key={email.id} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 py-4">
                              <div className="flex items-start gap-3 min-w-0 flex-1">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                                  {initial}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm">
                                    <span className="text-muted-foreground">To </span>
                                    <span className="text-primary break-all">{email.toEmail}</span>
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {email.subject || "Email"} - <span className="text-primary">{email.details}</span>
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap sm:shrink-0 pl-11 sm:pl-0">{dateStr}</span>
                            </div>
                          )
                        })
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">No emails sent yet.</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeDetailTab === 'statement' && (
                <div className="p-4 sm:p-6 bg-[#f0f0f0] min-h-full">
                  {/* Statement Controls - matches Zoho exactly */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 text-xs gap-1 bg-white border-[#d5d5d5] text-foreground hover:bg-[#f5f5f5]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            {getStatementRange().label}
                            <ChevronDown className="w-3 h-3 shrink-0" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-[140px]">
                          <DropdownMenuItem onClick={() => setStatementPeriod("this_month")}>This Month</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setStatementPeriod("last_month")}>Last Month</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setStatementPeriod("last_3_months")}>Last 3 Months</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setStatementPeriod("this_year")}>This Year</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setStatementPeriod("last_year")}>Last Year</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 text-xs gap-1 bg-white border-[#d5d5d5] text-foreground hover:bg-[#f5f5f5]">
                            Filter By: {statementFilter === "all" ? "All" : statementFilter === "invoices" ? "Invoices" : statementFilter === "payments" ? "Payments" : "Credit Notes"}
                            <ChevronDown className="w-3 h-3 shrink-0" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-[140px]">
                          <DropdownMenuItem onClick={() => setStatementFilter("all")}>All</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setStatementFilter("invoices")}>Invoices Only</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setStatementFilter("payments")}>Payments Only</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setStatementFilter("credit_notes")}>Credit Notes Only</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-[#555] hover:text-foreground" title="Print" onClick={handlePrintStatement}>
                        <Printer className="w-[18px] h-[18px]" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-[#555] hover:text-foreground" title="Download PDF" onClick={handleDownloadStatement}>
                        <Download className="w-[18px] h-[18px]" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-[#555] hover:text-foreground" title="PDF" onClick={handleDownloadStatement}>
                        <FileText className="w-[18px] h-[18px]" />
                      </Button>
                      <Button size="sm" className="h-8 text-xs gap-1.5 ml-2 bg-[#3b8753] hover:bg-[#2d6b41] text-white" onClick={() => setShowSendEmailDialog(true)}>
                        <Mail className="w-3.5 h-3.5" />
                        Send Email
                      </Button>
                    </div>
                  </div>

                  {/* Statement Title - centered above preview */}
                  <div className="text-center mb-5">
                    <h2 className="text-base font-medium text-foreground">Customer Statement for {selectedCustomer?.name}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">From {filteredStatementTransactions.range.subtitle.replace(" to ", " To ")}</p>
                  </div>

                  {/* Customize Button - Zoho teal, positioned top-right of PDF area */}
                  <div className="relative max-w-3xl mx-auto">
                    <div className="absolute -top-1 right-0 z-10">
                      <Button size="sm" className="h-8 text-xs gap-1 bg-[#3b8753] hover:bg-[#2d6b41] text-white rounded-md shadow-sm">
                        <Settings className="w-3.5 h-3.5" />
                        Customize
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Statement PDF Preview - white paper on gray bg */}
                  <div ref={statementRef} className="border border-[#ccc] rounded p-8 bg-white max-w-3xl mx-auto mt-6 shadow-sm">
                    {/* Company Header */}
                    <div className="flex items-start justify-between mb-10">
                      <div className="w-28 h-[72px] rounded flex items-center justify-center overflow-hidden bg-[#4a9b8e]/10 shrink-0">
                        <Image src="/zoho/Mekco-Supply-logo-300px.png" alt="Mekco Supply Inc." width={112} height={72} className="object-contain w-full h-full p-1" priority />
                      </div>
                      <div className="text-right text-[13px] leading-relaxed">
                        <p className="font-semibold text-foreground">Mekco Supply Inc.</p>
                        <p className="text-[#555]">16-110 West Beaver Creek Rd.</p>
                        <p className="text-[#555]">Richmond Hill, Ontario L4B 1J9</p>
                      </div>
                    </div>

                    {/* To Section & Statement of Accounts - side by side */}
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <p className="text-xs text-[#888] mb-0.5">To</p>
                        <p className="text-sm font-medium text-[#1a73a7] hover:underline cursor-pointer">{selectedCustomer?.name}</p>
                      </div>
                      <div className="text-right">
                        <h3 className="text-lg font-bold text-foreground border-b-2 border-foreground pb-1 inline-block">Statement of Accounts</h3>
                        <p className="text-xs text-[#555] mt-1">{filteredStatementTransactions.range.subtitle.replace(" to ", " To ")}</p>
                      </div>
                    </div>

                    {/* Account Summary - as a proper table like Zoho */}
                    {(() => {
                      const { rows } = filteredStatementTransactions
                      const invoicedAmount = rows.filter((r) => r.type === "invoice").reduce((sum, r) => sum + r.amount, 0)
                      const amountPaid = rows.filter((r) => r.type === "payment").reduce((sum, r) => sum + r.payment, 0)
                      const creditsApplied = rows.filter((r) => r.type === "credit_note").reduce((sum, r) => sum + Math.abs(r.amount), 0)
                      const balanceDue = invoicedAmount - amountPaid - creditsApplied
                      return (
                        <div className="mb-6 ml-auto" style={{ maxWidth: "320px" }}>
                          <table className="w-full text-[12px] border-collapse">
                            <thead>
                              <tr>
                                <th colSpan={2} className="bg-[#f3f4f6] text-left px-3 py-2 font-medium text-foreground border border-[#ddd]">Account Summary</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="px-3 py-1.5 border-l border-[#ddd] text-[#333]">Opening Balance</td>
                                <td className="px-3 py-1.5 text-right border-r border-[#ddd] text-[#333]">$ 0.00</td>
                              </tr>
                              <tr>
                                <td className="px-3 py-1.5 border-l border-[#ddd] text-[#333]">Invoiced Amount</td>
                                <td className="px-3 py-1.5 text-right border-r border-[#ddd] text-[#333]">$ {invoicedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                              </tr>
                              <tr>
                                <td className="px-3 py-1.5 border-l border-[#ddd] text-[#333]">Amount Paid</td>
                                <td className="px-3 py-1.5 text-right border-r border-[#ddd] text-[#333]">$ {amountPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                              </tr>
                              <tr className="border-t border-[#ddd]">
                                <td className="px-3 py-1.5 border-l border-b border-[#ddd] font-medium text-foreground">Balance Due</td>
                                <td className="px-3 py-1.5 text-right border-r border-b border-[#ddd] font-medium text-foreground">$ {balanceDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )
                    })()}

                    {/* Transactions Table - Zoho-style with colored header */}
                    <table className="w-full text-[12px] border-collapse">
                      <thead>
                        <tr className="bg-[#5b5b5b] text-white">
                          <th className="text-left px-3 py-2 font-medium border border-[#4a4a4a]">Date</th>
                          <th className="text-left px-3 py-2 font-medium border border-[#4a4a4a]">Transactions</th>
                          <th className="text-left px-3 py-2 font-medium border border-[#4a4a4a]">Details</th>
                          <th className="text-right px-3 py-2 font-medium border border-[#4a4a4a]">Amount</th>
                          <th className="text-right px-3 py-2 font-medium border border-[#4a4a4a]">Payments</th>
                          <th className="text-right px-3 py-2 font-medium border border-[#4a4a4a]">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-3 py-2 border border-[#e5e7eb] text-[#333]">{filteredStatementTransactions.range.subtitle.split(" to ")[0] || ""}</td>
                          <td className="px-3 py-2 border border-[#e5e7eb]"></td>
                          <td className="px-3 py-2 border border-[#e5e7eb] text-[#333]">***Opening Balance***</td>
                          <td className="px-3 py-2 border border-[#e5e7eb] text-right text-[#333]">0.00</td>
                          <td className="px-3 py-2 border border-[#e5e7eb] text-right"></td>
                          <td className="px-3 py-2 border border-[#e5e7eb] text-right text-[#333]">0.00</td>
                        </tr>
                        {invoicesLoading ? (
                          <tr>
                            <td colSpan={6} className="px-3 py-4 text-center text-muted-foreground border border-[#e5e7eb]">
                              Loading transactions...
                            </td>
                          </tr>
                        ) : filteredStatementTransactions.rows.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-3 py-4 text-center text-muted-foreground border border-[#e5e7eb]">
                              No transactions found for this period and filter
                            </td>
                          </tr>
                        ) : (
                          filteredStatementTransactions.rows.map((r, idx) => (
                            <tr key={`${r.type}-${r.details}-${idx}`}>
                              <td className="px-3 py-2 border border-[#e5e7eb] text-[#333]">{r.date}</td>
                              <td className="px-3 py-2 border border-[#e5e7eb] text-[#333]">{r.transaction}</td>
                              <td className="px-3 py-2 border border-[#e5e7eb] text-[#1a73a7] font-medium">{r.details}</td>
                              <td className="px-3 py-2 border border-[#e5e7eb] text-right text-[#333]">{r.amount !== 0 ? r.amount.toLocaleString("en-US", { minimumFractionDigits: 2 }) : ""}</td>
                              <td className="px-3 py-2 border border-[#e5e7eb] text-right text-[#333]">{r.payment !== 0 ? r.payment.toLocaleString("en-US", { minimumFractionDigits: 2 }) : ""}</td>
                              <td className="px-3 py-2 border border-[#e5e7eb] text-right text-[#333]">{r.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>

                    {/* Balance Due Footer */}
                    <div className="flex justify-end mt-4 border-t border-[#e5e7eb] pt-3">
                      <div className="text-[13px] font-semibold text-foreground">
                        Balance Due <span className="ml-10">$ {(filteredStatementTransactions.rows.length > 0 ? filteredStatementTransactions.rows[filteredStatementTransactions.rows.length - 1].balance : 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Address modal (Billing / Shipping) - Zoho-style */}
            <Dialog open={addressModalOpen} onOpenChange={(open: boolean) => { setAddressModalOpen(open); if (!open) setAddressForm({ attention: "", country: "ca", street1: "", street2: "", city: "", state: "", zip: "", phone: "", fax: "" }); }}>
              <DialogContent className="sm:max-w-md" showCloseButton>
                <DialogHeader>
                  <DialogTitle className="text-base">{addressModalType === "billing" ? "Billing Address" : "Shipping Address"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label className="text-xs">Attention</Label>
                    <Input className="h-8 text-xs" placeholder="Attention" value={addressForm.attention} onChange={(e) => setAddressForm((f) => ({ ...f, attention: e.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">Country/Region</Label>
                    <Select value={addressForm.country} onValueChange={(v: string) => setAddressForm((f) => ({ ...f, country: v }))}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select or type to add" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ca" className="text-xs">Canada</SelectItem>
                        <SelectItem value="us" className="text-xs">United States</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">Address</Label>
                    <Input className="h-8 text-xs" placeholder="Street 1" value={addressForm.street1} onChange={(e) => setAddressForm((f) => ({ ...f, street1: e.target.value }))} />
                    <Input className="h-8 text-xs" placeholder="Street 2" value={addressForm.street2} onChange={(e) => setAddressForm((f) => ({ ...f, street2: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-2">
                      <Label className="text-xs">City</Label>
                      <Input className="h-8 text-xs" placeholder="City" value={addressForm.city} onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))} />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs">State</Label>
                      <Select value={addressForm.state} onValueChange={(v: string) => setAddressForm((f) => ({ ...f, state: v }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select or type to add" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="on" className="text-xs">Ontario</SelectItem>
                          <SelectItem value="bc" className="text-xs">British Columbia</SelectItem>
                          <SelectItem value="ab" className="text-xs">Alberta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">ZIP Code</Label>
                    <Input className="h-8 text-xs" placeholder="ZIP Code" value={addressForm.zip} onChange={(e) => setAddressForm((f) => ({ ...f, zip: e.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">Phone</Label>
                    <div className="flex gap-1.5">
                      <Select defaultValue="+1">
                        <SelectTrigger className="h-8 text-xs w-16 shrink-0"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="+1" className="text-xs">+1</SelectItem></SelectContent>
                      </Select>
                      <Input className="h-8 text-xs flex-1" placeholder="Phone" value={addressForm.phone} onChange={(e) => setAddressForm((f) => ({ ...f, phone: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">Fax Number</Label>
                    <Input className="h-8 text-xs" placeholder="Fax Number" value={addressForm.fax} onChange={(e) => setAddressForm((f) => ({ ...f, fax: e.target.value }))} />
                  </div>
                  <div className="flex items-start gap-2 pt-2">
                    <Checkbox id="address-update-tx" className="h-3.5 w-3.5 mt-0.5" />
                    <Label htmlFor="address-update-tx" className="text-xs text-muted-foreground leading-tight">
                      Upon checking this box, the new address will be updated in the following transactions: Draft Invoices, Draft Estimates, Draft Retainer Invoices, Draft Sales Orders, Open Credit Notes.
                    </Label>
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => setAddressModalOpen(false)}>Cancel</Button>
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={async () => {
                      const cid = selectedCustomer?.id
                      if (cid === undefined) return
                      setAddressSaving(true)
                      try {
                        const res = await fetch(`${API_BASE}/api/zoho/customers/${cid}/addresses/`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            type: addressModalType,
                            attention: addressForm.attention,
                            street1: addressForm.street1 || "-",
                            street2: addressForm.street2,
                            city: addressForm.city || "-",
                            state: addressForm.state,
                            zip: addressForm.zip,
                            country: addressForm.country,
                          }),
                        })
                        const data = await res.json()
                        if (data.error) throw new Error(data.error)
                        setSelectedCustomer(data as Customer)
                        setAddressForm({ attention: "", country: "ca", street1: "", street2: "", city: "", state: "", zip: "", phone: "", fax: "" })
                        setAddressModalOpen(false)
                      } catch (err) {
                        console.error(err)
                      } finally {
                        setAddressSaving(false)
                      }
                    }}
                  >
                    {addressSaving ? "Saving…" : "Save"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Send Email Statement Dialog */}
            <Dialog open={showSendEmailDialog} onOpenChange={setShowSendEmailDialog}>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" showCloseButton>
                <DialogHeader>
                  <DialogTitle className="text-base">Send Email Statement for {selectedCustomer?.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">From</Label>
                    <Input className="mt-1 h-8 text-xs bg-muted" readOnly value="Mekco Account Receivable <AR@mekcosupply.com>" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Send To</Label>
                    <div className="mt-1 flex items-center gap-1 flex-wrap p-2 border rounded-md bg-background min-h-8">
                      {emailSendTo.map((e, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-xs">
                          {e}
                          <button type="button" className="ml-1 hover:text-destructive" aria-label="Remove" onClick={() => setEmailSendTo((prev) => prev.filter((_, j) => j !== i))}>×</button>
                        </span>
                      ))}
                      <input
                        type="text"
                        className="flex-1 min-w-[120px] text-xs bg-transparent border-none outline-none focus:ring-0 p-0"
                        placeholder="Add email..."
                        value={emailSendToInput}
                        onChange={(ev) => setEmailSendToInput(ev.target.value)}
                        onKeyDown={(ev) => {
                          if (ev.key === "Enter" || ev.key === ",") {
                            ev.preventDefault()
                            const v = (ev.key === "," ? emailSendToInput.replace(/,$/, "") : emailSendToInput).trim()
                            if (v) {
                              setEmailSendTo((prev) => [...prev, v])
                              setEmailSendToInput("")
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Cc</Label>
                    <div className="mt-1 flex items-center gap-1 flex-wrap p-2 border rounded-md bg-background min-h-8">
                      {emailCc.map((e, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-xs">
                          {e}
                          <button type="button" className="ml-1 hover:text-destructive" aria-label="Remove" onClick={() => setEmailCc((prev) => prev.filter((_, j) => j !== i))}>×</button>
                        </span>
                      ))}
                      <input
                        type="text"
                        className="flex-1 min-w-[120px] text-xs bg-transparent border-none outline-none focus:ring-0 p-0"
                        placeholder="Add email..."
                        value={emailCcInput}
                        onChange={(ev) => setEmailCcInput(ev.target.value)}
                        onKeyDown={(ev) => {
                          if (ev.key === "Enter" || ev.key === ",") {
                            ev.preventDefault()
                            const v = (ev.key === "," ? emailCcInput.replace(/,$/, "") : emailCcInput).trim()
                            if (v) {
                              setEmailCc((prev) => [...prev, v])
                              setEmailCcInput("")
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Bcc</Label>
                    <div className="mt-1 flex items-center gap-1 flex-wrap p-2 border rounded-md bg-background min-h-8">
                      {emailBcc.map((e, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-xs">
                          {e}
                          <button type="button" className="ml-1 hover:text-destructive" aria-label="Remove" onClick={() => setEmailBcc((prev) => prev.filter((_, j) => j !== i))}>×</button>
                        </span>
                      ))}
                      <input
                        type="text"
                        className="flex-1 min-w-[120px] text-xs bg-transparent border-none outline-none focus:ring-0 p-0"
                        placeholder="Add email..."
                        value={emailBccInput}
                        onChange={(ev) => setEmailBccInput(ev.target.value)}
                        onKeyDown={(ev) => {
                          if (ev.key === "Enter" || ev.key === ",") {
                            ev.preventDefault()
                            const v = (ev.key === "," ? emailBccInput.replace(/,$/, "") : emailBccInput).trim()
                            if (v) {
                              setEmailBcc((prev) => [...prev, v])
                              setEmailBccInput("")
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Subject</Label>
                    <Input
                      className="mt-1 h-8 text-xs"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1 flex-wrap border-b pb-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" type="button"><Bold className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" type="button"><Italic className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" type="button"><Underline className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" type="button"><Strikethrough className="w-3.5 h-3.5" /></Button>
                      <span className="w-px h-4 bg-border mx-0.5" />
                      <Select defaultValue="16">
                        <SelectTrigger className="h-7 w-16 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="12" className="text-xs">12 px</SelectItem><SelectItem value="14" className="text-xs">14 px</SelectItem><SelectItem value="16" className="text-xs">16 px</SelectItem></SelectContent>
                      </Select>
                      <span className="w-px h-4 bg-border mx-0.5" />
                      <Button variant="ghost" size="icon" className="h-7 w-7" type="button"><AlignLeft className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" type="button"><List className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" type="button"><Link2 className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" type="button"><ImagePlus className="w-3.5 h-3.5" /></Button>
                    </div>
                    <Textarea
                      className="min-h-[140px] text-sm resize-none"
                      defaultValue={`Dear ${selectedCustomer?.name || "Customer"} team,

It's been a great experience working with you.

Attached with this email is a list of all transactions for the period between ${filteredStatementTransactions.range.subtitle.replace(" to ", " to ")}.

If you have any questions, just drop us an email or call us.

Regards,
Sia B
Mekco Supply Inc.`}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="attach-unpaid"
                        className="mt-0.5"
                        checked={attachUnpaid}
                        onCheckedChange={(v) => setAttachUnpaid(Boolean(v))}
                      />
                      <div className="flex-1">
                        <Label htmlFor="attach-unpaid" className="text-xs font-normal cursor-pointer">Attach Unpaid invoices List</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">Include a list of all the unpaid invoices of this customer with this email.</p>
                        <span className="inline-flex items-center gap-1 mt-1 text-xs text-primary">
                          <FileText className="w-3 h-3" /> unpaid_invoices_list_2026-01-31.pdf
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="attach-statement"
                        className="mt-0.5"
                        checked={attachStatement}
                        onCheckedChange={(v) => setAttachStatement(Boolean(v))}
                      />
                      <div className="flex-1">
                        <Label htmlFor="attach-statement" className="text-xs font-normal cursor-pointer">Attach Customer Statement</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">Date Range: {filteredStatementTransactions.range.subtitle} · Filter By: {statementFilter === "all" ? "All" : statementFilter === "invoices" ? "Invoices" : statementFilter === "payments" ? "Payments" : "Credit Notes"}</p>
                        <span className="inline-flex items-center gap-1 mt-1 text-xs text-primary">
                          statement_{selectedCustomer?.name?.replace(/\s+/g, "") || "Customer"}.pdf
                          <Eye className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-1">Attachments</p>
                      <p className="text-xs text-muted-foreground/70">
                        {attachStatement && attachUnpaid ? "2 PDFs will be attached" : 
                         attachStatement ? "Statement PDF will be attached" :
                         attachUnpaid ? "Unpaid invoices PDF will be attached" :
                         "No attachments selected"}
                      </p>
                    </div>
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0 pt-4">
                  <Button variant="outline" size="sm" onClick={() => setShowSendEmailDialog(false)} disabled={sendingStatement}>Cancel</Button>
                  <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={handleSendStatement} disabled={sendingStatement}>
                    {sendingStatement ? "Sending..." : "Send"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Main Customer List View
  return (
    <DashboardLayout activeItem="Sales" activeSubItem="Customers">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 border-b shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h1 className="text-sm sm:text-base font-medium truncate shrink-0">All Customers</h1>
            <ChevronDown className="w-3.5 h-3.5 shrink-0 hidden sm:block" />
            <form
              className="relative flex-1 min-w-0 max-w-xs"
              onSubmit={(e) => { e.preventDefault(); applySearch(searchInput); }}
            >
              <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, company, email, phone..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onBlur={() => applySearch(searchInput)}
              />
            </form>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button type="button" className="bg-primary hover:bg-primary/90 h-8 sm:h-7 text-xs" onClick={() => setShowNewForm(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" />New
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 sm:h-7 sm:w-7 bg-transparent">
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex-1 flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex-1 flex items-center justify-center p-6">
            <p className="text-sm text-destructive text-center">{error}</p>
          </div>
        )}

        {/* Content: cards on mobile, table on md+ */}
        {!loading && !error && (
          <div className="flex-1 overflow-auto p-3 sm:p-4">
            {/* Mobile/tablet: card grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-3">
              {customers.map((customer, idx) => (
                <div
                  key={customer.id ?? idx}
                  className="rounded-lg border bg-card p-4 shadow-sm hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{customer.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{customer.companyName}</p>
                      {customer.email ? (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{customer.email}</p>
                      ) : null}
                    </div>
                    <p className="text-sm font-medium shrink-0">
                      ${customer.receivables.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  {customer.workPhone ? (
                    <p className="text-xs text-muted-foreground mt-2">{customer.workPhone}</p>
                  ) : null}
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden lg:block overflow-x-auto">
              <Table className="w-full min-w-[600px]">
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-8 py-1.5 px-2"><Checkbox className="h-3 w-3" /></TableHead>
                    <TableHead className="text-[10px] font-medium py-1.5 px-2">NAME</TableHead>
                    <TableHead className="text-[10px] font-medium py-1.5 px-2">COMPANY NAME</TableHead>
                    <TableHead className="text-[10px] font-medium py-1.5 px-2">EMAIL</TableHead>
                    <TableHead className="text-[10px] font-medium py-1.5 px-2">WORK PHONE</TableHead>
                    <TableHead className="text-[10px] font-medium py-1.5 px-2 text-right">RECEIVABLES</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer, idx) => (
                    <TableRow key={customer.id ?? idx} className="hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedCustomer(customer)}>
                      <TableCell className="py-1.5 px-2" onClick={(e) => e.stopPropagation()}><Checkbox className="h-3 w-3" /></TableCell>
                      <TableCell className="py-1.5 px-2">
                        <span className="text-xs text-primary hover:underline">{customer.name}</span>
                      </TableCell>
                      <TableCell className="py-1.5 px-2 text-xs">{customer.companyName}</TableCell>
                      <TableCell className="py-1.5 px-2 text-xs text-muted-foreground">{customer.email}</TableCell>
                      <TableCell className="py-1.5 px-2 text-xs">{customer.workPhone}</TableCell>
                      <TableCell className="py-1.5 px-2 text-xs text-right">${customer.receivables.toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {customers.length === 0 && !loading && (
              <p className="text-sm text-muted-foreground text-center py-8">No customers yet.</p>
            )}

            {totalCustomers > 0 && (
              <div className="flex items-center justify-between mt-3 text-xs px-3 sm:px-4">
                <span className="text-muted-foreground">
                  Showing {((currentPage - 1) * CUSTOMERS_PER_PAGE) + 1}–{Math.min(currentPage * CUSTOMERS_PER_PAGE, totalCustomers)} of {totalCustomers}
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
                    Page {currentPage} of {Math.ceil(totalCustomers / CUSTOMERS_PER_PAGE) || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    disabled={currentPage >= Math.ceil(totalCustomers / CUSTOMERS_PER_PAGE)}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
