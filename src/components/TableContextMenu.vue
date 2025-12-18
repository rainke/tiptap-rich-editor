<script setup>
/**
 * TableContextMenu - Context menu for table operations
 * 
 * Requirements: 8.5, 9.1-9.7, 10.1, 10.2
 * - Row operations (add above, add below, delete)
 * - Column operations (add left, add right, delete)
 * - Header toggle options
 * - Delete table option
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
const menuPosition = ref({ x: 0, y: 0 })

/**
 * Menu items configuration
 * Requirements: 9.1-9.7, 10.1, 10.2
 */
const menuSections = computed(() => [
  {
    title: '行操作',
    items: [
      { id: 'addRowBefore', label: '在上方插入行', icon: '↑', action: 'addRowBefore' },
      { id: 'addRowAfter', label: '在下方插入行', icon: '↓', action: 'addRowAfter' },
      { id: 'deleteRow', label: '删除行', icon: '✕', action: 'deleteRow', danger: true }
    ]
  },
  {
    title: '列操作',
    items: [
      { id: 'addColumnBefore', label: '在左侧插入列', icon: '←', action: 'addColumnBefore' },
      { id: 'addColumnAfter', label: '在右侧插入列', icon: '→', action: 'addColumnAfter' },
      { id: 'deleteColumn', label: '删除列', icon: '✕', action: 'deleteColumn', danger: true }
    ]
  },
  {
    title: '表头设置',
    items: [
      { id: 'toggleHeaderRow', label: '切换表头行', icon: '▬', action: 'toggleHeaderRow' },
      { id: 'toggleHeaderColumn', label: '切换表头列', icon: '▮', action: 'toggleHeaderColumn' }
    ]
  },
  {
    title: '表格操作',
    items: [
      { id: 'deleteTable', label: '删除表格', icon: '🗑️', action: 'deleteTable', danger: true }
    ]
  }
])

/**
 * Check if a command is available
 */
function canExecute(action) {
  if (!props.editor) return false
  
  const commandMap = {
    addRowBefore: () => props.editor.can().addRowBefore(),
    addRowAfter: () => props.editor.can().addRowAfter(),
    deleteRow: () => props.editor.can().deleteRow(),
    addColumnBefore: () => props.editor.can().addColumnBefore(),
    addColumnAfter: () => props.editor.can().addColumnAfter(),
    deleteColumn: () => props.editor.can().deleteColumn(),
    toggleHeaderRow: () => props.editor.can().toggleHeaderRow(),
    toggleHeaderColumn: () => props.editor.can().toggleHeaderColumn(),
    deleteTable: () => props.editor.can().deleteTable()
  }
  
  return commandMap[action] ? commandMap[action]() : false
}

/**
 * Execute table command
 * Requirements: 9.1-9.7, 10.1, 10.2
 */
function executeCommand(action) {
  if (!props.editor) {
    close()
    return
  }
  
  const commands = {
    // Row operations - Requirements 9.1, 9.2, 9.5
    addRowBefore: () => props.editor.chain().focus().addRowBefore().run(),
    addRowAfter: () => props.editor.chain().focus().addRowAfter().run(),
    deleteRow: () => props.editor.chain().focus().deleteRow().run(),
    
    // Column operations - Requirements 9.3, 9.4, 9.6
    addColumnBefore: () => props.editor.chain().focus().addColumnBefore().run(),
    addColumnAfter: () => props.editor.chain().focus().addColumnAfter().run(),
    deleteColumn: () => props.editor.chain().focus().deleteColumn().run(),
    
    // Header toggles - Requirements 10.1, 10.2
    toggleHeaderRow: () => props.editor.chain().focus().toggleHeaderRow().run(),
    toggleHeaderColumn: () => props.editor.chain().focus().toggleHeaderColumn().run(),
    
    // Delete table - Requirement 9.7
    deleteTable: () => props.editor.chain().focus().deleteTable().run()
  }
  
  if (commands[action]) {
    commands[action]()
  }
  
  close()
}

/**
 * Open the context menu at specified position
 * Requirement 8.5: Right-click displays context menu
 */
function open(event) {
  if (event) {
    event.preventDefault()
    menuPosition.value = { x: event.clientX, y: event.clientY }
  }
  isOpen.value = true
}

