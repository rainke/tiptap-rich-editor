/**
 * Block Operations Utility
 * 
 * Provides commands for common block-level operations in the Tiptap editor.
 * These operations are used by the drag handle context menu.
 * 
 * Requirements: 2.3, 2.4, 6.1, 6.2, 6.3, 6.4, 8.2, 8.3
 */

import { Extension } from '@tiptap/core'
import { showInfo, showWarning, showError } from './notifications'

/**
 * Validate drop position for block move operation
 * Requirement 2.3: Move block to target position and update document structure
 * Requirement 2.4: Return block to original position if invalid drop
 * 
 * @param {Object} params - Validation parameters
 * @param {number} params.sourcePos - Original position of the block
 * @param {number} params.targetPos - Target drop position
 * @param {number} params.nodeSize - Size of the node being moved
 * @param {number} params.docSize - Total document size
 * @returns {Object} Validation result with isValid flag and reason
 */
export function validateDropPosition({ sourcePos, targetPos, nodeSize, docSize }) {
  // Check if positions are valid numbers
  if (typeof sourcePos !== 'number' || typeof targetPos !== 'number') {
    return {
      isValid: false,
      reason: 'Invalid position values'
    }
  }
  
  // Check if target is within document bounds
  if (targetPos < 0 || targetPos > docSize) {
    return {
      isValid: false,
      reason: 'Target position is outside document bounds'
    }
  }
  
  // Check if dropping onto itself (same position or within the node)
  const sourceEnd = sourcePos + nodeSize
  if (targetPos >= sourcePos && targetPos <= sourceEnd) {
    return {
      isValid: false,
      reason: 'Cannot drop block onto itself'
    }
  }
  
  // Check if target position is immediately adjacent (no actual move)
  // Dropping right before or right after the node results in no change
  if (targetPos === sourcePos || targetPos === sourceEnd) {
    return {
      isValid: false,
      reason: 'Block is already at this position'
    }
  }
  
  return {
    isValid: true,
    reason: null
  }
}

/**
 * Move a block from source position to target position
 * Requirement 2.3: Move block to target position and update document structure
 * Requirement 2.4: Handle invalid drop positions gracefully
 * Requirement 8.2: Allow reordering within the same list
 * Requirement 8.3: Operations affect entire block including nested elements
 * 
 * @param {Editor} editor - The Tiptap editor instance
 * @param {number} sourcePos - Original position of the block
 * @param {number} targetPos - Target drop position
 * @returns {boolean} Whether the move operation succeeded
 */
export function moveBlock(editor, sourcePos, targetPos) {
  if (!editor) {
    return false
  }
  
  const { state } = editor
  const { doc } = state
  const node = doc.nodeAt(sourcePos)
  
  if (!node) {
    showWarning('Could not find block to move')
    return false
  }
  
  const nodeSize = node.nodeSize
  const docSize = doc.content.size
  
  // Validate the drop position
  const validation = validateDropPosition({
    sourcePos,
    targetPos,
    nodeSize,
    docSize
  })
  
  if (!validation.isValid) {
    // Requirement 2.4: Return block to original position without modifying document
    // Since we're validating before the move, we just don't perform the operation
    if (validation.reason !== 'Block is already at this position') {
      showWarning(validation.reason || 'Invalid drop position')
    }
    return false
  }
  
  try {
    // Create a copy of the node content
    // Requirement 8.3: Preserve entire block including nested elements
    const nodeJSON = node.toJSON()
    
    // Determine the actual insert position after deletion
    // If target is after source, we need to adjust for the deleted content
    let adjustedTargetPos = targetPos
    if (targetPos > sourcePos) {
      adjustedTargetPos = targetPos - nodeSize
    }
    
    // Perform the move: delete from source, insert at target
    editor.chain()
      .focus()
      .deleteRange({ from: sourcePos, to: sourcePos + nodeSize })
      .insertContentAt(adjustedTargetPos, nodeJSON)
      .run()
    
    return true
  } catch (error) {
    console.error('Failed to move block:', error)
    showError('Failed to move block')
    return false
  }
}

/**
 * Move a list item within its parent list
 * Requirement 8.2: Allow reordering within the same list and moving to other positions
 * 
 * @param {Editor} editor - The Tiptap editor instance
 * @param {number} sourcePos - Position of the list item to move
 * @param {number} targetPos - Target position within the list
 * @returns {boolean} Whether the move operation succeeded
 */
