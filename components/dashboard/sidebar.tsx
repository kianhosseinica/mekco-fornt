"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  Home,
  Package,
  Warehouse,
  ShoppingCart,
  CreditCard,
  Building2,
  FileCheck,
  Calculator,
  FileText,
  FolderOpen,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Plus,
} from "lucide-react"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  activeItem?: string
  activeSubItem?: string
  onNavigate?: () => void
}

interface NavItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href?: string
  hasArrow?: boolean
  badge?: number
  subItems?: { label: string; href: string }[]
}

const navItems: NavItem[] = [
  { icon: Home, label: "Home", href: "/" },
  { 
    icon: Package, 
    label: "Items", 
    hasArrow: true,
    subItems: [
      { label: "Items", href: "/items" }
    ]
  },
  { 
    icon: Warehouse, 
    label: "Inventory", 
    hasArrow: true,
    subItems: [
      { label: "Inventory Adjustments", href: "/inventory/adjustments" }
    ]
  },
  { 
    icon: ShoppingCart, 
    label: "Sales", 
    hasArrow: true,
    subItems: [
      { label: "Customers", href: "/sales/customers" },
      { label: "Sales Orders", href: "/sales/orders" },
      { label: "Invoices", href: "/sales/invoices" },
      { label: "Payments Received", href: "/sales/payments" },
      { label: "Credit Notes", href: "/sales/credit-notes" },
    ]
  },
  { 
    icon: CreditCard, 
    label: "Purchases", 
    hasArrow: true,
    subItems: [
      { label: "Vendors", href: "/purchases/vendors" },
      { label: "Expenses", href: "/purchases/expenses" },
      { label: "Purchase Orders", href: "/purchases/orders" },
      { label: "Bills", href: "/purchases/bills" },
      { label: "Payments Made", href: "/purchases/payments" },
      { label: "Vendor Credits", href: "/purchases/credits" },
    ]
  },
  { icon: Building2, label: "Banking", href: "/banking" },
  { 
    icon: FileCheck, 
    label: "Filing & Compliance", 
    hasArrow: true,
    subItems: [
      { label: "T4A/T5018 Slips", href: "/filing" }
    ]
  },
  { icon: Calculator, label: "Accountant", hasArrow: true, href: "/accountant" },
  { icon: FileText, label: "Reports", href: "/reports" },
  { icon: FolderOpen, label: "Documents", badge: 81, href: "/documents" },
]

export function Sidebar({ collapsed, onToggle, activeItem = "Home", activeSubItem, onNavigate }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    // Auto-expand parent if sub-item is active
    const parent = navItems.find(item => 
      item.subItems?.some(sub => sub.label === activeSubItem)
    )
    return parent ? [parent.label] : []
  })

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label)
        : [...prev, label]
    )
  }

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 shrink-0",
        collapsed ? "w-14" : "w-48"
      )}
    >
      {/* Logo */}
      <div className="h-10 flex items-center px-3 border-b border-sidebar-border gap-2">
        <div className="w-6 h-6 bg-teal-600 rounded flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-xs">B</span>
        </div>
        {!collapsed && <span className="font-semibold text-xs text-sidebar-foreground">Books</span>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.label === activeItem
          const isExpanded = expandedItems.includes(item.label)
          const hasSubItems = item.subItems && item.subItems.length > 0

          return (
            <div key={item.label}>
              {hasSubItems ? (
                <button
                  onClick={() => toggleExpand(item.label)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors",
                    isActive && !isExpanded
                      ? "bg-teal-600 text-white mx-1.5 rounded"
                      : "text-sidebar-foreground hover:bg-sidebar-accent",
                    isActive && !isExpanded ? "w-[calc(100%-12px)]" : "w-full"
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                      )}
                    </>
                  )}
                </button>
              ) : (
                <Link
                  href={item.href || "#"}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 text-xs transition-colors",
                    isActive
                      ? "bg-teal-600 text-white mx-1.5 rounded"
                      : "text-sidebar-foreground hover:bg-sidebar-accent",
                    isActive ? "w-[calc(100%-12px)]" : "w-full"
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      {item.badge && (
                        <span className="bg-teal-600 text-white text-[10px] px-1 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              )}

              {/* Sub Items */}
              {hasSubItems && isExpanded && !collapsed && (
                <div className="ml-3 border-l border-sidebar-border">
                  {item.subItems?.map((subItem) => {
                    const isSubActive = subItem.label === activeSubItem
                    return (
                      <Link
                        key={subItem.label}
                        href={subItem.href}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-center gap-1.5 pl-4 pr-2 py-1.5 text-xs transition-colors",
                          isSubActive
                            ? "bg-teal-600 text-white mx-1.5 rounded"
                            : "text-sidebar-foreground hover:bg-sidebar-accent"
                        )}
                      >
                        <span className="truncate">{subItem.label}</span>
                        {isSubActive && (
                          <Plus className="w-3.5 h-3.5 ml-auto shrink-0" />
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Collapse Toggle - hidden in mobile sheet */}
      {!onNavigate && (
        <button
          onClick={onToggle}
          className="h-8 flex items-center justify-center border-t border-sidebar-border text-sidebar-foreground hover:text-sidebar-primary"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      )}
    </aside>
  )
}
