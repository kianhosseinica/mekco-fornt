"use client"

import React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Plus, MoreHorizontal, BarChart3, Search, RefreshCw, ArrowUpDown, Import, Download, Settings, RotateCcw, Columns, ChevronRight } from "lucide-react"

interface PageHeaderProps {
  title: string
  secondaryTitle?: string
  searchPlaceholder?: string
  showNewButton?: boolean
  showDropdown?: boolean
  showReport?: boolean
  reportLabel?: string
  filters?: React.ReactNode
  customActions?: React.ReactNode
}

export function PageHeader({ 
  title, 
  secondaryTitle,
  searchPlaceholder,
  showNewButton = false, 
  showDropdown = true,
  showReport = false,
  reportLabel,
  filters,
  customActions 
}: PageHeaderProps) {
  return (
    <div className="border-b bg-card px-3 py-2">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 text-muted-foreground cursor-pointer hover:text-foreground" />
          
          {searchPlaceholder && (
            <div className="relative w-52 hidden md:block">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input 
                placeholder={searchPlaceholder}
                className="pl-7 h-7 text-xs bg-background"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {customActions}
          {showNewButton && (
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-7 text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" />
              New
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-7 w-7 bg-transparent">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  Sort by
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Import className="w-3.5 h-3.5" />
                  Import
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Download className="w-3.5 h-3.5" />
                  Export
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2 text-xs">
                <Settings className="w-3.5 h-3.5" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 text-xs">
                <RotateCcw className="w-3.5 h-3.5" />
                Refresh List
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 text-xs">
                <Columns className="w-3.5 h-3.5" />
                Reset Column Width
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Title Row */}
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {secondaryTitle && (
          <>
            <span className="text-muted-foreground text-xs">{title}</span>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-medium">{secondaryTitle}</h1>
              {showDropdown && (
                <button className="text-muted-foreground hover:text-foreground">
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </>
        )}
        {!secondaryTitle && (
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-medium">{title}</h1>
            {showDropdown && (
              <button className="text-muted-foreground hover:text-foreground">
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
        
        {showReport && reportLabel && (
          <button className="flex items-center gap-1.5 text-primary hover:text-primary/90 text-xs">
            <BarChart3 className="w-3.5 h-3.5" />
            {reportLabel}
          </button>
        )}
      </div>

      {filters && <div className="flex items-center gap-3 mt-2">{filters}</div>}
    </div>
  )
}
