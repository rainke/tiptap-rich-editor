<script setup>
/**
 * MathDialog - Dialog for editing LaTeX math formulas
 * 
 * Requirements: 4.3, 5.3
 * - LaTeX input textarea with syntax highlighting
 * - Live preview using KaTeX
 * - Error display for invalid LaTeX
 * - Support both inline and block mode
 */

import { ref, computed, watch, onMounted, nextTick } from 'vue'
import katex from 'katex'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  initialLatex: {
    type: String,
    default: ''
  },
  isBlock: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'confirm'])

// Form state
const latexInput = ref('')
const errorMessage = ref('')
const previewHtml = ref('')
const textareaRef = ref(null)

// Computed properties
const dialogTitle = computed(() => {
  return props.isBlock ? '编辑块级公式' : '编辑行内公式'
})

const placeholderText = computed(() => {
  return props.isBlock 
    ? '输入 LaTeX 公式，例如：\\frac{a}{b} 或 \\sum_{i=1}^{n} x_i'
    : '输入 LaTeX 公式，例如：x^2 + y^2 = z^2'
})

const canConfirm = computed(() => {
  return latexInput.value.trim().length > 0
})

// Watch for dialog visibility changes
watch(() => props.visible, async (newVal) => {
  if (newVal) {
    latexInput.value = props.initialLatex || ''
    errorMessage.value = ''
    renderPreview()
    await nextTick()
    textareaRef.value?.focus()
  }
})

// Watch for latex input changes to update preview
watch(latexInput, () => {
  renderPreview()
})

/**
 * Render LaTeX preview using KaTeX
 * Requirement 4.3, 5.3: Live preview
 */
function renderPreview() {
  const latex = latexInput.value.trim()
  
  if (!latex) {
    previewHtml.value = ''
    errorMessage.value = ''
    return
  }
  
  try {
    previewHtml.value = katex.renderToString(latex, {
      throwOnError: true,
      displayMode: props.isBlock,
      output: 'htmlAndMathml',
      strict: false,
      trust: false,
      macros: {
        '\\R': '\\mathbb{R}',
        '\\N': '\\mathbb{N}',
        '\\Z': '\\mathbb{Z}',
        '\\Q': '\\mathbb{Q}',
        '\\C': '\\mathbb{C}'
      }
    })
    errorMessage.value = ''
  } catch (error) {
    // Show error but still render with error indicator
    // Requirement 4.5: Display formula with error indicator
    errorMessage.value = error.message || '无效的 LaTeX 语法'
    try {
      previewHtml.value = katex.renderToString(latex, {
        throwOnError: false,
        displayMode: props.isBlock,
        errorColor: '#cc0000',
        output: 'htmlAndMathml',
        strict: false
      })
    } catch {
      previewHtml.value = `<span class="katex-error">${escapeHtml(latex)}</span>`
    }
  }
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Close the dialog
 */
function closeDialog() {
  emit('update:visible', false)
}

/**
 * Confirm and emit the LaTeX
 * Requirement 4.4, 5.4: Update rendered formula
 */
function confirmLatex() {
  if (!canConfirm.value) return
  emit('confirm', latexInput.value.trim())
  closeDialog()
}

/**
 * Handle backdrop click to close
 */
function handleBackdropClick(event) {
  if (event.target === event.currentTarget) {
    closeDialog()
  }
}

/**
 * Insert common LaTeX symbols/templates
 */
function insertTemplate(template) {
  const textarea = textareaRef.value
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = latexInput.value
  
  latexInput.value = text.substring(0, start) + template + text.substring(end)
  
  nextTick(() => {
    textarea.focus()
    const cursorPos = start + template.length
    textarea.setSelectionRange(cursorPos, cursorPos)
  })
}

// Common LaTeX templates for quick insertion
const templates = [
  { label: '分数', value: '\\frac{a}{b}' },
  { label: '上标', value: 'x^{2}' },
  { label: '下标', value: 'x_{i}' },
  { label: '根号', value: '\\sqrt{x}' },
  { label: '求和', value: '\\sum_{i=1}^{n}' },
  { label: '积分', value: '\\int_{a}^{b}' },
  { label: '极限', value: '\\lim_{x \\to \\infty}' },
  { label: '矩阵', value: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' }
]
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="visible" 
      class="math-dialog-overlay"
      @click="handleBackdropClick"
      @keydown.esc="closeDialog"
    >
      <div class="math-dialog" role="dialog" aria-labelledby="math-dialog-title">
        <!-- Header -->
        <div class="dialog-header">
          <h3 id="math-dialog-title" class="dialog-title">{{ dialogTitle }}</h3>
          <button 
            type="button" 
            class="close-button" 
            @click="closeDialog"
            aria-label="关闭"
          >
            ×
          </button>
        </div>
        
        <!-- Content -->
        <div class="dialog-content">
          <!-- LaTeX Input -->
          <div class="form-group">
            <label for="latex-input" class="form-label">LaTeX 公式</label>
            <textarea
              id="latex-input"
              ref="textareaRef"
              v-model="latexInput"
              class="latex-textarea"
              :class="{ 'has-error': errorMessage }"
              :placeholder="placeholderText"
              rows="4"
              spellcheck="false"
              @keydown.ctrl.enter="confirmLatex"
              @keydown.meta.enter="confirmLatex"
            ></textarea>
            <p class="input-hint">提示：按 Ctrl+Enter 快速确认</p>
          </div>
          
          <!-- Quick Templates -->
          <div class="templates-section">
            <p class="templates-label">快速插入：</p>
            <div class="templates-grid">
              <button
                v-for="tpl in templates"
                :key="tpl.value"
                type="button"
                class="template-btn"
                :title="tpl.value"
                @click="insertTemplate(tpl.value)"
              >
                {{ tpl.label }}
              </button>
            </div>
          </div>
          
          <!-- Error Message -->
          <div v-if="errorMessage" class="error-message">
            <span class="error-icon">⚠️</span>
            {{ errorMessage }}
          </div>
          
          <!-- Preview Area -->
          <div class="preview-section">
            <p class="preview-label">预览</p>
            <div 
              class="preview-container"
              :class="{ 'block-mode': isBlock, 'has-content': previewHtml }"
            >
              <div 
                v-if="previewHtml" 
                class="preview-content"
                v-html="previewHtml"
              ></div>
              <p v-else class="preview-placeholder">
                在上方输入 LaTeX 公式查看预览
              </p>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="dialog-footer">
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="closeDialog"
          >
            取消
          </button>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="!canConfirm"
            @click="confirmLatex"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Dialog Overlay */
.math-dialog-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10000;
}

/* Dialog Container */
.math-dialog {
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Header */
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.dialog-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background-color: transparent;
  color: #6b7280;
  font-size: 24px;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
}

.close-button:hover {
  background-color: #f3f4f6;
  color: #1f2937;
}

/* Content */
.dialog-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* Form Elements */
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.latex-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  color: #1f2937;
  background-color: #fafafa;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;
}

