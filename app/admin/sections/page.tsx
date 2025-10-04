"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Button,
  Container,
  Section,
  FadeIn,
} from '@/components/ui'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { H1 } from '@/components/ui/typography'
import { toast } from '@/components/ui/use-toast'
import { Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { getPageUrl } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { CustomLink } from '@/components/custom-link'
import { Section as SectionType } from '@/lib/types/section'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

function SkeletonRow() {
  return (
    <TableRow className="border-b border-border">
      <TableCell><div className="h-4 w-24 rounded bg-muted-foreground/10 shimmer"></div></TableCell>
      <TableCell><div className="h-4 w-28 rounded bg-muted-foreground/10 shimmer"></div></TableCell>
      <TableCell><div className="h-4 w-28 rounded bg-muted-foreground/10 shimmer"></div></TableCell>
      <TableCell><div className="h-6 w-16 rounded-full bg-muted-foreground/10 shimmer"></div></TableCell>
      <TableCell>
        <div className="flex gap-2 justify-end">
          <div className="h-8 w-16 rounded bg-muted-foreground/10 shimmer"></div>
        </div>
      </TableCell>
    </TableRow>
  );
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function SectionsAdminPage() {

  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sections, setSections] = useState<SectionType[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  const fetchSections = useCallback(async (page: number, search: string = '') => {
    setLoading(true)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search })
      })
      
      const response = await fetch(getPageUrl(`/api/admin/sections?${params}`))
      
      if (!response.ok) {
        throw new Error(`Failed to fetch sections: ${response.status} ${response.statusText}`)
      }

      const responseData = await response.json()
      console.log(responseData)
      if (responseData.data && Array.isArray(responseData.data)) {
        setSections(responseData.data as SectionType[])
        if (responseData.pagination) {
          setPagination(responseData.pagination)
        }
      }
    } catch (error) {
      console.error('Error fetching sections:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch sections',
        variant: 'destructive',
      })
      setSections([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDelete = async (sectionId: string, sectionTitle: string) => {
    setDeletingId(sectionId)
    
    try {
      const response = await fetch(getPageUrl(`/api/admin/sections/${sectionId}`), {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to delete section: ${response.statusText}`)
      }

      // Refresh the current page after deletion
      await fetchSections(currentPage, searchTerm)
      
      toast({
        title: 'Success',
        description: `Section "${sectionTitle}" has been deleted successfully.`,
      })
    } catch (error) {
      console.error('Error deleting section:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete section',
        variant: 'destructive',
      })
    } finally {
      setDeletingId(null)
    }
  }

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1)
      fetchSections(1, searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, fetchSections])

  // Pagination effect
  useEffect(() => {
    if (currentPage > 1) {
      fetchSections(currentPage, searchTerm)
    }
  }, [currentPage, fetchSections, searchTerm])

  useEffect(() => {
    setMounted(true)
    fetchSections(1)
  }, [fetchSections])
 
  if (!mounted) return null

  return (
    <div className="bg-background min-h-screen pt-8 transition-colors duration-200">
      <Container className="space-y-0">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <H1 className="mb-0">Manage Sections (Admin)</H1>
            
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3">
              <Button asChild>
                <CustomLink href="/admin/add-section">Add Section</CustomLink>
              </Button>
            </div>
          </div>
          
          {/* Search Input */}
          <div className="flex items-center space-x-2 max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search sections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <Section className="mt-0 pt-0 border-0">
          <FadeIn className="mt-0">
            <div className="w-full overflow-auto rounded-lg shadow-sm border border-border">
              <style jsx global>{`
                @keyframes shimmer {
                  0% {
                    background-position: -200% 0;
                  }
                  100% {
                    background-position: 200% 0;
                  }
                }
                
                .shimmer {
                  background: linear-gradient(90deg, var(--shimmer-start, rgba(0,0,0,0.05)) 25%, var(--shimmer-mid, rgba(0,0,0,0.07)) 50%, var(--shimmer-end, rgba(0,0,0,0.05)) 75%);
                  background-size: 200% 100%;
                  animation: shimmer 1.5s infinite;
                }
                
                .dark .shimmer {
                  --shimmer-start: hsl(0 0% 4%);
                  --shimmer-mid: hsl(0 0% 7%);
                  --shimmer-end: hsl(0 0% 4%);
                }
              `}</style>
              
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border bg-muted/30">
                    <TableHead className="text-xs font-semibold text-muted-foreground py-4">TITLE</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground py-4">CREATED</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground py-4">UPDATED</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground py-4">ACTIVE</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground py-4 text-right">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array(10).fill(0).map((_, index) => (
                      <SkeletonRow key={index} />
                    ))
                  ) : sections && sections.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? `No sections found matching "${searchTerm}".` : "No sections found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                        Array.isArray(sections) && sections.map((section) => (
                      <TableRow 
                        key={section.id}
                        className={cn(
                          "border-b border-border transition-colors",
                          "hover:bg-accent/50 dark:hover:bg-primary/10",
                          "bg-card"
                        )}
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center">
                            <div className={`h-2 w-2 rounded-full bg-primary mr-2`}></div>
                            <span className="font-medium text-foreground text-sm max-w-[200px] truncate">{section.title}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(section.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                            {new Date(section.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400`}>
                            Active
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" asChild>
                                <CustomLink href={`/admin/edit-section/${section.id}`}>
                                <Pencil className="h-4 w-4 mr-1" />
                                Edit
                              </CustomLink>
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  disabled={deletingId === section.id}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  {deletingId === section.id ? 'Deleting...' : 'Delete'}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Section</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete the section "{section.title}"? 
                                    This action cannot be undone and will also delete all associated tables.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(section.id, section.title)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete Section
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination Controls */}
            {!loading && sections.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 bg-card border-t border-border rounded-b-lg">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{' '}
                    {pagination.totalCount} sections
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    disabled={!pagination.hasPrevPage || loading}
                    className="flex items-center space-x-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        const current = pagination.page;
                        return page === 1 || page === pagination.totalPages || 
                               (page >= current - 2 && page <= current + 2);
                      })
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 text-muted-foreground">...</span>
                          )}
                          <Button
                            variant={page === pagination.page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            disabled={loading}
                            className="min-w-[2rem]"
                          >
                            {page}
                          </Button>
                        </div>
                      ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!pagination.hasNextPage || loading}
                    className="flex items-center space-x-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </FadeIn>
        </Section>
      </Container>
    </div>
  )
}