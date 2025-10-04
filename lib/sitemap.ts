import { prisma } from './prisma';
import { ProjectStatus } from '@prisma/client';

const CHUNK_SIZE = 200;

export async function generatProjectSitemaps() {
  const projects = await prisma.project.findMany({
    where: {
      status: ProjectStatus.APPROVED
    },
    select: {
      slug: true,
      updatedAt: true
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  const totalChunks = Math.ceil(projects.length / CHUNK_SIZE);
  const sitemaps = [];

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = start + CHUNK_SIZE;
    const chunk = projects.slice(start, end);

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${chunk.map(project => `  <url>
    <loc>${process.env.NEXT_PUBLIC_BASE_URL}/${project.slug}</loc>
    <lastmod>${project.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

    sitemaps.push({
      index: i + 1,
      content: sitemap
    });
  }

  return sitemaps;
}

export function generateSitemapIndex(sitemaps: { index: number }[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sitemap => `  <sitemap>
    <loc>${process.env.NEXT_PUBLIC_BASE_URL}/sitemap/${sitemap.index}.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;
}