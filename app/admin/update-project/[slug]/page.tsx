"use client"

import ProjectForm from "@/components/admin/project-form"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Project } from '@/lib/types/projects'
import { FormShimmer } from "@/components/ui/shimmer"
import { useToast } from "@/components/ui/use-toast"
import { getPageUrl } from "@/lib/utils"


export default function AdminUpPage() {
  const params = useParams()
  const { toast } = useToast()

  if (!params || !params.slug) {
    return <FormShimmer />; 
  }
  
  const slug = params.slug as string; 

  const [project, setProject] = useState<Project | undefined>(undefined)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        if (!slug) {
          throw new Error('No project slug provided')
        }
        
        const response = await fetch(getPageUrl(`/api/admin/projects?slug=${slug}`))
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `Failed to fetch project: ${response.statusText}`)
        }
        
        const responseData = await response.json()
        setProject(responseData.data)
      } catch (error) {
        console.error('Error fetching project:', error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load project",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    if (slug) {
      fetchProject()
    }
  }, [slug, toast]) 

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {loading ? (
          <FormShimmer />
        ) : (
          <ProjectForm  initialData={project} />
        )}
      </div>
    </div>
  )
}
