import fs from 'fs';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as cheerio from 'cheerio';
import { rewriteAboutSection, batchRewriteAboutSections } from './ai-rewriter.mjs';

// Configuration
const CONCURRENT_PAGES = 3; // Reduced from 3 to avoid overloading
const MAX_RETRIES = 3;
const DELAY_BETWEEN_REQUESTS = 2000; // Increased delay
const ENABLE_AI_REWRITE = true;

// File paths
const INPUT_FILE = 'crypto_deals.json';
const OUTPUT_FILE = 'crypto_deals_2.json';
const STATE_FILE = 'project_scraper_state.json';
const ERRORS_FILE = 'project_scraper_errors.json';

// Configure stealth plugin with specific evasions to avoid conflicts
const stealthPlugin = StealthPlugin();
// Optionally disable problematic evasions
stealthPlugin.enabledEvasions.delete('chrome.app');
stealthPlugin.enabledEvasions.delete('chrome.csi');
puppeteer.use(stealthPlugin);

// Your existing cookies
const cookiesData = [
  {
      "domain": "crypto-fundraising.info",
      "hostOnly": true,
      "httpOnly": false,
      "name": "PHPSESSID",
      "path": "/",
      "sameSite": null,
      "secure": false,
      "session": true,
      "storeId": null,
      "value": "afmnah630edhh0g8n7dc75i3ge"
  },
  {
      "domain": "crypto-fundraising.info",
      "hostOnly": true,
      "httpOnly": false,
      "name": "disclaimer",
      "path": "/",
      "sameSite": null,
      "secure": true,
      "session": true,
      "storeId": null,
      "value": "agreed"
  },
  {
      "domain": "crypto-fundraising.info",
      "expirationDate": 1758830768.81,
      "hostOnly": true,
      "httpOnly": true,
      "name": "breeze_folder_name",
      "path": "/",
      "sameSite": null,
      "secure": true,
      "session": false,
      "storeId": null,
      "value": "e1f1c7f3ae4250e6fb92402edee112f82c2c9dfa"
  },
  {
      "domain": "crypto-fundraising.info",
      "expirationDate": 1757886342.33,
      "hostOnly": true,
      "httpOnly": true,
      "name": "wfwaf-authcookie-a3fca445bc272825075a2fe4e2a6d6ca",
      "path": "/",
      "sameSite": null,
      "secure": true,
      "session": false,
      "storeId": null,
      "value": "16704%7Csubscriber%7C%7Cf78c0bfac2b5bd12cf3d9d23f0abf4f5848557a3c42e82675d094ba952c73c6f"
  },
  {
      "domain": "crypto-fundraising.info",
      "expirationDate": 1758830768.81,
      "hostOnly": true,
      "httpOnly": true,
      "name": "wordpress_logged_in_06174467644e9aacb36c8ce5fccef216",
      "path": "/",
      "sameSite": null,
      "secure": true,
      "session": false,
      "storeId": null,
      "value": "amitpandey123121%40gmail.com%7C1758787568%7C44hwPq7lloxioFWYJLPCOq9sj1Tl7qAbYC1Lrl8Jw1Q%7C434eb876efd363065031f2438c5b626ecb42968ee11fcf834686600ebcd4a968"
  },
  {
      "domain": "crypto-fundraising.info",
      "hostOnly": true,
      "httpOnly": true,
      "name": "wordpress_test_cookie",
      "path": "/",
      "sameSite": null,
      "secure": true,
      "session": true,
      "storeId": null,
      "value": "WP%20Cookie%20check"
  }
];

function convertCookiesForPuppeteer(cookies) {
    return cookies.map(cookie => {
        const puppeteerCookie = {
            name: cookie.name,
            value: cookie.value,
            domain: cookie.domain,
            path: cookie.path,
            secure: cookie.secure,
            httpOnly: cookie.httpOnly
        };

        if (!cookie.session && cookie.expirationDate) {
            puppeteerCookie.expires = cookie.expirationDate;
        }

        if (cookie.sameSite) {
            puppeteerCookie.sameSite = cookie.sameSite;
        }

        return puppeteerCookie;
    });
}

