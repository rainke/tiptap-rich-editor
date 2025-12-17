import { describe, it, expect } from 'vitest'
import { toMarkdown, toHTML } from './markdownConverter'

describe('markdownConverter', () => {
  describe('toMarkdown', () => {
    it('converts headings to # syntax', () => {
      expect(toMarkdown('<h1>Title</h1>')).toBe('# Title')
      expect(toMarkdown('<h2>Subtitle</h2>')).toBe('## Subtitle')
      expect(toMarkdown('<h3>Section</h3>')).toBe('### Section')
    })

    it('converts bold text to ** syntax', () => {
      expect(toMarkdown('<strong>bold</strong>')).toBe('**bold**')
      expect(toMarkdown('<b>bold</b>')).toBe('**bold**')
    })

    it('converts italic text to * syntax', () => {
      expect(toMarkdown('<em>italic</em>')).toBe('*italic*')
      expect(toMarkdown('<i>italic</i>')).toBe('*italic*')
    })

    it('converts unordered lists to - syntax', () => {
      const html = '<ul><li>Item 1</li><li>Item 2</li></ul>'
      const md = toMarkdown(html)
      expect(md).toMatch(/-\s+Item 1/)
      expect(md).toMatch(/-\s+Item 2/)
    })

    it('converts ordered lists to 1. syntax', () => {
      const html = '<ol><li>First</li><li>Second</li></ol>'
      const md = toMarkdown(html)
      expect(md).toMatch(/1\.\s+First/)
      expect(md).toMatch(/2\.\s+Second/)
    })

    it('converts code blocks to fenced syntax', () => {
      const html = '<pre><code>const x = 1;</code></pre>'
      const md = toMarkdown(html)
      expect(md).toContain('```')
      expect(md).toContain('const x = 1;')
    })

    it('handles empty input', () => {
      expect(toMarkdown('')).toBe('')
      expect(toMarkdown(null)).toBe('')
      expect(toMarkdown(undefined)).toBe('')
      expect(toMarkdown('<p></p>')).toBe('')
    })
  })

  describe('toHTML', () => {
    it('converts # headings to h1-h6 tags', () => {
      expect(toHTML('# Title')).toContain('<h1>Title</h1>')
      expect(toHTML('## Subtitle')).toContain('<h2>Subtitle</h2>')
    })

    it('converts ** to strong tags', () => {
      expect(toHTML('**bold**')).toContain('<strong>bold</strong>')
    })

    it('converts * to em tags', () => {
      expect(toHTML('*italic*')).toContain('<em>italic</em>')
    })

    it('converts - lists to ul/li tags', () => {
      const html = toHTML('- Item 1\n- Item 2')
      expect(html).toContain('<ul>')
      expect(html).toContain('<li>Item 1</li>')
      expect(html).toContain('<li>Item 2</li>')
    })

    it('converts 1. lists to ol/li tags', () => {
      const html = toHTML('1. First\n2. Second')
      expect(html).toContain('<ol>')
      expect(html).toContain('<li>First</li>')
      expect(html).toContain('<li>Second</li>')
    })

    it('converts fenced code blocks to pre/code tags', () => {
      const html = toHTML('```\nconst x = 1;\n```')
      expect(html).toContain('<pre>')
      expect(html).toContain('<code>')
      expect(html).toContain('const x = 1;')
    })

    it('handles empty input', () => {
      expect(toHTML('')).toBe('')
      expect(toHTML(null)).toBe('')
      expect(toHTML(undefined)).toBe('')
    })
  })
})
