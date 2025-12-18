# Requirements Document

## Introduction

本文档定义了为 Tiptap 富文本编辑器添加图片、数学公式和表格支持的需求。该功能将允许用户在编辑器中插入、编辑和管理图片，使用 LaTeX 语法编写和渲染数学公式，以及创建和编辑表格。

## Glossary

- **Editor**: 基于 Tiptap 的富文本编辑器组件
- **Image Node**: 编辑器中表示图片的节点类型
- **Math Node**: 编辑器中表示数学公式的节点类型
- **LaTeX**: 用于排版数学公式的标记语言
- **KaTeX**: 用于在网页中渲染 LaTeX 公式的 JavaScript 库
- **Inline Math**: 行内数学公式，与文本在同一行显示
- **Block Math**: 块级数学公式，独占一行居中显示
- **Image Upload**: 将本地图片文件上传并插入编辑器的过程
- **Image URL**: 通过网络地址引用的图片资源
- **Table**: 由行和列组成的数据展示结构
- **Table Cell**: 表格中的单个数据单元
- **Table Header**: 表格的标题行

## Requirements

### Requirement 1

**User Story:** As a user, I want to insert images into the editor, so that I can enrich my content with visual elements.

#### Acceptance Criteria

1. WHEN a user clicks the image button in the toolbar THEN the Editor SHALL display an image insertion dialog with URL input and file upload options
2. WHEN a user provides a valid image URL THEN the Editor SHALL insert the image at the current cursor position
3. WHEN a user selects a local image file THEN the Editor SHALL convert the file to base64 and insert the image at the current cursor position
4. WHEN a user attempts to insert an invalid image URL THEN the Editor SHALL display an error message and prevent insertion
5. WHEN a user pastes an image from clipboard THEN the Editor SHALL automatically insert the image at the current cursor position

### Requirement 2

**User Story:** As a user, I want to resize and align images, so that I can control how images appear in my content.

#### Acceptance Criteria

1. WHEN a user clicks on an inserted image THEN the Editor SHALL display resize handles at the corners and edges of the image
2. WHEN a user drags a resize handle THEN the Editor SHALL resize the image proportionally while maintaining aspect ratio
3. WHEN a user selects an image THEN the Editor SHALL display alignment options (left, center, right) in the bubble menu
4. WHEN a user selects an alignment option THEN the Editor SHALL apply the selected alignment to the image

### Requirement 3

**User Story:** As a user, I want to add alt text and captions to images, so that my content is accessible and descriptive.

#### Acceptance Criteria

1. WHEN a user double-clicks on an image THEN the Editor SHALL display an image properties dialog with alt text and caption fields
2. WHEN a user enters alt text THEN the Editor SHALL store the alt text in the image node's attributes
3. WHEN a user enters a caption THEN the Editor SHALL display the caption below the image

### Requirement 4

**User Story:** As a user, I want to insert inline math formulas, so that I can include mathematical expressions within my text.

#### Acceptance Criteria

1. WHEN a user types `$` followed by LaTeX content and another `$` THEN the Editor SHALL convert the content to a rendered inline math formula
2. WHEN a user clicks the inline math button in the toolbar THEN the Editor SHALL insert an editable inline math placeholder at the cursor position
3. WHEN a user clicks on an inline math formula THEN the Editor SHALL display an edit dialog showing the LaTeX source
4. WHEN a user modifies the LaTeX source and confirms THEN the Editor SHALL update the rendered formula
5. WHEN a user enters invalid LaTeX syntax THEN the Editor SHALL display the formula with an error indicator and preserve the source

### Requirement 5

**User Story:** As a user, I want to insert block math formulas, so that I can display prominent mathematical equations.

#### Acceptance Criteria

1. WHEN a user types `$$` on a new line followed by LaTeX content and `$$` THEN the Editor SHALL convert the content to a centered block math formula
2. WHEN a user selects "Math Block" from the slash command menu THEN the Editor SHALL insert an editable block math placeholder
3. WHEN a user clicks on a block math formula THEN the Editor SHALL display an edit dialog showing the LaTeX source
4. WHEN a user modifies the LaTeX source and confirms THEN the Editor SHALL update the rendered formula

