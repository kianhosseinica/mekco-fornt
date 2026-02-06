// Credit Note line item
export interface CreditNoteLineItem {
  id?: string
  itemDetails: string
  account?: string
  reorderQty?: string
  quantity: string
  rate: string
  discount?: string
  tax?: string
  amount: string
}

// Credit note application (when credit is applied to an invoice)
export interface CreditNoteApplication {
  id: string
  invoiceId: string
  invoiceNumber: string
  amount: number
  date: string
  createdAt: string
}

// Credit note refund (when credits are refunded to customer)
export interface CreditNoteRefund {
  id: string
  amount: number
  mode: string
  referenceNumber?: string
  fromAccount?: string
  description?: string
  date: string
  createdAt: string
}

// Credit Note - matches API payload
export interface CreditNote {
  id: string
  creditNoteNumber: string
  invoiceId?: string | null
  invoiceNumber?: string | null
  date: string
  customerName: string
  customerId?: number | null
  customerEmail?: string
  referenceNumber: string
  status: string
  lineItems: CreditNoteLineItem[]
  subTotal: number
  shippingCharges?: number | null
  taxAmount?: number | null
  adjustment?: number | null
  total: number
  creditsUsed: number
  creditsRemaining: number
  refundedAmount: number
  subject?: string
  customerNotes?: string
  termsAndConditions?: string
  salesperson?: string
  applications?: CreditNoteApplication[]
  refunds?: CreditNoteRefund[]
  createdAt: string
  updatedAt: string
}

// Create credit note payload
export interface CreditNoteCreatePayload {
  creditNoteNumber?: string
  invoiceId?: string
  date?: string
  customerName: string
  customerId?: number
  customerEmail?: string
  referenceNumber?: string
  lineItems?: CreditNoteLineItem[]
  subTotal?: number
  shippingCharges?: number
  taxAmount?: number
  adjustment?: number
  total?: number
  subject?: string
  customerNotes?: string
  termsAndConditions?: string
  salesperson?: string
}

// Update credit note payload
export interface CreditNoteUpdatePayload {
  date?: string
  customerName?: string
  customerId?: number
  customerEmail?: string
  referenceNumber?: string
  invoiceId?: string | null
  lineItems?: CreditNoteLineItem[]
  subTotal?: number
  shippingCharges?: number
  taxAmount?: number
  adjustment?: number
  total?: number
  subject?: string
  customerNotes?: string
  termsAndConditions?: string
  salesperson?: string
}

// Apply credit to invoice payload
export interface CreditNoteApplyPayload {
  invoiceId: string
  amount: number
}

// Refund from credit note payload
export interface CreditNoteRefundPayload {
  amount: number
  mode?: string
  referenceNumber?: string
  fromAccount?: string
  description?: string
}

// Unpaid invoice for apply credits modal
export interface UnpaidInvoice {
  id: string
  invoiceNumber: string
  date: string
  dueDate?: string
  total: number
  balanceDue: number
  status: string
}
