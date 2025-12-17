# Requirements Document

## Introduction

本功能旨在基于 Tiptap 编辑器框架实现一个功能完善的富文本编辑器，支持 Markdown 语法输入和 HTML 内容的导入导出。编辑器将集成到现有的 Vue 3 应用中，提供直观的编辑体验和灵活的内容格式转换能力。编辑器同时支持传统工具栏模式和 Notion-like 的 slash command 交互模式，让用户可以根据习惯选择最适合的操作方式。

## Glossary

- **Tiptap Editor**: 基于 ProseMirror 的无头富文本编辑器框架，提供可扩展的编辑器核心功能
- **Markdown**: 一种轻量级标记语言，使用纯文本格式语法来格式化文档
- **HTML Content**: 超文本标记语言内容，用于定义网页结构和内容
- **Toolbar**: 编辑器工具栏，提供格式化操作的快捷按钮
- **Editor Content**: 编辑器中的文档内容，可以是富文本、Markdown 或 HTML 格式
- **Pretty Printer**: 将内部数据结构转换为格式化字符串输出的组件
- **Slash Command**: 通过输入 "/" 触发的命令菜单，允许用户快速插入或转换内容块
- **Command Menu**: 显示可用命令列表的浮动菜单，支持键盘导航和搜索过滤
- **Block**: 编辑器中的内容单元，如段落、标题、列表、代码块等

## Requirements

### Requirement 1

**User Story:** As a user, I want to have a rich text editor with a toolbar, so that I can format my content easily using visual controls.

#### Acceptance Criteria

1. WHEN the editor component loads THEN the Tiptap Editor SHALL display a toolbar with formatting buttons above the editable area
2. WHEN a user clicks a formatting button (bold, italic, underline, strikethrough) THEN the Tiptap Editor SHALL apply the corresponding format to the selected text
3. WHEN a user clicks a heading button THEN the Tiptap Editor SHALL convert the current paragraph to the selected heading level (H1-H6)
4. WHEN a user clicks the list button THEN the Tiptap Editor SHALL convert the current content to an ordered or unordered list
5. WHEN a user clicks the code block button THEN the Tiptap Editor SHALL insert a code block at the cursor position
6. WHEN a user clicks the blockquote button THEN the Tiptap Editor SHALL convert the current paragraph to a blockquote
7. WHEN a user clicks the link button THEN the Tiptap Editor SHALL prompt for a URL and create a hyperlink from the selected text

### Requirement 2

**User Story:** As a user, I want to type Markdown syntax directly in the editor, so that I can format content quickly without using the toolbar.

#### Acceptance Criteria

1. WHEN a user types "# " at the start of a line THEN the Tiptap Editor SHALL convert the line to a heading level 1
2. WHEN a user types "## " through "###### " at the start of a line THEN the Tiptap Editor SHALL convert the line to the corresponding heading level (2-6)
3. WHEN a user types "- " or "* " at the start of a line THEN the Tiptap Editor SHALL convert the line to an unordered list item
4. WHEN a user types "1. " at the start of a line THEN the Tiptap Editor SHALL convert the line to an ordered list item
5. WHEN a user types "> " at the start of a line THEN the Tiptap Editor SHALL convert the line to a blockquote
6. WHEN a user wraps text with "**" or "__" THEN the Tiptap Editor SHALL apply bold formatting to the wrapped text
7. WHEN a user wraps text with "*" or "_" THEN the Tiptap Editor SHALL apply italic formatting to the wrapped text
8. WHEN a user wraps text with "`" THEN the Tiptap Editor SHALL apply inline code formatting to the wrapped text
9. WHEN a user types "```" followed by Enter THEN the Tiptap Editor SHALL insert a code block
10. WHEN a user types "---" or "***" on a new line THEN the Tiptap Editor SHALL insert a horizontal rule

### Requirement 3

**User Story:** As a developer, I want to import HTML content into the editor, so that I can load existing HTML documents for editing.

#### Acceptance Criteria

1. WHEN the setContent method is called with valid HTML string THEN the Tiptap Editor SHALL parse the HTML and display it as formatted content
2. WHEN the setContent method is called with malformed HTML THEN the Tiptap Editor SHALL handle the error gracefully and display sanitized content
3. WHEN HTML content contains unsupported tags THEN the Tiptap Editor SHALL preserve the text content while ignoring unsupported formatting

### Requirement 4

**User Story:** As a developer, I want to export editor content as HTML, so that I can save or transmit the formatted content.

#### Acceptance Criteria

