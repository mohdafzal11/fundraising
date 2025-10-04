import { formLabelClasses } from "@/lib/constant";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import RichTextEditor from "@/components/rich-text-editor";
import { Section } from "@/lib/types/section";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

function SectionBasicDetails({ 
  formData, 
  setFormData, 
  formErrors
}: { 
  formData: Section, 
  setFormData: (formData: Section) => void, 
  formErrors: any
}) {


  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className={formLabelClasses}>
            Section Title <span className="text-red-500">*</span>
          </label>
          <Input
            id="title"
            required
            placeholder="Enter section title"
            value={formData.title || ""}
            onChange={(e) => {
              const newTitle = e.target.value;
              setFormData({ 
                ...formData, 
                title: newTitle,
              });
            }}
            className={cn("h-12 text-base", {
              "border-red-500 focus-visible:ring-red-500":
                formData.title !== "" && formData.title && formData.title.length < 3
            })}
          />
          {formData.title && formData.title !== "" && formData.title.length < 3 && (
            <p className="text-sm text-red-500 mt-1">
              Title must be at least 3 characters.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="tableOfContent" className={formLabelClasses}>
            Table of Content
          </label>
          <Input
            id="tableOfContent"
            placeholder="Enter table of content for this section"
            value={formData.tableOfContent || ""}
            onChange={(e) => setFormData({ ...formData, tableOfContent: e.target.value })}
            className="h-12 text-base"
          />
        </div>

        <div>
          <label htmlFor="description" className={formLabelClasses}>
            Section Description <span className="text-red-500">*</span>
          </label>
          <RichTextEditor
            value={formData.description || ""}
            onChange={(value) => setFormData({ ...formData, description: value })}
            placeholder="Enter the main content for your section..."
            error={!!(formData.description && formData.description !== "" && formData.description.length < 15)}
            minWords={0}
            maxWords={2000}
          />
          {formData.description && formData.description !== "" && formData.description.length < 15 && (
            <p className="text-sm text-red-500 mt-1">
              Content must be at least 15 characters.
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            This will be the main content displayed on your section. You can format it using the rich text editor. You can also add tables to your section.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isTableOfContentVisible"
            checked={formData.isTableOfContentVisible ?? true}
            onCheckedChange={(checked) => setFormData({ ...formData, isTableOfContentVisible: checked })}
          />
          <label htmlFor="isTableOfContentVisible" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Show Table of Content
          </label>
        </div>
        <p className="text-sm text-muted-foreground">
          Toggle to show or hide the table of content for this section.
        </p>
      </div>
    </div>
  );
}

export default SectionBasicDetails; 