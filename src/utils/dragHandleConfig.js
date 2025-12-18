/**
 * Drag Handle Configuration
 * 
 * Provides keyboard shortcut extension for block context menu.
 * The main drag handle functionality is now handled by @tiptap/extension-drag-handle-vue-3
 * 
 * Requirements: 7.1, 7.4
 */

import { Extension } from '@tiptap/core'

/**
 * Supported block types for drag handle
 * Requirement 8.1: Handle appears for all block types
 */
const SUPPORTED_BLOCK_TYPES = [
  'paragraph',
  'heading',
  'bulletList',
  'orderedList',
  'blockquote',
  'codeBlock',
  'listItem'
]

/**
 * BlockContextMenuShortcut Extension
 * 
 * Adds keyboard shortcut (Cmd/Ctrl + /) to open the block context menu
 * Requirement 7.1: Configurable keyboard shortcut to open menu for current block
 */
export const BlockContextMenuShortcut = Extension.create({
  name: 'blockContextMenuShortcut',
  
  addKeyboardShortcuts() {
    return {
      // Requirement 7.1: Cmd/Ctrl + / opens context menu for current block
      'Mod-/': ({ editor }) => {
        // Dispatch a custom event that the TiptapEditor can listen to
        const event = new CustomEvent('open-block-context-menu', {
          detail: { editor }
        })
        document.dispatchEvent(event)
        return true
      }
    }
  }
})

export default BlockContextMenuShortcut
