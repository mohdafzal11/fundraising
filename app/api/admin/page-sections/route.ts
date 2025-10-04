import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { Page, Content, FAQ } from '@/lib/types/page';


export async function POST(request: NextRequest) {
    try {
        const pageData: Page = await request.json();

        const existingPage = await prisma.page.findFirst({
            where: {
                path: pageData.path,
            },
        });

        if (existingPage) {
            const updatedPage = await prisma.page.update({
                where: { id: existingPage.id },
                data: {
                    title: pageData.title,
                    content: pageData.content,
                    updatedAt: new Date(),
                },
            });

            await prisma.pageContent.deleteMany({
                where: { pageId: existingPage.id }
            });
            await prisma.pageFAQ.deleteMany({
                where: { pageId: existingPage.id }
            });

            if (pageData.contents && pageData.contents.length > 0) {
                await prisma.pageContent.createMany({
                    data: pageData.contents.map((content: Content) => ({
                        title: content.title,
                        content: content.content,
                        order: content.order,
                        isActive: content.isActive,
                        pageId: existingPage.id,
                    })),
                });
            }

            if (pageData.faqs && pageData.faqs.length > 0) {
                await prisma.pageFAQ.createMany({
                    data: pageData.faqs.map((faq: FAQ) => ({
                        question: faq.question,
                        answer: faq.answer,
                        order: faq.order,
                        isActive: faq.isActive,
                        pageId: existingPage.id,
                    })),
                });
            }

            return NextResponse.json(
                { message: "Page updated successfully", data: updatedPage },
                { status: 200 }
            );
        } else {
            const createdPage = await prisma.page.create({
                data: {
                    title: pageData.title,
                    content: pageData.content,
                    path: pageData.path,
                    faqs: {
                        create: pageData.faqs.map((faq: FAQ) => ({
                            question: faq.question,
                            answer: faq.answer,
                            order: faq.order,
                            isActive: faq.isActive,
                        })),
                    },
                    contents: {
                        create: pageData.contents.map((content: Content) => ({
                            title: content.title,
                            content: content.content,
                            order: content.order,
                            isActive: content.isActive,
                        })),
                    },
                },
            });

            return NextResponse.json(
                { message: "Page created successfully", data: createdPage },
                { status: 201 }
            );
        }
    } catch (error) {
        console.error("Error creating/updating Page:", error);
        return NextResponse.json(
            { message: "Failed to create/update Page", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const pageData: Page = await request.json();

        const existingPage = await prisma.page.findFirst({
            where: {
                path: pageData.path,
            },
        });

        if (existingPage) {
            const updatedPage = await prisma.page.update({
                where: { id: existingPage.id },
                data: {
                    title: pageData.title,
                    content: pageData.content,
                    updatedAt: new Date(),
                },
            });

            await prisma.pageContent.deleteMany({
                where: { pageId: existingPage.id }
            });
            await prisma.pageFAQ.deleteMany({
                where: { pageId: existingPage.id }
            });

            if (pageData.contents && pageData.contents.length > 0) {
                await prisma.pageContent.createMany({
                    data: pageData.contents.map((content: Content) => ({
                        title: content.title,
                        content: content.content,
                        order: content.order,
                        isActive: content.isActive,
                        pageId: existingPage.id,
                    })),
                });
            }

            if (pageData.faqs && pageData.faqs.length > 0) {
                await prisma.pageFAQ.createMany({
                    data: pageData.faqs.map((faq: FAQ) => ({
                        question: faq.question,
                        answer: faq.answer,
                        order: faq.order,
                        isActive: faq.isActive,
                        pageId: existingPage.id,
                    })),
                });
            }

            return NextResponse.json(
                { message: "Page updated successfully", data: updatedPage },
                { status: 200 }
            );
        } else {
            const createdPage = await prisma.page.create({
                data: {
                    title: pageData.title,
                    content: pageData.content,
                    path: pageData.path,
                    faqs: {
                        create: pageData.faqs.map((faq: FAQ) => ({
                            question: faq.question,
                            answer: faq.answer,
                            order: faq.order,
                            isActive: faq.isActive,
                        })),
                    },
                    contents: {
                        create: pageData.contents.map((content: Content) => ({
                            title: content.title,
                            content: content.content,
                            order: content.order,
                            isActive: content.isActive,
                        })),
                    },
                },
            });

            return NextResponse.json(
                { message: "Page created successfully", data: createdPage },
                { status: 201 }
            );
        }
    } catch (error) {
        console.error("Error updating Page:", error);
        return NextResponse.json(
            { message: "Failed to update Page", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {

        const path = request.nextUrl.searchParams.get('path');

        if (!path) {
            return NextResponse.json({ error: 'Path is required' }, { status: 400 });
        }

        const page = await prisma.page.findFirst({
            where: {
                path: path,
            },
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
        });

        return NextResponse.json({ data: page }, { status: 200 });
    } catch (error) {
        console.error('Error fetching page:', error);
        return NextResponse.json(
            { error: 'Failed to fetch page' },
            { status: 500 }
        );
    }
}