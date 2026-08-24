import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
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

  it('fill 添加占满剩余空间的类名', () => {
    const wrapper = mount(() => <Card fill>内容</Card>)
    expect(wrapper.classes()).toContain('is-fill')
  })

  it('height 属性应用到卡片高度', () => {
    const wrapper = mount(() => <Card height={300}>内容</Card>)
    const el = wrapper.find('.easy-card').element as HTMLElement
    expect(el.style.height).toBe('300px')
  })

  it('resizable 渲染拖拽手柄', () => {
    const wrapper = mount(() => <Card resizable>内容</Card>)
    expect(wrapper.classes()).toContain('is-resizable')
    expect(wrapper.find('.easy-card__resizer').exists()).toBe(true)
  })

  it('拖拽调整高度并触发 resize / update:height 事件', async () => {
    const onResize = vi.fn()
    const onUpdateHeight = vi.fn()
    const wrapper = mount(() => <Card resizable minHeight={100} onResize={onResize} onUpdate:height={onUpdateHeight}>内容</Card>)
    const resizer = wrapper.find('.easy-card__resizer')

    await resizer.trigger('mousedown', { clientY: 0 })
    document.dispatchEvent(new MouseEvent('mousemove', { clientY: 80 }))
    await nextTick()
    const el = wrapper.find('.easy-card').element as HTMLElement
    expect(parseInt(el.style.height)).toBe(100) // minHeight 兜底
    expect(onResize).toHaveBeenCalledWith(100)
    expect(onUpdateHeight).toHaveBeenCalledWith(100)

    document.dispatchEvent(new MouseEvent('mousemove', { clientY: 180 }))
    await nextTick()
    expect(parseInt(el.style.height)).toBe(180)

    document.dispatchEvent(new MouseEvent('mouseup'))
    // 结束后拖拽不再生效
    document.dispatchEvent(new MouseEvent('mousemove', { clientY: 260 }))
    expect(parseInt(el.style.height)).toBe(180)
  })

  it('外部 v-model:height 优先于内部拖拽值', async () => {
    const wrapper = mount(() => <Card resizable height={300} minHeight={100}>内容</Card>)
    const el = wrapper.find('.easy-card').element as HTMLElement
    expect(el.style.height).toBe('300px')

    const resizer = wrapper.find('.easy-card__resizer')
    await resizer.trigger('mousedown', { clientY: 0 })
    document.dispatchEvent(new MouseEvent('mousemove', { clientY: 150 }))
    // 受控高度不被内部拖拽覆盖
    expect(el.style.height).toBe('300px')
    document.dispatchEvent(new MouseEvent('mouseup'))
  })

  it('disabled 时拖拽不生效', async () => {
    const onResize = vi.fn()
    const wrapper = mount(() => <Card resizable disabled onResize={onResize}>内容</Card>)
    const resizer = wrapper.find('.easy-card__resizer')
    await resizer.trigger('mousedown', { clientY: 0 })
    document.dispatchEvent(new MouseEvent('mousemove', { clientY: 100 }))
    expect(onResize).not.toHaveBeenCalled()
    document.dispatchEvent(new MouseEvent('mouseup'))
  })
})
