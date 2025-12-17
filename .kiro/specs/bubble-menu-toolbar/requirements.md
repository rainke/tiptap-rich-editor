# Requirements Document

## Introduction

本功能旨在为现有的 Tiptap 富文本编辑器添加选中文字浮动工具栏（Bubble Menu）功能。当用户选中文字时，编辑器将在选中文字附近显示一个浮动工具栏，提供常用的文本格式化操作，如加粗、斜体、下划线、删除线、行内代码、链接等。这种交互方式让用户无需移动鼠标到顶部工具栏即可快速格式化选中的文本，提升编辑效率。

## Glossary

- **Bubble Menu**: 浮动气泡菜单，当用户选中文字时出现在选区附近的工具栏
- **Selection**: 用户在编辑器中选中的文本范围
- **Inline Formatting**: 行内格式化，如加粗、斜体等应用于选中文字的格式
- **Tiptap Editor**: 基于 ProseMirror 的无头富文本编辑器框架
- **Tippy.js**: 用于创建浮动提示和弹出框的 JavaScript 库

## Requirements

### Requirement 1

**User Story:** As a user, I want a floating toolbar to appear when I select text, so that I can quickly format the selected text without moving to the main toolbar.

#### Acceptance Criteria

1. WHEN a user selects text in the editor THEN the Bubble Menu SHALL appear near the selection
2. WHEN the selection is empty or collapsed THEN the Bubble Menu SHALL be hidden
3. WHEN the user clicks outside the selection THEN the Bubble Menu SHALL disappear
4. WHEN the selection changes position THEN the Bubble Menu SHALL reposition to follow the selection

### Requirement 2

**User Story:** As a user, I want the floating toolbar to provide common text formatting options, so that I can apply inline styles to selected text.

#### Acceptance Criteria

1. WHEN the Bubble Menu is displayed THEN the Bubble Menu SHALL show buttons for bold, italic, underline, and strikethrough formatting
2. WHEN a user clicks the bold button THEN the Bubble Menu SHALL apply bold formatting to the selected text
3. WHEN a user clicks the italic button THEN the Bubble Menu SHALL apply italic formatting to the selected text
4. WHEN a user clicks the underline button THEN the Bubble Menu SHALL apply underline formatting to the selected text
5. WHEN a user clicks the strikethrough button THEN the Bubble Menu SHALL apply strikethrough formatting to the selected text
6. WHEN a user clicks the inline code button THEN the Bubble Menu SHALL apply code formatting to the selected text

### Requirement 3

**User Story:** As a user, I want to add or edit links from the floating toolbar, so that I can create hyperlinks without using the main toolbar.

#### Acceptance Criteria

1. WHEN the Bubble Menu is displayed THEN the Bubble Menu SHALL show a link button
2. WHEN a user clicks the link button with text selected THEN the Bubble Menu SHALL prompt for a URL input
3. WHEN a user enters a valid URL and confirms THEN the Bubble Menu SHALL create a hyperlink from the selected text
4. WHEN the selected text is already a link THEN the link button SHALL display an active state
5. WHEN a user clicks the link button on existing link THEN the Bubble Menu SHALL allow editing or removing the link

### Requirement 4

**User Story:** As a user, I want the floating toolbar to show the current formatting state, so that I can see which formats are already applied to the selection.

#### Acceptance Criteria

1. WHEN the selected text has bold formatting THEN the bold button SHALL display an active/highlighted state
2. WHEN the selected text has italic formatting THEN the italic button SHALL display an active/highlighted state
3. WHEN the selected text has underline formatting THEN the underline button SHALL display an active/highlighted state
4. WHEN the selected text has strikethrough formatting THEN the strikethrough button SHALL display an active/highlighted state
5. WHEN the selected text has code formatting THEN the code button SHALL display an active/highlighted state

### Requirement 5

**User Story:** As a user, I want the floating toolbar to have a clean and unobtrusive design, so that it does not distract from my writing.

#### Acceptance Criteria

1. WHEN the Bubble Menu appears THEN the Bubble Menu SHALL have a compact design with minimal visual footprint
2. WHEN the Bubble Menu is displayed THEN the Bubble Menu SHALL have smooth appear/disappear animations
3. WHEN buttons are hovered THEN the Bubble Menu SHALL provide visual feedback
4. WHEN the Bubble Menu is positioned THEN the Bubble Menu SHALL avoid obscuring the selected text

