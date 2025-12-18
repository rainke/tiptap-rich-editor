<script setup>
/**
 * ColorSubmenu - Color picker submenu for block background colors
 * 
 * Displays a palette of predefined background colors for blocks.
 * Selecting a color applies it to the current block.
 * Supports all block types: Paragraph, Heading, BulletList, OrderedList, Blockquote, CodeBlock
 * 
 * Requirements: 4.1, 4.2, 4.3, 8.1
 */

import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import tippy from 'tippy.js'
import { BLOCK_COLORS } from '../utils/blockColors'

const props = defineProps({
  editor: {
    type: Object,
    required: true
  },
  blockInfo: {
    type: Object,
    default: null
  },
  referenceEl: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'colorSelected'])

// Submenu state
const isOpen = ref(false)
const selectedIndex = ref(0)
const submenuRef = ref(null)
const tippyInstance = ref(null)

/**
 * Get current block's background color
 */
const currentColor = computed(() => {
  if (!props.blockInfo?.node) return 'transparent'
  return props.blockInfo.node.attrs?.backgroundColor || 'transparent'
})

/**
 * Open the color submenu
 * Requirement 4.1: Display color palette when submenu opens
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
 * Close the color submenu
 */
function close() {
  isOpen.value = false
  
  if (tippyInstance.value) {
    tippyInstance.value.hide()
  }
  
  emit('close')
}

/**
 * Handle color selection
 * Requirements: 4.2, 4.3
 */
function selectColor(color) {
  emit('colorSelected', color)
  close()
}

/**
 * Handle keyboard navigation
 */
function handleKeyDown(event) {
  if (!isOpen.value) return
  
  const colCount = 5 // Colors per row
  const rowCount = Math.ceil(BLOCK_COLORS.length / colCount)
  
  switch (event.key) {
    case 'Escape':
      event.preventDefault()
      close()
      break
    
    case 'ArrowRight':
      event.preventDefault()
      selectedIndex.value = (selectedIndex.value + 1) % BLOCK_COLORS.length
      break
    
    case 'ArrowLeft':
      event.preventDefault()
      selectedIndex.value = (selectedIndex.value - 1 + BLOCK_COLORS.length) % BLOCK_COLORS.length
      break
    
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + colCount, BLOCK_COLORS.length - 1)
      break
    
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - colCount, 0)
      break
    
    case 'Enter':
      event.preventDefault()
      selectColor(BLOCK_COLORS[selectedIndex.value])
      break
  }
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
  BLOCK_COLORS
})
</script>

<template>
  <div
    v-show="isOpen"
    ref="submenuRef"
    class="color-submenu"
    role="menu"
    tabindex="-1"
    @keydown="handleKeyDown"
  >
    <div class="color-submenu-header">Background</div>
    
    <div class="color-grid">
      <button
        v-for="(color, index) in BLOCK_COLORS"
        :key="color.name"
        class="color-swatch"
        :class="{ 
          'is-selected': index === selectedIndex,
          'is-current': color.value === currentColor,
          'is-default': color.value === 'transparent'
        }"
        :style="{ backgroundColor: color.displayColor }"
        :title="color.name"
        role="menuitem"
        @click="selectColor(color)"
        @mouseenter="selectedIndex = index"
      >
        <!-- Checkmark for current color -->
        <span v-if="color.value === currentColor" class="color-check">✓</span>
        <!-- X mark for default/remove color -->
        <span v-if="color.value === 'transparent'" class="color-default-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="2" y1="14" x2="14" y2="2" />
          </svg>
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/**
 * ColorSubmenu Styles
 * Requirement 4.1: Color palette UI
 */

.color-submenu {
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 8px;
  min-width: 180px;
  outline: none;
}

.color-submenu-header {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  padding: 4px 8px 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
}

.color-swatch {
  width: 28px;
  height: 28px;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.1s ease, transform 0.1s ease;
  position: relative;
}

.color-swatch:hover,
.color-swatch.is-selected {
  border-color: #3b82f6;
  transform: scale(1.1);
}

.color-swatch.is-current {
  border-color: #1f2937;
}

.color-swatch.is-default {
  border: 2px solid #e5e7eb;
  background: linear-gradient(
    135deg,
    #fff 45%,
    #e5e7eb 45%,
    #e5e7eb 55%,
    #fff 55%
  ) !important;
}

.color-check {
  font-size: 14px;
  font-weight: bold;
  color: #1f2937;
}

.color-default-icon {
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
