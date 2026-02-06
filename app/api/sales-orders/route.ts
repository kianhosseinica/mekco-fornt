import { NextResponse } from "next/server"
import {
  listSalesOrders,
  createSalesOrder,
  getNextSalesOrderNumber,
} from "@/lib/sales-orders-store"
import type { SalesOrderStatus } from "@/lib/sales-orders-types"

export async function GET() {
  try {
    const orders = listSalesOrders()
    return NextResponse.json({ orders })
  } catch (e) {
    console.error("GET /api/sales-orders", e)
    return NextResponse.json(
      { error: "Failed to list sales orders" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      date,
      reference,
      customerName,
      customerId,
      customerEmail,
      expectedShipmentDate,
      lineItems,
      paymentTerms,
      deliveryMethod,
      salesperson,
      validity,
      leadTime,
      customerNotes,
      termsAndConditions,
      subTotal,
      shippingCharges,
      taxAmount,
      adjustment,
      total,
    } = body

    const salesOrderNumber = body.salesOrderNumber || getNextSalesOrderNumber()
    const status = (body.status as SalesOrderStatus) || "Draft"
    const amount = Number(body.amount) ?? 0
    const invoiced = Boolean(body.invoiced)
    const payment = body.payment || "none"

    const order = createSalesOrder({
      date: date || new Date().toISOString().slice(0, 10),
      salesOrderNumber,
      reference: reference || "",
      customerName: customerName || "",
      customerId,
      customerEmail,
      status,
      invoiced,
      payment,
      amount,
      expectedShipmentDate: expectedShipmentDate || "",
      lineItems: Array.isArray(lineItems) ? lineItems : [],
      paymentTerms,
      deliveryMethod,
      salesperson,
      validity,
      leadTime,
      customerNotes,
      termsAndConditions,
      subTotal,
      shippingCharges,
      taxAmount,
      adjustment,
      total,
    })

    return NextResponse.json(order)
  } catch (e) {
    console.error("POST /api/sales-orders", e)
    return NextResponse.json(
      { error: "Failed to create sales order" },
      { status: 500 }
    )
  }
}
