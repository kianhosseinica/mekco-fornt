"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { FileText, Plus, Search } from "lucide-react"
import { Suspense } from "react"
import Loading from "./loading"

export default function FilingPage() {
  return (
    <DashboardLayout activeItem="Filing & Compliance" activeSubItem="T4A/T5018 Slips">
      <PageHeader
        title="T4A/T5018 Slips"
        searchPlaceholder="Search in Customers ( / )"
      />

      <Suspense fallback={<Loading />}>
        <div className="p-4 md:p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-xl">
            {/* Illustration */}
            <div className="w-48 h-32 mx-auto mb-6">
              <svg viewBox="0 0 200 120" className="w-full h-full">
                <rect x="40" y="20" width="80" height="80" rx="8" fill="#e0f2f1" />
                <rect x="50" y="35" width="60" height="8" rx="2" fill="#4db6ac" />
                <rect x="50" y="50" width="40" height="6" rx="2" fill="#b2dfdb" />
                <rect x="50" y="62" width="50" height="6" rx="2" fill="#b2dfdb" />
                <rect x="50" y="74" width="35" height="6" rx="2" fill="#b2dfdb" />
                <circle cx="140" cy="40" r="20" fill="#f0f9ff" />
                <Search className="w-6 h-6 text-primary" x="132" y="32" />
              </svg>
            </div>

            <h1 className="text-xl font-semibold text-foreground mb-3">
              Generate T4A and T5018 slips effortlessly
            </h1>
            <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
              Map accounts to boxes, validate the vendors, and review the details to generate your T4A/T5018 slips. 
              Also, export the tax slip, file it with CRA, and share it with your vendors easily.
            </p>

            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Generate Slip
            </Button>
          </div>
        </div>
      </Suspense>
    </DashboardLayout>
  )
}
