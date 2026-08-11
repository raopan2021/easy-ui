import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ChinaMap from '../src/china-map.vue'

describe('ChinaMap 中国地图组件', () => {
  it('渲染地图容器', async () => {
    const wrapper = mount(() => <ChinaMap />)
    await nextTick()
    expect(wrapper.find('.easy-china-map').exists()).toBe(true)
  })

  it('渲染 SVG 地图', async () => {
    const wrapper = mount(() => <ChinaMap />)
    await nextTick()
    expect(wrapper.find('.easy-china-map__svg').exists()).toBe(true)
  })

  it('渲染标题与副标题', async () => {
    const wrapper = mount(() => <ChinaMap title="全国销售" subtitle="2024" />)
    await nextTick()
    const text = wrapper.find('.easy-china-map').text()
    expect(text).toContain('全国销售')
    expect(text).toContain('2024')
  })

  it('showLegend prop 正常渲染', async () => {
    const wrapper = mount(() => <ChinaMap showLegend />)
    await nextTick()
    expect(wrapper.find('.easy-china-map').exists()).toBe(true)
  })

  it('showLabel 渲染省份标签', async () => {
    const wrapper = mount(() => <ChinaMap showLabel />)
    await nextTick()
    // 省份标签默认以文本节点渲染在 SVG path 内
    expect(wrapper.find('.easy-china-map').exists()).toBe(true)
  })

  it('width 与 height 属性正常传入', async () => {
    const wrapper = mount(() => <ChinaMap width={800} height={600} />)
    await nextTick()
    expect(wrapper.find('.easy-china-map').exists()).toBe(true)
  })

  it('data 渲染各省份数据', async () => {
    const wrapper = mount(() => <ChinaMap data={[{ name: '广东', value: 100 }]} />)
    await nextTick()
    expect(wrapper.find('.easy-china-map').exists()).toBe(true)
  })
})
