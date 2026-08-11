import { mount } from '@vue/test-utils'
import List from '../src/list.vue'

describe('List 列表组件', () => {
  it('渲染基础列表容器', () => {
    const wrapper = mount(() => <List list={[{ id: 1, title: '条目1' }]} />)
    expect(wrapper.find('.easy-list').exists()).toBe(true)
  })

  it('渲染列表项标题', () => {
    const wrapper = mount(() => <List list={[{ id: 1, title: '条目1' }, { id: 2, title: '条目2' }]} />)
    const titles = wrapper.findAll('.easy-list__item-title')
    expect(titles.length).toBe(2)
    expect(titles[0].text()).toBe('条目1')
  })

  it('description 字段渲染描述', () => {
    const wrapper = mount(() => (
      <List list={[{ id: 1, title: '条目', desc: '这是描述' }]} description="desc" />
    ))
    expect(wrapper.find('.easy-list__item-desc').text()).toBe('这是描述')
  })

  it('空列表渲染空状态', () => {
    const wrapper = mount(() => <List list={[]} emptyText="暂无内容" />)
    expect(wrapper.find('.easy-list__empty').exists()).toBe(true)
    expect(wrapper.find('.easy-list__empty').text()).toContain('暂无内容')
  })

  it('loading 渲染加载状态', () => {
    const wrapper = mount(() => <List list={[]} loading />)
    expect(wrapper.find('.easy-list__loading').exists()).toBe(true)
    expect(wrapper.find('.easy-list__loading').text()).toContain('加载中')
  })

  it('loading 时不渲染空状态', () => {
    const wrapper = mount(() => <List list={[]} loading />)
    expect(wrapper.find('.easy-list__empty').exists()).toBe(false)
  })

  it('bordered 添加边框类名', () => {
    const wrapper = mount(() => <List list={[{ id: 1, title: 'x' }]} bordered />)
    expect(wrapper.find('.easy-list').classes()).toContain('easy-list--bordered')
  })

  it('header 渲染头部', () => {
    const wrapper = mount(() => <List list={[]} header="列表标题" />)
    expect(wrapper.find('.easy-list__header').text()).toBe('列表标题')
  })

  it('footer 渲染底部', () => {
    const wrapper = mount(() => <List list={[]} footer="底部说明" />)
    expect(wrapper.find('.easy-list__footer').text()).toBe('底部说明')
  })

  it('点击列表项触发 item-click 事件', async () => {
    const onItemClick = vi.fn()
    const list = [{ id: 1, title: '条目1' }]
    const wrapper = mount(() => <List list={list} onItem-click={onItemClick} />)
    await wrapper.find('.easy-list__item').trigger('click')
    expect(onItemClick).toHaveBeenCalledWith(list[0], 0)
  })

  it('默认插槽自定义渲染', () => {
    const wrapper = mount(() => (
      <List list={[{ id: 1, title: 'x' }]}>
        {{
          default: ({ item }: any) => <span class="custom-item">{`自定义-${item.title}`}</span>,
        }}
      </List>
    ))
    expect(wrapper.find('.custom-item').text()).toBe('自定义-x')
  })

  it('maxHeight 应用到内容区样式', () => {
    const wrapper = mount(() => <List list={[{ id: 1, title: 'x' }]} maxHeight="300px" />)
    const body = wrapper.find('.easy-list__body').element as HTMLElement
    expect(body.style.maxHeight).toBe('300px')
  })
})
