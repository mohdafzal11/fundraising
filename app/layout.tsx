// @ts-ignore
import "../app/globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Toaster } from "@/components/toaster";
import { OrganizationSchema } from "@/components/schema-markup";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const ogImage = "https://bucket.droomdroom.online/fundraisingbucket/1759294765075-fundraising-og-image.jpg"

export const metadata: Metadata = {
  metadataBase: new URL("https://droomdroom.com"),
  title: {
    template: "%s | DroomDroom Fundraising",
    default: "Top Crypto & Web3 Fundraising Tracker | DroomDroom",
  },
  description:
    "Track the latest crypto and Web3 fundraising rounds, including private and public sales, on DroomDroom. Explore top projects, investors, and categories like DeFi, AI, and stablecoins.",
  keywords:
    "crypto fundraising, Web3 fundraising, latest fundraising 2025, blockchain fundraising, DeFi fundraising, AI fundraising, stablecoin fundraising, fundraising tracker",

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
    canonical: "https://droomdroom.com/fundraising",
  },
  openGraph: {
    title: "Top Crypto & Web3 Fundraising Tracker | DroomDroom",
    description:
      "Track the latest crypto and Web3 fundraising rounds, including private and public sales, on DroomDroom. Explore top projects, investors, and categories like DeFi, AI, and stablecoins.",
    url: "https://droomdroom.com/fundraising",
    siteName: "DroomDroom Fundraising",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Crypto & Web3 Fundraising Tracker",
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
      alt: "Crypto & Web3 Fundraising Tracker",
      type: "image/png",
      width: 1200,
      height: 630,
    },
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": "DroomDroom Fundraising",
    "format-detection": "telephone=no",
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

interface MenuItem {
  text: string;
  url: string;
  type: "link";
}

interface Menu {
  text: string;
  url?: string;
  type: "link" | "dropdown";
  items?: MenuItem[];
}

interface Token {
  id: string;
  name: string;
  ticker: string;
  price: number;
  priceChange24h: number;
  imageUrl: string;
}

interface FooterSocial {
  text: string;
  url: string;
  iconUrl: string;
  color: string;
}

interface FooterLink {
  text: string;
  url: string;
}

interface FooterData {
  socials: FooterSocial[];
  company: FooterLink[];
  "quick-links": FooterLink[];
}

interface RootLayoutProps {
  children: React.ReactNode;
}

async function fetchMenus(): Promise<Menu[]> {
  try {
    const response = await fetch(
      "https://api.droomdroom.online/api/v1/header-menu",
      {
        next: { revalidate: 3600 },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch menu items");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return [];
  }
}

const fetchTokens = async (): Promise<Token[]> => {
  try {
    const response = await fetch(
      `https://droomdroom.com/price/api/marquee-tokens`,
      {
        next: { revalidate: 120 },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch marquee tokens: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching marquee tokens:", error);
    return [];
  }
};

const fetchFooterData = async (): Promise<FooterData> => {
  try {
    const response = await fetch("https://droomdroom.com/api/v1/footer-menu", {
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch footer data");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching footer data:", error);
    return {
      socials: [],
      company: [],
      "quick-links": [],
    };
  }
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const [menus, tokens, footerData] = await Promise.all([
    fetchMenus(),
    fetchTokens(),
    fetchFooterData(),
  ]);

  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <script>
        var clickRankAi = document.createElement("script"); clickRankAi.src =
        "https://js.clickrank.ai/seo/a2f08e6a-dc8a-4b26-849f-098224a52825/script?"
        + new Date().getTime(); clickRankAi.async = true;
        document.head.appendChild(clickRankAi);
      </script>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <OrganizationSchema
            name="DroomDroom"
            url={"https://droomdroom.com/fundraising"}
            logo={`https://droomdroom.com/price/DroomDroom_light.svg`}
            description="Track the latest crypto and Web3 fundraising rounds, including private and public sales, on DroomDroom. Explore top projects, investors, and categories like DeFi, AI, and stablecoins."
          />
          <div className="relative flex min-h-screen flex-col antialiased bg-background text-foreground">
            <Header menus={menus} tokens={tokens} />
            <main className="flex-1 w-full">{children}</main>
            <Footer footerData={footerData} />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
