"use client"

import EditSectionForm from "@/components/admin/edit-section-form"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { FormShimmer } from "@/components/ui/shimmer"
import { useToast } from "@/components/ui/use-toast"
import { getPageUrl } from "@/lib/utils"
import { Section } from "@/lib/types/section"


export default function EditSectionPage() {
  const params = useParams()
  const { toast } = useToast()

  if (!params || !params.id) {
    return <FormShimmer />; 
  }
  
  const id = params.id as string; 

  const [section, setSection] = useState<Section | undefined>(undefined)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    const fetchSection = async () => {
      try {
        setLoading(true)
        if (!id) {
          throw new Error('No section id provided')
        }
        
        const response = await fetch(getPageUrl(`/api/admin/sections/${id}`))
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `Failed to fetch section: ${response.statusText}`)
        }
        
        const data = await response.json()
        setSection(data)
      } catch (error) {
        console.error('Error fetching section:', error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load section",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    if (id) {
      fetchSection()
    }
  }, [id, toast]) 

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <div className="flex items-center mb-6">
        <nav className="flex text-sm text-muted-foreground mb-2">
          <a href={getPageUrl("/")} className="hover:text-foreground">Home</a>
          <span className="mx-2">›</span>
          <a href={getPageUrl("/admin/sections")} className="hover:text-foreground">Sections</a>
          <span className="mx-2">›</span>
          <span className="text-foreground font-medium">Edit Section</span>
        </nav>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Edit Section</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {loading ? (
          <FormShimmer />
        ) : (
          <EditSectionForm initialData={section} isLoading={loading}  />
        )}
      </div>
    </div>
  )
}
