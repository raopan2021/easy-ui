<script setup lang="ts">
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { computed, ref, shallowRef } from 'vue'
import '@wangeditor/editor/dist/css/style.css'

export interface RichTextProps {
  /** 绑定值（HTML 字符串） */
  modelValue?: string
  /** 占位符 */
  placeholder?: string
  /** 高度（像素） */
  height?: number
  /** 最小高度（像素） */
  minHeight?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 是否显示默认工具栏 */
  showToolbar?: boolean
  /** 工具栏配置 */
  toolbarConfig?: Partial<IToolbarConfig>
  /** 编辑器配置 */
  editorConfig?: Partial<IEditorConfig>
}

defineOptions({
  name: 'EasyRichText',
})

const props = withDefaults(defineProps<RichTextProps>(), {
  modelValue: '',
  placeholder: '请输入内容...',
  height: 300,
  minHeight: 200,
  disabled: false,
  readonly: false,
  showToolbar: true,
  toolbarConfig: () => ({}),
  editorConfig: () => ({}),
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
  (e: 'created', editor: IDomEditor): void
  (e: 'focus', editor: IDomEditor): void
  (e: 'blur', editor: IDomEditor): void
  (e: 'destroyed', editor: IDomEditor): void
}>()

const editorRef = shallowRef<IDomEditor>()

// 工具栏配置：默认展示常用能力，可通过 props.toolbarConfig 覆盖/合并
const toolbarConfig = computed<Partial<IToolbarConfig>>(() => ({
  excludeKeys: props.showToolbar ? [] : ['group-video', 'group-image', 'fullScreen'],
  ...props.toolbarConfig,
}))

// 编辑器配置
const editorConfig = computed<Partial<IEditorConfig>>(() => ({
  placeholder: props.placeholder,
  readOnly: props.readonly || props.disabled,
  ...props.editorConfig,
}))

// 处理内容变化，同步 v-model
function handleChange(editor: IDomEditor) {
  const html = editor.getHtml()
  emit('update:modelValue', html)
  emit('change', html)
}

// 编辑器创建完成
function handleCreated(editor: IDomEditor) {
  editorRef.value = editor
  // 初始值回填（wangEditor v-model 首次不自动填充，需手动 setHtml）
  if (props.modelValue && editor.isEmpty())
    editor.setHtml(props.modelValue)
  emit('created', editor)
}

// 暴露方法
function getHtml(): string {
  return editorRef.value?.getHtml() ?? props.modelValue ?? ''
}
function getText(): string {
  return editorRef.value?.getText() ?? ''
}
function setHtml(html: string) {
  editorRef.value?.setHtml(html ?? '')
}
function clear() {
  editorRef.value?.clear()
  emit('update:modelValue', '')
  emit('change', '')
}
function focus() {
  editorRef.value?.focus()
}
function blur() {
  editorRef.value?.blur()
}

function handleDestroyed(editor: IDomEditor) {
  emit('destroyed', editor)
  editorRef.value = undefined
}

defineExpose({ getHtml, getText, setHtml, clear, focus, blur })
</script>

<template>
  <div
    class="easy-richtext"
    :class="{
      'is-disabled': disabled,
      'is-readonly': readonly,
      'is-no-toolbar': !showToolbar,
    }"
  >
    <div v-if="showToolbar" class="easy-richtext__toolbar">
      <Toolbar
        :editor="editorRef"
        :default-config="toolbarConfig"
        mode="default"
      />
    </div>

    <div class="easy-richtext__body">
      <Editor
        :model-value="modelValue"
        :default-config="editorConfig"
        mode="default"
        :style="{ height: `${height}px`, minHeight: `${minHeight}px` }"
        @update:model-value="(v: string) => emit('update:modelValue', v)"
        @on-created="handleCreated"
        @on-change="handleChange"
        @on-focus="(e: IDomEditor) => emit('focus', e)"
        @on-blur="(e: IDomEditor) => emit('blur', e)"
        @on-destroyed="handleDestroyed"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.easy-richtext {
  width: 100%;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  overflow: hidden;
  background: var(--el-bg-color);
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--el-border-color-hover);
  }

  &:focus-within {
    border-color: var(--el-color-primary);
  }

  &.is-disabled,
  &.is-readonly {
    cursor: not-allowed;
  }

  &.is-no-toolbar {
    border: none;
    border-radius: 0;
  }

  .easy-richtext__toolbar {
    border-bottom: 1px solid var(--el-border-color-lighter);
    background: var(--el-fill-color-blank);
    z-index: 1;

    :deep(.w-e-toolbar) {
      border: none;
      background: transparent;
    }
  }

  .easy-richtext__body {
    :deep(.w-e-text-container) {
      background: var(--el-bg-color);
    }

    // 内容区文字颜色跟随主题（wangEditor 默认写死浅色，dark 下需覆盖）
    :deep(.w-e-scroll),
    :deep(.w-e-scroll .w-e-text-placeholder) {
      color: var(--el-text-color-regular);
    }
  }
}
</style>

<!-- wangEditor 的 CSS 变量定义在 :root（浅色默认值），dark 下不会变化，需全局覆盖 -->
<style lang="scss">
html.dark .easy-richtext {
  --w-e-textarea-bg-color: var(--el-bg-color);
  --w-e-textarea-color: var(--el-text-color-regular);
  --w-e-textarea-border-color: var(--el-border-color);
  --w-e-textarea-slight-border-color: var(--el-border-color-light);
  --w-e-textarea-slight-color: var(--el-text-color-placeholder);
  --w-e-textarea-slight-bg-color: var(--el-fill-color-light);
  --w-e-textarea-selected-border-color: var(--el-color-primary);
  --w-e-textarea-handler-bg-color: var(--el-color-primary);

  // 工具栏
  --w-e-toolbar-bg-color: var(--el-fill-color-blank);
  --w-e-toolbar-color: var(--el-text-color-regular);
  --w-e-toolbar-active-color: var(--el-color-primary);
  --w-e-toolbar-active-bg-color: var(--el-fill-color-light);
  --w-e-toolbar-disabled-color: var(--el-text-color-disabled);
  --w-e-toolbar-border-color: var(--el-border-color-lighter);
  --w-e-toolbar-slight-border-color: var(--el-border-color-light);

  // 下拉面板 / 弹层
  --w-e-popover-bg-color: var(--el-bg-color-overlay);
  --w-e-popover-color: var(--el-text-color-regular);
  --w-e-popover-border-color: var(--el-border-color-light);

  // 上传面板等
  --w-e-modal-button-bg-color: var(--el-color-primary);
  --w-e-modal-button-border-color: var(--el-color-primary);

  // 内容区内部元素（标题/引用/代码块等）配色
  .w-e-text-container [data-slate-editor] blockquote {
    color: var(--el-text-color-secondary);
    border-color: var(--el-border-color-light);
    background: var(--el-fill-color-light);
  }

  .w-e-text-container [data-slate-editor] pre,
  .w-e-text-container [data-slate-editor] code {
    color: var(--el-text-color-primary);
    background: var(--el-fill-color-light);
  }

  .w-e-text-container [data-slate-editor] h1,
  .w-e-text-container [data-slate-editor] h2,
  .w-e-text-container [data-slate-editor] h3 {
    color: var(--el-text-color-primary);
  }

  .w-e-text-container [data-slate-editor] a {
    color: var(--el-color-primary);
  }
}
</style>
