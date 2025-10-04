import { PrismaClient as MongoClient } from './node_modules/.prisma/client/mongodb/index.js'
import { PrismaClient as PostgresClient } from './node_modules/.prisma/client/postgres/index.js'

// Initialize Prisma clients
const mongoClient = new MongoClient({
  datasources: {
    db: {
      url: process.env.MONGODB_URL
    }
  }
})

const postgresClient = new PostgresClient({
  datasources: {
    db: {
      url: process.env.POSTGRES_URL
    }
  }
})

// Helper function to log progress
const log = (message) => {
  console.log(`[${new Date().toISOString()}] ${message}`)
}

// Helper function to log progress with percentage
const logProgress = (message, current, total) => {
  const percentage = total > 0 ? ((current / total) * 100).toFixed(1) : 0
  console.log(`[${new Date().toISOString()}] ${message} (${current}/${total} - ${percentage}%)`)
}

// Helper function to handle errors
const handleError = (error, context) => {
  console.error(`[ERROR] ${context}:`, error)
  throw error
}

// Retry function for database operations
const retryOperation = async (operation, maxRetries = 3, delay = 5000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      if (attempt === maxRetries) {
        throw error
      }
      log(`Attempt ${attempt} failed, retrying in ${delay/1000}s... Error: ${error.message}`)
      await new Promise(resolve => setTimeout(resolve, delay))
      // Exponential backoff
      delay *= 2
    }
  }
}

// Check if migration step is already completed
const checkMigrationStatus = async () => {
  try {
    const counts = {
      projects: await postgresClient.project.count(),
      investors: await postgresClient.investor.count(),
      rounds: await postgresClient.round.count(),
      investments: await postgresClient.investment.count(),
      pages: await postgresClient.page.count(),
      pageContents: await postgresClient.pageContent.count(),
      pageFAQs: await postgresClient.pageFAQ.count(),
      sections: await postgresClient.section.count(),
      tables: await postgresClient.table.count(),
    }
    
    log('Current PostgreSQL counts:')
    console.table(counts)
    return counts
  } catch (error) {
    log('Could not check migration status, starting fresh migration')
    return null
  }
}

// Migration functions for each model
async function migrateProjects(skipIfExists = true) {
  try {
    log('Starting Project migration...')
    
    // Check if projects already exist
    if (skipIfExists) {
      const existingCount = await postgresClient.project.count()
      if (existingCount > 0) {
        log(`⏭️  Skipping Project migration - ${existingCount} projects already exist`)
        return []
      }
    }
    
    const mongoProjects = await retryOperation(async () => {
      return await mongoClient.project.findMany({
        include: {
          rounds: {
            include: {
              investments: {
                include: {
                  investor: true
                }
              }
            }
          }
        }
      })
    })
    
    log(`Found ${mongoProjects.length} projects in MongoDB`)
    
    for (let i = 0; i < mongoProjects.length; i++) {
      const project = mongoProjects[i]
      
      try {
        // Create project without rounds first
        const { rounds, ...projectData } = project
        
        await retryOperation(async () => {
          return await postgresClient.project.upsert({
            where: { slug: project.slug },
            update: projectData,
            create: {
              ...projectData,
              id: project.id, // Preserve the original ID
            }
          })
        })
        
        if ((i + 1) % 100 === 0 || i === mongoProjects.length - 1) {
          logProgress('Migrated projects', i + 1, mongoProjects.length)
        }
      } catch (error) {
        log(`❌ Failed to migrate project ${project.slug}: ${error.message}`)
        throw error
      }
    }
    
    log(`✅ Migrated ${mongoProjects.length} projects`)
    return mongoProjects
  } catch (error) {
    handleError(error, 'Project migration')
  }
}

