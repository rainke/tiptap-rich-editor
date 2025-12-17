<script setup>
import { computed } from 'vue'

const props = defineProps({
  editor: {
    type: Object,
    default: null
  }
})

// Button groups configuration
const buttonGroups = computed(() => [
  {
    name: 'text-formatting',
    buttons: [
      {
        name: 'bold',
        icon: 'B',
        title: 'Bold (Ctrl+B)',
        action: () => props.editor?.chain().focus().toggleBold().run(),
        isActive: () => props.editor?.isActive('bold') ?? false
      },
      {
        name: 'italic',
        icon: 'I',
        title: 'Italic (Ctrl+I)',
        action: () => props.editor?.chain().focus().toggleItalic().run(),
        isActive: () => props.editor?.isActive('italic') ?? false
      },
      {
        name: 'underline',
        icon: 'U',
        title: 'Underline (Ctrl+U)',
        action: () => props.editor?.chain().focus().toggleUnderline().run(),
        isActive: () => props.editor?.isActive('underline') ?? false
      },
      {
        name: 'strike',
        icon: 'S',
        title: 'Strikethrough',
        action: () => props.editor?.chain().focus().toggleStrike().run(),
        isActive: () => props.editor?.isActive('strike') ?? false
      },
      {
        name: 'code',
        icon: '</>',
        title: 'Inline Code',
        action: () => props.editor?.chain().focus().toggleCode().run(),
        isActive: () => props.editor?.isActive('code') ?? false
      }
    ]
  },
  {
    name: 'headings',
    buttons: [
      {
        name: 'heading1',
        icon: 'H1',
        title: 'Heading 1',
        action: () => props.editor?.chain().focus().toggleHeading({ level: 1 }).run(),
        isActive: () => props.editor?.isActive('heading', { level: 1 }) ?? false
      },
      {
        name: 'heading2',
        icon: 'H2',
        title: 'Heading 2',
        action: () => props.editor?.chain().focus().toggleHeading({ level: 2 }).run(),
        isActive: () => props.editor?.isActive('heading', { level: 2 }) ?? false
      },
      {
        name: 'heading3',
        icon: 'H3',
        title: 'Heading 3',
        action: () => props.editor?.chain().focus().toggleHeading({ level: 3 }).run(),
        isActive: () => props.editor?.isActive('heading', { level: 3 }) ?? false
      },
      {
        name: 'heading4',
        icon: 'H4',
        title: 'Heading 4',
        action: () => props.editor?.chain().focus().toggleHeading({ level: 4 }).run(),
        isActive: () => props.editor?.isActive('heading', { level: 4 }) ?? false
      },
      {
        name: 'heading5',
        icon: 'H5',
        title: 'Heading 5',
        action: () => props.editor?.chain().focus().toggleHeading({ level: 5 }).run(),
        isActive: () => props.editor?.isActive('heading', { level: 5 }) ?? false
      },
      {
        name: 'heading6',
        icon: 'H6',
        title: 'Heading 6',
        action: () => props.editor?.chain().focus().toggleHeading({ level: 6 }).run(),
        isActive: () => props.editor?.isActive('heading', { level: 6 }) ?? false
      }
    ]
  },
  {
    name: 'lists',
    buttons: [
      {
        name: 'bulletList',
        icon: '•',
        title: 'Bullet List',
        action: () => props.editor?.chain().focus().toggleBulletList().run(),
        isActive: () => props.editor?.isActive('bulletList') ?? false
      },
      {
        name: 'orderedList',
        icon: '1.',
        title: 'Ordered List',
        action: () => props.editor?.chain().focus().toggleOrderedList().run(),
        isActive: () => props.editor?.isActive('orderedList') ?? false
      }
    ]
  },
  {
    name: 'blocks',
    buttons: [
      {
        name: 'codeBlock',
        icon: '{ }',
        title: 'Code Block',
        action: () => props.editor?.chain().focus().toggleCodeBlock().run(),
        isActive: () => props.editor?.isActive('codeBlock') ?? false
      },
      {
        name: 'blockquote',
        icon: '"',
        title: 'Blockquote',
        action: () => props.editor?.chain().focus().toggleBlockquote().run(),
        isActive: () => props.editor?.isActive('blockquote') ?? false
      },
      {
        name: 'link',
        icon: '🔗',
        title: 'Insert Link',
        action: () => {
          const url = window.prompt('Enter URL:')
          if (url) {
            props.editor?.chain().focus().setLink({ href: url }).run()
          }
        },
        isActive: () => props.editor?.isActive('link') ?? false
      }
    ]
  }
])

const handleButtonClick = (button) => {
  if (props.editor && button.action) {
    button.action()
  }
}
</script>

<template>
  <div class="editor-toolbar" v-if="editor">
    <div
      v-for="group in buttonGroups"
      :key="group.name"
      class="toolbar-group"
    >
      <button
        v-for="button in group.buttons"
        :key="button.name"
        type="button"
        class="toolbar-button"
        :class="{ 'is-active': button.isActive() }"
        :title="button.title"
        @click="handleButtonClick(button)"
      >
        {{ button.icon }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/**
 * EditorToolbar Styles
 * Requirements: 7.3 (tooltips), 7.4 (active state highlighting)
 */

/* Toolbar container */
.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 12px;
  background-color: #f9fafb;
  border-bottom: none;
}

/* Button groups with visual separator */
.toolbar-group {
  display: flex;
  gap: 4px;
  padding-right: 12px;
  border-right: 1px solid #e5e7eb;
}

.toolbar-group:last-child {
  border-right: none;
  padding-right: 0;
}

/* Toolbar button base styles */
.toolbar-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  height: 34px;
  padding: 4px 8px;
  border: 1px solid transparent;
  border-radius: 6px;
  background-color: transparent;
  color: #4b5563;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

/* Hover state - Requirement 7.3, 7.4 */
.toolbar-button:hover {
  background-color: #e5e7eb;
  border-color: #d1d5db;
  color: #1f2937;
}

/* Focus state for keyboard navigation */
.toolbar-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
}

.toolbar-button:focus:not(:focus-visible) {
  box-shadow: none;
}

.toolbar-button:focus-visible {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
}

/* Active/pressed state */
.toolbar-button:active {
  transform: scale(0.95);
}

/* Active formatting state - Requirement 7.4: highlighted state */
.toolbar-button.is-active {
  background-color: #3b82f6;
  color: #fff;
  border-color: #2563eb;
  box-shadow: 0 1px 2px rgba(59, 130, 246, 0.3);
}

.toolbar-button.is-active:hover {
  background-color: #2563eb;
  border-color: #1d4ed8;
}

/* Tooltip enhancement - Requirement 7.3 */
.toolbar-button[title] {
  /* Native title attribute provides tooltip */
  /* Additional custom tooltip can be added via ::after if needed */
}

/* Disabled state */
.toolbar-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Icon styling for special characters */
.toolbar-button {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
