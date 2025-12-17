<script setup>
/**
 * BubbleMenuToolbar - Floating toolbar for text formatting
 * 
 * Requirements: 2.1, 3.1, 2.2-2.6, 4.1-4.5
 */

const props = defineProps({
  editor: {
    type: Object,
    default: null
  }
})

/**
 * Format button configuration
 * Requirements: 2.1 (bold, italic, underline, strikethrough), 3.1 (link button)
 */
const formatButtons = [
  {
    name: 'bold',
    icon: 'B',
    title: '加粗',
    mark: 'bold',
    action: () => props.editor?.chain().focus().toggleBold().run(),
    isActive: () => props.editor?.isActive('bold') ?? false
  },
  {
    name: 'italic',
    icon: 'I',
    title: '斜体',
    mark: 'italic',
    action: () => props.editor?.chain().focus().toggleItalic().run(),
    isActive: () => props.editor?.isActive('italic') ?? false
  },
  {
    name: 'underline',
    icon: 'U',
    title: '下划线',
    mark: 'underline',
    action: () => props.editor?.chain().focus().toggleUnderline().run(),
    isActive: () => props.editor?.isActive('underline') ?? false
  },
  {
    name: 'strike',
    icon: 'S',
    title: '删除线',
    mark: 'strike',
    action: () => props.editor?.chain().focus().toggleStrike().run(),
    isActive: () => props.editor?.isActive('strike') ?? false
  },
  {
    name: 'code',
    icon: '</>',
    title: '行内代码',
    mark: 'code',
    action: () => props.editor?.chain().focus().toggleCode().run(),
    isActive: () => props.editor?.isActive('code') ?? false
  },
  {
    name: 'link',
    icon: '🔗',
    title: '链接',
    mark: 'link',
    action: () => handleLinkClick(),
    isActive: () => props.editor?.isActive('link') ?? false
  }
]

/**
 * Handle link button click
 * Requirements: 3.1, 3.2
 */
function handleLinkClick() {
  if (!props.editor) return
  
  // If already a link, allow editing or removing
  if (props.editor.isActive('link')) {
    const currentUrl = props.editor.getAttributes('link').href || ''
    const url = window.prompt('编辑链接 URL (留空以移除链接):', currentUrl)
    
    if (url === null) {
      // User cancelled
      return
    }
    
    if (url === '') {
      // Remove link
      props.editor.chain().focus().unsetLink().run()
    } else {
      // Update link
      props.editor.chain().focus().setLink({ href: url }).run()
    }
  } else {
    // Create new link
    const url = window.prompt('输入链接 URL:')
    if (url) {
      props.editor.chain().focus().setLink({ href: url }).run()
    }
  }
}

/**
 * Handle button click
 * Requirements: 2.2-2.6
 */
function handleButtonClick(button) {
  if (props.editor && button.action) {
    button.action()
  }
}
</script>

<template>
  <div class="bubble-menu-toolbar" v-if="editor">
    <button
      v-for="button in formatButtons"
      :key="button.name"
      type="button"
      class="bubble-button"
      :class="{ 'is-active': button.isActive() }"
      :data-name="button.name"
      :title="button.title"
      @click="handleButtonClick(button)"
    >
      {{ button.icon }}
    </button>
  </div>
</template>

<style scoped>
/**
 * BubbleMenuToolbar Styles
 * Requirements: 5.1 (compact design), 5.3 (hover feedback)
 */

/* Toolbar container - Requirement 5.1: compact design with minimal visual footprint */
.bubble-menu-toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Button base styles - matching EditorToolbar visual design */
.bubble-button {
  position: relative;
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
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

/* Hover state - Requirement 5.3: visual feedback on hover */
.bubble-button:hover {
  background-color: #f3f4f6;
  border-color: #e5e7eb;
  color: #1f2937;
}

/* Focus state for keyboard navigation */
.bubble-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
}

.bubble-button:focus:not(:focus-visible) {
  box-shadow: none;
}

.bubble-button:focus-visible {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
}

/* Active/pressed state */
.bubble-button:active {
  transform: scale(0.95);
}

/* Active formatting state - Requirements 4.1-4.5 */
.bubble-button.is-active {
  background-color: #3b82f6;
  color: #fff;
  border-color: #2563eb;
}

.bubble-button.is-active:hover {
  background-color: #2563eb;
  border-color: #1d4ed8;
}

/* Separator between button groups (optional visual enhancement) */
.bubble-button + .bubble-button[data-name="link"] {
  margin-left: 4px;
  padding-left: 8px;
  border-left: 1px solid #e5e7eb;
  border-radius: 0 4px 4px 0;
}

/* Disabled state */
.bubble-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
</style>
