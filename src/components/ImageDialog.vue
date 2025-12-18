<script setup>
/**
 * ImageDialog - Dialog for inserting images via URL or file upload
 * 
 * Requirements: 1.1, 1.2, 1.3
 * - URL input field with validation
 * - File upload with drag-and-drop support
 * - Preview area for selected image
 */

import { ref, computed, watch } from 'vue'
import { isValidImageUrl, fileToBase64, validateImageFile, SUPPORTED_IMAGE_EXTENSIONS } from '../utils/imageUtils'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  editor: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'insert'])

// Form state
const imageUrl = ref('')
const selectedFile = ref(null)
const previewSrc = ref('')
const errorMessage = ref('')
const isLoading = ref(false)
const isDragging = ref(false)
const activeTab = ref('url') // 'url' or 'upload'

// Computed validation state
const isUrlValid = computed(() => {
  if (!imageUrl.value.trim()) return true // Empty is not invalid, just incomplete
  return isValidImageUrl(imageUrl.value)
})

const canInsert = computed(() => {
  if (activeTab.value === 'url') {
    return imageUrl.value.trim() && isUrlValid.value && !isLoading.value
  }
  return previewSrc.value && !isLoading.value
})

// Watch for dialog visibility changes to reset state
watch(() => props.visible, (newVal) => {
  if (newVal) {
    resetForm()
  }
})

/**
 * Reset form to initial state
 */
function resetForm() {
  imageUrl.value = ''
  selectedFile.value = null
  previewSrc.value = ''
  errorMessage.value = ''
  isLoading.value = false
  isDragging.value = false
  activeTab.value = 'url'
}

/**
 * Close the dialog
 */
function closeDialog() {
  emit('update:visible', false)
}

/**
 * Handle URL input change - validate and preview
 * Requirement 1.2: Validate image URL
 */
async function handleUrlInput() {
  errorMessage.value = ''
  previewSrc.value = ''
  
  const url = imageUrl.value.trim()
  if (!url) return
  
  if (!isValidImageUrl(url)) {
    errorMessage.value = '请输入有效的图片 URL'
    return
  }
  
  // Try to load the image for preview
  isLoading.value = true
  try {
    await loadImagePreview(url)
    previewSrc.value = url
  } catch (err) {
    errorMessage.value = '无法加载图片，请检查 URL 是否正确'
  } finally {
    isLoading.value = false
  }
}

/**
 * Load image to verify it's accessible
 */
function loadImagePreview(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = src
  })
}

/**
 * Handle file selection from input
 * Requirement 1.3: Convert local file to base64
 */
async function handleFileSelect(event) {
  const file = event.target.files?.[0]
  if (file) {
    await processFile(file)
  }
}

/**
 * Handle drag over event
 */
function handleDragOver(event) {
  event.preventDefault()
  isDragging.value = true
}

/**
 * Handle drag leave event
 */
function handleDragLeave(event) {
  event.preventDefault()
  isDragging.value = false
}

/**
 * Handle file drop
 * Requirement 1.3: Support drag-and-drop file upload
 */
async function handleDrop(event) {
  event.preventDefault()
  isDragging.value = false
  
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    await processFile(file)
  }
}

/**
 * Process selected/dropped file
 * Requirement 1.3: Validate and convert to base64
 */
async function processFile(file) {
  errorMessage.value = ''
  previewSrc.value = ''
  
  // Validate file
  const validation = validateImageFile(file)
  if (!validation.valid) {
    errorMessage.value = validation.error
    return
  }
  
  isLoading.value = true
  try {
    const base64 = await fileToBase64(file)
    selectedFile.value = file
    previewSrc.value = base64
    activeTab.value = 'upload'
  } catch (err) {
    errorMessage.value = '文件读取失败，请重试'
  } finally {
    isLoading.value = false
  }
}

/**
 * Insert image into editor
 * Requirement 1.2, 1.3: Insert image at cursor position
 */
