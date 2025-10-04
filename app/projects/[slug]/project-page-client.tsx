"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import {
  Calendar,
  ExternalLink,
  Share2,
  Twitter,
  MessageSquare,
  BookOpen,
  TrendingUp,
  Users,
  Globe,
  ChevronRight,
  Copy,
  Check,
} from "lucide-react";
import { Button, Badge, Container, Shadow, FadeIn } from "@/components/ui";
import { H1, H2, H3, P, Small } from "@/components/ui/typography";
import { WebsiteSchema, BreadcrumbSchema } from "@/components/schema-markup";
import Link from "next/link";
import { Link as SocialLink } from "@/lib/types/projects";
import { formatAmount } from "@/lib/utils";
import Logo from "@/components/logo";
import ProjectPageShimmer from "./project-page-shimmer";
import { DROOMDROOM_APP_URL } from "@/lib/constant";
import Breadcrumbs from "@/components/breadcrumbs";

export default function ProjectPageClient({ project }: { project: any }) {
  const params = useParams();
  const [isMounted, setIsMounted] = useState(false);
  const [showShimmer, setShowShimmer] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("funding");
  const [expandedRounds, setExpandedRounds] = useState<Set<string>>(new Set());

  // Mark as mounted and hide shimmer after brief delay
  useEffect(() => {
    setIsMounted(true);
    const timer = setTimeout(() => setShowShimmer(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // SHIMMER DISABLED FOR DEBUGGING
  // Show shimmer only for actual users (client-side) while loading
  // Server-side always renders content for SEO (Google bots)
  // if ((isMounted && showShimmer) || !project) {
  //   return <ProjectPageShimmer />;
  // }
  if (!project) {
    return <ProjectPageShimmer />;
  }

 
  const projectLogo = project.logo ? project.logo : "/placeholder-project.jpg";

  let description = project.description;
  if (!description) {
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
      const latestDate = format(new Date(latest.date), "MMMM d, yyyy");
      const latestAmount = parseInt(latest.amount || "0").toLocaleString();
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

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalFunding =
    project.rounds?.reduce(
      (sum: number, r: any) => sum + parseInt(r.amount || "0"),
      0
    ) || 0;

  const totalInvestors =
    project.rounds?.reduce(
      (sum: number, r: any) => sum + (r.investments?.length || 0),
      0
    ) || 0;

  const toggleExpand = (roundId: string) => {
    setExpandedRounds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(roundId)) {
        newSet.delete(roundId);
      } else {
        newSet.add(roundId);
      }
      return newSet;
    });
  };

  const tabs = [
    { id: "funding", label: "Funding Rounds" },
    { id: "investors", label: "Investors" },
  ];

   const breadcrumbItems = [
      { label: "Home", href: DROOMDROOM_APP_URL },
      { label: "Recent Fundraising Events", href : `${DROOMDROOM_APP_URL}/fundraising`},
      { label: "VC Deal Flow", href: `${DROOMDROOM_APP_URL}/fundraising/projects` },
      { label: project?.name , href : `${DROOMDROOM_APP_URL}/fundraising/projects/${project?.slug}` },
    ];

  return (
    <div className="min-h-screen">
      <Container className="max-w-7xl mx-auto py-8">
       
        <Breadcrumbs items={breadcrumbItems} className="my-4"/>

        {/* Project Header */}
        <FadeIn className="mb-8">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-start gap-6 mb-6">
              <img
                src={projectLogo}
                alt={project.logoAltText || project.name}
                className="h-16 w-16 object-contain rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
              <div className="flex-1">
                <div className="flex justify-between">
                  <div className="flex items-center gap-3 mb-2">
                    <H1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {project.name}
                    </H1>
                    {project.symbol && (
                      <Badge
                        variant="secondary"
                        className="text-xs font-medium"
                      >
                        {project.symbol}
                      </Badge>
                    )}
                  </div>

                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      className="flex items-center gap-2"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Share2 className="h-4 w-4" />
                      )}
                      {copied ? "Copied!" : "Share"}
                    </Button>
                  </div>
                </div>

                {project.category && project.category.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.category.map((cat: string, index: number) => (
                      <span
                        key={`${cat}-${index}`}
                        className="px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}

                <P className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {description}
                </P>
              </div>
            </div>

            {/* Key Metrics Row */}
            {project.rounds?.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-card border  rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatAmount(totalFunding)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Total Funding
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {project.rounds.length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Funding Rounds
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalInvestors}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Total Investors
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {project.rounds?.length > 0
                      ? format(
                          new Date(
                            project.rounds.sort(
                              (a: any, b: any) =>
                                new Date(b.date).getTime() -
                                new Date(a.date).getTime()
                            )[0].date
                          ),
                          "MMM yyyy"
                        )
                      : "—"}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Latest Round
                  </div>
                </div>
              </div>
            )}

            {/* Links Section */}
            <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              {project.links?.map((link: SocialLink, index: number) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex items-center gap-2"
                >
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.type === "twitter" && <Twitter className="h-4 w-4" />}
                    {link.type === "telegram" && (
                      <MessageSquare className="h-4 w-4" />
                    )}
                    {link.type === "blog" && <BookOpen className="h-4 w-4" />}
                    {link.type === "website" && <Globe className="h-4 w-4" />}
                    {link.type}
                  </a>
                </Button>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "funding" && project.rounds?.length > 0 && (
          <FadeIn>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <H2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Funding Rounds
                </H2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                      <th
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[5%]"
                        scope="col"
                      >
                        #
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[20%]">
                        Round Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[20%]">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[20%]">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[30%]">
                        Investors
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {project.rounds
                      .sort(
                        (a: any, b: any) =>
                          new Date(b.date).getTime() -
                          new Date(a.date).getTime()
                      )
                      .map((round: any, index: number) => {
                        const roundId = round.id || `round-${index}`;
                        const isExpanded = expandedRounds.has(roundId);
                        const investorData = round.investments
                          ?.filter((investment: any) => investment?.investor)
                          ?.map((investment: any) => ({
                            name: investment.investor.name,
                            logo:
                              investment.investor.logo || "/default-logo.png",
                            slug: investment.investor.slug,
                          }))
                          ?.filter(
                            (inv: any): inv is { name: string; logo: string; slug: string } =>
                              !!inv.name && !!inv.slug
                          ) || [];

                        return [
                          <tr
                            key={roundId}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300 cursor-pointer group"
                          >
                            <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="">
                                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700 transition-all duration-200 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50">
                                    {round.type}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {formatAmount(round.amount || "0")}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {format(new Date(round.date), "MMM, yyyy")}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {investorData
                                  .slice(0, 2)
                                  .map((investor: any, investmentIndex: number) => (
                                    <Link
                                      key={`investment-${investor.slug}-${investmentIndex}`}
                                      href={`/investors/${investor.slug}`}
                                      className="text-xs text-gray-400 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                                    >
                                      {investor.name}
                                    </Link>
                                  ))}
                                {investorData.length > 2 && (
                                  <span
                                    className="text-xs text-gray-400 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleExpand(roundId);
                                    }}
                                    aria-expanded={isExpanded}
                                    aria-controls={`expanded-row-${roundId}`}
                                  >
                                    +{investorData.length - 2}
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>,
                          isExpanded ? (
                            <tr
                              key={`${roundId}-expand`}
                              className="bg-card"
                              id={`expanded-row-${roundId}`}
                            >
                              <td colSpan={5} className="px-6 py-4">
                                                                        <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                          All Investors
                                        </h4>
                                <div className="flex flex-wrap gap-4">
                                  {investorData.length > 0 ? (
                                    investorData.map((investor: any, invIndex: number) => (
                                      <div
                                        key={`${investor.name}-${invIndex}`}
                                        className="flex items-center space-x-2"
                                      >
                                        <Link href={`/investors/${investor.slug}`}>
                                          <img
                                            src={investor.logo}
                                            alt={`${investor.name} Logo`}
                                            className="w-auto h-12 object-contain rounded-md bg-slate-50 dark:bg-slate-300 px-3 py-2 transition-transform duration-200 group-hover:scale-105"
                                            loading="lazy"
                                            onError={(e) => {
                                              const target = e.target as HTMLImageElement;
                                              target.src = "/default-logo.png";
                                            }}
                                          />
                                        </Link>
                                      </div>
                                    ))
                                  ) : (
                                    <span className="text-gray-400 text-xs">
                                      No investors available
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ) : null,
                        ];
                      })
                      .flat()}
                  </tbody>
                </table>
              </div>
            </div>
          </FadeIn>
        )}

        {activeTab === "investors" && project.rounds?.length > 0 && (
          <FadeIn>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-8">
              <H2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Investors
              </H2>

              <div className="flex flex-wrap gap-5">
                {project.rounds
                  .flatMap((round: any) => round.investments || [])
                  .filter(
                    (investment: any, index: number, self: any[]) =>
                      self.findIndex(
                        (i) => i.investor.slug === investment.investor.slug
                      ) === index
                  )
                  .map((investment: any, index: number) => {
                    const investor = investment.investor;
                    return (
                      <Link
                        key={index}
                        href={`/investors/${investor.slug}`}
                        className="group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label={`View details for ${
                          investor.name || "unknown investor"
                        }`}
                      >
                        <div className="flex items-center space-x-4 p-1 border transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-800 rounded-lg">
                          {investor.logo ? (
                            <img
                              src={investor.logo}
                              alt={
                                investor.logoAltText ||
                                investor.name ||
                                "Investor Logo"
                              }
                              className="w-auto h-16 object-contain rounded-md bg-slate-50 dark:bg-slate-300 px-3 py-2 transition-transform duration-200 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-blue-500 to-purple-600 ring-2 ring-gray-100 dark:ring-gray-600"
                              role="img"
                              aria-label={`Initials for ${
                                investor.name || "unknown investor"
                              }`}
                            >
                              {investor.name
                                ? investor.name
                                    .split(" ")
                                    .map((word: string) => word.charAt(0))
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()
                                : "??"}
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </div>
          </FadeIn>
        )}
      </Container>
    </div>
  );
}