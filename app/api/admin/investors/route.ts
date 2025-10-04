import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Investor, Pagination } from '@/lib/types/projects';
import { slugify } from '@/lib/utils';

export async function POST(request: NextRequest) {
    try {
        const investor: Investor = await request.json();

        if (!investor.name) {
            return NextResponse.json(
                { message: 'Investor name is required' },
                { status: 400 }
            );
        }

        const existingInvestor = await prisma.investor.findFirst({
            where: { name: investor.name },
        });

        if (existingInvestor) {
            const updatedInvestor = await prisma.investor.update({
                where: { id: existingInvestor.id },
                data: {
                    name: investor.name,
                    slug: investor.slug || slugify(investor.name),
                    description: investor.description || null,
                    links: investor.links || null,
                    type : investor.type || null,
                    status: investor.status || null,
                    logo: investor.logo || null,
                    logoAltText: investor.logoAltText || null,
                    metaTitle: investor.metaTitle || null,
                    metaDescription: investor.metaDescription || null,
                    metaKeywords: investor.metaKeywords || null,
                    metaImage: investor.metaImage || null,
                    updatedAt: new Date(),
                },
            });

            return NextResponse.json(
                { message: 'Investor updated successfully', data: updatedInvestor },
                { status: 200 }
            );
        } else {
            const createdInvestor = await prisma.investor.create({
                data: {
                    name: investor.name,
                    slug: investor.slug || slugify(investor.name),
                    description: investor.description || null,
                    links: investor.links || null,
                    type : investor.type || null,
                    status: investor.status || null,
                    metaTitle: investor.metaTitle || null,
                    metaDescription: investor.metaDescription || null,
                    metaKeywords: investor.metaKeywords || null,
                    metaImage: investor.metaImage || null,
                    logo: investor.logo || null,
                    logoAltText: investor.logoAltText || null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });

            return NextResponse.json(
                { message: 'Investor created successfully', data: createdInvestor },
                { status: 201 }
            );
        }
    } catch (error) {
        console.error('Error creating/updating investor:', error);
        return NextResponse.json(
            {
                message: 'Failed to create/update investor',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const investor: Investor = await request.json();

        if (!investor.id) {
            return NextResponse.json(
                { message: 'Investor ID is required' },
                { status: 400 }
            );
        }
        if (!investor.name) {
            return NextResponse.json(
                { message: 'Investor name is required' },
                { status: 400 }
            );
        }

        const existingInvestor = await prisma.investor.findUnique({
            where: { id: investor.id },
        });

        if (!existingInvestor) {
            return NextResponse.json(
                { message: 'Investor not found' },
                { status: 404 }
            );
        }

        const updatedInvestor = await prisma.investor.update({
            where: { id: investor.id },
            data: {
                name: investor.name,
                slug: investor.slug || slugify(investor.name),
                description: investor.description || null,
                links: investor.links || null,
                type : investor.type || null,
                status: investor.status || null,
                metaTitle: investor.metaTitle || null,
                metaDescription: investor.metaDescription || null,
                metaKeywords: investor.metaKeywords || null,
                metaImage: investor.metaImage || null,
                logo: investor.logo || null,
                logoAltText: investor.logoAltText || null,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json(
            { message: 'Investor updated successfully', data: updatedInvestor },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating investor:', error);
        return NextResponse.json(
            {
                message: 'Failed to update investor',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const slug = request.nextUrl.searchParams.get('slug');
        if (!slug) {
            return NextResponse.json(
                { message: 'Investor ID is required' },
                { status: 400 }
            );
        }

        const investor = await prisma.investor.findUnique({
            where: { slug },
        });

        if (!investor) {
            return NextResponse.json(
                { message: 'Investor not found' },
                { status: 404 }
            );
        }

        await prisma.investor.delete({
            where: { slug },
        });

        return NextResponse.json(
            { message: 'Investor deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting investor:', error);
        return NextResponse.json(
            {
                message: 'Failed to delete investor',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

interface InvestorResponse {
    data: any;
    pagination?: Pagination;
}

export async function GET(request: NextRequest) {
    try {
        const slug = request.nextUrl.searchParams.get('slug');
        const search = request.nextUrl.searchParams.get('search')?.trim();
        const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
        const pageSize = parseInt(request.nextUrl.searchParams.get('pageSize') || '10');

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
                    investments: true
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

        const skip = (page - 1) * pageSize;

        const totalCount = await prisma.investor.count({
            where: search
                ? {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } },
                    ],
                }
                : {},
        });

        const investors = await prisma.investor.findMany({
            where: search
                ? {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } },
                    ],
                }
                : {},
            include: {
                investments: true
            },
            orderBy: { createdAt: 'desc' },
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