async function migrateInvestors(skipIfExists = true) {
  try {
    log('Starting Investor migration...')
    
    // Always check counts to ensure complete migration
    const existingCount = await postgresClient.investor.count()
    const mongoCount = await retryOperation(async () => {
      return await mongoClient.investor.count()
    })
    
    if (skipIfExists && existingCount === mongoCount) {
      log(`⏭️  Skipping Investor migration - all ${existingCount} investors already exist`)
      return []
    } else if (existingCount > 0 && existingCount < mongoCount) {
      log(`⚠️  Partial migration detected: ${existingCount}/${mongoCount} investors migrated. Continuing...`)
    }
    
    // Get existing investor IDs to avoid duplicates
    const existingInvestors = await postgresClient.investor.findMany({
      select: { id: true }
    })
    const existingIds = new Set(existingInvestors.map(inv => inv.id))
    
    const mongoInvestors = await retryOperation(async () => {
      return await mongoClient.investor.findMany()
    })
    
    // Filter out already migrated investors
    const investorsToMigrate = mongoInvestors.filter(inv => !existingIds.has(inv.id))
    
    log(`Found ${mongoInvestors.length} investors in MongoDB, ${investorsToMigrate.length} need migration`)
    
    if (investorsToMigrate.length === 0) {
      log(`✅ All investors already migrated`)
      return mongoInvestors
    }
    
    for (let i = 0; i < investorsToMigrate.length; i++) {
      const investor = investorsToMigrate[i]
      
      try {
        await retryOperation(async () => {
          return await postgresClient.investor.upsert({
            where: { slug: investor.slug },
            update: investor,
            create: {
              ...investor,
              id: investor.id, // Preserve the original MongoDB ObjectId
            }
          })
        })
        
        if ((i + 1) % 100 === 0 || i === investorsToMigrate.length - 1) {
          logProgress('Migrated investors', i + 1, investorsToMigrate.length)
        }
      } catch (error) {
        log(`❌ Failed to migrate investor ${investor.slug}: ${error.message}`)
        throw error
      }
    }
    
    log(`✅ Migrated ${mongoInvestors.length} investors`)
    return mongoInvestors
  } catch (error) {
    handleError(error, 'Investor migration')
  }
}

async function migrateRounds(skipIfExists = true) {
  try {
    log('Starting Round migration...')
    
    // Check if rounds already exist
    if (skipIfExists) {
      const existingCount = await postgresClient.round.count()
      if (existingCount > 0) {
        log(`⏭️  Skipping Round migration - ${existingCount} rounds already exist`)
        return []
      }
    }
    
    const mongoRounds = await retryOperation(async () => {
      return await mongoClient.round.findMany({
        include: {
          project: true,
          investments: true
        }
      })
    })
    
    log(`Found ${mongoRounds.length} rounds in MongoDB`)
    
    for (let i = 0; i < mongoRounds.length; i++) {
      const round = mongoRounds[i]
      
      try {
        // Create round without investments first
        const { investments, project, ...roundData } = round
        
        await retryOperation(async () => {
          return await postgresClient.round.upsert({
            where: { id: round.id },
            update: roundData,
            create: {
              ...roundData,
              id: round.id, // Preserve the original ID
            }
          })
        })
        
        if ((i + 1) % 100 === 0 || i === mongoRounds.length - 1) {
          logProgress('Migrated rounds', i + 1, mongoRounds.length)
        }
      } catch (error) {
        log(`❌ Failed to migrate round ${round.id}: ${error.message}`)
        throw error
      }
    }
    
    log(`✅ Migrated ${mongoRounds.length} rounds`)
    return mongoRounds
  } catch (error) {
    handleError(error, 'Round migration')
  }
}

