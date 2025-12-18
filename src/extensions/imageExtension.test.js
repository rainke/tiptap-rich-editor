import { describe, it, expect } from 'vitest'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { CustomImage } from './imageExtension'

/**
 * Tests for CustomImage Extension
 * Requirements: 1.2, 2.4, 3.2, 3.3
 */

function createEditor(content = '<p></p>') {
  return new Editor({
    extensions: [
      StarterKit,
      CustomImage
    ],
    content
  })
}

describe('CustomImage Extension', () => {
  describe('setImage command', () => {
    it('inserts image with src attribute - Requirement 1.2', () => {
      const editor = createEditor()
      
      editor.commands.setImage({ src: 'https://example.com/image.png' })
      
      const json = editor.getJSON()
      const imageNode = json.content.find(node => node.type === 'image')
      
      expect(imageNode).toBeDefined()
      expect(imageNode.attrs.src).toBe('https://example.com/image.png')
      
      editor.destroy()
    })

    it('inserts image with all extended attributes', () => {
      const editor = createEditor()
      
      editor.commands.setImage({
        src: 'https://example.com/image.png',
        alt: 'Test image',
        caption: 'This is a caption',
        alignment: 'left',
        width: 400,
        height: 300
      })
      
      const json = editor.getJSON()
      const imageNode = json.content.find(node => node.type === 'image')
      
      expect(imageNode.attrs.src).toBe('https://example.com/image.png')
      expect(imageNode.attrs.alt).toBe('Test image')
      expect(imageNode.attrs.caption).toBe('This is a caption')
      expect(imageNode.attrs.alignment).toBe('left')
      expect(imageNode.attrs.width).toBe(400)
      expect(imageNode.attrs.height).toBe(300)
      
      editor.destroy()
    })
  })

  describe('default attributes', () => {
    it('has default alignment of center', () => {
      const editor = createEditor()
      
      editor.commands.setImage({ src: 'https://example.com/image.png' })
      
      const json = editor.getJSON()
      const imageNode = json.content.find(node => node.type === 'image')
      
      expect(imageNode.attrs.alignment).toBe('center')
      
      editor.destroy()
    })

    it('has empty caption by default', () => {
      const editor = createEditor()
      
      editor.commands.setImage({ src: 'https://example.com/image.png' })
      
      const json = editor.getJSON()
      const imageNode = json.content.find(node => node.type === 'image')
      
      expect(imageNode.attrs.caption).toBe('')
      
      editor.destroy()
    })

    it('has null width and height by default', () => {
      const editor = createEditor()
      
      editor.commands.setImage({ src: 'https://example.com/image.png' })
      
      const json = editor.getJSON()
      const imageNode = json.content.find(node => node.type === 'image')
      
      expect(imageNode.attrs.width).toBeNull()
      expect(imageNode.attrs.height).toBeNull()
      
      editor.destroy()
    })
  })

  describe('updateImageAttributes command', () => {
    it('updates alignment attribute - Requirement 2.4', () => {
      const editor = createEditor()
      
      // Insert image
      editor.commands.setImage({ src: 'https://example.com/image.png' })
      
      // Select the image node
      editor.commands.setNodeSelection(0)
      
      // Update alignment
      editor.commands.updateImageAttributes({ alignment: 'right' })
      
      const json = editor.getJSON()
      const imageNode = json.content.find(node => node.type === 'image')
      
      expect(imageNode.attrs.alignment).toBe('right')
      
      editor.destroy()
    })

    it('updates alt text attribute - Requirement 3.2', () => {
      const editor = createEditor()
      
      editor.commands.setImage({ src: 'https://example.com/image.png' })
      editor.commands.setNodeSelection(0)
      editor.commands.updateImageAttributes({ alt: 'Updated alt text' })
      
      const json = editor.getJSON()
      const imageNode = json.content.find(node => node.type === 'image')
      
      expect(imageNode.attrs.alt).toBe('Updated alt text')
      
      editor.destroy()
    })

    it('updates caption attribute - Requirement 3.3', () => {
      const editor = createEditor()
      
      editor.commands.setImage({ src: 'https://example.com/image.png' })
      editor.commands.setNodeSelection(0)
      editor.commands.updateImageAttributes({ caption: 'New caption' })
      
      const json = editor.getJSON()
      const imageNode = json.content.find(node => node.type === 'image')
      
      expect(imageNode.attrs.caption).toBe('New caption')
      
      editor.destroy()
    })
  })

  describe('draggable and selectable', () => {
    it('image node is draggable', () => {
      const editor = createEditor()
      
      editor.commands.setImage({ src: 'https://example.com/image.png' })
      
      const imageType = editor.schema.nodes.image
      expect(imageType.spec.draggable).toBe(true)
      
      editor.destroy()
    })

    it('image node is selectable', () => {
      const editor = createEditor()
      
      editor.commands.setImage({ src: 'https://example.com/image.png' })
      
      const imageType = editor.schema.nodes.image
      expect(imageType.spec.selectable).toBe(true)
      
      editor.destroy()
    })
  })
})
