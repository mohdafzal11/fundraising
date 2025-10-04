import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateTableID } from "@/lib/utils";
import { renderSectionHTML, renderTableAsHTML, renderHeading, renderDescription, renderList } from '@/lib/sectionHtmlTemplates';

// Force this route to be dynamic since it uses searchParams
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const id = request.nextUrl.searchParams.get('id');
        const title = request.nextUrl.searchParams.get('title');

        if (!id && !title) {
            const sections = await prisma.section.findMany({
                where: {
                    isActive: true
                },
                include: {
                    tables: {
                        where: {
                            isActive: true
                        },
                        orderBy: {
                            createdAt: 'asc',
                        },
                    },
                },
                orderBy: {
                    createdAt: 'asc',
                },
            });

            const processedSections: any[] = [];
            sections.forEach((section, sectionIdx) => {
                const cleanDescription = removeWhiteSpaceSpan(sanitizeHtmlContent(section.description || ''));
                const tablesWithIds = (section.tables || []).map((table, idx) => ({
                    ...table,
                    rows: (table.rows || []).map((row: any) =>
                        row.map((cell: any) => typeof cell === 'string' ? removeWhiteSpaceSpan(sanitizeHtmlContent(cell)) : cell)
                    ),
                    id: generateTableID((section.title || ''), idx+1),
                    tableOfContent: table.tableOfContent || table.title || '',
                }));
                const processedDescription = injectTablesIntoDescription(cleanDescription, tablesWithIds, sectionIdx);
                const usedTableIds = getTableIdsInDescription(section.description || '');
                const tablesToReturn = tablesWithIds.filter(t => !usedTableIds.has(t.id));
                processedSections.push({
                    ...section,
                    description: processedDescription,
                    tables: tablesToReturn,
                    html: renderSectionHTML({
                        title: section.title || '',
                        description: processedDescription,
                        tables: tablesToReturn
                    })
                });
            });
            return NextResponse.json({ 
                data: processedSections,
            }, { status: 200 });
        }

        const section = await prisma.section.findFirst({
            where: id ? { id: id } : { title: title },
            include: {
                tables: {
                    where: {
                        isActive: true
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
        });

        if (section) {
            const cleanDescription = removeWhiteSpaceSpan(sanitizeHtmlContent(section.description || ''));
            const tablesWithIds = (section.tables || []).map((table, idx) => ({
                ...table,
                rows: (table.rows || []).map((row: any) =>
                    row.map((cell: any) => typeof cell === 'string' ? removeWhiteSpaceSpan(sanitizeHtmlContent(cell)) : cell)
                ),
                id: generateTableID((section.title || ''), idx+1),
                tableOfContent: table.tableOfContent || table.title || '',
            }));
            const processedDescription = injectTablesIntoDescription(cleanDescription, tablesWithIds, 0);
            const usedTableIds = getTableIdsInDescription(section.description || '');
            const tablesToReturn = tablesWithIds.filter(t => !usedTableIds.has(t.id));
            return NextResponse.json({ 
                data: {
                    ...section,
                    description: processedDescription,
                    tables: tablesToReturn,
                    html: renderSectionHTML({
                        title: section.title || '',
                        description: processedDescription,
                        tables: tablesToReturn
                    })
                }
            }, { status: 200 });
        }
        
        return NextResponse.json({ data: null }, { status: 200 });
    } catch (error) {
        console.error('Error fetching section:', error);
        return NextResponse.json(
            { error: 'Failed to fetch section' },
            { status: 500 }
        );
    }
}

function getTableAnchor(table: any, sectionIdx: number, tableIdx: number): string {
    return `${table.id || `table-${sectionIdx}-${tableIdx}`}`;
}

function injectTablesIntoDescription(description: string, tables: any[], sectionIdx: number): string {
    if (!description) return '';
    return description.replace(/\{\{([a-zA-Z0-9_-]+)\}\}/g, (match: any, tableId: string) => {
        const tableIdx = tables.findIndex((t: any) => t.id === tableId);
        const table = tables[tableIdx];
        return table ? renderTableAsHTML(table, sectionIdx, tableIdx) : match;
    });
}

function getTableIdsInDescription(description: string): Set<string> {
    const ids = new Set<string>();
    if (!description) return ids;
    const regex = /\{\{([a-zA-Z0-9_-]+)\}\}/g;
    let match;
    while ((match = regex.exec(description)) !== null) {
        ids.add(match[1]);
    }
    return ids;
}

function cleanHtmlStyles(html: string): string {
  let cleaned = html.replace(/style="[^"]*"/gi, (styleMatch) => {
    let newStyle = styleMatch
      .replace(/color:[^;\"]*;?/gi, '')
      .replace(/font-family:[^;\"]*;?/gi, '')
      .replace(/font-size:[^;\"]*;?/gi, '');
    return newStyle === 'style=""' ? '' : newStyle;
  });
  cleaned = cleaned.replace(/<font[^>]*>/gi, '');
  cleaned = cleaned.replace(/<\/font>/gi, '');
  return cleaned;
}

function cleanTableTags(html: string): string {
  return html
    .replace(/<(table|tr|th|td)([^>]*)>/gi, (match, tag, attrs) => {
      let cleaned = attrs
        .replace(/\s*style="[^"]*"/gi, '')
        .replace(/\s*class="[^"]*"/gi, '');
      return `<${tag}${cleaned}>`;
    });
}

function sanitizeHtmlContent(html: string): string {
  return cleanTableTags(cleanHtmlStyles(html));
}

function removeWhiteSpaceSpan(html: string): string {
  return html.replace(/<span[^>]*white-space[^>]*>([\s\S]*?)<\/span>/gi, '$1');
}