function loadState() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
            console.log(`=== RESUMING FROM SAVED STATE ===`);
            console.log(`Completed: ${state.completedProjects.length} projects`);
            console.log(`Errors: ${state.erroredProjects.length} projects`);
            console.log(`Last processed index: ${state.lastProcessedIndex}`);
            return state;
        }
    } catch (error) {
        console.log('No valid state file found, starting fresh');
    }
    
    return {
        completedProjects: [],
        erroredProjects: [],
        lastProcessedIndex: -1
    };
}

function saveState(state) {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function loadResults() {
    try {
        if (fs.existsSync(OUTPUT_FILE)) {
            const results = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
            console.log(`Loaded ${results.length} existing results from ${OUTPUT_FILE}`);
            return results;
        }
    } catch (error) {
        console.log('No existing results file found, starting fresh');
    }
    return [];
}

function saveResults(results) {
    // Ensure unique results by URL
    const uniqueResults = [];
    const seenUrls = new Set();
    
    for (const result of results) {
        if (!seenUrls.has(result.url)) {
            seenUrls.add(result.url);
            uniqueResults.push(result);
        }
    }
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(uniqueResults, null, 2), 'utf-8');
    console.log(`Saved ${uniqueResults.length} unique project details to ${OUTPUT_FILE}`);
}

function saveErrors(errors) {
    fs.writeFileSync(ERRORS_FILE, JSON.stringify(errors, null, 2), 'utf-8');
}

function extractProjectData($) {
    const projectData = {
        name: '',
        about: '',
        categories: [],
        links: {
            website: null,
            social: []
        },
        funding_rounds: [],
        total_raised: null,
        scraped_at: new Date().toISOString()
    };

    try {
        // Extract name - try both desktop and mobile versions
        projectData.name = $('.dt-only .header-project-name').first().clone().children().remove().end().text().trim() 
                        || $('.mob-only .header-project-name').first().text().trim()
                        || $('.header-project-name').first().clone().children().remove().end().text().trim();

        // Extract about/description
        projectData.about = $('.dt-only .project-description').first().text().trim() 
                         || $('.mob-only .project-description').first().text().trim()
                         || $('.project-description').first().text().trim();

        // Extract categories
        $('.sideprojectcats .catitem').each((i, el) => {
            const category = $(el).text().trim();
            if (category) {
                projectData.categories.push(category);
            }
        });

        // Extract website link
        $('.sidewebsites:not(.community) .linkwithicon').each((i, el) => {
            const $link = $(el);
            const href = $link.attr('href');
            if (href && $link.find('span').text().includes('Website')) {
                projectData.links.website = href;
            }
        });

        // Extract social links
        $('.sidewebsites.community .linkwithicon').each((i, el) => {
            const $link = $(el);
            const href = $link.attr('href');
            const text = $link.text().trim();
            if (href) {
                projectData.links.social.push({
                    platform: text,
                    url: href
                });
            }
        });

        // Extract total raised
        const totalRaisedEl = $('.sprojh2.iftotis .abbrusd.numeric');
        if (totalRaisedEl.length) {
            const numeric = totalRaisedEl.attr('data-numeric');
            const text = totalRaisedEl.text().trim();
            projectData.total_raised = {
                amount_numeric: numeric ? parseInt(numeric) : null,
                amount_text: text
            };
        }

        // Extract funding rounds
        $('.newrisedblock').each((i, element) => {
            const $round = $(element);
            const round = {
                date: '',
                amount: {
                    numeric: null,
                    text: ''
                },
                round_type: '',
                details_link: null,
                lead_investors: [],
                investors: []
            };

            // Extract date
            const dateText = $round.find('.raisedin').text().trim();
            if (dateText) {
                round.date = dateText.replace('Raised ', '').trim();
            }

            // Extract amount
            const $amount = $round.find('.raisedinvalue .abbrusd.numeric');
            if ($amount.length) {
                round.amount.numeric = parseInt($amount.attr('data-numeric') || '0');
                round.amount.text = $amount.text().trim();
            }

            // Extract round type
            round.round_type = $round.find('.roundtype').first().text().trim();

            // Extract details link
            const detailsLink = $round.find('.raisedinlink').attr('href');
            if (detailsLink) {
                round.details_link = detailsLink;
            }

            // Extract lead investors
            $round.find('.newrised_investors.lead .investlogo-newrised').each((j, el) => {
                const $investor = $(el);
                const name = $investor.attr('title') || '';
                const url = $investor.attr('href') || '';
                const logo = $investor.css('background-image')?.replace(/url\(["']?([^"']*)["']?\)/, '$1') || '';
                
                if (name) {
                    round.lead_investors.push({
                        name,
                        url: url.startsWith('/') ? `https://crypto-fundraising.info${url}` : url,
                        logo
                    });
                }
            });

            // Extract regular investors
            $round.find('.newrised_investors:not(.lead) .investlogo-newrised').each((j, el) => {
                const $investor = $(el);
                const name = $investor.attr('title') || '';
                const url = $investor.attr('href') || '';
                const logo = $investor.css('background-image')?.replace(/url\(["']?([^"']*)["']?\)/, '$1') || '';
                
                if (name) {
                    round.investors.push({
                        name,
                        url: url.startsWith('/') ? `https://crypto-fundraising.info${url}` : url,
                        logo
                    });
                }
            });

            // Check for individual investors
            if ($round.find('.individuals.roundtype').length) {
                round.investors.push({
                    name: 'Individual investors',
                    url: null,
                    logo: null
                });
            }

            projectData.funding_rounds.push(round);
        });

    } catch (error) {
        console.error('Error extracting project data:', error.message);
    }

    return projectData;
}

