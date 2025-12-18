/**
 * Block Types Configuration
 * 
 * Predefined block types for "Turn Into" conversion.
 * 
 * Requirement 5.1: Display available Block_Type conversion options
 * Requirement 8.1: Support all block types (Paragraph, Heading, BulletList, OrderedList, Blockquote, CodeBlock)
 */

/**
 * All supported block types for drag handle operations
 * Requirement 8.1: Handle appears for all block types
 */
export const SUPPORTED_BLOCK_TYPES = [
  'paragraph',
  'heading',
  'bulletList',
  'orderedList',
  'blockquote',
  'codeBlock',
  'listItem'
]

/**
 * Check if a node type is supported by the drag handle
 * Requirement 8.1: Handle appears for all supported block types
 * 
 * @param {string} nodeType - The node type name
 * @returns {boolean} Whether the node type is supported
 */
export function isSupportedBlockType(nodeType) {
  return SUPPORTED_BLOCK_TYPES.includes(nodeType)
}

export const BLOCK_TYPES = [
  { 
    type: 'paragraph', 
    label: 'Text', 
    icon: '¶',
    description: 'Plain text paragraph'
  },
  { 
    type: 'heading', 
    label: 'Heading 1', 
    icon: 'H1', 
    attrs: { level: 1 },
    description: 'Large section heading'
  },
  { 
    type: 'heading', 
    label: 'Heading 2', 
    icon: 'H2', 
    attrs: { level: 2 },
    description: 'Medium section heading'
  },
  { 
    type: 'heading', 
    label: 'Heading 3', 
    icon: 'H3', 
    attrs: { level: 3 },
    description: 'Small section heading'
  },
  { 
    type: 'bulletList', 
    label: 'Bullet List', 
    icon: '•',
    description: 'Unordered list with bullets'
  },
  { 
    type: 'orderedList', 
    label: 'Numbered List', 
    icon: '1.',
    description: 'Ordered list with numbers'
  },
  { 
    type: 'codeBlock', 
    label: 'Code Block', 
    icon: '</>',
    description: 'Code snippet block'
  },
  { 
    type: 'blockquote', 
    label: 'Quote', 
    icon: '"',
    description: 'Quote or callout block'
  }
]

/**
 * Get block type info by type name
 * @param {string} typeName - The node type name
 * @param {object} attrs - Optional attributes (e.g., heading level)
 * @returns {object|null} Block type info or null if not found
 */
export function getBlockTypeInfo(typeName, attrs = {}) {
  return BLOCK_TYPES.find(bt => {
    if (bt.type !== typeName) return false
    if (bt.attrs && attrs) {
      // Check if attrs match (e.g., heading level)
      return Object.keys(bt.attrs).every(key => bt.attrs[key] === attrs[key])
    }
    return !bt.attrs
  }) || null
}

/**
 * Check if a conversion is valid
 * @param {string} sourceType - Source block type
 * @param {string} targetType - Target block type
 * @param {object} targetAttrs - Target block attributes
 * @param {object} sourceAttrs - Source block attributes
 * @returns {object} { valid: boolean, reason?: string }
 */
export function isConversionValid(sourceType, targetType, targetAttrs = {}, sourceAttrs = {}) {
  // Same type conversion - check if it's actually a change
  if (sourceType === targetType) {
    if (targetType === 'heading') {
      // Allow heading level changes
      if (targetAttrs.level !== sourceAttrs.level) {
        return { valid: true }
      }
      return { valid: true, reason: 'Already this heading level' }
    }
    return { valid: true, reason: 'Already this type' }
  }
  
  // List items can only be converted within list context
  if (sourceType === 'listItem') {
    return { 
      valid: false, 
      reason: 'List items cannot be converted directly. Convert the entire list instead.' 
    }
  }
  
  // Code blocks have special handling - warn about potential formatting loss
  if (sourceType === 'codeBlock' && targetType !== 'paragraph') {
    // Code blocks can be converted but may lose formatting
    return { valid: true }
  }
  
  // Blockquotes with nested content
  if (sourceType === 'blockquote' && (targetType === 'bulletList' || targetType === 'orderedList')) {
    // This is valid but content structure may change
    return { valid: true }
  }
  
  // All other conversions are valid
  return { valid: true }
}

export default BLOCK_TYPES
