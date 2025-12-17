<script setup>
import { ref } from 'vue'
import TiptapEditor from './components/TiptapEditor.vue'

/**
 * App.vue - Main application with TiptapEditor integration
 * Requirements: All - Demonstrates full editor functionality
 */

const editorRef = ref(null)
const editorContent = ref('')
const exportedHTML = ref('')
const exportedMarkdown = ref('')
const importText = ref('')
const importFormat = ref('html')

// Export HTML from editor
function exportHTML() {
  if (editorRef.value) {
    exportedHTML.value = editorRef.value.getHTML()
  }
}

// Export Markdown from editor
function exportMarkdown() {
  if (editorRef.value) {
    exportedMarkdown.value = editorRef.value.getMarkdown()
  }
}

// Import content into editor
function importContent() {
  if (editorRef.value && importText.value) {
    if (importFormat.value === 'html') {
      editorRef.value.setHTML(importText.value)
    } else {
      editorRef.value.setMarkdown(importText.value)
    }
  }
}

// Clear editor content
function clearEditor() {
  if (editorRef.value) {
    editorRef.value.setHTML('')
  }
  exportedHTML.value = ''
  exportedMarkdown.value = ''
}

// Sample Markdown for demo
const sampleMarkdown = `# Welcome to Tiptap Editor

This is a **rich text editor** with *Markdown* support.

## Features

- Bold, italic, and ~~strikethrough~~ text
- Headings (H1-H6)
- Ordered and unordered lists

### Code Example

\`\`\`
const greeting = "Hello, World!"
console.log(greeting)
\`\`\`

> This is a blockquote for important notes.

---

Try typing Markdown shortcuts like \`# \` for headings or \`- \` for lists!`

function loadSampleMarkdown() {
  if (editorRef.value) {
    editorRef.value.setMarkdown(sampleMarkdown)
  }
}
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <h1>Tiptap Rich Text Editor</h1>
      <p>A Vue 3 rich text editor with Markdown support</p>
    </header>

    <main class="app-main">
      <!-- Editor Section -->
      <section class="editor-section">
        <TiptapEditor
          ref="editorRef"
          v-model="editorContent"
          placeholder="Start typing or use Markdown shortcuts..."
        />
      </section>

      <!-- Demo Controls Section -->
      <section class="controls-section">
        <div class="controls-grid">
          <!-- Export Controls -->
          <div class="control-group">
            <h3>Export Content</h3>
            <div class="button-group">
              <button @click="exportHTML" class="btn btn-primary">
                Export HTML
              </button>
              <button @click="exportMarkdown" class="btn btn-primary">
                Export Markdown
              </button>
              <button @click="clearEditor" class="btn btn-secondary">
                Clear
              </button>
            </div>
          </div>

          <!-- Import Controls -->
          <div class="control-group">
            <h3>Import Content</h3>
            <div class="import-controls">
              <select v-model="importFormat" class="format-select">
                <option value="html">HTML</option>
                <option value="markdown">Markdown</option>
              </select>
              <button @click="importContent" class="btn btn-primary">
                Import
              </button>
              <button @click="loadSampleMarkdown" class="btn btn-secondary">
                Load Sample
              </button>
            </div>
            <textarea
              v-model="importText"
              class="import-textarea"
              placeholder="Paste HTML or Markdown content here..."
              rows="4"
            ></textarea>
          </div>
        </div>

        <!-- Export Output -->
        <div class="output-section" v-if="exportedHTML || exportedMarkdown">
          <div class="output-group" v-if="exportedHTML">
            <h4>Exported HTML</h4>
            <pre class="output-pre">{{ exportedHTML }}</pre>
          </div>
          <div class="output-group" v-if="exportedMarkdown">
            <h4>Exported Markdown</h4>
            <pre class="output-pre">{{ exportedMarkdown }}</pre>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>


<style scoped>
.app-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-header {
  text-align: center;
  margin-bottom: 32px;
}

.app-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.app-header p {
  color: #6b7280;
  margin: 0;
}

.app-main {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.editor-section {
  width: 100%;
}

.controls-section {
  background: #f9fafb;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e5e7eb;
}

.controls-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 640px) {
  .controls-grid {
    grid-template-columns: 1fr;
  }
}

.control-group h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
}

.button-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-primary:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.btn-secondary {
  background: white;
  color: #374151;
  border-color: #d1d5db;
}

.btn-secondary:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.import-controls {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.format-select {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  background: white;
  color: #374151;
  cursor: pointer;
}

.format-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.import-textarea {
  width: 100%;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  font-family: 'Fira Code', Monaco, Consolas, monospace;
  resize: vertical;
  box-sizing: border-box;
}

.import-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.output-section {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.output-group h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.output-pre {
  background: #1f2937;
  color: #e5e7eb;
  padding: 16px;
  border-radius: 6px;
  font-size: 13px;
  font-family: 'Fira Code', Monaco, Consolas, monospace;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
}
</style>
