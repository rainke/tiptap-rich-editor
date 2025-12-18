import Image from '@tiptap/extension-image'

/**
 * Custom Image Extension with extended attributes
 * 
 * Extends @tiptap/extension-image with:
 * - caption: Image caption text displayed below the image
 * - alignment: Image alignment (left, center, right)
 * - width: Image width in pixels
 * - height: Image height in pixels
 * 
 * Requirements: 1.2, 2.4, 3.2, 3.3
 */
export const CustomImage = Image.extend({
  name: 'image',

  addAttributes() {
    return {
      ...this.parent?.(),
      // Caption attribute - Requirement 3.3
      caption: {
        default: '',
        parseHTML: element => element.getAttribute('data-caption') || '',
        renderHTML: attributes => {
          if (!attributes.caption) {
            return {}
          }
          return {
            'data-caption': attributes.caption
          }
        }
      },
      // Alignment attribute - Requirement 2.4
      alignment: {
        default: 'center',
        parseHTML: element => element.getAttribute('data-alignment') || 'center',
        renderHTML: attributes => {
          return {
            'data-alignment': attributes.alignment,
            style: `display: block; margin-left: ${attributes.alignment === 'left' ? '0' : 'auto'}; margin-right: ${attributes.alignment === 'right' ? '0' : 'auto'};`
          }
        }
      },
      // Width attribute - Requirement 2.2
      width: {
        default: null,
        parseHTML: element => {
          const width = element.getAttribute('width') || element.style.width
          return width ? parseInt(width, 10) : null
        },
        renderHTML: attributes => {
          if (!attributes.width) {
            return {}
          }
          return {
            width: attributes.width
          }
        }
      },
      // Height attribute - Requirement 2.2
      height: {
        default: null,
        parseHTML: element => {
          const height = element.getAttribute('height') || element.style.height
          return height ? parseInt(height, 10) : null
        },
        renderHTML: attributes => {
          if (!attributes.height) {
            return {}
          }
          return {
            height: attributes.height
          }
        }
      }
    }
  },

  addCommands() {
    return {
      ...this.parent?.(),
      /**
       * Set image with extended attributes
       * Requirement 1.2: Insert image at cursor position
       */
      setImage: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options
        })
      },
      /**
       * Update image attributes
       * Requirements: 2.4 (alignment), 3.2 (alt), 3.3 (caption)
       */
      updateImageAttributes: (attributes) => ({ chain, state }) => {
        const { selection } = state
        const node = state.doc.nodeAt(selection.from)
        
        if (node?.type.name !== this.name) {
          return false
        }

        return chain()
          .updateAttributes(this.name, attributes)
          .run()
      }
    }
  },

  // Configure draggable and selectable options
  draggable: true,
  selectable: true
})

export default CustomImage
