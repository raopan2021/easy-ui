import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Gantt from '../src/gantt.vue'

const tasks = [
  { id: 1, name: '任务一', start: '2024-01-01', duration: 5 },
  { id: 2, name: '任务二', start: '2024-01-03', duration: 10 },
]

describe('Gantt 甘特图组件', () => {
  it('渲染甘特图容器', async () => {
    const wrapper = mount(() => <Gantt data={tasks} />)
    await nextTick()
    expect(wrapper.find('.easy-gantt').exists()).toBe(true)
  })

  it('渲染任务列表标题', async () => {
    const wrapper = mount(() => <Gantt data={tasks} title="项目排期" />)
    await nextTick()
    expect(wrapper.find('.easy-gantt').text()).toContain('项目排期')
  })

  it('渲染任务名称', async () => {
    const wrapper = mount(() => <Gantt data={tasks} />)
    await nextTick()
    const text = wrapper.find('.easy-gantt').text()
    expect(text).toContain('任务一')
    expect(text).toContain('任务二')
  })

  it('渲染视图切换按钮', async () => {
    const wrapper = mount(() => <Gantt data={tasks} showViewSwitch />)
    await nextTick()
    expect(wrapper.find('.easy-gantt__view-switch').exists()).toBe(true)
  })

  it('showViewSwitch=false 不渲染视图切换', async () => {
    const wrapper = mount(() => <Gantt data={tasks} showViewSwitch={false} />)
    await nextTick()
    expect(wrapper.find('.easy-gantt__view-switch').exists()).toBe(false)
  })

  it('zoomable 渲染缩放控件', async () => {
    const wrapper = mount(() => <Gantt data={tasks} zoomable />)
    await nextTick()
    expect(wrapper.find('.easy-gantt__zoom').exists()).toBe(true)
  })

  it('zoomable=false 不渲染缩放控件', async () => {
    const wrapper = mount(() => <Gantt data={tasks} zoomable={false} />)
    await nextTick()
    expect(wrapper.find('.easy-gantt__zoom').exists()).toBe(false)
  })

  it('width 与 height 属性正常传入', async () => {
    const wrapper = mount(() => <Gantt data={tasks} width="900" height="400" />)
    await nextTick()
    expect(wrapper.find('.easy-gantt').exists()).toBe(true)
  })

  it('空数据时正常渲染', async () => {
    const wrapper = mount(() => <Gantt data={[]} />)
    await nextTick()
    expect(wrapper.find('.easy-gantt').exists()).toBe(true)
  })
})
