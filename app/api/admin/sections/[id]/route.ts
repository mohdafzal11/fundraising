import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const section = await prisma.section.findUnique({
      where: { id },
      include: {
        tables: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!section) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(section, { status: 200 });
  } catch (error) {
    console.error('Error fetching section:', error);
    return NextResponse.json(
      { error: 'Failed to fetch section' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const sectionData = await request.json();

    const updatedSection = await prisma.section.update({
      where: { id },
      data: {
        title: sectionData.title,
        tableOfContent: sectionData.tableOfContent,
        description: sectionData.description,
        isTableOfContentVisible: sectionData.isTableOfContentVisible ?? true,
        updatedAt: new Date(),
      },
    });

    await prisma.table.deleteMany({
      where: { sectionId: id }
    });

    if (sectionData.tables && sectionData.tables.length > 0) {
      await prisma.table.createMany({
        data: sectionData.tables.map((table: any) => ({
          title: table.title,
          tableOfContent: table.tableOfContent,
          headers: table.headers,
          rows: table.rows,
          isActive: table.isActive,
          isTableOfContentVisible: table.isTableOfContentVisible ?? true,
          sectionId: id,
        })),
      });
    }

    return NextResponse.json(
      { message: "Section updated successfully", data: updatedSection },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating section:', error);
    return NextResponse.json(
      { error: 'Failed to update section' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.table.deleteMany({
      where: { sectionId: id }
    });

    await prisma.section.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: "Section deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting section:', error);
    return NextResponse.json(
      { error: 'Failed to delete section' },
      { status: 500 }
    );
  }
} 