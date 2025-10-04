import fs from 'fs';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as cheerio from 'cheerio';

// Configuration - modify these values
const BASE_URL = 'https://crypto-fundraising.info/deal-flow/page/';
const TOTAL_PAGES = 902; // Set how many pages you want to scrape
const CONCURRENT_PAGES = 5; // How many pages to process simultaneously
const MAX_RETRIES = 5; // Maximum number of retries per page
const MAX_BROWSER_RESTARTS = 10000; // Maximum browser restarts per chunk
const CHUNK_RETRY_DELAY = 5000; // Delay before retrying a failed chunk (ms)
const RETRY_ERRORS_ONLY = process.argv.includes('--retry-errors'); // Add --retry-errors flag to only process errored pages

// State files
const STATE_FILE = 'scraper_state.json';
const RESULTS_FILE = 'crypto_deals.json';
const ERRORS_FILE = 'scraper_errors.json';

puppeteer.use(StealthPlugin());

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
            console.log(`Resuming from page ${state.lastCompletedChunk * CONCURRENT_PAGES + 1}. Completed: ${state.completedPages.length}/${TOTAL_PAGES} pages`);
            return state;
        }
    } catch (error) {
        console.log('No valid state file found, starting fresh');
    }
    
    return {
        lastCompletedChunk: -1,
        completedPages: [],
        erroredPages: [],
        totalRecords: 0,
        retryAttempts: {}
    };
}

function saveState(state) {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function loadResults() {
    try {
        if (fs.existsSync(RESULTS_FILE)) {
            return JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf-8'));
        }
    } catch (error) {
        console.log('No existing results file found');
    }
    return [];
}

function saveResults(allRecords) {
    // Ensure records are always sorted by page number first, then by rank within each page
    // This guarantees consistent ordering regardless of concurrent request completion order
    allRecords.sort((a, b) => {
        if (a.page !== b.page) return a.page - b.page;
        return parseInt(a.rank) - parseInt(b.rank);
    });
    
    // Log some ordering verification (first few and last few pages)
    if (allRecords.length > 0) {
        const firstRecord = allRecords[0];
        const lastRecord = allRecords[allRecords.length - 1];
        console.log(`Records ordered: Page ${firstRecord.page} (rank ${firstRecord.rank}) to Page ${lastRecord.page} (rank ${lastRecord.rank})`);
    }
    
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(allRecords, null, 2), 'utf-8');
}

function saveErrors(errors) {
    fs.writeFileSync(ERRORS_FILE, JSON.stringify(errors, null, 2), 'utf-8');
}

function recordExists(existingRecords, newRecord) {
    return existingRecords.some(existing => 
        existing.page === newRecord.page && 
        existing.rank === newRecord.rank &&
        existing.project_name === newRecord.project_name
    );
}

function mergeRecords(existingRecords, newRecords) {
    const merged = [...existingRecords];
    let addedCount = 0;
    
    newRecords.forEach(newRecord => {
        if (!recordExists(existingRecords, newRecord)) {
            merged.push(newRecord);
            addedCount++;
        }
    });
    
    // Ensure proper ordering after merging new records
    merged.sort((a, b) => {
        if (a.page !== b.page) return a.page - b.page;
        return parseInt(a.rank) - parseInt(b.rank);
    });
    
    console.log(`Added ${addedCount} new records (${newRecords.length - addedCount} duplicates skipped)`);
    return merged;
}

async function createBrowser() {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        args: [
            '--start-maximized',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-images',
            '--disable-dev-shm-usage',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection'
        ]
    });
    
    // Add error handler to browser
    browser.on('disconnected', () => {
        console.log('Browser disconnected unexpectedly');
    });
    
    return browser;
}
function getErroredPages() {
    try {
        if (fs.existsSync(ERRORS_FILE)) {
            const errors = JSON.parse(fs.readFileSync(ERRORS_FILE, 'utf-8'));
            return [...new Set(errors.map(error => error.page))];
        }
    } catch (error) {
        console.log('No error file found or error reading it');
    }
    return [];
}

