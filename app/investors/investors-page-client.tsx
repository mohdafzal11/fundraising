"use client";

import { useState, useCallback, useEffect } from "react";
import { Container, FadeIn } from "@/components/ui";
import { Investor, Pagination, Link as SocialLink } from "@/lib/types/projects";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Globe,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
} from "lucide-react";
import { cn, getPageUrl } from "@/lib/utils";
import { Button } from "@/components/ui";
import { SearchBar } from "@/components/search-bar";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { ITEMS_PER_PAGE } from "@/lib/constant";
import Logo from "@/components/logo";
import Link from "next/link";
import { DROOMDROOM_APP_URL } from "@/lib/constant";
import Breadcrumbs from "@/components/breadcrumbs";
import InvestorsPageShimmer from "./investors-page-shimmer";

interface InvestorsPageClientProps {
  initialInvestors: any[];
  initialPagination: any;
}

export default function InvestorsPageClient({
  initialInvestors = [],
  initialPagination,
}: InvestorsPageClientProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [showShimmer, setShowShimmer] = useState(true);
  const [loading, setLoading] = useState(false);
  const [investors, setInvestors] = useState<Investor[]>(initialInvestors);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [currentPage, setCurrentPage] = useState(initialPagination.page);

  const fetchInvestors = useCallback(async (page: number, search: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        getPageUrl(
          `/api/investors?page=${page}&pageSize=${ITEMS_PER_PAGE}&search=${encodeURIComponent(
            search
          )}`
        )
      );
      if (!response.ok) throw new Error("Failed to fetch investors");
      const data: { data: Investor[]; pagination: Pagination } =
        await response.json();

      setInvestors(data.data || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching investors:", error);
      setInvestors([]);
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
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);


  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const loadData = async () => {
      await fetchInvestors(currentPage, debouncedSearchQuery);
      setShowShimmer(false);
    };
    
    if (showShimmer) {
      // First load - show shimmer briefly then load data
      const timer = setTimeout(loadData, 500);
      return () => clearTimeout(timer);
    } else if (
      !(initialInvestors.length > 0 &&
        debouncedSearchQuery === "" &&
        currentPage === initialPagination.page)
    ) {
      // Subsequent loads - just fetch data if needed
      fetchInvestors(currentPage, debouncedSearchQuery);
    }
  }, [currentPage, debouncedSearchQuery, fetchInvestors, initialInvestors, initialPagination.page, showShimmer, isMounted]);


  const displayedInvestors = investors;

  const startIndex = ((pagination?.page || 1) - 1) * ITEMS_PER_PAGE;

  const truncateName = (name: string, maxLength: number = 20) => {
    if (!name) return "Unknown";
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength) + "...";
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

  const breadcrumbItems = [
    { label: "Home", href: DROOMDROOM_APP_URL },
    { label: "Recent Fundraising Events", href : `${DROOMDROOM_APP_URL}/fundraising`},
    { label: "Investors", href: `${DROOMDROOM_APP_URL}/fundraising/investors` },
  ];

  // SHIMMER DISABLED FOR DEBUGGING
  // Show shimmer only for actual users (client-side) while loading
  // Server-side always renders content for SEO (Google bots)
  // if (isMounted && showShimmer) {
  //   return <InvestorsPageShimmer />;
  // }

  return (
    <div className="min-h-screen">
      <Container className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        <Breadcrumbs items={breadcrumbItems} className="mb-2" />

        <FadeIn>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <div>
              <h1 className="tracking-wider text-4xl font-extrabold text-gray-900 dark:text-white">
                Investors
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-lg tracking-wider">
                Discover leading venture capital firms and active funds in the
                crypto ecosystem
              </p>
            </div>
            <SearchBar
              placeholder="Search investors..."
              searchQuery={searchQuery}
              setSearchQuery={handleSearch}
              className="w-full sm:w-[300px] rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
            />
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
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[40%]"
                      scope="col"
                    >
                      Fund Name
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[20%]"
                      scope="col"
                    >
                      Links
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[35%]"
                      scope="col"
                    >
                      Invested Projects
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
                          <div className="flex space-x-2">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-6"></div>
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-6"></div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                        </td>
                      </tr>
                    ))
                  ) : displayedInvestors.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-16 text-center text-gray-500 dark:text-gray-400"
                      >
                        <FadeIn>
                          <div className="flex flex-col items-center space-y-4">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              <Calendar className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                              No investors found
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Try adjusting your search terms
                            </p>
                            <Button
                              variant="outline"
                              onClick={() => setSearchQuery("")}
                              className="flex items-center gap-2 px-4 py-2 text-gray-900 dark:text-gray-100 rounded-lg transition-all duration-200"
                            >
                              <X className="h-4 w-4" />
                              <span>Clear search</span>
                            </Button>
                          </div>
                        </FadeIn>
                      </td>
                    </tr>
                  ) : (
                    displayedInvestors.map((investor, index) => {
                      const globalIndex = startIndex + index;
                      const investorLogo = investor.logo || "/default-logo.png";

                      return (
                        <tr
                          key={investor.id}
                          className="hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300 cursor-pointer group"
                        >
                          <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                            <FadeIn delay={index * 50}>
                              {globalIndex + 1}
                            </FadeIn>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <Link href={`/investors/${investor.slug}`}>
                              <div className="flex items-center space-x-4">
                                <Logo
                                  logo={investor.logo}
                                  name={investor.name}
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-bold tracking-wider text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {truncateName(investor.name, 25)}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            <FadeIn delay={index * 50}>
                              <div className="flex gap-2">
                                {investor.links && investor.links.length > 0 ? (
                                  investor.links.map((link: SocialLink) => (
                                    <a
                                      key={link.type}
                                      href={link.url || "#"}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      { link.url.toLowerCase().includes("x.com") ? (
                                        <Twitter className="h-5 w-5" />
                                      ) : link.type === "website" ? (
                                        <Globe className="h-5 w-5" />
                                      ) : link.type === "twitter" ? (
                                        <Twitter className="h-5 w-5" />
                                      ) : link.type === "facebook" ? (
                                        <Facebook className="h-5 w-5" />
                                      ) : link.type === "telegram" ? (
                                        <MessageCircle className="h-5 w-5" />
                                      ) : link.type === "linkedin" ? (
                                        <Linkedin className="h-5 w-5" />
                                      ) : 
                                      null}
                                    </a>
                                  ))
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </div>
                            </FadeIn>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <FadeIn delay={index * 50}>
                              <span className="text-sm font-bold text-gray-900 dark:text-white">
                                {(investor as any)._count?.investments ?? investor.investments?.length ?? 0}
                              </span>
                            </FadeIn>
                          </td>
                        </tr>
                      );
                    })
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
      </Container>
    </div>
  );
}
