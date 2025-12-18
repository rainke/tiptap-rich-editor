# Design Document: Image, Formula and Table Support

## Overview

本设计文档描述了为 Tiptap 富文本编辑器添加图片、数学公式和表格支持的技术方案。该功能将使用以下官方 Tiptap 扩展和库：
- `@tiptap/extension-image` - 图片支持
- `@tiptap/extension-mathematics` - 数学公式支持（基于 KaTeX）
- `@tiptap/extension-table` - 表格支持
- `katex` - LaTeX 公式渲染

## Architecture

### 高层架构

```mermaid
graph TB
    subgraph Editor["TiptapEditor.vue"]
        Core[Tiptap Core]
        ImageExt[Image Extension]
        MathExt[Mathematics Extension]
        TableExt[Table Extension]
        Toolbar[EditorToolbar]
        SlashCmd[SlashCommand]
    end
    
    subgraph Components["UI Components"]
        ImageDialog[ImageDialog.vue]
        MathDialog[MathDialog.vue]
        ImageBubble[ImageBubbleMenu.vue]
        TableMenu[TableContextMenu.vue]
    end
    
    subgraph Utils["Utilities"]
        MDConverter[markdownConverter.js]
        ImageUtils[imageUtils.js]
    end
    
    subgraph External["External Libraries"]
        KaTeX[KaTeX]
        TiptapImage[@tiptap/extension-image]
        TiptapMath[@tiptap/extension-mathematics]
        TiptapTable[@tiptap/extension-table]
    end
    
    Core --> ImageExt
    Core --> MathExt
    Core --> TableExt
    ImageExt --> TiptapImage
    MathExt --> TiptapMath
    MathExt --> KaTeX
    TableExt --> TiptapTable
    Toolbar --> ImageDialog
    Toolbar --> MathDialog
    ImageExt --> ImageBubble
    TableExt --> TableMenu
```

### 数据流

1. **图片插入流程**: 用户操作 → ImageDialog → Image Extension → Editor State
2. **公式插入流程**: 用户输入 `$...$` → InputRule → Math Extension → KaTeX 渲染
3. **Markdown 导出**: Editor State → markdownConverter → 图片/公式语法

## Components and Interfaces

### 1. Image Extension (`src/extensions/imageExtension.js`)

基于 `@tiptap/extension-image` 扩展，添加自定义属性和命令。

```javascript
// 接口定义
interface ImageAttributes {
  src: string           // 图片 URL 或 base64
  alt: string           // 替代文本
  title: string         // 图片标题
  caption: string       // 图片说明
  width: number | null  // 宽度（像素）
  height: number | null // 高度（像素）
  alignment: 'left' | 'center' | 'right'  // 对齐方式
}

// 命令
interface ImageCommands {
  setImage(options: ImageAttributes): Command
  updateImageAttributes(attributes: Partial<ImageAttributes>): Command
}
```

### 2. Mathematics Extension (使用 `@tiptap/extension-mathematics`)

使用官方 `@tiptap/extension-mathematics` 扩展，支持行内和块级数学公式。

```javascript
// Mathematics 扩展配置
import Mathematics from '@tiptap/extension-mathematics'
import 'katex/dist/katex.min.css'

Mathematics.configure({
  // 使用 KaTeX 渲染
  katexOptions: {
    throwOnError: false,
    errorColor: '#cc0000'
  }
})

// 支持的语法:
// 行内公式: $x^2$ 或 \(x^2\)
// 块级公式: $$x^2$$ 或 \[x^2\]
```

### 3. Table Extension (使用 `@tiptap/extension-table`)

使用官方 `@tiptap/extension-table` 扩展套件。

```javascript
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'

// 命令
interface TableCommands {
  insertTable(options: { rows: number, cols: number, withHeaderRow: boolean }): Command
  addRowBefore(): Command
  addRowAfter(): Command
  addColumnBefore(): Command
  addColumnAfter(): Command
  deleteRow(): Command
  deleteColumn(): Command
  deleteTable(): Command
  toggleHeaderRow(): Command
  toggleHeaderColumn(): Command
}
```

### 3. ImageDialog Component (`src/components/ImageDialog.vue`)

图片插入对话框组件。

```typescript
// Props
interface ImageDialogProps {
  visible: boolean
  editor: Editor
}

// Emits
interface ImageDialogEmits {
  'update:visible': (value: boolean) => void
  'insert': (imageData: ImageAttributes) => void
}
```

### 5. MathDialog Component (`src/components/MathDialog.vue`)

公式编辑对话框组件。

```typescript
// Props
interface MathDialogProps {
  visible: boolean
  initialLatex: string
  isBlock: boolean
}

// Emits
interface MathDialogEmits {
  'update:visible': (value: boolean) => void
  'confirm': (latex: string) => void
}
```

### 6. ImageBubbleMenu Component (`src/components/ImageBubbleMenu.vue`)

图片选中时显示的气泡菜单。