1. WHEN the getHTML method is called THEN the Tiptap Editor SHALL return the current content as a valid HTML string
2. WHEN the editor content is empty THEN the getHTML method SHALL return an empty paragraph tag or empty string
3. WHEN the editor contains formatted content THEN the getHTML method SHALL produce semantically correct HTML tags
4. WHEN HTML is exported and re-imported THEN the Tiptap Editor SHALL preserve all formatting and structure (round-trip consistency)

### Requirement 5

**User Story:** As a developer, I want to export editor content as Markdown, so that I can use the content in Markdown-compatible systems.

#### Acceptance Criteria

1. WHEN the getMarkdown method is called THEN the Tiptap Editor SHALL return the current content as a valid Markdown string
2. WHEN the editor contains headings THEN the getMarkdown method SHALL output appropriate "#" syntax
3. WHEN the editor contains lists THEN the getMarkdown method SHALL output appropriate "-" or "1." syntax
4. WHEN the editor contains bold text THEN the getMarkdown method SHALL output "**text**" syntax
5. WHEN the editor contains italic text THEN the getMarkdown method SHALL output "*text*" syntax
6. WHEN the editor contains code blocks THEN the getMarkdown method SHALL output fenced code block syntax with "```"
7. WHEN Markdown is exported and re-imported (via Markdown shortcuts) THEN the Tiptap Editor SHALL preserve the semantic structure (round-trip consistency)

### Requirement 6

**User Story:** As a developer, I want to import Markdown content into the editor, so that I can load existing Markdown documents for editing.

#### Acceptance Criteria

1. WHEN the setMarkdown method is called with valid Markdown string THEN the Tiptap Editor SHALL parse the Markdown and display it as formatted content
2. WHEN the Markdown content contains standard syntax (headings, lists, emphasis) THEN the Tiptap Editor SHALL convert each element to the corresponding rich text format
3. WHEN the Markdown content contains code blocks THEN the Tiptap Editor SHALL display them as formatted code blocks

### Requirement 7

**User Story:** As a user, I want the editor to have a clean and intuitive interface, so that I can focus on writing without distraction.

#### Acceptance Criteria

1. WHEN the editor is displayed THEN the Tiptap Editor SHALL show a clearly defined editable area with visible boundaries
2. WHEN the editor receives focus THEN the Tiptap Editor SHALL provide visual feedback indicating the active state
3. WHEN toolbar buttons are hovered THEN the Tiptap Editor SHALL display tooltips describing the button function
4. WHEN a formatting option is active THEN the corresponding toolbar button SHALL display a highlighted state

### Requirement 8

**User Story:** As a user, I want to use slash commands to quickly insert content blocks, so that I can format content efficiently without leaving the keyboard.

#### Acceptance Criteria

1. WHEN a user types "/" at the start of a line or after a space THEN the Tiptap Editor SHALL display a command menu near the cursor position
2. WHEN the command menu is displayed THEN the Tiptap Editor SHALL show a list of available block types with icons and descriptions
3. WHEN a user continues typing after "/" THEN the Tiptap Editor SHALL filter the command list to show matching commands
4. WHEN a user presses Arrow Up or Arrow Down THEN the Tiptap Editor SHALL navigate through the command menu items
5. WHEN a user presses Enter or clicks a command item THEN the Tiptap Editor SHALL insert or convert to the selected block type and close the menu
6. WHEN a user presses Escape THEN the Tiptap Editor SHALL close the command menu without making changes
7. WHEN no commands match the filter text THEN the Tiptap Editor SHALL display a "No results" message

### Requirement 9

**User Story:** As a user, I want the command menu to include common block types, so that I can quickly access all formatting options.

#### Acceptance Criteria

1. WHEN the command menu is displayed THEN the Tiptap Editor SHALL include text formatting options (paragraph, headings H1-H3)
2. WHEN the command menu is displayed THEN the Tiptap Editor SHALL include list options (bullet list, numbered list)
3. WHEN the command menu is displayed THEN the Tiptap Editor SHALL include block options (code block, blockquote, horizontal rule)
4. WHEN a heading command is selected THEN the Tiptap Editor SHALL convert the current block to the specified heading level
5. WHEN a list command is selected THEN the Tiptap Editor SHALL convert the current block to the specified list type

### Requirement 10

**User Story:** As a user, I want to use both the toolbar and slash commands interchangeably, so that I can choose the interaction method that suits my workflow.

#### Acceptance Criteria

1. WHEN the editor is displayed THEN the Tiptap Editor SHALL show both the toolbar and support slash commands simultaneously
2. WHEN a block type is changed via slash command THEN the toolbar SHALL reflect the current block state
3. WHEN a block type is changed via toolbar THEN the slash command menu SHALL remain functional for subsequent edits
