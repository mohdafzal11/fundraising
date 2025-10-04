import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Project , Pagination } from '@/lib/types/projects';
import { Currency } from '@prisma/client';
import { currencyFormatter } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const project: Project = await request.json();

    if (!project.slug || !project.name) {
      return NextResponse.json(
        { message: 'Project slug and name are required' },
        { status: 400 }
      );
    }

    const existingProject = await prisma.project.findUnique({ where: { slug: project.slug } });
    if (existingProject) {
      return NextResponse.json({ message: 'Project with this slug already exists' }, { status: 409 });
    }

    if (project.rounds) {
      const investorIds = [];
      for (const round of project.rounds) {
        if (round.investments) {
          const roundInvestorIds = round.investments.map(inv => inv.investorId);
          if (new Set(roundInvestorIds).size !== roundInvestorIds.length) {
            return NextResponse.json(
              { message: `Duplicate investor IDs in round: ${round.title || 'Untitled'}` },
              { status: 400 }
            );
          }
          investorIds.push(...roundInvestorIds);
        }
      }
      const uniqueInvestorIds = Array.from(new Set(investorIds));
      const existingInvestors = await prisma.investor.findMany({
        where: { id: { in: uniqueInvestorIds } },
        select: { id: true },
      });
      const foundInvestorIds = existingInvestors.map(inv => inv.id);
      const missingInvestorIds = uniqueInvestorIds.filter(id => !foundInvestorIds.includes(id));
      if (missingInvestorIds.length > 0) {
        return NextResponse.json(
          { message: `Invalid investor IDs: ${missingInvestorIds.join(', ')}` },
          { status: 400 }
        );
      }
    }

    const createdProject = await prisma.$transaction(async (tx) => {
      const projectData = await tx.project.create({
        data: {
          ...project,
          status: project.status ?? 'DRAFT',
          rounds: project.rounds
            ? {
              create: project.rounds.map(round => ({
                title: round.title ?? null,
                description: round.description ?? null,
                date: round.date ? new Date(round.date) : null,
                amount: round.amount ?? null,
                type: round.type ?? null,
              })),
            }
            : undefined,
        },
        include: { rounds: true },
      });

      if (project.rounds) {
        for (let index = 0; index < project.rounds.length; index++) {
          const round = project.rounds[index];
          const createdRound = projectData.rounds[index];
          if (round.investments && round.investments.length > 0) {
            await tx.investment.createMany({
              data: round.investments.map(inv => ({
                roundId: createdRound.id,
                investorId: inv.investorId,
                amount: inv.amount ?? null,
                currency: currencyFormatter(inv.currency ?? Currency.USD),
                tokens: inv.tokens ?? null,
                investedAt: inv.investedAt ? new Date(inv.investedAt) : new Date(),
              })),
            });
          }
        }
      }

      return tx.project.findUnique({
        where: { id: projectData.id },
        include: { rounds: { include: { investments: { include: { investor: true } } } } },
      });
    });

    return NextResponse.json(
      { message: 'Project created successfully', data: createdProject },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      {
        message: 'Failed to create project',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const project: Project = await request.json();

    if (!project.id || !project.slug || !project.name) {
      return NextResponse.json(
        { message: 'Project ID, slug, and name are required' },
        { status: 400 }
      );
    }

    const existingProject = await prisma.project.findUnique({
      where: { id: project.id },
      include: { rounds: { include: { investments: true } } },
    });
    if (!existingProject) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    const slugConflict = await prisma.project.findFirst({
      where: { slug: project.slug, NOT: { id: project.id } },
    });
    if (slugConflict) {
      return NextResponse.json({ message: 'Slug is already in use by another project' }, { status: 409 });
    }

    if (project.rounds) {
      const investorIds = [];
      const allIncomingInvestmentIds = [];
      for (const round of project.rounds) {
        if (round.investments) {
          const roundInvestorIds = round.investments.map(inv => inv.investorId);
          if (new Set(roundInvestorIds).size !== roundInvestorIds.length) {
            return NextResponse.json(
              { message: `Duplicate investor IDs in round: ${round.title || 'Untitled'}` },
              { status: 400 }
            );
          }
          investorIds.push(...roundInvestorIds);
          if (round.id) {
            const incomingIds = round.investments.filter(inv => inv.id).map(inv => inv.id!);
            allIncomingInvestmentIds.push(...incomingIds);
          }
        }
      }

      const uniqueInvestorIds = Array.from(new Set(investorIds));
      const existingInvestors = await prisma.investor.findMany({
        where: { id: { in: uniqueInvestorIds } },
        select: { id: true },
      });
      const foundInvestorIds = existingInvestors.map(inv => inv.id);
      const missingInvestorIds = uniqueInvestorIds.filter(id => !foundInvestorIds.includes(id));
      if (missingInvestorIds.length > 0) {
        return NextResponse.json(
          { message: `Invalid investor IDs: ${missingInvestorIds.join(', ')}` },
          { status: 400 }
        );
      }

      if (allIncomingInvestmentIds.length > 0) {
        const existingInvestments = await prisma.investment.findMany({
          where: { id: { in: allIncomingInvestmentIds } },
          select: { id: true },
        });
        const foundIds = existingInvestments.map(inv => inv.id);
        const invalidIds = allIncomingInvestmentIds.filter(id => !foundIds.includes(id));
        if (invalidIds.length > 0) {
          return NextResponse.json(
            { message: `Invalid investment IDs: ${invalidIds.join(', ')}` },
            { status: 400 }
          );
        }
      }
    }

    const updatedProject = await prisma.$transaction(
      async (tx) => {
        const existingRoundIds = existingProject.rounds.map(r => r.id);
        const incomingRoundIds = project.rounds ? project.rounds.filter(r => r.id).map(r => r.id!) : [];
        const roundsToDelete = existingRoundIds.filter(id => !incomingRoundIds.includes(id));
        const roundsToUpdate = project.rounds ? project.rounds.filter(r => r.id && existingRoundIds.includes(r.id!)) : [];
        const roundsToCreate = project.rounds ? project.rounds.filter(r => !r.id) : [];

        for (const round of roundsToUpdate) {
          const existingRound = existingProject.rounds.find(r => r.id === round.id);
          if (existingRound && round.investments) {
            await tx.investment.deleteMany({ where: { roundId: round.id! } });

            if (round.investments.length > 0) {
              await tx.investment.createMany({
                data: round.investments.map(inv => ({
                  roundId: round.id!,
                  investorId: inv.investorId,
                  amount: inv.amount ?? null,
                  currency: currencyFormatter(inv.currency ?? Currency.USD),
                  tokens: inv.tokens ?? null,
                  investedAt: inv.investedAt ? new Date(inv.investedAt) : new Date(),
                  createdAt: new Date(),
                  updatedAt: new Date(),
                })),
              });
            }
          }
        }

        await tx.project.update({
          where: { id: project.id },
          data: {
            slug: project.slug,
            name: project.name,
            symbol: project.symbol ?? null,
            title: project.title ?? null,
            description: project.description ?? null,
            category: project.category ?? [],
            logo: project.logo ?? null,
            logoAltText: project.logoAltText ?? null,
            links: project.links ?? null,
            metaTitle: project.metaTitle ?? null,
            metaDescription: project.metaDescription ?? null,
            metaKeywords: project.metaKeywords ?? null,
            metaImage: project.metaImage ?? null,
            status: project.status ?? 'DRAFT',
            updatedAt: new Date(),
            rounds: {
              deleteMany: { id: { in: roundsToDelete } },
              update: roundsToUpdate.map(round => ({
                where: { id: round.id! },
                data: {
                  title: round.title ?? null,
                  description: round.description ?? null,
                  date: round.date ? new Date(round.date) : null,
                  amount: round.amount ?? null,
                  type: round.type,
                  updatedAt: new Date(),
                },
              })),
            },
          },
        });

        for (const round of roundsToCreate) {
          const createdRound = await tx.round.create({
            data: {
              title: round.title ?? null,
              description: round.description ?? null,
              date: round.date ? new Date(round.date) : null,
              amount: round.amount ?? null,
              type: round.type,
              project: { connect: { id: project.id } },
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });

          if (round.investments && round.investments.length > 0) {
            await tx.investment.createMany({
              data: round.investments.map(inv => ({
                roundId: createdRound.id,
                investorId: inv.investorId,
                amount: inv.amount ?? null,
                currency: currencyFormatter(inv.currency ?? Currency.USD),
                tokens: inv.tokens ?? null,
                investedAt: inv.investedAt ? new Date(inv.investedAt) : new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
              })),
            });
          }
        }

        return tx.project.findUnique({
          where: { id: project.id },
          include: { rounds: { include: { investments: { include: { investor: true } } } } },
        });
      },
      { timeout: 20000 } 
    );

    return NextResponse.json(
      { message: 'Project updated successfully', data: updatedProject },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      {
        message: 'Failed to update project',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'Project ID is required' },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.investment.deleteMany({ where: { round: { projectId: id } } });
      await tx.round.deleteMany({ where: { projectId: id } });
      await tx.project.delete({ where: { id } });
    });

    return NextResponse.json({ message: 'Project and associated data deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ message: 'Failed to delete project', error: 'Unknown error' }, { status: 500 });
  }
}


interface ProjectResponse {
  data: any;
  pagination?: Pagination;
}

export async function GET(request: NextRequest) {
  try {
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

    // Validate pagination parameters
    if (page < 1 || pageSize < 1) {
      return NextResponse.json(
        { message: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    if (slug) {
      if (!slug) {
        return NextResponse.json(
          { message: "Project slug is required" },
          { status: 400 }
        );
      }

      const project = await prisma.project.findFirst({
        where: { slug },
        include: {
          rounds: {
            include: {
              investments: {
                include: { investor: true },
              },
            },
          },
        },
      });

      if (!project) {
        return NextResponse.json(
          { message: "Project not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ data: project }, { status: 200 });
    }

    // Build where clause for filtering
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (categories && categories.length > 0 && !categories.includes("All")) {
      where.category = { hasSome: categories };
    }
    if (roundType && roundType !== "All") {
      where.rounds = {
        some: { type: roundType },
      };
    }
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        if (isNaN(fromDate.getTime())) {
          return NextResponse.json(
            { message: "Invalid dateFrom parameter" },
            { status: 400 }
          );
        }
        where.createdAt.gte = fromDate;
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        if (isNaN(toDate.getTime())) {
          return NextResponse.json(
            { message: "Invalid dateTo parameter" },
            { status: 400 }
          );
        }
        where.createdAt.lte = toDate;
      }
    }
    if (amountMin || amountMax) {
      where.rounds = where.rounds || { some: {} };
      where.rounds.some.amount = {};
      if (amountMin) {
        const min = parseFloat(amountMin);
        if (isNaN(min)) {
          return NextResponse.json(
            { message: "Invalid amountMin parameter" },
            { status: 400 }
          );
        }
        where.rounds.some.amount.gte = min;
      }
      if (amountMax) {
        const max = parseFloat(amountMax);
        if (isNaN(max)) {
          return NextResponse.json(
            { message: "Invalid amountMax parameter" },
            { status: 400 }
          );
        }
        where.rounds.some.amount.lte = max;
      }
    }

    // Calculate skip for pagination
    const skip = (page - 1) * pageSize;

    // Get total count for pagination metadata
    const totalCount = await prisma.project.count({ where });

    // Fetch paginated projects
    const projects = await prisma.project.findMany({
      where,
      include: {
        rounds: {
          include: {
            investments: {
              include: { investor: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const response: ProjectResponse = {
      data: projects,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    };

    return NextResponse.json(response, { status: 200 });
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