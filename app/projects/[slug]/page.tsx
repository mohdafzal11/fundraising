import { Metadata } from "next";
import Link from "next/link";
import { Button, Container } from "@/components/ui";
import { H2, P } from "@/components/ui/typography";
import { prisma } from "@/lib/prisma";
import { ProjectStatus } from "@prisma/client";
import ProjectPageClient from "./project-page-client";
import {
  cleanHtmlStyles,
  cleanSEOIMAGEURL,
  getPageUrl,
  sanitizeHtmlForSEO,
} from "@/lib/utils";
import { format } from "date-fns";
import {
  WebsiteSchema,
  ProjectSchema,
  BreadcrumbSchema,
} from "@/components/schema-markup";
import { cache } from "react";

// Force static generation with ISR (Incremental Static Regeneration)
// This will pre-generate all pages at build time and revalidate them every hour
export const dynamic = "force-static";
export const revalidate = 3600; // Revalidate every 1 hour (3600 seconds)
export const dynamicParams = true; // Allow dynamic params for new projects

// Cached function to get project by slug
const getProject = cache(async (slug: string) => {
  return await prisma.project.findFirst({
    where: { slug },
    include: {
      rounds: { include: { investments: { include: { investor: true } } } },
    },
  });
});

export async function generateStaticParams() {
  try {
    const projects = await prisma.project.findMany({
      where: { status: ProjectStatus.APPROVED },
      select: { slug: true },
      orderBy: { updatedAt: "desc" },
      // Generate all projects at build time for optimal performance
    });

    console.log(`Generating ${projects.length} project pages at build time`);
    return projects
      .map((project) => project.slug)
      .filter((slug) => typeof slug === "string" && slug.trim().length > 0)
      .map((slug) => ({ slug }));
  } catch (error) {
    console.error("Error generating static params for projects:", error);
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
    const project = await getProject(slug);

    try {
      if (!project?.metaImage || project.metaImage.includes("wp-content")) {
        const response = await fetch(
          getPageUrl(`/api/og-image-project/${slug}`)
        );

        if (!response.ok) {
          const errorMessage = `Failed to fetch image: ${response.status} ${response.statusText}`;
          console.log(errorMessage);
        }

        const { data } = await response.json();
        ogImage = data;
      } else {
        ogImage = project.metaImage;
      }
    } catch (error) {
      console.log("Error", error);
    }

    if (!project) {
      console.warn(`project not found for slug: ${slug}`);
      return {
        title: "Top Crypto & Web3 Fundraising Tracker | DroomDroom",
        description:
          "Track the latest crypto and Web3 fundraising rounds, including private and public sales, on DroomDroom. Explore top projects, investors, and categories like DeFi, AI, and stablecoins.",
        alternates: {
          canonical: `https://droomdroom.com/fundraising/projects/${slug}`,
        },
        openGraph: {
          title: "Top Crypto & Web3 Fundraising Tracker | DroomDroom",
          description:
            "Track the latest crypto and Web3 fundraising rounds, including private and public sales, on DroomDroom. Explore top projects, investors, and categories like DeFi, AI, and stablecoins.",
          url: `https://droomdroom.com/fundraising/projects/${slug}`,
          siteName: "DroomDroom",
          locale: "en_US",
          type: "website",
          images: [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: "Project",
              type: "image/png",
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          site: "@droomdroom",
          creator: "@droomdroom",
          title: `Top Crypto & Web3 Fundraising Tracker | DroomDroom`,
          description:
            "Track the latest crypto and Web3 fundraising rounds, including private and public sales, on DroomDroom. Explore top projects, investors, and categories like DeFi, AI, and stablecoins.",
          images: {
            url: ogImage,
            alt: "Project",
            type: "image/png",
            width: 1200,
            height: 630,
          },
        },
      };
    }

    let seoTitle = `${project.name} | Fundraise History & Latest Funding Updates`;

    const seoDescription = `Explore the complete fundraising journey of ${project.name}, from inception to the latest funding rounds. Get detailed insights on investors, funding amounts, and milestones shaping the project's growth.`;
    const keywordParts =
      project.metaKeywords || [project.title].filter(Boolean);

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
        canonical: `https://droomdroom.com/fundraising/projects/${slug}`,
      },
      openGraph: {
        title: seoTitle,
        description: seoDescription,
        url: `https://droomdroom.com/fundraising/projects/${slug}`,
        siteName: "DroomDroom",
        locale: "en_US",
        type: "website",
        images: [
          {
            url: safeImage,
            width: 1200,
            height: 630,
            alt: `${project.metaTitle || project.title}`,
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
          alt: `${project.metaTitle || project.title}`,
          type: "image/png",
          width: 1200,
          height: 630,
        },
      },
    };
  } catch (error) {
    console.error(`Error generating metadata for ${slug}:`, error);
    const safeImage = ogImage;
    return {
      title: "Top Crypto & Web3 Fundraising Tracker | DroomDroom",
      description:
        "Track the latest crypto and Web3 fundraising rounds, including private and public sales, on DroomDroom. Explore top projects, investors, and categories like DeFi, AI, and stablecoins.",
      alternates: {
        canonical: `https://droomdroom.com/fundraising/projects/${slug}`,
      },
      openGraph: {
        title: "Top Crypto & Web3 Fundraising Tracker | DroomDroom",
        description:
          "Track the latest crypto and Web3 fundraising rounds, including private and public sales, on DroomDroom. Explore top projects, investors, and categories like DeFi, AI, and stablecoins.",
        url: `https://droomdroom.com/fundraising/projects/${slug}`,
        siteName: "DroomDroom",
        locale: "en_US",
        type: "website",
        images: [
          {
            url: safeImage,
            width: 1200,
            height: 630,
            alt: "Project",
            type: "image/png",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        site: "@droomdroom",
        creator: "@droomdroom",
        title: `Top Crypto & Web3 Fundraising Tracker | DroomDroom`,
        description:
          "Track the latest crypto and Web3 fundraising rounds, including private and public sales, on DroomDroom. Explore top projects, investors, and categories like DeFi, AI, and stablecoins.",
        images: {
          url: safeImage,
          alt: "Project",
          type: "image/png",
          width: 1200,
          height: 630,
        },
      },
    };
  }
}

export default async function ProjectPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;

  const project = await getProject(slug);

  if (!project) {
    return (
      <Container className="py-8">
        <div className="text-center py-16">
          <H2>Project Not Found</H2>
          <P className="mt-4 mb-8">
            The project you're looking for doesn't exist or has been removed.
          </P>
          <Button asChild>
            <Link href="/projects">Browse All Projects</Link>
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
          { name: "Projects", url: `${baseUrl}/projects` },
          { name: project.name, url: `${baseUrl}/projects/${slug}` },
        ]}
      />
      <ProjectSchema project={project} />
      <ProjectPageClient project={project} />;
    </>
  );
}
