import { formLabelClasses } from "@/lib/constant";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import * as React from "react";
import RichTextEditor from "@/components/rich-text-editor";
import { PlusIcon, Pencil, Trash2, Save, ChevronUp, ChevronDown, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Page , FAQ } from "@/lib/types/page";

function PageSectionsFaqDetails({ 
  formData, 
  setFormData, 
  formErrors 
}: { 
  formData: Page, 
  setFormData: (formData: Page) => void, 
  formErrors: any 
}) {
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<FAQ[]>(formData.faqs || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempFAQ, setTempFAQ] = useState<FAQ | null>(null);

  useEffect(() => {
    setFaqs(formData.faqs || []);
  }, [formData.faqs]);
  const [newFAQ, setNewFAQ] = useState<FAQ>({
    id: "",
    question: "",
    answer: "",
    isActive: true,
    order: 0,
  });

  const handleFAQChange = (index: number, field: keyof FAQ, value: string | boolean | number) => {
    if (editingIndex === index && tempFAQ) {
      setTempFAQ({
        ...tempFAQ,
        [field]: value
      });
    } else {
      const newFaqs = [...faqs];
      if (!newFaqs[index]) {
        newFaqs[index] = {
          id: "",
          question: "",
          answer: "",
          isActive: true,
          order: newFaqs.length,
        };
      }
      newFaqs[index] = {
        ...newFaqs[index],
        [field]: value
      };
      setFaqs(newFaqs);
      setFormData({
        ...formData,
        faqs: newFaqs
      });
    }
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setTempFAQ({ ...faqs[index] });
  };

  const saveChanges = () => {
    if (editingIndex !== null && tempFAQ) {
      const newFaqs = [...faqs];
      newFaqs[editingIndex] = tempFAQ;
      setFaqs(newFaqs);
      setFormData({
        ...formData,
        faqs: newFaqs
      });
      setEditingIndex(null);
      setTempFAQ(null);
    }
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setTempFAQ(null);
  };

  const addFAQ = () => {
    if (!newFAQ.question.trim()) {
      toast({
        title: "Validation Error",
        description: "Question is required",
        variant: "destructive",
      });
      return;
    }

    if (!newFAQ.answer.trim()) {
      toast({
        title: "Validation Error",
        description: "Answer is required",
        variant: "destructive",
      });
      return;
    }

    const faqToAdd = {
      ...newFAQ,
      order: faqs.length,
    };

    const newFaqs = [...faqs, faqToAdd];
    setFaqs(newFaqs);
    setFormData({
      ...formData,
      faqs: newFaqs
    });

    setNewFAQ({
      id: "",
      question: "",
      answer: "",
      isActive: true,
      order: 0,
    });
  };

  const removeFAQ = (index: number) => {
    const newFaqs = faqs.filter((_, i) => i !== index);
    // Reorder the remaining items
    const reorderedFaqs = newFaqs.map((faq, i) => ({
      ...faq,
      order: i
    }));
    setFaqs(reorderedFaqs);
    setFormData({
      ...formData,
      faqs: reorderedFaqs
    });
  };

  const moveFAQ = (index: number, direction: 'up' | 'down') => {
    const newFaqs = [...faqs];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newFaqs.length) {
      // Swap the FAQs
      [newFaqs[index], newFaqs[targetIndex]] = [newFaqs[targetIndex], newFaqs[index]];
      
      // Update order values
      newFaqs[index] = { ...newFaqs[index], order: index };
      newFaqs[targetIndex] = { ...newFaqs[targetIndex], order: targetIndex };
      
      setFaqs(newFaqs);
      setFormData({
        ...formData,
        faqs: newFaqs
      });
    }
  };

  const toggleVisibility = (index: number) => {
    const newFaqs = [...faqs];
    newFaqs[index] = {
      ...newFaqs[index],
      isActive: !newFaqs[index].isActive
    };
    setFaqs(newFaqs);
    setFormData({
      ...formData,
      faqs: newFaqs
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="bg-muted/50 p-4 rounded-md">
          <h3 className="font-medium mb-2 text-foreground">Add Frequently Asked Questions</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add common questions and answers about your website. You can reorder them and control their visibility.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="question" className={`${formLabelClasses} text-foreground`}>
                Question <span className="text-destructive">*</span>
              </label>
              <Input
                id="question"
                placeholder="e.g., What services do you offer?"
                value={newFAQ.question}
                onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                className="h-12"
              />
            </div>

            <div>
              <label htmlFor="answer" className={`${formLabelClasses} text-foreground`}>
                Answer <span className="text-destructive">*</span>
              </label>
              <RichTextEditor
                value={newFAQ.answer || ""}
                onChange={(value) => setNewFAQ({ ...newFAQ, answer: value })}
                placeholder="Enter answer"
                minWords={5}
                maxWords={500}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="newFaqVisible"
                checked={newFAQ.isActive}
                onCheckedChange={(checked) => setNewFAQ({ ...newFAQ, isActive: checked })}
              />
              <label htmlFor="newFaqVisible" className="text-sm font-medium">
                Visible
              </label>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addFAQ}
              className="w-full bg-background hover:bg-accent/50"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add FAQ
            </Button>
          </div>
        </div>

        {faqs && faqs.length > 0 ? (
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Added FAQs</h3>

            {faqs.map((faq: FAQ, index: number) => (
              <div 
                key={index} 
                className={cn(
                  "bg-card rounded-md border border-border p-4 relative shadow-sm transition-all duration-200",
                  editingIndex === index && "border-blue-500 shadow-md",
                  !faq.isActive && "opacity-60"
                )}
              >
                {editingIndex === index ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-foreground">Editing FAQ</h4>
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
                      <label htmlFor={`editQuestion-${index}`} className={formLabelClasses}>
                        Question <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id={`editQuestion-${index}`}
                        placeholder="Enter question"
                        value={tempFAQ?.question || ""}
                        onChange={(e) => handleFAQChange(index, 'question', e.target.value)}
                        className="h-12"
                      />
                    </div>

                    <div>
                      <label htmlFor={`editAnswer-${index}`} className={formLabelClasses}>
                        Answer <span className="text-red-500">*</span>
                      </label>
                      <RichTextEditor
                        value={tempFAQ?.answer || ""}
                        onChange={(value) => handleFAQChange(index, 'answer', value)}
                        placeholder="Enter answer"
                        minWords={5}
                        maxWords={500}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`editVisible-${index}`}
                                              checked={tempFAQ?.isActive || false}
                      onCheckedChange={(checked) => handleFAQChange(index, 'isActive', checked)}
                      />
                      <label htmlFor={`editVisible-${index}`} className="text-sm font-medium">
                        Visible
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="pr-8">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-foreground">{faq.question}</h4>
                          <span className="text-xs bg-muted px-2 py-1 rounded">Order: {index + 1}</span>
                          {faq.isActive ? (
                            <Eye className="h-4 w-4 text-green-500" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        <div
                          className="prose dark:prose-invert prose-sm max-w-none mt-2 text-muted-foreground line-clamp-3"
                          dangerouslySetInnerHTML={{ __html: faq.answer }}
                        />
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => moveFAQ(index, 'up')}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => moveFAQ(index, 'down')}
                          disabled={index === faqs.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleVisibility(index)}
                        >
                          {faq.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
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
                          onClick={() => removeFAQ(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground border border-dashed rounded-md border-border">
            <PlusIcon className="mx-auto h-8 w-8 mb-2" />
            <p>No FAQs added yet</p>
            <p className="text-sm mt-1">Add common questions and answers about your website</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PageSectionsFaqDetails; 