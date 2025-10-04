"use client";

import InvestorForm from "@/components/admin/investor-form";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Investor } from "@/lib/types/projects";
import { FormShimmer } from "@/components/ui/shimmer";
import { useToast } from "@/components/ui/use-toast";
import { getPageUrl } from "@/lib/utils";
import { WebsiteSchema, BreadcrumbSchema } from "@/components/schema-markup";

export default function UpdateInvestorPage() {
  const params = useParams();
  const { toast } = useToast();
  const slug = params?.slug as string | undefined;

  const [investor, setInvestor] = useState<Investor | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvestor = async () => {
      if (!slug) {
        toast({
          title: "Error",
          description: "No investor ID provided",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          getPageUrl(`/api/admin/investors?slug=${slug}`)
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message ||
              `Failed to fetch investor: ${response.statusText}`
          );
        }

        const responseData = await response.json();
        setInvestor(responseData.data);
      } catch (error) {
        console.error("Error fetching investor:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to load investor",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvestor();
  }, [slug, toast]);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const breadcrumbItems = [
    { name: "Home", url: `${baseUrl}/fundraising` },
    { name: "Admin", url: `${baseUrl}/fundraising/admin` },
    {
      name: "Update Investor",
      url: `${baseUrl}/fundraising/admin/update-investor?slug=${slug || ""}`,
    },
  ];

  return (
    <div className="container mx-auto">
      <WebsiteSchema
        title="DroomDroom - Update Investor"
        description="Update investor information on the DroomDroom platform."
        url={typeof window !== "undefined" ? window.location.href : ""}
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {loading || !slug ? (
          <FormShimmer />
        ) : (
          <InvestorForm initialData={investor} />
        )}
      </div>
    </div>
  );
}