async function migrateInvestments(skipIfExists = true) {
  try {
    log('Starting Investment migration...')
    
    // Always check counts to ensure complete migration
    const existingCount = await postgresClient.investment.count()
    const mongoCount = await retryOperation(async () => {
      return await mongoClient.investment.count()
    })
    
    if (skipIfExists && existingCount === mongoCount) {
      log(`⏭️  Skipping Investment migration - all ${existingCount} investments already exist`)
      return []
    } else if (existingCount > 0 && existingCount < mongoCount) {
      log(`⚠️  Partial migration detected: ${existingCount}/${mongoCount} investments migrated. Continuing...`)
    }
    
    // Get existing investment IDs to avoid duplicates
    const existingInvestments = await postgresClient.investment.findMany({
      select: { id: true }
    })
    const existingIds = new Set(existingInvestments.map(inv => inv.id))
    
    // Get existing round and investor IDs for validation
    const existingRounds = await postgresClient.round.findMany({
      select: { id: true }
    })
    const existingInvestorsInPG = await postgresClient.investor.findMany({
      select: { id: true }
    })
    const validRoundIds = new Set(existingRounds.map(r => r.id))
    const validInvestorIds = new Set(existingInvestorsInPG.map(inv => inv.id))
    
    const mongoInvestments = await retryOperation(async () => {
      return await mongoClient.investment.findMany({
        include: {
          round: true,
          investor: true
        }
      })
    })
    
    // Filter out already migrated investments and validate foreign keys
    const investmentsToMigrate = mongoInvestments.filter(inv => {
      if (existingIds.has(inv.id)) return false
      if (!validRoundIds.has(inv.roundId)) {
        log(`⚠️  Skipping investment ${inv.id}: round ${inv.roundId} not found in PostgreSQL`)
        return false
      }
      if (!validInvestorIds.has(inv.investorId)) {
        log(`⚠️  Skipping investment ${inv.id}: investor ${inv.investorId} not found in PostgreSQL`)
        return false
      }
      return true
    })
    
    log(`Found ${mongoInvestments.length} investments in MongoDB, ${investmentsToMigrate.length} need migration`)
    
    if (investmentsToMigrate.length === 0) {
      log(`✅ All valid investments already migrated`)
      return mongoInvestments
    }
    
    for (let i = 0; i < investmentsToMigrate.length; i++) {
      const investment = investmentsToMigrate[i]
      
      try {
        const { round, investor, ...investmentData } = investment
        
        await retryOperation(async () => {
          return await postgresClient.investment.upsert({
            where: { 
              roundId_investorId: {
                roundId: investment.roundId,
                investorId: investment.investorId
              }
            },
            update: investmentData,
            create: {
              ...investmentData,
              id: investment.id, // Preserve the original MongoDB ObjectId
            }
          })
        })
        
        if ((i + 1) % 100 === 0 || i === investmentsToMigrate.length - 1) {
          logProgress('Migrated investments', i + 1, investmentsToMigrate.length)
        }
      } catch (error) {
        log(`❌ Failed to migrate investment ${investment.id}: ${error.message}`)
        throw error
      }
    }
    
    log(`✅ Migrated ${mongoInvestments.length} investments`)
  } catch (error) {
    handleError(error, 'Investment migration')
  }
}

async function migratePages(skipIfExists = true) {
  try {
    log('Starting Page migration...')
    
    if (skipIfExists) {
      const existingCount = await postgresClient.page.count()
      if (existingCount > 0) {
        log(`⏭️  Skipping Page migration - ${existingCount} pages already exist`)
        return []
      }
    }
    
    const mongoPages = await retryOperation(async () => {
      return await mongoClient.page.findMany({
        include: {
          contents: true,
          faqs: true
        }
      })
    })
    
    log(`Found ${mongoPages.length} pages in MongoDB`)
    
    for (let i = 0; i < mongoPages.length; i++) {
      const page = mongoPages[i]
      
      try {
        // Create page without relations first
        const { contents, faqs, ...pageData } = page
        
        await retryOperation(async () => {
          return await postgresClient.page.upsert({
            where: { path: page.path },
            update: pageData,
            create: {
              ...pageData,
              id: page.id, // Preserve the original ID
            }
          })
        })
        
        if ((i + 1) % 10 === 0 || i === mongoPages.length - 1) {
          logProgress('Migrated pages', i + 1, mongoPages.length)
        }
      } catch (error) {
        log(`❌ Failed to migrate page ${page.path}: ${error.message}`)
        throw error
      }
    }
    
    log(`✅ Migrated ${mongoPages.length} pages`)
    return mongoPages
  } catch (error) {
    handleError(error, 'Page migration')
  }
}

async function migratePageContents(skipIfExists = true) {
  try {
    log('Starting PageContent migration...')
    
    if (skipIfExists) {
      const existingCount = await postgresClient.pageContent.count()
      if (existingCount > 0) {
        log(`⏭️  Skipping PageContent migration - ${existingCount} page contents already exist`)
        return []
      }
    }
    
    const mongoPageContents = await retryOperation(async () => {
      return await mongoClient.pageContent.findMany({
        include: {
          page: true
        }
      })
    })
    
    log(`Found ${mongoPageContents.length} page contents in MongoDB`)
    
    for (let i = 0; i < mongoPageContents.length; i++) {
      const content = mongoPageContents[i]
      
      try {
        const { page, ...contentData } = content
        
        await retryOperation(async () => {
          return await postgresClient.pageContent.upsert({
            where: { id: content.id },
            update: contentData,
            create: {
              ...contentData,
              id: content.id, // Preserve the original ID
            }
          })
        })
        
        if ((i + 1) % 10 === 0 || i === mongoPageContents.length - 1) {
          logProgress('Migrated page contents', i + 1, mongoPageContents.length)
        }
      } catch (error) {
        log(`❌ Failed to migrate page content ${content.id}: ${error.message}`)
        throw error
      }
    }
    
    log(`✅ Migrated ${mongoPageContents.length} page contents`)
  } catch (error) {
    handleError(error, 'PageContent migration')
  }
}

