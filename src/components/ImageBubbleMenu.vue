<script setup>
/**
 * ImageBubbleMenu - Bubble menu for image editing options
 * 
 * Requirements: 2.3, 2.4, 7.1
 * - Alignment buttons (left, center, right)
 * - Edit button to open properties dialog
 * - Delete button to remove image
 */

import { computed } from 'vue'

const props = defineProps({
  editor: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['edit'])

/**
 * Get current image alignment
 * Requirement 2.3: Display alignment options
 */
const currentAlignment = computed(() => {
  if (!props.editor) return 'center'
  const attrs = props.editor.getAttributes('image')
  return attrs.alignment || 'center'
})

/**
 * Alignment options configuration
 * Requirement 2.3: left, center, right alignment options
 */
const alignmentOptions = [
  { value: 'left', icon: '◀', title: '左对齐' },
  { value: 'center', icon: '◆', title: '居中' },
  { value: 'right', icon: '▶', title: '右对齐' }
]

/**
 * Set image alignment
 * Requirement 2.4: Apply selected alignment to the image
 */
function setAlignment(alignment) {
  if (!props.editor) return
  props.editor.chain().focus().updateAttributes('image', { alignment }).run()
}

/**
 * Open edit dialog for image properties
 * Requirement 3.1: Double-click opens properties dialog
 */
function openEditDialog() {
  emit('edit')
}

/**
 * Delete the selected image
 * Requirement 7.1: Delete selected image
 */
function deleteImage() {
  if (!props.editor) return
  props.editor.chain().focus().deleteSelection().run()
}
</script>

<template>
  <div class="image-bubble-menu" v-if="editor">
    <!-- Alignment buttons - Requirement 2.3, 2.4 -->
    <div class="button-group alignment-group">
      <button
        v-for="option in alignmentOptions"
        :key="option.value"
        type="button"
        class="bubble-button"
        :class="{ 'is-active': currentAlignment === option.value }"
        :title="option.title"
        @click="setAlignment(option.value)"
      >
        {{ option.icon }}
      </button>
    </div>
    
    <div class="separator"></div>
    
    <!-- Edit button - Requirement 3.1 -->
    <button
      type="button"
      class="bubble-button"
      title="编辑图片属性"
      @click="openEditDialog"
    >
      ✏️
    </button>
    
    <div class="separator"></div>
    
    <!-- Delete button - Requirement 7.1 -->
    <button
      type="button"
      class="bubble-button delete-button"
      title="删除图片"
      @click="deleteImage"
    >
      🗑️
    </button>
  </div>
</template>

<style scoped>
/**
 * ImageBubbleMenu Styles
 * Requirements: 2.3 (alignment options), 5.1 (compact design)
 */

/* Menu container */
.image-bubble-menu {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 6px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Button group for alignment */
.button-group {
  display: flex;
  align-items: center;
  gap: 2px;
}

/* Separator between button groups */
.separator {
  width: 1px;
  height: 20px;
  background-color: #e5e7eb;
  margin: 0 4px;
}

/* Button base styles */
.bubble-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 4px 6px;
  border: 1px solid transparent;
  border-radius: 4px;
  background-color: transparent;
  color: #4b5563;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

/* Hover state */
.bubble-button:hover {
  background-color: #f3f4f6;
  border-color: #e5e7eb;
  color: #1f2937;
}

/* Focus state */
.bubble-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
}

.bubble-button:focus:not(:focus-visible) {
  box-shadow: none;
}

/* Active state for alignment buttons */
.bubble-button.is-active {
  background-color: #3b82f6;
  color: #fff;
  border-color: #2563eb;
}

.bubble-button.is-active:hover {
  background-color: #2563eb;
  border-color: #1d4ed8;
}

/* Delete button special styling */
.delete-button:hover {
  background-color: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}
</style>
