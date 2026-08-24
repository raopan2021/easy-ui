import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import { EasySelect } from '../../select'
import Markdown from '../src/markdown.vue'

describe('Markdown.vue', () => {
  test('render wrapper structure with toolbar', () => {
    const wrapper = mount(() => <Markdown />)
    expect(wrapper.find('.easy-markdown').exists()).toBe(true)
    expect(wrapper.find('.easy-markdown__toolbar').exists()).toBe(true)
    expect(wrapper.find('.easy-markdown__textarea').exists()).toBe(true)
    expect(wrapper.find('.easy-markdown__preview').exists()).toBe(true)
  })

  test('renders markdown to html in preview', () => {
    const wrapper = mount(() => <Markdown modelValue="# Hello" />)
    const preview = wrapper.find('.easy-markdown__preview')
    expect(preview.element.innerHTML).toContain('<h1>Hello</h1>')
  })

  test('textarea input emits update:modelValue and change', async () => {
    const onUpdate = vi.fn()
    const onChange = vi.fn()
    const wrapper = mount(() => <Markdown modelValue="" onUpdate:modelValue={onUpdate} onChange={onChange} />)
    const textarea = wrapper.find('.easy-markdown__textarea')
    await textarea.setValue('## 标题')
    await nextTick()
    expect(onUpdate).toHaveBeenCalledWith('## 标题')
    expect(onChange).toHaveBeenCalledWith('## 标题')
  })

  test('save button emits save event with current value', async () => {
    const onSave = vi.fn()
    const wrapper = mount(() => <Markdown modelValue="# content" onSave={onSave} />)
    await wrapper.find('.easy-markdown__action').trigger('click')
    expect(onSave).toHaveBeenCalledWith('# content')
  })

  test('switch view buttons update active state', async () => {
    const wrapper = mount(() => <Markdown defaultView="edit" />)
    const btns = wrapper.findAll('.easy-markdown__view-btn')
    expect(btns[0]!.classes()).toContain('is-active')

    await btns[2]!.trigger('click')
    expect(btns[2]!.classes()).toContain('is-active')
    expect(btns[0]!.classes()).not.toContain('is-active')
  })

  test('toolbar contains theme select and download select', () => {
    const wrapper = mount(() => <Markdown />)
    const selects = wrapper.findAllComponents(EasySelect)
    expect(selects).toHaveLength(2)
    // EasySelect 通过 options prop 渲染，选项文本在 body 的 Teleport 面板中
    const themeSelect = selects.find(w => w.classes().includes('easy-markdown__theme-select'))!
    const downloadSelect = selects.find(w => w.classes().includes('easy-markdown__download-select'))!
    expect(themeSelect.props('options')).toHaveLength(3)
    // md / html / docx / pdf-file / pdf / png / jpeg / webp
    expect(downloadSelect.props('options')).toHaveLength(8)
    expect(themeSelect.props('placeholder')).toBe('切换主题')
    expect(downloadSelect.props('placeholder')).toBe('下载文档')
  })

  test('download select emits download event with selected format', async () => {
    // 下载会调用 downloadBlob（URL.createObjectURL 在 jsdom 中未实现），此处 mock
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    const onDownload = vi.fn()
    const wrapper = mount(() => <Markdown modelValue="# Hello" onDownload={onDownload} />)
    const downloadSelect = wrapper
      .findAllComponents(EasySelect)
      .find(w => w.classes().includes('easy-markdown__download-select'))!
    expect(downloadSelect).toBeDefined()

    await downloadSelect.vm.$emit('change', 'html')
    await nextTick()
    expect(onDownload).toHaveBeenCalledWith('html', expect.stringContaining('Hello'))
  })

  test('theme switch updates data-theme and emits update:theme', async () => {
    const onUpdateTheme = vi.fn()
    const wrapper = mount(() => <Markdown onUpdate:theme={onUpdateTheme} />)
    expect(wrapper.find('.easy-markdown').attributes('data-theme')).toBe('default')

    const themeSelect = wrapper
      .findAllComponents(EasySelect)
      .find(w => w.classes().includes('easy-markdown__theme-select'))!
    await themeSelect.vm.$emit('change', 'github')
    await nextTick()
    expect(wrapper.find('.easy-markdown').attributes('data-theme')).toBe('github')
    expect(onUpdateTheme).toHaveBeenCalledWith('github')

    await themeSelect.vm.$emit('change', 'clean')
    await nextTick()
    expect(wrapper.find('.easy-markdown').attributes('data-theme')).toBe('clean')
  })

  test('custom theme prop is used as initial data-theme', () => {
    const wrapper = mount(() => <Markdown theme="github" />)
    expect(wrapper.find('.easy-markdown').attributes('data-theme')).toBe('github')
  })

  test('pdf download options present (print & file)', async () => {
    const wrapper = mount(() => <Markdown modelValue="# Hello" />)
    const downloadSelect = wrapper
      .findAllComponents(EasySelect)
      .find(w => w.classes().includes('easy-markdown__download-select'))!
    // options 中同时包含打印 PDF 与直接生成 PDF
    expect(downloadSelect.props('options')).toEqual(
      expect.arrayContaining([
        { value: 'pdf', label: '打印 PDF' },
        { value: 'pdf-file', label: '下载 PDF' },
      ]),
    )
  })

  test('docx download option present', async () => {
    const wrapper = mount(() => <Markdown modelValue="# Hello" />)
    const downloadSelect = wrapper
      .findAllComponents(EasySelect)
      .find(w => w.classes().includes('easy-markdown__download-select'))!
    expect(downloadSelect.props('options')).toEqual(
      expect.arrayContaining([{ value: 'docx', label: '下载 .docx' }]),
    )
  })

  test('image download options present (png/jpeg/webp)', async () => {
    const wrapper = mount(() => <Markdown modelValue="# Hello" />)
    const downloadSelect = wrapper
      .findAllComponents(EasySelect)
      .find(w => w.classes().includes('easy-markdown__download-select'))!
    const options = downloadSelect.props('options') as Array<{ value: string, label: string }>
    expect(options).toEqual(
      expect.arrayContaining([
        { value: 'png', label: '下载 .png' },
        { value: 'jpeg', label: '下载 .jpg' },
        { value: 'webp', label: '下载 .webp' },
      ]),
    )
    // 图片格式排在文档类格式之后
    const values = options.map(o => o.value)
    expect(values.indexOf('png')).toBeGreaterThan(values.indexOf('pdf'))
  })

  // ──── 渲染增强 ────

  test('renders GitHub task list checkbox', () => {
    const wrapper = mount(() => <Markdown modelValue="- [x] 已完成\n- [ ] 待办" />)
    const preview = wrapper.find('.easy-markdown__preview')
    expect(preview.element.innerHTML).toContain('task-list-item-checkbox')
    expect(preview.element.innerHTML).toContain('checked=""')
    expect(preview.element.innerHTML).toContain('contains-task-list')
  })

  test('renders GitHub callout', () => {
    const wrapper = mount(() => <Markdown modelValue="> [!NOTE] 这是一条提示" />)
    const preview = wrapper.find('.easy-markdown__preview')
    expect(preview.element.innerHTML).toContain('md-callout md-callout--note')
  })

  test('repairs malformed table delimiter rows', () => {
    const wrapper = mount(() => <Markdown modelValue={'| a | b |\n| --- | --- | --- |\n| 1 | 2 |'} />)
    const preview = wrapper.find('.easy-markdown__preview')
    // 分隔行 3 列 vs 表头 2 列，修复后应正常渲染 table
    expect(preview.element.innerHTML).toContain('<table>')
    expect(preview.element.innerHTML).toContain('<th>a</th>')
  })

  test('codeBlockLineNumbers wraps lines with cb-line', () => {
    const wrapper = mount(() => <Markdown codeBlockLineNumbers modelValue={'```ts\nconst a = 1\nconst b = 2\n```'} />)
    const preview = wrapper.find('.easy-markdown__preview')
    expect(preview.element.innerHTML).toContain('cb-numbered')
    const lineCount = (preview.element.innerHTML.match(/cb-line/g) ?? []).length
    expect(lineCount).toBe(2)
  })

  test('mermaid code block kept as-is when renderer unavailable', () => {
    const wrapper = mount(() => <Markdown modelValue={'```mermaid\ngraph TD\nA-->B\n```'} />)
    const preview = wrapper.find('.easy-markdown__preview')
    expect(preview.element.innerHTML).toContain('language-mermaid')
  })

  // ──── 编辑体验 ────

  test('Tab key inserts indentation', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(() => <Markdown modelValue="abc" onUpdate:modelValue={onUpdate} />)
    const textarea = wrapper.find('.easy-markdown__textarea')
    const el = textarea.element as HTMLTextAreaElement
    el.setSelectionRange(0, 0)
    await textarea.trigger('keydown', { key: 'Tab' })
    expect(onUpdate).toHaveBeenCalledWith('  abc')
  })

  test('Shift+Tab removes indentation', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(() => <Markdown modelValue="  abc" onUpdate:modelValue={onUpdate} />)
    const textarea = wrapper.find('.easy-markdown__textarea')
    const el = textarea.element as HTMLTextAreaElement
    el.setSelectionRange(2, 2)
    await textarea.trigger('keydown', { key: 'Tab', shiftKey: true })
    expect(onUpdate).toHaveBeenCalledWith('abc')
  })

  test('Ctrl+S triggers save event', async () => {
    const onSave = vi.fn()
    const wrapper = mount(() => <Markdown modelValue="# content" onSave={onSave} />)
    await wrapper.find('.easy-markdown__textarea').trigger('keydown', { key: 's', ctrlKey: true })
    expect(onSave).toHaveBeenCalledWith('# content')
  })

  test('Enter keeps current line indentation', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(() => <Markdown modelValue="  first" onUpdate:modelValue={onUpdate} />)
    const textarea = wrapper.find('.easy-markdown__textarea')
    const el = textarea.element as HTMLTextAreaElement
    el.setSelectionRange(7, 7)
    await textarea.trigger('keydown', { key: 'Enter' })
    expect(onUpdate).toHaveBeenCalledWith('  first\n  ')
  })

  // ──── 布局 ────

  test('fill adds is-fill class and skips fixed height', () => {
    const wrapper = mount(() => <Markdown fill height={400} />)
    expect(wrapper.find('.easy-markdown').classes()).toContain('is-fill')
    const body = wrapper.find('.easy-markdown__body')
    expect((body.element as HTMLElement).style.height).toBe('')
  })

  test('lineNumbers renders gutter with numbered lines', async () => {
    const wrapper = mount(() => <Markdown lineNumbers modelValue={'a\nb\nc'} />)
    // onMounted 中的测量是 nextTick 之后异步填充的，需要等待完整渲染
    await nextTick()
    await nextTick()
    expect(wrapper.find('.easy-markdown__gutter').exists()).toBe(true)
    const lines = wrapper.findAll('.easy-markdown__gutter-line')
    expect(lines.length).toBe(3)
  })

  test('measureLineHeights returns per-line heights', async () => {
    const ta = document.createElement('textarea')
    document.body.appendChild(ta)
    ta.value = 'a\nb\nc'
    const heights = (await import('../src/markdown-it-ext')).measureLineHeights(ta, 'a\nb\nc')
    document.body.removeChild(ta)
    expect(heights.length).toBe(3)
    expect(heights.every(h => h > 0)).toBe(true)
  })
})
