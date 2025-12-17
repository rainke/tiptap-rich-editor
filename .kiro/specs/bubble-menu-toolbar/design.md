# Design Document: Bubble Menu Toolbar

## Overview

本设计文档描述了为 Tiptap 富文本编辑器添加选中文字浮动工具栏（Bubble Menu）功能的技术实现方案。Bubble Menu 是一种上下文感知的浮动工具栏，当用户选中文字时自动出现在选区附近，提供快速的文本格式化操作。

该功能将利用 Tiptap 官方提供的 `@tiptap/extension-bubble-menu` 扩展，结合现有的 Vue 3 组件架构实现。设计目标是提供流畅、直观的用户体验，同时保持与现有 EditorToolbar 组件的视觉一致性。

## Architecture

### 高层架构

```
┌─────────────────────────────────────────────────────────┐
│                    TiptapEditor.vue                      │
│  ┌─────────────────┐  ┌─────────────────────────────┐   │
│  │  EditorToolbar  │  │       EditorContent         │   │
│  │   (固定工具栏)   │  │  ┌─────────────────────┐   │   │
│  └─────────────────┘  │  │   BubbleMenuToolbar │   │   │
│                       │  │    (浮动工具栏)      │   │   │
│                       │  └─────────────────────┘   │   │
│                       └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 组件层次

1. **TiptapEditor.vue** - 主编辑器组件，集成 BubbleMenu 扩展
2. **BubbleMenuToolbar.vue** - 新建的浮动工具栏组件
3. **@tiptap/extension-bubble-menu** - Tiptap 官方 Bubble Menu 扩展

### 技术选型

- **@tiptap/extension-bubble-menu**: Tiptap 官方扩展，处理浮动菜单的显示/隐藏逻辑和定位
- **Tippy.js**: 已在项目中安装，用于浮动定位（Bubble Menu 扩展内部使用）
- **Vue 3 Composition API**: 与现有代码风格保持一致

## Components and Interfaces

### BubbleMenuToolbar.vue

新建的 Vue 组件，负责渲染浮动工具栏的 UI。

```typescript
// Props
interface BubbleMenuToolbarProps {
  editor: Editor | null  // Tiptap 编辑器实例
}

// 内部状态
interface BubbleMenuState {
  isLinkInputVisible: boolean  // 链接输入框是否显示
  linkUrl: string              // 链接 URL 输入值
}
```

### 格式化按钮配置

```typescript
interface FormatButton {
  name: string           // 按钮标识符
  icon: string           // 显示图标/文字
  title: string          // 工具提示文本
  mark: string           // Tiptap mark 类型
  action: () => void     // 点击处理函数
  isActive: () => boolean // 激活状态检查
}
```

### TiptapEditor.vue 修改

需要在 TiptapEditor.vue 中集成 BubbleMenu 扩展：

```javascript
import { BubbleMenu } from '@tiptap/extension-bubble-menu'

// 在 extensions 数组中添加
BubbleMenu.configure({
  shouldShow: ({ editor, state }) => {
    // 仅在有文本选中时显示
    return !state.selection.empty
  }
})
```

## Data Models

### 按钮配置数据结构

```javascript
const formatButtons = [
  { name: 'bold', icon: 'B', title: '加粗', mark: 'bold' },
  { name: 'italic', icon: 'I', title: '斜体', mark: 'italic' },
  { name: 'underline', icon: 'U', title: '下划线', mark: 'underline' },
  { name: 'strike', icon: 'S', title: '删除线', mark: 'strike' },
  { name: 'code', icon: '</>', title: '行内代码', mark: 'code' },
  { name: 'link', icon: '🔗', title: '链接', mark: 'link' }
]
```

### 链接编辑状态

```javascript
const linkState = {
  isEditing: false,      // 是否处于编辑模式
  currentUrl: '',        // 当前链接 URL
  inputValue: ''         // 输入框值
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, the following properties consolidate related acceptance criteria:

### Property 1: Selection visibility toggle

*For any* editor state, the Bubble Menu visibility should equal the negation of selection emptiness - when selection is non-empty, menu is visible; when selection is empty or collapsed, menu is hidden.

**Validates: Requirements 1.1, 1.2**

### Property 2: Format mark toggle consistency

*For any* mark type (bold, italic, underline, strike, code) and any selected text, invoking the toggle action should flip the mark state - if the mark was not present, it becomes present; if it was present, it is removed.

**Validates: Requirements 2.2, 2.3, 2.4, 2.5, 2.6**

### Property 3: Button active state reflection

*For any* mark type and any selected text, the corresponding button's active state should equal whether that mark is currently applied to the selection.

**Validates: Requirements 3.4, 4.1, 4.2, 4.3, 4.4, 4.5**

### Property 4: Link creation from valid URL

*For any* valid URL string and any selected text, applying the link action should result in the selected text becoming a hyperlink with the specified URL as its href attribute.

**Validates: Requirements 3.3**

## Error Handling

### 链接 URL 验证

- 空 URL 输入时不创建链接，保持原有状态
- 无效 URL 格式时提示用户重新输入
- 取消操作时恢复原有选区状态

### 编辑器状态检查

- 在执行任何格式化操作前检查 editor 实例是否存在
- 选区丢失时自动隐藏 Bubble Menu
- 编辑器销毁时清理相关事件监听

### 边界情况处理

- 选区跨越多个块级元素时正常显示菜单
- 选区包含混合格式时，按钮状态反映主要格式
- 编辑器不可编辑时隐藏 Bubble Menu

## Testing Strategy

### 测试框架

- **单元测试**: Vitest（项目已配置）
- **属性测试**: fast-check（项目已安装）
- **组件测试**: @vue/test-utils（项目已安装）

### 单元测试覆盖

1. **BubbleMenuToolbar 组件测试**
   - 验证所有格式化按钮正确渲染
   - 验证按钮点击触发正确的编辑器命令
   - 验证链接输入流程

2. **集成测试**
   - 验证 Bubble Menu 与 TiptapEditor 的集成
   - 验证选区变化时菜单的显示/隐藏

### 属性测试策略

每个属性测试必须：
- 运行至少 100 次迭代
- 使用注释标注对应的 correctness property
- 格式：`**Feature: bubble-menu-toolbar, Property {number}: {property_text}**`

**Property 1 测试**: 生成随机编辑器内容和选区状态，验证菜单可见性与选区非空状态一致。

**Property 2 测试**: 生成随机 mark 类型和文本内容，验证 toggle 操作正确翻转 mark 状态。

**Property 3 测试**: 生成随机 mark 组合应用到文本，验证按钮 active 状态与 mark 存在性一致。

**Property 4 测试**: 生成随机有效 URL 和文本，验证链接创建后 href 属性正确设置。

### 测试文件结构

```
src/
├── components/
│   ├── BubbleMenuToolbar.vue
│   └── BubbleMenuToolbar.test.js
```