function insertImage() {
  if (!canInsert.value) return
  
  const src = activeTab.value === 'url' ? imageUrl.value.trim() : previewSrc.value
  
  const imageData = {
    src,
    alt: '',
    title: '',
    caption: '',
    alignment: 'center'
  }
  
  emit('insert', imageData)
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
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="visible" 
      class="image-dialog-overlay"
      @click="handleBackdropClick"
      @keydown.esc="closeDialog"
    >
      <div class="image-dialog" role="dialog" aria-labelledby="dialog-title">
        <!-- Header -->
        <div class="dialog-header">
          <h3 id="dialog-title" class="dialog-title">插入图片</h3>
          <button 
            type="button" 
            class="close-button" 
            @click="closeDialog"
            aria-label="关闭"
          >
            ×
          </button>
        </div>
        
        <!-- Tabs -->
        <div class="dialog-tabs">
          <button
            type="button"
            class="tab-button"
            :class="{ active: activeTab === 'url' }"
            @click="activeTab = 'url'"
          >
            URL 链接
          </button>
          <button
            type="button"
            class="tab-button"
            :class="{ active: activeTab === 'upload' }"
            @click="activeTab = 'upload'"
          >
            上传文件
          </button>
        </div>
        
        <!-- Content -->
        <div class="dialog-content">
          <!-- URL Tab -->
          <div v-if="activeTab === 'url'" class="tab-content">
            <div class="form-group">
              <label for="image-url" class="form-label">图片 URL</label>
              <input
                id="image-url"
                v-model="imageUrl"
                type="url"
                class="form-input"
                :class="{ 'is-invalid': imageUrl && !isUrlValid }"
                placeholder="https://example.com/image.png"
                @blur="handleUrlInput"
                @keydown.enter="handleUrlInput"
              />
            </div>
          </div>
          
          <!-- Upload Tab -->
          <div v-if="activeTab === 'upload'" class="tab-content">
            <div
              class="drop-zone"
              :class="{ 'is-dragging': isDragging, 'has-file': selectedFile }"
              @dragover="handleDragOver"
              @dragleave="handleDragLeave"
              @drop="handleDrop"
            >
              <input
                type="file"
                class="file-input"
                accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                @change="handleFileSelect"
              />
              <div class="drop-zone-content">
                <span class="drop-icon">📷</span>
                <p class="drop-text">
                  拖拽图片到此处，或
                  <span class="browse-link">点击选择文件</span>
                </p>
                <p class="drop-hint">
                  支持 {{ SUPPORTED_IMAGE_EXTENSIONS.join(', ') }} 格式，最大 5MB
                </p>
              </div>
            </div>
          </div>
          
          <!-- Error Message -->
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          
          <!-- Preview Area -->
          <div v-if="previewSrc" class="preview-area">
            <p class="preview-label">预览</p>
            <div class="preview-container">
              <img :src="previewSrc" alt="图片预览" class="preview-image" />
            </div>
          </div>
          
          <!-- Loading State -->
          <div v-if="isLoading" class="loading-state">
            <span class="loading-spinner"></span>
            <span>加载中...</span>
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
            :disabled="!canInsert"
            @click="insertImage"
          >
            插入
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Dialog Overlay */
.image-dialog-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10000;
}

/* Dialog Container */
.image-dialog {
  width: 100%;
  max-width: 480px;
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

/* Tabs */
.dialog-tabs {
  display: flex;
  padding: 0 20px;
  border-bottom: 1px solid #e5e7eb;
}

.tab-button {
  padding: 12px 16px;
  border: none;
  border-bottom: 2px solid transparent;
  background-color: transparent;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.tab-button:hover {
  color: #1f2937;
}

.tab-button.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

/* Content */
.dialog-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.tab-content {
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #1f2937;
  background-color: #fff;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.is-invalid {
  border-color: #ef4444;
}

.form-input.is-invalid:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* Drop Zone */
.drop-zone {
  position: relative;
  padding: 32px 20px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s;
}

.drop-zone:hover,
.drop-zone.is-dragging {
  border-color: #3b82f6;
  background-color: #f0f9ff;
}

.drop-zone.has-file {
  border-color: #10b981;
  background-color: #ecfdf5;
}

.file-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.drop-zone-content {
  pointer-events: none;
}

.drop-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}

.drop-text {
  margin: 0 0 4px;
  font-size: 14px;
  color: #4b5563;
}

.browse-link {
  color: #3b82f6;
  font-weight: 500;
}

.drop-hint {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
}

/* Error Message */
.error-message {
  margin-top: 12px;
  padding: 10px 12px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 13px;
}

/* Preview Area */
.preview-area {
  margin-top: 16px;
}

.preview-label {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.preview-container {
  padding: 12px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  text-align: center;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
}

/* Loading State */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px;
  color: #6b7280;
  font-size: 14px;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
