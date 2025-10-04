"use client"

import { Input } from "@/components/ui/input"


interface SearchBarProps {
  placeholder?: string
  className?: string
  searchQuery: string
  setSearchQuery: (query: string) => void

}

export function SearchBar({ placeholder = "Search projects...", className  , searchQuery, setSearchQuery}: SearchBarProps) {
  return (
    <Input
      type="search"
      placeholder={placeholder}
      className={className}
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  )
}