export function moveListItem(editor, sourcePos, targetPos) {
  if (!editor) {
    return false
  }
  
  const { state } = editor
  const { doc } = state
  const node = doc.nodeAt(sourcePos)
  
  if (!node || node.type.name !== 'listItem') {
    showWarning('Could not find list item to move')
    return false
  }
  
  // Use the standard moveBlock function for list items
  // The drag handle extension handles the list context
  return moveBlock(editor, sourcePos, targetPos)
}

/**
 * Duplicate a block node
 * Requirement 6.1: Create an identical copy of the Block immediately below the original
 * 
 * @param {Editor} editor - The Tiptap editor instance
 * @param {number} pos - Position of the block to duplicate
 * @param {Node} node - The ProseMirror node to duplicate
 * @returns {boolean} Whether the operation succeeded
 */
export function duplicateBlock(editor, pos, node) {
  if (!editor || pos === undefined || !node) {
    return false
  }

  try {
    // Calculate insert position (immediately after the original block)
    const insertPos = pos + node.nodeSize
    
    // Create a deep copy of the node with all attributes and content preserved
    const nodeJSON = node.toJSON()
    
    // Insert the duplicated node
    editor.chain()
      .focus()
      .insertContentAt(insertPos, nodeJSON)
      .run()
    
    showInfo('Block duplicated')
    return true
  } catch (error) {
    console.error('Failed to duplicate block:', error)
    showError('Failed to duplicate block')
    return false
  }
}

/**
 * Copy block content to clipboard
 * Requirement 6.2: Copy the Block content to the system clipboard in both HTML and plain text formats
 * 
 * @param {Editor} editor - The Tiptap editor instance
 * @param {number} pos - Position of the block
 * @param {Node} node - The ProseMirror node to copy
 * @returns {Promise<boolean>} Whether the operation succeeded
 */
export async function copyBlockToClipboard(editor, pos, node) {
  if (!editor || !node) {
    return false
  }

  try {
    // Get plain text content
    const plainText = node.textContent || ''
    
    // Get HTML content by creating a temporary fragment
    // We need to serialize the node to HTML
    const htmlContent = getNodeHTML(editor, pos, node)
    
    // Try to use the modern Clipboard API with both formats
    if (navigator.clipboard && window.ClipboardItem) {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/plain': new Blob([plainText], { type: 'text/plain' }),
            'text/html': new Blob([htmlContent], { type: 'text/html' })
          })
        ])
        showInfo('Copied to clipboard')
        return true
      } catch (clipboardError) {
        // Fall back to text-only clipboard
        console.warn('ClipboardItem not supported, falling back to text:', clipboardError)
      }
    }
    
    // Fallback: copy plain text only
    await navigator.clipboard.writeText(plainText)
    showInfo('Copied to clipboard (text only)')
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    showError('Failed to copy to clipboard')
    return false
  }
}

/**
 * Get HTML representation of a node
 * @param {Editor} editor - The Tiptap editor instance
 * @param {number} pos - Position of the node
 * @param {Node} node - The ProseMirror node
 * @returns {string} HTML string
 */
function getNodeHTML(editor, pos, node) {
  try {
    // Create a temporary div to render the node
    const tempDiv = document.createElement('div')
    const fragment = editor.view.state.doc.slice(pos, pos + node.nodeSize)
    
    // Use the editor's serializer to convert to DOM
    const dom = editor.view.nodeDOM(pos)
    if (dom && dom.outerHTML) {
      return dom.outerHTML
    }
    
    // Fallback: create basic HTML from node type and content
    const nodeType = node.type.name
    const content = node.textContent || ''
    
    switch (nodeType) {
      case 'paragraph':
        return `<p>${content}</p>`
      case 'heading':
        const level = node.attrs?.level || 1
        return `<h${level}>${content}</h${level}>`
      case 'bulletList':
        return `<ul>${getListItemsHTML(node)}</ul>`
      case 'orderedList':
        return `<ol>${getListItemsHTML(node)}</ol>`
      case 'blockquote':
        return `<blockquote>${content}</blockquote>`
      case 'codeBlock':
        return `<pre><code>${content}</code></pre>`
      default:
        return `<div>${content}</div>`
    }
  } catch (error) {
    console.warn('Failed to get node HTML:', error)
    return node.textContent || ''
  }
}

/**
 * Get HTML for list items
 * @param {Node} listNode - The list node
 * @returns {string} HTML string of list items
 */
function getListItemsHTML(listNode) {
  let html = ''
  listNode.forEach(child => {
    if (child.type.name === 'listItem') {
      html += `<li>${child.textContent}</li>`
    }
  })
  return html
}

/**
 * Delete a block from the document
 * Requirement 6.3: Remove the Block from the document and move cursor to the adjacent Block
 * 
 * @param {Editor} editor - The Tiptap editor instance
 * @param {number} pos - Position of the block to delete
 * @param {Node} node - The ProseMirror node to delete
 * @returns {boolean} Whether the operation succeeded
 */