### Requirement 6

**User Story:** As a user, I want images and formulas to be included in markdown export, so that I can preserve my content in portable format.

#### Acceptance Criteria

1. WHEN the Editor exports content to markdown THEN the Editor SHALL convert images to markdown image syntax `![alt](url)`
2. WHEN the Editor exports content to markdown THEN the Editor SHALL convert inline math to `$...$` syntax
3. WHEN the Editor exports content to markdown THEN the Editor SHALL convert block math to `$$...$$` syntax
4. WHEN the Editor imports markdown with image syntax THEN the Editor SHALL render the images correctly
5. WHEN the Editor imports markdown with math syntax THEN the Editor SHALL render the formulas correctly
6. WHEN the Editor parses markdown content THEN the Editor SHALL produce an abstract syntax tree that can be printed back to equivalent markdown

### Requirement 7

**User Story:** As a user, I want to delete and manage images and formulas, so that I can edit my content freely.

#### Acceptance Criteria

1. WHEN a user selects an image or formula and presses Delete or Backspace THEN the Editor SHALL remove the selected element
2. WHEN a user uses the drag handle on an image or formula block THEN the Editor SHALL allow repositioning the element within the document
3. WHEN a user copies an image or formula THEN the Editor SHALL include the element in the clipboard for pasting



### Requirement 8

**User Story:** As a user, I want to insert and edit tables, so that I can organize data in a structured format.

#### Acceptance Criteria

1. WHEN a user clicks the table button in the toolbar or selects "Table" from slash command THEN the Editor SHALL display a table size selector and insert a table with the selected dimensions
2. WHEN a user clicks inside a table cell THEN the Editor SHALL allow text editing within that cell
3. WHEN a user presses Tab in a table cell THEN the Editor SHALL move focus to the next cell
4. WHEN a user presses Shift+Tab in a table cell THEN the Editor SHALL move focus to the previous cell
5. WHEN a user right-clicks on a table THEN the Editor SHALL display a context menu with table operations

### Requirement 9

**User Story:** As a user, I want to modify table structure, so that I can adjust tables to fit my content needs.

#### Acceptance Criteria

1. WHEN a user selects "Add Row Above" from table menu THEN the Editor SHALL insert a new row above the current row
2. WHEN a user selects "Add Row Below" from table menu THEN the Editor SHALL insert a new row below the current row
3. WHEN a user selects "Add Column Left" from table menu THEN the Editor SHALL insert a new column to the left of the current column
4. WHEN a user selects "Add Column Right" from table menu THEN the Editor SHALL insert a new column to the right of the current column
5. WHEN a user selects "Delete Row" from table menu THEN the Editor SHALL remove the current row
6. WHEN a user selects "Delete Column" from table menu THEN the Editor SHALL remove the current column
7. WHEN a user selects "Delete Table" from table menu THEN the Editor SHALL remove the entire table

### Requirement 10

**User Story:** As a user, I want to toggle table headers, so that I can distinguish header rows from data rows.

#### Acceptance Criteria

1. WHEN a user selects "Toggle Header Row" THEN the Editor SHALL convert the first row to/from header style
2. WHEN a user selects "Toggle Header Column" THEN the Editor SHALL convert the first column to/from header style
3. WHEN a header cell is rendered THEN the Editor SHALL display the cell with distinct styling (bold text, background color)

### Requirement 11

**User Story:** As a user, I want tables to be included in markdown export, so that I can preserve table data in portable format.

#### Acceptance Criteria

1. WHEN the Editor exports content to markdown THEN the Editor SHALL convert tables to GFM (GitHub Flavored Markdown) table syntax
2. WHEN the Editor imports markdown with table syntax THEN the Editor SHALL render the tables correctly
3. WHEN the Editor parses markdown table content THEN the Editor SHALL produce a table structure that can be printed back to equivalent markdown