async function scrapePageWithRetry(browser, pageNumber, retryCount = 0) {
    // Move retryText definition to the top so it's always available
    const retryText = retryCount > 0 ? ` (Retry ${retryCount}/${MAX_RETRIES})` : '';
    let page = null;
    
    try {
        // Check if browser is still connected
        if (!browser.isConnected()) {
            throw new Error('Browser is disconnected');
        }
        
        page = await browser.newPage();
        
        // Add timeout to page operations
        page.setDefaultTimeout(45000);
        page.setDefaultNavigationTimeout(45000);
        
        const puppeteerCookies = convertCookiesForPuppeteer(cookiesData);
        await page.setCookie(...puppeteerCookies);
        
        const url = BASE_URL + pageNumber + '/';
        console.log(`[Page ${pageNumber}] Loading...${retryText}`);
        
        // Add extra wait time for problematic pages
        if (retryCount > 0) {
            await new Promise(resolve => setTimeout(resolve, retryCount * 2000));
        }
        
        await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 45000});
        await page.waitForSelector('.hp-table.dealflow-table', {timeout: 15000});
        
        console.log(`[Page ${pageNumber}] Table loaded${retryText}`);

        const expandedCount = await page.evaluate(() => {
            const spans = document.querySelectorAll("span.moreitems");
            spans.forEach(span => span.click());
            return spans.length;
        });
        
        console.log(`[Page ${pageNumber}] Expanded ${expandedCount} investor lists${retryText}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const html = await page.content();
        const $ = cheerio.load(html);
        const pageRecords = [];
        
        $('.hp-table-row.hpt-data').each((index, element) => {
            try {
                const $row = $(element);
                
                const rank = $row.find('.hpt-col1').text().trim();
                
                const $projectLink = $row.find('.hpt-col2 a.t-project-link');
                const project_name = $projectLink.find('.cointitle').text().trim();
                const project_url = $projectLink.attr('href') || '';
                const logo_img = $projectLink.find('.cointextbadge').css('background-image')?.replace(/url\(["']?([^"']*)["']?\)/, '$1') || '';
                
                const cols = $row.find('.hpt-col3, .hpt-col4');
                const round = $(cols[0]).text().trim();
                const date = $(cols[1]).text().trim();
                
                const raisedNumeric = $(cols[2]).find('.abbrusd.numeric').attr('data-numeric') || '';
                const fdvNumeric = $(cols[3]).find('.abbrusd.numeric').attr('data-numeric') || '';
                const tradable = $(cols[4]).text().trim();
                
                const categories = [];
                $row.find('.hpt-col5 .catitem').each((i, el) => {
                    categories.push($(el).text().trim());
                });
                
                const investors = [];
                $row.find('.hpt-col6 a[href*="/funds/"]').each((i, el) => {
                    const $el = $(el);
                    investors.push({
                        name: $el.attr('title') || $el.text().trim(),
                        url: $el.attr('href') || ''
                    });
                });
                
                pageRecords.push({
                    page: pageNumber,
                    rank,
                    project_name,
                    logo_img,
                    project_url,
                    round,
                    date,
                    raised: raisedNumeric ? parseInt(raisedNumeric) : null,
                    fdv: fdvNumeric ? parseInt(fdvNumeric) : null,
                    tradable,
                    categories,
                    investors
                });
                
            } catch (error) {
                console.log(`[Page ${pageNumber}] Failed to process row ${index + 1}: ${error.message}`);
            }
        });
        
        console.log(`[Page ${pageNumber}] Completed - found ${pageRecords.length} records${retryText}`);
        return { success: true, records: pageRecords, page: pageNumber, attempts: retryCount + 1 };
        
    } catch (error) {
        console.log(`[Page ${pageNumber}] Error${retryText}: ${error.message}`);
        
        // Check for browser disconnection or page creation issues
        const isBrowserError = error.message.includes('Browser is disconnected') || 
                              error.message.includes('Target closed') ||
                              error.message.includes('Protocol error') ||
                              error.message.includes('Requesting main frame too early');
        
        if (isBrowserError) {
            console.log(`[Page ${pageNumber}] Browser-level error detected${retryText}`);
            return { 
                success: false, 
                error: error.message, 
                page: pageNumber, 
                timestamp: new Date().toISOString(),
                attempts: retryCount + 1,
                browserError: true
            };
        }
        
        if (retryCount < MAX_RETRIES) {
            console.log(`[Page ${pageNumber}] Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
            if (page) {
                try { await page.close(); } catch (e) { /* ignore */ }
            }
            await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 3000));
            return scrapePageWithRetry(browser, pageNumber, retryCount + 1);
        }
        
        return { 
            success: false, 
            error: error.message, 
            page: pageNumber, 
            timestamp: new Date().toISOString(),
            attempts: retryCount + 1,
            maxRetriesReached: true
        };
    } finally {
        if (page) {
            try {
                await page.close();
            } catch (error) {
                console.log(`[Page ${pageNumber}] Error closing page: ${error.message}`);
            }
        }
    }
}

