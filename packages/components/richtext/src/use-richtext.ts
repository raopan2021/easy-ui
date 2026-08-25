import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'

import type { RichTextEmits, RichTextProps } from './richtext'

import { computed, shallowRef } from 'vue'

/**
 * 富文本编辑器逻辑：维护编辑器实例、拼装工具栏/编辑器配置，处理内容变化与生命周期。
 *
 * 将原本内联在 richtext.vue 中的状态与方法抽离为独立 composable（对齐 switch 等组件拆分规范）。
 *
 * @param props 富文本组件 props（modelValue / placeholder / height / disabled / readonly / showToolbar 等）
 * @param emit  富文本组件事件触发函数（callable 形式，直接标注 RichTextEmits 类型）
 */
export function useRichText(props: RichTextProps, emit: RichTextEmits) {
  /** 编辑器实例引用（供命令式 API 调用） */
  const editorRef = shallowRef<IDomEditor>()

  /** 工具栏配置：默认展示常用能力，可通过 props.toolbarConfig 覆盖/合并 */
  const toolbarConfig = computed<Partial<IToolbarConfig>>(() => ({
    excludeKeys: props.showToolbar ? [] : ['group-video', 'group-image', 'fullScreen'],
    ...props.toolbarConfig,
  }))

  /** 编辑器配置 */
  const editorConfig = computed<Partial<IEditorConfig>>(() => ({
    placeholder: props.placeholder,
    readOnly: props.readonly || props.disabled,
    ...props.editorConfig,
  }))

  /** 处理内容变化，同步 v-model */
  function handleChange(editor: IDomEditor) {
    const html = editor.getHtml()
    emit('update:modelValue', html)
    emit('change', html)
  }

  /** 编辑器创建完成：缓存实例并回填初始值 */
  function handleCreated(editor: IDomEditor) {
    editorRef.value = editor
    // 初始值回填（wangEditor v-model 首次不自动填充，需手动 setHtml）
    if (props.modelValue && editor.isEmpty())
      editor.setHtml(props.modelValue)
    emit('created', editor)
  }

  /** 获取 HTML */
  function getHtml(): string {
    return editorRef.value?.getHtml() ?? props.modelValue ?? ''
  }

  /** 获取纯文本 */
  function getText(): string {
    return editorRef.value?.getText() ?? ''
  }

  /** 设置 HTML */
  function setHtml(html: string) {
    editorRef.value?.setHtml(html ?? '')
  }

  /** 清空内容 */
  function clear() {
    editorRef.value?.clear()
    emit('update:modelValue', '')
    emit('change', '')
  }

  /** 聚焦 */
  function focus() {
    editorRef.value?.focus()
  }

  /** 失焦 */
  function blur() {
    editorRef.value?.blur()
  }

  /** 编辑器销毁：清理引用并对外通知 */
  function handleDestroyed(editor: IDomEditor) {
    emit('destroyed', editor)
    editorRef.value = undefined
  }

  return {
    editorRef,
    toolbarConfig,
    editorConfig,
    handleChange,
    handleCreated,
    getHtml,
    getText,
    setHtml,
    clear,
    focus,
    blur,
    handleDestroyed,
  }
}
