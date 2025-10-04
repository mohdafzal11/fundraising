"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPageUrl } from "@/lib/utils";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Globe,
  Twitter,
  Facebook,
  Linkedin,
  MessageCircle,
  ChevronDown,
  X,
  Building,
  List,
  Link2,
} from "lucide-react";
import { Button, Container, FadeIn } from "@/components/ui";
import { Project, Pagination, Link as ProjectLink } from "@/lib/types/projects";
import { ITEMS_PER_PAGE, badgeVariants } from "@/lib/constant";
import { cn } from "@/lib/utils";
import Link from "next/link";
import InvestorPageShimmer from "./investor-page-shimmer";
import Breadcrumbs from "@/components/breadcrumbs";
import { DROOMDROOM_APP_URL } from "@/lib/constant";

export default function InvestorPageClient({
  initialInvestor,
  initialProjects,
  initialPagination,
}: {
  initialInvestor: any;
  initialProjects: any;
  initialPagination: any;
}) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [showShimmer, setShowShimmer] = useState(true);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>(initialProjects ?? []);
  const [investor, setInvestor] = useState(initialInvestor ?? {});
  const [pagination, setPagination] = useState<Pagination>(
    initialPagination ?? {}
  );
  const [currentPage, setCurrentPage] = useState(initialPagination?.page ?? 1);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set()
  );

  const fetchProjects = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          pageSize: ITEMS_PER_PAGE.toString(),
        });
        const response = await fetch(
          getPageUrl(
            `/api/investors/projects/${
              investor?.slug
            }?${queryParams.toString()}`
          )
        );
        if (!response.ok) throw new Error("Failed to fetch projects");
        const data: { data: Project[]; pagination: Pagination } =
          await response.json();

        setProjects(data.data || []);
        setPagination(data.pagination);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setProjects([]);
        setPagination({
          page,
          pageSize: ITEMS_PER_PAGE,
          totalCount: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        });
      } finally {
        setLoading(false);
      }
    },
    [investor?.slug]
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const loadData = async () => {
      await fetchProjects(currentPage);
      setShowShimmer(false);
    };
    
    if (showShimmer) {
      // First load - show shimmer briefly then load data
      const timer = setTimeout(loadData, 500);
      return () => clearTimeout(timer);
    } else if (!(initialProjects.length > 0 && initialPagination.page === currentPage)) {
      // Subsequent loads - just fetch data if needed
      fetchProjects(currentPage);
    }
  }, [currentPage, fetchProjects, showShimmer, initialProjects.length, initialPagination.page, isMounted]);

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

  const investorLogo = investor.logo || "/default-logo.png";

  const getRandomBadgeVariant = () => {
    const randomIndex = Math.floor(Math.random() * badgeVariants.length);
    return badgeVariants[randomIndex];
  };

  const truncateName = (name: string, maxLength: number = 20) => {
    if (!name) return "Unknown";
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength) + "...";
  };

  const startIndex = (pagination?.page - 1) * ITEMS_PER_PAGE;

  // SHIMMER DISABLED FOR DEBUGGING
  // Show shimmer only for actual users (client-side) while loading
  // Server-side always renders content for SEO (Google bots)
  // if ((isMounted && showShimmer) || !investor) {
  //   return <InvestorPageShimmer />;
  // }
  if (!investor) {
    return <InvestorPageShimmer />;
  }

  const breadcrumbItems = [
    { label: "Home", href: DROOMDROOM_APP_URL },
    { label: "Recent Fundraising Events", href : `${DROOMDROOM_APP_URL}/fundraising`},
    { label: "Investors", href: `${DROOMDROOM_APP_URL}/fundraising/investors` },
    { label: investor?.name , href : `${DROOMDROOM_APP_URL}/fundraising/investors/${investor?.slug}` },
  ];


  return (
    <div className="min-h-screen">
      <Container className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        <Breadcrumbs items={breadcrumbItems} className="mb-2" />

        <FadeIn>
          <div className="mb-10">
            <h1 className="tracking-wider text-4xl font-extrabold text-gray-900 dark:text-white">
              {investor.name || "Unknown"}
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400 tracking-wider">
              Explore projects backed by {investor.name || "this investor"}
            </p>
          </div>
        </FadeIn>

        <FadeIn className="mb-8">
          <div className="p-4 md:p-6 border rounded-2xl shadow-md bg-card flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
            <div className="flex items-center gap-4 md:gap-6">
              {investorLogo && (
                <img
                  src={investorLogo}
                  alt={
                    investor?.logoAltText || investor?.name || "Investor Logo"
                  }
                  className="h-16 md:h-20 w-40 md:w-48 object-contain border rounded-lg bg-slate-50 dark:bg-slate-300 px-4 py-2"
                />
              )}
            </div>
            <div className="flex flex-col">
              <div className="text-base tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                <Building className="h-4 w-4" />
                <span>Fund Name</span>
              </div>
              <h1 className="text-lg font-bold tracking-wider text-gray-900 dark:text-white">
                {investor?.name || "Unknown"}
              </h1>
            </div>

            <div className="flex flex-col">
              <div className="text-base tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                <List className="h-4 w-4" />
                <span>Invested Projects</span>
              </div>
              <h2 className="text-lg font-bold tracking-wider text-gray-900 dark:text-white">
                {pagination?.totalCount || 0}
              </h2>
            </div>
            <div className="flex flex-col">
              <div className="text-base tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                <span>Links</span>
              </div>
              <div className="flex gap-2 text-lg md:text-base font-bold tracking-wider text-gray-900 dark:text-white">
                {investor?.links?.length > 0 ? (
                  investor?.links?.map((link: ProjectLink) => (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                    >
                      {link.url.toLowerCase().includes("x.com") ? (
                        "Twitter"
                      ) : link.type.charAt(0).toUpperCase() + link.type.slice(1)}
                    </a>
                  ))
                ) : (
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    No links
                  </span>
                )}
              </div>
            </div>
          </div>
        </FadeIn>
        {projects.length > 0 && (
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
                      Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
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
                                Check back later for projects backed by this
                                investor
                              </p>
                            </div>
                          </FadeIn>
                        </td>
                      </tr>
                    ) : (
                      <>
                        {projects
                          .map((project: Project, index: number) => {
                            const globalIndex = startIndex + index;
                            const projectLogo =
                              project.logo || "/default-logo.png";
                            const projectRound =
                              project.rounds?.length > 0
                                ? project.rounds[project.rounds.length - 1].type
                                : "-";
                            const lastRound =
                              project.rounds[project.rounds.length - 1];
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
                            const investorData = project?.rounds
                              .flatMap((round) => round?.investments)
                              .filter((investment) => investment?.investor)
                              .map((investment) => ({
                                name: investment?.investor?.name,
                                logo:
                                  investment?.investor?.logo ||
                                  "/default-logo.png",
                                slug: investment?.investor?.slug,
                              }))
                              .filter(
                                (
                                  inv
                                ): inv is {
                                  name: string;
                                  logo: string;
                                  slug: string;
                                } => !!inv.name
                              );
                            const isExpanded = expandedProjects.has(
                              project.slug.toString()
                            );

                            return [
                              <tr
                                key={project.id}
                                className="hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300 cursor-pointer group"
                                onClick={() =>
                                  router.push(`/projects/${project.slug}`)
                                }
                              >
                                <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                                  <FadeIn delay={index * 50}>
                                    {globalIndex + 1}
                                  </FadeIn>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                  <FadeIn delay={index * 50}>
                                    <div className="flex items-center space-x-4">
                                      <img
                                        src={projectLogo}
                                        alt={project.title || "Project Logo"}
                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600 transition-all duration-200 group-hover:ring-blue-500 dark:group-hover:ring-blue-400"
                                        onError={(e) => {
                                          const target =
                                            e.target as HTMLImageElement;
                                          target.src = "/default-logo.png";
                                        }}
                                      />
                                      <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                                          <Link
                                            href={`/projects/${project.slug}`}
                                          >
                                            {truncateName(
                                              project.name || "Unknown",
                                              25
                                            )}
                                          </Link>
                                        </p>
                                        {project.title &&
                                          project.title !== project.name && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                              {truncateName(project.title, 30)}
                                            </p>
                                          )}
                                      </div>
                                    </div>
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
                                      ? `$${raisedAmount.toLocaleString()}`
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
                                              toggleExpand(
                                                project.slug.toString()
                                              );
                                            }}
                                          >
                                            +{project.category.length - 2}
                                          </span>
                                        )}
                                    </div>
                                  </FadeIn>
                                </td>
                                <td className="px-6 py-5">
                                  <div className="flex flex-wrap gap-2">
                                    {investorData?.length > 0 ? (
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
                                    {investorData?.length > 2 && (
                                      <span
                                        className="text-xs text-gray-400 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleExpand(
                                            project?.slug?.toString()
                                          );
                                        }}
                                      >
                                        +{investorData?.length - 2}
                                      </span>
                                    )}
                                  </div>
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
                                          {project?.category?.map(
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
                                          {investorData?.map(
                                            (investor, invIndex) => (
                                              <div
                                                key={`${investor.name}-${invIndex}`}
                                                className="flex items-center space-x-2"
                                              >
                                                <Link
                                                  href={`/investors/${investor.slug}`}
                                                >
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
                                          ) || (
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
            {pagination.totalPages > 1 && (
              <FadeIn>
                <div className="p-6 flex justify-center">
                  <div
                    className="inline-flex rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-card"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={pagination.page === 1 || loading}
                      className="px-3 py-2 rounded-l-lg border-r border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    {(() => {
                      const pagesToShow = [];
                      const totalPages = pagination.totalPages;
                      const currentPage = pagination.page;

                      if (totalPages > 1) pagesToShow.push(1);

                      const maxPagesToShow = 5;
                      let start = Math.max(2, currentPage - 1);
                      let end = Math.min(totalPages - 1, currentPage + 1);

                      if (end - start < 2 && totalPages > 3) {
                        if (currentPage <= 2) end = Math.min(4, totalPages);
                        else start = Math.max(3, totalPages - 3);
                      }

                      if (start > 2) pagesToShow.push("...");
                      for (let i = start; i <= end; i++) {
                        if (!pagesToShow.includes(i)) pagesToShow.push(i);
                      }
                      if (end < totalPages - 1) pagesToShow.push("...");
                      if (totalPages > 1) pagesToShow.push(totalPages);

                      return pagesToShow.map((pageNum, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            if (
                              pageNum !== "..." &&
                              Number(pageNum) <= totalPages
                            )
                              setCurrentPage(Number(pageNum));
                          }}
                          disabled={
                            loading ||
                            pageNum === "..." ||
                            Number(pageNum) > totalPages
                          }
                          className={cn(
                            "px-4 py-2 border-r border-gray-200 dark:border-gray-700 text-sm font-medium",
                            pagination.page === pageNum
                              ? "bg-blue-600 text-white"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700",
                            loading && "opacity-50 cursor-not-allowed",
                            pageNum === "..." && "cursor-default"
                          )}
                          aria-current={
                            pagination.page === pageNum ? "page" : undefined
                          }
                          aria-label={
                            pageNum === "..." ? undefined : `Page ${pageNum}`
                          }
                        >
                          {pageNum}
                        </button>
                      ));
                    })()}
                    <button
                      onClick={() =>
                        setCurrentPage(
                          Math.min(pagination.totalPages, currentPage + 1)
                        )
                      }
                      disabled={
                        pagination.page === pagination.totalPages || loading
                      }
                      className="px-3 py-2 rounded-r-lg border-l border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </FadeIn>
            )}
          </FadeIn>
        )}
      </Container>
    </div>
  );
}
