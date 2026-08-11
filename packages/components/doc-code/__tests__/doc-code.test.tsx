import { mount } from '@vue/test-utils'
import DocCode from '../src/doc-code.vue'

describe('DocCode 代码展示组件', () => {
  it('渲染基础代码容器', () => {
    const wrapper = mount(() => <DocCode code="const a = 1" />)
    expect(wrapper.find('.doc-code').exists()).toBe(true)
    expect(wrapper.find('.doc-code__body').exists()).toBe(true)
  })

  it('渲染代码内容到 body', () => {
    const wrapper = mount(() => <DocCode code="const a = 1" />)
    expect(wrapper.find('.doc-code__body pre').exists()).toBe(true)
    expect(wrapper.find('.doc-code__body code').text()).toContain('const a = 1')
  })

  it('lang 应用到语言标签', () => {
    const wrapper = mount(() => <DocCode code="const a = 1" lang="js" />)
    expect(wrapper.find('.doc-code__toolbar__lang').text()).toBe('js')
  })

  it('lang 为 auto 时自动检测语言并显示', () => {
    const wrapper = mount(() => <DocCode code="function greet() { return 'hi' }" />)
    expect(wrapper.find('.doc-code__toolbar__lang').text().length).toBeGreaterThan(0)
  })

  it('复制按钮触发写入剪贴板', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const wrapper = mount(() => <DocCode code="const a = 1" />)
    const copyBtn = wrapper.find('.doc-code__toolbar__btn')
    expect(copyBtn.text()).toBe('复制')
    await copyBtn.trigger('click')
    expect(writeText).toHaveBeenCalledWith('const a = 1')
    vi.unstubAllGlobals()
  })

  it('复制成功后文案变为已复制', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    vi.useFakeTimers()
    const wrapper = mount(() => <DocCode code="const a = 1" />)
    await wrapper.find('.doc-code__toolbar__btn').trigger('click')
    expect(wrapper.find('.doc-code__toolbar__btn').text()).toBe('已复制')
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('代码内容被 HTML 转义', () => {
    const wrapper = mount(() => <DocCode code="<div>文本</div>" />)
    const code = wrapper.find('.doc-code__body code')
    expect(code.text()).toContain('<div>')
  })
})
