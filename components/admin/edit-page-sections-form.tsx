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
import PageSectionsBasicDetails from "@/components/admin/page-sections-basic-details";
import PageSectionsContentDetails from "@/components/admin/page-sections-content-details";
import PageSectionsFaqDetails from "@/components/admin/page-sections-faq-details";
import { getPageUrl } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Page } from "@/lib/types/page";

const ShimmerLoading = () => {
  return (
    <>
      <div className="lg:col-span-3">
        <Card className="sticky top-6 border-border">
          <CardHeader>
            <div className="h-6 w-16 bg-muted rounded animate-pulse"></div>
          </CardHeader>
          <CardContent className="p-0">
            <nav className="flex flex-col">
              {[1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 px-6 py-4 border-l-2 border-l-transparent"
                >
                  <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse mb-2"></div>
                    <div className="h-3 w-32 bg-muted/70 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </nav>
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-9">
        <Card className="border-border">
          <CardHeader className="border-b border-border bg-muted/30">
            <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
              </div>
              
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                <div className="h-32 w-full bg-muted rounded animate-pulse"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
                {[1, 2, 3].map((index) => (
                  <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
                        <div className="h-3 w-1/2 bg-muted/70 rounded animate-pulse"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                        <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <div className="h-10 w-20 bg-muted rounded animate-pulse"></div>
              <div className="h-10 w-24 bg-muted rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default function EditPageSectionsForm({ path }: { path: string }) { 

  const router = useRouter();

  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);  
  const [formData, setFormData] = useState<Page>({
    title: "",
    content: "",
    path: "",
    contents: [],
    faqs: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    id: "",
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [formIsSubmitting, setFormIsSubmitting] = useState(false);
  const [stepValidated, setStepValidated] = useState<{ [key: number]: boolean }>({
    0: false,
    1: false,
    2: false,
  });

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: "basics",
      title: "Basic Details",
      icon: <BasicDetailsIcon />,
      description: "Add basic page information",
    },
    {
      id: "contents",
      title: "Content Sections",
      icon: <ContentIcon />,
      description: "Add and manage content sections",
    },
    {
      id: "faqs",
      title: "FAQs",
      icon: <QuestionMarkIcon />,
      description: "Add and manage frequently asked questions",
    },
  ];

  const fetchPageData = async (pageId: string) => {
    try {
      setLoading(true);
      const response = await fetch(getPageUrl(`/api/admin/page-sections?path=/${path}`));
      
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setFormData({
            id: data.data.id,
            title: data.data.title || "",
            content: data.data.content || "",
            path: data.data.path || "",
            contents: data.data.contents || [],
            faqs: data.data.faqs || [],
            isActive: data.data.isActive || true,
            createdAt: data.data.createdAt || new Date(),
            updatedAt: data.data.updatedAt || new Date(),
          });
          setIsEditing(true);
        }
      }
    } catch (error) {
      console.error("Error fetching page data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (path) {
      fetchPageData(path);
      setLoading(false);
    }
  }, [path]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormIsSubmitting(true);

    try {
      const response = await fetch(getPageUrl(`/api/admin/page-sections?path=/${path}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save page content");
      }
      toast({
        title: "Page sections updated",
        description: `Page sections have been successfully updated.`,
      });

      router.push(`/admin/pages`);
      } catch (error) {
      console.error("Error saving page:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save page content. Please try again.",
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

  if (loading) {
    return <ShimmerLoading />;
  }

  return (
    <>
      <div className="lg:col-span-3">
        <Card className="sticky top-6 border-border mb-6">
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
              {isEditing && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  (Editing: {formData.title || 'Untitled Page'})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit}>
              
              {currentStep === 0 && (
                <PageSectionsBasicDetails 
                  formData={formData} 
                  setFormData={(formData: Page) => setFormData(formData)} 
                  formErrors={formErrors} 
                  isEditing={true}
                />
              )}
              {currentStep === 1 && (
                <PageSectionsContentDetails 
                  formData={formData} 
                  setFormData={(formData: Page) => setFormData(formData)} 
                  formErrors={formErrors} 
                />
              )}
              {currentStep === 2 && (
                <PageSectionsFaqDetails 
                  formData={formData} 
                  setFormData={(formData: Page) => setFormData(formData)        } 
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
                    {formIsSubmitting ? "Saving..." : "Update Page"}
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