"use client";

import Script from "next/script";
import { Project, Investor, Link } from "@/lib/types/projects";
import { sanitizeHtml } from "@/lib/utils";
import { format } from "date-fns";

interface ProjectSchemaProps {
  project: any;
}

interface InvestorSchemaProps {
  investor: any;
}

interface WebsiteSchemaProps {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
}

interface OrganizationSchemaProps {
  name: string;
  url: string;
  logo?: string;
  description?: string;
}

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export function ProjectSchema({
  project,
}: ProjectSchemaProps) {
  if (!project) return null;

  const datePublished = project.createdAt
    ? new Date(project.createdAt).toISOString()
    : undefined;

  let title = project.metaTitle;

  if (!title || title.includes("Crypto")) {
    title = project.name;
  }

  let description = project.metaDescription;
  if (!description || description.startsWith("Information")) {
    const categories =
      project.category?.length > 0
        ? project.category.join(", ")
        : "various blockchain applications";
    let fundingInfo = "It is a project in the blockchain space.";
    if (project.rounds?.length > 0) {
      const sortedRounds = [...project.rounds].sort(
        (a: any, b: any) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const latest = sortedRounds[0];
      const total = project.rounds.reduce(
        (sum: number, r: any) => sum + parseInt(r.amount || "0"),
        0
      );
      const latestDate = format(
        new Date(latest?.date ?? ""),
        "MMMM d, yyyy"
      );
      const latestAmount = parseInt(
        latest.amount || "0"
      ).toLocaleString();
      const investors =
        latest.investments?.length > 0
          ? latest.investments
              .slice(0, 3)
              .map((inv: any) => inv.investor.name)
              .join(", ")
          : "various investors";
      if (project.rounds.length === 1) {
        fundingInfo = `It raised $${latestAmount} in a funding round on ${latestDate}`;
      } else {
        fundingInfo = `It has raised a total of $${total.toLocaleString()} across ${
          project.rounds.length
        } funding rounds, with the latest being $${latestAmount} on ${latestDate}`;
      }
      fundingInfo += `, supported by investors including ${investors}.`;
    }
    description = `${project.name} is a project focused on ${categories}. ${fundingInfo}`;
  }

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    description: description,
    ...(project.logo && { image: project.logo }),
    ...(project.slug && {
      url: `https://droomdroom.com/fundraising/${project.slug}`,
    }),
    ...(datePublished && { datePublished }),
    ...(project.category?.length > 0 && { 
      category: project.category.join(", ") 
    }),
    ...(project.rounds?.length > 0 && {
      offers: project.rounds.map((round: any) => ({
        "@type": "Offer",
        price: round.amount,
        priceCurrency: "USD",
        ...(round.investments?.length > 0 && {
          offeredBy: round.investments.map((inv: any) => ({
            "@type": "Organization",
            name: inv.investor.name,
          })),
        }),
      })),
    }),
  };

  return (
    <Script
      id="project-schema-markup"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      strategy="afterInteractive"
    />
  );
}

export function InvestorSchema({
  investor,
}: InvestorSchemaProps) {
  if (!investor) return null;

  const datePublished = investor.createdAt
    ? new Date(investor.createdAt).toISOString()
    : undefined;

  let title = investor.metaTitle;
  if (!title || title.includes("Crypto")) {
    title = investor.name;
  }

  let description = investor.metaDescription;
  if (!description || description.startsWith("Information")) {
    const investorType = investor.type || "crypto investor";
    let investmentInfo =
      "It is a key player in the blockchain investment space.";
    
    if (investor.investments?.length > 0) {
      const sortedInvestments = [...investor.investments].sort(
        (a: any, b: any) =>
          new Date(b.investedAt).getTime() - new Date(a.investedAt).getTime()
      );
      const latest = sortedInvestments[0];
      const total = investor.investments.reduce(
        (sum: number, inv: any) => sum + parseInt(inv.amount || "0"),
        0
      );
      const latestDate = format(
        new Date(latest?.investedAt ?? ""),
        "MMMM d, yyyy"
      );
      const latestAmount = parseInt(latest.amount || "0").toLocaleString();
      
      if (investor.investments.length === 1) {
        investmentInfo = `It invested $${latestAmount} in a funding round on ${latestDate}.`;
      } else {
        investmentInfo = `It has invested a total of $${total.toLocaleString()} across ${
          investor.investments.length
        } funding rounds, with the latest being $${latestAmount} on ${latestDate}.`;
      }
    }
    
    description = `${investor.name}, a ${investorType}, supports innovative blockchain projects. ${investmentInfo} Discover their portfolio on DroomDroom's crypto fundraising tracker.`;
  }

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: title,
    description: description,
    ...(investor.logo && { 
      logo: investor.logo,
      image: investor.logo 
    }),
    ...(investor.slug && {
      url: `https://droomdroom.com/fundraising/investors/${investor.slug}`,
    }),
    ...(investor.links?.length > 0 && {
      sameAs: investor.links
        .filter((link: any) => link.url)
        .map((link: any) => link.url)
    }),
    ...(datePublished && { foundingDate: datePublished }),
    ...(investor.investments?.length > 0 && {
      numberOfEmployees: {
        "@type": "QuantitativeValue",
        value: investor.investments.length,
        unitText: "investments"
      }
    })
  };

  return (
    <Script
      id="investor-schema-markup"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      strategy="afterInteractive"
    />
  );
}

