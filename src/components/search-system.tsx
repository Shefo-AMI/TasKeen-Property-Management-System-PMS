/**
 * Global Search System Component
 * Provides search functionality across the app
 */

import React, { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { 
  Search, 
  Building2, 
  Users, 
  Key, 
  Wrench, 
  FileText,
  DollarSign,
  Calendar,
  X,
  ArrowRight,
  Clock
} from 'lucide-react'
import { cn } from './ui/utils'

interface SearchResult {
  id: string
  type: 'property' | 'tenant' | 'unit' | 'maintenance' | 'payment' | 'lease'
  title: string
  description: string
  metadata?: string
  route: string
}

interface SearchSystemProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNavigate: (path: string) => void
}

export function SearchSystem({ open, onOpenChange, onNavigate }: SearchSystemProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    if (query.trim().length > 2) {
      performSearch(query)
    } else {
      setResults([])
    }
  }, [query])

  const performSearch = async (searchQuery: string) => {
    setIsSearching(true)
    
    // Simulate search (replace with actual Supabase search)
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'property',
          title: 'Dubai Marina Towers',
          description: 'Residential building with 50 units',
          metadata: 'Active • 85% Occupancy',
          route: '/dashboard/properties',
        },
        {
          id: '2',
          type: 'tenant',
          title: 'John Smith',
          description: 'Unit 205 - Dubai Marina Towers',
          metadata: 'Lease expires in 45 days',
          route: '/dashboard/units',
        },
        {
          id: '3',
          type: 'maintenance',
          title: 'AC Repair - Unit 205',
          description: 'Urgent: Air conditioning not working',
          metadata: 'In Progress',
          route: '/dashboard/maintenance',
        },
        {
          id: '4',
          type: 'payment',
          title: 'Payment - Unit 301',
          description: 'AED 8,500 - Rent payment',
          metadata: 'Due in 3 days',
          route: '/dashboard/payments',
        },
      ].filter(result => 
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      
      setResults(mockResults)
      setIsSearching(false)
    }, 300)
  }

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'property':
        return Building2
      case 'tenant':
        return Users
      case 'unit':
        return Key
      case 'maintenance':
        return Wrench
      case 'payment':
        return DollarSign
      case 'lease':
        return FileText
      default:
        return Search
    }
  }

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'property':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      case 'tenant':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      case 'unit':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
      case 'maintenance':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
      case 'payment':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
      case 'lease':
        return 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const handleResultClick = (result: SearchResult) => {
    onNavigate(result.route)
    onOpenChange(false)
    setQuery('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Search</DialogTitle>
              <DialogDescription>
                Search across properties, tenants, units, and more
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Type to search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setQuery('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {query.trim().length > 0 && (
          <div className="px-6 pb-6">
            {isSearching ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : results.length > 0 ? (
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {results.map((result) => {
                    const Icon = getIcon(result.type)
                    return (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className={cn(
                          "w-full text-left p-4 rounded-lg border transition-all",
                          "hover:bg-accent hover:border-primary/50",
                          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "p-2 rounded-lg flex-shrink-0",
                            getTypeColor(result.type)
                          )}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h4 className="font-semibold text-sm truncate">
                                {result.title}
                              </h4>
                              <Badge
                                variant="outline"
                                className={cn("text-xs flex-shrink-0", getTypeColor(result.type))}
                              >
                                {result.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {result.description}
                            </p>
                            {result.metadata && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {result.metadata}
                              </p>
                            )}
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-sm font-medium mb-1">No results found</p>
                <p className="text-xs text-muted-foreground">
                  Try searching for properties, tenants, or maintenance requests
                </p>
              </div>
            )}
          </div>
        )}

        {query.trim().length === 0 && (
          <div className="px-6 pb-6">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground mb-2">Recent Searches</p>
              <div className="flex flex-wrap gap-2">
                {['Dubai Marina', 'John Smith', 'Unit 205', 'Maintenance'].map((recent) => (
                  <Button
                    key={recent}
                    variant="outline"
                    size="sm"
                    onClick={() => setQuery(recent)}
                    className="text-xs"
                  >
                    {recent}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

