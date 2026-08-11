import { mount } from '@vue/test-utils'
import Table from '../src/table.vue'

const columns = [
  { prop: 'name', label: '姓名' },
  { prop: 'age', label: '年龄' },
]
const data = [
  { name: '张三', age: 25 },
  { name: '李四', age: 30 },
]

const stubs = {
  'el-checkbox': { template: '<span class="el-checkbox-stub"><slot/></span>' },
  'easy-select': { template: '<span class="easy-select-stub"/>' },
  'easy-icon': { template: '<span class="easy-icon-stub"/>' },
  'el-empty': { template: '<div class="el-empty-stub"><slot/></div>' },
  'el-pagination': { template: '<div class="el-pagination-stub"><slot/></div>' },
}

describe('Table 表格组件', () => {
  it('渲染表格容器', () => {
    const wrapper = mount(() => <Table columns={columns} data={data} autoHeight={false} />, { global: { stubs } })
    expect(wrapper.find('.easy-table').exists()).toBe(true)
  })

  it('渲染表格标题', () => {
    const wrapper = mount(() => <Table columns={columns} data={data} title="用户列表" autoHeight={false} />, { global: { stubs } })
    expect(wrapper.find('.easy-table').text()).toContain('用户列表')
  })

  it('渲染序号与行数据', () => {
    const wrapper = mount(() => <Table columns={columns} data={data} autoHeight={false} />, { global: { stubs } })
    const tableText = wrapper.find('.easy-table').text()
    // 表格渲染序号与所有数据行
    expect(tableText).toContain('#1')
    expect(tableText).toContain('张三')
    expect(tableText).toContain('李四')
    expect(tableText).toContain('25')
    expect(tableText).toContain('30')
  })

  it('渲染数据行内容', () => {
    const wrapper = mount(() => <Table columns={columns} data={data} autoHeight={false} />, { global: { stubs } })
    const tableText = wrapper.find('.easy-table').text()
    expect(tableText).toContain('张三')
    expect(tableText).toContain('李四')
    expect(tableText).toContain('25')
    expect(tableText).toContain('30')
  })

  it('data 为空时不渲染行数据', () => {
    const wrapper = mount(() => <Table columns={columns} data={[]} autoHeight={false} />, { global: { stubs } })
    const tableText = wrapper.find('.easy-table').text()
    expect(tableText).not.toContain('张三')
  })

  it('loading 状态正常渲染', () => {
    const wrapper = mount(() => <Table columns={columns} data={data} loading autoHeight={false} />, { global: { stubs } })
    expect(wrapper.find('.easy-table').exists()).toBe(true)
  })

  it('border prop 正常渲染不报错', () => {
    const wrapper = mount(() => <Table columns={columns} data={data} border autoHeight={false} />, { global: { stubs } })
    expect(wrapper.find('.easy-table').exists()).toBe(true)
  })

  it('stripe prop 正常渲染不报错', () => {
    const wrapper = mount(() => <Table columns={columns} data={data} stripe autoHeight={false} />, { global: { stubs } })
    expect(wrapper.find('.easy-table').exists()).toBe(true)
  })

  it('autoHeight 默认开启时不报错', () => {
    const wrapper = mount(() => <Table columns={columns} data={data} />, { global: { stubs } })
    expect(wrapper.find('.easy-table').exists()).toBe(true)
  })

  it('pagination 渲染分页信息', () => {
    const wrapper = mount(() => <Table columns={columns} data={data} pagination total={100} page={1} pageSize={10} autoHeight={false} />, { global: { stubs } })
    expect(wrapper.find('.easy-table').text()).toContain('100')
  })
})
