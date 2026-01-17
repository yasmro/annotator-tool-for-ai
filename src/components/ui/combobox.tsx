import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export interface ComboboxOption {
  value: string
  label: string
  icon?: React.ReactNode
  category?: string
}

export interface ComboboxProps {
  options: string[] | ComboboxOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  clearLabel?: string
  showClearOption?: boolean
}

function normalizeOptions(options: string[] | ComboboxOption[]): ComboboxOption[] {
  if (options.length === 0) return []
  if (typeof options[0] === "string") {
    return (options as string[]).map(o => ({ value: o, label: o }))
  }
  return options as ComboboxOption[]
}

function groupByCategory(options: ComboboxOption[]): Map<string | undefined, ComboboxOption[]> {
  const groups = new Map<string | undefined, ComboboxOption[]>()

  for (const option of options) {
    const category = option.category
    if (!groups.has(category)) {
      groups.set(category, [])
    }
    groups.get(category)!.push(option)
  }

  return groups
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found",
  clearLabel = "Clear selection",
  showClearOption = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const normalizedOptions = normalizeOptions(options)
  const groupedOptions = groupByCategory(normalizedOptions)
  const hasCategories = groupedOptions.size > 1 || (groupedOptions.size === 1 && !groupedOptions.has(undefined))

  const selectedOption = normalizedOptions.find(o => o.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className={cn("justify-between", className)}>
          <span className="flex items-center gap-2 truncate">
            {selectedOption?.icon}
            {selectedOption?.label || value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandEmpty>{emptyText}</CommandEmpty>
          <CommandList>
            {showClearOption && value && (
              <>
                <CommandGroup>
                  <CommandItem
                    value="__clear__"
                    onSelect={() => {
                      onValueChange?.("")
                      setOpen(false)
                    }}
                  >
                    <X className="mr-2 size-4" />
                    {clearLabel}
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
              </>
            )}
            {hasCategories ? (
              Array.from(groupedOptions.entries()).map(([category, categoryOptions], index) => (
                <React.Fragment key={category || "__uncategorized__"}>
                  {index > 0 && <CommandSeparator />}
                  <CommandGroup heading={category}>
                    {categoryOptions.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => {
                          onValueChange?.(option.value === value ? "" : option.value)
                          setOpen(false)
                        }}
                      >
                        <Check className={cn("mr-2 size-4", value === option.value ? "opacity-100" : "opacity-0")} />
                        {option.icon && <span className="mr-2">{option.icon}</span>}
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </React.Fragment>
              ))
            ) : (
              <CommandGroup>
                {normalizedOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => {
                      onValueChange?.(option.value === value ? "" : option.value)
                      setOpen(false)
                    }}
                  >
                    <Check className={cn("mr-2 size-4", value === option.value ? "opacity-100" : "opacity-0")} />
                    {option.icon && <span className="mr-2">{option.icon}</span>}
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
