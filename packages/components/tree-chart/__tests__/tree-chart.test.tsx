import { mount } from '@vue/test-utils'
import TreeChart from '../src/tree-chart.vue'

const treeData = [{
  id: 1,
  label: '董事长',
  children: [
    { id: 11, label: '总经理' },
    { id: 12, label: '总监' },
  ],
}]

describe('TreeChart 树状图组件', () => {
  it('渲染树状图容器', () => {
    const wrapper = mount(() => <TreeChart data={treeData} />)
    // 根类名注意首字母 C 大写
    expect(wrapper.find('.easy-tree-Chart').exists()).toBe(true)
  })

  it('渲染缩放比例控件', () => {
    const wrapper = mount(() => <TreeChart data={treeData} />)
    expect(wrapper.find('.easy-tree-Chart').text()).toContain('100%')
  })

  it('showToolbar 渲染工具栏', () => {
    const wrapper = mount(() => <TreeChart data={treeData} showToolbar />)
    const text = wrapper.find('.easy-tree-Chart').text()
    expect(text).toContain('100%')
  })

  it('无数据时正常渲染', () => {
    const wrapper = mount(() => <TreeChart data={[]} />)
    expect(wrapper.find('.easy-tree-Chart').exists()).toBe(true)
  })

  it('width 与 height 属性可传入', () => {
    const wrapper = mount(() => <TreeChart data={treeData} width={800} height={500} />)
    expect(wrapper.find('.easy-tree-Chart').exists()).toBe(true)
  })

  it('expandable 正常渲染', () => {
    const wrapper = mount(() => <TreeChart data={treeData} expandable />)
    expect(wrapper.find('.easy-tree-Chart').exists()).toBe(true)
  })

  it('defaultExpandAll 正常渲染', () => {
    const wrapper = mount(() => <TreeChart data={treeData} defaultExpandAll />)
    expect(wrapper.find('.easy-tree-Chart').exists()).toBe(true)
  })
})
