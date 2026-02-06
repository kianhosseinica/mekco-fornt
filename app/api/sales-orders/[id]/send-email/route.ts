import { NextResponse } from "next/server"
import { getSalesOrder } from "@/lib/sales-orders-store"

type Params = { params: Promise<{ id: string }> }

/** Send sales order email. Accepts to, subject, body, attachPdf. Without a real mailer we return success and log. */
export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const order = getSalesOrder(id)
    if (!order) {
      return NextResponse.json({ error: "Sales order not found" }, { status: 404 })
    }

    const body = await request.json().catch(() => ({}))
    const to = body.to ?? order.customerEmail ?? ""
    const subject = body.subject ?? `Quote from Mekco Supply Inc. (Quote #: ${order.salesOrderNumber})`
    const emailBody = body.body ?? ""
    const attachPdf = body.attachPdf !== false

    // In production, integrate with SendGrid, Resend, etc. Here we just acknowledge.
    console.log("Send email (mock):", {
      to,
      subject,
      orderId: order.id,
      salesOrderNumber: order.salesOrderNumber,
      attachPdf,
    })

    return NextResponse.json({
      success: true,
      message: "Email sent successfully.",
      detail: {
        to,
        subject,
        salesOrderNumber: order.salesOrderNumber,
        customerName: order.customerName,
        amount: order.amount,
        date: order.date,
        reference: order.reference,
        expectedShipmentDate: order.expectedShipmentDate,
        lineItemsCount: order.lineItems?.length ?? 0,
        attachPdf,
      },
    })
  } catch (e) {
    console.error("POST /api/sales-orders/[id]/send-email", e)
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    )
  }
}