async function migratePageFAQs(skipIfExists = true) {
  try {
    log('Starting PageFAQ migration...')
    
    if (skipIfExists) {
      const existingCount = await postgresClient.pageFAQ.count()
      if (existingCount > 0) {
        log(`⏭️  Skipping PageFAQ migration - ${existingCount} page FAQs already exist`)
        return []
      }
    }
    
    const mongoPageFAQs = await retryOperation(async () => {
      return await mongoClient.pageFAQ.findMany({
        include: {
          page: true
        }
      })
    })
    
    log(`Found ${mongoPageFAQs.length} page FAQs in MongoDB`)
    
    for (let i = 0; i < mongoPageFAQs.length; i++) {
      const faq = mongoPageFAQs[i]
      
      try {
        const { page, ...faqData } = faq
        
        await retryOperation(async () => {
          return await postgresClient.pageFAQ.upsert({
            where: { id: faq.id },
            update: faqData,
            create: {
              ...faqData,
              id: faq.id, // Preserve the original ID
            }
          })
        })
        
        if ((i + 1) % 10 === 0 || i === mongoPageFAQs.length - 1) {
          logProgress('Migrated page FAQs', i + 1, mongoPageFAQs.length)
        }
      } catch (error) {
        log(`❌ Failed to migrate page FAQ ${faq.id}: ${error.message}`)
        throw error
      }
    }
    
    log(`✅ Migrated ${mongoPageFAQs.length} page FAQs`)
  } catch (error) {
    handleError(error, 'PageFAQ migration')
  }
}

async function migrateSections(skipIfExists = true) {
  try {
    log('Starting Section migration...')
    
    if (skipIfExists) {
      const existingCount = await postgresClient.section.count()
      if (existingCount > 0) {
        log(`⏭️  Skipping Section migration - ${existingCount} sections already exist`)
        return []
      }
    }
    
    const mongoSections = await retryOperation(async () => {
      return await mongoClient.section.findMany({
        include: {
          tables: true
        }
      })
    })
    
    log(`Found ${mongoSections.length} sections in MongoDB`)
    
    for (let i = 0; i < mongoSections.length; i++) {
      const section = mongoSections[i]
      
      try {
        // Create section without tables first
        const { tables, ...sectionData } = section
        
        await retryOperation(async () => {
          return await postgresClient.section.upsert({
            where: { id: section.id },
            update: sectionData,
            create: {
              ...sectionData,
              id: section.id, // Preserve the original ID
            }
          })
        })
        
        if ((i + 1) % 10 === 0 || i === mongoSections.length - 1) {
          logProgress('Migrated sections', i + 1, mongoSections.length)
        }
      } catch (error) {
        log(`❌ Failed to migrate section ${section.id}: ${error.message}`)
        throw error
      }
    }
    
    log(`✅ Migrated ${mongoSections.length} sections`)
    return mongoSections
  } catch (error) {
    handleError(error, 'Section migration')
  }
}

async function migrateTables(skipIfExists = true) {
  try {
    log('Starting Table migration...')
    
    if (skipIfExists) {
      const existingCount = await postgresClient.table.count()
      if (existingCount > 0) {
        log(`⏭️  Skipping Table migration - ${existingCount} tables already exist`)
        return []
      }
    }
    
    const mongoTables = await retryOperation(async () => {
      return await mongoClient.table.findMany({
        include: {
          section: true
        }
      })
    })
    
    log(`Found ${mongoTables.length} tables in MongoDB`)
    
    for (let i = 0; i < mongoTables.length; i++) {
      const table = mongoTables[i]
      
      try {
        const { section, ...tableData } = table
        
        await retryOperation(async () => {
          return await postgresClient.table.upsert({
            where: { id: table.id },
            update: tableData,
            create: {
              ...tableData,
              id: table.id, // Preserve the original ID
            }
          })
        })
        
        if ((i + 1) % 10 === 0 || i === mongoTables.length - 1) {
          logProgress('Migrated tables', i + 1, mongoTables.length)
        }
      } catch (error) {
        log(`❌ Failed to migrate table ${table.id}: ${error.message}`)
        throw error
      }
    }
    
    log(`✅ Migrated ${mongoTables.length} tables`)
  } catch (error) {
    handleError(error, 'Table migration')
  }
}

