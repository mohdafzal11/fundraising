import { Metadata } from "next";
import { cleanSEOIMAGEURL, sanitizeHtmlForSEO } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { getPageUrl } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slug = params.slug;
  let ogImage =
    "https://bucket.droomdroom.online/fundraisingbucket/1759156311327-og-image.png";

  try {
    const project = await prisma.project.findFirst({
      where: { slug },
      include: {
        rounds: { include: { investments: { include: { investor: true } } } },
      },
    });

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

export default function ProjectDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
