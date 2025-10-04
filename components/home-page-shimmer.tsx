import { Container, FadeIn } from "@/components/ui";

const HeaderSkeleton = () => (
  <header className="sticky top-0 z-50">
    <div className="bg-background">
      <div className="bg-background border-b border-gray-200 dark:border-gray-700 px-10">
        <div className="flex justify-center items-center py-3 md:py-4">
          <div className="flex items-center justify-between w-full max-w-[1400px]">
            {/* Logo skeleton */}
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
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
  <div className="mb-2">
    <div className="flex items-center space-x-2">
      {Array(2)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
          ></div>
        ))}
    </div>
  </div>
);

const ProjectsTableSkeleton = () => (
  <FadeIn>
    <div className="bg-card rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 overflow-hidden">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50">
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[5%]"
                scope="col"
              >
                <div className="h-4 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[20%]"
                scope="col"
              >
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[10%]"
                scope="col"
              >
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[10%]"
                scope="col"
              >
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[10%]"
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
                className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[25%]"
                scope="col"
              >
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: 5 }).map((_, index) => (
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
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex space-x-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-10"></div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex space-x-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-10"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </FadeIn>
);

const InvestorCardSkeleton = () => (
  <div className="group bg-card rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 text-center transition-all duration-300 animate-pulse">
    <div className="mx-auto w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
    <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mt-4 mx-auto"></div>
    <div className="space-y-2 mt-2">
      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto"></div>
      </div>
    </div>
  </div>
);

export default function HomePageShimmer() {
  return (
    <div className="min-h-screen relative flex flex-col">
      <HeaderSkeleton />
      <MarqueeSkeleton />
      <Container className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <BreadcrumbsSkeleton />

        <FadeIn>
          <div className="mb-10">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-8 w-[500px] bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2"></div>
          </div>
        </FadeIn>

        <ProjectsTableSkeleton />

        <FadeIn>
          <div className="flex justify-center mt-8">
            <div className="inline-flex items-center px-8 py-3 bg-gray-50 dark:bg-gray-700 text-white font-bold rounded-xl shadow-lg animate-pulse">
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="ml-2 w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="mt-20 mb-4">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-8 w-[500px] bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2"></div>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((_, index) => (
              <InvestorCardSkeleton key={index} />
            ))}
          </div>
        </FadeIn>

        <FadeIn>
          <div className="flex justify-center mt-8">
            <div className="inline-flex items-center px-8 py-3 bg-gray-50 dark:bg-gray-700 text-white font-bold rounded-xl shadow-lg animate-pulse">
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="ml-2 w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </FadeIn>
      </Container>

      <FooterSkeleton />
    </div>
  );
}