async function scrapeProjectPage(browser, projectUrl, projectName, retryCount = 0) {
    let page = null;
    const retryText = retryCount > 0 ? ` (Retry ${retryCount}/${MAX_RETRIES})` : '';
    const warnings = [];
    
    try {
        // Create page with delay to avoid race conditions
        // Stagger start slightly to reduce concurrent target churn
        await new Promise(resolve => setTimeout(resolve, 100 + Math.floor(Math.random() * 200)));
        page = await browser.newPage();
        // Set conservative timeouts to avoid hangs
        try {
            page.setDefaultTimeout(20000);
            page.setDefaultNavigationTimeout(60000);
        } catch (_) {}
        
        // Set cookies
        const puppeteerCookies = convertCookiesForPuppeteer(cookiesData);
        await page.setCookie(...puppeteerCookies);
        
        console.log(`[${projectName}] Loading project page...${retryText}`);
        
        // Navigate with increased timeout
        await page.goto(projectUrl, {
            waitUntil: 'networkidle2',
            timeout: 45000
        });
        
        // Wait for key elements to load with error handling
        try {
            await page.waitForSelector('.header-project-name, .project-description', {
                timeout: 15000
            });
        } catch (selectorError) {
            // Some pages might not have these exact selectors
            console.log(`[${projectName}] Warning: Standard selectors not found, attempting to scrape anyway`);
            warnings.push('standard_selectors_missing');
        }
        
        // Additional wait to ensure dynamic content loads
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const html = await page.content();
        const $ = cheerio.load(html);
        
        const projectData = extractProjectData($);
        projectData.url = projectUrl;
        projectData.original_name = projectName;
        if (warnings.length > 0) {
            projectData.warnings = warnings;
        }
        
        console.log(`[${projectName}] Successfully scraped. Found ${projectData.funding_rounds.length} funding rounds${retryText}`);
        
        // AI Rewrite the about section if enabled
        if (ENABLE_AI_REWRITE && projectData.about && projectData.about.trim().length >= 50) {
            try {
                console.log(`[${projectName}] Rewriting about section with AI...`);
                const rewriteResult = await rewriteAboutSection(projectData.about, projectName);
                
                if (rewriteResult.success) {
                    projectData.rewritten_about = rewriteResult.rewrittenText;
                    console.log(`[${projectName}] ✓ AI rewrite successful`);
                } else {
                    console.log(`[${projectName}] ✗ AI rewrite failed: ${rewriteResult.error}`);
                }
            } catch (aiError) {
                console.log(`[${projectName}] ✗ AI rewrite error: ${aiError.message}`);
            }
        }
        
        return {
            success: true,
            data: projectData,
            attempts: retryCount + 1
        };
        
    } catch (error) {
        console.log(`[${projectName}] Error${retryText}: ${error.message}`);
        
        // Close page safely before retry
        if (page) {
            try {
                if (!page.isClosed()) {
                    await page.close();
                }
            } catch (closeError) {
                // Ignore target race errors during retry
                if (!isIgnorableCloseError(closeError)) {
                    console.log(`[${projectName}] Page close error before retry: ${closeError.message}`);
                }
            }
            page = null;
        }
        
        if (retryCount < MAX_RETRIES) {
            console.log(`[${projectName}] Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, 3000)); // Increased delay before retry
            return scrapeProjectPage(browser, projectUrl, projectName, retryCount + 1);
        }
        
        return {
            success: false,
            error: error.message,
            url: projectUrl,
            project_name: projectName,
            timestamp: new Date().toISOString(),
            attempts: retryCount + 1
        };
    } finally {
        // Safe cleanup
        if (page) {
            try {
                // Check if page is still open before closing
                if (!page.isClosed()) {
                    await page.close();
                }
            } catch (closeError) {
                // Silently ignore known target race conditions
                if (!isIgnorableCloseError(closeError)) {
                    console.log(`[${projectName}] Page already closed or error closing: ${closeError.message}`);
                }
            }
        }
    }
}

function isIgnorableCloseError(error) {
    if (!error || !error.message) return false;
    const msg = error.message;
    return (
        /Target\.closeTarget\).*No target with given id/i.test(msg) ||
        /Requesting main frame too early/i.test(msg) ||
        /Session closed/i.test(msg) ||
        /Target closed/i.test(msg)
    );
}

async function processProjectChunk(browser, projects) {
    // Run all in parallel and collect results
    const promises = projects.map(project => 
        scrapeProjectPage(browser, project.url, project.name)
            .catch(err => ({
                success: false,
                error: err?.message || String(err),
                url: project.url,
                project_name: project.name,
                timestamp: new Date().toISOString(),
                attempts: 1
            }))
    );
    const settled = await Promise.all(promises);
    const successful = settled.filter(r => r.success).map(r => r.data);
    const errors = settled.filter(r => !r.success);
    return { successful, errors };
}

async function main() {
    let browser = null;
    
    try {
        console.log('\n=== CRYPTO PROJECT SCRAPER STARTING ===\n');
        
        // Load input data
        if (!fs.existsSync(INPUT_FILE)) {
            console.error(`Input file ${INPUT_FILE} not found!`);
            process.exit(1);
        }
        
        const cryptoDeals = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
        console.log(`Loaded ${cryptoDeals.length} projects from ${INPUT_FILE}`);
        
        // Extract unique project URLs
        const projectsMap = new Map();
        cryptoDeals.forEach(deal => {
            if (deal.project_url && !projectsMap.has(deal.project_url)) {
                projectsMap.set(deal.project_url, {
                    name: deal.project_name,
                    url: deal.project_url.startsWith('http') ? 
                         deal.project_url : 
                         `https://crypto-fundraising.info${deal.project_url}`
                });
            }
        });
        
        const uniqueProjects = Array.from(projectsMap.values());
        console.log(`Found ${uniqueProjects.length} unique project URLs to scrape`);
        
        // Load state and existing results
        let state = loadState();
        let allResults = loadResults();
        let allErrors = state.erroredProjects || [];
        
        // Filter out already completed projects
        const remainingProjects = uniqueProjects.filter(p => 
            !state.completedProjects.includes(p.url)
        );
        
        console.log(`\n=== PROGRESS ===`);
        console.log(`Total projects: ${uniqueProjects.length}`);
        console.log(`Already completed: ${state.completedProjects.length}`);
        console.log(`Remaining to scrape: ${remainingProjects.length}`);
        console.log(`Previous errors: ${allErrors.length}`);
        
        if (remainingProjects.length === 0) {
            console.log('\n✅ All projects have been scraped!');
            if (allErrors.length > 0) {
                console.log(`⚠️  There were ${allErrors.length} projects that failed. Check ${ERRORS_FILE} for details.`);
            }
            return;
        }
        
        // Launch browser with specific args to avoid issues
        console.log('\nLaunching browser...');
        browser = await puppeteer.launch({
            headless: 'new', // Use new headless mode
            defaultViewport: null,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-first-run',
                '--no-zygote',
                '--disable-extensions'
            ],
            ignoreHTTPSErrors: true
        });
        
        console.log('Browser launched successfully');
        console.log(`\n=== Starting to process ${remainingProjects.length} projects ===\n`);
        
        // Process projects in chunks
        for (let i = 0; i < remainingProjects.length; i += CONCURRENT_PAGES) {
            const chunk = remainingProjects.slice(i, i + CONCURRENT_PAGES);
            const chunkNumber = Math.floor(i / CONCURRENT_PAGES) + 1;
            const totalChunks = Math.ceil(remainingProjects.length / CONCURRENT_PAGES);
            
            console.log(`\n📦 Processing chunk ${chunkNumber}/${totalChunks}: ${chunk.map(p => p.name).join(', ')}`);
            
            let chunkResults = { successful: [], errors: [] };
            
            try {
                chunkResults = await processProjectChunk(browser, chunk);
            } catch (chunkError) {
                console.error(`Chunk processing error: ${chunkError.message}`);
                // Convert all chunk items to errors
                chunkResults.errors = chunk.map(project => ({
                    success: false,
                    error: chunkError.message,
                    url: project.url,
                    project_name: project.name,
                    timestamp: new Date().toISOString(),
                    attempts: 1
                }));
            }
            
            // Update results and state
            allResults = [...allResults, ...chunkResults.successful];
            allErrors = [...allErrors, ...chunkResults.errors];
            
            // Update completed projects
            chunkResults.successful.forEach(result => {
                if (!state.completedProjects.includes(result.url)) {
                    state.completedProjects.push(result.url);
                }
            });
            
            // Save state and results after each chunk
            state.erroredProjects = allErrors;
            state.lastProcessedIndex = state.completedProjects.length - 1;
            
            saveState(state);
            saveResults(allResults);
            
            if (chunkResults.errors.length > 0) {
                saveErrors(allErrors);
                console.log(`⚠️  Chunk completed with ${chunkResults.errors.length} errors`);
            } else {
                console.log(`✅ Chunk completed successfully`);
            }
            
            const overallProgress = ((state.completedProjects.length / uniqueProjects.length) * 100).toFixed(1);
            console.log(`📊 Overall Progress: ${state.completedProjects.length}/${uniqueProjects.length} (${overallProgress}%)`);
            
            // Delay between chunks
            if (i + CONCURRENT_PAGES < remainingProjects.length) {
                console.log(`⏳ Waiting ${DELAY_BETWEEN_REQUESTS}ms before next chunk...`);
                await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
            }
        }
        
        // Final summary
        console.log('\n' + '='.repeat(50));
        console.log('=== 🎉 SCRAPING COMPLETE ===');
        console.log('='.repeat(50));
        console.log(`✅ Total projects scraped: ${allResults.length}`);
        console.log(`❌ Total errors: ${allErrors.length}`);
        console.log(`📁 Results saved to: ${OUTPUT_FILE}`);
        
        if (allErrors.length > 0) {
            console.log(`📁 Errors saved to: ${ERRORS_FILE}`);
            console.log('\n⚠️  Failed projects (showing first 10):');
            allErrors.slice(0, 10).forEach(error => {
                console.log(`  - ${error.project_name}: ${error.error}`);
            });
            if (allErrors.length > 10) {
                console.log(`  ... and ${allErrors.length - 10} more`);
            }
        }
        
        // Clean up state file if all projects completed successfully
        if (allErrors.length === 0 && state.completedProjects.length === uniqueProjects.length) {
            if (fs.existsSync(STATE_FILE)) {
                fs.unlinkSync(STATE_FILE);
                console.log('\n✨ All projects completed successfully! State file removed.');
            }
        } else {
            console.log(`\n📌 State file preserved at ${STATE_FILE} for resuming if needed.`);
        }
        
    } catch (error) {
        console.error('\n❌ Critical error:', error.message);
        console.error('Stack trace:', error.stack);
        console.log('\n💡 The scraper state has been saved. You can restart the script to resume from where it left off.');
    } finally {
        if (browser) {
            try {
                console.log('\nClosing browser...');
                await browser.close();
                console.log('Browser closed successfully');
            } catch (browserCloseError) {
                console.error('Error closing browser:', browserCloseError.message);
                // Force kill the browser process if normal close fails
                try {
                    if (browser.process()) {
                        browser.process().kill('SIGKILL');
                    }
                } catch (killError) {
                    console.error('Failed to kill browser process:', killError.message);
                }
            }
        }
    }
}

// Run the scraper
main().catch(console.error);