async function processPageChunk(browser, pageNumbers, chunkIndex, browserRestartCount = 0) {
    try {
        const promises = pageNumbers.map(pageNum => scrapePageWithRetry(browser, pageNum, 0));
        const results = await Promise.all(promises);
        
        const successfulResults = results.filter(r => r.success).map(r => r.records).flat();
        const errors = results.filter(r => !r.success);
        
        // Check for browser errors in the results
        const browserErrors = errors.filter(e => e.browserError);
        
        if (browserErrors.length > 0 && browserRestartCount < MAX_BROWSER_RESTARTS) {
            console.log(`Chunk ${chunkIndex + 1}: Browser errors detected (${browserErrors.length}/${errors.length}). Restarting browser... (attempt ${browserRestartCount + 1}/${MAX_BROWSER_RESTARTS})`);
            
            // Close current browser
            try {
                await browser.close();
            } catch (e) {
                console.log('Error closing browser:', e.message);
            }
            
            // Wait before restarting
            await new Promise(resolve => setTimeout(resolve, CHUNK_RETRY_DELAY));
            
            // Create new browser and retry the chunk
            const newBrowser = await createBrowser();
            return processPageChunk(newBrowser, pageNumbers, chunkIndex, browserRestartCount + 1);
        }
        
        // Sort the records by page number first, then by rank within each page
        // This ensures proper ordering even if concurrent requests completed out of order
        successfulResults.sort((a, b) => {
            if (a.page !== b.page) return a.page - b.page;
            return parseInt(a.rank) - parseInt(b.rank);
        });
        
        return { 
            records: successfulResults, 
            errors: errors.filter(e => !e.browserError), // Only return non-browser errors
            browser: browserErrors.length > 0 ? null : browser // Return null if browser was restarted
        };
        
    } catch (error) {
        console.log(`Chunk ${chunkIndex + 1}: Critical error in processPageChunk: ${error.message}`);
        
        if (browserRestartCount < MAX_BROWSER_RESTARTS) {
            console.log(`Chunk ${chunkIndex + 1}: Restarting browser due to critical error... (attempt ${browserRestartCount + 1}/${MAX_BROWSER_RESTARTS})`);
            
            try {
                await browser.close();
            } catch (e) {
                console.log('Error closing browser:', e.message);
            }
            
            await new Promise(resolve => setTimeout(resolve, CHUNK_RETRY_DELAY));
            
            const newBrowser = await createBrowser();
            return processPageChunk(newBrowser, pageNumbers, chunkIndex, browserRestartCount + 1);
        }
        
        // If max restarts reached, return all pages as errors
        const allErrors = pageNumbers.map(pageNum => ({
            success: false,
            error: error.message,
            page: pageNum,
            timestamp: new Date().toISOString(),
            attempts: 1,
            maxRestartsReached: true
        }));
        
        return { records: [], errors: allErrors, browser: null };
    }
}

