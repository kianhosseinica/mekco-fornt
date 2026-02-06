import { NextResponse } from "next/server"
import { getSalesOrder, updateSalesOrder } from "@/lib/sales-orders-store"
import type { SalesOrderStatus } from "@/lib/sales-orders-types"

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    const order = getSalesOrder(id)
    if (!order) {
      return NextResponse.json({ error: "Sales order not found" }, { status: 404 })
    }
    return NextResponse.json(order)
  } catch (e) {
    console.error("GET /api/sales-orders/[id]", e)
    return NextResponse.json(
      { error: "Failed to get sales order" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()

    const update: Record<string, unknown> = {}
    if (body.date !== undefined) update.date = body.date
    if (body.reference !== undefined) update.reference = body.reference
    if (body.customerName !== undefined) update.customerName = body.customerName
    if (body.customerId !== undefined) update.customerId = body.customerId
    if (body.customerEmail !== undefined) update.customerEmail = body.customerEmail
    if (body.status !== undefined) update.status = body.status as SalesOrderStatus
    if (body.invoiced !== undefined) update.invoiced = body.invoiced
    if (body.payment !== undefined) update.payment = body.payment
    if (body.amount !== undefined) update.amount = Number(body.amount)
    if (body.expectedShipmentDate !== undefined) update.expectedShipmentDate = body.expectedShipmentDate
    if (body.lineItems !== undefined) update.lineItems = body.lineItems
    if (body.paymentTerms !== undefined) update.paymentTerms = body.paymentTerms
    if (body.deliveryMethod !== undefined) update.deliveryMethod = body.deliveryMethod
    if (body.salesperson !== undefined) update.salesperson = body.salesperson
    if (body.validity !== undefined) update.validity = body.validity
    if (body.leadTime !== undefined) update.leadTime = body.leadTime
    if (body.customerNotes !== undefined) update.customerNotes = body.customerNotes
    if (body.termsAndConditions !== undefined) update.termsAndConditions = body.termsAndConditions
    if (body.subTotal !== undefined) update.subTotal = body.subTotal
    if (body.shippingCharges !== undefined) update.shippingCharges = body.shippingCharges
    if (body.taxAmount !== undefined) update.taxAmount = body.taxAmount
    if (body.adjustment !== undefined) update.adjustment = body.adjustment
    if (body.total !== undefined) update.total = body.total
    if (body.invoiceStatus !== undefined) update.invoiceStatus = body.invoiceStatus
    if (body.shipmentStatus !== undefined) update.shipmentStatus = body.shipmentStatus
    if (body.etaDate !== undefined) update.etaDate = body.etaDate
    if (body.convertedToInvoiceId !== undefined) update.convertedToInvoiceId = body.convertedToInvoiceId

    const order = updateSalesOrder(id, update)
    if (!order) {
      return NextResponse.json({ error: "Sales order not found" }, { status: 404 })
    }
    return NextResponse.json(order)
  } catch (e) {
    console.error("PUT /api/sales-orders/[id]", e)
    return NextResponse.json(
      { error: "Failed to update sales order" },
      { status: 500 }
    )
  }
}
