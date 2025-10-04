import { formLabelClasses } from "@/lib/constant";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import RichTextEditor from "@/components/rich-text-editor";
import { useEffect, useState } from "react";
import * as React from "react";
import { Pencil, Trash2, Plus, Save, ChevronUp, ChevronDown, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Page , Content } from "@/lib/types/page";

function PageSectionsContentDetails({ 
  formData, 
  setFormData, 
  formErrors 
}: { 
  formData: Page, 
  setFormData: (formData: Page) => void, 
  formErrors: any 
}) {
  const [contents, setContents] = useState<Content[]>(formData.contents || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempContent, setTempContent] = useState<Content | null>(null);

  useEffect(() => {
    setContents(formData.contents || []);
  }, [formData.contents]);

  const handleContentChange = (index: number, field: keyof Content, value: string | boolean | number) => {
    if (editingIndex === index && tempContent) {
      setTempContent({
        ...tempContent,
        [field]: value
      });
    } else {
      const newContents = [...contents];
      if (!newContents[index]) {
        newContents[index] = {
          id: "",
          title: "",
          content: "",
          order: newContents.length,
          isActive: true,
        };
      }
      newContents[index] = {
        ...newContents[index],
        [field]: value
      };
      setContents(newContents);
      setFormData({
        ...formData,
        contents: newContents
      });
    }
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setTempContent({ ...contents[index] });
  };

  const saveChanges = () => {
    if (editingIndex !== null && tempContent) {
      const newContents = [...contents];
      newContents[editingIndex] = tempContent;
      setContents(newContents);
      setFormData({
        ...formData,
        contents: newContents
      });
      setEditingIndex(null);
      setTempContent(null);
    }
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setTempContent(null);
  };

  const addNewContent = () => {
    const newContent: Content = {
      id: "",
      title: "",
      content: "",
      order: contents.length,
      isActive: true,
    };
    const newContents = [...contents, newContent];
    setContents(newContents);
    setFormData({
      ...formData,
      contents: newContents
    });
    setEditingIndex(newContents.length - 1);
    setTempContent(newContent);
  };

  const removeContent = (index: number) => {
    const newContents = contents.filter((_, i) => i !== index);
    // Reorder the remaining items
    const reorderedContents = newContents.map((content, i) => ({
      ...content,
      order: i
    }));
    setContents(reorderedContents);
    setFormData({
      ...formData,
      contents: reorderedContents
    });
  };

  const moveContent = (index: number, direction: 'up' | 'down') => {
    const newContents = [...contents];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newContents.length) {
      // Swap the contents
      [newContents[index], newContents[targetIndex]] = [newContents[targetIndex], newContents[index]];
      
      // Update order values
      newContents[index] = { ...newContents[index], order: index };
      newContents[targetIndex] = { ...newContents[targetIndex], order: targetIndex };
      
      setContents(newContents);
      setFormData({
        ...formData,
        contents: newContents
      });
    }
  };

  const toggleVisibility = (index: number) => {
    const newContents = [...contents];
    newContents[index] = {
      ...newContents[index],
      isActive: !newContents[index].isActive
    };
    setContents(newContents);
    setFormData({
      ...formData,
      contents: newContents
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-md">
          <h3 className="font-medium mb-2 text-foreground">Content Sections</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add content sections to your home page. You can reorder them and control their visibility.
          </p>
        </div>

        {contents.map((content, index) => (
          <div 
            key={index} 
            className={cn(
              "p-4 border rounded-lg transition-all duration-200",
              editingIndex === index ? "border-blue-500 shadow-md" : "hover:border-gray-300",
              !content.isActive && "opacity-60"
            )}
          >
            {editingIndex === index ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-foreground">Editing Content Section</h4>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={cancelEditing}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={saveChanges}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>

                <div>
                  <label htmlFor={`title-${index}`} className={formLabelClasses}>
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id={`title-${index}`}
                    required
                    placeholder="Enter content section title"
                    value={tempContent?.title || ""}
                    onChange={(e) => handleContentChange(index, 'title', e.target.value)}
                    className={cn("h-12 text-base", {
                      "border-red-500 focus-visible:ring-red-500":
                        tempContent?.title && tempContent.title.length < 3
                    })}
                  />
                  {tempContent?.title && tempContent.title.length < 3 && (
                    <p className="text-sm text-red-500 mt-1">
                      Title must be at least 3 characters.
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor={`content-${index}`} className={formLabelClasses}>
                    Content <span className="text-red-500">*</span>
                  </label>
                  <RichTextEditor
                    value={tempContent?.content || ""}
                    onChange={(value) => handleContentChange(index, 'content', value)}
                    error={!!(tempContent?.content && tempContent.content.length < 15)}
                    minWords={15}
                    maxWords={1000}
                  />
                  {tempContent?.content && tempContent.content.length < 15 && (
                    <p className="text-sm text-red-500 mt-1">
                      Content must be at least 15 characters.
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id={`visible-${index}`}
                    checked={tempContent?.isActive || false}
                    onCheckedChange={(checked) => handleContentChange(index, 'isActive', checked)}
                  />
                  <label htmlFor={`visible-${index}`} className="text-sm font-medium">
                    Visible
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold">{content.title || "Untitled Section"}</h3>
                      <span className="text-xs bg-muted px-2 py-1 rounded">Order: {index + 1}</span>
                      {content.isActive ? (
                        <Eye className="h-4 w-4 text-green-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    {content.content && (
                      <div 
                        className="prose prose-sm max-w-none mt-2 text-muted-foreground line-clamp-3" 
                        dangerouslySetInnerHTML={{ __html: content.content }} 
                      />
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveContent(index, 'up')}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveContent(index, 'down')}
                      disabled={index === contents.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleVisibility(index)}
                    >
                      {content.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing(index)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeContent(index)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        <Button
          type="button"
          onClick={addNewContent}
          className="w-full"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Content Section
        </Button>

        {contents.length === 0 && (
          <div className="text-center py-8 text-muted-foreground border border-dashed rounded-md border-border">
            <Plus className="mx-auto h-8 w-8 mb-2" />
            <p>No content sections added yet</p>
            <p className="text-sm mt-1">Add content sections to organize your home page content</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PageSectionsContentDetails; 