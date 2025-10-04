"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn, getPageUrl } from "@/lib/utils";
import { DocumentIcon, SEOIcon } from "@/components/icons";
import {
  InvestorFormProps,
  Link,
  FormStep,
  Investor,
} from "@/lib/types/projects";
import { investorDetailsSchema } from "@/lib/schemas";
import InvestorBasicDetails from "../investor-basic-details";
import SeoDetails from "../seo-details";

export default function InvestorForm({
  initialData,
  onSuccess,
}: InvestorFormProps) {
  const { toast } = useToast();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState<Investor>(
    initialData ||
      ({
        slug: "",
        name: "",
        description: "",
        logo: "",
        logoAltText: "",
        links: [] as Link[],
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
        status: "APPROVED",
      } as Investor)
  );

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [stepValidated, setStepValidated] = useState<{
    [key: number]: boolean;
  }>({
    0: false,
    1: false,
  });
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);

  const steps: FormStep[] = [
    {
      id: "basics",
      title: "Investor Details",
      icon: <DocumentIcon />,
      description: "Add all of your investor details",
    },
    {
      id: "seo",
      title: "Seo Details",
      icon: <SEOIcon />,
      description: "All seo details",
    },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setFormSubmitting(true);
      const validationErrors: string[] = [];
      let firstInvalidStep = -1;
      let currentErrors: { [key: string]: string } = {};

      const isBasicDetails = validateInvestorBasicDetails();
      if (!isBasicDetails.isValid) {
        firstInvalidStep = firstInvalidStep === -1 ? 0 : firstInvalidStep;
        currentErrors = { ...isBasicDetails.errors };
        const errorMessages = Object.values(currentErrors)
          .filter((msg) => msg)
          .join(", ");
        validationErrors.push(
          "Project Details: " + (errorMessages || "Validation failed")
        );
      }

      if (validationErrors.length > 0) {
        setCurrentStep(firstInvalidStep);
        const errorMessage =
          validationErrors.length === 1
            ? validationErrors[0]
            : `Multiple validation errors:\n${validationErrors.join("\n")}`;
        throw new Error(errorMessage);
      }

      const response = await fetch(getPageUrl(`/api/admin/ivestors`), {
        method: formData.id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create event");
      }

      setFormSubmitted(true);
      toast({
        title: "Event Created",
        description: "Event has been successfully created.",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const validateInvestorBasicDetails = () => {
    const result = investorDetailsSchema.safeParse({
      slug: formData.slug,
      name: formData.name,
      description: formData.description,
      logo: formData.logo || "",
      logoAltText: formData.logoAltText,
      links: formData.links,
      status: "APPROVED",
    });

    if (!result.success) {
      const errors: { [key: string]: string } = {};
      result.error.errors.forEach((error) => {
        errors[error.path.join(".")] = error.message;
      });
      console.log("Basic Details Errors", errors);
      return {
        isValid: false,
        errors: errors,
      };
    }

    setStepValidated({ ...stepValidated, 0: true });
    return {
      isValid: true,
      errors: {},
    };
  };

  const nextStep = () => {
    try {
      let isDetails = {
        isValid: true,
        errors: {},
      };
      const validationErrors: string[] = [];
      let currentErrors: { [key: string]: string } = {};

      if (currentStep === 0) {
        isDetails = validateInvestorBasicDetails();
        if (!isDetails.isValid) {
          currentErrors = { ...isDetails.errors };
          const errorMessages = Object.values(currentErrors)
            .filter((msg) => msg)
            .join(", ");
          validationErrors.push(
            "Event Details: " + (errorMessages || "Validation failed")
          );
          const errorMessage =
            validationErrors.length === 1
              ? validationErrors[0]
              : `Event Deatils:\n${validationErrors.join("\n")}`;
          throw new Error(errorMessage);
        }
      }
      if (isDetails.isValid && currentStep < steps.length - 1) {
        setTimeout(() => {
          setCurrentStep((s) => s + 1);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 0);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 0);
  };

  return (
    <>
      <div className="lg:col-span-3">
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle className="text-lg">Steps</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <nav className="flex flex-col">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  className={cn(
                    "flex items-center gap-3 px-6 py-4 hover:bg-muted transition-colors text-left border-l-2",
                    currentStep === index
                      ? "border-l-primary font-medium bg-muted/50"
                      : "border-l-transparent"
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

      {/* Main Form Content */}
      <div className="lg:col-span-8">
        <Card>
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-2xl font-semibold">
              {steps[currentStep].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit}>
              {currentStep === 0 && (
                <InvestorBasicDetails
                  formData={formData}
                  setFormData={setFormData}
                  formErrors={formErrors}
                />
              )}

              {currentStep === 1 && (
                <SeoDetails
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
                >
                  Back
                </Button>
                {currentStep < steps.length - 1 ? (
                  <Button type="button" onClick={nextStep}>
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={formSubmitting || formSubmitted}
                  >
                    {formSubmitting
                      ? "Submitting..."
                      : formSubmitted
                      ? "Project Submitted"
                      : formData?.id
                      ? "Update Project"
                      : "Submit Project"}
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
