"use client"

import React, { Suspense } from "react"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { MessageSquare, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

interface DashboardLayoutProps {
  children: React.ReactNode
  activeItem?: string
  activeSubItem?: string
}

export function DashboardLayout({ children, activeItem = "Home", activeSubItem }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar - hidden on md and below */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          activeItem={activeItem}
          activeSubItem={activeSubItem}
        />
      </div>

      {/* Mobile Menu - Sheet with sidebar nav */}
      <div className="lg:hidden">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed left-2 top-11 z-40 h-9 w-9 shrink-0 rounded-md lg:hidden" aria-label="Open menu">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar
              collapsed={false}
              onToggle={() => {}}
              activeItem={activeItem}
              activeSubItem={activeSubItem}
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content - add left padding on mobile for hamburger */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 pl-11 lg:pl-0">
        <Suspense fallback={<header className="h-10 bg-background border-b shrink-0" />}>
          <Header />
        </Suspense>

        <main className="flex-1 overflow-y-auto p-3 bg-muted/30">
          {children}
        </main>

        {/* Bottom Bar */}
        <div className="h-8 border-t bg-background flex items-center justify-between px-3">
          <div className="flex items-center gap-3 text-muted-foreground">
            <button className="hover:text-foreground">
              <MessageSquare className="w-4 h-4" />
            </button>
            <span className="text-xs hidden sm:inline">Here is your Smart Chat (Ctrl+Space)</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="hidden md:inline">Mon to Fri 9:00AM - 9:00PM ET</span>
            <button className="flex items-center gap-1.5 text-teal-600 hover:text-teal-700">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chat with our experts</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar Icons */}
      <div className="w-12 border-l bg-background flex-col items-center py-4 gap-4 hidden lg:flex">
        <button className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-medium">
          ?
        </button>
        <button className="text-muted-foreground hover:text-foreground">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </button>
        <button className="text-muted-foreground hover:text-foreground">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </button>
        <button className="text-muted-foreground hover:text-foreground">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
        <button className="text-muted-foreground hover:text-foreground">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
