// Sales Order statuses: Accounting / Internal
export const SALES_ORDER_STATUSES = [
  "Draft",
  "Sent / Issued",
  "Confirmed / Acknowledged",
  "Packing Slip",
  "Received / Completed",
  "Has Back Order (B/O)",
  "Billed / Invoiced",
  "Has Return(s) / RGA",
  "ETA",
  "Closed",
] as const

export type SalesOrderStatus = (typeof SALES_ORDER_STATUSES)[number]

export interface SalesOrderLineItem {
  id: string
  itemDetails: string
  reorderQty: string
  quantity: string
  rate: string
  discount: string
  tax: string
  amount: string
  imageUrl?: string
}

// Invoicing status for tracking partial invoicing progress
export type InvoicingStatus = "not_invoiced" | "partially_invoiced" | "completely_invoiced"

export interface SalesOrder {
  id: string
  date: string
  salesOrderNumber: string
  reference: string
  customerName: string
  customerId?: number
  customerEmail?: string
  status: SalesOrderStatus
  invoiced: boolean
  invoicingStatus?: InvoicingStatus
  payment: "none" | "partial" | "full"
  amount: number
  expectedShipmentDate: string
  invoiceStatus?: string
  shipmentStatus?: string
  lineItems: SalesOrderLineItem[]
  paymentTerms?: string
  deliveryMethod?: string
  salesperson?: string
  validity?: string
  leadTime?: string
  customerNotes?: string
  termsAndConditions?: string
  subTotal?: number
  shippingCharges?: number
  taxAmount?: number
  adjustment?: number
  total?: number
  convertedToInvoiceId?: string
  etaDate?: string
  createdAt: string
  updatedAt: string
}

export type SalesOrderCreate = Omit<SalesOrder, "id" | "createdAt" | "updatedAt">
export type SalesOrderUpdate = Partial<Omit<SalesOrder, "id" | "salesOrderNumber" | "createdAt">>

export interface SalesOrderHistoryEntry {
  id: number
  action: "created" | "status_changed" | "items_edited" | "updated" | "reverted"
  status: string
  lineItems: SalesOrderLineItem[]
  amount: number
  subTotal?: number
  taxAmount?: number
  total?: number
  customerName: string
  reference: string
  notes: string
  snapshotData: Record<string, unknown>
  createdAt: string
}
