import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { InvestorStatus } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const investor = await prisma.investor.findFirst({
      where: {
        slug: {
          equals: slug,
          mode: 'insensitive',
        },
        status: InvestorStatus.APPROVED,
      },
    });

    if (!investor) {
      return NextResponse.json(
        { message: 'Investor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: investor }, { status: 200 });
  } catch (error) {
    console.error('Error fetching investor:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch investor',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}