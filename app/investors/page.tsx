import {
  WebsiteSchema,
  InvestorsListSchema,
  BreadcrumbSchema,
} from "@/components/schema-markup";
import InvestorsPageClient from "./investors-page-client";
import { Pagination } from "@/lib/types/projects";
import { prisma } from "@/lib/prisma";
import { InvestorStatus } from "@prisma/client";

// Enable static generation with revalidation
export const revalidate = 3600; // Revalidate every hour
export const dynamic = 'force-static';


async function getInvestors() {
  try {
    const page = 1;
    const pageSize = 10;

    const [totalCount, investors] = await Promise.all([
      prisma.investor.count({
        where: {},
      }),
      prisma.investor.findMany({
        where: { status: InvestorStatus.APPROVED },
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          links: true,
          _count: { select: { investments: true } },
        },
        orderBy: { investments: { _count: "desc" } },
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    return {
      investors,
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
    return { investors: [], pagination: { page: 1, pageSize: 10, totalCount: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false } as Pagination };
  }
}

export default async function InvestorsPage() {
  
  const { investors = [], pagination = {} } = await getInvestors();
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
      <BreadcrumbSchema items={[{ name: "Home", url: baseUrl } , { name: "Investors", url: `${baseUrl}/investors` }]}  />
      <InvestorsListSchema investors={investors} />

      <div className="min-h-screen bg-background">
        <InvestorsPageClient
          initialInvestors={investors}
          initialPagination={pagination}
        />
      </div>
    </>
  );
}
