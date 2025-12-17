import TurndownService from 'turndown'
import { marked } from 'marked'

/**
 * Markdown Converter Utility
 * Provides bidirectional conversion between HTML and Markdown
 * 
 * Requirements: 5.1-5.6, 6.1-6.3
 */

// Configure Turndown for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',           // Use # style headings
  hr: '---',                      // Horizontal rule style
  bulletListMarker: '-',          // Unordered list marker
  codeBlockStyle: 'fenced',       // Use ``` for code blocks
  fence: '```',                   // Code fence character
  emDelimiter: '*',               // Italic delimiter
  strongDelimiter: '**',          // Bold delimiter
})

// Configure Marked for Markdown to HTML conversion
marked.setOptions({
  gfm: true,                      // GitHub Flavored Markdown
  breaks: false,                  // Don't convert \n to <br>
})

/**
 * Convert HTML content to Markdown
 * 
 * @param {string} html - HTML string to convert
 * @returns {string} Markdown string
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */
export function toMarkdown(html) {
  if (!html || typeof html !== 'string') {
    return ''
  }
  
  // Handle empty paragraph tags
  const trimmedHtml = html.trim()
  if (trimmedHtml === '' || trimmedHtml === '<p></p>') {
    return ''
  }
  
  return turndownService.turndown(html)
}

/**
 * Convert Markdown content to HTML
 * 
 * @param {string} markdown - Markdown string to convert
 * @returns {string} HTML string
 * 
 * Requirements: 6.1, 6.2, 6.3
 */
export function toHTML(markdown) {
  if (!markdown || typeof markdown !== 'string') {
    return ''
  }
  
  const trimmedMarkdown = markdown.trim()
  if (trimmedMarkdown === '') {
    return ''
  }
  
  return marked.parse(markdown)
}

export default {
  toMarkdown,
  toHTML,
}
