import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Pagination } from "@/lib/types/projects";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProjectResponse {
  data: any;
  pagination?: Pagination;
}

export async function GET(request: NextRequest) {
  try {
    const view = request.nextUrl.searchParams.get("view")?.trim();
    const slug = request.nextUrl.searchParams.get("slug");
    const search = request.nextUrl.searchParams.get("search")?.trim();
    const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
    const pageSize = parseInt(request.nextUrl.searchParams.get("pageSize") || "5");
    const categories = request.nextUrl.searchParams.get("categories")?.split(",");
    const roundType = request.nextUrl.searchParams.get("roundType");
    const dateFrom = request.nextUrl.searchParams.get("dateFrom");
    const dateTo = request.nextUrl.searchParams.get("dateTo");
    const amountMin = request.nextUrl.searchParams.get("amountMin");
    const amountMax = request.nextUrl.searchParams.get("amountMax");

    if (page < 1 || pageSize < 1) {
      return NextResponse.json({ message: "Invalid pagination parameters" }, { status: 400 });
    }

    if (slug) {
      const project = await prisma.project.findFirst({
        where: { slug },
        include: {
          rounds: {
            include: { investments: { include: { investor: true } } },
            orderBy: { date: "desc" },
            take: 1,
          },
        },
      });

      if (!project) {
        return NextResponse.json({ message: "Project not found" }, { status: 404 });
      }

      return NextResponse.json({ data: project }, { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }

    const projectWhere: any = {};
    if (search) {
      projectWhere.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (categories && categories.length > 0 && !categories.includes("All")) {
      projectWhere.category = { hasSome: categories };
    }

    const roundWhere: any = {};
    if (roundType && roundType !== "All") {
      roundWhere.type = roundType;
    }
    if (dateFrom || dateTo) {
      roundWhere.date = {};
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        if (isNaN(fromDate.getTime())) {
          return NextResponse.json({ message: "Invalid dateFrom parameter" }, { status: 400 });
        }
        roundWhere.date.gte = fromDate;
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        if (isNaN(toDate.getTime())) {
          return NextResponse.json({ message: "Invalid dateTo parameter" }, { status: 400 });
        }
        roundWhere.date.lte = toDate;
      }
    }
    if (amountMin || amountMax) {
      roundWhere.amount = {};
      if (amountMin) {
        const min = parseFloat(amountMin);
        if (isNaN(min)) {
          return NextResponse.json({ message: "Invalid amountMin parameter" }, { status: 400 });
        }
        roundWhere.amount.gte = min;
      }
      if (amountMax) {
        const max = parseFloat(amountMax);
        if (isNaN(max)) {
          return NextResponse.json({ message: "Invalid amountMax parameter" }, { status: 400 });
        }
        roundWhere.amount.lte = max;
      }
    }

    const skip = (page - 1) * pageSize;

    // Helper: if we have project-level filters (search/categories), pre-filter by those project IDs
    let filteredProjectIds: string[] | null = null;
    if (Object.keys(projectWhere).length > 0) {
      const matchingProjects = await prisma.project.findMany({
        where: projectWhere,
        select: { id: true },
      });
      filteredProjectIds = matchingProjects.map((p) => p.id);
      // Attach to round where to align pagination on rounds/projects queries
      if (filteredProjectIds.length > 0) {
        roundWhere.projectId = { in: filteredProjectIds };
      } else {
        // No matches; early return
        const empty: ProjectResponse = {
          data: [],
          pagination: {
            page,
            pageSize,
            totalCount: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: page > 1,
          },
        };
        return NextResponse.json(empty, { status: 200 });
      }
    }

    // Rounds view: paginate individual rounds (for VC deal flow)
    if (view === 'rounds') {
      const roundsWhere = {
        ...roundWhere,
        ...(Object.keys(projectWhere).length > 0
          ? { project: { is: projectWhere } }
          : {}),
      } as any;

      const [rounds, totalCount] = await Promise.all([
        prisma.round.findMany({
          where: roundsWhere,
          orderBy: [
            { date: 'desc' },
            { createdAt: 'desc' }
          ],
          skip,
          take: pageSize,
          include: {
            investments: { include: { investor: true } },
            project: true,
          },
        }),
        prisma.round.count({ where: roundsWhere }),
      ]);

      // Shape result like a list of projects each with a single round for compatibility with client
      const items = rounds.map((r) => {
        const project = r.project || { id: 'unknown', slug: 'unknown', name: 'Unknown Project' } as any;
        return {
          ...project,
          rounds: [
            {
              id: r.id,
              title: r.title,
              description: r.description,
              date: r.date,
              amount: r.amount,
              type: r.type,
              createdAt: r.createdAt,
              updatedAt: r.updatedAt,
              investments: r.investments,
            },
          ],
        };
      });

      const totalPages = Math.ceil(totalCount / pageSize) || 1;
      const response: ProjectResponse = {
        data: items,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };

      return NextResponse.json(response, { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }

    const latestRounds = await prisma.round.groupBy({
      by: ["projectId"],
      where: roundWhere,
      _max: { date: true, createdAt: true },
      orderBy: [
        { _max: { date: "desc" } },
        { _max: { createdAt: "desc" } }
      ],
      skip,
      take: pageSize,
    });

    const projectIds = latestRounds.map(r => r.projectId);

    const projects = await prisma.project.findMany({
      where: { 
        ...projectWhere, 
        id: { in: projectIds } 
      },
      include: {
        rounds: {
          where: roundWhere, 
          include: { investments: { include: { investor: true } } },
          orderBy: [
            { date: "desc" },
            { createdAt: "desc" }
          ],
          take: 1,
        },
      },
    });

    const orderedProjects = projectIds.map(id => 
      projects.find(p => p.id === id)
    ).filter(Boolean); 

    let totalCount;
    const hasRoundFilters = Object.keys(roundWhere).length > 0;
    if (hasRoundFilters) {
      const allLatestRoundDates = await prisma.round.groupBy({
        by: ["projectId"],
        where: roundWhere,
        _max: { date: true },
      });
      totalCount = allLatestRoundDates.length;
    } else if (filteredProjectIds) {
      totalCount = filteredProjectIds.length;
    } else {
      totalCount = await prisma.project.count({ where: projectWhere });
    }

    const totalPages = Math.ceil(totalCount / pageSize);

    const response: ProjectResponse = {
      data: orderedProjects,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };

    return NextResponse.json(response, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch projects",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}