```typescript
// Props
interface ImageBubbleMenuProps {
  editor: Editor
}
```

### 7. TableContextMenu Component (`src/components/TableContextMenu.vue`)

表格右键菜单组件。

```typescript
// Props
interface TableContextMenuProps {
  editor: Editor
}

// 菜单项
- Add Row Above
- Add Row Below
- Add Column Left
- Add Column Right
- Delete Row
- Delete Column
- Toggle Header Row
- Toggle Header Column
- Delete Table
```

## Data Models

### Image Node Schema

```javascript
{
  name: 'image',
  group: 'block',
  atom: true,
  draggable: true,
  attrs: {
    src: { default: null },
    alt: { default: '' },
    title: { default: '' },
    caption: { default: '' },
    width: { default: null },
    height: { default: null },
    alignment: { default: 'center' }
  }
}
```

### InlineMath Node Schema

```javascript
{
  name: 'inlineMath',
  group: 'inline',
  inline: true,
  atom: true,
  attrs: {
    latex: { default: '' }
  }
}
```

### BlockMath Node Schema

```javascript
{
  name: 'blockMath',
  group: 'block',
  atom: true,
  attrs: {
    latex: { default: '' }
  }
}
```

### Table Node Schema

```javascript
// Table (由 @tiptap/extension-table 提供)
{
  name: 'table',
  group: 'block',
  content: 'tableRow+',
  tableRole: 'table'
}

// TableRow
{
  name: 'tableRow',
  content: '(tableCell | tableHeader)+',
  tableRole: 'row'
}

// TableCell
{
  name: 'tableCell',
  content: 'block+',
  tableRole: 'cell',
  attrs: {
    colspan: { default: 1 },
    rowspan: { default: 1 }
  }
}

// TableHeader
{
  name: 'tableHeader',
  content: 'block+',
  tableRole: 'header_cell',
  attrs: {
    colspan: { default: 1 },
    rowspan: { default: 1 }
  }
}
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Valid URL image insertion
*For any* valid image URL, inserting it into the editor SHALL result in an image node with the correct `src` attribute at the cursor position.
**Validates: Requirements 1.2**

### Property 2: Base64 conversion preserves image data
*For any* valid image file, converting it to base64 SHALL produce a data URL that can be decoded back to the original image data.
**Validates: Requirements 1.3**

### Property 3: Invalid URL rejection
*For any* invalid image URL (malformed, non-image, or inaccessible), the editor SHALL reject the insertion and not modify the document state.
**Validates: Requirements 1.4**

### Property 4: Aspect ratio preservation during resize
*For any* image with original dimensions (w, h) and any resize operation, the resulting dimensions (w', h') SHALL satisfy: |w'/h' - w/h| < 0.01 (within 1% tolerance).
**Validates: Requirements 2.2**

### Property 5: Image alignment application
*For any* image node and any alignment value ('left', 'center', 'right'), setting the alignment SHALL update the node's alignment attribute to the specified value.
**Validates: Requirements 2.4**

### Property 6: Image attribute storage
*For any* string value for alt text or caption, the editor SHALL correctly store and retrieve the value from the image node's attributes.
**Validates: Requirements 3.2, 3.3**

### Property 7: Inline math input rule parsing
*For any* string matching the pattern `$<latex>$` where `<latex>` is non-empty and does not contain `$`, the editor SHALL convert it to an inline math node with the correct latex attribute.
**Validates: Requirements 4.1**

### Property 8: Math latex attribute update
*For any* math node (inline or block) and any new LaTeX string, updating the latex attribute SHALL correctly store the new value.
**Validates: Requirements 4.4, 5.4**

### Property 9: Invalid LaTeX preservation
*For any* invalid LaTeX string, the math node SHALL preserve the original source string and indicate an error state.
**Validates: Requirements 4.5**

### Property 10: Block math input rule parsing
*For any* string matching the pattern `$$<latex>$$` on its own line where `<latex>` is non-empty, the editor SHALL convert it to a block math node with the correct latex attribute.
**Validates: Requirements 5.1**

### Property 11: Markdown round-trip for images
*For any* image node with valid attributes, exporting to markdown and re-importing SHALL produce an equivalent image node.
**Validates: Requirements 6.1, 6.4**

### Property 12: Markdown round-trip for math
*For any* math node (inline or block) with valid LaTeX, exporting to markdown and re-importing SHALL produce an equivalent math node.
**Validates: Requirements 6.2, 6.3, 6.5**

### Property 13: Markdown parser round-trip
*For any* valid markdown string containing images and math formulas, parsing then printing SHALL produce equivalent markdown.
**Validates: Requirements 6.6**

### Property 14: Node deletion
*For any* selected image or math node, executing the delete command SHALL remove the node from the document.
**Validates: Requirements 7.1**

### Property 15: Table insertion with dimensions
*For any* valid row and column count (1-10), inserting a table SHALL create a table with exactly the specified number of rows and columns.
**Validates: Requirements 8.1**

### Property 16: Table row operations preserve columns
*For any* table with n columns, adding or deleting a row SHALL result in a table where all rows still have exactly n columns.
**Validates: Requirements 9.1, 9.2, 9.5**

### Property 17: Table column operations preserve rows
*For any* table with m rows, adding or deleting a column SHALL result in a table where all columns still span exactly m rows.
**Validates: Requirements 9.3, 9.4, 9.6**

### Property 18: Markdown round-trip for tables
*For any* table with valid content, exporting to markdown and re-importing SHALL produce an equivalent table structure.
**Validates: Requirements 11.1, 11.2, 11.3**

## Error Handling

### Image Errors

| Error Type | Handling Strategy |
|------------|-------------------|
| Invalid URL format | Display validation error, prevent insertion |
| Image load failure | Show placeholder with error icon, allow retry |
| File too large | Display size limit error (max 5MB recommended) |
| Unsupported format | Display format error, list supported formats |

### Math Errors

| Error Type | Handling Strategy |
|------------|-------------------|
| Invalid LaTeX syntax | Render with error indicator, preserve source |
| KaTeX rendering failure | Display raw LaTeX with error styling |
| Empty formula | Show placeholder text |

### Markdown Conversion Errors

| Error Type | Handling Strategy |
|------------|-------------------|
| Malformed image syntax | Skip conversion, preserve raw text |
| Malformed math syntax | Skip conversion, preserve raw text |
| Missing image URL | Insert image node with empty src |

## Testing Strategy

### Property-Based Testing

使用 `fast-check` 库进行属性测试，验证核心正确性属性。

**测试配置:**
- 每个属性测试运行最少 100 次迭代
- 使用自定义生成器生成有效的测试数据

**生成器策略:**
```javascript
// URL 生成器
const validImageUrl = fc.oneof(
  fc.constant('https://example.com/image.png'),
  fc.webUrl().map(url => `${url}/image.jpg`)
)

