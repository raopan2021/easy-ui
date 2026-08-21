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
    expect(downloadSelect.props('options')).toHaveLength(3)
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

  test('pdf download option present in jsdom', async () => {
    const wrapper = mount(() => <Markdown modelValue="# Hello" />)
    const downloadSelect = wrapper
      .findAllComponents(EasySelect)
      .find(w => w.classes().includes('easy-markdown__download-select'))!
    // options 中包含 pdf 下载项
    expect(downloadSelect.props('options')).toEqual(
      expect.arrayContaining([{ value: 'pdf', label: '下载 .pdf' }]),
    )
  })
})
