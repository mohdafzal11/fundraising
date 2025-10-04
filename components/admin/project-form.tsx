"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn, getPageUrl } from "@/lib/utils";
import { DocumentIcon, SEOIcon } from "@/components/icons";
import {
  ProjectFormProps,
  Project,
  Round,
  Link,
  FormStep,
  Investor,
} from "@/lib/types/projects";
import { projectDetailsSchema } from "@/lib/schemas";
import ProjectBasicDetails from "../project-basic-details";
import ProjectRoundDetails from "../project-round-details";
import SeoDetails from "../seo-details";
import { useDebounce } from "@/lib/hooks/use-debounce";

export default function ProjectForm({
  initialData,
  onSuccess,
}: ProjectFormProps) {
  const { toast } = useToast();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState<Project>(
    initialData ||
      ({
        slug: "",
        name: "",
        symbol: "",
        title: "",
        description: "",
        category: [],
        logo: "",
        logoAltText: "",
        links: [] as Link[],
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
        status: "APPROVED",
        rounds: [] as Round[],
      } as Project)
  );

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [stepValidated, setStepValidated] = useState<{
    [key: number]: boolean;
  }>({
    0: false,
    1: false,
    2: false,
  });
  const [mounted, setMounted] = useState(false);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [investorLoading, setInvestorLoading] = useState(false);
  const [searchedInvestor, setSearchedInvestor] = useState("");
  const debouncedSearchQuery = useDebounce(searchedInvestor, 300);

  const [currentStep, setCurrentStep] = useState(0);

  const steps: FormStep[] = [
    {
      id: "basics",
      title: "Project Details",
      icon: <DocumentIcon />,
      description: "Add all of your project details",
    },
    {
      id: "rounds",
      title: "Rounds Details",
      icon: <DocumentIcon />,
      description: "Add all rounds details",
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

  useEffect(() => {
    fetchInvestors();
  }, [debouncedSearchQuery]);

  const fetchInvestors = async () => {
    setInvestorLoading(true);
    try {
      const response = await fetch(
        getPageUrl(
          `/api/admin/investors?search=${encodeURIComponent(debouncedSearchQuery)}`
        )
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch investors: ${response.status} ${response.statusText}`
        );
      }
      const { data } = await response.json();
      setInvestors(data || []);
    } catch (error) {
      console.error("Error fetching investors:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch investors",
        variant: "destructive",
      });
      setInvestors([]);
    } finally {
      setInvestorLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setFormSubmitting(true);
      const validationErrors: string[] = [];
      let firstInvalidStep = -1;
      let currentErrors: { [key: string]: string } = {};

      const isBasicDetails = validateProjectBasicDetails();
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
        setFormErrors(currentErrors);
        const errorMessage =
          validationErrors.length === 1
            ? validationErrors[0]
            : `Multiple validation errors:\n${validationErrors.join("\n")}`;
        throw new Error(errorMessage);
      }

      const response = await fetch(getPageUrl(`/api/admin/projects`), {
        method: formData.id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create project");
      }

      setFormSubmitted(true);
      toast({
        title: "Project Created",
        description: "Project has been successfully created.",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const validateProjectBasicDetails = () => {
    const result = projectDetailsSchema.safeParse({
      slug: formData.slug,
      name: formData.name,
      symbol: formData.symbol,
      title: formData.title,
      description: formData.description,
      category: formData.category,
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
        isDetails = validateProjectBasicDetails();
        if (!isDetails.isValid) {
          currentErrors = { ...isDetails.errors };
          setFormErrors(currentErrors);
          const errorMessages = Object.values(currentErrors)
            .filter((msg) => msg)
            .join(", ");
          validationErrors.push(
            "Project Details: " + (errorMessages || "Validation failed")
          );
          const errorMessage =
            validationErrors.length === 1
              ? validationErrors[0]
              : `Project Details:\n${validationErrors.join("\n")}`;
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
            : "Failed to proceed. Please try again.",
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
                <ProjectBasicDetails
                  formData={formData}
                  setFormData={setFormData}
                  formErrors={formErrors}
                />
              )}
              {currentStep === 1 && (
                <ProjectRoundDetails
                  formData={formData}
                  setFormData={setFormData}
                  formErrors={formErrors}
                  investors={investors}
                  investorLoading={investorLoading}
                  searchedInvestor={searchedInvestor}
                  setSearchedInvestor={setSearchedInvestor}
                />
              )}
              {currentStep === 2 && (
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