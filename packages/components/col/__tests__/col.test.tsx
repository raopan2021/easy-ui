import { mount } from '@vue/test-utils'
import Col from '../src/col.vue'

describe('Col 栅格列组件', () => {
  it('渲染默认 span=24 类名', () => {
    const wrapper = mount(() => <Col>列</Col>)
    expect(wrapper.find('.easy-col').exists()).toBe(true)
    expect(wrapper.classes()).toContain('easy-col--24')
  })

  it('span 应用到类名', () => {
    const wrapper = mount(() => <Col span={12}>列</Col>)
    expect(wrapper.classes()).toContain('easy-col--12')
  })

  it('offset 应用到类名', () => {
    const wrapper = mount(() => <Col span={8} offset={4}>列</Col>)
    expect(wrapper.classes()).toContain('easy-col--offset-4')
  })

  it('push 应用到类名', () => {
    const wrapper = mount(() => <Col span={8} push={2}>列</Col>)
    expect(wrapper.classes()).toContain('easy-col--push-2')
  })

  it('pull 应用到类名', () => {
    const wrapper = mount(() => <Col span={8} pull={3}>列</Col>)
    expect(wrapper.classes()).toContain('easy-col--pull-3')
  })

  it('响应式数字断点应用到类名', () => {
    const wrapper = mount(() => <Col span={24} md={12} lg={8}>列</Col>)
    expect(wrapper.classes()).toContain('easy-col--md-12')
    expect(wrapper.classes()).toContain('easy-col--lg-8')
  })

  it('响应式对象断点应用到类名', () => {
    const wrapper = mount(() => (
      <Col span={24} md={{ span: 12, offset: 2 }}>列</Col>
    ))
    expect(wrapper.classes()).toContain('easy-col--md-12')
    expect(wrapper.classes()).toContain('easy-col--md-offset-2')
  })

  it('渲染默认插槽内容', () => {
    const wrapper = mount(() => <Col span={12}><div class="inner">内容</div></Col>)
    expect(wrapper.find('.inner').text()).toBe('内容')
  })
})
