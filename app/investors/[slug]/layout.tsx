import { Metadata } from "next";
import { getPageUrl } from "@/lib/utils";
import {
  cleanSEOIMAGEURL,
  sanitizeHtmlForSEO,
  getImageContentType,
} from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { InvestorStatus } from "@prisma/client";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slug = params.slug;
  let ogImage =
    "https://bucket.droomdroom.online/fundraisingbucket/1759156311327-og-image.png";

  try {
    const investor = await prisma.investor.findFirst({
      where: {
        slug,
        status: InvestorStatus.APPROVED,
      },
      include: {
        investments: true,
      },
    });

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

export default function InvestorDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
