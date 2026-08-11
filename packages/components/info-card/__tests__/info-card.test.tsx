import { mount } from '@vue/test-utils'
import InfoCard from '../src/info-card.vue'

describe('InfoCard 信息卡片组件', () => {
  it('渲染基础卡片与标题', () => {
    const wrapper = mount(() => <InfoCard title="服务状态" />)
    expect(wrapper.find('.easy-info-card').exists()).toBe(true)
    expect(wrapper.find('.easy-info-card__title').text()).toBe('服务状态')
  })

  it('字符串描述渲染为一项', () => {
    const wrapper = mount(() => <InfoCard title="卡片" description="运行正常" />)
    const items = wrapper.findAll('.easy-info-card__desc-item')
    expect(items.length).toBe(1)
    expect(items[0].find('.easy-info-card__desc-text').text()).toBe('运行正常')
  })

  it('字符串数组描述逐项渲染', () => {
    const wrapper = mount(() => <InfoCard title="卡片" description={['项1', '项2', '项3']} />)
    expect(wrapper.findAll('.easy-info-card__desc-item').length).toBe(3)
  })

  it('对象数组描述含图标', () => {
    const wrapper = mount(() => (
      <InfoCard title="卡片" description={[{ text: '状态', icon: 'el:CircleCheck' }]} />
    ))
    const item = wrapper.find('.easy-info-card__desc-item')
    expect(item.find('.easy-info-card__desc-text').text()).toBe('状态')
    expect(item.find('.easy-info-card__desc-icon').exists()).toBe(true)
  })

  it('无 description 时不渲染描述项', () => {
    const wrapper = mount(() => <InfoCard title="卡片" />)
    expect(wrapper.findAll('.easy-info-card__desc-item').length).toBe(0)
  })

  it('status 渲染状态标签', () => {
    const wrapper = mount(() => <InfoCard title="卡片" status="已上线" />)
    expect(wrapper.find('.easy-info-card__status').text()).toBe('已上线')
  })

  it('statusType 应用到状态类名', () => {
    const wrapper = mount(() => <InfoCard title="卡片" status="成功" statusType="success" />)
    expect(wrapper.find('.easy-info-card__status').classes()).toContain('easy-info-card__status--success')
  })

  it('无 status 时不渲染状态标签', () => {
    const wrapper = mount(() => <InfoCard title="卡片" />)
    expect(wrapper.find('.easy-info-card__status').exists()).toBe(false)
  })

  it('image 渲染左侧图片', () => {
    const wrapper = mount(() => <InfoCard title="卡片" image="/logo.png" />)
    const img = wrapper.find('.easy-info-card__image img')
    expect(img.exists()).toBe(true)
    expect((img.element as HTMLImageElement).src).toContain('/logo.png')
  })

  it('clickable 时点击触发 click 事件', async () => {
    const onClick = vi.fn()
    const wrapper = mount(() => <InfoCard title="卡片" clickable onClick={onClick} />)
    expect(wrapper.find('.easy-info-card').classes()).toContain('is-clickable')
    await wrapper.find('.easy-info-card').trigger('click')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('非 clickable 时点击不触发 click 事件', async () => {
    const onClick = vi.fn()
    const wrapper = mount(() => <InfoCard title="卡片" onClick={onClick} />)
    await wrapper.find('.easy-info-card').trigger('click')
    expect(onClick).not.toHaveBeenCalled()
  })

  it('bordered 与自定义背景色生效', () => {
    const wrapper = mount(() => <InfoCard title="卡片" bordered backgroundColor="#f0f0f0" />)
    expect(wrapper.find('.easy-info-card').classes()).toContain('is-bordered')
    const el = wrapper.find('.easy-info-card').element as HTMLElement
    expect(el.style.backgroundColor).toBe('rgb(240, 240, 240)')
  })

  it('action 插槽渲染右侧操作区', () => {
    const wrapper = mount(() => (
      <InfoCard title="卡片">
        {{
          action: () => <button class="action-btn">操作</button>,
        }}
      </InfoCard>
    ))
    expect(wrapper.find('.easy-info-card__action .action-btn').exists()).toBe(true)
  })
})
