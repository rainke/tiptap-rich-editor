<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import { BubbleMenuPlugin } from '@tiptap/extension-bubble-menu'
import { Markdown } from '@tiptap/markdown'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { ref, watch, onBeforeUnmount, onMounted } from 'vue'
import EditorToolbar from './EditorToolbar.vue'
import BubbleMenuToolbar from './BubbleMenuToolbar.vue'
import { toHTML } from '../utils/markdownConverter'
import { SlashCommand } from '../utils/slashCommand'

/**
 * TiptapEditor - Main rich text editor component
 * 
 * Requirements: 1.1, 2.1-2.10, 7.1, 7.2
 */

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Start typing...'
  },
  editable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'update'])

// Ref for bubble menu element - Requirements 1.1, 1.2
const bubbleMenuRef = ref(null)

// Initialize Tiptap editor with StarterKit and extensions
const editor = useEditor({
  content: props.modelValue,
  editable: props.editable,
  extensions: [
    Markdown,
    StarterKit.configure({
      // StarterKit includes: Bold, Italic, Strike, Code, Heading, BulletList, 
      // OrderedList, Blockquote, CodeBlock, HorizontalRule, etc.
      // Markdown shortcuts are enabled by default via inputRules
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        rel: 'noopener noreferrer',
        target: '_blank'
      }
    }),
    Placeholder.configure({
      placeholder: props.placeholder
    }),
    SlashCommand
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
    emit('update', editor)
  }
})

// Register BubbleMenu plugin after editor is ready - Requirements 1.1, 1.2, 1.3
onMounted(() => {
  if (editor.value && bubbleMenuRef.value) {
    editor.value.registerPlugin(
      BubbleMenuPlugin({
        pluginKey: 'bubbleMenu',
        editor: editor.value,
        element: bubbleMenuRef.value,
        shouldShow: ({ editor: ed, state }) => {
          // Only show when there's a non-empty selection - Requirements 1.1, 1.2
          return !state.selection.empty && ed.isEditable
        },
        // Tippy.js options - Requirements 5.2 (animations), 5.4 (positioning)
        tippyOptions: {
          // Positioning - Requirement 5.4: avoid obscuring selected text
          placement: 'top',
          offset: [0, 8],
          // Flip to bottom if not enough space above
          popperOptions: {
            modifiers: [
              {
                name: 'flip',
                options: {
                  fallbackPlacements: ['bottom', 'top-start', 'top-end', 'bottom-start', 'bottom-end']
                }
              },
              {
                name: 'preventOverflow',
                options: {
                  boundary: 'viewport',
                  padding: 8
                }
              }
            ]
          },
          // Animation - Requirement 5.2: smooth appear/disappear
          animation: 'shift-away',
          duration: [150, 100],
          // Additional options for better UX
          interactive: true,
          appendTo: () => document.body,
          zIndex: 9999
        }
      })
    )
  }
})

// Watch for external modelValue changes
watch(() => props.modelValue, (newValue) => {
  if (editor.value && newValue !== editor.value.getHTML()) {
    editor.value.commands.setContent(newValue, false)
  }
})

// Watch for editable prop changes
watch(() => props.editable, (newValue) => {
  if (editor.value) {
    editor.value.setEditable(newValue)
  }
})

// Cleanup on unmount
onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})

/**
 * Export methods - Requirements 4.1, 4.2, 4.3, 5.1-5.6
 */

// Get HTML content from editor
function getHTML() {
  if (!editor.value) return ''
  return editor.value.getHTML()
}

// Get Markdown content from editor
function getMarkdown() {
  if (!editor.value) return ''
  return editor.value.getMarkdown()
}

/**
 * Import methods - Requirements 3.1, 3.2, 3.3, 6.1, 6.2, 6.3
 */

// Set HTML content in editor
function setHTML(html) {
  if (!editor.value) return
  try {
    editor.value.commands.setContent(html || '', false)
  } catch (e) {
    // Handle malformed HTML gracefully - Requirement 3.2
    console.warn('Failed to set HTML content:', e)
    editor.value.commands.setContent('', false)
  }
}

// Set Markdown content in editor
function setMarkdown(markdown) {
  if (!editor.value) return
  try {
    const html = toHTML(markdown || '')
    editor.value.commands.setContent(html, false)
  } catch (e) {
    // Handle malformed Markdown gracefully
    console.warn('Failed to set Markdown content:', e)
    editor.value.commands.setContent('', false)
  }
}

// Get editor instance
function getEditor() {
  return editor.value
}

// Expose methods for parent components
defineExpose({
  getHTML,
  setHTML,
  getMarkdown,
  setMarkdown,
  getEditor
})
</script>


<template>
  <div class="tiptap-editor">
    <EditorToolbar :editor="editor" />
    <EditorContent :editor="editor" class="editor-content" />
    <!-- Bubble Menu element - Requirements 1.1, 1.2, 1.3, 1.4 -->
    <div ref="bubbleMenuRef" class="bubble-menu">
      <BubbleMenuToolbar :editor="editor" />
    </div>
  </div>
</template>

<style scoped>
/**
 * TiptapEditor Styles
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */

