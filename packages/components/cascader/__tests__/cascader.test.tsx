import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Cascader from '../src/cascader.vue'

const options = [
  {
    label: '浙江',
    value: 'zj',
    children: [
      { label: '杭州', value: 'hz', children: [{ label: '西湖区', value: 'xh' }] },
      { label: '宁波', value: 'nb' },
    ],
  },
  {
    label: '广东',
    value: 'gd',
    children: [{ label: '广州', value: 'gz' }],
  },
]

function currentPanel() {
  const panels = document.body.querySelectorAll('.easy-cascader__panel')
  return panels[panels.length - 1]
}

afterEach(() => {
  document.body.querySelectorAll('.easy-cascader__panel').forEach(el => el.remove())
})

describe('Cascader 级联选择器组件', () => {
  it('渲染包装器并显示占位符', () => {
    const wrapper = mount(() => <Cascader options={options} placeholder="请选择地区" />)
    expect(wrapper.find('.easy-cascader__wrapper').exists()).toBe(true)
    expect(wrapper.find('.easy-cascader__value').text()).toContain('请选择地区')
    expect(wrapper.find('.easy-cascader__value').classes()).toContain('is-placeholder')
  })

  it('disabled 应用禁用类名', () => {
    const wrapper = mount(() => <Cascader options={options} disabled />)
    expect(wrapper.find('.easy-cascader').classes()).toContain('is-disabled')
  })

  it('size 应用到类名', () => {
    const wrapper = mount(() => <Cascader options={options} size="small" />)
    expect(wrapper.find('.easy-cascader').classes()).toContain('easy-cascader--small')
  })

  it('点击包装器打开面板并渲染一级菜单', async () => {
    const wrapper = mount(() => <Cascader options={options} />)
    await wrapper.find('.easy-cascader__wrapper').trigger('click')
    await nextTick()
    const panel = currentPanel()
    expect(panel).toBeTruthy()
    const labels = panel!.querySelectorAll('.easy-cascader__menu-label')
    expect(labels.length).toBe(2)
    expect(labels[0].textContent).toContain('浙江')
    wrapper.unmount()
  })

  it('点击一级节点展开二级菜单', async () => {
    const wrapper = mount(() => <Cascader options={options} />)
    await wrapper.find('.easy-cascader__wrapper').trigger('click')
    await nextTick()
    const firstLabel = currentPanel()!.querySelector('.easy-cascader__menu-label') as HTMLElement
    firstLabel.click()
    await nextTick()
    const lists = document.body.querySelectorAll('.easy-cascader__menu-list')
    expect(lists.length).toBeGreaterThanOrEqual(2)
    const secondList = lists[1]!
    expect(secondList.textContent).toContain('杭州')
    expect(secondList.textContent).toContain('宁波')
    wrapper.unmount()
  })

  it('modelValue 对应回显选中路径', () => {
    const wrapper = mount(() => <Cascader options={options} modelValue={['zj', 'hz', 'xh']} />)
    expect(wrapper.find('.easy-cascader__value').text()).toContain('西湖区')
  })

  it('filterable 打开面板后渲染搜索输入框', async () => {
    const wrapper = mount(() => <Cascader options={options} filterable />)
    await wrapper.find('.easy-cascader__wrapper').trigger('click')
    await nextTick()
    expect(currentPanel()!.querySelector('.easy-cascader__search-input')).toBeTruthy()
    wrapper.unmount()
  })

  it('clearable 且有值时渲染清除按钮', () => {
    const wrapper = mount(() => <Cascader options={options} modelValue={['zj', 'hz', 'xh']} clearable />)
    expect(wrapper.find('.easy-cascader__clear').exists()).toBe(true)
  })
})
