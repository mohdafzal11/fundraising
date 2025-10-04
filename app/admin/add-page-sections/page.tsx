"use client"

import AddPageSectionsForm from "@/components/admin/add-page-sections-form"

export default function AddPageSectionsPage() {
  return (
    <div className="bg-background min-h-screen py-8 transition-colors duration-200">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Add Page Sections</h1>
          <p className="mt-2 text-muted-foreground">Add content sections and FAQs to a page</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <AddPageSectionsForm />
        </div>
      </div>
    </div>
  )
}
