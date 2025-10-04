import { prisma} from '@/lib/prisma';
import path from 'path';
import { promises as fs } from "fs";
import { slugify } from '@/lib/utils';
import { InvestorStatus } from '@prisma/client';
import { getInvestorType , getLinks } from '@/lib/utils';

async function addOrUpdateInvestors() {
  try {
    console.log('🔄 Starting investor data update from JSON file...');

    const filePath = path.join(process.cwd(), 'data', 'crypto_investors.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const investors = JSON.parse(fileContent).reverse();

    console.log(`✅ Read ${investors.length} investors from JSON file`);

    let updatedCount = 0;
    let createdCount = 0;

    for (const investor of investors) {
      try {
        console.log(`🔄 Processing investor: ${investor.fund_name}`);

        const baseSlug = slugify(investor.fund_name);
        let slug = baseSlug;
        let attempt = 0;
        while (true) {
          const existingBySlug = await prisma.investor.findUnique({ where: { slug } });
          const existingByName = await prisma.investor.findFirst({ where: { name: investor.fund_name } });
          if (!existingBySlug && !existingByName) break;
          attempt += 1;
          slug = `${baseSlug}-${attempt}`;
          if (attempt > 50) break;
        }

        // Check if investor already exists
        const existingInvestor = await prisma.investor.findFirst({
          where: { OR: [{ slug }, { name: investor.fund_name }] },
          include: { investments: true }
        });

        // Prepare investor data
        const investorData = {
          slug,
          name: investor.fund_name,
          logo: investor.logo_img,
          logoAltText: investor.fund_name,
          createdAt: new Date(),
          updatedAt: new Date(),
          links : getLinks(investor.social_links),
          status: InvestorStatus.APPROVED,
          metaTitle: `${investor.fund_name}`,
          metaDescription: `Information about ${investor.fund_name} crypto investor.`,
          metaImage: investor.logo_img,
          type : getInvestorType(investor.fund_name),
        };

        // Create or update investor
        if (existingInvestor) {
          await prisma.investor.update({
            where: { id: existingInvestor.id },
            data: {
              ...investorData,
              updatedAt: new Date(),
            },
          });
          updatedCount++;
          console.log(`✅ Updated investor: ${investor.fund_name}`);
        } else {
          await prisma.investor.create({
            data: investorData,
          });
          createdCount++;
          console.log(`✅ ${createdCount} Created investor: ${investor.fund_name}`);
        }

      } catch (investorError) {
        console.error(`❌ Error processing investor ${investor.fund_name}:`, investorError);
        console.error('Investor data:', JSON.stringify(investor, null, 2));
      }
    }

    console.log(`✅ Investor update completed: ${createdCount} created, ${updatedCount} updated`);
  } catch (error) {
    console.error('❌ Error updating investors:', error);
    throw error;
  }
}

async function runUpdate() {
  await addOrUpdateInvestors();
}

runUpdate()


// npx tsx scripts/crypto_investors.ts