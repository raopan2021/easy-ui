import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import Worktab from '../src/worktab.vue'

const pinia = createPinia()

const stubs = {
  'el-dropdown': { template: '<div class="el-dropdown-stub"><slot/><slot name="dropdown"/></div>' },
  'el-dropdown-menu': { template: '<div class="el-dropdown-menu-stub"><slot/></div>' },
  'el-dropdown-item': { template: '<div class="el-dropdown-item-stub"><slot/></div>' },
  'el-icon': { template: '<span class="el-icon-stub"><slot/></span>' },
}

// worktab 从 useTabsStore 读取数据，而非 props
function renderWT() {
  return mount(() => <Worktab />, { global: { stubs, plugins: [pinia] } })
}

describe('Worktab 页签组件', () => {
  it('渲染页签容器', () => {
    const wrapper = renderWT()
    expect(wrapper.find('.easy-worktab').exists()).toBe(true)
  })

  it('渲染右侧更多操作按钮', () => {
    const wrapper = renderWT()
    expect(wrapper.find('.worktab-action-btn').exists()).toBe(true)
  })

  it('渲染左右滚动按钮', () => {
    const wrapper = renderWT()
    expect(wrapper.find('.worktab-scroll-btn--left').exists()).toBe(true)
    expect(wrapper.find('.worktab-scroll-btn--right').exists()).toBe(true)
  })

  it('渲染页签滚动容器', () => {
    const wrapper = renderWT()
    expect(wrapper.find('.worktab-scroll').exists()).toBe(true)
  })

  it('空 tabs 状态可正常渲染', () => {
    const wrapper = renderWT()
    expect(wrapper.find('.easy-worktab').exists()).toBe(true)
  })

  it('渲染分割线', () => {
    const wrapper = renderWT()
    expect(wrapper.find('.worktab-divider').exists()).toBe(true)
  })
})