/**
 * Open the context menu with a reference element
 */
function openWithRef(refEl) {
  referenceElement.value = refEl
  isOpen.value = true
}

/**
 * Close the context menu
 */
function close() {
  isOpen.value = false
  referenceElement.value = null
  emit('close')
}

/**
 * Handle click outside to close
 */
function handleClickOutside(event) {
  if (!isOpen.value) return
  
  const popoverEl = document.querySelector('.table-context-menu-popover')
  if (popoverEl && popoverEl.contains(event.target)) return
  
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
  openWithRef,
  close,
  isOpen
})
</script>

<template>
  <!-- Position-based menu (for right-click) -->
  <Teleport to="body">
    <div
      v-if="isOpen && !referenceElement"
      class="table-context-menu-container"
      :style="{ left: menuPosition.x + 'px', top: menuPosition.y + 'px' }"
    >
      <div class="table-context-menu">
        <template v-for="(section, sectionIndex) in menuSections" :key="section.title">
          <div class="menu-section">
            <div class="menu-section-title">{{ section.title }}</div>
            <button
              v-for="item in section.items"
              :key="item.id"
              class="menu-item"
              :class="{ 'is-danger': item.danger, 'is-disabled': !canExecute(item.action) }"
              :disabled="!canExecute(item.action)"
              @click="executeCommand(item.action)"
            >
              <span class="menu-item-icon">{{ item.icon }}</span>
              <span class="menu-item-label">{{ item.label }}</span>
            </button>
          </div>
          <div v-if="sectionIndex < menuSections.length - 1" class="menu-divider"></div>
        </template>
      </div>
    </div>
  </Teleport>
  
  <!-- Reference-based menu (for button trigger) -->
  <ElPopover
    v-if="referenceElement"
    :visible="isOpen"
    :virtual-ref="referenceElement"
    virtual-triggering
    placement="bottom-start"
    :offset="4"
    :show-arrow="false"
    popper-class="table-context-menu-popover"
    :teleported="true"
  >
    <div class="table-context-menu">
      <template v-for="(section, sectionIndex) in menuSections" :key="section.title">
        <div class="menu-section">
          <div class="menu-section-title">{{ section.title }}</div>
          <button
            v-for="item in section.items"
            :key="item.id"
            class="menu-item"
            :class="{ 'is-danger': item.danger, 'is-disabled': !canExecute(item.action) }"
            :disabled="!canExecute(item.action)"
            @click="executeCommand(item.action)"
          >
            <span class="menu-item-icon">{{ item.icon }}</span>
            <span class="menu-item-label">{{ item.label }}</span>
          </button>
        </div>
        <div v-if="sectionIndex < menuSections.length - 1" class="menu-divider"></div>
      </template>
    </div>
  </ElPopover>
</template>

<style scoped>
/**
 * TableContextMenu Styles
 * Requirements: 8.5 (context menu), 9.1-9.7 (operations)
 */

/* Position-based container */
.table-context-menu-container {
  position: fixed;
  z-index: 10000;
}

/* Menu container */
.table-context-menu {
  min-width: 180px;
  padding: 6px 0;
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Menu section */
.menu-section {
  padding: 4px 0;
}

/* Section title */
.menu-section-title {
  padding: 4px 12px 6px;
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Menu item */
.menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background-color: transparent;
  color: #374151;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.menu-item:hover:not(.is-disabled) {
  background-color: #f3f4f6;
}

.menu-item:active:not(.is-disabled) {
  background-color: #e5e7eb;
}

/* Disabled state */
.menu-item.is-disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

/* Danger state (delete actions) */
.menu-item.is-danger:not(.is-disabled) {
  color: #dc2626;
}

.menu-item.is-danger:hover:not(.is-disabled) {
  background-color: #fef2f2;
}

/* Menu item icon */
.menu-item-icon {
  width: 20px;
  margin-right: 8px;
  text-align: center;
  font-size: 12px;
}

/* Menu item label */
.menu-item-label {
  flex: 1;
}

/* Divider between sections */
.menu-divider {
  height: 1px;
  margin: 4px 8px;
  background-color: #e5e7eb;
}
</style>

<style>
/* Global styles for the popover */
.table-context-menu-popover {
  padding: 0 !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}
</style>
