import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import TabPane from '../src/tab-pane.vue'
import Tabs from '../src/tabs.vue'

function renderTabs(props: Record<string, any> = {}, panes: Array<Record<string, any>> = [{}]) {
  return mount(() => (
    <Tabs {...props}>
      {panes.map((p, i) => (
        <TabPane key={p.name ?? i} {...p}>{`内容${i + 1}`}</TabPane>
      ))}
    </Tabs>
  ))
}

const defaultPanes = [
  { name: 'tab1', label: '选项卡一' },
  { name: 'tab2', label: '选项卡二' },
  { name: 'tab3', label: '选项卡三' },
]

describe('Tabs 选项卡组件', () => {
  it('渲染基础选项卡容器', async () => {
    const wrapper = renderTabs({ modelValue: 'tab1' }, defaultPanes)
    await nextTick()
    expect(wrapper.find('.easy-tabs').exists()).toBe(true)
  })

  it('渲染各选项卡标题', async () => {
    const wrapper = renderTabs({ modelValue: 'tab1' }, defaultPanes)
    await nextTick()
    const labels = wrapper.findAll('.easy-tabs__item-label')
    expect(labels.length).toBe(3)
    expect(labels[0].text()).toBe('选项卡一')
  })

  it('modelValue 对应选项卡高亮', async () => {
    const wrapper = renderTabs({ modelValue: 'tab2' }, defaultPanes)
    await nextTick()
    const items = wrapper.findAll('.easy-tabs__item')
    expect(items[1].classes()).toContain('is-active')
    expect(items[0].classes()).not.toContain('is-active')
  })

  it('type 应用到类名', () => {
    const wrapper = renderTabs({ type: 'card', modelValue: 'tab1' }, defaultPanes)
    expect(wrapper.find('.easy-tabs').classes()).toContain('easy-tabs--card')
  })

  it('size 应用到类名', () => {
    const wrapper = renderTabs({ size: 'small', modelValue: 'tab1' }, defaultPanes)
    expect(wrapper.find('.easy-tabs').classes()).toContain('easy-tabs--small')
  })

  it('tabPosition 应用到类名', () => {
    const wrapper = renderTabs({ tabPosition: 'bottom', modelValue: 'tab1' }, defaultPanes)
    expect(wrapper.find('.easy-tabs').classes()).toContain('easy-tabs--bottom')
  })

  it('点击选项卡触发 tab-change 并更新值', async () => {
    const onTabChange = vi.fn()
    const onUpdate = vi.fn()
    const wrapper = mount(() => (
      <Tabs modelValue="tab1" onTab-change={onTabChange} onUpdate:modelValue={onUpdate}>
        {defaultPanes.map(p => <TabPane {...p}>{`内容-${p.name}`}</TabPane>)}
      </Tabs>
    ))
    await nextTick()
    const items = wrapper.findAll('.easy-tabs__item')
    await items[2].trigger('click')
    expect(onTabChange).toHaveBeenCalledWith('tab3')
    expect(onUpdate).toHaveBeenCalledWith('tab3')
  })

  it('点击当前激活选项卡不触发 tab-change', async () => {
    const onTabChange = vi.fn()
    const wrapper = renderTabs({ modelValue: 'tab1', onTabChange }, defaultPanes)
    await nextTick()
    const items = wrapper.findAll('.easy-tabs__item')
    await items[0].trigger('click')
    expect(onTabChange).not.toHaveBeenCalled()
  })

  it('disabled 选项卡不可点击', async () => {
    const onTabChange = vi.fn()
    const panes = [
      { name: 'tab1', label: '一' },
      { name: 'tab2', label: '二', disabled: true },
    ]
    const wrapper = renderTabs({ modelValue: 'tab1', onTabChange }, panes)
    await nextTick()
    const items = wrapper.findAll('.easy-tabs__item')
    expect(items[1].classes()).toContain('is-disabled')
    await items[1].trigger('click')
    expect(onTabChange).not.toHaveBeenCalled()
  })

  it('line 类型渲染活动指示条', async () => {
    const wrapper = renderTabs({ type: 'line', modelValue: 'tab1' }, defaultPanes)
    await nextTick()
    expect(wrapper.find('.easy-tabs__active-bar').exists()).toBe(true)
  })

  it('card 类型不渲染活动指示条', async () => {
    const wrapper = renderTabs({ type: 'card', modelValue: 'tab1' }, defaultPanes)
    await nextTick()
    expect(wrapper.find('.easy-tabs__active-bar').exists()).toBe(false)
  })

  it('激活的 TabPane 渲染内容且非激活隐藏', async () => {
    const wrapper = renderTabs({ modelValue: 'tab2' }, defaultPanes)
    await nextTick()
    const panes = wrapper.findAll('.easy-tab-pane')
    expect(panes.length).toBe(3)
    // 激活的第二个面板可见
    expect((panes[1].element as HTMLElement).style.display).not.toBe('none')
    // 非激活的第一、第三个面板隐藏
    expect((panes[0].element as HTMLElement).style.display).toBe('none')
    expect((panes[2].element as HTMLElement).style.display).toBe('none')
    expect(panes[1].text()).toBe('内容2')
  })
})
