import { mount } from '@vue/test-utils'
import TimelineItem from '../src/timeline-item.vue'
import Timeline from '../src/timeline.vue'

function renderTimeline(props: Record<string, any> = {}, itemProps: Array<Record<string, any>> = [{}]) {
  return mount(() => (
    <Timeline {...props}>
      {itemProps.map((p, i) => (
        <TimelineItem key={i} {...p}>
          {`节点${i + 1}`}
        </TimelineItem>
      ))}
    </Timeline>
  ))
}

describe('Timeline 时间线组件', () => {
  test('渲染基础时间线容器', () => {
    const wrapper = renderTimeline()
    expect(wrapper.find('.easy-timeline').exists()).toBe(true)
    expect(wrapper.find('.easy-timeline--vertical').exists()).toBe(true)
  })

  test('direction 应用到类名', () => {
    const wrapper = renderTimeline({ direction: 'horizontal' })
    expect(wrapper.find('.easy-timeline--horizontal').exists()).toBe(true)
  })

  test('渲染时间线项内容', () => {
    const wrapper = renderTimeline({}, [{}, {}, {}])
    expect(wrapper.findAll('.easy-timeline-item').length).toBe(3)
  })

  test('timeline-item 渲染状态类名', () => {
    const wrapper = renderTimeline({}, [{ status: 'finish' }, { status: 'process' }])
    expect(wrapper.find('.easy-timeline-item--finish').exists()).toBe(true)
    expect(wrapper.find('.easy-timeline-item--process').exists()).toBe(true)
  })

  test('timeline-item 渲染节点', () => {
    const wrapper = renderTimeline()
    expect(wrapper.find('.easy-timeline-item__node').exists()).toBe(true)
  })

  test('timeline-item 渲染内容插槽', () => {
    const wrapper = renderTimeline({}, [{ status: 'wait' }])
    expect(wrapper.find('.easy-timeline-item__body').text()).toContain('节点1')
  })

  test('timeline-item 渲染时间戳', () => {
    const wrapper = mount(() => (
      <Timeline>
        <TimelineItem timestamp="2024-01-01">内容</TimelineItem>
      </Timeline>
    ))
    expect(wrapper.find('.easy-timeline-item__timestamp').text()).toBe('2024-01-01')
  })

  test('无时间戳时不渲染时间戳区域', () => {
    const wrapper = mount(() => (
      <Timeline>
        <TimelineItem>内容</TimelineItem>
      </Timeline>
    ))
    expect(wrapper.find('.easy-timeline-item__timestamp').exists()).toBe(false)
  })

  test('finish 状态渲染节点图标区域', () => {
    const wrapper = mount(() => (
      <Timeline>
        <TimelineItem status="finish">内容</TimelineItem>
      </Timeline>
    ))
    // 状态为 finish 时节点类名正确，且节点下有图标内容
    expect(wrapper.find('.easy-timeline-item__node--finish').exists()).toBe(true)
    expect(wrapper.find('.easy-timeline-item__node').element.childNodes.length).toBeGreaterThan(0)
  })
})
