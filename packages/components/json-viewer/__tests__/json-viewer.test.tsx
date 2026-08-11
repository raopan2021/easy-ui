import { mount } from '@vue/test-utils'
import JsonViewer from '../src/json-viewer.vue'

describe('JsonViewer 组件', () => {
  test('渲染 null 时显示空占位符', () => {
    const wrapper = mount(() => <JsonViewer data={null} />)
    expect(wrapper.find('.easy-json-viewer').exists()).toBe(true)
    expect(wrapper.find('.easy-json-viewer__empty').exists()).toBe(true)
    expect(wrapper.find('.easy-json-viewer__empty').text()).toBe('暂无数据')
  })

  test('渲染基础字符串值', () => {
    const wrapper = mount(() => <JsonViewer data="hello" />)
    expect(wrapper.find('.easy-json-viewer__pre').exists()).toBe(true)
    const jsonString = wrapper.find('.json-string')
    expect(jsonString.exists()).toBe(true)
    expect(jsonString.text()).toBe('"hello"')
  })

  test('渲染对象键与值', () => {
    const wrapper = mount(() => <JsonViewer data={{ name: '张三', age: 18 }} />)
    expect(wrapper.find('.json-key').text()).toBe('"name"')
    expect(wrapper.find('.json-number').text()).toBe('18')
  })

  test('解析 JSON 字符串数据', () => {
    const wrapper = mount(() => <JsonViewer data='{"a":1}' />)
    expect(wrapper.find('.json-key').text()).toBe('"a"')
    expect(wrapper.find('.json-number').text()).toBe('1')
  })

  test('showToolbar 控制工具栏显隐', () => {
    const wrapper = mount(() => <JsonViewer data={{ a: 1 }} showToolbar={false} />)
    expect(wrapper.find('.easy-json-viewer__toolbar').exists()).toBe(false)
  })

  test('showCopy/showExpand 控制复制与展开按钮', () => {
    const wrapper = mount(() => <JsonViewer data={{ a: 1 }} showCopy={false} showExpand={false} />)
    // 工具栏仍存在，但没有 复制/展开/折叠 按钮
    expect(wrapper.find('.easy-json-viewer__toolbar').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('复制')
    expect(wrapper.text()).not.toContain('展开')
  })

  test('复制按钮写入剪贴板', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const wrapper = mount(() => <JsonViewer data={{ a: 1 }} />)
    const copyBtn = wrapper.findAll('.easy-json-viewer__btn').find(w => w.text().includes('复制'))
    expect(copyBtn).toBeTruthy()
    await copyBtn!.trigger('click')
    expect(writeText).toHaveBeenCalledWith('{\n  "a": 1\n}')
    vi.unstubAllGlobals()
  })

  test('展开全部后能看到深层节点', async () => {
    const wrapper = mount(() => (
      <JsonViewer data={{ a: { b: { c: 1 } } }} depth={0} />
    ))
    // depth=0 全部展开，应能看到深层 key "c"
    expect(wrapper.text()).toContain('"c"')
  })

  test('折叠按钮折叠嵌套节点', async () => {
    const wrapper = mount(() => (
      <JsonViewer data={{ a: { b: { c: 1 } } }} depth={3} />
    ))
    // 默认 depth=3，a 展开后能看到 b
    const collapseBtn = wrapper.findAll('.easy-json-viewer__btn').find(w => w.text().includes('折叠'))
    expect(collapseBtn).toBeTruthy()
    await collapseBtn!.trigger('click')
    // 折叠后不再显示深层 key
    expect(wrapper.text()).not.toContain('"c"')
  })

  test('theme 属性反映主题类名', () => {
    const wrapper = mount(() => <JsonViewer data={{ a: 1 }} theme="dark" />)
    expect(wrapper.find('.easy-json-viewer').classes()).toContain('easy-json-viewer--dark')
  })
})
