"use client"

import { Search, RefreshCw, Plus, Users, Bell, Settings, Grid3X3 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlSearch = searchParams.get("search") ?? ""
  const [searchInput, setSearchInput] = useState(urlSearch)

  useEffect(() => {
    setSearchInput(urlSearch)
  }, [urlSearch])

  const applySearch = (q: string) => {
    const trimmed = q.trim()
    const next = new URLSearchParams(searchParams.toString())
    if (trimmed) next.set("search", trimmed)
    else next.delete("search")
    const query = next.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  const searchPlaceholder = (() => {
    if (pathname?.includes("/items")) return "Search items..."
    if (pathname?.includes("/customers")) return "Search customers..."
    if (pathname?.includes("/vendors")) return "Search vendors..."
    if (pathname?.includes("/invoices")) return "Search invoices..."
    if (pathname?.includes("/orders")) return "Search orders..."
    if (pathname?.includes("/bills")) return "Search bills..."
    if (pathname?.includes("/reports")) return "Search reports..."
    return "Search ( / )"
  })()

  return (
    <header className="h-10 bg-background border-b flex items-center justify-between px-2 sm:px-3">
      {/* Left Section */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button className="text-muted-foreground hover:text-foreground hidden sm:block">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        <form
          className="relative"
          onSubmit={(e) => { e.preventDefault(); applySearch(searchInput); }}
        >
          <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="pl-7 pr-3 py-1 text-xs bg-muted rounded w-28 sm:w-40 md:w-56 focus:outline-none focus:ring-1 focus:ring-ring"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onBlur={() => applySearch(searchInput)}
          />
        </form>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="text-right mr-2 hidden xl:block">
          <div className="text-xs text-muted-foreground">Zoho Books Helpline: <span className="text-foreground font-medium">+1 5146736167</span></div>
          <div className="text-[10px] text-muted-foreground">Mon - Fri - Toll Free</div>
        </div>

        <Button variant="ghost" size="sm" className="text-muted-foreground hidden md:flex h-7 text-xs">
          Mekco Supply Inc.
          <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>

        <Button size="icon" className="bg-teal-600 hover:bg-teal-700 text-white rounded h-7 w-7">
          <Plus className="w-3.5 h-3.5" />
        </Button>

        <Button variant="ghost" size="icon" className="text-muted-foreground hidden sm:flex h-7 w-7">
          <Users className="w-4 h-4" />
        </Button>

        <div className="relative">
          <Button variant="ghost" size="icon" className="text-muted-foreground h-7 w-7">
            <Bell className="w-4 h-4" />
          </Button>
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
            63
          </span>
        </div>

        <Button variant="ghost" size="icon" className="text-muted-foreground hidden sm:flex h-7 w-7">
          <Settings className="w-4 h-4" />
        </Button>

        <Avatar className="w-6 h-6">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback className="bg-orange-100 text-orange-600 text-xs">SB</AvatarFallback>
        </Avatar>

        <Button variant="ghost" size="icon" className="text-muted-foreground hidden sm:flex h-7 w-7">
          <Grid3X3 className="w-4 h-4" />
        </Button>
      </div>
    </header>
  )
}
