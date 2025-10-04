"use client";

import { useState, useCallback, useEffect } from "react";
import { Container, FadeIn } from "@/components/ui";
import { Project, Pagination } from "@/lib/types/projects";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
} from "lucide-react";
import { cn, getPageUrl } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import DateRange from "@/components/date-range";
import {
  PROJECT_CATEGORIES,
  ROUND_TYPES,
  ITEMS_PER_PAGE,
  badgeVariants,
} from "@/lib/constant";
import { Button } from "@/components/ui";
import { SearchBar } from "@/components/search-bar";
import { useDebounce } from "@/lib/hooks/use-debounce";
import Link from "next/link";
import { formatAmount } from "@/lib/utils";
import Breadcrumbs from "@/components/breadcrumbs";
import { DROOMDROOM_APP_URL } from "@/lib/constant";
import ProjectsPageShimmer from "./projects-page-shimmer";

interface ProjectsPageClientProps {
  initialProjects: Project[];
  initialPagination: any;
}

interface FilterState {
  search: string;
  categories: string[];
  roundType: string;
  dateRange: { from: string; to: string };
  amountRange: { min: string; max: string };
}

export default function ProjectsPageClient({
  initialProjects = [],
  initialPagination,
}: ProjectsPageClientProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [showShimmer, setShowShimmer] = useState(true);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);
  const [currentPage, setCurrentPage] = useState(initialPagination.page);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set()
  );

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    categories: [],
    roundType: "All",
    dateRange: { from: "", to: "" },
    amountRange: { min: "", max: "" },
  });
  const debouncedFilters = useDebounce(filters, 300);

  const fetchProjects = useCallback(
    async (page: number, filters: FilterState) => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          pageSize: ITEMS_PER_PAGE.toString(),
          ...(filters.search && { search: filters.search }),
          ...(filters.categories.length > 0 &&
            !filters.categories.includes("All") && {
              categories: filters.categories.join(","),
            }),
          ...(filters.roundType !== "All" && { roundType: filters.roundType }),
          ...(filters.dateRange.from && { dateFrom: filters.dateRange.from }),
          ...(filters.dateRange.to && { dateTo: filters.dateRange.to }),
          ...(filters.amountRange.min && {
            amountMin: filters.amountRange.min,
          }),
          ...(filters.amountRange.max && {
            amountMax: filters.amountRange.max,
          }),
        });

        queryParams.set("view", "rounds");
        const response = await fetch(
          getPageUrl(`/api/projects?${queryParams.toString()}`)
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
    []
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const loadData = async () => {
      await fetchProjects(currentPage, debouncedFilters);
      setShowShimmer(false);
    };
    
    if (showShimmer) {
      // First load - show shimmer briefly then load data
      const timer = setTimeout(loadData, 500);
      return () => clearTimeout(timer);
    } else {
      // Subsequent loads - just fetch data
      fetchProjects(currentPage, debouncedFilters);
    }
  }, [currentPage, debouncedFilters, showShimmer, isMounted, fetchProjects]);

  const handleSearch = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setCurrentPage(1);
  }, []);

  const handleDateRangeChange = (from: string, to: string) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: { from, to },
    }));
    setCurrentPage(1);
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

  const hasActiveFilters =
    filters.search !== "" ||
    filters.categories.length > 0 ||
    filters.roundType !== "All" ||
    filters.dateRange.from !== "" ||
    filters.dateRange.to !== "" ||
    filters.amountRange.min !== "" ||
    filters.amountRange.max !== "";

  const truncateName = (name: string, maxLength: number = 20) => {
    if (!name) return "Unknown";
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength) + "...";
  };

  const getRandomBadgeVariant = () => {
    const randomIndex = Math.floor(Math.random() * badgeVariants.length);
    return badgeVariants[randomIndex];
  };
  const startIndex = (pagination.page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const breadcrumbItems = [
    { label: "Home", href: DROOMDROOM_APP_URL },
    {
      label: "Recent Fundraising Events",
      href: `${DROOMDROOM_APP_URL}/fundraising`,
    },
    {
      label: "VC Deal Flow",
      href: `${DROOMDROOM_APP_URL}/fundraising/projects`,
    },
  ];

  // SHIMMER DISABLED FOR DEBUGGING
  // Show shimmer only for actual users (client-side) while loading
  // Server-side always renders content for SEO (Google bots)
  // if (isMounted && showShimmer) {
  //   return <ProjectsPageShimmer />;
  // }

  return (
    <div className="min-h-screen">
      <Container className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Breadcrumbs items={breadcrumbItems} className="mb-2" />

        <FadeIn>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <div>
              <h1 className="tracking-wider text-4xl font-extrabold text-gray-900 dark:text-white">
                VC Deal Flow
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-lg tracking-wider">
                Discover the latest funding rounds and investment trends
              </p>
            </div>
            <SearchBar
              placeholder="Search projects..."
              searchQuery={filters.search}
              setSearchQuery={handleSearch}
              className="w-full sm:w-[300px] rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
            />
          </div>
        </FadeIn>
        <FadeIn>
          <div className="bg-card rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-10">
            <div className="flex flex-col lg:flex-row gap-6 items-end">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                <div>
                  <DateRange
                    onDateRangeChange={handleDateRangeChange}
                    initialFrom={filters.dateRange.from}
                    initialTo={filters.dateRange.to}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Round Type
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 text-sm flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200">
                      {filters.roundType}
                      <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[300px] max-h-[300px] border border-gray-200 dark:border-gray-700 bg-card rounded-lg shadow-lg">
                      {ROUND_TYPES.map((type) => (
                        <DropdownMenuItem
                          key={type}
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, roundType: type }))
                          }
                          className="text-gray-900 dark:text-gray-100  px-4 py-2 text-sm transition-colors duration-150"
                        >
                          {type}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 text-sm flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200">
                      {filters.categories.length > 0
                        ? filters.categories.join(", ")
                        : "All"}
                      <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[300px] border border-gray-200 dark:border-gray-700 bg-card rounded-lg shadow-lg max-h-[300px] overflow-auto">
                      {PROJECT_CATEGORIES.map((category) => (
                        <DropdownMenuCheckboxItem
                          key={category}
                          checked={filters.categories.includes(category)}
                          onCheckedChange={(checked) =>
                            setFilters((prev) => ({
                              ...prev,
                              categories: checked
                                ? [...prev.categories, category]
                                : prev.categories.filter((c) => c !== category),
                            }))
                          }
                          className="text-gray-900 dark:text-gray-100 px-4 py-2 text-sm transition-colors duration-150"
                        >
                          {category}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {hasActiveFilters && (
                <div className="">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilters({
                        search: "",
                        categories: [],
                        roundType: "All",
                        dateRange: { from: "", to: "" },
                        amountRange: { min: "", max: "" },
                      });
                      setCurrentPage(1);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-gray-900 dark:text-gray-100 rounded-lg transition-all duration-200"
                  >
                    <X className="h-4 w-4" />
                    <span>Clear Filters</span>
                  </Button>
                </div>
              )}
            </div>
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
                        <div className="flex flex-col items-center space-y-4">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <Calendar className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                            No projects found
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Try adjusting your filters or search terms
                          </p>
                          <button
                            onClick={() =>
                              setFilters({
                                search: "",
                                categories: [],
                                roundType: "All",
                                dateRange: { from: "", to: "" },
                                amountRange: { min: "", max: "" },
                              })
                            }
                            className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                          >
                            Clear all filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <>
                      {!loading &&
                        projects.length > 0 &&
                        projects
                          .map((project, index) => {
                            const globalIndex = startIndex + index;
                            const projectLogo =
                              project?.logo || "/default-logo.png";
                            const projectRound =
                              project?.rounds?.length > 0
                                ? project?.rounds[project.rounds.length - 1]
                                    .type
                                : "-";
                            const lastRound =
                              project?.rounds[project?.rounds?.length - 1];
                            const projectDate = lastRound?.date
                              ? new Date(lastRound?.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "-";
                            const raisedAmount =
                              project?.rounds?.reduce(
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
                            const isExpanded = expandedProjects?.has(
                              project?.slug?.toString()
                            );

                            return [
                              <tr
                                key={project?.id}
                                className="hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300 cursor-pointer group"
                              >
                                <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                                  {globalIndex + 1}
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                  <Link href={`/projects/${project?.slug}`}>
                                    <div className="flex items-center space-x-4">
                                      <img
                                        src={projectLogo}
                                        alt={project?.title || "Project Logo"}
                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600 transition-all duration-200 group-hover:ring-blue-500 dark:group-hover:ring-blue-400"
                                        onError={(e) => {
                                          const target =
                                            e.target as HTMLImageElement;
                                          target.src = "/default-logo.png";
                                        }}
                                      />
                                      <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                                          <div>
                                            {truncateName(
                                              project?.name || "Unknown",
                                              25
                                            )}
                                          </div>
                                        </p>
                                        {project?.title &&
                                          project?.title !== project.name && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                              {truncateName(project?.title, 30)}
                                            </p>
                                          )}
                                      </div>
                                    </div>
                                  </Link>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700 transition-all duration-200 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50">
                                    {projectRound}
                                  </span>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                                    <span>{projectDate}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                                  {raisedAmount > 0
                                    ? formatAmount(raisedAmount)
                                    : "-"}
                                </td>
                                <td className="px-6 py-5">
                                  <div className="flex flex-wrap gap-2">
                                    {project?.category &&
                                    project?.category?.length > 0 ? (
                                      project?.category
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
                                    {project?.category &&
                                      project?.category?.length > 2 && (
                                        <span
                                          className="text-xs text-gray-400 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleExpand(
                                              project.slug.toString()
                                            );
                                          }}
                                        >
                                          +{project?.category?.length - 2}
                                        </span>
                                      )}
                                  </div>
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
            <div className="p-6 flex justify-center">
              <div
                className="inline-flex rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-card"
                aria-label="Pagination"
              >
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                  for (let i = 1; i <= Math.min(2, totalPages); i++) {
                    pagesToShow.push(i);
                  }

                  if (totalPages > 3 && currentPage > 3) {
                    pagesToShow.push("...");
                  }

                  const start = Math.max(2, currentPage - 2);
                  const end = Math.min(totalPages - 1, currentPage + 2);
                  for (let i = start; i <= end; i++) {
                    if (i > 2 && i < totalPages - 1) pagesToShow.push(i);
                  }

                  if (totalPages > 3 && currentPage < totalPages - 2) {
                    pagesToShow.push("...");
                  }

                  for (
                    let i = Math.max(totalPages - 1, 1);
                    i <= totalPages;
                    i++
                  ) {
                    pagesToShow.push(i);
                  }

                  return pagesToShow.map((pageNum, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (pageNum !== "..." && Number(pageNum) <= totalPages)
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
          )}
        </FadeIn>
      </Container>
    </div>
  );
}
