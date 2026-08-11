import { mount } from '@vue/test-utils'
import Descriptions from '../src/descriptions.vue'
import DescriptionsItem from '../src/item.vue'

function renderDescriptions(props: Record<string, any> = {}, items: Array<Record<string, any>> = [{}]) {
  return mount(() => (
    <Descriptions {...props}>
      {items.map((p, i) => (
        <DescriptionsItem key={i} {...p}>{`内容${i + 1}`}</DescriptionsItem>
      ))}
    </Descriptions>
  ))
}

describe('Descriptions 描述列表组件', () => {
  it('渲染基础描述列表容器', () => {
    const wrapper = renderDescriptions()
    expect(wrapper.find('.easy-descriptions').exists()).toBe(true)
  })

  it('title 渲染标题栏', () => {
    const wrapper = renderDescriptions({ title: '用户信息' })
    expect(wrapper.find('.easy-descriptions__title').text()).toBe('用户信息')
  })

  it('无 title 时不渲染标题栏', () => {
    const wrapper = renderDescriptions()
    expect(wrapper.find('.easy-descriptions__header').exists()).toBe(false)
  })

  it('渲染 item 的 label 与内容', () => {
    const wrapper = renderDescriptions({}, [{ label: '姓名' }, { label: '年龄' }])
    expect(wrapper.find('.easy-descriptions__label .label-text').text()).toBe('姓名')
    expect(wrapper.find('.easy-descriptions__content').text()).toBe('内容1')
  })

  it('column 与 span 应用到内容单元格 colspan', () => {
    const wrapper = renderDescriptions({ column: 2 }, [{ label: '姓名', span: 2 }])
    const content = wrapper.find('.easy-descriptions__content')
    expect((content.element as HTMLTableCellElement).colSpan).toBe(3)
  })

  it('bordered 添加边框类名', () => {
    const wrapper = renderDescriptions({ bordered: true })
    expect(wrapper.find('.easy-descriptions').classes()).toContain('is-bordered')
  })

  it('size 应用到类名', () => {
    const wrapper = renderDescriptions({ size: 'small' })
    expect(wrapper.find('.easy-descriptions').classes()).toContain('easy-descriptions--small')
  })

  it('layout 应用到类名', () => {
    const wrapper = renderDescriptions({ layout: 'vertical' })
    expect(wrapper.find('.easy-descriptions').classes()).toContain('easy-descriptions--vertical')
  })

  it('vertical 布局渲染网格而非表格', () => {
    const wrapper = renderDescriptions({ layout: 'vertical' }, [{ label: '姓名' }])
    expect(wrapper.find('.easy-descriptions__table').exists()).toBe(false)
    expect(wrapper.find('.easy-descriptions__grid').exists()).toBe(true)
  })

  it('colon 不影响基础渲染', () => {
    const wrapper = renderDescriptions({ colon: true }, [{ label: '姓名' }])
    expect(wrapper.find('.easy-descriptions').exists()).toBe(true)
  })
})
