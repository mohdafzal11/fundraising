
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { Section, Table } from '@/lib/types/section';


export async function POST(request: NextRequest) {
    try {
        const sectionData: Section = await request.json();

        const createdSection = await prisma.section.create({
            data: {
                title: sectionData.title,
                tableOfContent: sectionData.tableOfContent,
                description: sectionData.description,
                isTableOfContentVisible: sectionData.isTableOfContentVisible ?? true,
                tables: {
                    create: sectionData.tables.map((table: Table) => ({
                        title: table.title,
                        tableOfContent: table.tableOfContent,
                        headers: table.headers,
                        rows: table.rows,
                        isActive: table.isActive,
                        isTableOfContentVisible: table.isTableOfContentVisible ?? true,
                    })),
                },

            },
        });

        return NextResponse.json(
            { message: "Section created successfully", data: createdSection },
            { status: 201 }
        );

    } catch (error) {
        console.error("Error creating/updating Section:", error);
        return NextResponse.json(
            { message: "Failed to create/update Section", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const sectionData: Section = await request.json();

        const existingSection = await prisma.section.findFirst({
            where: {
                id: sectionData.id,
            },
        });

        if (existingSection) {
            const updatedSection = await prisma.section.update({
                where: { id: existingSection.id },
                data: {
                    title: sectionData.title,
                    tableOfContent: sectionData.tableOfContent,
                    description: sectionData.description,
                    isTableOfContentVisible: sectionData.isTableOfContentVisible ?? true,
                    updatedAt: new Date(),
                },
            });

            await prisma.table.deleteMany({
                where: { sectionId: existingSection.id }
            });

            if (sectionData.tables && sectionData.tables.length > 0) {
                await prisma.table.createMany({
                    data: sectionData.tables.map((table: Table) => ({
                        title: table.title,
                        tableOfContent: table.tableOfContent,
                        headers: table.headers,
                        rows: table.rows,
                        isActive: table.isActive,
                        isTableOfContentVisible: table.isTableOfContentVisible ?? true,
                        sectionId: existingSection.id,
                    })),
                });
            }

            return NextResponse.json(
                { message: "Section updated successfully", data: updatedSection },
                { status: 200 }
            );
        } else {
            const createdSection = await prisma.section.create({
                data: {
                    title: sectionData.title,
                    tableOfContent: sectionData.tableOfContent,
                    description: sectionData.description,
                    isTableOfContentVisible: sectionData.isTableOfContentVisible ?? true,
                    tables: {
                        create: sectionData.tables.map((table: Table) => ({
                            title: table.title,
                            tableOfContent: table.tableOfContent,
                            headers: table.headers,
                            rows: table.rows,
                            isActive: table.isActive,
                            isTableOfContentVisible: table.isTableOfContentVisible ?? true,
                        })),
                    },
                },
            });

            return NextResponse.json(
                { message: "Section created successfully", data: createdSection },
                { status: 201 }
            );
        }
    } catch (error) {
        console.error("Error updating Section:", error);
        return NextResponse.json(
            { message: "Failed to update Section", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const id = request.nextUrl.searchParams.get('id');
        const title = request.nextUrl.searchParams.get('title');
        const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
        const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');
        const search = request.nextUrl.searchParams.get('search') || '';

        if (!id && !title) {
            const skip = (page - 1) * limit;

            const where = search
                ? {
                      OR: [
                          { title: { contains: search, mode: 'insensitive' as const } },
                          { description: { contains: search, mode: 'insensitive' as const } },
                      ],
                  }
                : {};

            const [sections, totalCount] = await Promise.all([
                prisma.section.findMany({
                    where,
                    include: {
                        tables: {
                            orderBy: {
                                createdAt: 'asc',
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    skip,
                    take: limit,
                }),
                prisma.section.count({ where }),
            ]);

            const totalPages = Math.ceil(totalCount / limit);

            return NextResponse.json(
                {
                    data: sections,
                    pagination: {
                        page,
                        limit,
                        totalCount,
                        totalPages,
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1,
                    },
                },
                { status: 200 }
            );
        }

        const section = await prisma.section.findFirst({
            where: id ? { id: id } : { title: title },
            include: {
                tables: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ data: section }, { status: 200 });
    } catch (error) {
        console.error('Error fetching section:', error);
        return NextResponse.json(
            { error: 'Failed to fetch section' },
            { status: 500 }
        );
    }
}