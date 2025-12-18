import Mathematics from '@tiptap/extension-mathematics'

/**
 * Custom Mathematics Extension Configuration
 * 
 * Configures @tiptap/extension-mathematics with:
 * - KaTeX rendering options with error handling
 * - Input rules for $...$ (inline) and $$...$$ (block) syntax
 * - Error handling for invalid LaTeX
 * 
 * Requirements: 4.1, 4.4, 5.1, 5.4
 */

/**
 * KaTeX configuration options
 * - throwOnError: false - Don't throw on invalid LaTeX, show error instead
 * - errorColor: '#cc0000' - Red color for error indicators
 * - strict: false - Allow non-strict parsing for better compatibility
 * - trust: false - Don't trust user input for security
 * - displayMode: Controlled per-node (inline vs block)
 */
const katexOptions = {
  throwOnError: false,
  errorColor: '#cc0000',
  strict: false,
  trust: false,
  output: 'htmlAndMathml',
  macros: {
    // Common macros for convenience
    '\\R': '\\mathbb{R}',
    '\\N': '\\mathbb{N}',
    '\\Z': '\\mathbb{Z}',
    '\\Q': '\\mathbb{Q}',
    '\\C': '\\mathbb{C}'
  }
}

/**
 * Configured Mathematics Extension
 * 
 * Supports:
 * - Inline math: $...$ syntax (Requirement 4.1)
 * - Block math: $$...$$ syntax (Requirement 5.1)
 * - LaTeX editing and updates (Requirements 4.4, 5.4)
 * - Error handling for invalid LaTeX (Requirement 4.5)
 */
export const MathExtension = Mathematics.configure({
  katexOptions,
  // The extension handles both inline ($...$) and block ($$...$$) math
  // based on the regex patterns it uses internally
})

/**
 * Get the configured Mathematics extension
 * @returns {Extension} Configured Mathematics extension
 */
export function getMathExtension() {
  return Mathematics.configure({
    katexOptions
  })
}

/**
 * Validate LaTeX string synchronously (basic validation only)
 * Returns an object with isValid flag and error message if invalid
 * 
 * Note: For full KaTeX validation, use validateLatexAsync
 * 
 * @param {string} latex - LaTeX string to validate
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateLatex(latex) {
  if (!latex || typeof latex !== 'string') {
    return { isValid: false, error: 'LaTeX content is required' }
  }

  if (latex.trim().length === 0) {
    return { isValid: false, error: 'LaTeX content cannot be empty' }
  }

  // Basic validation passed - actual KaTeX rendering validation
  // happens in the extension with error display (Requirement 4.5)
  return { isValid: true }
}

/**
 * Validate LaTeX string with KaTeX rendering
 * Returns an object with isValid flag and error message if invalid
 * 
 * @param {string} latex - LaTeX string to validate
 * @returns {Promise<{ isValid: boolean, hasRenderError?: boolean, error?: string }>}
 */
export async function validateLatexAsync(latex) {
  if (!latex || typeof latex !== 'string') {
    return { isValid: false, error: 'LaTeX content is required' }
  }

  if (latex.trim().length === 0) {
    return { isValid: false, error: 'LaTeX content cannot be empty' }
  }

  // Try to render with KaTeX to check validity
  try {
    const katex = await import('katex')
    katex.default.renderToString(latex, { throwOnError: true })
    return { isValid: true }
  } catch (error) {
    // Return the error but still consider it "valid" for storage
    // The extension will show the error indicator (Requirement 4.5)
    return { 
      isValid: true, 
      hasRenderError: true,
      error: error.message 
    }
  }
}

/**
 * Check if a string contains inline math syntax ($...$)
 * @param {string} text - Text to check
 * @returns {boolean}
 */
export function hasInlineMath(text) {
  if (!text || typeof text !== 'string') return false
  // Match $...$ but not $$...$$
  const inlineMathRegex = /(?<!\$)\$(?!\$)([^$]+)\$(?!\$)/
  return inlineMathRegex.test(text)
}

/**
 * Check if a string contains block math syntax ($$...$$)
 * @param {string} text - Text to check
 * @returns {boolean}
 */
export function hasBlockMath(text) {
  if (!text || typeof text !== 'string') return false
  const blockMathRegex = /\$\$([^$]+)\$\$/
  return blockMathRegex.test(text)
}

/**
 * Extract LaTeX content from inline math syntax
 * @param {string} text - Text containing $...$
 * @returns {string|null} LaTeX content or null if not found
 */
export function extractInlineMath(text) {
  if (!text || typeof text !== 'string') return null
  const match = text.match(/(?<!\$)\$(?!\$)([^$]+)\$(?!\$)/)
  return match ? match[1] : null
}

/**
 * Extract LaTeX content from block math syntax
 * @param {string} text - Text containing $$...$$
 * @returns {string|null} LaTeX content or null if not found
 */
export function extractBlockMath(text) {
  if (!text || typeof text !== 'string') return null
  const match = text.match(/\$\$([^$]+)\$\$/)
  return match ? match[1] : null
}

export default MathExtension
