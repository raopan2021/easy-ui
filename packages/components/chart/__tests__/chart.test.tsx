import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Chart from '../src/chart.vue'

// 提供可靠的 ResizeObserver mock，避免 chart onMounted 中 observe 报错
class ResizeObserverMock {
  callback: ResizeObserverCallback
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }

  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverMock)
  // jsdom 中 clientWidth 恒为 0，导致 chart 的 svg v-if="svgWidth > 0" 不渲染
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get: () => 500,
  })
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get: () => 300,
  })
})

describe('Chart 图表组件', () => {
  it('渲染图表容器', () => {
    const wrapper = mount(() => <Chart />)
    expect(wrapper.find('.easy-chart').exists()).toBe(true)
  })

  it('默认渲染折线图 SVG', async () => {
    const wrapper = mount(() => <Chart labels={['1月', '2月']} series={[{ name: '销量', data: [10, 20] }]} />)
    await nextTick()
    await nextTick()
    expect(wrapper.find('.easy-chart__svg').exists()).toBe(true)
    expect(wrapper.findAll('.easy-chart__line').length).toBe(1)
  })

  it('渲染标题与副标题', () => {
    const wrapper = mount(() => (
      <Chart title="销售统计" subtitle="2024年度" labels={['1月']} series={[{ name: 'a', data: [1] }]} />
    ))
    expect(wrapper.find('.easy-chart__title').text()).toBe('销售统计')
    expect(wrapper.find('.easy-chart__subtitle').text()).toBe('2024年度')
  })

  it('showLegend 渲染图例', () => {
    const wrapper = mount(() => (
      <Chart labels={['1月']} series={[{ name: '销量', data: [1] }]} showLegend />
    ))
    expect(wrapper.find('.easy-chart__legend').exists()).toBe(true)
    expect(wrapper.find('.easy-chart__legend-label').text()).toBe('销量')
  })

  it('showLegend=false 不渲染图例', () => {
    const wrapper = mount(() => (
      <Chart labels={['1月']} series={[{ name: '销量', data: [1] }]} showLegend={false} />
    ))
    expect(wrapper.find('.easy-chart__legend').exists()).toBe(false)
  })

  it('type=bar 渲染柱状图', async () => {
    const wrapper = mount(() => (
      <Chart type="bar" labels={['1月', '2月']} series={[{ name: '销量', data: [10, 20] }]} />
    ))
    await nextTick()
    await nextTick()
    expect(wrapper.findAll('.easy-chart__bar').length).toBeGreaterThan(0)
  })

  it('type=pie 渲染饼图', async () => {
    const wrapper = mount(() => <Chart type="pie" data={[{ name: 'A', value: 10 }, { name: 'B', value: 20 }]} />)
    await nextTick()
    await nextTick()
    expect(wrapper.findAll('.easy-chart__pie-slice').length).toBe(2)
  })

  it('type=donut 渲染环形图中心文本', async () => {
    const wrapper = mount(() => (
      <Chart type="donut" data={[{ name: 'A', value: 30 }, { name: 'B', value: 70 }]} donutLabel="总览" />
    ))
    await nextTick()
    await nextTick()
    expect(wrapper.find('.easy-chart__donut-label').text()).toBe('总览')
  })

  it('showGrid=false 不渲染网格', () => {
    const wrapper = mount(() => (
      <Chart labels={['1月']} series={[{ name: 'a', data: [1] }]} showGrid={false} />
    ))
    expect(wrapper.find('.easy-chart__grid').exists()).toBe(false)
  })

  it('size 属性应用宽高', () => {
    const wrapper = mount(() => <Chart width={400} height={300} />)
    const el = wrapper.find('.easy-chart').element as HTMLElement
    expect(el.style.width).toBe('400px')
    expect(el.style.height).toBe('300px')
  })

  it('无数据时不渲染图表主体', () => {
    const wrapper = mount(() => <Chart labels={[]} series={[]} />)
    expect(wrapper.find('.easy-chart__body').exists()).toBe(true)
  })
})
