import { NextResponse } from "next/server"
import { getNextSalesOrderNumberPreview } from "@/lib/sales-orders-store"

export async function GET() {
  try {
    const nextNumber = getNextSalesOrderNumberPreview()
    return NextResponse.json({ nextNumber })
  } catch (e) {
    console.error("GET /api/sales-orders/next-number", e)
    return NextResponse.json(
      { error: "Failed to get next number" },
      { status: 500 }
    )
  }
}
