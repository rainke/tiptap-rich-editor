<script setup>
import { ref, watch, nextTick } from 'vue'

/**
 * SlashCommandMenu - Floating command menu for slash commands
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 9.1, 9.2, 9.3
 * 
 * Renders a floating menu with command items that supports:
 * - Keyboard navigation (Arrow Up/Down)
 * - Enter to execute selected command
 * - Escape to close menu
 * - "No results" display when filter matches nothing
 */

const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => []
  },
  command: {
    type: Function,
    required: true
  }
})

// Currently selected item index
const selectedIndex = ref(0)

// Reference to the menu container for scrolling
const menuRef = ref(null)

// Reset selection when items change (due to filtering)
watch(() => props.items, () => {
  selectedIndex.value = 0
}, { immediate: true })

/**
 * Scroll the selected item into view
 */
function scrollToSelected() {
  nextTick(() => {
    if (menuRef.value) {
      const selectedItem = menuRef.value.querySelector('.command-item.is-selected')
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest' })
      }
    }
  })
}


/**
 * Handle keyboard navigation
 * Requirements: 8.4, 8.5, 8.6
 * 
 * @param {KeyboardEvent} event - The keyboard event
 * @returns {boolean} - Whether the event was handled
 */
function onKeyDown(event) {
  if (props.items.length === 0) {
    return false
  }

  // Arrow Up - navigate up through menu items (Requirement 8.4)
  if (event.key === 'ArrowUp') {
    selectedIndex.value = (selectedIndex.value - 1 + props.items.length) % props.items.length
    scrollToSelected()
    return true
  }

  // Arrow Down - navigate down through menu items (Requirement 8.4)
  if (event.key === 'ArrowDown') {
    selectedIndex.value = (selectedIndex.value + 1) % props.items.length
    scrollToSelected()
    return true
  }

  // Enter - execute selected command (Requirement 8.5)
  if (event.key === 'Enter') {
    selectItem(selectedIndex.value)
    return true
  }

  return false
}

/**
 * Select and execute a command item
 * Requirement: 8.5
 * 
 * @param {number} index - The index of the item to select
 */
function selectItem(index) {
  const item = props.items[index]
  if (item) {
    props.command(item)
  }
}

// Expose onKeyDown for the suggestion plugin to call
defineExpose({
  onKeyDown
})
</script>

<template>
  <div 
    ref="menuRef"
    class="slash-command-menu"
    role="listbox"
    aria-label="Slash commands"
  >
    <!-- Command items list - Requirements 8.2, 9.1, 9.2, 9.3 -->
    <template v-if="items.length > 0">
      <button
        v-for="(item, index) in items"
        :key="item.title"
        class="command-item"
        :class="{ 'is-selected': index === selectedIndex }"
        role="option"
        :aria-selected="index === selectedIndex"
        @click="selectItem(index)"
        @mouseenter="selectedIndex = index"
      >
        <span class="command-icon">{{ item.icon }}</span>
        <div class="command-content">
          <span class="command-title">{{ item.title }}</span>
          <span class="command-description">{{ item.description }}</span>
        </div>
      </button>
    </template>

    <!-- No results message - Requirement 8.7 -->
    <div v-else class="no-results">
      No results
    </div>
  </div>
</template>

<style scoped>
/**
 * SlashCommandMenu Styles
 * Requirements: 8.1, 8.2
 */

/* Menu container - floating near cursor */
.slash-command-menu {
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
  max-height: 320px;
  overflow-y: auto;
  padding: 6px;
  min-width: 240px;
  max-width: 320px;
}

/* Command item button */
.command-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 6px;
  background-color: transparent;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.1s ease;
}

.command-item:hover,
.command-item.is-selected {
  background-color: #f3f4f6;
}

.command-item.is-selected {
  background-color: #e5e7eb;
}

/* Command icon */
.command-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  font-size: 14px;
  font-weight: 600;
  color: #4b5563;
  flex-shrink: 0;
}

.command-item.is-selected .command-icon {
  background-color: #fff;
  border-color: #d1d5db;
}

/* Command content (title + description) */
.command-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.command-title {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  line-height: 1.3;
}

.command-description {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* No results message */
.no-results {
  padding: 16px 12px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
}

/* Scrollbar styling */
.slash-command-menu::-webkit-scrollbar {
  width: 6px;
}

.slash-command-menu::-webkit-scrollbar-track {
  background: transparent;
}

.slash-command-menu::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 3px;
}

.slash-command-menu::-webkit-scrollbar-thumb:hover {
  background-color: #9ca3af;
}
</style>
