<script setup>
/**
 * TurnIntoSubmenu - Block type conversion submenu
 * 
 * Displays available block types for converting the current block.
 * Selecting a type converts the block while preserving text content.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 8.1
 */

import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import tippy from 'tippy.js'
import { BLOCK_TYPES, isConversionValid } from '../utils/blockTypes'

const props = defineProps({
  editor: {
    type: Object,
    required: true
  },
  blockInfo: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'typeSelected', 'conversionError'])

// Submenu state
const isOpen = ref(false)
const selectedIndex = ref(0)
const submenuRef = ref(null)
const tippyInstance = ref(null)

/**
 * Get current block type for highlighting
 */
const currentBlockType = computed(() => {
  if (!props.blockInfo?.node) return null
  const node = props.blockInfo.node
  return {
    type: node.type.name,
    attrs: node.attrs
  }
})

/**
 * Check if a block type option matches the current block
 */
function isCurrentType(blockType) {
  if (!currentBlockType.value) return false
  if (currentBlockType.value.type !== blockType.type) return false
  if (blockType.attrs?.level) {
    return currentBlockType.value.attrs?.level === blockType.attrs.level
  }
  return true
}

/**
 * Open the turn into submenu
 * Requirement 5.1: Display available Block_Type conversion options
 */
function open(referenceElement) {
  isOpen.value = true
  selectedIndex.value = 0
  
  nextTick(() => {
    if (submenuRef.value && referenceElement) {
      // Destroy existing tippy instance
      if (tippyInstance.value) {
        tippyInstance.value.destroy()
      }
      
      // Create new tippy instance for positioning
      tippyInstance.value = tippy(referenceElement, {
        content: submenuRef.value,
        trigger: 'manual',
        interactive: true,
        placement: 'right-start',
        offset: [0, 4],
        animation: 'shift-away',
        duration: [100, 100],
        appendTo: () => document.body,
        zIndex: 10000,
        onHide: () => {
          close()
        }
      })
      
      tippyInstance.value.show()
      submenuRef.value.focus()
    }
  })
}

/**
 * Close the turn into submenu
 */
function close() {
  isOpen.value = false
  
  if (tippyInstance.value) {
    tippyInstance.value.hide()
  }
  
  emit('close')
}

/**
 * Handle block type selection
 * Requirements: 5.2, 5.3, 5.4
 */
function selectType(blockType) {
  if (!props.editor || !props.blockInfo) {
    close()
    return
  }
  
  const sourceType = props.blockInfo.node.type.name
  const sourceAttrs = props.blockInfo.node.attrs || {}
  const validation = isConversionValid(sourceType, blockType.type, blockType.attrs, sourceAttrs)
  
  if (!validation.valid) {
    // Requirement 5.4: Display notification for invalid conversions
    emit('conversionError', validation.reason)
    close()
    return
  }
  
  emit('typeSelected', blockType)
  close()
}

/**
 * Handle keyboard navigation
 */
function handleKeyDown(event) {
  if (!isOpen.value) return
  
  switch (event.key) {
    case 'Escape':
      event.preventDefault()
      close()
      break
    
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = (selectedIndex.value + 1) % BLOCK_TYPES.length
      scrollToSelected()
      break
    
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = (selectedIndex.value - 1 + BLOCK_TYPES.length) % BLOCK_TYPES.length
      scrollToSelected()
      break
    
    case 'Enter':
      event.preventDefault()
      selectType(BLOCK_TYPES[selectedIndex.value])
      break
  }
}

/**
 * Scroll selected item into view
 */
function scrollToSelected() {
  nextTick(() => {
    if (submenuRef.value) {
      const selectedItem = submenuRef.value.querySelector('.type-item.is-selected')
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest' })
      }
    }
  })
}

// Event listeners
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown)
  
  if (tippyInstance.value) {
    tippyInstance.value.destroy()
  }
})

// Expose methods for external use
defineExpose({
  open,
  close,
  isOpen,
  BLOCK_TYPES
})
</script>

<template>
  <div
    v-show="isOpen"
    ref="submenuRef"
    class="turn-into-submenu"
    role="menu"
    tabindex="-1"
    @keydown="handleKeyDown"
  >
    <div class="submenu-header">Turn into</div>
    
    <div class="type-list">
      <button
        v-for="(blockType, index) in BLOCK_TYPES"
        :key="`${blockType.type}-${blockType.attrs?.level || ''}`"
        class="type-item"
        :class="{ 
          'is-selected': index === selectedIndex,
          'is-current': isCurrentType(blockType)
        }"
        role="menuitem"
        @click="selectType(blockType)"
        @mouseenter="selectedIndex = index"
      >
        <span class="type-icon">{{ blockType.icon }}</span>
        <span class="type-label">{{ blockType.label }}</span>
        <span v-if="isCurrentType(blockType)" class="type-check">✓</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/**
 * TurnIntoSubmenu Styles
 * Requirement 5.1: Block type conversion UI
 */

.turn-into-submenu {
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 6px;
  min-width: 200px;
  max-height: 320px;
  overflow-y: auto;
  outline: none;
}

.submenu-header {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  padding: 6px 10px 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.type-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.type-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  border: none;
  border-radius: 6px;
  background-color: transparent;
  cursor: pointer;
  text-align: left;
  font-size: 14px;
  color: #1f2937;
  transition: background-color 0.1s ease;
}

.type-item:hover,
.type-item.is-selected {
  background-color: #f3f4f6;
}

.type-item.is-selected {
  background-color: #e5e7eb;
}

.type-item.is-current {
  color: #3b82f6;
}

.type-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  background-color: #f3f4f6;
  border-radius: 4px;
  flex-shrink: 0;
}

.type-item.is-current .type-icon {
  color: #3b82f6;
  background-color: #dbeafe;
}

.type-label {
  flex: 1;
  font-weight: 400;
}

.type-check {
  font-size: 14px;
  color: #3b82f6;
  font-weight: bold;
}
</style>
