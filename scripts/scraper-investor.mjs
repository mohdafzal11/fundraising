import fs from 'fs';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as cheerio from 'cheerio';

// Configuration - modify these values
const BASE_URL = 'https://crypto-fundraising.info/investors/page/';
const TOTAL_PAGES = 402;
const CONCURRENT_PAGES = 3;
const MAX_RETRIES = 3;
const RETRY_ERRORS_ONLY = process.argv.includes('--retry-errors');

// State files
const STATE_FILE = 'investor_scraper_state.json';
const RESULTS_FILE = 'crypto_investors.json';
const ERRORS_FILE = 'investor_scraper_errors.json';

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
    allRecords.sort((a, b) => {
        if (a.page !== b.page) return a.page - b.page;
        return parseInt(a.rank) - parseInt(b.rank);
    });
    
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(allRecords, null, 2), 'utf-8');
}

function saveErrors(errors) {
    fs.writeFileSync(ERRORS_FILE, JSON.stringify(errors, null, 2), 'utf-8');
}

function recordExists(existingRecords, newRecord) {
    return existingRecords.some(existing => 
        existing.page === newRecord.page && 
        existing.rank === newRecord.rank &&
        existing.fund_name === newRecord.fund_name
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
    
    console.log(`Added ${addedCount} new records (${newRecords.length - addedCount} duplicates skipped)`);
    return merged;
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
    const page = await browser.newPage();
    
    try {
        const puppeteerCookies = convertCookiesForPuppeteer(cookiesData);
        await page.setCookie(...puppeteerCookies);
        
        const url = BASE_URL + pageNumber + '/';
        const retryText = retryCount > 0 ? ` (Retry ${retryCount}/${MAX_RETRIES})` : '';
        console.log(`[Page ${pageNumber}] Loading...${retryText}`);
        
        await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 35000});
        await page.waitForSelector('.hp-table.dealflow-table', {timeout: 10000});
        
        console.log(`[Page ${pageNumber}] Table loaded${retryText}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const html = await page.content();
        const $ = cheerio.load(html);
        const pageRecords = [];
        
        // Debug: Log the first few elements to see what's being found
        console.log(`[Page ${pageNumber}] Found ${$('.hp-table-row.hpt-data').length} data rows`);
        
        $('.hp-table-row.hpt-data').each((index, element) => {
            try {
                const $row = $(element);
                
                // Get rank from span inside hpt-col1 - the span contains just the number
                const rank = $row.find('.hpt-col1 span').last().text().trim();
                
                // Get fund URL and logo from hpt-col2
                const $fundLink = $row.find('.hpt-col2 a.aprojects');
                const fund_url = $fundLink.attr('href') || '';
                const logo_img = $fundLink.find('img.fundlogoinvest').attr('src') || '';
                
                // Get fund name from hpt-col3 - the direct text content
                const fund_name = $row.find('.hpt-col3').clone().children().remove().end().text().trim();
                
                // Get social links from hpt-col4
                const social_links = [];
                $row.find('.hpt-col4 a').each((i, el) => {
                    const $el = $(el);
                    social_links.push({
                        url: $el.attr('href') || '',
                        title: $el.attr('title') || $el.text().trim()
                    });
                });
                
                // Get invested projects count from hpt-col5
                const invested_projects = parseInt($row.find('.hpt-col5 .pcount').text().trim()) || 0;
                
                // Debug log for first row
                if (index === 0) {
                    console.log(`[Page ${pageNumber}] First row debug:`, {
                        rank,
                        fund_name,
                        fund_url,
                        invested_projects
                    });
                }
                
                // Only add if we have valid data
                if (rank && fund_name) {
                    pageRecords.push({
                        page: pageNumber,
                        rank,
                        fund_name,
                        logo_img,
                        fund_url,
                        social_links,
                        invested_projects
                    });
                }
                
            } catch (error) {
                console.log(`[Page ${pageNumber}] Failed to process row ${index + 1}: ${error.message}`);
            }
        });
        
        console.log(`[Page ${pageNumber}] Completed - found ${pageRecords.length} records${retryText}`);
        return { success: true, records: pageRecords, page: pageNumber, attempts: retryCount + 1 };
        
    } catch (error) {
        console.log(`[Page ${pageNumber}] Error${retryText}: ${error.message}`);
        
        if (retryCount < MAX_RETRIES) {
            console.log(`[Page ${pageNumber}] Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
            await page.close();
            await new Promise(resolve => setTimeout(resolve, 2000));
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
        await page.close();
    }
}

async function processPageChunk(browser, pageNumbers) {
    const promises = pageNumbers.map(pageNum => scrapePageWithRetry(browser, pageNum, 0));
    const results = await Promise.all(promises);
    
    const successfulResults = results.filter(r => r.success).map(r => r.records).flat();
    const errors = results.filter(r => !r.success);
    
    return { records: successfulResults, errors };
}

async function scrapeInvestors() {
    let browser;
    
    try {
        let state = loadState();
        let allRecords = loadResults();
        
        console.log(`Starting investor scraper for ${TOTAL_PAGES} pages with ${CONCURRENT_PAGES} concurrent workers`);
        console.log(`Retry mechanism: Up to ${MAX_RETRIES} retries per failed page`);
        
        if (RETRY_ERRORS_ONLY) {
            console.log('RETRY ERRORS MODE: Only processing previously errored pages');
        }
        
        browser = await puppeteer.launch({
            headless: true,
            defaultViewport: null,
            args: [
                '--start-maximized',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-images',
                '--disable-dev-shm-usage'
            ]
        });
        
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
            
            const { records: chunkResults, errors: chunkErrors } = await processPageChunk(browser, chunk);
            
            if (RETRY_ERRORS_ONLY) {
                allRecords = mergeRecords(allRecords, chunkResults);
            } else {
                allRecords = allRecords.concat(chunkResults);
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
        
        console.log(`Investor scraping completed! Saved ${allRecords.length} records to ${RESULTS_FILE}`);
        
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

scrapeInvestors();