import { Container, FadeIn } from "@/components/ui";

const HeaderSkeleton = () => (
  <header className="sticky top-0 z-50">
    <div className="bg-background">
      <div className="bg-background border-b border-gray-200 dark:border-gray-700 px-10">
        <div className="flex justify-center items-center py-3 md:py-4">
          <div className="flex items-center justify-between w-full max-w-[1400px]">
            {/* Logo skeleton */}
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            {/* Menu skeleton */}
            <div className="hidden md:flex items-center space-x-10">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                ></div>
              ))}
            </div>
            {/* Theme toggle and mobile menu skeleton */}
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="md:hidden h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
);

const MarqueeSkeleton = () => (
  <div className="w-full bg-background border-b border-gray-200 dark:border-gray-700 py-2">
    <Container>
      <div className="flex gap-4 overflow-hidden h-[36px]">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex items-center animate-pulse gap-2">
              <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
      </div>
    </Container>
  </div>
);

const FooterSkeleton = () => (
  <footer className="w-full bg-background min-h-[500px] flex flex-col px-6 py-10 border-t border-gray-200 dark:border-gray-700">
    <div className="max-w-[1400px] mx-auto w-full text-left pb-5">
      <div className="flex justify-between items-center flex-wrap md:flex-nowrap">
        <div className="max-w-[600px]">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="flex gap-3 justify-end mt-6 md:mt-0">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
    <div className="h-1.5 my-4 mx-auto max-w-[1400px] w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] gap-8 max-w-[1400px] mx-auto py-10">
      <div className="flex flex-col gap-5">
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
    <div className="max-w-[1400px] mx-auto pt-8 border-t border-gray-200 dark:border-gray-700">
      <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
    </div>
  </footer>
);

const BreadcrumbsSkeleton = () => (
  <FadeIn>
    <div className="mb-2">
      <div className="flex items-center space-x-2">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
            ></div>
          ))}
      </div>
    </div>
  </FadeIn>
);

const InvestorsTableSkeleton = () => (
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
                <div className="h-4 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[40%]"
                scope="col"
              >
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[20%]"
                scope="col"
              >
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[35%]"
                scope="col"
              >
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: 10 }).map((_, index) => (
              <tr key={index} className="animate-pulse">
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </FadeIn>
);

const PaginationSkeleton = () => (
  <FadeIn>
    <div className="p-6 flex justify-center">
      <div className="inline-flex rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-card animate-pulse">
        <div className="px-3 py-2 rounded-l-lg border-r border-gray-200 dark:border-gray-700 w-10 h-10 bg-gray-200 dark:bg-gray-700"></div>
        {[1, 2, 3, 4].map((_, index) => (
          <div
            key={index}
            className="px-4 py-2 border-r border-gray-200 dark:border-gray-700 w-10 h-10 bg-gray-200 dark:bg-gray-700"
          ></div>
        ))}
        <div className="px-3 py-2 rounded-r-lg border-l border-gray-200 dark:border-gray-700 w-10 h-10 bg-gray-200 dark:bg-gray-700"></div>
      </div>
    </div>
  </FadeIn>
);

export default function InvestorsPageShimmer() {
  return (
    <div className="min-h-screen relative flex flex-col">
      <HeaderSkeleton />
      <MarqueeSkeleton />
      <Container className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <BreadcrumbsSkeleton />

        <FadeIn>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <div>
              <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-5 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2"></div>
            </div>
            <div className="w-full sm:w-[300px]">
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"></div>
            </div>
          </div>
        </FadeIn>
        <InvestorsTableSkeleton />
        <PaginationSkeleton />
      </Container>
      <FooterSkeleton />
    </div>
  );
}
