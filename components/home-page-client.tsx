"use client";

import { useEffect, useState } from "react";
import { Container, FadeIn } from "@/components/ui";
import { Project, Investor } from "@/lib/types/projects";
import { Calendar } from "lucide-react";
import { cn, getPageUrl } from "@/lib/utils";
import { badgeVariants } from "@/lib/constant";
import Link from "next/link";
import { formatAmount } from "@/lib/utils";
import Breadcrumbs from "./breadcrumbs";
import { DROOMDROOM_APP_URL } from "@/lib/constant";
import HomePageShimmer from "./home-page-shimmer";

interface HomePageClientProps {
  initialProjects: any[];
  initialInvestors: any[];
}

export default function HomePageClient({
  initialProjects = [],
  initialInvestors = [],
}: HomePageClientProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [showShimmer, setShowShimmer] = useState(true);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [investors, setInvestors] = useState<Investor[]>(initialInvestors);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set()
  );

  // Mark component as mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch fresh data after mount - shimmer shown until data loads
  useEffect(() => {
    if (!isMounted) return;

    const fetchFreshData = async () => {
      try {
        // Fetch fresh projects
        const projectsResponse = await fetch('/api/projects?pageSize=5');
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          if (projectsData.data) {
            setProjects(projectsData.data);
          }
        }

        // Fetch fresh investors
        const investorsResponse = await fetch('/api/investors?pageSize=8');
        if (investorsResponse.ok) {
          const investorsData = await investorsResponse.json();
          if (investorsData.data) {
            setInvestors(investorsData.data);
          }
        }
      } catch (error) {
        console.error('Error fetching fresh data:', error);
      } finally {
        // Hide shimmer once data is loaded
        setShowShimmer(false);
      }
    };

    // Small delay to show shimmer to users, then fetch data
    const timer = setTimeout(fetchFreshData, 500);
    return () => clearTimeout(timer);
  }, [isMounted]);

  const getRandomBadgeVariant = () => {
    const randomIndex = Math.floor(Math.random() * badgeVariants.length);
    return badgeVariants[randomIndex];
  };

  const toggleExpand = (slug: string) => {
    setExpandedProjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(slug)) {
        newSet.delete(slug);
      } else {
        newSet.add(slug);
      }
      return newSet;
    });
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const truncateName = (name: string, maxLength: number = 20) => {
    if (!name) return "Unknown";
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength) + "...";
  };


  const breadcrumbItems = [
    { label: "Home", href: DROOMDROOM_APP_URL },
    { label: "Recent Fundraising Events", href: `${DROOMDROOM_APP_URL}/fundraising`},
  ];

  // SHIMMER DISABLED FOR DEBUGGING
  // Show shimmer only for actual users (client-side) while loading
  // Server-side always renders content for SEO (Google bots)
  // if (isMounted && showShimmer) {
  //   return <HomePageShimmer />;
  // }

  return (
    <div className="min-h-screen relative">
      <Container className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Breadcrumbs items={breadcrumbItems} className="mb-2" />
       
        <FadeIn>
          <div className="mb-10">
            <h1 className="tracking-wider text-4xl font-extrabold text-gray-900 dark:text-white">
              Recent Fundraising Events
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400 tracking-wider">
              Track the latest funding rounds and investment activities in the
              crypto space
            </p>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="bg-card rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50">
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[5%]"
                      scope="col"
                    >
                      #
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[20%]"
                      scope="col"
                    >
                      Project
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[10%]"
                      scope="col"
                    >
                      Round
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[10%]"
                      scope="col"
                    >
                      Date
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[10%]"
                      scope="col"
                    >
                      Raised
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[20%]"
                      scope="col"
                    >
                      Category
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[25%]"
                      scope="col"
                    >
                      Investors
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="animate-pulse">
                        <td className="px-6 py-5">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex space-x-2">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                        </td>
                      </tr>
                    ))
                  ) : projects.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-16 text-center text-gray-500 dark:text-gray-400"
                      >
                        <FadeIn>
                          <div className="flex flex-col items-center space-y-4">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              <Calendar className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                              No projects found
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Check back later for new fundraising events
                            </p>
                          </div>
                        </FadeIn>
                      </td>
                    </tr>
                  ) : (
                    <>
                      {projects
                        .map((project, index) => {
                          const projectLogo = project.logo
                            ? project.logo
                            : null;
                          const rounds = Array.isArray(project.rounds)
                            ? project.rounds
                            : [];
                          const lastRound =
                            rounds.length > 0
                              ? rounds[rounds.length - 1]
                              : undefined;
                          const projectRound = lastRound?.type || "-";
                          const projectDate = lastRound?.date
                            ? new Date(lastRound.date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "-";
                          const raisedAmount =
                            project.rounds?.reduce(
                              (total, round) =>
                                total + Number(round?.amount ?? 0),
                              0
                            ) || 0;
                          const investorData = project.rounds
                            ?.flatMap((round) => round.investments)
                            ?.filter((investment) => investment?.investor)
                            ?.map((investment) => ({
                              name: investment?.investor?.name,
                              logo:
                                investment?.investor?.logo ||
                                "/default-logo.png",
                              slug: investment?.investor?.slug,
                            }))
                            ?.filter(
                              (inv): inv is { name: string; logo: string; slug: string } =>
                                !!inv.name && !!inv.slug
                            ) || [];

                          const isExpanded = expandedProjects.has(
                            project.slug.toString()
                          );

                          return [
                            <tr
                              key={project.id}
                              className="hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300 cursor-pointer group"
                            >
                              <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                                <FadeIn delay={index * 50}>{index + 1}</FadeIn>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <FadeIn delay={index * 50}>
                                  <Link href={`/projects/${project.slug}`}>
                                    <div className="flex items-center space-x-4">
                                      {projectLogo ? (
                                        <img
                                          src={projectLogo}
                                          alt={project.title || "Project Logo"}
                                          className="w-12 h-12 rounded-full object-cover ring-1 ring-gray-100 dark:ring-gray-600"
                                          onError={(e) => {
                                            const target =
                                              e.target as HTMLImageElement;
                                            target.style.display = "none";
                                            const fallback =
                                              target.nextElementSibling as HTMLElement;
                                            if (fallback)
                                              fallback.style.display = "flex";
                                          }}
                                        />
                                      ) : null}
                                      <div
                                        className={`w-12 h-12 rounded-full flex items-center tracking-wider justify-center text-white font-bold text-sm bg-gradient-to-br from-blue-500 to-purple-600 ring-2 ring-gray-100 dark:ring-gray-600 ${
                                          projectLogo ? "hidden" : "flex"
                                        }`}
                                      >
                                        {getInitials(project.name)}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                                          <div>
                                            {truncateName(
                                              project.name || "Unknown",
                                              25
                                            )}
                                          </div>
                                        </p>
                                        {project.title &&
                                          project.title !== project.name && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                              {truncateName(project.title, 30)}
                                            </p>
                                          )}
                                      </div>
                                    </div>
                                  </Link>
                                </FadeIn>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <FadeIn delay={index * 50}>
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700 transition-all duration-200 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50">
                                    {projectRound}
                                  </span>
                                </FadeIn>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                <FadeIn delay={index * 50}>
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                                    <span>{projectDate}</span>
                                  </div>
                                </FadeIn>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                                <FadeIn delay={index * 50}>
                                  {raisedAmount > 0
                                    ? formatAmount(raisedAmount)
                                    : "-"}
                                </FadeIn>
                              </td>
                              <td className="px-6 py-5">
                                <FadeIn delay={index * 50}>
                                  <div className="flex flex-wrap gap-2">
                                    {project.category &&
                                    project.category.length > 0 ? (
                                      project.category
                                        .slice(0, 2)
                                        .map((category, catIndex) => (
                                          <span
                                            key={`${category}-${catIndex}`}
                                            className={cn(
                                              getRandomBadgeVariant(),
                                              "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 group-hover:bg-opacity-80"
                                            )}
                                          >
                                            {category}
                                          </span>
                                        ))
                                    ) : (
                                      <span className="text-gray-400 text-xs">
                                        -
                                      </span>
                                    )}
                                    {project.category &&
                                      project.category.length > 2 && (
                                        <span
                                          className="text-xs text-gray-400 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleExpand(project.slug);
                                          }}
                                        >
                                          +{project.category.length - 2}
                                        </span>
                                      )}
                                  </div>
                                </FadeIn>
                              </td>
                              <td className="px-6 py-5">
                                <FadeIn delay={index * 50}>
                                  <div className="flex flex-wrap gap-2">
                                    {investorData.length > 0 ? (
                                      investorData
                                        .slice(0, 2)
                                        .map((investor, invIndex) => (
                                          <span
                                            key={`${investor.name}-${invIndex}`}
                                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-700/50"
                                          >
                                            {truncateName(investor.name, 15)}
                                          </span>
                                        ))
                                    ) : (
                                      <span className="text-gray-400 text-xs">
                                        -
                                      </span>
                                    )}
                                    {investorData.length > 2 && (
                                      <span
                                        className="text-xs text-gray-400 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleExpand(project.slug);
                                        }}
                                      >
                                        +{investorData.length - 2}
                                      </span>
                                    )}
                                  </div>
                                </FadeIn>
                              </td>
                            </tr>,
                            isExpanded ? (
                              <tr
                                key={`${project.id}-expand`}
                                className="bg-card"
                              >
                                <td colSpan={7} className="px-6 py-4">
                                  <div className="grid grid-cols-2 gap-8">
                                    <div>
                                      <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                        All Categories
                                      </h4>
                                      <div className="flex flex-wrap gap-2">
                                        {project.category?.map(
                                          (category, catIndex) => (
                                            <span
                                              key={`${category}-${catIndex}`}
                                              className={cn(
                                                getRandomBadgeVariant(),
                                                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                                              )}
                                            >
                                              {category}
                                            </span>
                                          )
                                        ) || (
                                          <span className="text-gray-400 text-xs">
                                            -
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                        All Investors
                                      </h4>
                                      <div className="flex flex-wrap gap-4">
                                        {investorData.length > 0 ? (
                                          investorData.map(
                                            (investor, invIndex) => (
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
                                                      const target =
                                                        e.target as HTMLImageElement;
                                                      target.src =
                                                        "/default-logo.png";
                                                    }}
                                                  />
                                                </Link>
                                              </div>
                                            )
                                          )
                                        ) : (
                                          <span className="text-gray-400 text-xs">
                                            -
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            ) : null,
                          ];
                        })
                        .flat()}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="flex justify-center mt-8">
            <Link
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              href="/projects"
            >
              View All Projects
              <svg
                className="ml-2 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="mt-20 mb-4">
            <h2 className="tracking-wider text-4xl font-extrabold text-gray-900 dark:text-white">
              Top Active Funds
            </h2>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400 tracking-wider">
              Leading investors and venture capital firms in the crypto
              ecosystem
            </p>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {investors.map((investor, index) => {
              const investorLogo = investor.logo ? investor.logo : null;
              return (
                <div
                  key={investor.id}
                  className="group bg-card rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 p-6 text-center transition-all duration-300 cursor-pointer"
                >
                  <Link href={`/investors/${investor.slug}`}>
                    <div>
                      {investorLogo ? (
                        <img
                          src={investorLogo}
                          alt={investor.logoAltText || investor.name}
                          className="mx-auto object-contain h-20 transition-all duration-300 border bg-slate-50 dark:bg-slate-300 rounded-lg px-4 py-2"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const fallback =
                              target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className={`tracking-wider w-20 h-20 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br from-green-500 to-blue-600 ring-1 ring-gray-100 dark:ring-gray-600 group-hover:ring-green-200 dark:group-hover:ring-green-600 transition-all duration-300 ${
                          investorLogo ? "hidden" : "flex"
                        }`}
                      >
                        {getInitials(investor.name)}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 min-h-[3rem] flex items-center justify-center">
                        {truncateName(investor.name, 20)}
                      </h3>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {(investor as any)._count?.investments ?? investor.investments?.length ?? 0}
                          </span>{" "}
                          invested projects
                        </p>
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700 transition-all duration-200 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50">
                            Active Fund
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </FadeIn>

        {investors.length === 0 && (
          <FadeIn>
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                No Active Funds
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Check back later for active investment funds
              </p>
            </div>
          </FadeIn>
        )}

        <FadeIn>
          <div className="flex justify-center mt-8">
            <Link
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              href="/investors"
            >
              View All Investors
              <svg
                className="ml-2 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </FadeIn>
      </Container>
    </div>
  );
}