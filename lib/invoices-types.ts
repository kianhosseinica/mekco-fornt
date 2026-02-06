// Invoice statuses
export const INVOICE_STATUSES = [
  "Draft",
  "Sent",
  "Viewed",
  "Partially Paid",
  "Paid",
  "Overdue",
  "Void",
] as const

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]

// Invoice line item
export interface InvoiceLineItem {
  id: string
  itemDetails: string
  quantity: string
  rate: string
  amount: string
  imageUrl?: string
  salesOrderLineItemId?: string  // Links back to sales order line item
}

// Main Invoice interface
export interface Invoice {
  id: string
  invoiceNumber: string
  salesOrderId?: string | null
  salesOrderNumber?: string | null
  date: string
  dueDate: string
  customerName: string
  customerId?: number | null
  customerEmail?: string
  status: InvoiceStatus
  lineItems: InvoiceLineItem[]
  subTotal: number
  shippingCharges?: number | null
  taxAmount?: number | null
  adjustment?: number | null
  total: number
  amountPaid: number
  balanceDue: number
  paymentTerms?: string
  customerNotes?: string
  termsAndConditions?: string
  createdAt: string
  updatedAt: string
}

// For creating a new invoice
export type InvoiceCreate = Omit<Invoice, "id" | "createdAt" | "updatedAt">

// For updating an invoice
export type InvoiceUpdate = Partial<Omit<Invoice, "id" | "invoiceNumber" | "createdAt">>

// Invoice history entry
export interface InvoiceHistoryEntry {
  id: number
  action: "created" | "status_changed" | "items_edited" | "updated" | "payment_recorded" | "voided"
  status: string
  lineItems: InvoiceLineItem[]
  subTotal?: number | null
  taxAmount?: number | null
  total?: number | null
  amountPaid?: number | null
  balanceDue?: number | null
  customerName: string
  notes: string
  snapshotData: Record<string, unknown>
  createdAt: string
}

// Remaining items response from sales order
export interface RemainingItemsResponse {
  salesOrderId: string
  salesOrderNumber: string
  customerName: string
  customerId?: number | null
  customerEmail: string
  invoicingStatus: "not_invoiced" | "partially_invoiced" | "completely_invoiced"
  remainingItems: RemainingLineItem[]
}

// Line item with remaining quantity info
export interface RemainingLineItem {
  id: string
  itemDetails: string
  quantity: string
  remainingQuantity: string
  originalQuantity: string
  invoicedQuantity: string
  rate: string
  amount: string
  imageUrl?: string
}

// Payment recording
export interface RecordPaymentRequest {
  amount: number
  notes?: string
}
