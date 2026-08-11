import { mount } from '@vue/test-utils'
import DeptTree from '../src/dept-tree.vue'

const treeData = [
  {
    id: 1,
    name: '总部',
    children: [
      { id: 2, name: '研发部' },
      { id: 3, name: '市场部' },
    ],
  },
]

describe('DeptTree 部门树组件', () => {
  it('渲染部门树容器', () => {
    const wrapper = mount(() => <DeptTree data={treeData} />)
    expect(wrapper.find('.easy-dept-tree').exists()).toBe(true)
  })

  it('loading 渲染加载状态', () => {
    const wrapper = mount(() => <DeptTree data={[]} loading />)
    expect(wrapper.find('.easy-dept-tree__loading').exists()).toBe(true)
  })

  it('空数据渲染空状态', () => {
    const wrapper = mount(() => <DeptTree data={[]} emptyText="暂无部门" />)
    expect(wrapper.find('.easy-dept-tree__empty').exists()).toBe(true)
    expect(wrapper.find('.easy-dept-tree__empty').text()).toContain('暂无部门')
  })

  it('有数据且不加载时不渲染空状态', () => {
    const wrapper = mount(() => <DeptTree data={treeData} />)
    expect(wrapper.find('.easy-dept-tree__empty').exists()).toBe(false)
  })

  it('loading 时不渲染空状态', () => {
    const wrapper = mount(() => <DeptTree data={[]} loading />)
    expect(wrapper.find('.easy-dept-tree__empty').exists()).toBe(false)
  })

  it('渲染内部树结构', () => {
    const wrapper = mount(() => <DeptTree data={treeData} />)
    // 容器存在且有内部节点内容
    expect(wrapper.find('.easy-dept-tree').exists()).toBe(true)
    expect(wrapper.find('.easy-dept-tree').element.childNodes.length).toBeGreaterThan(0)
  })

  it('nodeStyle 属性可传入', () => {
    const wrapper = mount(() => <DeptTree data={treeData} nodeStyle={{ color: '#ff0000' }} />)
    expect(wrapper.find('.easy-dept-tree').exists()).toBe(true)
  })

  it('loading prop 正常渲染', () => {
    const wrapper = mount(() => <DeptTree data={treeData} loading />)
    expect(wrapper.find('.easy-dept-tree').exists()).toBe(true)
  })
})
