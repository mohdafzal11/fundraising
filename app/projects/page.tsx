import {
  WebsiteSchema,
  ProjectListSchema,
  BreadcrumbSchema,
} from "@/components/schema-markup";
import ProjectsPageClient from "./projects-page-client";
import { Pagination } from "@/lib/types/projects";
import { prisma } from "@/lib/prisma";

// Enable static generation with revalidation
export const revalidate = 3600; // Revalidate every hour
export const dynamic = 'force-static';


async function getProjects() {
  try {
    const page = 1;
    const pageSize = 10;

    const latestRounds = await prisma.round.findMany({
      orderBy: [
        { date: 'desc' },
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        investments: { include: { investor: true } },
        project: true,
      },
    });

    const items = latestRounds.map((r) => {
      const project = r.project as any;
      return {
        ...project,
        rounds: [
          {
            id: r.id,
            title: r.title,
            description: r.description,
            date: r.date,
            amount: r.amount,
            type: r.type,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            investments: r.investments,
          },
        ],
      };
    });

    const totalCount = await prisma.round.count();
    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    return {
      projects: items,
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
    return { projects: [], pagination: { page: 1, pageSize: 10, totalCount: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false } as Pagination };
  }
}

export default async function ProjectsPage() {
  
  const { projects = [], pagination = {} } = await getProjects();
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
      <BreadcrumbSchema items={[{ name: "Home", url: baseUrl } , { name: "Projects", url: `${baseUrl}/projects` }]} />
      <ProjectListSchema projects={projects} />

      <div className="min-h-screen bg-background">
        <ProjectsPageClient
          initialProjects={projects}
          initialPagination={pagination}
        />
      </div>
    </>
  );
}
