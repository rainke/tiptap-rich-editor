# Implementation Plan

- [x] 1. Install dependencies and set up extension
  - [x] 1.1 Install @tiptap/extension-drag-handle and @tiptap/extension-node-range packages
    - Run `pnpm add @tiptap/extension-drag-handle @tiptap/extension-node-range`
    - _Requirements: 1.1, 2.1_

  - [x] 1.2 Create drag handle configuration file
    - Create `src/utils/dragHandleConfig.js` with DragHandle extension configuration
    - Configure render function, tippyOptions, and lockAxis
    - _Requirements: 1.1, 1.3, 1.4_

  - [x] 1.3 Integrate DragHandle extension into TiptapEditor
    - Import and add DragHandle extension to editor extensions array
    - Import NodeRange extension for multi-node support
    - _Requirements: 1.1, 8.1_

- [x] 2. Implement drag handle UI component
  - [x] 2.1 Create DragHandleMenu.vue component
    - Create `src/components/DragHandleMenu.vue` with drag icon and add button
    - Implement six-dot grip icon SVG
    - Add click handler to open context menu
    - _Requirements: 1.4, 3.1_

  - [x] 2.2 Add drag handle styles
    - Add CSS for drag handle appearance, hover states, and animations
    - Implement fade-in/fade-out transitions (150ms)
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ]* 2.3 Write property test for hover visibility
    - **Property 1: Hover visibility toggle**
    - **Validates: Requirements 1.1, 1.2**

- [x] 3. Implement block context menu
  - [x] 3.1 Create BlockContextMenu.vue component
    - Create `src/components/BlockContextMenu.vue` with menu structure
    - Display block type as menu header
    - Implement menu item rendering with icons and shortcuts
    - _Requirements: 3.1, 3.2_

  - [x] 3.2 Implement menu open/close logic with tippy.js
    - Use tippy.js for positioning adjacent to drag handle
    - Handle click-outside to close menu
    - Handle Escape key to close menu
    - _Requirements: 3.1, 3.3, 3.4_

  - [x] 3.3 Implement keyboard navigation
    - Add ArrowUp/ArrowDown navigation between menu items
    - Add Enter key to activate focused item
    - Track selected index state
    - _Requirements: 7.2, 7.3_

  - [ ]* 3.4 Write property test for menu header block type
    - **Property 4: Menu header reflects block type**
    - **Validates: Requirements 3.2**

  - [ ]* 3.5 Write property test for keyboard navigation
    - **Property 10: Keyboard navigation cycles through items**
    - **Validates: Requirements 7.2**

- [x] 4. Implement color submenu
  - [x] 4.1 Create color palette data and ColorSubmenu component
    - Define BLOCK_COLORS array with predefined colors
    - Create color picker UI with color swatches
    - _Requirements: 4.1_

  - [x] 4.2 Implement color application command
    - Create setBlockColor command to apply background color to block
    - Handle "Default" option to remove color
    - Ensure color persists in document data
    - _Requirements: 4.2, 4.3, 4.4_

  - [ ]* 4.3 Write property test for color application
    - **Property 5: Color application and persistence**
    - **Validates: Requirements 4.2, 4.4**

- [x] 5. Implement "Turn Into" submenu
  - [x] 5.1 Create block type options data and TurnIntoSubmenu component
    - Define BLOCK_TYPES array with conversion options
    - Create submenu UI with block type icons
    - _Requirements: 5.1_

  - [x] 5.2 Implement block type conversion command
    - Create convertBlockType command to change block type
    - Preserve text content during conversion
    - Handle nested content preservation
    - _Requirements: 5.2, 5.3_

  - [x] 5.3 Handle invalid conversion scenarios
    - Detect unsupported conversions
    - Display notification for invalid conversions
    - _Requirements: 5.4_

  - [ ]* 5.4 Write property test for block type conversion
    - **Property 6: Block type conversion preserves text**
    - **Validates: Requirements 5.2, 5.3**

- [x] 6. Implement common block operations
  - [x] 6.1 Implement duplicate node command
    - Create duplicateBlock command to copy block below original
    - Preserve all attributes and content
    - _Requirements: 6.1_

  - [ ]* 6.2 Write property test for duplicate
    - **Property 7: Duplicate creates identical copy**
    - **Validates: Requirements 6.1**

  - [x] 6.3 Implement copy to clipboard command
    - Create copyBlockToClipboard command
    - Copy as both HTML and plain text formats
    - _Requirements: 6.2_

  - [x] 6.4 Implement delete block command
    - Create deleteBlock command to remove block
    - Move cursor to adjacent block after deletion
    - _Requirements: 6.3_

  - [ ]* 6.5 Write property test for delete
    - **Property 8: Delete removes block**
    - **Validates: Requirements 6.3**

  - [x] 6.6 Implement reset formatting command
    - Create resetBlockFormatting command to remove inline marks
    - Preserve plain text content
    - _Requirements: 6.4_

  - [ ]* 6.7 Write property test for reset formatting
    - **Property 9: Reset formatting preserves text only**
    - **Validates: Requirements 6.4**

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement drag and drop functionality
  - [x] 8.1 Configure drag handle for block reordering
    - Ensure DragHandle extension handles drag events
    - Configure drop indicator display
    - _Requirements: 2.1, 2.2_

  - [x] 8.2 Implement drop position validation
    - Validate target position is different from source
    - Handle invalid drop positions gracefully
    - _Requirements: 2.3, 2.4_

  - [ ]* 8.3 Write property test for block move
    - **Property 2: Block move preserves content**
    - **Validates: Requirements 2.3**

  - [ ]* 8.4 Write property test for invalid drop
    - **Property 3: Invalid drop preserves document**
    - **Validates: Requirements 2.4**

- [x] 9. Implement keyboard shortcut support
  - [x] 9.1 Add keyboard shortcut to open context menu
    - Configure shortcut (e.g., Cmd/Ctrl + /) to open menu for current block
    - _Requirements: 7.1_

  - [x] 9.2 Implement focus management
    - Return focus to editor when menu closes
    - Maintain cursor position
    - _Requirements: 7.4_

- [x] 10. Add support for all block types
  - [x] 10.1 Ensure drag handle works with all supported block types
    - Test with Paragraph, Heading, BulletList, OrderedList, Blockquote, CodeBlock
    - Handle list item reordering within lists
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ]* 10.2 Write property test for block type support
    - **Property 11: Handle appears for all block types**
    - **Validates: Requirements 8.1**

- [x] 11. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