async function scrapeDeals() {
    let browser;
    
    try {
        let state = loadState();
        let allRecords = loadResults();
        
        console.log(`Starting scraper for ${TOTAL_PAGES} pages with ${CONCURRENT_PAGES} concurrent workers`);
        console.log(`Retry mechanism: Up to ${MAX_RETRIES} retries per failed page`);
        
        if (RETRY_ERRORS_ONLY) {
            console.log('RETRY ERRORS MODE: Only processing previously errored pages');
        }
        
        browser = await createBrowser();
        
        let pageNumbers;
        
        if (RETRY_ERRORS_ONLY) {
            const erroredPages = getErroredPages();
            pageNumbers = erroredPages;
            console.log(`Found ${erroredPages.length} previously errored pages to retry: [${erroredPages.join(', ')}]`);
            
            if (erroredPages.length === 0) {
                console.log('No errored pages found. Exiting.');
                return;
            }
        } else {
            pageNumbers = Array.from({length: TOTAL_PAGES}, (_, i) => i + 1);
            const remainingPages = pageNumbers.filter(p => !state.completedPages.includes(p));
            pageNumbers = remainingPages;
            console.log(`Remaining pages to process: ${remainingPages.length}`);
        }
        
        for (let i = 0; i < pageNumbers.length; i += CONCURRENT_PAGES) {
            const chunk = pageNumbers.slice(i, i + CONCURRENT_PAGES);
            const chunkIndex = Math.floor(i / CONCURRENT_PAGES);
            
            console.log(`Processing chunk ${chunkIndex + 1}: pages ${chunk.join(', ')}`);
            
            let chunkAttempt = 0;
            let chunkSuccess = false;
            let chunkResults = [];
            let chunkErrors = [];
            
            // Keep retrying the chunk until success or max attempts
            while (!chunkSuccess && chunkAttempt < 10) { // Max 10 attempts per chunk
                try {
                    const result = await processPageChunk(browser, chunk, chunkIndex);
                    chunkResults = result.records;
                    chunkErrors = result.errors;
                    
                    // Update browser reference if it was restarted
                    if (result.browser === null) {
                        browser = await createBrowser();
                        console.log(`Chunk ${chunkIndex + 1}: Browser restarted successfully`);
                    } else {
                        browser = result.browser;
                    }
                    
                    chunkSuccess = true;
                    
                } catch (error) {
                    chunkAttempt++;
                    console.log(`Chunk ${chunkIndex + 1}: Attempt ${chunkAttempt} failed: ${error.message}`);
                    
                    if (chunkAttempt < 10) {
                        console.log(`Chunk ${chunkIndex + 1}: Retrying chunk in ${CHUNK_RETRY_DELAY}ms...`);
                        
                        // Close and restart browser
                        try {
                            await browser.close();
                        } catch (e) {
                            console.log('Error closing browser:', e.message);
                        }
                        
                        await new Promise(resolve => setTimeout(resolve, CHUNK_RETRY_DELAY));
                        browser = await createBrowser();
                    } else {
                        console.log(`Chunk ${chunkIndex + 1}: Max chunk attempts reached. Adding all pages as errors.`);
                        chunkResults = [];
                        chunkErrors = chunk.map(pageNum => ({
                            success: false,
                            error: 'Max chunk attempts reached',
                            page: pageNum,
                            timestamp: new Date().toISOString(),
                            attempts: chunkAttempt,
                            maxChunkAttemptsReached: true
                        }));
                        chunkSuccess = true; // Exit the retry loop
                    }
                }
            }
            
            // Log the page order within this chunk to verify correct ordering
            if (chunkResults.length > 0) {
                const pageOrder = [...new Set(chunkResults.map(r => r.page))].sort((a, b) => a - b);
                console.log(`Chunk ${chunkIndex + 1} processed pages in order: [${pageOrder.join(', ')}]`);
            }
            
            if (RETRY_ERRORS_ONLY) {
                allRecords = mergeRecords(allRecords, chunkResults);
            } else {
                // Ensure records are added in correct order by concatenating and then sorting
                allRecords = allRecords.concat(chunkResults);
                // Sort the entire collection to maintain proper order
                allRecords.sort((a, b) => {
                    if (a.page !== b.page) return a.page - b.page;
                    return parseInt(a.rank) - parseInt(b.rank);
                });
            }
            
            const successfulPages = chunk.filter(pageNum => 
                chunkResults.some(record => record.page === pageNum)
            );
            
            if (!RETRY_ERRORS_ONLY) {
                state.completedPages = [...state.completedPages, ...successfulPages];
                state.erroredPages = [...state.erroredPages, ...chunkErrors];
                state.lastCompletedChunk = state.lastCompletedChunk + 1;
                state.totalRecords = allRecords.length;
                
                chunkErrors.forEach(error => {
                    if (!state.retryAttempts[error.page]) {
                        state.retryAttempts[error.page] = 0;
                    }
                    state.retryAttempts[error.page] = error.attempts;
                });
                
                saveState(state);
            } else {
                if (successfulPages.length > 0) {
                    const currentErrors = fs.existsSync(ERRORS_FILE) ? 
                        JSON.parse(fs.readFileSync(ERRORS_FILE, 'utf-8')) : [];
                    
                    const updatedErrors = currentErrors.filter(error => 
                        !successfulPages.includes(error.page)
                    );
                    
                    saveErrors(updatedErrors);
                }
            }
            
            saveResults(allRecords);
            
            if (chunkErrors.length > 0) {
                if (!RETRY_ERRORS_ONLY) {
                    saveErrors(state.erroredPages);
                }
                const maxRetriedPages = chunkErrors.filter(e => e.maxRetriesReached).length;
                console.log(`Chunk completed with ${chunkErrors.length} errors (${maxRetriedPages} reached max retries).`);
            }
            
            console.log(`Completed chunk ${chunkIndex + 1}. Total records: ${allRecords.length}`);
            
            if (!RETRY_ERRORS_ONLY) {
                console.log(`Successful pages: ${state.completedPages.length}/${TOTAL_PAGES}`);
            }
        }
        
        console.log(`Scraping completed! Saved ${allRecords.length} records to ${RESULTS_FILE}`);
        
        if (RETRY_ERRORS_ONLY) {
            console.log('Retry errors mode completed. Check results for newly added records.');
        } else {
            if (state.erroredPages.length > 0) {
                const permanentFailures = state.erroredPages.filter(e => e.maxRetriesReached).length;
                console.log(`${state.erroredPages.length} pages had errors (${permanentFailures} permanent failures after ${MAX_RETRIES} retries).`);
                console.log(`To retry errored pages, run: node script.js --retry-errors`);
            } else {
                if (fs.existsSync(STATE_FILE)) {
                    fs.unlinkSync(STATE_FILE);
                }
                console.log('All pages completed successfully!');
            }
        }
        
    } catch (error) {
        console.error('Critical error during scraping:', error.message);
        console.error('Check state files to resume from where you left off');
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

scrapeDeals();