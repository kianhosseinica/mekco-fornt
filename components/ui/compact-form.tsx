"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { HelpCircle } from "lucide-react"

// Compact form row with label and input side by side
export function FormRow({
  label,
  required,
  tooltip,
  children,
  className,
}: {
  label: string
  required?: boolean
  tooltip?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("grid grid-cols-[180px_1fr] items-start gap-3 py-2", className)}>
      <Label className="text-xs text-muted-foreground flex items-center gap-1 pt-2">
        <span className={required ? "text-primary" : ""}>{label}</span>
        {required && <span className="text-primary">*</span>}
        {tooltip && <HelpCircle className="w-3 h-3" />}
      </Label>
      <div className="flex-1">{children}</div>
    </div>
  )
}

// Compact input with smaller height
export function CompactInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      className={cn("h-8 text-sm", className)}
      {...props}
    />
  )
}

// Compact textarea
export function CompactTextarea({
  className,
  ...props
}: React.ComponentProps<typeof Textarea>) {
  return (
    <Textarea
      className={cn("text-sm min-h-[80px] resize-none", className)}
      {...props}
    />
  )
}

// Compact select
export function CompactSelect({
  placeholder,
  options,
  value,
  onValueChange,
  className,
}: {
  placeholder?: string
  options: { value: string; label: string }[]
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn("h-8 text-sm", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className="text-sm">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Compact radio group
export function CompactRadioGroup({
  options,
  value,
  onValueChange,
  className,
}: {
  options: { value: string; label: string }[]
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}) {
  return (
    <RadioGroup
      value={value}
      onValueChange={onValueChange}
      className={cn("flex items-center gap-4", className)}
    >
      {options.map((option) => (
        <div key={option.value} className="flex items-center gap-1.5">
          <RadioGroupItem value={option.value} id={option.value} className="h-3.5 w-3.5" />
          <Label htmlFor={option.value} className="text-sm font-normal cursor-pointer">
            {option.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  )
}

// Compact checkbox
export function CompactCheckbox({
  label,
  checked,
  onCheckedChange,
  className,
}: {
  label: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="h-3.5 w-3.5"
      />
      <Label className="text-sm font-normal cursor-pointer">{label}</Label>
    </div>
  )
}

// Section header
export function FormSection({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <h3 className="text-sm font-medium text-foreground border-b pb-2 mb-2">{title}</h3>
      {children}
    </div>
  )
}

// Phone input with country code
export function PhoneInput({
  countryCode = "+1",
  placeholder,
  className,
}: {
  countryCode?: string
  placeholder?: string
  className?: string
}) {
  return (
    <div className={cn("flex gap-1", className)}>
      <Select defaultValue={countryCode}>
        <SelectTrigger className="h-8 w-16 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="+1">+1</SelectItem>
          <SelectItem value="+44">+44</SelectItem>
          <SelectItem value="+91">+91</SelectItem>
        </SelectContent>
      </Select>
      <Input className="h-8 text-sm flex-1" placeholder={placeholder} />
    </div>
  )
}

// Currency input
export function CurrencyInput({
  currency = "CAD",
  className,
  ...props
}: {
  currency?: string
} & React.ComponentProps<typeof Input>) {
  return (
    <div className={cn("flex", className)}>
      <span className="inline-flex items-center px-2 text-sm bg-muted border border-r-0 rounded-l-md text-muted-foreground">
        {currency}
      </span>
      <Input className="h-8 text-sm rounded-l-none" {...props} />
    </div>
  )
}
