import { NextResponse } from "next/server"
import { getSalesOrder, updateSalesOrder } from "@/lib/sales-orders-store"

type Params = { params: Promise<{ id: string }> }

/** Convert sales order to invoice. Creates a placeholder invoice id and marks SO as Billed/Invoiced. */
export async function POST(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    const order = getSalesOrder(id)
    if (!order) {
      return NextResponse.json({ error: "Sales order not found" }, { status: 404 })
    }

    // Placeholder invoice id (in a full app this would create a real invoice record)
    const invoiceId = `inv_${Date.now()}_${order.salesOrderNumber.replace(/\s/g, "")}`

    const updated = updateSalesOrder(id, {
      status: "Billed / Invoiced",
      invoiced: true,
      convertedToInvoiceId: invoiceId,
      invoiceStatus: "INVOICED",
    })

    return NextResponse.json({
      salesOrder: updated,
      invoiceId,
      message: "Sales order converted to invoice.",
    })
  } catch (e) {
    console.error("POST /api/sales-orders/[id]/convert-to-invoice", e)
    return NextResponse.json(
      { error: "Failed to convert to invoice" },
      { status: 500 }
    )
  }
}
