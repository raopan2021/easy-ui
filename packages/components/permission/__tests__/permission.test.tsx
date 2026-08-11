import { mount } from '@vue/test-utils'
import Permission from '../src/permission.vue'

// stub Element Plus 组件，避免未解析警告
const stubs = {
  'el-checkbox': {
    props: ['modelValue', 'indeterminate', 'disabled'],
    emits: ['change'],
    template: '<label class="el-checkbox-stub"><span class="el-checkbox__label"><slot/></span></label>',
  },
  'el-tag': {
    props: ['size', 'closable'],
    emits: ['close'],
    template: '<span class="el-tag-stub"><slot/></span>',
  },
}

const moduleData = [
  {
    id: 1,
    label: '用户管理',
    children: [
      {
        id: 11,
        label: '用户列表',
        children: [
          { id: 111, label: '查看' },
          { id: 112, label: '新增' },
        ],
      },
    ],
  },
]

describe('Permission 权限组件', () => {
  it('渲染基础权限容器', () => {
    const wrapper = mount(() => <Permission data={moduleData} />, { global: { stubs } })
    expect(wrapper.find('.easy-permission').exists()).toBe(true)
  })

  it('渲染全选头部', () => {
    const wrapper = mount(() => <Permission data={moduleData} />, { global: { stubs } })
    expect(wrapper.find('.permission-header').exists()).toBe(true)
    expect(wrapper.find('.permission-header').text()).toContain('全选')
  })

  it('showSelectAll=false 不渲染全选头部', () => {
    const wrapper = mount(() => <Permission data={moduleData} showSelectAll={false} />, { global: { stubs } })
    expect(wrapper.find('.permission-header').exists()).toBe(false)
  })

  it('渲染权限表格', () => {
    const wrapper = mount(() => <Permission data={moduleData} />, { global: { stubs } })
    expect(wrapper.find('.permission-table').exists()).toBe(true)
    expect(wrapper.find('.permission-table').classes()).toContain('is-bordered')
  })

  it('maxLevel 应用到表格类名', () => {
    const wrapper = mount(() => <Permission data={moduleData} maxLevel={3} />, { global: { stubs } })
    expect(wrapper.find('.permission-table').classes()).toContain('max-level-3')
  })

  it('渲染模块标签文本', () => {
    const wrapper = mount(() => <Permission data={moduleData} />, { global: { stubs } })
    expect(wrapper.find('.permission-table').text()).toContain('用户管理')
  })

  it('渲染表头', () => {
    const wrapper = mount(() => <Permission data={moduleData} maxLevel={3} />, { global: { stubs } })
    expect(wrapper.find('.cell-module').text()).toBe('功能模块')
    expect(wrapper.find('.cell-page').text()).toBe('页面权限')
    expect(wrapper.find('.cell-action').text()).toBe('操作权限')
  })

  it('自定义 headers 渲染表头', () => {
    const wrapper = mount(() => (
      <Permission data={moduleData} maxLevel={3} headers={['模块', '页面', '操作']} />
    ), { global: { stubs } })
    expect(wrapper.find('.cell-module').text()).toBe('模块')
    expect(wrapper.find('.cell-page').text()).toBe('页面')
  })

  it('showSelected 且选中时渲染已选区域', () => {
    const wrapper = mount(() => <Permission data={moduleData} modelValue={[111]} />, { global: { stubs } })
    expect(wrapper.find('.selected-info').exists()).toBe(true)
    expect(wrapper.find('.selected-title').text()).toBe('已选权限')
  })

  it('无选中值时不渲染已选区域', () => {
    const wrapper = mount(() => <Permission data={moduleData} modelValue={[]} />, { global: { stubs } })
    expect(wrapper.find('.selected-info').exists()).toBe(false)
  })

  it('bordered prop 不影响表格类名（is-bordered 固定渲染）', () => {
    const wrapper = mount(() => <Permission data={moduleData} bordered={false} />, { global: { stubs } })
    expect(wrapper.find('.permission-table').exists()).toBe(true)
  })

  it('maxLevel=1 渲染一级表格', () => {
    const single = [{ id: 1, label: '仪表盘' }]
    const wrapper = mount(() => <Permission data={single} maxLevel={1} />, { global: { stubs } })
    expect(wrapper.find('.permission-table').classes()).toContain('max-level-1')
    expect(wrapper.find('.permission-table').text()).toContain('仪表盘')
  })
})
