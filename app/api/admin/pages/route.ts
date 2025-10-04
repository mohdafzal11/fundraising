import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const pages = await prisma.page.findMany({
            include: {
                contents: {
                    orderBy: {
                        order: 'asc',
                    },
                },
                faqs: {
                    orderBy: {
                        order: 'asc',
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        return NextResponse.json({ data: pages  }, { status: 200 });
    } catch (error) {
        console.error('Error fetching pages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch pages' },
            { status: 500 }
        );
    }
}
