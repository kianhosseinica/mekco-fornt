// Refund record - matches API payload
export interface Refund {
  id: string
  refundNumber: string
  paymentId?: string | null
  date: string
  amount: number
  mode: string
  referenceNumber: string
  fromAccount: string
  description: string
  status: string
  createdAt: string
  updatedAt: string
}

// Payment (received payment) - matches API payload
export interface Payment {
  id: string
  paymentNumber: string
  date: string
  referenceNumber: string
  customerName: string
  customerId?: number | null
  customerEmail?: string
  invoiceId?: string | null
  invoiceNumber: string
  invoiceDate: string
  invoiceAmount?: number | null
  amount: number
  amountRefunded: number
  unusedAmount: number
  mode: string
  depositTo: string
  status: string
  notes: string
  refunds: Refund[]
  createdAt: string
  updatedAt: string
}

// Create payment - required: invoiceId, amount; optional: date, referenceNumber, mode, depositTo, notes, paymentNumber
export interface PaymentCreatePayload {
  invoiceId: string
  amount: number
  date?: string
  referenceNumber?: string
  mode?: string
  depositTo?: string
  notes?: string
  paymentNumber?: string
}

// Update payment - all editable fields
export interface PaymentUpdatePayload {
  referenceNumber?: string
  notes?: string
  date?: string
  mode?: string
  depositTo?: string
  amount?: number
  paymentNumber?: string
}

// Refund payment
export interface PaymentRefundPayload {
  amount?: number
  date?: string
  mode?: string
  referenceNumber?: string
  fromAccount?: string
  description?: string
}
