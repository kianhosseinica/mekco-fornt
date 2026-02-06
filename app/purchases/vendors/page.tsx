"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { 
  ChevronDown, Plus, MoreHorizontal, X, Settings, Phone, Mail, 
  HelpCircle, Upload, ChevronRight, AlertTriangle, User, Filter, Search,
  FileText, CreditCard, Receipt, RefreshCw, ShoppingCart, BookOpen, Banknote,
  Layout, Globe, UserPlus, Copy, Users, UserX, Trash2, Loader2,
  Printer, Download, Bold, Italic, Underline, Strikethrough, AlignLeft,
  List, Link2, ImagePlus, Eye
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import type { 
  Vendor, 
  VendorAddress, 
  VendorContactPerson, 
  VendorComment, 
  VendorEmailLog,
  VendorCreatePayload,
  VendorUpdatePayload,
  VendorsListResponse 
} from "@/lib/vendor-types"

const API_BASE = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_API_ORIGIN || ""

// Empty address template
const emptyAddress = (): VendorAddress => ({
  type: "billing",
  attention: "",
  country: "Canada",
  street1: "",
  street2: "",
  city: "",
  state: "",
  zipCode: "",
  phone: "",
  faxNumber: "",
})

// Empty contact template
const emptyContact = (): VendorContactPerson => ({
  salutation: "",
  firstName: "",
  lastName: "",
  email: "",
  workPhone: "",
  mobile: "",
  isPrimary: false,
})

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export default function VendorsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("edit")
  const searchQuery = searchParams.get("search") || ""
  
  // List state
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [totalVendors, setTotalVendors] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const VENDORS_PER_PAGE = 20
  
  // View state
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  
  // Form state
  const [formData, setFormData] = useState({
    salutation: "",
    firstName: "",
    lastName: "",
    companyName: "",
    displayName: "",
    email: "",
    workPhone: "",
    mobilePhone: "",
    language: "en",
    currency: "CAD",
    paymentTerms: "Due on Receipt",
    openingBalance: "",
    openingBalanceDate: "",
    t4aEnabled: false,
    t5018Enabled: false,
    portalEnabled: false,
    remarks: "",
  })
  const [billingAddress, setBillingAddress] = useState<VendorAddress>(emptyAddress())
  const [shippingAddress, setShippingAddress] = useState<VendorAddress>({ ...emptyAddress(), type: "shipping" })
  const [copyBillingToShipping, setCopyBillingToShipping] = useState(false)
  const [contactPersons, setContactPersons] = useState<VendorContactPerson[]>([])
  
  // Comment state
  const [newComment, setNewComment] = useState("")
  const [vendorComments, setVendorComments] = useState<VendorComment[]>([])
  
  // Email state
  const [vendorEmails, setVendorEmails] = useState<VendorEmailLog[]>([])
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [emailTo, setEmailTo] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  
  // Statement state
  const statementRef = useRef<HTMLDivElement>(null)
  const [showSendEmailDialog, setShowSendEmailDialog] = useState(false)
  const [attachStatement, setAttachStatement] = useState(true)
  const [sendingStatement, setSendingStatement] = useState(false)
  const [statementEmailTo, setStatementEmailTo] = useState<string[]>([])
  const [statementEmailToInput, setStatementEmailToInput] = useState("")
  const [statementEmailCc, setStatementEmailCc] = useState<string[]>([])
  const [statementEmailCcInput, setStatementEmailCcInput] = useState("")
  const [statementEmailBcc, setStatementEmailBcc] = useState<string[]>([])
  const [statementEmailBccInput, setStatementEmailBccInput] = useState("")
  const [statementEmailSubject, setStatementEmailSubject] = useState("")
  const [statementEmailBody, setStatementEmailBody] = useState("")
  
  // Fetch vendors list
  const fetchVendors = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("limit", String(VENDORS_PER_PAGE))
      params.set("page", String(currentPage))
      if (searchQuery) params.set("search", searchQuery)
      
      const res = await fetch(`${API_BASE}/api/zoho/vendors/?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch vendors")
      const data: VendorsListResponse = await res.json()
      setVendors(data.vendors || [])
      setTotalVendors(data.total || 0)
    } catch (e) {
      console.error("fetchVendors error:", e)
      setError("Failed to load vendors")
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchQuery])
  
  useEffect(() => {
    fetchVendors()
  }, [fetchVendors])
  
  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])
  
  // Fetch vendor detail
  const fetchVendorDetail = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/zoho/vendors/${id}/`)
      if (!res.ok) throw new Error("Failed to fetch vendor")
      const data: Vendor = await res.json()
      setSelectedVendor(data)
      setVendorComments(data.comments || [])
      
      // Fetch emails
      const emailsRes = await fetch(`${API_BASE}/api/zoho/vendors/${id}/emails/`)
      if (emailsRes.ok) {
        const emailsData = await emailsRes.json()
        setVendorEmails(emailsData.emails || [])
      }
      
      return data
    } catch (e) {
      console.error("fetchVendorDetail error:", e)
      setError("Failed to load vendor details")
      return null
    }
  }
  
  // Handle edit mode from URL
  useEffect(() => {
    if (editId) {
      const id = parseInt(editId)
      if (!isNaN(id)) {
        fetchVendorDetail(id).then((vendor) => {
          if (vendor) {
            populateFormFromVendor(vendor)
            setShowEditForm(true)
          }
        })
      }
    }
  }, [editId])
  
  // Populate form from vendor data
  const populateFormFromVendor = (vendor: Vendor) => {
    setFormData({
      salutation: vendor.salutation || "",
      firstName: vendor.firstName || "",
      lastName: vendor.lastName || "",
      companyName: vendor.companyName || "",
      displayName: vendor.name || "",
      email: vendor.email || "",
      workPhone: vendor.workPhone || "",
      mobilePhone: vendor.mobilePhone || "",
      language: vendor.language || "en",
      currency: vendor.currency || "CAD",
      paymentTerms: vendor.paymentTerms || "Due on Receipt",
      openingBalance: vendor.openingBalance?.toString() || "",
      openingBalanceDate: vendor.openingBalanceDate || "",
      t4aEnabled: vendor.t4aEnabled || false,
      t5018Enabled: vendor.t5018Enabled || false,
      portalEnabled: vendor.portalEnabled || false,
      remarks: vendor.remarks || "",
    })
    
    // Addresses
    const billing = vendor.addresses?.find(a => a.type === "billing")
    const shipping = vendor.addresses?.find(a => a.type === "shipping")
    if (billing) setBillingAddress(billing)
    else setBillingAddress(emptyAddress())
    if (shipping) setShippingAddress(shipping)
    else setShippingAddress({ ...emptyAddress(), type: "shipping" })
    
    // Contacts
    setContactPersons(vendor.contactPersons || [])
  }
  
  // Reset form
  const resetForm = () => {
    setFormData({
      salutation: "",
      firstName: "",
      lastName: "",
      companyName: "",
      displayName: "",
      email: "",
      workPhone: "",
      mobilePhone: "",
      language: "en",
      currency: "CAD",
      paymentTerms: "Due on Receipt",
      openingBalance: "",
      openingBalanceDate: "",
      t4aEnabled: false,
      t5018Enabled: false,
      portalEnabled: false,
      remarks: "",
    })
    setBillingAddress(emptyAddress())
    setShippingAddress({ ...emptyAddress(), type: "shipping" })
    setCopyBillingToShipping(false)
    setContactPersons([])
    setError("")
  }
  
  // Handle copy billing to shipping
  useEffect(() => {
    if (copyBillingToShipping) {
      setShippingAddress({
        ...billingAddress,
        type: "shipping",
        id: shippingAddress.id,
      })
    }
  }, [copyBillingToShipping, billingAddress])
  
  // Save vendor (create or update)
  const handleSave = async () => {
    if (!formData.displayName.trim()) {
      setError("Display Name is required")
      return
    }
    
    setSaving(true)
    setError("")
    
    try {
      const payload: VendorCreatePayload = {
        name: formData.displayName.trim(),
        companyName: formData.companyName.trim() || formData.displayName.trim(),
        salutation: formData.salutation,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        workPhone: formData.workPhone,
        mobilePhone: formData.mobilePhone,
        language: formData.language,
        currency: formData.currency,
        paymentTerms: formData.paymentTerms,
        openingBalance: formData.openingBalance ? parseFloat(formData.openingBalance) : undefined,
        openingBalanceDate: formData.openingBalanceDate || undefined,
        t4aEnabled: formData.t4aEnabled,
        t5018Enabled: formData.t5018Enabled,
        portalEnabled: formData.portalEnabled,
        remarks: formData.remarks,
        billingAddress: billingAddress.street1 ? {
          attention: billingAddress.attention,
          country: billingAddress.country,
          street1: billingAddress.street1,
          street2: billingAddress.street2,
          city: billingAddress.city,
          state: billingAddress.state,
          zipCode: billingAddress.zipCode,
          phone: billingAddress.phone,
          faxNumber: billingAddress.faxNumber,
        } : undefined,
        shippingAddress: shippingAddress.street1 ? {
          attention: shippingAddress.attention,
          country: shippingAddress.country,
          street1: shippingAddress.street1,
          street2: shippingAddress.street2,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipCode,
          phone: shippingAddress.phone,
          faxNumber: shippingAddress.faxNumber,
        } : undefined,
        contactPersons: contactPersons.filter(c => c.firstName || c.lastName || c.email).map(c => ({
          salutation: c.salutation,
          firstName: c.firstName,
          lastName: c.lastName,
          email: c.email,
          workPhone: c.workPhone,
          mobile: c.mobile,
        })),
      }
      
      let res: Response
      if (showEditForm && selectedVendor) {
        // Update
        res = await fetch(`${API_BASE}/api/zoho/vendors/${selectedVendor.id}/update/`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        // Create
        res = await fetch(`${API_BASE}/api/zoho/vendors/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }
      
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Failed to save vendor")
      }
      
      const savedVendor: Vendor = await res.json()
      
      // If editing, also update addresses separately
      if (showEditForm && selectedVendor) {
        if (billingAddress.street1) {
          await fetch(`${API_BASE}/api/zoho/vendors/${selectedVendor.id}/addresses/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...billingAddress, type: "billing" }),
          })
        }
        if (shippingAddress.street1) {
          await fetch(`${API_BASE}/api/zoho/vendors/${selectedVendor.id}/addresses/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...shippingAddress, type: "shipping" }),
          })
        }
      }
      
      // Refresh list and show detail
      await fetchVendors()
      setSelectedVendor(savedVendor)
      setShowNewForm(false)
      setShowEditForm(false)
      resetForm()
      router.replace("/purchases/vendors")
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Failed to save vendor"
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }
  
  // Delete vendor
  const handleDelete = async () => {
    if (!selectedVendor) return
    if (!confirm(`Are you sure you want to delete "${selectedVendor.name}"?`)) return
    
    try {
      const res = await fetch(`${API_BASE}/api/zoho/vendors/${selectedVendor.id}/delete/`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete vendor")
      
      setSelectedVendor(null)
      await fetchVendors()
    } catch (e) {
      console.error("handleDelete error:", e)
      setError("Failed to delete vendor")
    }
  }
  
  // Add comment
  const handleAddComment = async () => {
    if (!selectedVendor || !newComment.trim()) return
    
    try {
      const res = await fetch(`${API_BASE}/api/zoho/vendors/${selectedVendor.id}/comments/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      })
      if (!res.ok) throw new Error("Failed to add comment")
      
      const data: Vendor = await res.json()
      setVendorComments(data.comments || [])
      setNewComment("")
    } catch (e) {
      console.error("handleAddComment error:", e)
    }
  }
  
  // Send email
  const handleSendEmail = async () => {
    if (!selectedVendor || !emailTo.trim()) return
    
    try {
      const res = await fetch(`${API_BASE}/api/zoho/vendors/${selectedVendor.id}/send-email/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: emailTo,
          subject: emailSubject,
          body: emailBody,
          emailType: "other",
        }),
      })
      if (!res.ok) throw new Error("Failed to send email")
      
      // Refresh emails
      const emailsRes = await fetch(`${API_BASE}/api/zoho/vendors/${selectedVendor.id}/emails/`)
      if (emailsRes.ok) {
        const emailsData = await emailsRes.json()
        setVendorEmails(emailsData.emails || [])
      }
      
      setShowEmailForm(false)
      setEmailTo("")
      setEmailSubject("")
      setEmailBody("")
    } catch (e) {
      console.error("handleSendEmail error:", e)
    }
  }
  
  const getStatementRange = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
    return {
      label: `From ${fmt(start)} to ${fmt(end)}`,
      subtitle: `${fmt(start)} to ${fmt(end)}`,
    }
  }

  // Build statement HTML for print/PDF — exact same layout and styles as on-screen preview (like invoices/sales orders)
  const getVendorStatementPrintDocument = (
    vendor: Vendor,
    range: { subtitle: string },
    billedAmount: number,
    amountPaid: number,
    balanceDue: number,
  ) => {
    const logoUrl = typeof window !== "undefined" ? `${window.location.origin}/Mekco-Supply-logo-300px.png` : ""
    const vendorName = vendor.name || "Vendor"
    const billingAddr = vendor.addresses?.find((a) => a.type === "billing")
    const addressLine = billingAddr?.street1
      ? [billingAddr.street1, billingAddr.street2, billingAddr.city, billingAddr.state, billingAddr.zipCode, billingAddr.country].filter(Boolean).join(" / ")
      : ""

    const bodyHtml = `
  <div style="width:100%;margin:0;padding:0;min-height:100%;">
    <div style="border:1px solid #e5e7eb;border-radius:8px;background:#fff;padding:20px 24px;box-shadow:0 1px 3px 0 rgb(0 0 0/0.1);width:100%;box-sizing:border-box;">
      <div style="text-align:center;margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid #e5e7eb;">
        <h2 style="font-size:18px;font-weight:500;margin:0 0 4px 0;color:#111;">Vendor Statement For ${escapeHtml(vendorName)}</h2>
        <p style="font-size:13px;color:#6b7280;margin:0;">From ${escapeHtml(range.subtitle.replace(" to ", " To "))}</p>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;">
        <div style="width:96px;height:64px;border-radius:6px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#fff;flex-shrink:0;">
          <img src="${logoUrl}" alt="Mekco Supply Inc." style="object-fit:contain;width:100%;height:100%;padding:4px;" />
        </div>
        <div style="text-align:right;font-size:14px;">
          <p style="font-weight:600;margin:0;">Mekco Supply Inc.</p>
          <p style="color:#6b7280;margin:2px 0 0 0;font-size:12px;">16-110 West Beaver Creek Rd.</p>
          <p style="color:#6b7280;margin:2px 0 0 0;font-size:12px;">Richmond Hill, Ontario L4B 1J9</p>
        </div>
      </div>
      <div style="margin-bottom:20px;">
        <p style="font-size:12px;color:#6b7280;margin:0 0 4px 0;">To</p>
        <p style="font-size:14px;font-weight:500;color:#111;margin:0;">${escapeHtml(vendorName)}</p>
        ${addressLine ? `<p style="font-size:12px;color:#6b7280;margin:4px 0 0 0;">${escapeHtml(addressLine)}</p>` : ""}
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;margin-bottom:20px;">
        <div style="text-align:right;margin-bottom:8px;">
          <h3 style="font-size:20px;font-weight:700;margin:0 0 2px 0;">Statement of Accounts</h3>
          <p style="font-size:13px;color:#6b7280;margin:0;">${escapeHtml(range.subtitle)}</p>
        </div>
        <div style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;width:100%;max-width:18rem;">
          <div style="background:#f3f4f6;padding:8px 12px;">
            <h4 style="font-size:14px;font-weight:500;margin:0;">Account Summary</h4>
          </div>
          <div style="padding:8px 12px;font-size:14px;">
            <div style="display:flex;justify-content:space-between;padding:4px 0;"><span>Opening Balance</span><span>$0.00</span></div>
            <div style="display:flex;justify-content:space-between;padding:4px 0;"><span>Billed Amount</span><span>$${(billedAmount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></div>
            <div style="display:flex;justify-content:space-between;padding:4px 0;"><span>Amount Paid</span><span>$${amountPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></div>
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-weight:500;"><span>Balance Due</span><span>$${balanceDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></div>
          </div>
        </div>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="padding:8px 12px;font-size:12px;font-weight:500;text-align:left;border:1px solid #e5e7eb;">Date</th>
            <th style="padding:8px 12px;font-size:12px;font-weight:500;text-align:left;border:1px solid #e5e7eb;">Transactions</th>
            <th style="padding:8px 12px;font-size:12px;font-weight:500;text-align:left;border:1px solid #e5e7eb;">Details</th>
            <th style="padding:8px 12px;font-size:12px;font-weight:500;text-align:right;border:1px solid #e5e7eb;">Amount</th>
            <th style="padding:8px 12px;font-size:12px;font-weight:500;text-align:right;border:1px solid #e5e7eb;">Payments</th>
            <th style="padding:8px 12px;font-size:12px;font-weight:500;text-align:right;border:1px solid #e5e7eb;">Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:8px 12px;font-size:12px;border:1px solid #e5e7eb;">${escapeHtml(range.subtitle.split(" to ")[0] || "Feb 01, 2026")}</td>
            <td style="padding:8px 12px;font-size:12px;border:1px solid #e5e7eb;">***Opening Balance***</td>
            <td style="padding:8px 12px;font-size:12px;border:1px solid #e5e7eb;"></td>
            <td style="padding:8px 12px;font-size:12px;text-align:right;border:1px solid #e5e7eb;">0.00</td>
            <td style="padding:8px 12px;font-size:12px;text-align:right;border:1px solid #e5e7eb;"></td>
            <td style="padding:8px 12px;font-size:12px;text-align:right;border:1px solid #e5e7eb;">0.00</td>
          </tr>
        </tbody>
      </table>
      <div style="display:flex;justify-content:flex-end;margin-top:12px;">
        <div style="font-size:14px;font-weight:500;">Balance Due <span style="margin-left:32px;">$${balanceDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></div>
      </div>
    </div>
  </div>`
    const title = `Statement - ${vendorName}`
    const fullPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; width: 100%; min-height: 100%; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fff; color: #111; font-size: 14px; }
    @media print {
      html, body { margin: 0; padding: 0; }
      @page { margin: 0; size: auto; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>${bodyHtml}</body>
</html>`
    return { title, fullPage }
  }

  const handleDownloadStatement = () => {
    if (!selectedVendor) return
    const range = getStatementRange()
    const billedAmount = selectedVendor.payables ?? 0
    const amountPaid = 0
    const balanceDue = billedAmount - amountPaid
    const { fullPage } = getVendorStatementPrintDocument(selectedVendor, range, billedAmount, amountPaid, balanceDue)
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(fullPage)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => printWindow.print(), 250)
    }
  }

  const handlePrintStatement = () => {
    if (!selectedVendor) return
    const range = getStatementRange()
    const billedAmount = selectedVendor.payables ?? 0
    const amountPaid = 0
    const balanceDue = billedAmount - amountPaid
    const { fullPage } = getVendorStatementPrintDocument(selectedVendor, range, billedAmount, amountPaid, balanceDue)
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(fullPage)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
  }
  
  useEffect(() => {
    if (showSendEmailDialog && selectedVendor) {
      const range = getStatementRange()
      if (selectedVendor.email) {
        setStatementEmailTo([selectedVendor.email])
      }
      setStatementEmailSubject(`Statement of transactions with Mekco Supply Inc.`)
      setStatementEmailBody(`Dear ${selectedVendor.name || "Vendor"},\n\nPlease find attached a list of all your transactions with us for the period between ${range.subtitle}.\n\nYou can write to us or call us if you need any assistance or clarifications.`)
      setAttachStatement(true)
    }
  }, [showSendEmailDialog, selectedVendor])
  
  const handleSendStatement = async () => {
    if (!selectedVendor || statementEmailTo.length === 0) return
    try {
      setSendingStatement(true)
      const res = await fetch(`${API_BASE}/api/zoho/vendors/${selectedVendor.id}/send-email/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: statementEmailTo.join(", "),
          cc: statementEmailCc.length ? statementEmailCc.join(", ") : undefined,
          bcc: statementEmailBcc.length ? statementEmailBcc.join(", ") : undefined,
          subject: statementEmailSubject,
          body: statementEmailBody,
          emailType: "statement",
          attachStatement: !!attachStatement,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "Failed to send statement email")
      setShowSendEmailDialog(false)
    } catch (e) {
      console.error("handleSendStatement error:", e)
    } finally {
      setSendingStatement(false)
    }
  }
  
  // Add contact person
  const addContactPerson = () => {
    setContactPersons([...contactPersons, emptyContact()])
  }
  
  // Remove contact person
  const removeContactPerson = (index: number) => {
    setContactPersons(contactPersons.filter((_, i) => i !== index))
  }
  
  // Update contact person
  const updateContactPerson = (index: number, field: keyof VendorContactPerson, value: string | boolean) => {
    const updated = [...contactPersons]
    updated[index] = { ...updated[index], [field]: value }
    setContactPersons(updated)
  }
  
  // Format date
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return ""
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }
  
  // Pagination
  const totalPages = Math.ceil(totalVendors / VENDORS_PER_PAGE)

  // New Vendor Form
  if (showNewForm || showEditForm) {
    return (
      <DashboardLayout activeItem="Purchases" activeSubItem="Vendors">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h1 className="text-lg font-semibold">{showEditForm ? "Edit Vendor" : "New Vendor"}</h1>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <div className="max-w-3xl space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded">
                  {error}
                </div>
              )}
              
              {/* Primary Contact */}
              <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start gap-2">
                <Label className="text-sm text-muted-foreground flex items-center gap-1 pt-2">
                  Primary Contact <HelpCircle className="w-3.5 h-3.5" />
                </Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={formData.salutation} onValueChange={(v) => setFormData({ ...formData, salutation: v })}>
                    <SelectTrigger className="h-9 text-sm w-full sm:w-28"><SelectValue placeholder="Salutation" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mr.">Mr.</SelectItem>
                      <SelectItem value="Mrs.">Mrs.</SelectItem>
                      <SelectItem value="Ms.">Ms.</SelectItem>
                      <SelectItem value="Miss">Miss</SelectItem>
                      <SelectItem value="Dr.">Dr.</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    className="h-9 text-sm" 
                    placeholder="First Name" 
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                  <Input 
                    className="h-9 text-sm" 
                    placeholder="Last Name" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              {/* Company Name */}
              <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-center gap-2">
                <Label className="text-sm text-muted-foreground">Company Name</Label>
                <Input 
                  className="h-9 text-sm max-w-lg" 
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>

              {/* Display Name */}
              <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-center gap-2">
                <Label className="text-sm text-primary flex items-center gap-1">
                  Display Name* <HelpCircle className="w-3.5 h-3.5" />
                </Label>
                <Input 
                  className="h-9 text-sm max-w-lg" 
                  placeholder="Enter display name"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                />
              </div>

              {/* Email Address */}
              <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-center gap-2">
                <Label className="text-sm text-muted-foreground flex items-center gap-1">
                  Email Address <HelpCircle className="w-3.5 h-3.5" />
                </Label>
                <div className="flex items-center gap-2 max-w-lg">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Input 
                    className="h-9 text-sm" 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start gap-2">
                <Label className="text-sm text-muted-foreground flex items-center gap-1 pt-2">
                  Phone <HelpCircle className="w-3.5 h-3.5" />
                </Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input 
                    className="h-9 text-sm flex-1" 
                    placeholder="Work Phone" 
                    value={formData.workPhone}
                    onChange={(e) => setFormData({ ...formData, workPhone: e.target.value })}
                  />
                  <Input 
                    className="h-9 text-sm flex-1" 
                    placeholder="Mobile" 
                    value={formData.mobilePhone}
                    onChange={(e) => setFormData({ ...formData, mobilePhone: e.target.value })}
                  />
                </div>
              </div>

              {/* Vendor Language */}
              <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-center gap-2">
                <Label className="text-sm text-muted-foreground flex items-center gap-1">
                  Vendor Language <HelpCircle className="w-3.5 h-3.5" />
                </Label>
                <Select value={formData.language} onValueChange={(v) => setFormData({ ...formData, language: v })}>
                  <SelectTrigger className="h-9 text-sm max-w-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tabs Section */}
              <Tabs defaultValue="other" className="mt-6">
                <TabsList className="h-auto p-0 bg-transparent border-b rounded-none w-full justify-start gap-0 flex-wrap">
                  <TabsTrigger value="other" className="text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">Other Details</TabsTrigger>
                  <TabsTrigger value="address" className="text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">Address</TabsTrigger>
                  <TabsTrigger value="contacts" className="text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">Contact Persons</TabsTrigger>
                  <TabsTrigger value="remarks" className="text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">Remarks</TabsTrigger>
                </TabsList>

                <TabsContent value="other" className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-center gap-2">
                    <Label className="text-sm text-muted-foreground">Currency</Label>
                    <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                      <SelectTrigger className="h-9 text-sm max-w-lg"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-center gap-2">
                    <Label className="text-sm text-muted-foreground">Opening Balance</Label>
                    <div className="flex max-w-lg">
                      <span className="inline-flex items-center px-3 text-sm bg-muted border border-r-0 rounded-l">{formData.currency}</span>
                      <Input 
                        className="h-9 text-sm rounded-l-none" 
                        type="number"
                        step="0.01"
                        value={formData.openingBalance}
                        onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-center gap-2">
                    <Label className="text-sm text-muted-foreground">Opening Balance Date</Label>
                    <Input 
                      className="h-9 text-sm max-w-lg" 
                      type="date"
                      value={formData.openingBalanceDate}
                      onChange={(e) => setFormData({ ...formData, openingBalanceDate: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-center gap-2">
                    <Label className="text-sm text-muted-foreground">Payment Terms</Label>
                    <Select value={formData.paymentTerms} onValueChange={(v) => setFormData({ ...formData, paymentTerms: v })}>
                      <SelectTrigger className="h-9 text-sm max-w-lg"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                        <SelectItem value="Net 15">Net 15</SelectItem>
                        <SelectItem value="Net 30">Net 30</SelectItem>
                        <SelectItem value="Net 45">Net 45</SelectItem>
                        <SelectItem value="Net 60">Net 60</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start gap-2">
                    <Label className="text-sm text-primary pt-2">Payment Tracking for Reporting*</Label>
                    <RadioGroup 
                      value={formData.t4aEnabled ? "t4a" : formData.t5018Enabled ? "t5018" : "off"} 
                      onValueChange={(v) => setFormData({ 
                        ...formData, 
                        t4aEnabled: v === "t4a", 
                        t5018Enabled: v === "t5018" 
                      })}
                      className="flex flex-wrap gap-4"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="off" id="off" />
                        <Label htmlFor="off" className="text-sm font-normal cursor-pointer">Turn off tracking</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="t4a" id="t4a" />
                        <Label htmlFor="t4a" className="text-sm font-normal cursor-pointer">Track for T4A slip</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="t5018" id="t5018" />
                        <Label htmlFor="t5018" className="text-sm font-normal cursor-pointer">Track for T5018 slip</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-center gap-2">
                    <Label className="text-sm text-muted-foreground flex items-center gap-1">
                      Enable Portal? <HelpCircle className="w-3.5 h-3.5" />
                    </Label>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="portal" 
                        checked={formData.portalEnabled}
                        onCheckedChange={(checked) => setFormData({ ...formData, portalEnabled: !!checked })}
                      />
                      <Label htmlFor="portal" className="text-sm font-normal cursor-pointer">Allow portal access for this vendor</Label>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="address" className="mt-4 space-y-6">
                  {/* Billing Address */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Billing Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Attention</Label>
                        <Input 
                          className="h-9 text-sm mt-1" 
                          value={billingAddress.attention}
                          onChange={(e) => setBillingAddress({ ...billingAddress, attention: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Country/Region</Label>
                        <Input 
                          className="h-9 text-sm mt-1" 
                          value={billingAddress.country}
                          onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs text-muted-foreground">Street 1</Label>
                        <Input 
                          className="h-9 text-sm mt-1" 
                          value={billingAddress.street1}
                          onChange={(e) => setBillingAddress({ ...billingAddress, street1: e.target.value })}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs text-muted-foreground">Street 2</Label>
                        <Input 
                          className="h-9 text-sm mt-1" 
                          value={billingAddress.street2}
                          onChange={(e) => setBillingAddress({ ...billingAddress, street2: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">City</Label>
                        <Input 
                          className="h-9 text-sm mt-1" 
                          value={billingAddress.city}
                          onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">State/Province</Label>
                        <Input 
                          className="h-9 text-sm mt-1" 
                          value={billingAddress.state}
                          onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">ZIP/Postal Code</Label>
                        <Input 
                          className="h-9 text-sm mt-1" 
                          value={billingAddress.zipCode}
                          onChange={(e) => setBillingAddress({ ...billingAddress, zipCode: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Phone</Label>
                        <Input 
                          className="h-9 text-sm mt-1" 
                          value={billingAddress.phone}
                          onChange={(e) => setBillingAddress({ ...billingAddress, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Fax Number</Label>
                        <Input 
                          className="h-9 text-sm mt-1" 
                          value={billingAddress.faxNumber}
                          onChange={(e) => setBillingAddress({ ...billingAddress, faxNumber: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium">Shipping Address</h3>
                      <div className="flex items-center gap-2 ml-4">
                        <Checkbox 
                          id="copyBilling" 
                          checked={copyBillingToShipping}
                          onCheckedChange={(checked) => setCopyBillingToShipping(!!checked)}
                        />
                        <Label htmlFor="copyBilling" className="text-xs text-muted-foreground cursor-pointer">Copy billing address</Label>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Attention</Label>
                        <Input 
                          className="h-9 text-sm mt-1" 
                          value={shippingAddress.attention}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, attention: e.target.value })}
                          disabled={copyBillingToShipping}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Country/Region</Label>
                        <Input 
                          className="h-9 text-sm mt-1" 
                          value={shippingAddress.country}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                          disabled={copyBillingToShipping}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs text-muted-foreground">Street 1</Label>
                        <Input 
                          className="h-9 text-sm mt-1" 
                          value={shippingAddress.street1}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, street1: e.target.value })}
                          disabled={copyBillingToShipping}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs text-muted-foreground">Street 2</Label>
                        <Input 
                          className="h-9 text-sm mt-1" 
                          value={shippingAddress.street2}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, street2: e.target.value })}
                          disabled={copyBillingToShipping}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">City</Label>
                        <Input 
                          className="h-9 text-sm mt-1" 
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          disabled={copyBillingToShipping}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">State/Province</Label>
                        <Input 
                          className="h-9 text-sm mt-1" 
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                          disabled={copyBillingToShipping}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">ZIP/Postal Code</Label>
                        <Input 
                          className="h-9 text-sm mt-1" 
                          value={shippingAddress.zipCode}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                          disabled={copyBillingToShipping}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Phone</Label>
                        <Input 
                          className="h-9 text-sm mt-1" 
                          value={shippingAddress.phone}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                          disabled={copyBillingToShipping}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Fax Number</Label>
                        <Input 
                          className="h-9 text-sm mt-1" 
                          value={shippingAddress.faxNumber}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, faxNumber: e.target.value })}
                          disabled={copyBillingToShipping}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="contacts" className="mt-4">
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Salutation</TableHead>
                            <TableHead className="text-xs">First Name</TableHead>
                            <TableHead className="text-xs">Last Name</TableHead>
                            <TableHead className="text-xs">Email Address</TableHead>
                            <TableHead className="text-xs">Work Phone</TableHead>
                            <TableHead className="text-xs">Mobile</TableHead>
                            <TableHead className="text-xs w-10"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {contactPersons.map((contact, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="p-1">
                                <Select 
                                  value={contact.salutation} 
                                  onValueChange={(v) => updateContactPerson(idx, "salutation", v)}
                                >
                                  <SelectTrigger className="h-8 text-xs w-20"><SelectValue placeholder="-" /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Mr.">Mr.</SelectItem>
                                    <SelectItem value="Mrs.">Mrs.</SelectItem>
                                    <SelectItem value="Ms.">Ms.</SelectItem>
                                    <SelectItem value="Miss">Miss</SelectItem>
                                    <SelectItem value="Dr.">Dr.</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="p-1">
                                <Input 
                                  className="h-8 text-xs" 
                                  value={contact.firstName}
                                  onChange={(e) => updateContactPerson(idx, "firstName", e.target.value)}
                                />
                              </TableCell>
                              <TableCell className="p-1">
                                <Input 
                                  className="h-8 text-xs" 
                                  value={contact.lastName}
                                  onChange={(e) => updateContactPerson(idx, "lastName", e.target.value)}
                                />
                              </TableCell>
                              <TableCell className="p-1">
                                <Input 
                                  className="h-8 text-xs" 
                                  type="email"
                                  value={contact.email}
                                  onChange={(e) => updateContactPerson(idx, "email", e.target.value)}
                                />
                              </TableCell>
                              <TableCell className="p-1">
                                <Input 
                                  className="h-8 text-xs" 
                                  value={contact.workPhone}
                                  onChange={(e) => updateContactPerson(idx, "workPhone", e.target.value)}
                                />
                              </TableCell>
                              <TableCell className="p-1">
                                <Input 
                                  className="h-8 text-xs" 
                                  value={contact.mobile}
                                  onChange={(e) => updateContactPerson(idx, "mobile", e.target.value)}
                                />
                              </TableCell>
                              <TableCell className="p-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => removeContactPerson(idx)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 text-xs bg-transparent" onClick={addContactPerson}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Contact Person
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="remarks" className="mt-4">
                  <Textarea 
                    placeholder="Enter remarks..." 
                    className="min-h-[100px]" 
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-3 border-t bg-muted/30">
            <Button className="bg-primary hover:bg-primary/90" onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save
            </Button>
            <Button variant="outline" className="bg-transparent" onClick={() => { 
              setShowNewForm(false)
              setShowEditForm(false)
              resetForm()
              router.replace("/purchases/vendors")
            }}>
              Cancel
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Vendor Detail View (slide-over panel)
  if (selectedVendor && !showEditForm) {
    const billingAddr = selectedVendor.addresses?.find(a => a.type === "billing")
    const shippingAddr = selectedVendor.addresses?.find(a => a.type === "shipping")
    
    return (
      <DashboardLayout activeItem="Purchases" activeSubItem="Vendors">
        <div className="flex flex-col md:flex-row h-full">
          {/* Left: Vendor List (narrower) */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r flex flex-col shrink-0 max-h-[200px] md:max-h-none">
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-medium">All Vendors</h1>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="default" className="h-7 w-7 bg-primary" onClick={() => { setSelectedVendor(null); setShowNewForm(true) }}>
                  <Plus className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              {vendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-muted/50 border-b ${selectedVendor?.id === vendor.id ? 'bg-muted' : ''}`}
                  onClick={() => fetchVendorDetail(vendor.id)}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox className="h-3.5 w-3.5" />
                    <div>
                      <p className="text-xs font-medium">{vendor.name}</p>
                      <p className="text-[10px] text-muted-foreground">${vendor.payables?.toFixed(2) || "0.00"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Vendor Detail */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Detail Header */}
            <div className="flex flex-wrap items-center justify-between px-4 py-2 border-b gap-2">
              <h2 className="text-lg font-semibold">{selectedVendor.name}</h2>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs bg-transparent" onClick={() => {
                  populateFormFromVendor(selectedVendor)
                  setShowEditForm(true)
                }}>Edit</Button>
                <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent"><Settings className="w-4 h-4" /></Button>
                
                {/* New Transaction Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 h-8 text-xs">
                      New Transaction <ChevronDown className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="text-[10px] text-muted-foreground font-medium">PURCHASES</DropdownMenuLabel>
                    <DropdownMenuItem className="text-xs cursor-pointer">
                      <FileText className="w-3.5 h-3.5 mr-2" />
                      Bill
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-xs cursor-pointer">
                      <CreditCard className="w-3.5 h-3.5 mr-2" />
                      Bill Payment
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-xs cursor-pointer">
                      <Receipt className="w-3.5 h-3.5 mr-2" />
                      Expense
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-xs cursor-pointer">
                      <ShoppingCart className="w-3.5 h-3.5 mr-2" />
                      Purchase Order
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-xs cursor-pointer">
                      <BookOpen className="w-3.5 h-3.5 mr-2" />
                      Vendor Credit
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* More Options Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs bg-transparent">
                      More <ChevronDown className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="text-xs cursor-pointer" onClick={() => {
                      setEmailTo(selectedVendor.email || "")
                      setShowEmailForm(true)
                    }}>
                      <Mail className="w-3.5 h-3.5 mr-2" />
                      Email Vendor
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-xs cursor-pointer text-destructive focus:text-destructive" onClick={handleDelete}>
                      <Trash2 className="w-3.5 h-3.5 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedVendor(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Detail Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="h-auto p-0 bg-transparent border-b rounded-none px-4 justify-start gap-0 flex-wrap">
                <TabsTrigger value="overview" className="text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">Overview</TabsTrigger>
                <TabsTrigger value="comments" className="text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">Comments</TabsTrigger>
                <TabsTrigger value="transactions" className="text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">Transactions</TabsTrigger>
                <TabsTrigger value="mails" className="text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">Mails</TabsTrigger>
                <TabsTrigger value="statement" className="text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">Statement</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="flex-1 overflow-auto p-4 mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Contact Info */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {selectedVendor.firstName || selectedVendor.lastName 
                            ? `${selectedVendor.firstName || ""} ${selectedVendor.lastName || ""}`.trim()
                            : selectedVendor.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{selectedVendor.email || "No email"}</p>
                        {selectedVendor.workPhone && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {selectedVendor.workPhone}
                          </p>
                        )}
                        {selectedVendor.mobilePhone && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {selectedVendor.mobilePhone}
                          </p>
                        )}
                        <div className="flex gap-2 pt-1">
                          <button 
                            className="text-xs text-primary hover:underline"
                            onClick={() => {
                              setEmailTo(selectedVendor.email || "")
                              setShowEmailForm(true)
                            }}
                          >
                            Send Email
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ADDRESS Section */}
                    <div className="border rounded">
                      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
                        <span className="text-xs font-medium">ADDRESS</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                      <div className="p-3 space-y-3">
                        <div>
                          <p className="text-xs font-medium">Billing Address</p>
                          {billingAddr?.street1 ? (
                            <div className="text-xs text-muted-foreground">
                              {billingAddr.attention && <p>{billingAddr.attention}</p>}
                              <p>{billingAddr.street1}</p>
                              {billingAddr.street2 && <p>{billingAddr.street2}</p>}
                              <p>{billingAddr.city}{billingAddr.state ? `, ${billingAddr.state}` : ""} {billingAddr.zipCode}</p>
                              {billingAddr.country && <p>{billingAddr.country}</p>}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">No Billing Address</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-medium">Shipping Address</p>
                          {shippingAddr?.street1 ? (
                            <div className="text-xs text-muted-foreground">
                              {shippingAddr.attention && <p>{shippingAddr.attention}</p>}
                              <p>{shippingAddr.street1}</p>
                              {shippingAddr.street2 && <p>{shippingAddr.street2}</p>}
                              <p>{shippingAddr.city}{shippingAddr.state ? `, ${shippingAddr.state}` : ""} {shippingAddr.zipCode}</p>
                              {shippingAddr.country && <p>{shippingAddr.country}</p>}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">No Shipping Address</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* OTHER DETAILS Section */}
                    <div className="border rounded">
                      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
                        <span className="text-xs font-medium">OTHER DETAILS</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                      <div className="p-3 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Default Currency</span>
                          <span className="text-xs">{selectedVendor.currency || "CAD"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Payment Terms</span>
                          <span className="text-xs">{selectedVendor.paymentTerms || "Due on Receipt"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Portal Status</span>
                          <span className={`text-xs ${selectedVendor.portalEnabled ? "text-green-500" : "text-red-500"}`}>
                            {selectedVendor.portalStatus || "Disabled"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CONTACT PERSONS */}
                    <div className="border rounded">
                      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
                        <span className="text-xs font-medium">CONTACT PERSONS ({selectedVendor.contactPersons?.length || 0})</span>
                        <div className="flex items-center gap-1">
                          <ChevronDown className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div className="p-3 space-y-2">
                        {selectedVendor.contactPersons?.map((person) => (
                          <div key={person.id} className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">
                                {person.salutation} {person.firstName} {person.lastName}
                              </p>
                              <p className="text-[10px] text-muted-foreground">{person.email}</p>
                            </div>
                          </div>
                        ))}
                        {!selectedVendor.contactPersons?.length && (
                          <p className="text-xs text-muted-foreground">No contact persons</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Payment due period */}
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Payment due period</p>
                      <p className="text-sm font-medium">{selectedVendor.paymentTerms || "Due on Receipt"}</p>
                    </div>

                    {/* Payables */}
                    <div className="border rounded">
                      <div className="px-3 py-2 border-b bg-muted/30">
                        <span className="text-sm font-medium">Payables</span>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/20">
                            <TableHead className="text-[10px] font-medium py-1.5 px-2">CURRENCY</TableHead>
                            <TableHead className="text-[10px] font-medium py-1.5 px-2 text-right">OUTSTANDING PAYABLES</TableHead>
                            <TableHead className="text-[10px] font-medium py-1.5 px-2 text-right">UNUSED CREDITS</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="py-1.5 px-2 text-xs">{selectedVendor.currency || "CAD"}</TableCell>
                            <TableCell className="py-1.5 px-2 text-xs text-right">${selectedVendor.payables?.toFixed(2) || "0.00"}</TableCell>
                            <TableCell className="py-1.5 px-2 text-xs text-right">$0.00</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    {/* Remarks */}
                    {selectedVendor.remarks && (
                      <div className="border rounded">
                        <div className="px-3 py-2 border-b bg-muted/30">
                          <span className="text-sm font-medium">Remarks</span>
                        </div>
                        <div className="p-3">
                          <p className="text-xs text-muted-foreground whitespace-pre-wrap">{selectedVendor.remarks}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="transactions" className="flex-1 overflow-auto p-4 mt-0">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm">Go to transactions</span>
                  <ChevronDown className="w-4 h-4" />
                </div>

                {/* Bills Section */}
                <div className="border rounded mb-4">
                  <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
                    <div className="flex items-center gap-2">
                      <ChevronDown className="w-4 h-4" />
                      <span className="text-sm font-medium">Bills</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Status: All</span>
                      <Button size="sm" variant="link" className="h-auto p-0 text-xs text-primary">
                        <Plus className="w-3 h-3 mr-1" /> New
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No bills found
                  </div>
                </div>

                {/* Collapsible Sections */}
                {["Bill Payments", "Expenses", "Purchase Orders", "Vendor Credits"].map((section) => (
                  <div key={section} className="border rounded mb-2">
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-sm font-medium">{section}</span>
                      </div>
                      <Button size="sm" variant="link" className="h-auto p-0 text-xs text-primary">
                        <Plus className="w-3 h-3 mr-1" /> New
                      </Button>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="comments" className="flex-1 overflow-auto p-6 mt-0">
                {/* Rich Text Editor */}
                <div className="border rounded-lg overflow-hidden max-w-2xl">
                  <div className="flex items-center gap-1 px-3 py-2 border-b bg-muted/30">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 font-bold text-sm">B</Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 italic text-sm">I</Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 underline text-sm">U</Button>
                  </div>
                  <Textarea 
                    placeholder="Add a comment..." 
                    className="text-sm min-h-[60px] border-0 rounded-none focus-visible:ring-0 resize-none" 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-xs mt-3 bg-transparent"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  Add Comment
                </Button>

                {/* All Comments Section */}
                <div className="mt-8 max-w-2xl">
                  <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">ALL COMMENTS</h3>
                  {vendorComments.length > 0 ? (
                    <div className="space-y-4 mt-4">
                      {vendorComments.map((comment) => (
                        <div key={comment.id} className="border-b pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium">{comment.author}</span>
                            <span className="text-[10px] text-muted-foreground">{formatDate(comment.createdAt)}</span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No comments yet.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="mails" className="flex-1 overflow-auto p-6 mt-0">
                {/* Email Form Modal */}
                {showEmailForm && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-background rounded-lg p-6 w-full max-w-lg">
                      <h3 className="text-lg font-semibold mb-4">Send Email</h3>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm">To</Label>
                          <Input 
                            className="h-9 text-sm mt-1" 
                            type="email"
                            value={emailTo}
                            onChange={(e) => setEmailTo(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Subject</Label>
                          <Input 
                            className="h-9 text-sm mt-1" 
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Message</Label>
                          <Textarea 
                            className="text-sm mt-1 min-h-[100px]" 
                            value={emailBody}
                            onChange={(e) => setEmailBody(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowEmailForm(false)}>Cancel</Button>
                          <Button onClick={handleSendEmail}>Send</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* System Mails Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-medium">System Mails</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs gap-1 bg-transparent"
                    onClick={() => {
                      setEmailTo(selectedVendor.email || "")
                      setShowEmailForm(true)
                    }}
                  >
                    <Mail className="w-4 h-4" />
                    Send Email
                  </Button>
                </div>

                {/* Email List */}
                {vendorEmails.length > 0 ? (
                  <div className="space-y-4">
                    {vendorEmails.map((email) => (
                      <div key={email.id} className="border rounded p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{email.subject || "No subject"}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${email.status === "sent" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                            {email.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">To: {email.toEmail}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(email.sentAt)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mb-2" />
                    <p className="text-sm text-muted-foreground">No emails sent.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="statement" className="flex-1 overflow-auto p-6 mt-0">
                {(() => {
                  const range = getStatementRange()
                  const billedAmount = selectedVendor?.payables ?? 0
                  const amountPaid = 0
                  const balanceDue = billedAmount - amountPaid
                  return (
                    <>
                      {/* Statement toolbar: period, filter, print, download, send email */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Button variant="outline" size="sm" className="h-8 text-xs gap-1 bg-transparent">
                            <span className="w-4 h-4 flex items-center justify-center">&#128197;</span>
                            This Month
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 text-xs gap-1 bg-transparent">
                            Filter By: All
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Print" onClick={handlePrintStatement}>
                            <Printer className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Download PDF" onClick={handleDownloadStatement}>
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Export" onClick={handleDownloadStatement}>
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 text-xs gap-1 bg-transparent" onClick={() => setShowSendEmailDialog(true)}>
                            <Mail className="w-4 h-4" />
                            Send Email
                          </Button>
                        </div>
                      </div>

                      {/* Statement card: title inside box, matches print/PDF */}
                      <div ref={statementRef} className="border rounded-lg p-5 pt-5 bg-white w-full">
                        <div className="text-center mb-4 pb-3 border-b">
                          <h2 className="text-lg font-medium">Vendor Statement For {selectedVendor?.name || "Vendor"}</h2>
                          <p className="text-sm text-muted-foreground">From {range.subtitle.replace(" to ", " To ")}</p>
                        </div>
                        {/* Company header: logo left, sender address right */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="w-24 h-16 rounded flex items-center justify-center overflow-hidden bg-white shrink-0">
                            <Image src="/Mekco-Supply-logo-300px.png" alt="Mekco Supply Inc." width={96} height={64} className="object-contain w-full h-full p-1" priority />
                          </div>
                          <div className="text-right text-sm">
                            <p className="font-semibold">Mekco Supply Inc.</p>
                            <p className="text-muted-foreground">16-110 West Beaver Creek Rd.</p>
                            <p className="text-muted-foreground">Richmond Hill, Ontario L4B 1J9</p>
                          </div>
                        </div>

                        {/* To: vendor name and address */}
                        <div className="mb-6">
                          <p className="text-xs text-muted-foreground mb-1">To</p>
                          <p className="text-sm font-medium text-primary">{selectedVendor?.name}</p>
                          {billingAddr?.street1 ? (
                            <p className="text-xs text-muted-foreground mt-1">
                              {[billingAddr.street1, billingAddr.street2, billingAddr.city, billingAddr.state, billingAddr.zipCode, billingAddr.country].filter(Boolean).join(" / ")}
                            </p>
                          ) : null}
                        </div>

                        {/* Statement of Accounts + Account Summary */}
                        <div className="flex flex-col items-end mb-6">
                          <div className="text-right mb-2">
                            <h3 className="text-xl font-bold">Statement of Accounts</h3>
                            <p className="text-sm text-muted-foreground">{range.subtitle}</p>
                          </div>
                          <div className="account-summary border border-[#e5e7eb] rounded-md overflow-hidden w-full max-w-xs">
                            <div className="account-summary-header bg-[#f3f4f6] px-3 py-2">
                              <h4 className="text-sm font-medium">Account Summary</h4>
                            </div>
                            <div className="space-y-1 text-sm px-3 py-2">
                              <div className="flex justify-between">
                                <span>Opening Balance</span>
                                <span>$0.00</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Billed Amount</span>
                                <span>${(billedAmount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Amount Paid</span>
                                <span>${amountPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <span>Balance Due</span>
                                <span>${balanceDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Transactions table */}
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/30">
                              <TableHead className="text-xs py-2">Date</TableHead>
                              <TableHead className="text-xs py-2">Transactions</TableHead>
                              <TableHead className="text-xs py-2">Details</TableHead>
                              <TableHead className="text-xs py-2 text-right">Amount</TableHead>
                              <TableHead className="text-xs py-2 text-right">Payments</TableHead>
                              <TableHead className="text-xs py-2 text-right">Balance</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="text-xs py-2">{range.subtitle.split(" to ")[0] || "Feb 01, 2026"}</TableCell>
                              <TableCell className="text-xs py-2">***Opening Balance***</TableCell>
                              <TableCell className="text-xs py-2"></TableCell>
                              <TableCell className="text-xs py-2 text-right">0.00</TableCell>
                              <TableCell className="text-xs py-2 text-right"></TableCell>
                              <TableCell className="text-xs py-2 text-right">0.00</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>

                        {/* Balance Due footer */}
                        <div className="flex justify-end mt-4">
                          <div className="text-sm font-medium">
                            Balance Due <span className="ml-8">${balanceDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )
                })()}

                {/* Send Email Statement Dialog - responsive like other send-email dialogs */}
                <Dialog open={showSendEmailDialog} onOpenChange={setShowSendEmailDialog}>
                  <DialogContent className="w-[95vw] sm:w-full max-w-5xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 gap-4">
                    <DialogHeader>
                      <DialogTitle className="text-base sm:text-lg">Send Email Statement for {selectedVendor?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">From</Label>
                          <Input className="mt-1 h-8 text-xs bg-muted" readOnly value="Mekco Supply <systems@mekcosupply.com>" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Send To</Label>
                          <div className="mt-1 flex items-center gap-1 flex-wrap p-2 border rounded-md bg-background min-h-8">
                            {statementEmailTo.map((e, i) => (
                              <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-xs">
                                {e}
                                <button type="button" className="ml-1 hover:text-destructive" aria-label="Remove" onClick={() => setStatementEmailTo((prev) => prev.filter((_, j) => j !== i))}>×</button>
                              </span>
                            ))}
                            <input
                              type="text"
                              className="flex-1 min-w-[120px] text-xs bg-transparent border-none outline-none focus:ring-0 p-0"
                              placeholder="Add email..."
                              value={statementEmailToInput}
                              onChange={(ev) => setStatementEmailToInput(ev.target.value)}
                              onKeyDown={(ev) => {
                                if (ev.key === "Enter" || ev.key === ",") {
                                  ev.preventDefault()
                                  const v = (ev.key === "," ? statementEmailToInput.replace(/,$/, "") : statementEmailToInput).trim()
                                  if (v) {
                                    setStatementEmailTo((prev) => [...prev, v])
                                    setStatementEmailToInput("")
                                  }
                                }
                              }}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Cc</Label>
                            <div className="mt-1 flex items-center gap-1 flex-wrap p-2 border rounded-md bg-background min-h-8">
                              {statementEmailCc.map((e, i) => (
                                <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-xs">
                                  {e}
                                  <button type="button" className="ml-1 hover:text-destructive" aria-label="Remove" onClick={() => setStatementEmailCc((prev) => prev.filter((_, j) => j !== i))}>×</button>
                                </span>
                              ))}
                              <input
                                type="text"
                                className="flex-1 min-w-[120px] text-xs bg-transparent border-none outline-none focus:ring-0 p-0"
                                placeholder="Add email..."
                                value={statementEmailCcInput}
                                onChange={(ev) => setStatementEmailCcInput(ev.target.value)}
                                onKeyDown={(ev) => {
                                  if (ev.key === "Enter" || ev.key === ",") {
                                    ev.preventDefault()
                                    const v = (ev.key === "," ? statementEmailCcInput.replace(/,$/, "") : statementEmailCcInput).trim()
                                    if (v) {
                                      setStatementEmailCc((prev) => [...prev, v])
                                      setStatementEmailCcInput("")
                                    }
                                  }
                                }}
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Bcc</Label>
                            <div className="mt-1 flex items-center gap-1 flex-wrap p-2 border rounded-md bg-background min-h-8">
                              {statementEmailBcc.map((e, i) => (
                                <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-xs">
                                  {e}
                                  <button type="button" className="ml-1 hover:text-destructive" aria-label="Remove" onClick={() => setStatementEmailBcc((prev) => prev.filter((_, j) => j !== i))}>×</button>
                                </span>
                              ))}
                              <input
                                type="text"
                                className="flex-1 min-w-[120px] text-xs bg-transparent border-none outline-none focus:ring-0 p-0"
                                placeholder="Add email..."
                                value={statementEmailBccInput}
                                onChange={(ev) => setStatementEmailBccInput(ev.target.value)}
                                onKeyDown={(ev) => {
                                  if (ev.key === "Enter" || ev.key === ",") {
                                    ev.preventDefault()
                                    const v = (ev.key === "," ? statementEmailBccInput.replace(/,$/, "") : statementEmailBccInput).trim()
                                    if (v) {
                                      setStatementEmailBcc((prev) => [...prev, v])
                                      setStatementEmailBccInput("")
                                    }
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Subject</Label>
                          <Input
                            className="mt-1 h-8 text-xs"
                            value={statementEmailSubject}
                            onChange={(e) => setStatementEmailSubject(e.target.value)}
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
                              <SelectContent>
                                <SelectItem value="12" className="text-xs">12 px</SelectItem>
                                <SelectItem value="14" className="text-xs">14 px</SelectItem>
                                <SelectItem value="16" className="text-xs">16 px</SelectItem>
                              </SelectContent>
                            </Select>
                            <span className="w-px h-4 bg-border mx-0.5" />
                            <Button variant="ghost" size="icon" className="h-7 w-7" type="button"><AlignLeft className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" type="button"><List className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" type="button"><Link2 className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" type="button"><ImagePlus className="w-3.5 h-3.5" /></Button>
                          </div>
                          <Textarea
                            className="min-h-[140px] text-sm resize-none"
                            value={statementEmailBody}
                            onChange={(e) => setStatementEmailBody(e.target.value)}
                          />
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id="attach-statement"
                              className="mt-0.5"
                              checked={attachStatement}
                              onCheckedChange={(v) => setAttachStatement(Boolean(v))}
                            />
                            <div className="flex-1">
                              <Label htmlFor="attach-statement" className="text-xs font-normal cursor-pointer">Attach Vendor Statement</Label>
                              <p className="text-xs text-muted-foreground mt-0.5">{getStatementRange().label} · Filter By: All</p>
                              <span className="inline-flex items-center gap-1 mt-1 text-xs text-primary">
                                statement_{selectedVendor?.name?.replace(/\s+/g, "") || "Vendor"}.pdf
                                <Eye className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-1">Attachments</p>
                            <p className="text-xs text-muted-foreground/70">
                              {attachStatement ? "Statement PDF will be attached" : "No attachments selected"}
                            </p>
                          </div>
                        </div>
                        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
                          <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => setShowSendEmailDialog(false)} disabled={sendingStatement}>Cancel</Button>
                          <Button size="sm" className="w-full sm:w-auto bg-primary hover:bg-primary/90" onClick={handleSendStatement} disabled={sendingStatement}>
                            {sendingStatement ? "Sending..." : "Send"}
                          </Button>
                        </DialogFooter>
                    </div>
                  </DialogContent>
                </Dialog>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Main Vendor List (Table View)
  return (
    <DashboardLayout activeItem="Purchases" activeSubItem="Vendors">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-medium">All Vendors</h1>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2">
            {searchQuery && (
              <span className="text-xs text-muted-foreground">
                Searching: &quot;{searchQuery}&quot;
              </span>
            )}
            <Button className="bg-primary hover:bg-primary/90 h-8 text-xs" onClick={() => setShowNewForm(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              New
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-8 py-2 px-2">
                    <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                  </TableHead>
                  <TableHead className="w-8 py-2 px-2"><Checkbox className="h-3.5 w-3.5" /></TableHead>
                  <TableHead className="text-[10px] font-medium py-2 px-2">NAME</TableHead>
                  <TableHead className="text-[10px] font-medium py-2 px-2">COMPANY NAME</TableHead>
                  <TableHead className="text-[10px] font-medium py-2 px-2">EMAIL</TableHead>
                  <TableHead className="text-[10px] font-medium py-2 px-2">WORK PHONE</TableHead>
                  <TableHead className="text-[10px] font-medium py-2 px-2 text-right">PAYABLES</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((vendor) => (
                  <TableRow key={vendor.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => fetchVendorDetail(vendor.id)}>
                    <TableCell className="py-2 px-2"></TableCell>
                    <TableCell className="py-2 px-2" onClick={(e) => e.stopPropagation()}><Checkbox className="h-3.5 w-3.5" /></TableCell>
                    <TableCell className="py-2 px-2">
                      <span className="text-xs text-primary hover:underline cursor-pointer">{vendor.name}</span>
                    </TableCell>
                    <TableCell className="py-2 px-2 text-xs">{vendor.companyName}</TableCell>
                    <TableCell className="py-2 px-2 text-xs">{vendor.email}</TableCell>
                    <TableCell className="py-2 px-2 text-xs">{vendor.workPhone}</TableCell>
                    <TableCell className="py-2 px-2 text-xs text-right">${vendor.payables?.toFixed(2) || "0.00"}</TableCell>
                  </TableRow>
                ))}
                {vendors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No vendors found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2 border-t">
            <span className="text-xs text-muted-foreground">
              Showing {(currentPage - 1) * VENDORS_PER_PAGE + 1} - {Math.min(currentPage * VENDORS_PER_PAGE, totalVendors)} of {totalVendors}
            </span>
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className="h-7 w-7 text-xs p-0"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
