import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Project } from '@prisma/client';
import { Pagination } from '@/lib/types/projects';

interface ProjectResponse {
  data: Project[];
  pagination?: Pagination;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  try {
    if (!slug) {
      return NextResponse.json(
        { message: 'Investor slug is required' },
        { status: 400 }
      );
    }

    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const pageSize = parseInt(request.nextUrl.searchParams.get('pageSize') || '5');

    if (page < 1 || pageSize < 1) {
      return NextResponse.json(
        { message: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * pageSize;

    // 1. Group rounds by project, filtered by investor, sorted by latest date
    const latestRounds = await prisma.round.groupBy({
      by: ['projectId'],
      where: {
        investments: {
          some: {
            investor: { slug },
          },
        },
      },
      _max: { date: true },
      orderBy: { _max: { date: 'desc' } },
      skip,
      take: pageSize,
    });

    const projectIds = latestRounds.map((r) => r.projectId);

    if (projectIds.length === 0) {
      return NextResponse.json({
        data: [],
        pagination: {
          page,
          pageSize,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    }

    // 2. Fetch projects with their latest round included
    const projects = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      include: {
        rounds: {
          include: {
            investments: { include: { investor: true } },
          },
          orderBy: { date: 'desc' },
          take: 1, // only latest round
        },
      },
    });

    // 3. Reorder projects to match latest round order
    const orderedProjects = projectIds.map(
      (id) => projects.find((p) => p.id === id)!
    );

    // 4. Count total distinct projects for this investor
    const totalCountResult = await prisma.round.groupBy({
      by: ['projectId'],
      where: {
        investments: {
          some: {
            investor: { slug },
          },
        },
      },
      _max: { date: true },
    });

    const totalCount = totalCountResult.length;
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

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch projects',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
