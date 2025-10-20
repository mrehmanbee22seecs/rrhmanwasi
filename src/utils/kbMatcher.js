/**
 * KB Matcher - TF-IDF and Fuzzy Matching System
 * No external APIs - Pure JavaScript implementation
 */

/**
 * Calculate Term Frequency (TF)
 */
function calculateTF(term, tokens) {
  const termCount = tokens.filter(t => t === term).length;
  return termCount / tokens.length;
}

/**
 * Calculate Inverse Document Frequency (IDF)
 */
function calculateIDF(term, allDocuments) {
  const docsWithTerm = allDocuments.filter(doc => 
    doc.tokens.includes(term)
  ).length;
  
  return Math.log(allDocuments.length / (1 + docsWithTerm));
}

/**
 * Calculate TF-IDF score
 */
function calculateTFIDF(term, tokens, allDocuments) {
  const tf = calculateTF(term, tokens);
  const idf = calculateIDF(term, allDocuments);
  return tf * idf;
}

/**
 * Normalize and tokenize text
 */
export function tokenize(text) {
  if (!text) return [];
  
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2) // Remove very short words
    .filter(word => !isStopWord(word)); // Remove stop words
}

/**
 * Common stop words to filter out
 */
const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
  'in', 'with', 'to', 'for', 'of', 'as', 'by', 'that', 'this',
  'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should',
  'can', 'may', 'might', 'must', 'from', 'about', 'into', 'through'
]);

function isStopWord(word) {
  return STOP_WORDS.has(word);
}

/**
 * Levenshtein distance for typo tolerance
 */
