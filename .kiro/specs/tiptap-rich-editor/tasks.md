# Implementation Plan

- [x] 1. Set up project dependencies and configuration
  - Install Tiptap core packages (@tiptap/vue-3, @tiptap/starter-kit, @tiptap/extension-underline, @tiptap/extension-link, @tiptap/extension-placeholder)
  - Install format conversion libraries (turndown, marked)
  - Install testing dependencies (vitest, fast-check, @vue/test-utils, jsdom)
  - Configure Vitest in vite.config.js
  - _Requirements: All_

- [x] 2. Implement Markdown converter utilities
  - [x] 2.1 Create markdownConverter.js with toMarkdown and toHTML functions
    - Implement toMarkdown using Turndown library
    - Implement toHTML using Marked library
    - Configure conversion rules for headings, lists, bold, italic, code blocks
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2, 6.3_
  - [ ]* 2.2 Write property test for Markdown round-trip
    - **Property 2: Markdown Round-Trip Consistency**
    - **Validates: Requirements 5.7**

- [x] 3. Implement EditorToolbar component
  - [x] 3.1 Create EditorToolbar.vue with formatting buttons
    - Implement button groups (text formatting, headings, lists, blocks)
    - Add click handlers that call editor commands
    - Implement isActive state for button highlighting
    - Add tooltips for each button
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 7.3, 7.4_
  - [ ]* 3.2 Write property test for formatting toggle
    - **Property 3: Formatting Toggle Consistency**
    - **Validates: Requirements 1.2, 7.4**

- [x] 4. Implement TiptapEditor main component
  - [x] 4.1 Create TiptapEditor.vue with Tiptap integration
    - Initialize Tiptap editor with StarterKit and extensions
    - Configure Markdown shortcuts (Typography, heading shortcuts)
    - Implement v-model binding for HTML content
    - Add placeholder support
    - _Requirements: 1.1, 2.1-2.10, 7.1, 7.2_
  - [x] 4.2 Implement content export methods (getHTML, getMarkdown)
    - Implement getHTML using editor.getHTML()
    - Implement getMarkdown using markdownConverter
    - _Requirements: 4.1, 4.2, 4.3, 5.1-5.6_
  - [x] 4.3 Implement content import methods (setHTML, setMarkdown)
    - Implement setHTML using editor.commands.setContent()
    - Implement setMarkdown using markdownConverter.toHTML()
    - Handle malformed input gracefully
    - _Requirements: 3.1, 3.2, 3.3, 6.1, 6.2, 6.3_
  - [ ]* 4.4 Write property test for HTML round-trip
    - **Property 1: HTML Round-Trip Consistency**
    - **Validates: Requirements 4.4**
  - [ ]* 4.5 Write property test for heading conversion
    - **Property 4: Heading Level Conversion**
    - **Validates: Requirements 1.3, 5.2**

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement editor styling
  - [x] 6.1 Create editor styles in TiptapEditor.vue
    - Style editable area with visible boundaries
    - Add focus state visual feedback
    - Style toolbar buttons with hover and active states
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 7. Integrate editor into App.vue
  - [x] 7.1 Update App.vue to use TiptapEditor
    - Replace HelloWorld component with TiptapEditor
    - Add demo controls for HTML/Markdown import/export
    - _Requirements: All_
  - [ ]* 7.2 Write property tests for Markdown import and HTML export
    - **Property 5: Markdown Syntax to Rich Text Conversion**
    - **Property 6: HTML Export Semantic Correctness**
    - **Validates: Requirements 6.1, 6.2, 4.1, 4.3**

- [x] 8. Install Slash Command dependencies
  - Install @tiptap/suggestion and tippy.js packages
  - _Requirements: 8.1, 8.2_

- [-] 9. Implement Slash Command Extension
  - [x] 9.1 Create slashCommand.js extension file
    - Create Tiptap extension using @tiptap/suggestion
    - Define command items list (paragraph, headings H1-H3, bullet list, numbered list, code block, blockquote, horizontal rule)
    - Implement filter logic for matching commands by query
    - _Requirements: 8.1, 8.2, 8.3, 9.1, 9.2, 9.3_
  - [ ]* 9.2 Write property test for slash command filter
    - **Property 7: Slash Command Filter Matching**
    - **Validates: Requirements 8.3**

- [-] 10. Implement SlashCommandMenu component
  - [x] 10.1 Create SlashCommandMenu.vue component
    - Render floating menu with command items (icon, title, description)
    - Implement keyboard navigation (Arrow Up/Down for selection)
    - Handle Enter key to execute selected command
    - Handle Escape key to close menu
    - Display "No results" when filter matches nothi
