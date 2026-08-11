import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Tag from '../src/tag.vue'

describe('Tag 标签组件', () => {
  test('渲染基础标签与默认类名', () => {
    const wrapper = mount(() => <Tag>标签</Tag>)
    expect(wrapper.find('.easy-tag').exists()).toBe(true)
    expect(wrapper.find('.easy-tag__text').text()).toBe('标签')
    expect(wrapper.classes()).toContain('easy-tag--default')
    expect(wrapper.classes()).toContain('easy-tag--light')
  })

  test('type 应用到类名', () => {
    const wrapper = mount(() => <Tag type="success">成功</Tag>)
    expect(wrapper.classes()).toContain('easy-tag--success')
  })

  test('size 应用到类名', () => {
    const wrapper = mount(() => <Tag size="small">小</Tag>)
    expect(wrapper.classes()).toContain('easy-tag--small')
  })

  test('effect 应用到类名', () => {
    const wrapper = mount(() => <Tag effect="dark">暗色</Tag>)
    expect(wrapper.classes()).toContain('easy-tag--dark')
  })

  test('round 添加圆形类名', () => {
    const wrapper = mount(() => <Tag round>胶囊</Tag>)
    expect(wrapper.classes()).toContain('is-round')
  })

  test('closable 显示关闭按钮', () => {
    const wrapper = mount(() => <Tag closable>可关闭</Tag>)
    expect(wrapper.find('.easy-tag__close').exists()).toBe(true)
  })

  test('点击关闭按钮触发 close 并隐藏标签', async () => {
    const onClose = vi.fn()
    const wrapper = mount(() => <Tag closable onClose={onClose}>可关闭</Tag>)
    await wrapper.find('.easy-tag__close').trigger('click')
    await nextTick()
    expect(onClose).toHaveBeenCalled()
    expect(wrapper.find('.easy-tag').exists()).toBe(false)
  })

  test('clickable 且未禁用时点击触发 click', async () => {
    const onClick = vi.fn()
    const wrapper = mount(() => <Tag clickable onClick={onClick}>可点击</Tag>)
    await wrapper.find('.easy-tag').trigger('click')
    expect(onClick).toHaveBeenCalled()
  })

  test('clickable 且禁用时不触发 click', async () => {
    const onClick = vi.fn()
    const wrapper = mount(() => <Tag clickable disabled onClick={onClick}>禁用</Tag>)
    await wrapper.find('.easy-tag').trigger('click')
    expect(onClick).not.toHaveBeenCalled()
  })

  test('disabled 添加禁用类名', () => {
    const wrapper = mount(() => <Tag disabled>禁用</Tag>)
    expect(wrapper.classes()).toContain('is-disabled')
  })

  test('color 自定义颜色应用到样式', () => {
    const wrapper = mount(() => <Tag color="#ff0000" effect="dark">红</Tag>)
    const el = wrapper.find('.easy-tag').element as HTMLElement
    expect(el.style.backgroundColor).toBe('rgb(255, 0, 0)')
  })
})
