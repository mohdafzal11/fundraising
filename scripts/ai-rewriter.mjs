import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Rewrites the about section using AI to avoid plagiarism and improve SEO
 * @param {string} aboutText - The original about text to rewrite
 * @param {string} projectName - The name of the project for context
 * @returns {Promise<{success: boolean, rewrittenText?: string, error?: string}>}
 */
export async function rewriteAboutSection(aboutText, projectName = '') {
    try {
        // Check if API key is available
        if (!process.env.ANTHROPIC_API_KEY) {
            throw new Error('ANTHROPIC_API_KEY environment variable is not set');
        }

        // Skip if about text is empty or too short
        if (!aboutText || aboutText.trim().length < 50) {
            return {
                success: false,
                error: 'About text is too short or empty'
            };
        }

        console.log(`[AI Rewriter] Rewriting about section for ${projectName}...`);

        // Retry loop with exponential backoff, switch to latest model alias
        const MAX_AI_RETRIES = 3;
        let lastError = null;
        let rewrittenText = null;
        for (let attempt = 0; attempt < MAX_AI_RETRIES; attempt++) {
            try {
                const response = await anthropic.messages.create({
                    model: 'claude-3-7-sonnet-latest',
                    max_tokens: 2000,
                    temperature: 0.7,
                    messages: [
                        {
                            role: 'user',
                            content: `Rewrite the article with better logic and grammar. Keep the same meaning and technical details but make it more engaging and SEO-friendly while making sure we don't exceed almost the same amount of word count as the original text. Here's the original text about ${projectName}:\n\n${aboutText}`
                        }
                    ]
                });
                rewrittenText = response.content[0].text;
                break;
            } catch (err) {
                lastError = err;
                const message = (err && err.message) ? err.message : String(err);
                const isOverloaded = /overloaded/i.test(message) || /rate/i.test(message) || /429/.test(message) || /temporarily unavailable/i.test(message);
                const isRetryable = isOverloaded || /timeout/i.test(message) || /ECONNRESET/i.test(message) || /network/i.test(message);
                if (attempt < MAX_AI_RETRIES - 1 && isRetryable) {
                    const backoff = 1000 * Math.pow(2, attempt) + Math.floor(Math.random() * 500);
                    console.log(`[AI Rewriter] Retry ${attempt + 1}/${MAX_AI_RETRIES - 1} for ${projectName} in ${backoff}ms due to: ${message}`);
                    await new Promise(r => setTimeout(r, backoff));
                    continue;
                }
                throw err;
            }
        }
        
        console.log(`[AI Rewriter] Successfully rewritten about section for ${projectName}`);
        
        return {
            success: true,
            rewrittenText: rewrittenText.trim()
        };

    } catch (error) {
        console.error(`[AI Rewriter] Error rewriting about section for ${projectName}:`, error.message);
        
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Batch rewrite multiple about sections
 * @param {Array} projects - Array of project objects with about property
 * @returns {Promise<Array>} - Array of projects with rewritten_about property added
 */
export async function batchRewriteAboutSections(projects) {
    const results = [];
    
    for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        
        console.log(`[AI Rewriter] Processing ${i + 1}/${projects.length}: ${project.name || project.original_name}`);
        
        if (project.about && project.about.trim().length >= 50) {
            const rewriteResult = await rewriteAboutSection(project.about, project.name || project.original_name);
            
            if (rewriteResult.success) {
                project.rewritten_about = rewriteResult.rewrittenText;
                console.log(`[AI Rewriter] ✓ Successfully rewritten: ${project.name || project.original_name}`);
            } else {
                console.log(`[AI Rewriter] ✗ Failed to rewrite: ${project.name || project.original_name} - ${rewriteResult.error}`);
                // Don't add rewritten_about property if it fails
            }
        } else {
            console.log(`[AI Rewriter] ⚠ Skipping ${project.name || project.original_name} - about text too short or empty`);
        }
        
        results.push(project);
        
        // Add a small delay between requests to avoid rate limiting
        if (i < projects.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    return results;
}

/**
 * Test the AI rewriter with a sample text
 */
export async function testRewriter() {
    const sampleText = "ChatterPay is a Web3 wallet integrated into WhatsApp, enabling users to easily send, receive, and manage cryptocurrency through simple chat messages. Without requiring technical knowledge or separate apps, users can buy, swap, and hold assets such as Bitcoin, Ethereum, and stablecoins via a conversational interface.";
    
    console.log('Testing AI rewriter...');
    console.log('Original text:', sampleText);
    
    const result = await rewriteAboutSection(sampleText, 'Test Project');
    
    if (result.success) {
        console.log('Rewritten text:', result.rewrittenText);
    } else {
        console.log('Error:', result.error);
    }
    
    return result;
}
