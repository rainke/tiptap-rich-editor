<script setup>
/**
 * BlockContextMenu - Context menu for block type conversion
 * 
 * Displays a floating menu with block type options when clicking the drag handle.
 * Uses Element Plus popover for positioning.
 * 
 * Requirements: 3.1, 3.2, 5.1, 5.2, 5.3
 */

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ElPopover } from 'element-plus'
import 'element-plus/es/components/popover/style/css'

const props = defineProps({
  editor: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

// Menu state
const isOpen = ref(false)
const referenceElement = ref(null)

// Current block info
const blockInfo = ref(null)

/**
 * Block type options - matching the image layout
 * Requirements: 5.1
 */
const blockTypes = [
  // Row 1
  { id: 'paragraph', label: 'Text', icon: 'T', type: 'paragraph' },
  { id: 'heading1', label: 'H1', icon: 'H₁', type: 'heading', attrs: { level: 1 } },
  { id: 'heading2', label: 'H2', icon: 'H₂', type: 'heading', attrs: { level: 2 } },
  { id: 'heading3', label: 'H3', icon: 'H₃', type: 'heading', attrs: { level: 3 } },
  { id: 'heading4', label: 'H4', icon: 'H₄', type: 'heading', attrs: { level: 4 } },
  { id: 'orderedList', label: 'Numbered', icon: '1.', type: 'orderedList' },
  // Row 2
  { id: 'bulletList', label: 'Bullet', icon: '•', type: 'bulletList' },
  { id: 'taskList', label: 'Task', icon: '☑', type: 'taskList' },
  { id: 'codeBlock', label: 'Code', icon: '{}', type: 'codeBlock' },
  { id: 'blockquote', label: 'Quote', icon: '❝', type: 'blockquote' },
  { id: 'callout', label: 'Callout', icon: '≡', type: 'callout' }
]

/**
 * Get current block type for highlighting
 */
const currentBlockType = computed(() => {
  if (!blockInfo.value?.node) return null
  
  const nodeType = blockInfo.value.node.type.name
  const attrs = blockInfo.value.node.attrs || {}
  
  if (nodeType === 'heading') {
    return `heading${attrs.level || 1}`
  }
  return nodeType
})

/**
 * Get current block type name for header display
 * Requirement 3.2: Display block type as menu header
 */
const blockTypeName = computed(() => {
  if (!blockInfo.value?.node) return 'Block'
  
  const nodeType = blockInfo.value.node.type.name
  const attrs = blockInfo.value.node.attrs || {}
  
  const typeNames = {
    paragraph: 'Text',
    heading: `Heading ${attrs.level || 1}`,
    bulletList: 'Bullet List',
    orderedList: 'Numbered List',
    blockquote: 'Quote',
    codeBlock: 'Code Block',
    listItem: 'List Item',
    taskList: 'Task List',
    horizontalRule: 'Divider'
  }
  
  return typeNames[nodeType] || nodeType.charAt(0).toUpperCase() + nodeType.slice(1)
})

/**
 * Open the context menu
 * Requirement 3.1: Menu appears adjacent to drag handle
 */
function open(refEl, block) {
  blockInfo.value = block
  referenceElement.value = refEl
  isOpen.value = true
}

/**
 * Close the context menu
 */
function close() {
  isOpen.value = false
  blockInfo.value = null
  emit('close')
}

/**
 * Handle block type selection
 * Requirements: 5.2, 5.3
 */
function handleTypeClick(blockType) {
  if (!props.editor || !blockInfo.value) {
    close()
    return
  }
  
  const { pos, node } = blockInfo.value
  convertBlockType(props.editor, pos, node, blockType)
  close()
}

/**
 * Convert block to a different type
 * Requirements: 5.2, 5.3
 */
function convertBlockType(editor, pos, node, blockType) {
  const { type, attrs } = blockType
  
  // Select the block content
  const from = pos + 1
  const to = pos + node.nodeSize - 1
  
  switch (type) {
    case 'paragraph':
      editor.chain()
        .focus()
        .setTextSelection({ from, to })
        .setParagraph()
        .run()
      break
      
    case 'heading':
      editor.chain()
        .focus()
        .setTextSelection({ from, to })
        .setHeading({ level: attrs?.level || 1 })
        .run()
      break
      
    case 'bulletList':
      editor.chain()
        .focus()
        .setTextSelection({ from, to })
        .toggleBulletList()
        .run()
      break
      
    case 'orderedList':
      editor.chain()
        .focus()
        .setTextSelection({ from, to })
        .toggleOrderedList()
        .run()
      break
      
    case 'taskList':
      // TaskList might not be available, fallback to bullet list
      if (editor.can().toggleTaskList) {
        editor.chain()
          .focus()
          .setTextSelection({ from, to })
          .toggleTaskList()
          .run()
      } else {
        editor.chain()
          .focus()
          .setTextSelection({ from, to })
          .toggleBulletList()
          .run()
      }
      break
      
    case 'codeBlock':
      editor.chain()
        .focus()
        .setTextSelection({ from, to })
        .setCodeBlock()
        .run()
      break
      
    case 'blockquote':
      if (node.type.name === 'blockquote') {
        editor.chain()
          .focus()
          .setTextSelection({ from, to })
          .lift('blockquote')
          .run()
      } else {
        editor.chain()
          .focus()
          .setTextSelection({ from, to })
          .setBlockquote()
          .run()
      }
      break
      
    case 'callout':
      // Callout might not be available, fallback to blockquote
      if (node.type.name === 'blockquote') {
        editor.chain()
          .focus()
          .setTextSelection({ from, to })
          .lift('blockquote')
          .run()
      } else {
        editor.chain()
          .focus()
          .setTextSelection({ from, to })
          .setBlockquote()
          .run()
      }
      break
      
    default:
      console.warn(`Unknown block type: ${type}`)
  }
}

/**
 * Handle click outside to close
 */
function handleClickOutside(event) {
  if (!isOpen.value) return
  
  // Check if click is inside the popover
  const popoverEl = document.querySelector('.block-type-popover')
  if (popoverEl && popoverEl.contains(event.target)) return
  
  // Check if click is on the reference element
  if (referenceElement.value && referenceElement.value.contains(event.target)) return
  
  close()
}

/**
 * Handle escape key
 */
function handleKeyDown(event) {
  if (event.key === 'Escape' && isOpen.value) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeyDown)
})

