/**
 * Auto-Learn Service - ChatGPT-like Intelligence
 * Automatically learns from website content without manual feeding
 * Uses hidden iframe to scrape all pages without navigation
 * 100% client-side, zero cost, works on Firebase Spark plan
 */

import { tokenize } from '../utils/kbMatcher';
import { 
  scrapeCurrentPage, 
  discoverSitePages, 
  saveScrapedKB, 
  loadScrapedKB,
  mergeWithKB 
} from './contentScraperService';
import { getEnhancedKB } from './localKbService';

interface AutoLearnPage {
  id: string;
  url: string;
  title: string;
  content: string;
  tokens: string[];
  keywords: string[];
  headings: string[];
  lastUpdated: Date;
  source: 'auto-learned';
}

/**
 * Scrape a page using hidden iframe (no navigation needed)
 */
async function scrapePageViaIframe(url: string): Promise<AutoLearnPage | null> {
  return new Promise((resolve) => {
    // Create hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.style.width = '0';
    iframe.style.height = '0';
    document.body.appendChild(iframe);
    
    let timeoutId: NodeJS.Timeout;
    
    const cleanup = () => {
      clearTimeout(timeoutId);
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };
    
    // Timeout after 5 seconds
    timeoutId = setTimeout(() => {
      cleanup();
      console.warn(`Timeout scraping ${url}`);
      resolve(null);
    }, 5000);
    
    iframe.onload = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) {
          cleanup();
          resolve(null);
          return;
        }
        
        // Extract content
        const title = doc.title;
        const main = doc.querySelector('main') || doc.body;
        
        if (!main) {
          cleanup();
          resolve(null);
          return;
        }
        
        // Extract text (similar to contentScraperService)
        const clone = main.cloneNode(true) as HTMLElement;
        
        // Remove unwanted elements
        const unwantedSelectors = [
          'nav', 'header', 'footer', 'script', 'style', 'iframe',
          '.nav', '.header', '.footer', '.menu', '.sidebar',
          '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]'
        ];
        
        unwantedSelectors.forEach(selector => {
          clone.querySelectorAll(selector).forEach(el => el.remove());
        });
        
        let content = clone.textContent || '';
        content = content.replace(/\s+/g, ' ').trim();
        
        // Extract headings
        const headings: string[] = [];
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
          main.querySelectorAll(tag).forEach(heading => {
            const text = heading.textContent?.trim();
            if (text) headings.push(text);
          });
        });
        
        if (content.length < 50) {
          cleanup();
          resolve(null);
          return;
        }
        
        // Tokenize
        const tokens = tokenize(content);
        const keywords = headings.flatMap(h => tokenize(h));
        
        const page: AutoLearnPage = {
          id: url.replace(/^\//, '').replace(/\/$/, '').replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'home',
          url,
          title,
          content: content.substring(0, 10000),
          tokens: tokens.slice(0, 1000),
          keywords: [...new Set(keywords)].slice(0, 50),
          headings,
          lastUpdated: new Date(),
          source: 'auto-learned'
        };
        
        cleanup();
        resolve(page);
      } catch (error) {
        console.error(`Error processing iframe content for ${url}:`, error);
        cleanup();
        resolve(null);
      }
    };
    
    iframe.onerror = () => {
      cleanup();
      resolve(null);
    };
    
    // Load the page
    iframe.src = url;
  });
}

/**
 * Auto-learn from all website pages
 */
