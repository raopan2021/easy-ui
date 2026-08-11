import { mount } from '@vue/test-utils'
import Progress from '../src/progress.vue'

describe('Progress 进度条组件', () => {
  it('渲染默认线性进度条', () => {
    const wrapper = mount(() => <Progress percentage={50} />)
    expect(wrapper.find('.easy-progress').exists()).toBe(true)
    expect(wrapper.classes()).toContain('easy-progress--line')
  })

  it('percentage 应用到进度条宽度', () => {
    const wrapper = mount(() => <Progress percentage={50} />)
    const bar = wrapper.find('.easy-progress__bar')
    expect((bar.element as HTMLElement).style.width).toBe('50%')
  })

  it('percentage 超出 100 时限制为 100', () => {
    const wrapper = mount(() => <Progress percentage={150} />)
    const bar = wrapper.find('.easy-progress__bar')
    expect((bar.element as HTMLElement).style.width).toBe('100%')
  })

  it('percentage 为负时限制为 0', () => {
    const wrapper = mount(() => <Progress percentage={-10} />)
    const bar = wrapper.find('.easy-progress__bar')
    expect((bar.element as HTMLElement).style.width).toBe('0%')
  })

  it('showInfo 显示百分比文本', () => {
    const wrapper = mount(() => <Progress percentage={50} />)
    expect(wrapper.find('.easy-progress__percentage').text()).toBe('50%')
  })

  it('text 自定义进度文本', () => {
    const wrapper = mount(() => <Progress percentage={50} text="上传中" />)
    expect(wrapper.find('.easy-progress__percentage').text()).toBe('上传中')
  })

  it('status 应用到类名', () => {
    const wrapper = mount(() => <Progress percentage={100} status="success" />)
    expect(wrapper.classes()).toContain('easy-progress--status-success')
  })

  it('type=circle 渲染圆形进度条', () => {
    const wrapper = mount(() => <Progress type="circle" percentage={50} />)
    expect(wrapper.classes()).toContain('easy-progress--circle')
    expect(wrapper.find('.easy-progress__svg').exists()).toBe(true)
    expect(wrapper.findAll('circle.easy-progress__bar').length).toBe(1)
  })

  it('type=dashboard 渲染仪表盘进度条', () => {
    const wrapper = mount(() => <Progress type="dashboard" percentage={50} />)
    expect(wrapper.classes()).toContain('easy-progress--dashboard')
    expect(wrapper.find('.easy-progress__svg').exists()).toBe(true)
  })

  it('strokeWidth 应用到线性进度条高度', () => {
    const wrapper = mount(() => <Progress percentage={50} strokeWidth={8} />)
    const bar = wrapper.find('.easy-progress__bar')
    expect((bar.element as HTMLElement).style.height).toBe('8px')
  })

  it('indeterminate 渲染动画元素', () => {
    const wrapper = mount(() => <Progress percentage={50} indeterminate />)
    expect(wrapper.find('.easy-progress__bar__animation').exists()).toBe(true)
  })
})
