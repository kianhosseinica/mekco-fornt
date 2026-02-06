import { join } from "path"
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs"
import type { SalesOrder, SalesOrderCreate, SalesOrderUpdate } from "./sales-orders-types"

const DATA_DIR = join(process.cwd(), "data")
const DATA_FILE = join(DATA_DIR, "sales-orders.json")

interface StoredData {
  orders: SalesOrder[]
  lastSequenceByYear: Record<string, number>
}

function loadData(): StoredData {
  try {
    if (existsSync(DATA_FILE)) {
      const raw = readFileSync(DATA_FILE, "utf-8")
      const data = JSON.parse(raw) as StoredData
      if (Array.isArray(data.orders) && data.lastSequenceByYear && typeof data.lastSequenceByYear === "object") {
        return data
      }
    }
  } catch {
    // ignore
  }
  return { orders: [], lastSequenceByYear: {} }
}

function saveData(data: StoredData): void {
  try {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true })
    }
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8")
  } catch {
    // e.g. read-only filesystem (serverless); keep in memory only
  }
}

// In-memory cache so we don't re-read on every request within same process
let cache: StoredData | null = null

function getData(): StoredData {
  if (cache) return cache
  cache = loadData()
  return cache
}

function persist(data: StoredData): void {
  cache = data
  saveData(data)
}

/** Preview next number without incrementing (for UI display). */
export function getNextSalesOrderNumberPreview(): string {
  const data = getData()
  const year = new Date().getFullYear()
  const yy = String(year).slice(-2)
  const current = data.lastSequenceByYear[yy] ?? 100
  return `${yy}${current + 1}`
}

/** Generate and reserve next sales order number: YY + XXX (e.g. 26101, 26102). XXX starts at 101 per year. */
export function getNextSalesOrderNumber(): string {
  const data = getData()
  const year = new Date().getFullYear()
  const yy = String(year).slice(-2)
  const current = data.lastSequenceByYear[yy] ?? 100
  const next = current + 1
  data.lastSequenceByYear[yy] = next
  persist(data)
  return `${yy}${next}`
}

export function listSalesOrders(): SalesOrder[] {
  const data = getData()
  return [...data.orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function getSalesOrder(id: string): SalesOrder | null {
  const data = getData()
  return data.orders.find((o) => o.id === id) ?? null
}

function generateId(): string {
  return `so_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function createSalesOrder(input: SalesOrderCreate): SalesOrder {
  const data = getData()
  const now = new Date().toISOString()
  const order: SalesOrder = {
    ...input,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }
  data.orders.push(order)
  persist(data)
  return order
}

export function updateSalesOrder(id: string, update: SalesOrderUpdate): SalesOrder | null {
  const data = getData()
  const index = data.orders.findIndex((o) => o.id === id)
  if (index === -1) return null
  const existing = data.orders[index]
  const updated: SalesOrder = {
    ...existing,
    ...update,
    id: existing.id,
    salesOrderNumber: existing.salesOrderNumber,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  }
  data.orders[index] = updated
  persist(data)
  return updated
}

export function deleteSalesOrder(id: string): boolean {
  const data = getData()
  const index = data.orders.findIndex((o) => o.id === id)
  if (index === -1) return false
  data.orders.splice(index, 1)
  persist(data)
  return true
}

export function cloneSalesOrder(id: string): SalesOrder | null {
  const existing = getSalesOrder(id)
  if (!existing) return null
  const data = getData()
  const now = new Date().toISOString()
  const newNumber = getNextSalesOrderNumber()
  const cloned: SalesOrder = {
    ...JSON.parse(JSON.stringify(existing)),
    id: generateId(),
    salesOrderNumber: newNumber,
    date: new Date().toISOString().slice(0, 10),
    expectedShipmentDate: "",
    status: "Draft",
    invoiced: false,
    payment: "none",
    convertedToInvoiceId: undefined,
    invoiceStatus: undefined,
    shipmentStatus: undefined,
    lineItems: (existing.lineItems || []).map((line) => ({
      ...line,
      id: `li_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    })),
    createdAt: now,
    updatedAt: now,
  }
  data.orders.push(cloned)
  persist(data)
  return cloned
}
