import { mount } from '@vue/test-utils'
import Loading from '../src/loading.vue'

describe('Loading 加载组件', () => {
  it('modelValue 为 true 时渲染加载内容', () => {
    const wrapper = mount(() => <Loading modelValue />)
    expect(wrapper.find('.easy-loading-wrapper').exists()).toBe(true)
    expect(wrapper.find('.easy-loading-wrapper').classes()).toContain('is-visible')
    expect(wrapper.find('.easy-loading-spinner').exists()).toBe(true)
  })

  it('modelValue 为 false 时不渲染加载内容', () => {
    const wrapper = mount(() => <Loading modelValue={false} />)
    expect(wrapper.find('.easy-loading-wrapper').exists()).toBe(false)
  })

  it('text 渲染加载文本', () => {
    const wrapper = mount(() => <Loading modelValue text="加载中" />)
    expect(wrapper.find('.easy-loading-text').text()).toBe('加载中')
  })

  it('无 text 时不渲染加载文本', () => {
    const wrapper = mount(() => <Loading modelValue />)
    expect(wrapper.find('.easy-loading-text').exists()).toBe(false)
  })

  it('type=spinner 渲染旋转样式', () => {
    const wrapper = mount(() => <Loading modelValue type="spinner" />)
    expect(wrapper.find('.easy-loading-wrapper').classes()).toContain('easy-loading--spinner')
    expect(wrapper.findAll('.spinner-dot').length).toBe(8)
  })

  it('type=pulse 渲染脉冲样式', () => {
    const wrapper = mount(() => <Loading modelValue type="pulse" />)
    expect(wrapper.find('.pulse-circle').exists()).toBe(true)
  })

  it('type=ring 渲染环形进度', () => {
    const wrapper = mount(() => <Loading modelValue type="ring" progress={50} />)
    expect(wrapper.find('.ring-svg').exists()).toBe(true)
    expect(wrapper.find('.ring-progress').exists()).toBe(true)
  })

  it('type=wave1 渲染波浪竖条', () => {
    const wrapper = mount(() => <Loading modelValue type="wave1" />)
    expect(wrapper.findAll('.wave1-bar').length).toBe(5)
  })

  it('mask 控制遮罩层显隐', () => {
    const wrapperMask = mount(() => <Loading modelValue mask />)
    expect(wrapperMask.find('.easy-loading-mask').exists()).toBe(true)
    const wrapperNoMask = mount(() => <Loading modelValue mask={false} />)
    expect(wrapperNoMask.find('.easy-loading-mask').exists()).toBe(false)
  })

  it('size 应用到类名', () => {
    const wrapper = mount(() => <Loading modelValue size="large" />)
    expect(wrapper.find('.easy-loading-wrapper').classes()).toContain('easy-loading--large')
  })

  it('fullscreen 应用到类名与样式', () => {
    const wrapper = mount(() => <Loading modelValue fullscreen />)
    const wrapperEl = wrapper.find('.easy-loading-wrapper')
    expect(wrapperEl.classes()).toContain('is-fullscreen')
    expect((wrapperEl.element as HTMLElement).style.zIndex).toBe('9999')
  })

  it('color 应用到进度环描边颜色', () => {
    const wrapper = mount(() => <Loading modelValue type="ring" color="#ff0000" />)
    const progress = wrapper.find('.ring-progress')
    expect((progress.element as SVGElement).getAttribute('stroke')).toBe('#ff0000')
  })

  it('expose show/hide/toggle 方法', async () => {
    const wrapper = mount(Loading, { props: { modelValue: false } })
    const vm = wrapper.vm as unknown as { show: () => void, hide: () => void, toggle: () => void }
    expect(typeof vm.show).toBe('function')
    expect(typeof vm.hide).toBe('function')
    expect(typeof vm.toggle).toBe('function')
  })
})