export function WebsiteSchema({
  title,
  description,
  url,
  imageUrl,
}: WebsiteSchemaProps) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: title,
    description: description,
    url: url,
    ...(imageUrl && { image: imageUrl }),
  };

  return (
    <Script
      id="website-schema-markup"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      strategy="afterInteractive"
    />
  );
}

export function OrganizationSchema({
  name,
  url,
  logo,
  description,
}: OrganizationSchemaProps) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: name,
    url: url,
    ...(logo && { logo: logo }),
    ...(description && { description: description }),
  };

  return (
    <Script
      id="organization-schema-markup"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      strategy="afterInteractive"
    />
  );
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Script
      id="breadcrumb-schema-markup"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      strategy="afterInteractive"
    />
  );
}

export function ProjectListSchema({ projects }: { projects: any[] }) {
  if (!projects || projects.length === 0) return null;

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: projects
      .filter((project) => project.name || project.metaTitle)
      .map((project, index) => {
        const datePublished = project.createdAt
          ? new Date(project.createdAt).toISOString()
          : undefined;

        let title = project.metaTitle;

        if (!title || title.includes("Crypto")) {
          title = project.name;
        }

        let description = project.metaDescription;
        if (!description || description.startsWith("Information")) {
          const categories =
            project.category?.length > 0
              ? project.category.join(", ")
              : "various blockchain applications";
          let fundingInfo = "It is a project in the blockchain space.";
          if (project.rounds?.length > 0) {
            const sortedRounds = [...project.rounds].sort(
              (a: any, b: any) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            const latest = sortedRounds[0];
            const total = project.rounds.reduce(
              (sum: number, r: any) => sum + parseInt(r.amount || "0"),
              0
            );
            const latestDate = format(
              new Date(latest?.date ?? ""),
              "MMMM d, yyyy"
            );
            const latestAmount = parseInt(
              latest.amount || "0"
            ).toLocaleString();
            const investors =
              latest.investments?.length > 0
                ? latest.investments
                    .slice(0, 3)
                    .map((inv: any) => inv.investor.name)
                    .join(", ")
                : "various investors";
            if (project.rounds.length === 1) {
              fundingInfo = `It raised $${latestAmount} in a funding round on ${latestDate}`;
            } else {
              fundingInfo = `It has raised a total of $${total.toLocaleString()} across ${
                project.rounds.length
              } funding rounds, with the latest being $${latestAmount} on ${latestDate}`;
            }
            fundingInfo += `, supported by investors including ${investors}.`;
          }
          description = `${project.name} is a project focused on ${categories}. ${fundingInfo}`;
        }

        return {
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Product",
            name: title,
            description: description,
            ...(project.logo && { image: project.logo }),
            ...(project.slug && {
              url: `https://droomdroom.com/fundraising/${project.slug}`,
            }),
            ...(datePublished && { datePublished }),
            category: project.category.join(", ") || undefined,
            offers: project.rounds.map((round: any) => ({
              "@type": "Offer",
              price: round.amount,
              priceCurrency: "USD",
              offeredBy: round.investments.map((inv: any) => ({
                "@type": "Organization",
                name: inv.investor.name,
              })),
            })),
          },
        };
      }),
  };

  return (
    <Script
      id="project-list-schema-markup"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      strategy="afterInteractive"
    />
  );
}

export function InvestorsListSchema({ investors }: { investors: any[] }) {
  if (!investors || investors.length === 0) return null;

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: investors.length,
    itemListElement: investors
      .filter((investor) => investor?.name)
      .map((investor, index) => {
        const title = investor?.metaTitle?.trim() || investor?.name;

        let description = investor?.metaDescription?.trim();
        if (!description) {
          description = `${investor.name} is a leading crypto investor with ${
            investor._count?.investments || 0
          } investments in blockchain projects.`;
        }

        const sameAs = (investor?.links || []).map((l: any) => l.url);

        return {
          "@type": "ListItem",
          position: index + 1,
          url: `https://droomdroom.com/fundraising/investors/${investor.slug}`,
          item: {
            "@type": "Organization",
            "@id": investor.id,
            name: title,
            description: description,
            url: `https://droomdroom.com/fundraising/investors/${investor.slug}`,
          },
        };
      }),
  };

  return (
    <Script
      id="investor-list-schema-markup"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
