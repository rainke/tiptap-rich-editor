/**
 * Block Color Extension
 * 
 * Extends paragraph and heading nodes to support background colors.
 * Provides commands to set and remove block background colors.
 * 
 * Requirements: 4.2, 4.3, 4.4
 */

import { Extension } from '@tiptap/core'

/**
 * Block Color Extension
 * Adds backgroundColor attribute to block nodes and provides commands
 */
export const BlockColor = Extension.create({
  name: 'blockColor',

  addGlobalAttributes() {
    return [
      {
        // Apply to these node types
        types: ['paragraph', 'heading', 'blockquote', 'codeBlock', 'bulletList', 'orderedList', 'listItem'],
        attributes: {
          backgroundColor: {
            default: null,
            // Parse from HTML
            parseHTML: element => element.style.backgroundColor || null,
            // Render to HTML
            renderHTML: attributes => {
              if (!attributes.backgroundColor || attributes.backgroundColor === 'transparent') {
                return {}
              }
              return {
                style: `background-color: ${attributes.backgroundColor}; border-radius: 4px; padding: 2px 4px; margin: -2px -4px;`
              }
            }
          }
        }
      }
    ]
  },

  addCommands() {
    return {
      /**
       * Set block background color
       * Requirement 4.2: Apply selected background color to entire block
       * 
       * @param {string} color - CSS color value or 'transparent' to remove
       */
      setBlockColor: (color) => ({ chain, state }) => {
        const { selection } = state
        const { $anchor } = selection
        
        // Find the block node at current position
        let depth = $anchor.depth
        while (depth > 0 && $anchor.node(depth).isInline) {
          depth--
        }
        
        if (depth === 0) return false
        
        const node = $anchor.node(depth)
        const pos = $anchor.start(depth) - 1
        
        // Requirement 4.3: "Default" removes color (set to null/transparent)
        const colorValue = color === 'transparent' ? null : color
        
        return chain()
          .updateAttributes(node.type.name, { backgroundColor: colorValue })
          .run()
      },

      /**
       * Set block color at specific position
       * Used when applying color from context menu with known block position
       * 
       * @param {number} pos - Position of the block node
       * @param {string} color - CSS color value
       */
      setBlockColorAt: (pos, color) => ({ tr, dispatch }) => {
        const node = tr.doc.nodeAt(pos)
        if (!node) return false
        
        // Requirement 4.3: "Default" removes color
        const colorValue = color === 'transparent' ? null : color
        
        if (dispatch) {
          // Requirement 4.4: Persist color in document data
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            backgroundColor: colorValue
          })
        }
        
        return true
      },

      /**
       * Remove block background color
       * Requirement 4.3: "Default" option removes custom background color
       */
      removeBlockColor: () => ({ commands }) => {
        return commands.setBlockColor('transparent')
      }
    }
  }
})

export default BlockColor
