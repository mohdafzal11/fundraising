"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { 
  BasicDetailsIcon, 
  ContentIcon,
  QuestionMarkIcon
} from "@/components/icons";
import SectionBasicDetails from "@/components/admin/section-basic-detail";
import SectionTableDetail from "@/components/admin/section-table-detail";
import { getPageUrl } from "@/lib/utils";
import { Section, Table } from "@/lib/types/section";
import { useRouter } from "next/navigation";


export default function AddSectionForm() { 
  
  const { toast } = useToast();
  const router = useRouter();
  const [formData, setFormData] = useState<Section>({
    title: "",
    tableOfContent : "",
    description: "",
    tables: [] as Table[],
    isActive: true,
    isTableOfContentVisible: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    id: "",
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [formIsSubmitting, setFormIsSubmitting] = useState(false);
  const [stepValidated, setStepValidated] = useState<{ [key: number]: boolean }>({
    0: false,
    1: false,
  });

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: "basics",
      title: "Basic Details",
      icon: <BasicDetailsIcon />,
      description: "Add basic section information",
    },
    {
      id: "tables",
      title: "Tables",
      icon: <ContentIcon />,
      description: "Add and manage tables",
    },
  ];


 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormIsSubmitting(true);

    const filteredTables = (formData.tables || []).filter(t => t.headers && t.headers.length > 0 && t.rows && t.rows.length > 0);
    const submitData = { ...formData, tables: filteredTables };

    try {
      const response = await fetch(getPageUrl('/api/admin/sections'), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save page sections");
      }

      const result = await response.json();

      toast({
        title: "Page Sections Saved",
        description: `Page sections have been successfully saved.`,
      });
      router.push("/admin/sections");
    } catch (error) {
      console.error("Error saving page sections:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save page sections. Please try again.",
        variant: "destructive",
      });
    } finally {
      setFormIsSubmitting(false);
    }
  };

  
  const validateBasicDetails = () => {
    if (!formData.title) {
      toast({
        title: "Error",
        description: "Please fill in the page title",
        variant: "destructive",
      });
      return false;
    }
    
    setStepValidated({ ...stepValidated, 0: true });
    return true;
  };

  const validateContents = () => {
    setFormErrors({});
    setStepValidated({ ...stepValidated, 1: true });
    return true;
  };

  const validateFAQs = () => {
    setFormErrors({});
    setStepValidated({ ...stepValidated, 2: true });
    return true;
  };

  const nextStep = () => {
    let isValid = false;

    if (currentStep === 0) {
      isValid = validateBasicDetails();
    } else if (currentStep === 1) {
      isValid = validateContents();
    } else if (currentStep === 2) {
      isValid = validateFAQs();
    }

    if (isValid && currentStep < steps.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }, 100);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }, 100);
  };


  return (
    <>
      <div className="lg:col-span-3">
        <Card className="sticky top-6 border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Steps</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <nav className="flex flex-col">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  className={cn(
                    "flex items-center gap-3 px-6 py-4 hover:bg-accent/50 transition-colors text-left border-l-2",
                    currentStep === index
                      ? "border-l-primary font-medium bg-muted/50 text-foreground"
                      : "border-l-transparent text-muted-foreground"
                  )}
                  onClick={() => setCurrentStep(index)}
                >
                  <div
                    className={cn(
                      "w-8 h-8 flex items-center justify-center rounded-full bg-muted-foreground/10",
                      currentStep === index && "bg-primary/10 text-primary"
                    )}
                  >
                    {step.icon}
                  </div>
                  <div>
                    <div className="font-medium">{step.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {step.description}
                    </div>
                  </div>
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-9">
        <Card className="border-border">
          <CardHeader className="border-b border-border bg-muted/30">
            <CardTitle className="text-2xl font-semibold text-foreground">
              {steps[currentStep].title}
            </CardTitle>
            {currentStep === 0 && (
              <div className="text-xs text-muted-foreground mt-2">
                To embed a table in your section description, use <code>{`{{table_id}}`}</code> where <code>table_id</code> is the ID of the table you want to show. You can find the table ID in the Tables step.
              </div>
            )}
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit}>
              
              {currentStep === 0 && (
                <SectionBasicDetails 
                  formData={formData} 
                  setFormData={setFormData} 
                  formErrors={formErrors} 
                />
              )}
              {currentStep === 1 && (
                <SectionTableDetail 
                  formData={formData} 
                  setFormData={setFormData} 
                  formErrors={formErrors} 
                />
              )}
             
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="border-border hover:bg-accent/50 hover:text-accent-foreground"
                >
                  Back
                </Button>
                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={formIsSubmitting}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                      {formIsSubmitting ? "Saving..." : "Add Section"}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}