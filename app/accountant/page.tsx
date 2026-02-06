"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { PageHeader } from "@/components/dashboard/page-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calculator } from "lucide-react"

export default function AccountantPage() {
  return (
    <DashboardLayout activeItem="Accountant">
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <PageHeader
          title="Accountant"
          description="Accounting tools and reports"
        />
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calculator className="w-12 h-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium mb-2">Accountant</h2>
            <p className="text-sm text-muted-foreground max-w-md">
              Accounting features and reports will appear here.
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