// Verify migration function
async function verifyMigration() {
  try {
    log('Starting migration verification...')
    
    const counts = {
      mongo: {},
      postgres: {}
    }
    
    // Count records in MongoDB
    counts.mongo.projects = await mongoClient.project.count()
    counts.mongo.rounds = await mongoClient.round.count()
    counts.mongo.investors = await mongoClient.investor.count()
    counts.mongo.investments = await mongoClient.investment.count()
    counts.mongo.pages = await mongoClient.page.count()
    counts.mongo.pageContents = await mongoClient.pageContent.count()
    counts.mongo.pageFAQs = await mongoClient.pageFAQ.count()
    counts.mongo.sections = await mongoClient.section.count()
    counts.mongo.tables = await mongoClient.table.count()
    
    // Count records in PostgreSQL
    counts.postgres.projects = await postgresClient.project.count()
    counts.postgres.rounds = await postgresClient.round.count()
    counts.postgres.investors = await postgresClient.investor.count()
    counts.postgres.investments = await postgresClient.investment.count()
    counts.postgres.pages = await postgresClient.page.count()
    counts.postgres.pageContents = await postgresClient.pageContent.count()
    counts.postgres.pageFAQs = await postgresClient.pageFAQ.count()
    counts.postgres.sections = await postgresClient.section.count()
    counts.postgres.tables = await postgresClient.table.count()
    
    log('Migration verification results:')
    console.table({
      'Projects': { MongoDB: counts.mongo.projects, PostgreSQL: counts.postgres.projects },
      'Rounds': { MongoDB: counts.mongo.rounds, PostgreSQL: counts.postgres.rounds },
      'Investors': { MongoDB: counts.mongo.investors, PostgreSQL: counts.postgres.investors },
      'Investments': { MongoDB: counts.mongo.investments, PostgreSQL: counts.postgres.investments },
      'Pages': { MongoDB: counts.mongo.pages, PostgreSQL: counts.postgres.pages },
      'Page Contents': { MongoDB: counts.mongo.pageContents, PostgreSQL: counts.postgres.pageContents },
      'Page FAQs': { MongoDB: counts.mongo.pageFAQs, PostgreSQL: counts.postgres.pageFAQs },
      'Sections': { MongoDB: counts.mongo.sections, PostgreSQL: counts.postgres.sections },
      'Tables': { MongoDB: counts.mongo.tables, PostgreSQL: counts.postgres.tables },
    })
    
    // Check if all counts match
    const allMatch = Object.keys(counts.mongo).every(key => 
      counts.mongo[key] === counts.postgres[key]
    )
    
    if (allMatch) {
      log('✅ All data migrated successfully!')
    } else {
      log('⚠️  Some data counts don\'t match. Please review the migration.')
    }
    
  } catch (error) {
    handleError(error, 'Migration verification')
  }
}

// Main migration function
async function runMigration() {
  const startTime = Date.now()
  
  try {
    log('🚀 Starting MongoDB to PostgreSQL migration...')
    
    // Test connections with retry
    await retryOperation(async () => {
      await mongoClient.$connect()
      await postgresClient.$connect()
    })
    log('✅ Database connections established')
    
    // Check current migration status
    await checkMigrationStatus()
    
    // Run migrations in correct order (respecting foreign key constraints)
    // Each function will skip if data already exists
    await migrateProjects(true)
    await migrateInvestors(true)
    await migrateRounds(true)
    await migrateInvestments(true)
    await migratePages(true)
    await migratePageContents(true)
    await migratePageFAQs(true)
    await migrateSections(true)
    await migrateTables(true)
    
    // Verify migration
    await verifyMigration()
    
    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)
    
    log(`🎉 Migration completed successfully in ${duration} seconds!`)
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    log('💡 You can run the script again to resume from where it left off')
    process.exit(1)
  } finally {
    // Cleanup connections
    try {
      await mongoClient.$disconnect()
      await postgresClient.$disconnect()
      log('Database connections closed')
    } catch (error) {
      log('Warning: Error closing database connections')
    }
  }
}

// Run the migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration()
}

export { runMigration }