import { Metadata } from "next";
import Link from "next/link";
import { Button, Container } from "@/components/ui";
import { H2, P } from "@/components/ui/typography";
import { prisma } from "@/lib/prisma";
import { InvestorStatus } from "@prisma/client";
import InvestorPageClient from "./investor-page-client";
import { Pagination } from "@/lib/types/projects";
import { cleanSEOIMAGEURL, sanitizeHtmlForSEO } from "@/lib/utils";
import { format } from "date-fns";
import {
  WebsiteSchema,
  InvestorSchema,
  BreadcrumbSchema,
  ProjectListSchema,
} from "@/components/schema-markup";
import { getPageUrl } from "@/lib/utils";
import { cache } from "react";

// Force static generation with ISR (Incremental Static Regeneration)
// This will pre-generate all pages at build time and revalidate them every hour
export const dynamic = "force-static";
export const revalidate = 3600; // Revalidate every 1 hour (3600 seconds)
export const dynamicParams = true; // Allow dynamic params for new investors

// Cached function to get investor by slug
const getInvestor = cache(async (slug: string) => {
  try {
    const investor = await prisma.investor.findFirst({
      where: {
        slug: { equals: slug, mode: "insensitive" },
        status: InvestorStatus.APPROVED,
      },
      include: {
        investments: true,
      },
    });
    return investor;
  } catch (error) {
    console.error(`Failed to fetch investor ${slug}:`, error);
    // Return null during build if DB is unavailable
    return null;
  }
});

// Cached function to get investor projects
const getInvestorProjects = cache(async (slug: string) => {
  try {
    const page = 1;
    const pageSize = 10;

    const latestRounds = await prisma.round.groupBy({
      by: ["projectId"],
      where: {
        investments: {
          some: { investor: { slug } },
        },
      },
      _max: { date: true },
      orderBy: { _max: { date: "desc" } },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const projectIds = latestRounds.map((r) => r.projectId);

    if (projectIds.length === 0) {
      return {
        projects: [],
        pagination: {
          page,
          pageSize,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        } as Pagination,
      };
    }

    const projects = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      include: {
        rounds: {
          include: { investments: { include: { investor: true } } },
          orderBy: { date: "desc" },
          take: 1,
        },
      },
    });

    const orderedProjects = projectIds.map(
      (id) => projects.find((p) => p.id === id)!
    );

    const totalCountResult = await prisma.round.groupBy({
      by: ["projectId"],
      where: {
        investments: {
          some: { investor: { slug } },
        },
      },
      _max: { date: true },
    });
    const totalCount = totalCountResult.length;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      projects: orderedProjects,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      } as Pagination,
    };
  } catch (error) {
    return {
      projects: [],
      pagination: {
        page: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      } as Pagination,
    };
  }
});

