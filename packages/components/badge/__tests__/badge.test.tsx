import { mount } from '@vue/test-utils'
import Badge from '../src/badge.vue'

describe('Badge 角标组件', () => {
  test('渲染基础角标', () => {
    const wrapper = mount(() => <Badge value={5}>消息</Badge>)
    expect(wrapper.find('.easy-badge').exists()).toBe(true)
    expect(wrapper.find('.badge-mark').exists()).toBe(true)
    expect(wrapper.find('.badge-text').text()).toBe('5')
  })

  test('value 为 0 且未开启 showZero 时不显示', () => {
    const wrapper = mount(() => <Badge value={0}>消息</Badge>)
    expect(wrapper.find('.badge-mark').exists()).toBe(false)
  })

  test('value 为 0 且开启 showZero 时显示', () => {
    const wrapper = mount(() => <Badge value={0} showZero>消息</Badge>)
    expect(wrapper.find('.badge-mark').exists()).toBe(true)
    expect(wrapper.find('.badge-text').text()).toBe('0')
  })

  test('value 为 null/undefined/空字符串时不显示', () => {
    const wrapper = mount(() => <Badge value={null as any}>消息</Badge>)
    expect(wrapper.find('.badge-mark').exists()).toBe(false)
  })

  test('超过 max 时显示 max+ 溢出文本', () => {
    const wrapper = mount(() => <Badge value={100} max={99}>消息</Badge>)
    expect(wrapper.find('.badge-text').text()).toBe('99+')
  })

  test('overflowText 自定义溢出文本', () => {
    const wrapper = mount(() => <Badge value={100} max={99} overflowText="+" />)
    expect(wrapper.find('.badge-text').text()).toBe('99+')
  })

  test('type 对应颜色样式', () => {
    const wrapper = mount(() => <Badge value={1} type="success">消息</Badge>)
    const text = wrapper.find('.badge-text')
    expect((text.element as HTMLElement).style.backgroundColor).toBe('rgb(103, 194, 58)')
  })

  test('color 自定义颜色优先级高于 type', () => {
    const wrapper = mount(() => <Badge value={1} color="#ff0000">消息</Badge>)
    const text = wrapper.find('.badge-text')
    expect((text.element as HTMLElement).style.backgroundColor).toBe('rgb(255, 0, 0)')
  })

  test('position 应用到角标位置类名', () => {
    const wrapper = mount(() => <Badge value={1} position="bottom-left">消息</Badge>)
    expect(wrapper.find('.badge-mark').classes()).toContain('bottom-left')
  })

  test('circle 添加圆形类名', () => {
    const wrapper = mount(() => <Badge value={1} circle>消息</Badge>)
    expect(wrapper.find('.badge-mark').classes()).toContain('circle')
  })

  test('默认插槽内容渲染', () => {
    const wrapper = mount(() => <Badge value={1}>通知</Badge>)
    expect(wrapper.text()).toContain('通知')
  })
})
