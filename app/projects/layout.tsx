import { Metadata } from "next";

const ogImage =
  "https://bucket.droomdroom.online/fundraisingbucket/1759294765075-fundraising-og-image.jpg";

export const metadata: Metadata = {
  metadataBase: new URL("https://droomdroom.com"),
  title: {
    template: "%s | DroomDroom Fundraising",
    default:
      "Latest Crypto Deal Flow | Web3 Investments Tracker | Blockchain Funding Rounds",
  },
  description:
    "Stay updated with real-time crypto deal flow. Track the latest investment trends, including funding rounds, investors, and projects shaping the web3 ecosystem.",
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
    canonical: "https://droomdroom.com/fundraising/projects",
  },
  openGraph: {
    title: "Latest Crypto Deal Flow | Web3 Investments Tracker | Blockchain Funding Rounds",
    description:
      "Stay updated with real-time crypto deal flow. Track the latest investment trends, including funding rounds, investors, and projects shaping the web3 ecosystem.",
    url: "https://droomdroom.com/fundraising/projects",
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
    title: "Latest Crypto Deal Flow | Web3 Investments Tracker | Blockchain Funding Rounds",
    description:
      "Stay updated with real-time crypto deal flow. Track the latest investment trends, including funding rounds, investors, and projects shaping the web3 ecosystem.",
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

export default function ProjectsDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
