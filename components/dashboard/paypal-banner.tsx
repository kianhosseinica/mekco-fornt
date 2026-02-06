"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function PaypalBanner() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center gap-6 relative">
      <div className="flex items-center gap-4">
        <div className="font-bold text-xl italic text-blue-900">PayPal</div>
      </div>
      
      <div className="flex-1">
        <h3 className="font-medium text-foreground">
          Upgrade now for a seamless checkout experience
        </h3>
        <p className="text-sm text-muted-foreground">
          Upgrade to the latest version of PayPal for a seamless checkout experience, and offer Pay Later and Venmo options to your customers.
        </p>
      </div>

      <Button className="bg-teal-600 hover:bg-teal-700 text-white">
        Upgrade
      </Button>

      <button 
        onClick={() => setVisible(false)}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