.latex-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background-color: #fff;
}

.latex-textarea.has-error {
  border-color: #f59e0b;
}

.latex-textarea.has-error:focus {
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.input-hint {
  margin: 6px 0 0;
  font-size: 12px;
  color: #9ca3af;
}

/* Templates Section */
.templates-section {
  margin-bottom: 16px;
}

.templates-label {
  margin: 0 0 8px;
  font-size: 13px;
  color: #6b7280;
}

.templates-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.template-btn {
  padding: 4px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background-color: #f9fafb;
  color: #4b5563;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
}

.template-btn:hover {
  background-color: #f3f4f6;
  border-color: #d1d5db;
}

/* Error Message */
.error-message {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 16px;
  padding: 10px 12px;
  background-color: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 6px;
  color: #92400e;
  font-size: 13px;
}

.error-icon {
  flex-shrink: 0;
}

/* Preview Section */
.preview-section {
  margin-top: 16px;
}

.preview-label {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.preview-container {
  padding: 20px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-container.block-mode {
  padding: 24px;
}

.preview-container.has-content {
  background-color: #fff;
}

.preview-content {
  font-size: 16px;
  line-height: 1.6;
  overflow-x: auto;
  max-width: 100%;
}

.preview-container.block-mode .preview-content {
  font-size: 18px;
}

.preview-placeholder {
  margin: 0;
  color: #9ca3af;
  font-size: 14px;
  font-style: italic;
}

/* KaTeX error styling */
.preview-content :deep(.katex-error) {
  color: #cc0000;
  font-family: monospace;
}

/* Footer */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

/* Buttons */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s, opacity 0.15s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #f9fafb;
}

.btn-primary {
  background-color: #3b82f6;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}
</style>
