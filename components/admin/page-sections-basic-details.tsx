import { formLabelClasses } from "@/lib/constant";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import RichTextEditor from "@/components/rich-text-editor";
import { Page } from "@/lib/types/page";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

function PageSectionsBasicDetails({ 
  formData, 
  setFormData, 
  formErrors,
  isEditing = false
}: { 
  formData: Page, 
  setFormData: (formData: Page) => void, 
  formErrors: any,
  isEditing: boolean
}) {

  const [isCustomPath, setIsCustomPath] = useState(false);


  const pathOptions = [
    { value: "/home", label: "Home (/home)" },
  ];

  const handlePathSelection = (value: string) => {
    setIsCustomPath(false);
    setFormData({ ...formData, path: value });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className={formLabelClasses}>
            Page Title
          </label>
          <Input
            id="title"
            required
            placeholder="Enter page title"
            value={formData.title || ""}
            onChange={(e) => {
              const newTitle = e.target.value;
              setFormData({ 
                ...formData, 
                title: newTitle,
                path: formData.path
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
          <label htmlFor="path" className={formLabelClasses}>
            Page Path (URL Path) <span className="text-red-500">*</span>
          </label>
          
          {!isCustomPath ? (
            <Select
              value={formData.path || ""}
              onValueChange={handlePathSelection}
              disabled={isEditing}
            >
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Select a page path or choose custom..." />
              </SelectTrigger>
              <SelectContent>
                {pathOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="space-y-2">
              <Input
                id="path"
                placeholder="Enter custom page path (e.g., my-custom-page)"
                value={formData.path || ""}
                onChange={(e) =>
                  setFormData({ ...formData, path: e.target.value })
                }
                className="h-12 text-base"
              />
              <button
                type="button"
                onClick={() => setIsCustomPath(false)}
                className="text-sm text-primary hover:underline"
              >
                ← Back to predefined paths
              </button>
            </div>
          )}
          
          <p className="text-sm text-muted-foreground mt-1">
            This will be used in the URL. Leave empty to auto-generate from title.
          </p>
        </div>

        <div>
          <label htmlFor="content" className={formLabelClasses}>
            Main Content
          </label>
          <RichTextEditor
            value={formData.content || ""}
            onChange={(value) => setFormData({ ...formData, content: value })}
            placeholder="Enter the main content for your page..."
            error={!!(formData.content && formData.content !== "" && formData.content.length < 15)}
            minWords={0}
            maxWords={2000}
          />
          {formData.content && formData.content !== "" && formData.content.length < 15 && (
            <p className="text-sm text-red-500 mt-1">
              Content must be at least 15 characters.
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            This will be the main content displayed on your page. You can format it using the rich text editor.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PageSectionsBasicDetails; 