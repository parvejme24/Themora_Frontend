"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Radix Select reserves "" for "no value", so an "All…/None" option is stored under this key
const EMPTY = "__empty__"

export interface SelectOption<T extends string = string> {
  value: T
  label: React.ReactNode
}

interface SelectFieldProps<T extends string> {
  value: T | ""
  onValueChange: (value: T | "") => void
  options: readonly SelectOption<T>[]
  /** Adds a first option meaning "" (e.g. "All types", "No specific order") */
  emptyLabel?: React.ReactNode
  /** Shown when nothing is chosen and there is no emptyLabel option */
  placeholder?: string
  id?: string
  name?: string
  required?: boolean
  disabled?: boolean
  "aria-label"?: string
  className?: string
  size?: "sm" | "default"
}

/** shadcn Select with a native-select-like API: a value, a change handler and a list of options */
export function SelectField<T extends string>({
  value,
  onValueChange,
  options,
  emptyLabel,
  placeholder,
  id,
  name,
  required,
  disabled,
  className,
  size,
  "aria-label": ariaLabel,
}: SelectFieldProps<T>) {
  const current = value === "" ? (emptyLabel !== undefined ? EMPTY : "") : value
  return (
    <Select
      value={current}
      onValueChange={(next) => onValueChange(next === EMPTY ? "" : (next as T))}
      name={name}
      required={required}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        size={size}
        aria-label={ariaLabel}
        className={cn("data-[size=default]:h-auto data-[size=default]:min-h-9", className)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {emptyLabel !== undefined && <SelectItem value={EMPTY}>{emptyLabel}</SelectItem>}
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
