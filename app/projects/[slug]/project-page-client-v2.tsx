"use client";

import { useState } from "react";
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

export default function ProjectPageClient({ project }: { project: any }) {
  const params = useParams();
  const [copied, setCopied] = useState(false);

  const breadcrumbItems = [
    { name: "Home", url: `https://droomdroom.com/fundraising` },
    { name: "Projects", url: `https://droomdroom.com/fundraising` },
    {
      name: project.name,
      url: `https://droomdroom.com/fundraising/projects/${project.slug}`,
    },
  ];

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

  const totalFunding = project.rounds?.reduce(
    (sum: number, r: any) => sum + parseInt(r.amount || "0"),
    0
  ) || 0;

  const totalInvestors = project.rounds?.reduce(
    (sum: number, r: any) => sum + (r.investments?.length || 0),
    0
  ) || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <BreadcrumbSchema items={breadcrumbItems} />
      
      <Container>
        {/* Hero Section - Asymmetrical Layout */}
        <div className="py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Header */}
              <FadeIn>
                <Shadow className="rounded-lg p-8 shadow-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden">
                  <div className="relative">
                    <div className="flex items-start space-x-6">
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <img
                            src={projectLogo}
                            alt={project.logoAltText || project.name}
                            className="h-20 w-20 lg:h-24 lg:w-24 object-cover rounded-2xl border-4 border-white dark:border-gray-700 shadow-lg"
                          />
                          <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-white dark:border-gray-800"></div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-3">
                          <H1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                            {project.name}
                          </H1>
                          {project.symbol && (
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium rounded-full">
                              ({project.symbol})
                            </span>
                          )}
                        </div>
                        
                        {project.category && project.category.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.category.map((cat: string, index: number) => (
                              <Badge
                                key={`${cat}-${index}`}
                                variant="secondary"
                                className="text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors cursor-pointer"
                              >
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <P className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                          {description}
                        </P>
                      </div>
                    </div>
                  </div>
                </Shadow>
              </FadeIn>
            </div>

            {/* Right Column - Stats Cards */}
            <div className="space-y-6">
              {/* Funding Stats */}
              {project.rounds?.length > 0 && (
                <FadeIn>
                  <Shadow className="rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    <H3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                      Funding Overview
                    </H3>
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          ${totalFunding >= 1000000 ? (totalFunding / 1000000).toFixed(1) + 'M' : (totalFunding / 1000).toFixed(0) + 'K'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Total Raised</div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                          <div className="text-xl font-bold text-gray-900 dark:text-white">
                            {project.rounds?.length || 0}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">Rounds</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                          <div className="text-xl font-bold text-gray-900 dark:text-white">
                            {totalInvestors}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">Investors</div>
                        </div>
                      </div>
                    </div>
                  </Shadow>
                </FadeIn>
              )}

              {/* Quick Actions */}
              <FadeIn>
                <Shadow className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                  <H3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Quick Actions
                  </H3>
                         {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      {project.links?.website && (
                        <Button
                          variant="default"
                          size="sm"
                          asChild
                          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                        >
                          <a
                            href={project.links.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Globe className="h-4 w-4" />
                            <span>Visit Website</span>
                          </a>
                        </Button>
                      )}
                      
                      {project.links?.map((link: SocialLink, index: number) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          asChild
                          className="flex items-center space-x-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:shadow-md"
                        >
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {(link.type === "twitter" || link.url.toLowerCase().includes("x")) && <Twitter className="h-4 w-4" />}
                            {link.type === "telegram" || link.url.toLowerCase().includes("telegram") && <MessageSquare className="h-4 w-4" />}
                            {link.type === "blog" || link.url.toLowerCase().includes("blog") && <BookOpen className="h-4 w-4" />}
                            {link.type === "website" || link.url.toLowerCase().includes("website") && <ExternalLink className="h-4 w-4" />}
                            <span className="capitalize">{link.type}</span>
                          </a>
                        </Button>
                      ))}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShare}
                        className="flex items-center space-x-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:shadow-md"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>{copied ? "Copied!" : "Share"}</span>
                      </Button>
                    </div>
                </Shadow>
              </FadeIn>
            </div>
          </div>
        </div>

        {/* Funding Rounds Section */}
        {project.rounds?.length > 0 && (
          <FadeIn className="pb-12">
            <div className="flex items-center justify-between mb-8">
              <H2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <TrendingUp className="h-8 w-8 mr-3 text-blue-600" />
                Funding Timeline
              </H2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {project.rounds.length} round{project.rounds.length !== 1 ? 's' : ''}
              </div>
            </div>
            
            <div className="space-y-6">
              {project.rounds
                .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((round: any, index: number) => {
                  const raisedDate = new Date(round.date);
                  const formattedDate = format(raisedDate, "MMMM d, yyyy");
                  const amount = parseInt(round.amount || "0").toLocaleString();
                  
                  return (
                    <Shadow
                      key={`round-${index}`}
                      className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden group hover:shadow-xl transition-all duration-300"
                    >
                      {/* Timeline Indicator */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-600"></div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Round Info */}
                        <div className="lg:col-span-1">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl">
                              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <H3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {round.type} Round
                              </H3>
                              <Small className="text-gray-500 dark:text-gray-400">
                                {formattedDate}
                              </Small>
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-4 text-center">
                            <div className="text-3xl font-bold text-gray-900 dark:text-white">
                              ${parseInt(round.amount || "0") >= 1000000 
                                ? (parseInt(round.amount || "0") / 1000000).toFixed(1) + 'M'
                                : (parseInt(round.amount || "0") / 1000).toFixed(0) + 'K'}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Amount Raised</div>
                          </div>
                        </div>
                        
                        {/* Investors */}
                        <div className="lg:col-span-2">
                          {round.investments?.length > 0 && (
                            <div>
                              <div className="flex items-center space-x-2 mb-4">
                                <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                <H3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  Investors ({round.investments.length})
                                </H3>
                              </div>
                              
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {round.investments.map((investment: any, investmentIndex: number) => {
                                  const investor = investment.investor;
                                  return (
                                    <div
                                      key={`investment-${investment.id || investmentIndex}`}
                                      className="group cursor-pointer"
                                    >
                                      <Link href={`/investors/${investor.slug}`}>
                                        <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 text-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 hover:shadow-lg hover:scale-105">
                                          {investor.logo && (
                                            <img
                                              src={investor.logo}
                                              alt={investor.logoAltText || investor.name}
                                              className="h-12 w-12 mx-auto mb-2 object-cover rounded-lg"
                                            />
                                          )}
                                          <P className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                                            {investor.name}
                                          </P>
                                        </div>
                                      </Link>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Shadow>
                  );
                })}
            </div>
          </FadeIn>
        )}
      </Container>
    </div>
  );
}