function levenshteinDistance(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate similarity between two strings (0-1)
 */
function stringSimilarity(str1, str2) {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1.0;
  
  const distance = levenshteinDistance(str1, str2);
  return 1 - (distance / maxLen);
}

/**
 * Calculate cosine similarity between query and document
 */
function cosineSimilarity(queryTokens, docTokens, allDocuments) {
  const uniqueTerms = new Set([...queryTokens, ...docTokens]);
  
  let dotProduct = 0;
  let queryMagnitude = 0;
  let docMagnitude = 0;
  
  for (const term of uniqueTerms) {
    const queryTFIDF = queryTokens.includes(term) 
      ? calculateTFIDF(term, queryTokens, allDocuments)
      : 0;
    
    const docTFIDF = docTokens.includes(term)
      ? calculateTFIDF(term, docTokens, allDocuments)
      : 0;
    
    dotProduct += queryTFIDF * docTFIDF;
    queryMagnitude += queryTFIDF * queryTFIDF;
    docMagnitude += docTFIDF * docTFIDF;
  }
  
  if (queryMagnitude === 0 || docMagnitude === 0) return 0;
  
  return dotProduct / (Math.sqrt(queryMagnitude) * Math.sqrt(docMagnitude));
}

/**
 * Fuzzy keyword matching with typo tolerance
 */
function fuzzyKeywordScore(queryTokens, docTokens) {
  let totalScore = 0;
  let matches = 0;
  
  for (const queryToken of queryTokens) {
    let bestMatch = 0;
    
    for (const docToken of docTokens) {
      const similarity = stringSimilarity(queryToken, docToken);
      
      // Allow typos: similarity > 0.75 counts as match
      if (similarity > 0.75) {
        bestMatch = Math.max(bestMatch, similarity);
      }
    }
    
    if (bestMatch > 0) {
      totalScore += bestMatch;
      matches++;
    }
  }
  
  return matches > 0 ? totalScore / queryTokens.length : 0;
}

/**
 * Extract relevant snippet from content
 */
function extractSnippet(content, queryTokens, maxLength = 300) {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let bestSentence = '';
  let bestScore = 0;
  
  for (const sentence of sentences) {
    const sentenceTokens = tokenize(sentence);
    const matches = queryTokens.filter(qt => 
      sentenceTokens.some(st => stringSimilarity(qt, st) > 0.75)
    ).length;
    
    const score = matches / queryTokens.length;
    
    if (score > bestScore) {
      bestScore = score;
      bestSentence = sentence.trim();
    }
  }
  
  // If snippet too long, truncate intelligently
  if (bestSentence.length > maxLength) {
    return bestSentence.substring(0, maxLength) + '...';
  }
  
  return bestSentence || content.substring(0, maxLength) + '...';
}

/**
 * Main matching function - Find best page match for user query
 * @param {string} query - User's question
 * @param {Array} pages - Array of KB pages from Firestore
 * @param {number} threshold - Minimum confidence score (default: 0.4)
 * @returns {Object|null} - Matched page with score and snippet
 */
export function findBestMatch(query, pages, threshold = 0.4) {
  if (!query || !pages || pages.length === 0) return null;
  
  // Expand query to include synonyms (including Roman Urdu) for better recall
  const queryTokens = expandQuery(query);
  if (queryTokens.length === 0) return null;
  
  let bestMatch = null;
  let bestScore = 0;
  
  for (const page of pages) {
    if (!page.tokens || page.tokens.length === 0) continue;
    
    // Combine multiple scoring methods
    const tfidfScore = cosineSimilarity(queryTokens, page.tokens, pages);
    const fuzzyScore = fuzzyKeywordScore(queryTokens, page.tokens);
    
    // Weighted combination
    const finalScore = (tfidfScore * 0.6) + (fuzzyScore * 0.4);
    
    if (finalScore > bestScore && finalScore >= threshold) {
      bestScore = finalScore;
      bestMatch = {
        page,
        score: finalScore,
        snippet: extractSnippet(page.content, queryTokens)
      };
    }
  }
  
  return bestMatch;
}

/**
 * Get common synonyms for query expansion
 */
const SYNONYMS = {
  // English core
  'help': ['assist', 'support', 'aid'],
  'volunteer': ['help', 'participate', 'contribute', 'join'],
  'donate': ['give', 'contribute', 'support', 'fund'],
  'project': ['program', 'initiative', 'activity'],
  'projects': ['programs', 'initiatives', 'activities'],
  'event': ['activity', 'program', 'gathering'],
  'events': ['activities', 'programs', 'gatherings'],
  'location': ['address', 'place', 'office', 'where'],
  'contact': ['reach', 'email', 'phone', 'call'],
  'about': ['info', 'information', 'what', 'who'],

  // Roman Urdu → English bridges
  'kya': ['what', 'about', 'info'],
  'kia': ['what', 'about', 'info'],
  'hai': ['is', 'about'],
  'kaise': ['how', 'apply', 'join', 'register'],
  'kesay': ['how', 'apply', 'join', 'register'],
  'kahan': ['where', 'location', 'address', 'office'],
  'kidhar': ['where', 'location', 'address', 'office'],
  'kab': ['when', 'time', 'schedule'],
  'madad': ['help', 'support', 'assist'],
  'rabta': ['contact', 'reach', 'email', 'phone'],
  'raabta': ['contact', 'reach', 'email', 'phone'],
  'volunteer': ['join', 'madad'], // keep both
  'shamil': ['join', 'participate'],
  'apply': ['register', 'join'],
  'register': ['apply', 'join'],
  'projectz': ['projects'],
  'ivent': ['event'],
  'ivents': ['events'],
  'wasilah': ['wasila', 'waseela', 'waseelaa'], // common variations
};

/**
 * Expand query with synonyms
 */
export function expandQuery(query) {
  const tokens = tokenize(query);
  const expanded = [...tokens];
  
  for (const token of tokens) {
    if (SYNONYMS[token]) {
      expanded.push(...SYNONYMS[token]);
    }
  }
  
  return [...new Set(expanded)]; // Remove duplicates
}

/**
 * Format bot response with source link
 */
export function formatResponse(match) {
  if (!match) {
    return {
      text: "Hmm, I couldn't find that right now, but I've noted it for our admin to check. You'll get an update soon!",
      sourceUrl: null,
      confidence: 0,
      needsAdmin: true
    };
  }
  
  const { page, score, snippet } = match;
  
  return {
    text: snippet,
    sourceUrl: page.url,
    sourcePage: page.title || page.url,
    confidence: score,
    needsAdmin: false
  };
}
