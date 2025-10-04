"use client"

import { useState, useEffect } from "react"
import { WebsiteSchema, BreadcrumbSchema } from "@/components/schema-markup"
import ProjectForm from "@/components/admin/project-form"

export default function AdminAddProjectPage() {

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const breadcrumbItems = [
    { name: "Home", url: `${typeof window !== "undefined" ? window.location.origin : ""}/fundraising` },
    { name: "Admin", url: `${typeof window !== "undefined" ? window.location.origin : ""}/admin` },
    { name: "Add Project", url: `${typeof window !== "undefined" ? window.location.origin : ""}/admin/add-project` },
  ];

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">

      <WebsiteSchema 
        title="Droom Fundraising - Add New Project" 
        description="Add a new project on DroomDroom fundraising platform."
        url={typeof window !== "undefined" ? window.location.href : ""}
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <ProjectForm />
      </div>
    </div>
  )
}