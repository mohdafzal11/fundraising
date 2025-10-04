"use client";

import { useState, useEffect } from "react";
import InvestorForm from "@/components/admin/investor-form";
import { WebsiteSchema, BreadcrumbSchema } from "@/components/schema-markup";

export default function AddInvestorPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const breadcrumbItems = [
    {
      name: "Home",
      url: `${
        typeof window !== "undefined" ? window.location.origin : ""
      }/fundraing`,
    },
    {
      name: "Admin",
      url: `${
        typeof window !== "undefined" ? window.location.origin : ""
      }/fundraing/admin`,
    },
    {
      name: "Add Investor",
      url: `${
        typeof window !== "undefined" ? window.location.origin : ""
      }/fundraing/admin/add-investor`,
    },
  ];

  return (
    <div className="container mx-auto">
      <WebsiteSchema
        title="Droom Fundraising - Add New Investor"
        description="Add a new investor on DroomDroom fundraising platform."
        url={typeof window !== "undefined" ? window.location.href : ""}
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <InvestorForm />
      </div>
    </div>
  );
}
