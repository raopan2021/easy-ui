import { mount } from '@vue/test-utils'
import Divider from '../src/divider.vue'

describe('Divider 分隔线组件', () => {
  test('默认渲染水平分隔线', () => {
    const wrapper = mount(() => <Divider />)
    expect(wrapper.find('.easy-divider').exists()).toBe(true)
    expect(wrapper.classes()).not.toContain('easy-divider--vertical')
  })

  test('direction=vertical 渲染垂直分隔线', () => {
    const wrapper = mount(() => <Divider direction="vertical" />)
    expect(wrapper.find('.easy-divider').exists()).toBe(true)
    expect(wrapper.classes()).toContain('easy-divider--vertical')
  })

  test('borderStyle 应用到边框样式', () => {
    const wrapper = mount(() => <Divider borderStyle="dashed" />)
    const divider = wrapper.find('.easy-divider')
    expect((divider.element as HTMLElement).style.borderTopStyle).toBe('dashed')
  })

  test('contentPosition 应用到文字位置类名', () => {
    const wrapper = mount(() => (
      <Divider contentPosition="left">左侧文字</Divider>
    ))
    const text = wrapper.find('.easy-divider__text')
    expect(text.exists()).toBe(true)
    expect(text.classes()).toContain('easy-divider__text--left')
  })

  test('默认内容位置为 center', () => {
    const wrapper = mount(() => <Divider>中间文字</Divider>)
    const text = wrapper.find('.easy-divider__text')
    expect(text.classes()).toContain('easy-divider__text--center')
  })

  test('垂直分隔线不渲染文字', () => {
    const wrapper = mount(() => <Divider direction="vertical">文字</Divider>)
    expect(wrapper.find('.easy-divider__text').exists()).toBe(false)
  })

  test('水平分隔线设置 width 样式', () => {
    const wrapper = mount(() => <Divider width="50%" />)
    const divider = wrapper.find('.easy-divider')
    expect((divider.element as HTMLElement).style.width).toBe('50%')
  })

  test('垂直分隔线设置 height 样式', () => {
    const wrapper = mount(() => <Divider direction="vertical" height="20px" />)
    const divider = wrapper.find('.easy-divider')
    expect((divider.element as HTMLElement).style.height).toBe('20px')
  })
})