export function deleteBlock(editor, pos, node) {
  if (!editor || pos === undefined || !node) {
    return false
  }

  try {
    const docSize = editor.state.doc.content.size
    const endPos = pos + node.nodeSize
    
    // Determine where to place cursor after deletion
    // Prefer the block before, otherwise the block after
    let cursorPos = null
    
    if (pos > 0) {
      // There's content before - place cursor at end of previous block
      cursorPos = pos - 1
    } else if (endPos < docSize) {
      // There's content after - cursor will naturally move there
      cursorPos = pos
    }
    
    // Delete the block
    editor.chain()
      .focus()
      .deleteRange({ from: pos, to: endPos })
      .run()
    
    // If we have a cursor position and the document isn't empty, set focus
    if (cursorPos !== null && editor.state.doc.content.size > 0) {
      // Focus will be handled automatically by the deleteRange command
    }
    
    showInfo('Block deleted')
    return true
  } catch (error) {
    console.error('Failed to delete block:', error)
    showError('Failed to delete block')
    return false
  }
}

/**
 * Reset formatting on a block (remove all inline marks)
 * Requirement 6.4: Remove all inline formatting from the Block while preserving the text content
 * 
 * @param {Editor} editor - The Tiptap editor instance
 * @param {number} pos - Position of the block
 * @param {Node} node - The ProseMirror node to reset
 * @returns {boolean} Whether the operation succeeded
 */
export function resetBlockFormatting(editor, pos, node) {
  if (!editor || pos === undefined || !node) {
    return false
  }

  try {
    // Calculate the text range within the block
    // pos is the position before the node, pos + 1 is the start of content
    const from = pos + 1
    const to = pos + node.nodeSize - 1
    
    // Only proceed if there's actual content to reset
    if (from >= to) {
      showInfo('No formatting to reset')
      return true
    }
    
    // Select the block content and remove all marks
    editor.chain()
      .focus()
      .setTextSelection({ from, to })
      .unsetAllMarks()
      .run()
    
    showInfo('Formatting reset')
    return true
  } catch (error) {
    console.error('Failed to reset formatting:', error)
    showError('Failed to reset formatting')
    return false
  }
}

/**
 * Block Operations Extension
 * Adds custom commands for block operations to the editor
 */
export const BlockOperations = Extension.create({
  name: 'blockOperations',

  addCommands() {
    return {
      /**
       * Move a block from source position to target position
       * Requirements 2.3, 2.4
       */
      moveBlockTo: (sourcePos, targetPos) => ({ editor }) => {
        return moveBlock(editor, sourcePos, targetPos)
      },

      /**
       * Validate if a drop position is valid
       * Requirements 2.3, 2.4
       */
      validateBlockDrop: (sourcePos, targetPos) => ({ state }) => {
        const node = state.doc.nodeAt(sourcePos)
        if (!node) return { isValid: false, reason: 'Block not found' }
        
        return validateDropPosition({
          sourcePos,
          targetPos,
          nodeSize: node.nodeSize,
          docSize: state.doc.content.size
        })
      },

      /**
       * Duplicate a block at the given position
       * Requirement 6.1
       */
      duplicateBlockAt: (pos) => ({ editor, state }) => {
        const node = state.doc.nodeAt(pos)
        if (!node) return false
        return duplicateBlock(editor, pos, node)
      },

      /**
       * Copy a block to clipboard
       * Requirement 6.2
       */
      copyBlockAt: (pos) => ({ editor, state }) => {
        const node = state.doc.nodeAt(pos)
        if (!node) return false
        copyBlockToClipboard(editor, pos, node)
        return true
      },

      /**
       * Delete a block at the given position
       * Requirement 6.3
       */
      deleteBlockAt: (pos) => ({ editor, state }) => {
        const node = state.doc.nodeAt(pos)
        if (!node) return false
        return deleteBlock(editor, pos, node)
      },

      /**
       * Reset formatting on a block
       * Requirement 6.4
       */
      resetBlockFormattingAt: (pos) => ({ editor, state }) => {
        const node = state.doc.nodeAt(pos)
        if (!node) return false
        return resetBlockFormatting(editor, pos, node)
      },

      /**
       * Move a list item within its parent list
       * Requirement 8.2: Allow reordering within the same list
       */
      moveListItemTo: (sourcePos, targetPos) => ({ editor }) => {
        return moveListItem(editor, sourcePos, targetPos)
      }
    }
  }
})

export default BlockOperations
