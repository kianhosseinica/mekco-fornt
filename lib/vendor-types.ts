// Vendor TypeScript interfaces for the Zoho frontend

export interface VendorAddress {
  id?: number;
  type: "billing" | "shipping";
  attention: string;
  country: string;
  street1: string;
  street2: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  faxNumber: string;
  isDefault?: boolean;
}

export interface VendorContactPerson {
  id?: number;
  salutation: string;
  firstName: string;
  lastName: string;
  email: string;
  workPhone: string;
  mobile: string;
  isPrimary?: boolean;
}

export interface VendorComment {
  id: number;
  content: string;
  createdAt: string;
  author: string;
}

export interface VendorEmailLog {
  id: number;
  toEmail: string;
  subject: string;
  body: string;
  emailType: "statement" | "reminder" | "purchase_order" | "other";
  status: "queued" | "sent" | "failed";
  sentAt: string | null;
}

export interface Vendor {
  id: number;
  name: string;
  companyName: string;
  email: string;
  workPhone: string;
  mobilePhone: string;
  payables: number;
  currency: string;
  // Extended fields (from detail endpoint)
  salutation?: string;
  firstName?: string;
  lastName?: string;
  fax?: string;
  website?: string;
  language?: string;
  paymentTerms?: string;
  openingBalance?: number | null;
  openingBalanceDate?: string | null;
  t4aEnabled?: boolean;
  t5018Enabled?: boolean;
  portalEnabled?: boolean;
  portalStatus?: string;
  remarks?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  // Related data
  addresses?: VendorAddress[];
  contactPersons?: VendorContactPerson[];
  comments?: VendorComment[];
}

export interface VendorCreatePayload {
  name: string;
  companyName?: string;
  salutation?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  workPhone?: string;
  mobilePhone?: string;
  fax?: string;
  website?: string;
  language?: string;
  currency?: string;
  paymentTerms?: string;
  openingBalance?: number;
  openingBalanceDate?: string;
  t4aEnabled?: boolean;
  t5018Enabled?: boolean;
  portalEnabled?: boolean;
  remarks?: string;
  billingAddress?: Omit<VendorAddress, "id" | "type">;
  shippingAddress?: Omit<VendorAddress, "id" | "type">;
  contactPersons?: Omit<VendorContactPerson, "id">[];
}

export interface VendorUpdatePayload {
  name?: string;
  displayName?: string;
  companyName?: string;
  salutation?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  workPhone?: string;
  mobilePhone?: string;
  fax?: string;
  website?: string;
  language?: string;
  currency?: string;
  paymentTerms?: string;
  openingBalance?: number | null;
  openingBalanceDate?: string | null;
  t4aEnabled?: boolean;
  t5018Enabled?: boolean;
  portalEnabled?: boolean;
  portalStatus?: string;
  remarks?: string;
}

export interface VendorAddressPayload {
  type: "billing" | "shipping";
  attention?: string;
  country?: string;
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  faxNumber?: string;
}

export interface VendorContactPayload {
  salutation?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  workPhone?: string;
  mobile?: string;
  isPrimary?: boolean;
}

export interface VendorCommentPayload {
  content: string;
}

export interface VendorEmailPayload {
  to: string;
  subject?: string;
  body?: string;
  emailType?: "statement" | "reminder" | "purchase_order" | "other";
}

export interface VendorsListResponse {
  vendors: Vendor[];
  count: number;
  total: number;
  page: number;
  limit: number;
}

export interface VendorEmailsResponse {
  emails: VendorEmailLog[];
  count: number;
}