// Expose methods
defineExpose({
  open,
  close,
  isOpen
})
</script>

<template>
  <ElPopover
    :visible="isOpen"
    :virtual-ref="referenceElement"
    virtual-triggering
    placement="right-start"
    :offset="8"
    :show-arrow="false"
    popper-class="block-type-popover"
    :teleported="true"
  >
    <div class="block-type-menu">
      <!-- Header showing current block type - Requirement 3.2 -->
      <div class="block-type-header">
        {{ blockTypeName }}
      </div>
      
      <div class="block-type-grid">
        <button
          v-for="blockType in blockTypes"
          :key="blockType.id"
          class="block-type-item"
          :class="{ 'is-active': currentBlockType === blockType.id }"
          :title="blockType.label"
          @click="handleTypeClick(blockType)"
        >
          <span class="block-type-icon">{{ blockType.icon }}</span>
        </button>
      </div>
    </div>
  </ElPopover>
</template>

<style scoped>
.block-type-menu {
  padding: 8px;
}

.block-type-header {
  padding: 6px 8px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 8px;
}

.block-type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
}

.block-type-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid transparent;
  border-radius: 6px;
  background-color: transparent;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.block-type-item:hover {
  background-color: #f3f4f6;
  border-color: #e5e7eb;
}

.block-type-item.is-active {
  background-color: #dbeafe;
  border-color: #3b82f6;
  color: #1d4ed8;
}

.block-type-icon {
  font-family: system-ui, -apple-system, sans-serif;
}
</style>

<style>
/* Global styles for the popover */
.block-type-popover {
  padding: 0 !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}
</style>