export async function autoLearnFromWebsite(
  onProgress?: (current: number, total: number, url: string) => void
): Promise<AutoLearnPage[]> {
  console.log('🧠 Starting auto-learning from website...');
  
  // Discover pages
  const pages = discoverSitePages();
  const learned: AutoLearnPage[] = [];
  
  console.log(`📚 Discovered ${pages.length} pages to learn from`);
  
  // Scrape current page first (no iframe needed)
  const currentPage = scrapeCurrentPage();
  if (currentPage) {
    learned.push({
      ...currentPage,
      source: 'auto-learned'
    } as AutoLearnPage);
  }
  
  // Scrape other pages via iframe
  for (let i = 0; i < pages.length; i++) {
    const url = pages[i];
    
    // Skip current page (already scraped)
    if (url === window.location.pathname) continue;
    
    if (onProgress) {
      onProgress(i + 1, pages.length, url);
    }
    
    try {
      const page = await scrapePageViaIframe(url);
      if (page) {
        learned.push(page);
        console.log(`✓ Learned: ${url} (${page.tokens.length} tokens)`);
      } else {
        console.log(`⏭️ Skipped: ${url} (no content)`);
      }
      
      // Small delay between requests to avoid overwhelming
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error learning from ${url}:`, error);
    }
  }
  
  console.log(`✅ Auto-learning complete! Learned from ${learned.length}/${pages.length} pages`);
  
  // Save to localStorage
  saveScrapedKB(learned);
  
  return learned;
}

/**
 * Get smart KB that combines manual seed + auto-learned content
 */
export function getSmartKB(): any[] {
  console.log('🤖 Loading smart KB...');
  
  // Load manual seed data
  const manualKB = getEnhancedKB();
  console.log(`📖 Loaded ${manualKB.length} manual KB entries`);
  
  // Load auto-learned content
  const autoLearnedKB = loadScrapedKB();
  console.log(`🧠 Loaded ${autoLearnedKB.length} auto-learned entries`);
  
  // Merge both
  const smartKB = mergeWithKB(autoLearnedKB, manualKB);
  console.log(`✨ Smart KB ready with ${smartKB.length} total entries`);
  
  return smartKB;
}

/**
 * Check if auto-learning is needed
 */
export function needsAutoLearning(): boolean {
  const scraped = loadScrapedKB();
  
  // Need learning if no scraped data
  if (scraped.length === 0) return true;
  
  // Need learning if data is old (7+ days)
  try {
    const data = localStorage.getItem('wasilah_scraped_kb');
    if (!data) return true;
    
    const parsed = JSON.parse(data);
    const lastUpdated = new Date(parsed.lastUpdated);
    const now = new Date();
    const daysSince = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
    
    return daysSince > 7;
  } catch {
    return true;
  }
}

/**
 * Initialize auto-learning on app start (background)
 */
export function initAutoLearning(): void {
  // Check if learning is needed
  if (!needsAutoLearning()) {
    console.log('✅ KB is up to date, skipping auto-learning');
    return;
  }
  
  console.log('🚀 Initializing background auto-learning...');
  
  // Run in background after a delay
  setTimeout(() => {
    autoLearnFromWebsite((current, total, url) => {
      console.log(`Learning progress: ${current}/${total} - ${url}`);
    }).catch(error => {
      console.error('Auto-learning failed:', error);
    });
  }, 5000); // Wait 5 seconds before starting
}

/**
 * Force refresh KB (called from admin panel)
 */
export async function forceRefreshKB(
  onProgress?: (current: number, total: number, url: string) => void
): Promise<number> {
  console.log('🔄 Force refreshing KB...');
  
  const learned = await autoLearnFromWebsite(onProgress);
  
  console.log(`✅ KB refreshed with ${learned.length} pages`);
  return learned.length;
}

/**
 * Get KB statistics
 */
export function getKBStatistics() {
  const manualKB = getEnhancedKB();
  const autoLearnedKB = loadScrapedKB();
  const smartKB = getSmartKB();
  
  const totalTokens = smartKB.reduce((sum, page) => sum + (page.tokens?.length || 0), 0);
  
  return {
    manualEntries: manualKB.length,
    autoLearnedEntries: autoLearnedKB.length,
    totalEntries: smartKB.length,
    totalTokens,
    averageTokensPerPage: Math.round(totalTokens / smartKB.length),
    lastUpdated: autoLearnedKB.length > 0 ? new Date(autoLearnedKB[0].lastUpdated) : null
  };
}
