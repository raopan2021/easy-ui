import { mount } from '@vue/test-utils'
import Rate from '../src/rate.vue'

describe('Rate 评分组件', () => {
  it('渲染基础评分容器', () => {
    const wrapper = mount(() => <Rate modelValue={3} />)
    expect(wrapper.find('.easy-rate').exists()).toBe(true)
  })

  it('max 渲染对应数量的星星', () => {
    const wrapper = mount(() => <Rate modelValue={3} max={5} />)
    expect(wrapper.findAll('.easy-rate__item').length).toBe(5)
  })

  it('默认 max 为 5', () => {
    const wrapper = mount(() => <Rate modelValue={3} />)
    expect(wrapper.findAll('.easy-rate__item').length).toBe(5)
  })

  it('modelValue 对应星星高亮', () => {
    const wrapper = mount(() => <Rate modelValue={3} />)
    const items = wrapper.findAll('.easy-rate__item')
    expect(items[0].classes()).toContain('is-active')
    expect(items[2].classes()).toContain('is-active')
    expect(items[3].classes()).not.toContain('is-active')
  })

  it('点击星星触发 change 与 update', async () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()
    const wrapper = mount(() => <Rate modelValue={0} onChange={onChange} onUpdate:modelValue={onUpdate} />)
    const items = wrapper.findAll('.easy-rate__item')
    await items[2].trigger('click')
    expect(onChange).toHaveBeenCalledWith(3)
    expect(onUpdate).toHaveBeenCalledWith(3)
  })

  it('点击已选中星星取消评分', async () => {
    const onChange = vi.fn()
    const wrapper = mount(() => <Rate modelValue={3} onChange={onChange} />)
    const items = wrapper.findAll('.easy-rate__item')
    await items[2].trigger('click')
    expect(onChange).toHaveBeenCalledWith(0)
  })

  it('disabled 时点击不触发', async () => {
    const onChange = vi.fn()
    const wrapper = mount(() => <Rate modelValue={3} disabled onChange={onChange} />)
    expect(wrapper.find('.easy-rate').classes()).toContain('is-disabled')
    const items = wrapper.findAll('.easy-rate__item')
    await items[0].trigger('click')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('showText 显示数值文本', () => {
    const wrapper = mount(() => <Rate modelValue={4} showText />)
    expect(wrapper.find('.easy-rate__text').text()).toBe('4')
  })

  it('texts 数组映射对应文案', () => {
    const wrapper = mount(() => (
      <Rate modelValue={2} texts={['很差', '较差', '一般', '满意', '非常满意']} />
    ))
    expect(wrapper.find('.easy-rate__text').text()).toBe('较差')
  })

  it('allowHalf 开启半星', () => {
    const wrapper = mount(() => <Rate modelValue={2.5} allowHalf />)
    const items = wrapper.findAll('.easy-rate__item')
    expect(items[2].classes()).toContain('is-half-active')
  })

  it('size 应用到类名', () => {
    const wrapper = mount(() => <Rate modelValue={3} size="small" />)
    expect(wrapper.find('.easy-rate').classes()).toContain('easy-rate--small')
  })
})
