import { mount } from '@vue/test-utils'
import Col from '../../col/src/col.vue'
import Row from '../src/row.vue'

describe('Row 栅格行组件', () => {
  it('渲染基础行容器', () => {
    const wrapper = mount(() => <Row>内容</Row>)
    expect(wrapper.find('.easy-row').exists()).toBe(true)
  })

  it('justify 应用到类名', () => {
    const wrapper = mount(() => <Row justify="center">内容</Row>)
    expect(wrapper.classes()).toContain('is-justify-center')
    expect(wrapper.classes()).toContain('is-flex')
  })

  it('align 应用到类名', () => {
    const wrapper = mount(() => <Row align="middle">内容</Row>)
    expect(wrapper.classes()).toContain('is-align-middle')
  })

  it('gutter 应用到行样式', () => {
    const wrapper = mount(() => <Row gutter={20}>内容</Row>)
    const el = wrapper.find('.easy-row').element as HTMLElement
    expect(el.style.marginLeft).toBe('-10px')
    expect(el.style.marginRight).toBe('-10px')
  })

  it('响应式 gutter 取最大值', () => {
    const wrapper = mount(() => (
      <Row gutter={{ xs: 8, sm: 16, lg: 24 }}>内容</Row>
    ))
    const el = wrapper.find('.easy-row').element as HTMLElement
    expect(el.style.marginLeft).toBe('-12px')
  })

  it('gutter 为 0 时不应用负 margin', () => {
    const wrapper = mount(() => <Row gutter={0}>内容</Row>)
    const el = wrapper.find('.easy-row').element as HTMLElement
    expect(el.style.marginLeft).toBe('')
  })

  it('向子 Col 注入 gutter 间距', () => {
    const wrapper = mount(() => (
      <Row gutter={20}>
        <Col span={12}>列1</Col>
        <Col span={12}>列2</Col>
      </Row>
    ))
    const cols = wrapper.findAll('.easy-col')
    expect(cols.length).toBe(2)
    expect((cols[0].element as HTMLElement).style.paddingLeft).toBe('10px')
    expect((cols[0].element as HTMLElement).style.paddingRight).toBe('10px')
  })

  it('tag 应用到类名', () => {
    const wrapper = mount(() => <Row tag="ul">内容</Row>)
    expect(wrapper.classes()).toContain('easy-row--ul')
  })
})