// LaTeX 生成器
const validLatex = fc.oneof(
  fc.constant('x^2'),
  fc.constant('\\frac{a}{b}'),
  fc.stringOf(fc.constantFrom('a', 'b', 'x', 'y', '+', '-', '=', '^', '_', '{', '}'))
    .filter(s => s.length > 0 && !s.includes('$'))
)

// Markdown 生成器
const markdownWithImages = fc.array(
  fc.oneof(
    fc.constant('![alt](https://example.com/img.png)'),
    fc.tuple(fc.string(), fc.webUrl()).map(([alt, url]) => `![${alt}](${url})`)
  )
).map(arr => arr.join('\n'))
```

### Unit Testing

使用 `vitest` 进行单元测试，覆盖以下场景:

1. **Image Extension Tests**
   - 图片插入命令
   - 属性更新
   - 对齐设置

2. **Math Extension Tests**
   - 行内公式创建
   - 块级公式创建
   - LaTeX 更新

3. **Markdown Converter Tests**
   - 图片语法转换
   - 公式语法转换
   - 边界情况处理

### Integration Testing

1. **Editor Integration**
   - 扩展注册和初始化
   - 命令执行
   - 事件触发

2. **UI Component Integration**
   - 对话框交互
   - 气泡菜单显示
   - Slash 命令集成

## Implementation Notes

### Dependencies to Add

```json
{
  "@tiptap/extension-image": "^3.13.0",
  "@tiptap/extension-mathematics": "^3.13.0",
  "@tiptap/extension-table": "^3.13.0",
  "@tiptap/extension-table-row": "^3.13.0",
  "@tiptap/extension-table-cell": "^3.13.0",
  "@tiptap/extension-table-header": "^3.13.0",
  "katex": "^0.16.9"
}
```

### File Structure

```
src/
├── extensions/
│   ├── imageExtension.js      # 图片扩展配置
│   ├── mathExtension.js       # 数学公式扩展配置
│   └── tableExtension.js      # 表格扩展配置
├── components/
│   ├── ImageDialog.vue        # 图片插入对话框
│   ├── MathDialog.vue         # 公式编辑对话框
│   ├── ImageBubbleMenu.vue    # 图片气泡菜单
│   └── TableContextMenu.vue   # 表格右键菜单
└── utils/
    ├── imageUtils.js          # 图片处理工具
    └── markdownConverter.js   # 更新以支持图片、公式和表格
```

### Mathematics Extension Integration

```javascript
import Mathematics from '@tiptap/extension-mathematics'
import 'katex/dist/katex.min.css'

// 在编辑器中注册
Mathematics.configure({
  katexOptions: {
    throwOnError: false,
    errorColor: '#cc0000'
  },
  // 支持 $...$ 和 $$...$$ 语法
  regex: /\$([^$]+)\$/g
})
```

### Table Extension Integration

```javascript
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'

// 在编辑器中注册
Table.configure({
  resizable: true,
  HTMLAttributes: {
    class: 'editor-table'
  }
})
```
