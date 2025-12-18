# Requirements Document

## Introduction

本功能为 Tiptap 富文本编辑器添加块级拖拽手柄（Drag Handle）功能。当用户将鼠标悬停在内容块左侧时，显示拖拽手柄图标，用户可以通过拖拽手柄重新排列内容块的顺序，或点击手柄打开上下文菜单执行块级操作（如颜色设置、类型转换、复制、删除等）。

## Glossary

- **Drag_Handle**: 显示在内容块左侧的可交互图标（通常为六点图标），用于拖拽和触发上下文菜单
- **Block**: 编辑器中的顶级内容节点，如段落、标题、列表、代码块等
- **Context_Menu**: 点击 Drag_Handle 后显示的操作菜单，包含块级操作选项
- **Block_Type**: 内容块的类型，如 Heading、Paragraph、BulletList、CodeBlock 等
- **Node_Position**: 内容块在编辑器文档中的位置索引

## Requirements

### Requirement 1

**User Story:** As a user, I want to see a drag handle appear when I hover near the left side of a content block, so that I can easily access block-level operations.

#### Acceptance Criteria

1. WHEN a user hovers the mouse within 50 pixels of the left edge of a Block THEN the Drag_Handle SHALL appear with a fade-in animation within 150 milliseconds
2. WHEN the mouse moves away from both the Block and the Drag_Handle THEN the Drag_Handle SHALL disappear with a fade-out animation within 150 milliseconds
3. WHILE the Drag_Handle is visible THEN the Drag_Handle SHALL be positioned vertically centered relative to the first line of the Block
4. WHEN the Drag_Handle is displayed THEN the Drag_Handle SHALL show a six-dot grip icon that indicates draggability

### Requirement 2

**User Story:** As a user, I want to drag content blocks to reorder them, so that I can reorganize my document structure efficiently.

#### Acceptance Criteria

1. WHEN a user starts dragging the Drag_Handle THEN the system SHALL initiate a drag operation and display a visual preview of the Block being dragged
2. WHILE dragging a Block THEN the system SHALL display a drop indicator line at valid drop positions between other Blocks
3. WHEN a user drops a Block at a new position THEN the system SHALL move the Block to the target position and update the document structure
4. WHEN a user drops a Block at an invalid position THEN the system SHALL return the Block to its original position without modifying the document
5. WHILE dragging THEN the system SHALL prevent text selection and maintain editor focus

### Requirement 3

**User Story:** As a user, I want to click the drag handle to open a context menu, so that I can perform various block-level operations.

#### Acceptance Criteria

1. WHEN a user clicks the Drag_Handle THEN the Context_Menu SHALL appear adjacent to the Drag_Handle within 100 milliseconds
2. WHEN the Context_Menu is displayed THEN the Context_Menu SHALL show the current Block_Type as the menu header
3. WHEN a user clicks outside the Context_Menu THEN the Context_Menu SHALL close within 100 milliseconds
4. WHEN a user presses the Escape key while the Context_Menu is open THEN the Context_Menu SHALL close immediately

### Requirement 4

**User Story:** As a user, I want to change the color of a content block from the context menu, so that I can visually highlight important content.

#### Acceptance Criteria

1. WHEN a user opens the Color submenu THEN the system SHALL display a palette of predefined background colors
2. WHEN a user selects a color from the palette THEN the system SHALL apply the selected background color to the entire Block
3. WHEN a user selects the "Default" color option THEN the system SHALL remove any custom background color from the Block
4. WHEN a color is applied to a Block THEN the system SHALL persist the color styling in the document data

### Requirement 5

**User Story:** As a user, I want to convert a content block to a different type from the context menu, so that I can quickly change the structure of my content.

#### Acceptance Criteria

1. WHEN a user opens the "Turn Into" submenu THEN the system SHALL display available Block_Type conversion options
2. WHEN a user selects a target Block_Type THEN the system SHALL convert the current Block to the selected type while preserving text content
3. WHEN converting a Block with nested content THEN the system SHALL preserve the nested structure where the target type supports nesting
4. IF a Block cannot be converted to the selected type THEN the system SHALL display a notification explaining the limitation

### Requirement 6

**User Story:** As a user, I want to perform common block operations from the context menu, so that I can efficiently manage my document content.

#### Acceptance Criteria

1. WHEN a user selects "Duplicate node" THEN the system SHALL create an identical copy of the Block immediately below the original
2. WHEN a user selects "Copy to clipboard" THEN the system SHALL copy the Block content to the system clipboard in both HTML and plain text formats
3. WHEN a user selects "Delete" THEN the system SHALL remove the Block from the document and move cursor to the adjacent Block
4. WHEN a user selects "Reset formatting" THEN the system SHALL remove all inline formatting from the Block while preserving the text content

### Requirement 7

**User Story:** As a user, I want the drag handle and context menu to be keyboard accessible, so that I can use these features without a mouse.

#### Acceptance Criteria

1. WHEN a user presses a configurable keyboard shortcut on a Block THEN the Context_Menu SHALL open for that Block
2. WHILE the Context_Menu is open THEN the user SHALL be able to navigate menu items using arrow keys
3. WHEN a menu item is focused THEN the user SHALL be able to activate the menu item by pressing Enter
4. WHEN the Context_Menu closes THEN the system SHALL return focus to the editor at the original cursor position

### Requirement 8

**User Story:** As a user, I want the drag handle to work correctly with all supported block types, so that I have a consistent experience across different content.

#### Acceptance Criteria

1. WHEN hovering over any top-level Block including Paragraph, Heading, BulletList, OrderedList, Blockquote, and CodeBlock THEN the Drag_Handle SHALL appear
2. WHEN dragging list items THEN the system SHALL allow reordering within the same list and moving to other positions
3. WHEN the Block contains nested content THEN the Drag_Handle operation SHALL affect the entire Block including nested elements
