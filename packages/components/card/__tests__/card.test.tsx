import { mount } from '@vue/test-utils'
import Card from '../src/card.vue'

describe('Card 卡片组件', () => {
  it('渲染基础卡片容器', () => {
    const wrapper = mount(() => <Card>内容</Card>)
    expect(wrapper.find('.easy-card').exists()).toBe(true)
    expect(wrapper.find('.easy-card__body').text()).toBe('内容')
  })

  it('有 title 时渲染标题栏', () => {
    const wrapper = mount(() => <Card title="标题">内容</Card>)
    expect(wrapper.find('.easy-card__header').exists()).toBe(true)
    expect(wrapper.find('.easy-card__title').text()).toContain('标题')
  })

  it('无 title 且无插槽时不渲染标题栏', () => {
    const wrapper = mount(() => <Card>内容</Card>)
    expect(wrapper.find('.easy-card__header').exists()).toBe(false)
  })

  it('shadow 应用到类名', () => {
    const wrapper = mount(() => <Card shadow="always">内容</Card>)
    expect(wrapper.classes()).toContain('easy-card--shadow-always')
  })

  it('bordered 添加边框类名', () => {
    const wrapper = mount(() => <Card bordered>内容</Card>)
    expect(wrapper.classes()).toContain('is-bordered')
  })

  it('rounded 添加圆角类名', () => {
    const wrapper = mount(() => <Card rounded>内容</Card>)
    expect(wrapper.classes()).toContain('is-rounded')
  })

  it('hoverable 添加悬停类名', () => {
    const wrapper = mount(() => <Card hoverable>内容</Card>)
    expect(wrapper.classes()).toContain('is-hoverable')
  })

  it('disabled 应用透明度样式', () => {
    const wrapper = mount(() => <Card disabled>内容</Card>)
    expect(wrapper.classes()).toContain('is-disabled')
    const el = wrapper.find('.easy-card').element as HTMLElement
    expect(el.style.opacity).toBe('0.5')
  })

  it('extra 插槽渲染在标题栏右侧', () => {
    const wrapper = mount(() => (
      <Card title="标题">
        {{
          extra: () => <span class="extra-node">更多</span>,
          default: () => '内容',
        }}
      </Card>
    ))
    expect(wrapper.find('.easy-card__extra .extra-node').exists()).toBe(true)
  })

  it('footer 插槽渲染底部区域', () => {
    const wrapper = mount(() => (
      <Card>
        {{
          default: () => '内容',
          footer: () => <span class="footer-node">底部</span>,
        }}
      </Card>
    ))
    expect(wrapper.find('.easy-card__footer .footer-node').exists()).toBe(true)
  })

  it('icon 属性渲染在标题内', () => {
    const wrapper = mount(() => <Card title="标题" icon="star">内容</Card>)
    expect(wrapper.find('.easy-card__icon').text()).toBe('star')
  })
})
