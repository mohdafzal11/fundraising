import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { InvestorStatus, Prisma } from '@prisma/client';
import { Pagination } from '@/lib/types/projects';

export const dynamic = 'force-dynamic';

interface InvestorResponse {
  data: any;
  pagination?: Pagination;
}

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get('slug');
    const search = request.nextUrl.searchParams.get('search')?.trim();
    const pageRaw = request.nextUrl.searchParams.get('page')?.trim() || '1';
    const sizeRaw = request.nextUrl.searchParams.get('pageSize')?.trim() || '10';
    const parsedPage = parseInt(pageRaw, 10);
    const parsedSize = parseInt(sizeRaw, 10);
    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const pageSize = Number.isFinite(parsedSize) && parsedSize > 0 ? parsedSize : 10;

    if (page < 1 || pageSize < 1) {
      return NextResponse.json(
        { message: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    if (slug) {
      const investor = await prisma.investor.findFirst({
        where: { slug },
        include: {
          investments: true,
        },
      });

      if (!investor) {
        return NextResponse.json(
          { message: 'Investor not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ data: investor }, { status: 200 });
    }

    const skip = Math.max(0, (page - 1) * pageSize);
    
    // Debug logging to identify the issue
    console.log('Pagination params:', { page, pageSize, skip });

    const whereClause: Prisma.InvestorWhereInput = search
      ? {
          status: InvestorStatus.APPROVED,
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : { status: InvestorStatus.APPROVED };

    const totalCount = await prisma.investor.count({ where: whereClause });

    const investors = await prisma.investor.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        links: true,
        _count: { select: { investments: true } },
      },
      orderBy: { investments: { _count: 'desc' } },
      skip,
      take: pageSize,
    });

    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const response: InvestorResponse = {
      data: investors,
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
    console.error('Error fetching investors:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch investors',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}