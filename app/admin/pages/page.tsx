"use client"

import { useState, useEffect } from 'react'
import {
  Button,
  Container,
  Section,
  FadeIn,
} from '@/components/ui'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { H1 } from '@/components/ui/typography'
import { toast } from '@/components/ui/use-toast'
import { Pencil } from 'lucide-react'
import { getPageUrl } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { CustomLink } from '@/components/custom-link'
import { Page } from '@/lib/types/page'

function SkeletonRow() {
  return (
    <TableRow className="border-b border-border">
      <TableCell><div className="h-4 w-32 rounded bg-muted-foreground/10 shimmer"></div></TableCell>
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

export default function PagesAdminPage() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pages, setPages] = useState<Page[]>([])

  const fetchPages = async () => {
    setLoading(true)

    try {
    const response = await fetch(getPageUrl(`/api/admin/pages`))
      
      if (!response.ok) {
        throw new Error(`Failed to fetch pages: ${response.status} ${response.statusText}`)
      }

      const responseData = await response.json()
      
      if (responseData.data && Array.isArray(responseData.data)) {
        setPages(responseData.data)
      }
    } catch (error) {
      console.error('Error fetching pages:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch pages',
        variant: 'destructive',
      })
      setPages([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    fetchPages()
  }, [])
 
  if (!mounted) return null

  return (
    <div className="bg-background min-h-screen pt-8 transition-colors duration-200">
      <Container className="space-y-0">
        <div className="flex flex-col space-y-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-0 pb-0">
            <H1 className="mb-0">Manage Pages (Admin)</H1>
            
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3 mb-0">
              <Button asChild>
                <CustomLink href="/admin/add-page-sections">Add Page Sections</CustomLink>
              </Button>
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
                    <TableHead className="text-xs font-semibold text-muted-foreground py-4">PATH</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground py-4">CREATED AT</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground py-4">UPDATED AT</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground py-4">STATUS</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground py-4 text-right">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array(8).fill(0).map((_, index) => (
                      <SkeletonRow key={index} />
                    ))
                  ) : pages && pages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No pages found
                      </TableCell>
                    </TableRow>
                  ) : (
                    Array.isArray(pages) && pages.map((page) => (
                      <TableRow 
                        key={page.id}
                        className={cn(
                          "border-b border-border transition-colors",
                          "hover:bg-accent/50 dark:hover:bg-primary/10",
                          "bg-card"
                        )}
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center">
                            <div className={`h-2 w-2 rounded-full bg-primary mr-2`}></div>
                            <span className="font-medium text-foreground">{page.title}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{page.path}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {page.createdAt && page?.createdAt?.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {page.updatedAt && page.updatedAt.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400`}>
                            Active
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" asChild>
                                <CustomLink href={"/admin/edit-page-sections/" + page.path}>
                                <Pencil className="h-4 w-4 mr-1" />
                                Edit
                              </CustomLink>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </FadeIn>
        </Section>
      </Container>
    </div>
  )
}