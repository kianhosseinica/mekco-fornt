"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { 
  ChevronLeft,
  FolderOpen,
  File,
  FileImage,
  FileText,
  Plus,
  Trash2,
  Settings,
  Upload
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const inboxes = [
  { label: "Files", count: 81, active: true },
  { label: "Bank Statements" },
]

const files = [
  { id: 1, name: "pex-elbows.png", type: "image", uploadedBy: "Me", uploadedOn: "Nov 23, 2023 11:47 AM" },
  { id: 2, name: "5M-H387812-Flexible Hose For Toilet - 38 COMP X 38 BC 12.png", type: "image", uploadedBy: "Me", uploadedOn: "Sep 28, 2023 01:03 PM" },
  { id: 3, name: "pex-elbows.png", type: "image", uploadedBy: "Me", uploadedOn: "Aug 04, 2023 02:46 PM" },
  { id: 4, name: "Low-Rise-End-Cleanout.jpg", type: "image", uploadedBy: "Me", uploadedOn: "Jun 22, 2023 03:38 PM" },
  { id: 5, name: "Zurn - ZEMS6003AV-IS_AL_600x600.jpg", type: "image", uploadedBy: "Me", uploadedOn: "May 26, 2023 04:09 PM" },
  { id: 6, name: "WATTS-LF7RU2-2_angle_0072203.jpg", type: "image", uploadedBy: "Me", uploadedOn: "May 26, 2023 11:23 AM" },
  { id: 7, name: "5M-STPX3812-S-14 Turn Straight Stop valve wABS Straight Hand...", type: "image", uploadedBy: "Me", uploadedOn: "May 24, 2023 02:05 PM" },
  { id: 8, name: "5M-STPX3812-A-002.jpg", type: "image", uploadedBy: "Me", uploadedOn: "May 24, 2023 02:03 PM" },
  { id: 9, name: "Ack-CF5520333.doc_ul-Feb-27-2023.pdf", type: "pdf", uploadedBy: "Me", uploadedOn: "Feb 27, 2023 03:33 PM" },
  { id: 10, name: "LynCar - PEX 1807 coupling - 2653144_result.jpg", type: "image", uploadedBy: "Me", uploadedOn: "Feb 16, 2023 09:46 AM" },
  { id: 11, name: "LOW RISE FITTINGS- SYSTEM 15 FITTINGS- 45 ELBOW SHORT T...", type: "image", uploadedBy: "Me", uploadedOn: "Feb 09, 2023 09:10 AM" },
  { id: 12, name: "sales-return-credit-note.png", type: "image", uploadedBy: "Me", uploadedOn: "Feb 08, 2023 11:04 AM" },
  { id: 13, name: "ABS-TEE-2x1-1.2x1-1.2_result.jpg", type: "image", uploadedBy: "Me", uploadedOn: "Jan 20, 2023 09:36 AM" },
  { id: 14, name: "Bosch-spadebit-daredevi-IDSB1013-boschhero.png", type: "image", uploadedBy: "Me", uploadedOn: "Jan 17, 2023 08:33 AM" },
  { id: 15, name: "Price-update-by-Krista-nov-16-2022.xlsx", type: "excel", uploadedBy: "Me", uploadedOn: "Nov 16, 2022 10:46 AM" },
  { id: 16, name: "Price-update-by-Krista-nov-16-2022.pdf", type: "pdf", uploadedBy: "Me", uploadedOn: "Nov 16, 2022 10:46 AM" },
]

function FileIcon({ type }: { type: string }) {
  if (type === "image") return <FileImage className="w-4 h-4 text-primary" />
  if (type === "pdf") return <FileText className="w-4 h-4 text-red-500" />
  if (type === "excel") return <FileText className="w-4 h-4 text-green-600" />
  return <File className="w-4 h-4 text-muted-foreground" />
}

export default function DocumentsPage() {
  const [activeInbox, setActiveInbox] = useState("Files")

  return (
    <DashboardLayout activeItem="Documents">
      <div className="flex h-full">
        {/* Left Sidebar */}
        <div className="w-56 border-r bg-card shrink-0 hidden md:block">
          <div className="p-4">
            <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Link>
            <h2 className="text-lg font-semibold mb-4">Documents</h2>

            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors mb-4">
              <FolderOpen className="w-4 h-4" />
              All Documents
            </button>

            {/* Inboxes */}
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2 px-3">
              Inboxes
            </div>
            <nav className="space-y-1 mb-6">
              {inboxes.map((inbox) => (
                <button
                  key={inbox.label}
                  onClick={() => setActiveInbox(inbox.label)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors",
                    activeInbox === inbox.label
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <File className="w-4 h-4" />
                    {inbox.label}
                  </div>
                  {inbox.count && (
                    <span className={cn(
                      "text-xs px-1.5 py-0.5 rounded-full",
                      activeInbox === inbox.label
                        ? "bg-primary-foreground/20"
                        : "bg-primary text-primary-foreground"
                    )}>
                      {inbox.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Folders */}
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Folders</span>
              <Plus className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground" />
            </div>
            <p className="text-sm text-muted-foreground px-3 mb-4">There are no folders.</p>
            <Link href="#" className="text-primary text-sm hover:underline px-3">
              Create New Folder
            </Link>
          </div>

          {/* Trash */}
          <div className="absolute bottom-4 left-4">
            <button className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
              Trash
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <PageHeader
            title="Files"
            searchPlaceholder="Search in Documents ( / )"
            customActions={
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Available Autoscans: 2</span>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure
                </Button>
                <span className="text-sm text-muted-foreground">Use Advanced Autoscan.</span>
                <Link href="#" className="text-primary text-sm hover:underline">Buy Addon</Link>
                <Button size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
              </div>
            }
          />

          <div className="p-4 md:p-6">
            {/* Filter */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm text-muted-foreground">Filter By :</span>
              <select className="border rounded px-3 py-1.5 text-sm bg-background">
                <option>Status: All</option>
              </select>
            </div>

            {/* Table */}
            <div className="bg-card rounded-lg border overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="p-3 w-10">
                      <Checkbox />
                    </th>
                    <th className="p-3 text-left font-medium">FILE NAME</th>
                    <th className="p-3 text-left font-medium">DETAILS</th>
                    <th className="p-3 text-left font-medium">UPLOADED BY</th>
                    <th className="p-3 text-left font-medium">UPLOADED ON</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-3">
                        <Checkbox />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <FileIcon type={file.type} />
                          <span className="text-sm text-foreground max-w-[300px] truncate">{file.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-foreground"></td>
                      <td className="p-3 text-sm text-foreground">{file.uploadedBy}</td>
                      <td className="p-3 text-sm text-foreground">{file.uploadedOn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