/* Main editor container - Requirement 7.1: visible boundaries */
.tiptap-editor {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

/* Focus state for entire editor - Requirement 7.2 */
.tiptap-editor:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Editable content area - Requirement 7.1: clearly defined editable area */
.editor-content {
  min-height: 200px;
  padding: 16px 20px;
  background-color: #fff;
  border-top: 1px solid #e5e7eb;
}

/* Tiptap editor core styles */
.editor-content :deep(.tiptap) {
  outline: none;
  min-height: 168px;
  line-height: 1.6;
  color: #1f2937;
  font-size: 16px;
}

/* Placeholder styling */
.editor-content :deep(.tiptap p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: #9ca3af;
  pointer-events: none;
  height: 0;
  font-style: italic;
}

/* Heading styles */
.editor-content :deep(.tiptap h1) {
  font-size: 2em;
  font-weight: 700;
  margin: 0.67em 0;
  color: #111827;
  line-height: 1.2;
}

.editor-content :deep(.tiptap h2) {
  font-size: 1.5em;
  font-weight: 600;
  margin: 0.75em 0;
  color: #1f2937;
  line-height: 1.3;
}

.editor-content :deep(.tiptap h3) {
  font-size: 1.25em;
  font-weight: 600;
  margin: 0.83em 0;
  color: #1f2937;
  line-height: 1.4;
}

.editor-content :deep(.tiptap h4) {
  font-size: 1.1em;
  font-weight: 600;
  margin: 1em 0;
  color: #374151;
}

.editor-content :deep(.tiptap h5) {
  font-size: 1em;
  font-weight: 600;
  margin: 1.17em 0;
  color: #374151;
}

.editor-content :deep(.tiptap h6) {
  font-size: 0.9em;
  font-weight: 600;
  margin: 1.33em 0;
  color: #4b5563;
}

/* Paragraph spacing */
.editor-content :deep(.tiptap p) {
  margin: 0.75em 0;
}

.editor-content :deep(.tiptap p:first-child) {
  margin-top: 0;
}

.editor-content :deep(.tiptap p:last-child) {
  margin-bottom: 0;
}

/* List styles */
.editor-content :deep(.tiptap ul),
.editor-content :deep(.tiptap ol) {
  padding-left: 1.5em;
  margin: 1em 0;
}

.editor-content :deep(.tiptap li) {
  margin: 0.25em 0;
}

.editor-content :deep(.tiptap li p) {
  margin: 0;
}

/* Blockquote styles */
.editor-content :deep(.tiptap blockquote) {
  border-left: 4px solid #3b82f6;
  padding-left: 1em;
  margin: 1em 0;
  color: #4b5563;
  background-color: #f9fafb;
  padding: 0.75em 1em;
  border-radius: 0 4px 4px 0;
}

/* Code block styles */
.editor-content :deep(.tiptap pre) {
  background-color: #1f2937;
  border-radius: 6px;
  padding: 1em 1.25em;
  overflow-x: auto;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 0.9em;
  color: #e5e7eb;
  margin: 1em 0;
}

/* Inline code styles */
.editor-content :deep(.tiptap code) {
  background-color: #f3f4f6;
  border-radius: 4px;
  padding: 0.2em 0.4em;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 0.9em;
  color: #dc2626;
}

.editor-content :deep(.tiptap pre code) {
  background: none;
  padding: 0;
  color: inherit;
}

/* Horizontal rule */
.editor-content :deep(.tiptap hr) {
  border: none;
  border-top: 2px solid #e5e7eb;
  margin: 1.5em 0;
}

/* Link styles */
.editor-content :deep(.tiptap a) {
  color: #2563eb;
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 0.15s ease;
}

.editor-content :deep(.tiptap a:hover) {
  color: #1d4ed8;
}

/* Bold and italic */
.editor-content :deep(.tiptap strong) {
  font-weight: 600;
}

.editor-content :deep(.tiptap em) {
  font-style: italic;
}

/* Strikethrough */
.editor-content :deep(.tiptap s) {
  text-decoration: line-through;
  color: #6b7280;
}

/* Underline */
.editor-content :deep(.tiptap u) {
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* Selection highlight */
.editor-content :deep(.tiptap ::selection) {
  background-color: rgba(59, 130, 246, 0.3);
}

/* Bubble Menu base styles - Requirements 1.1, 5.1, 5.2, 5.4 */
.bubble-menu {
  background-color: #fff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 4px 8px;
}

/* Tippy.js animation styles - Requirement 5.2: smooth appear/disappear animations */
.bubble-menu[data-animation='shift-away'][data-state='hidden'] {
  opacity: 0;
}

.bubble-menu[data-animation='shift-away'][data-state='visible'] {
  opacity: 1;
}

.bubble-menu[data-animation='shift-away'][data-placement^='top'][data-state='hidden'] {
  transform: translateY(8px);
}

.bubble-menu[data-animation='shift-away'][data-placement^='bottom'][data-state='hidden'] {
  transform: translateY(-8px);
}

/* CSS transition for smooth animation - Requirement 5.2 */
.bubble-menu {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
</style>
