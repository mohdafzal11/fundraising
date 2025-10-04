"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Button,
  Input,
  Container,
  Shadow,
  FadeIn,
} from "@/components/ui";
import { H1, P } from "@/components/ui/typography";
import { toast } from "@/components/ui/use-toast";
import { Investor, Pagination } from "@/lib/types/projects";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { getPageUrl, cn } from "@/lib/utils";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ITEMS_PER_PAGE } from "@/lib/constant";
import { useDebounce } from "@/lib/hooks/use-debounce";


export default function AdminInvestorsPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: ITEMS_PER_PAGE,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchInvestors = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: ITEMS_PER_PAGE.toString(),
        ...(debouncedSearchQuery.trim() && { search: debouncedSearchQuery.trim() }),
      });

      const response = await fetch(
        getPageUrl(`/api/admin/investors?${queryParams.toString()}`)
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch investors: ${response.status} ${response.statusText}`
        );
      }
      const { data, pagination: fetchedPagination }: { data: Investor[]; pagination: Pagination } =
        await response.json();
      setInvestors(data || []);
      setPagination(fetchedPagination);
    } catch (error) {
      console.error("Error fetching investors:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch investors",
        variant: "destructive",
      });
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
  }, [debouncedSearchQuery]);

  useEffect(() => {
    if (mounted) {
      fetchInvestors(currentPage);
    }
  }, [debouncedSearchQuery, currentPage, mounted, fetchInvestors]);

  const handleDelete = async (investorId: string) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("id", investorId);

      const response = await fetch(
        getPageUrl(`/api/admin/investors?${queryParams.toString()}`),
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to delete investor");
      toast({
        title: "Success",
        description: "Investor deleted successfully",
      });
      fetchInvestors(currentPage);
    } catch (error) {
      console.error("Error deleting investor:", error);
      toast({
        title: "Error",
        description: "Failed to delete investor",
        variant: "destructive",
      });
    }
  };

  if (!mounted) return null;

  return (
    <div className="bg-background dark:bg-slate-900 min-h-screen py-8 transition-colors duration-200">
      <Container>
        <FadeIn>
          <div className="flex justify-between items-center mb-6">
            <H1 className="text-2xl font-bold text-foreground dark:text-white">
              Manage Investors (Admin)
            </H1>
            <div className="flex gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-muted-foreground dark:text-white/80"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <Input
                  type="search"
                  placeholder="Search investors..."
                  className="pl-10 h-9 border-gray-200 dark:border-gray-700 max-w-96"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); 
                  }}
                />
              </div>
              <Button asChild>
                <Link href="/admin/add-investor">Add Investor</Link>
              </Button>
            </div>
          </div>
        </FadeIn>

        <FadeIn>
          <Shadow
            size="sm"
            className="p-6 rounded-lg bg-card dark:bg-slate-800/50 border-gray-200 dark:border-gray-700"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th
                      scope="col"
                      className="py-3 px-4 font-semibold text-foreground dark:text-white w-[5%]"
                    >
                      #
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-4 font-semibold text-foreground dark:text-white w-[10%]"
                    >
                      Logo
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-4 font-semibold text-foreground dark:text-white w-[25%]"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-4 font-semibold text-foreground dark:text-white w-[20%]"
                    >
                      Created
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-4 font-semibold text-foreground dark:text-white w-[40%]"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-200 dark:border-gray-700 animate-pulse"
                      >
                        <td className="py-3 px-4">
                          <div className="h-5 w-8 bg-muted/50 dark:bg-slate-800/50 rounded"></div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-10 w-10 rounded-full bg-muted/50 dark:bg-slate-800/50"></div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-5 w-48 bg-muted/50 dark:bg-slate-800/50 rounded"></div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-5 w-32 bg-muted/50 dark:bg-slate-800/50 rounded"></div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <div className="h-8 w-16 bg-muted/50 dark:bg-slate-800/50 rounded"></div>
                            <div className="h-8 w-16 bg-muted/50 dark:bg-slate-800/50 rounded"></div>
                            <div className="h-8 w-16 bg-muted/50 dark:bg-slate-800/50 rounded"></div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : investors.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-10 text-center text-muted-foreground dark:text-white/80"
                      >
                        <P className="mb-4">No investors found</P>
                        <Button asChild>
                          <Link href="/admin/add-investor">Add an investor</Link>
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    investors.map((investor, index) => (
                      <tr
                        key={investor.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
                      >
                        <td className="py-3 px-4 text-foreground dark:text-white">
                          {(pagination.page - 1) * ITEMS_PER_PAGE + index + 1}
                        </td>
                        <td className="py-3 px-4">
                          <div className="relative overflow-hidden flex items-center justify-center">
                            {investor.logo ? (
                              <img
                                src={investor.logo}
                                alt={investor.logoAltText || investor.name}
                                className="object-contain p-1 w-30 h-16 "
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/default-logo.png";
                                }}
                              />
                            ) : (
                              <div className="font-medium h-12 w-12 text-base bg-primary/10 dark:bg-slate-600 text-primary dark:text-white/80 rounded-full flex items-center justify-center">
                                {investor.name?.[0]?.toUpperCase() || "I"}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-foreground dark:text-white">
                          {investor.name || "Unknown"}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground dark:text-white/80">
                          {investor.createdAt
                            ? format(new Date(investor.createdAt), "MMM d, yyyy")
                            : "-"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button asChild variant="outline">
                              <Link
                                href={`/admin/update-investor/${investor.slug}`}
                                aria-label={`Edit ${investor.name}`}
                              >
                                Edit
                              </Link>
                            </Button>
                            <Button asChild variant="outline">
                              <Link
                                href={`/investors/${investor.slug}`}
                                target="_blank"
                                aria-label={`View ${investor.name}`}
                              >
                                View
                              </Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  aria-label={`Delete ${investor.name}`}
                                >
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you sure you want to delete this investor?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete the investor "
                                    {investor.name}" and all associated data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(investor.id || "")}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 && (
              <div className="p-4 flex justify-center">
                <div
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={pagination.page === 1 || loading}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-200 dark:border-gray-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                    for (let i = Math.max(totalPages - 1, 1); i <= totalPages; i++) {
                      pagesToShow.push(i);
                    }
                    return pagesToShow.map((pageNum, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (pageNum !== "..." && Number(pageNum) <= totalPages)
                            setCurrentPage(Number(pageNum));
                        }}
                        disabled={loading || pageNum === "..." || Number(pageNum) > totalPages}
                        className={cn(
                          "relative inline-flex items-center px-3 py-2 border border-gray-200 dark:border-gray-700 text-sm font-medium",
                          pagination.page === pageNum
                            ? "text-white bg-primary"
                            : "text-foreground dark:text-white",
                          loading && "opacity-50 cursor-not-allowed"
                        )}
                        aria-current={pagination.page === pageNum ? "page" : undefined}
                        aria-label={pageNum === "..." ? undefined : `Page ${pageNum}`}
                      >
                        {pageNum}
                      </button>
                    ));
                  })()}
                  <button
                    onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                    disabled={pagination.page === pagination.totalPages || loading}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-200 dark:border-gray-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </Shadow>
        </FadeIn>
      </Container>
    </div>
  );
}