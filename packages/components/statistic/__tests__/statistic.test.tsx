import { mount } from '@vue/test-utils'
import Statistic from '../src/statistic.vue'

describe('Statistic 统计数值组件', () => {
  test('渲染基础数值', () => {
    const wrapper = mount(() => <Statistic value={100} />)
    expect(wrapper.find('.easy-statistic').exists()).toBe(true)
    expect(wrapper.find('.easy-statistic-number').text()).toBe('100')
  })

  test('千分位格式化', () => {
    const wrapper = mount(() => <Statistic value={1234567} />)
    expect(wrapper.find('.easy-statistic-number').text()).toBe('1,234,567')
  })

  test('precision 保留小数', () => {
    const wrapper = mount(() => <Statistic value={3.14159} precision={2} />)
    expect(wrapper.find('.easy-statistic-number').text()).toBe('3.14')
  })

  test('字符串值直接显示', () => {
    const wrapper = mount(() => <Statistic value="99.99%" />)
    expect(wrapper.find('.easy-statistic-number').text()).toBe('99.99%')
  })

  test('title 渲染标题区域', () => {
    const wrapper = mount(() => <Statistic value={1} title="订单数" />)
    expect(wrapper.find('.easy-statistic-header').exists()).toBe(true)
    expect(wrapper.find('.easy-statistic-title').text()).toBe('订单数')
  })

  test('prefix 与 suffix 渲染前后缀', () => {
    const wrapper = mount(() => <Statistic value={50} prefix="$" suffix="万" />)
    expect(wrapper.find('.easy-statistic-prefix').text()).toBe('$')
    expect(wrapper.find('.easy-statistic-suffix').text()).toBe('万')
  })

  test('trend 渲染趋势区域', () => {
    const wrapper = mount(() => <Statistic value={10} trend="up" trendLabel="较上周" />)
    expect(wrapper.find('.easy-statistic-trend').exists()).toBe(true)
    expect(wrapper.find('.easy-statistic-trend-text').text()).toBe('较上周')
    expect(wrapper.find('.easy-statistic-trend-icon').classes()).toContain('easy-statistic-trend--up')
  })

  test('extra 渲染说明区域', () => {
    const wrapper = mount(() => <Statistic value={1} extra="同比增长 10%" />)
    expect(wrapper.find('.easy-statistic-extra').exists()).toBe(true)
    expect(wrapper.find('.easy-statistic-extra').text()).toBe('同比增长 10%')
  })

  test('size 与 variant 应用到类名', () => {
    const wrapper = mount(() => <Statistic value={1} size="lg" variant="primary" />)
    expect(wrapper.classes()).toContain('easy-statistic--lg')
    expect(wrapper.classes()).toContain('easy-statistic--primary')
  })

  test('bordered 与 hoverable 应用类名', () => {
    const wrapper = mount(() => <Statistic value={1} bordered hoverable />)
    expect(wrapper.classes()).toContain('easy-statistic--bordered')
    expect(wrapper.classes()).toContain('easy-statistic--hoverable')
  })

  test('无 title/icon 时不渲染标题区域', () => {
    const wrapper = mount(() => <Statistic value={1} />)
    expect(wrapper.find('.easy-statistic-header').exists()).toBe(false)
  })
})
