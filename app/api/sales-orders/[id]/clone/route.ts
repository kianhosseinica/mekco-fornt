import { NextResponse } from "next/server"
import { cloneSalesOrder } from "@/lib/sales-orders-store"

type Params = { params: Promise<{ id: string }> }

export async function POST(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    const cloned = cloneSalesOrder(id)
    if (!cloned) {
      return NextResponse.json({ error: "Sales order not found" }, { status: 404 })
    }
    return NextResponse.json(cloned)
  } catch (e) {
    console.error("POST /api/sales-orders/[id]/clone", e)
    return NextResponse.json(
      { error: "Failed to clone sales order" },
      { status: 500 }
    )
  }
}
