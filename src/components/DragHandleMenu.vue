<script setup>
/**
 * DragHandleMenu - Drag handle content component
 * 
 * Displays a six-dot grip icon for dragging blocks and an add button.
 * Clicking the grip icon opens the block context menu.
 * Dragging the grip icon initiates block reordering.
 * 
 * Requirements: 1.4, 2.1, 2.2, 2.5, 3.1
 */

import { ref } from 'vue'

const props = defineProps({
  editor: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['openMenu', 'addBlock'])

// Track if menu is open for visual feedback
const isMenuOpen = ref(false)

// Track if currently dragging - Requirement 2.1
const isDragging = ref(false)

/**
 * Handle click on drag handle to open context menu
 * Requirement 3.1: Click drag handle to open context menu
 */
function handleClick(event) {
  // Don't open menu if we just finished dragging
  if (isDragging.value) {
    isDragging.value = false
    return
  }
  
  event.preventDefault()
  event.stopPropagation()
  isMenuOpen.value = true
  emit('openMenu')
}

/**
 * Handle drag start event
 * Requirement 2.1: Initiate drag operation with visual preview
 * Requirement 2.5: Prevent text selection during drag
 */
function handleDragStart(event) {
  isDragging.value = true
  
  // Add dragging class to editor for visual feedback
  if (props.editor?.view?.dom) {
    props.editor.view.dom.classList.add('dragging')
  }
}

/**
 * Handle drag end event
 * Requirement 2.1: Complete drag operation
 */
function handleDragEnd(event) {
  // Small delay to prevent click event from firing
  setTimeout(() => {
    isDragging.value = false
  }, 50)
  
  // Remove dragging class from editor
  if (props.editor?.view?.dom) {
    props.editor.view.dom.classList.remove('dragging')
  }
}

/**
 * Handle add button click to insert new block
 */
function handleAddClick(event) {
  event.preventDefault()
  event.stopPropagation()
  emit('addBlock')
}

/**
 * Close menu state (called externally when menu closes)
 */
function closeMenu() {
  isMenuOpen.value = false
}

defineExpose({
  closeMenu
})
</script>

<template>
  <div class="drag-handle-menu">
    <!-- Add button -->
    <!-- <button
      type="button"
      class="drag-handle-button add-button"
      title="Add block below"
      @click="handleAddClick"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button> -->
    
    <!-- Drag handle with six-dot grip icon -->
    <!-- Requirement 1.4: six-dot grip icon that indicates draggability -->
    <!-- Requirement 2.1: Drag to reorder blocks -->
    <button
      type="button"
      class="drag-handle-button grip-button"
      :class="{ 'is-active': isMenuOpen, 'is-dragging': isDragging }"
      title="Drag to move / Click for options"
      draggable="false"
      @click="handleClick"
      @dragstart="handleDragStart"
      @dragend="handleDragEnd"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 16" width="14" height="14" fill="currentColor">
        <circle cx="2" cy="2" r="1.5"/>
        <circle cx="8" cy="2" r="1.5"/>
        <circle cx="2" cy="8" r="1.5"/>
        <circle cx="8" cy="8" r="1.5"/>
        <circle cx="2" cy="14" r="1.5"/>
        <circle cx="8" cy="14" r="1.5"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
/**
 * DragHandleMenu Styles
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */

/* Container for drag handle buttons */
.drag-handle-menu {
  display: flex;
  align-items: center;
  gap: 2px;
}

/* Base button styles */
.drag-handle-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background-color: transparent;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease;
}

/* Hover state - Requirements 1.1, 1.2 */
.drag-handle-button:hover {
  color: #6b7280;
  background-color: #f3f4f6;
}

/* Active/pressed state */
.drag-handle-button:active {
  color: #4b5563;
  background-color: #e5e7eb;
}

/* Menu open state */
.drag-handle-button.is-active {
  color: #4b5563;
  background-color: #e5e7eb;
}

/* Grip button specific - draggable cursor */
.grip-button {
  cursor: grab;
}

.grip-button:active {
  cursor: grabbing;
}

/* Add button specific */
.add-button {
  opacity: 0;
  transition: opacity 0.15s ease, color 0.15s ease, background-color 0.15s ease;
}

/* Show add button on container hover */
.drag-handle-menu:hover .add-button {
  opacity: 1;
}

/* SVG icon styling */
.drag-handle-button svg {
  pointer-events: none;
  flex-shrink: 0;
}

/* Dragging state - Requirement 2.1 */
.grip-button.is-dragging {
  cursor: grabbing;
  color: #3b82f6;
  background-color: #dbeafe;
}
</style>
