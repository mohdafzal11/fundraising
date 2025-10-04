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
    <div className="mb-4">
      <div className="flex items-center space-x-2">
        {Array(4)
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

export default function ProjectPageShimmer() {
  return (
    <div className="min-h-screen relative flex flex-col">
      <HeaderSkeleton />
      <MarqueeSkeleton />
      <Container className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <BreadcrumbsSkeleton />

        {/* Project Header Shimmer */}
        <FadeIn className="mb-8">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-start gap-6 mb-6">
              {/* Logo Shimmer */}
              <div className="h-16 w-16 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {/* Title Shimmer */}
                    <div className="h-9 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    {/* Badge Shimmer */}
                    <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                  {/* Share Button Shimmer */}
                  <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-700 animate-pulse" />
                </div>
                {/* Category Tags Shimmer */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {[20, 24, 28].map((width, i) => (
                    <div
                      key={i}
                      className={`h-6 w-${width} bg-gray-200 dark:bg-gray-700 rounded animate-pulse`}
                    />
                  ))}
                </div>
                {/* Description Shimmer */}
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-4/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
            </div>
            {/* Key Metrics Shimmer */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-card border border-gray-200 dark:border-gray-700 rounded-lg">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center space-y-2">
                  <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse" />
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse" />
                </div>
              ))}
            </div>
            {/* Links Shimmer */}
            <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-700 animate-pulse"
                />
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Tab Navigation Shimmer */}
        <FadeIn className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              {[1, 2].map((i) => (
                <div key={i} className="py-2 px-1">
                  <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              ))}
            </nav>
          </div>
        </FadeIn>

        {/* Funding Rounds Table Shimmer */}
        <FadeIn>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="h-7 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
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
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[20%]"
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
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[30%]"
                      scope="col"
                    >
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="h-5 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-7 w-24 bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-full animate-pulse" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-full animate-pulse" />
                          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-full animate-pulse" />
                          <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-full animate-pulse" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </FadeIn>
      </Container>
      <FooterSkeleton />
    </div>
  );
}
