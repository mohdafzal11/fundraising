import {
  WebsiteSchema,
  ProjectListSchema,
  InvestorsListSchema,
  BreadcrumbSchema,
} from "@/components/schema-markup";
import { prisma } from "@/lib/prisma";
import { Container, FadeIn } from "@/components/ui";
import { Calendar } from "lucide-react";
import { cn, formatAmount } from "@/lib/utils";
import { badgeVariants } from "@/lib/constant";
import Link from "next/link";
import Breadcrumbs from "@/components/breadcrumbs";
import { DROOMDROOM_APP_URL } from "@/lib/constant";
import HomePageClient from "@/components/home-page-client";

export const revalidate = 3600;
export const dynamic = "force-static";

async function getProjects() {
  try {
    const page = 1;
    const pageSize = 5;

    const latestRounds = await prisma.round.groupBy({
      by: ["projectId"],
      _max: { date: true, createdAt: true },
      orderBy: [{ _max: { date: "desc" } }, { _max: { createdAt: "desc" } }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const projectIds = latestRounds.map((r) => r.projectId);
    if (projectIds.length === 0) return { projects: [] };

    const projects = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      include: {
        rounds: {
          include: { investments: { include: { investor: true } } },
          orderBy: { date: "desc" },
          take: 1,
        },
      },
    });

    const ordered = projectIds
      .map((id) => projects.find((p) => p.id === id)!)
      .filter(Boolean);

    return { projects: ordered };
  } catch (error) {
    console.error("Error fetching projects:", error);
    return { projects: [] };
  }
}

async function getInvestors() {
  try {
    const investors = await prisma.investor.findMany({
      where: { status: "APPROVED" },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        links: true,
        logoAltText: true,
        _count: { select: { investments: true } },
      },
      orderBy: { investments: { _count: "desc" } },
      take: 8,
    });
    return { investors };
  } catch (error) {
    console.error("Error fetching investors:", error);
    return { investors: [] };
  }
}

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

const getRandomBadgeVariant = () => {
  const randomIndex = Math.floor(Math.random() * badgeVariants.length);
  return badgeVariants[randomIndex];
};

export default async function Home() {
  const { projects = [] } = await getProjects();
  const { investors = [] } = await getInvestors();
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://droomdroom.com/fundraising";

  const breadcrumbItems = [
    { label: "Home", href: DROOMDROOM_APP_URL },
    {
      label: "Recent Fundraising Events",
      href: `${DROOMDROOM_APP_URL}/fundraising`,
    },
  ];

  return (
    <>
      <WebsiteSchema
        title="Top Crypto & Web3 Fundraising Tracker | DroomDroom"
        description="Track the latest crypto and Web3 fundraising rounds, including private and public sales, on DroomDroom. Explore top projects, investors, and categories like DeFi, AI, and stablecoins."
        url={baseUrl}
        imageUrl={`${baseUrl}/og-image.jpg`}
      />
      <BreadcrumbSchema items={[{ name: "Home", url: baseUrl }]} />
      <ProjectListSchema projects={projects} />
      <InvestorsListSchema investors={investors} />

      <div className="min-h-screen bg-background">
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
                    {projects.length === 0 ? (
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
                      projects.map((project, index) => {
                        const projectLogo = project.logo ? project.logo : null;
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
                        const investorData =
                          project.rounds
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
                              (
                                inv
                              ): inv is {
                                name: string;
                                logo: string;
                                slug: string;
                              } => !!inv.name && !!inv.slug
                            ) || [];

                        return (
                          <tr
                            key={project.id}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300"
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
                                      />
                                    ) : (
                                      <div className="w-12 h-12 rounded-full flex items-center tracking-wider justify-center text-white font-bold text-sm bg-gradient-to-br from-blue-500 to-purple-600 ring-2 ring-gray-100 dark:ring-gray-600">
                                        {getInitials(project.name)}
                                      </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {truncateName(
                                          project.name || "Unknown",
                                          25
                                        )}
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
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
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
                                      <span className="text-xs text-gray-400 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
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
                                    <span className="text-xs text-gray-400 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                                      +{investorData.length - 2}
                                    </span>
                                  )}
                                </div>
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
              {investors.map((investor) => {
                const investorLogo = investor.logo ? investor.logo : null;
                return (
                  <div
                    key={investor.id}
                    className="group bg-card rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 p-6 text-center transition-all duration-300"
                  >
                    <Link href={`/investors/${investor.slug}`}>
                      <div>
                        {investorLogo ? (
                          <img
                            src={investorLogo}
                            alt={investor.logoAltText || investor.name}
                            className="mx-auto object-contain h-20 rounded-lg bg-slate-50 dark:bg-slate-300 px-4 py-2"
                          />
                        ) : (
                          <div className="tracking-wider w-20 h-20 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br from-green-500 to-blue-600 ring-1 ring-gray-100 dark:ring-gray-600">
                            {getInitials(investor.name)}
                          </div>
                        )}
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white min-h-[3rem] flex items-center justify-center">
                          {truncateName(investor.name, 20)}
                        </h3>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                              {(investor as any)._count?.investments ?? 0}
                            </span>{" "}
                            invested projects
                          </p>
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
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
                      d="M19 21V5a2 0 00-2-2H7a2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
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

        <HomePageClient
          initialProjects={projects}
          initialInvestors={investors}
        />
      </div>
    </>
  );
}
