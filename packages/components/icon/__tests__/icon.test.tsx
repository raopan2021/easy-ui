import { mount } from '@vue/test-utils'
import Icon from '../src/icon.vue'

describe('Icon 图标组件', () => {
  test('渲染基础图标根元素', () => {
    const wrapper = mount(() => <Icon name="el:Search" />)
    expect(wrapper.find('.easy-icon').exists()).toBe(true)
  })

  test('el: 前缀渲染 Element 模式', () => {
    const wrapper = mount(() => <Icon name="el:Search" />)
    // el: 前缀解析为 Element 图标，渲染图标根元素
    expect(wrapper.find('.easy-icon').exists()).toBe(true)
  })

  test('svg: 前缀渲染 SVG 模式', () => {
    const wrapper = mount(() => <Icon name="svg:dashboard" />)
    // 若存在对应 SVG 文件则渲染内容
    expect(wrapper.find('.easy-icon__svg').exists()).toBe(true)
  })

  test('无前缀渲染图片模式', () => {
    const wrapper = mount(() => <Icon name="https://example.com/icon.png" />)
    const img = wrapper.find('.easy-icon__img')
    expect(img.exists()).toBe(true)
    expect((img.element as HTMLImageElement).src).toContain('https://example.com/icon.png')
  })

  test('size 应用到图片模式样式', () => {
    const wrapper = mount(() => <Icon name="https://example.com/icon.png" size={24} />)
    const img = wrapper.find('.easy-icon__img')
    expect((img.element as HTMLElement).style.width).toBe('24px')
    expect((img.element as HTMLElement).style.height).toBe('24px')
  })

  test('iconClass 合并到根类名', () => {
    const wrapper = mount(() => <Icon name="el:Search" iconClass="my-icon" />)
    expect(wrapper.find('.easy-icon').classes()).toContain('my-icon')
  })

  test('clickable 添加可点击类名', () => {
    const wrapper = mount(() => <Icon name="el:Search" clickable />)
    expect(wrapper.find('.easy-icon').classes()).toContain('easy-icon--clickable')
  })

  test('clickable 点击触发 click 事件', async () => {
    const onClick = vi.fn()
    const wrapper = mount(() => <Icon name="el:Search" clickable onClick={onClick} />)
    await wrapper.find('.easy-icon').trigger('click')
    expect(onClick).toHaveBeenCalled()
  })

  test('非 clickable 点击不触发 click 事件', async () => {
    const onClick = vi.fn()
    const wrapper = mount(() => <Icon name="el:Search" onClick={onClick} />)
    await wrapper.find('.easy-icon').trigger('click')
    expect(onClick).not.toHaveBeenCalled()
  })

  test('color 应用到根样式', () => {
    const wrapper = mount(() => <Icon name="el:Search" color="#ff0000" />)
    const el = wrapper.find('.easy-icon').element as HTMLElement
    expect(el.style.color).toBe('rgb(255, 0, 0)')
  })
})
