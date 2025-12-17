import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import tippy from 'tippy.js'
import { VueRenderer } from '@tiptap/vue-3'
import SlashCommandMenu from '../components/SlashCommandMenu.vue'

/**
 * Slash Command Extension for Tiptap
 * 
 * Requirements: 8.1, 8.2, 8.3, 9.1, 9.2, 9.3
 * 
 * Provides a "/" triggered command menu for quick block insertion
 */

/**
 * Command items available in the slash menu
 * Requirements: 9.1, 9.2, 9.3
 */
export const commandItems = [
  {
    title: 'Paragraph',
    description: 'Plain text paragraph',
    icon: '¶',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setParagraph().run()
    }
  },
  {
    title: 'Heading 1',
    description: 'Large section heading',
    icon: 'H1',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run()
    }
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: 'H2',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run()
    }
  },
  {
    title: 'Heading 3',
    description: 'Small section heading',
    icon: 'H3',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run()
    }
  },
  {
    title: 'Bullet List',
    description: 'Unordered list with bullets',
    icon: '•',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
    }
  },
  {
    title: 'Numbered List',
    description: 'Ordered list with numbers',
    icon: '1.',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
    }
  },
  {
    title: 'Code Block',
    description: 'Code snippet with syntax highlighting',
    icon: '</>',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setCodeBlock().run()
    }
  },
  {
    title: 'Blockquote',
    description: 'Quote or callout block',
    icon: '"',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setBlockquote().run()
    }
  },
  {
    title: 'Horizontal Rule',
    description: 'Visual divider line',
    icon: '—',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run()
    }
  }
]

/**
 * Filter command items by query string
 * Requirement: 8.3 - Filter command list to show matching commands
 * 
 * @param {string} query - The search query typed after "/"
 * @returns {Array} Filtered command items matching the query
 */
export function filterCommands(query) {
  if (!query) {
    return commandItems
  }
  
  const lowerQuery = query.toLowerCase()
  
  return commandItems.filter(item => {
    const titleMatch = item.title.toLowerCase().includes(lowerQuery)
    const descriptionMatch = item.description.toLowerCase().includes(lowerQuery)
    return titleMatch || descriptionMatch
  })
}

/**
 * Suggestion render functions for the slash command menu
 * Requirements: 8.1, 8.4, 8.5, 8.6
 * 
 * Creates the floating menu using tippy.js and Vue renderer
 */
function createSuggestionRenderer() {
  let component
  let popup

  return {
    /**
     * Called when suggestion is triggered (user types "/")
     * Requirement: 8.1 - Display command menu near cursor
     */
    onStart: (props) => {
      component = new VueRenderer(SlashCommandMenu, {
        props,
        editor: props.editor
      })

      if (!props.clientRect) {
        return
      }

      popup = tippy('body', {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
        offset: [0, 8],
        animation: 'shift-away',
        duration: [200, 150]
      })
    },

    /**
     * Called when suggestion query changes (user continues typing)
     * Requirement: 8.3 - Filter command list
     */
    onUpdate: (props) => {
      component.updateProps(props)

      if (!props.clientRect) {
        return
      }

      popup[0].setProps({
        getReferenceClientRect: props.clientRect
      })
    },

    /**
     * Handle keyboard events for menu navigation
     * Requirements: 8.4, 8.5, 8.6
     */
    onKeyDown: (props) => {
      // Escape key closes the menu - Requirement 8.6
      if (props.event.key === 'Escape') {
        popup[0].hide()
        return true
      }

      // Delegate to the component for Arrow/Enter handling
      return component.ref?.onKeyDown(props.event) ?? false
    },

    /**
     * Called when suggestion is dismissed
     */
    onExit: () => {
      if (popup) {
        popup[0].destroy()
      }
      if (component) {
        component.destroy()
      }
    }
  }
}

/**
 * Slash Command Extension
 * 
 * Creates a Tiptap extension that triggers a command menu when "/" is typed
 * Requirements: 8.1, 8.2
 */
export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }) => {
          props.command({ editor, range })
        },
        items: ({ query }) => filterCommands(query),
        render: createSuggestionRenderer
      }
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion
      })
    ]
  }
})

export default SlashCommand