export async function generateStaticParams() {
  try {
    const investors = await prisma.investor.findMany({
      where: { status: InvestorStatus.APPROVED },
      select: { slug: true },
      orderBy: { updatedAt: "desc" },
    });

    console.log(`Generating ${investors.length} investor pages at build time`);
    return investors.map((investor) => ({
      slug: investor.slug,
    }));
  } catch (error) {
    console.error("Error generating static params for investors:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slug = params.slug;
  let ogImage =
    "https://bucket.droomdroom.online/fundraisingbucket/1759156311327-og-image.png";

  try {
    const investor = await getInvestor(slug);

    try {
      if (!investor?.metaImage || investor.metaImage.includes("wp-content")) {
        const response = await fetch(
          getPageUrl(`/api/og-image-investor/${slug}`)
        );

        if (!response.ok) {
          const errorMessage = `Failed to fetch image: ${response.status} ${response.statusText}`;
          console.log(errorMessage);
        }

        const { data } = await response.json();
        ogImage = data;
      } else {
        ogImage = investor.metaImage;
      }
    } catch (error) {
      console.log("Error", error);
    }

    if (!investor) {
      console.warn(`investor not found for slug: ${slug}`);
      return {
        title: "Top Crypto & Web3 Fundraising Tracker | DroomDroom",
        description:
          "Track the latest crypto and Web3 fundraising rounds, including private and public sales, on DroomDroom. Explore top projects, investors, and categories like DeFi, AI, and stablecoins.",
        alternates: {
          canonical: `https://droomdroom.com/fundraising/investors/${slug}`,
        },
        openGraph: {
          title: "Top Crypto & Web3 Fundraising Tracker | DroomDroom",
          description:
            "Track the latest crypto and Web3 fundraising rounds, including private and public sales, on DroomDroom. Explore top projects, investors, and categories like DeFi, AI, and stablecoins.",
          url: `https://droomdroom.com/fundraising/investors/${slug}`,
          siteName: "DroomDroom",
          locale: "en_US",
          type: "website",
          images: [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: "Investor",
              type: "image/png",
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          site: "@droomdroom",
          creator: "@droomdroom",
          title: "Top Crypto & Web3 Fundraising Tracker | DroomDroom",
          description:
            "Track the latest crypto and Web3 fundraising rounds, including private and public sales, on DroomDroom. Explore top projects, investors, and categories like DeFi, AI, and stablecoins.",
          images: {
            url: ogImage,
            alt: "Investor",
            type: "image/png",
            width: 1200,
            height: 630,
          },
        },
      };
    }

    let seoTitle = `${investor.name} | Portfolio & Latest Investments`;

    let seoDescription = `Track the complete investment history of ${investor.name}, from first deal to the latest funding rounds. Explore detailed insights on sectors, startups, and milestones shaping their portfolio.`;

    const keywordParts =
      investor.metaKeywords ||
      [investor.name, investor.type, "crypto investor"].filter(Boolean);

    const safeImage = ogImage;

    return {
      title: seoTitle,
      description: seoDescription,
      keywords: Array.isArray(keywordParts)
        ? keywordParts.join(", ")
        : keywordParts,
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      alternates: {
        canonical: `https://droomdroom.com/fundraising/investors/${slug}`,
      },
      openGraph: {
        title: seoTitle,
        description: seoDescription,
        url: `https://droomdroom.com/fundraising/investors/${slug}`,
        siteName: "DroomDroom",
        locale: "en_US",
        type: "website",
        images: [
          {
            url: safeImage,
            width: 1200,
            height: 630,
            alt: `${investor.metaTitle || investor.name}`,
            type: "image/png",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        site: "@droomdroom",
        creator: "@droomdroom",
        title: seoTitle,
        description: seoDescription,
        images: {
          url: safeImage,
          alt: `${investor.metaTitle || investor.name}`,
          type: "image/png",
          width: 1200,
          height: 630,
        },
      },
    };
  } catch (error) {
    console.error(`Error generating metadata for investor ${slug}:`, error);
    const safeImage = ogImage;
    return {
      title: "Top Crypto & Web3 Fundraising Tracker | DroomDroom",
      description:
        "Track the latest crypto and Web3 fundraising rounds, including private and public sales, on DroomDroom. Explore top projects, investors, and categories like DeFi, AI, and stablecoins.",
      alternates: {
        canonical: `https://droomdroom.com/fundraising/investors/${slug}`,
      },
      openGraph: {
        title: "Top Crypto & Web3 Fundraising Tracker | DroomDroom",
        description:
          "Track the latest crypto and Web3 fundraising rounds, including private and public sales, on DroomDroom. Explore top projects, investors, and categories like DeFi, AI, and stablecoins.",
        url: `https://droomdroom.com/fundraising/investors/${slug}`,
        siteName: "DroomDroom",
        locale: "en_US",
        type: "website",
        images: [
          {
            url: safeImage,
            width: 1200,
            height: 630,
            alt: "Investor",
            type: "image/png",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        site: "@droomdroom",
        creator: "@droomdroom",
        title: "Top Crypto & Web3 Fundraising Tracker | DroomDroom",
        description:
          "Track the latest crypto and Web3 fundraising rounds, including private and public sales, on DroomDroom. Explore top projects, investors, and categories like DeFi, AI, and stablecoins.",
        images: {
          url: safeImage,
          alt: "Investor",
          type: "image/png",
          width: 1200,
          height: 630,
        },
      },
    };
  }
}

export default async function InvestorPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;

  const investor = await getInvestor(slug);
  const { projects, pagination } = await getInvestorProjects(slug);

  if (!investor) {
    return (
      <Container className="py-8">
        <div className="text-center py-16">
          <H2>Investor Not Found</H2>
          <P className="mt-4 mb-8">
            The investor you're looking for doesn't exist or has been removed.
          </P>
          <Button asChild>
            <Link href="/investors">Browse All Investors</Link>
          </Button>
        </div>
      </Container>
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://droomdroom.com/fundraising";

  return (
    <>
      <WebsiteSchema
        title="Top Crypto & Web3 Fundraising Tracker | DroomDroom"
        description="Track the latest crypto and Web3 fundraising rounds, including private and public sales, on DroomDroom. Explore top projects, investors, and categories like DeFi, AI, and stablecoins."
        url={baseUrl}
        imageUrl={`${baseUrl}/og-image.jpg`}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: baseUrl },
          { name: "Investors", url: `${baseUrl}/investors` },
          { name: investor.name, url: `${baseUrl}/investors/${slug}` },
        ]}
      />
      <ProjectListSchema projects={projects} />
      <InvestorSchema investor={investor} />
      <InvestorPageClient
        initialInvestor={investor}
        initialProjects={projects}
        initialPagination={pagination}
      />
    </>
  );
}
