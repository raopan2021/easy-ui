import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import DropdownItem from '../src/dropdown-item.vue'
import Dropdown from '../src/dropdown.vue'

function renderDropdown(props: Record<string, any> = {}, items: string[] = ['选项一', '选项二']) {
  return mount(Dropdown, {
    props: { ...props },
    slots: {
      dropdown: () => items.map(t => <DropdownItem>{t}</DropdownItem>),
    },
  })
}

describe('Dropdown 下拉菜单组件', () => {
  it('渲染触发器文本', () => {
    const wrapper = renderDropdown({ label: '操作' })
    expect(wrapper.find('.easy-dropdown__trigger').text()).toContain('操作')
  })

  it('默认菜单初始隐藏', () => {
    const wrapper = renderDropdown()
    expect(wrapper.vm.isOpen()).toBe(false)
    expect(wrapper.find('.easy-dropdown-menu').exists()).toBe(false)
  })

  it('点击触发器展开菜单', async () => {
    const wrapper = renderDropdown()
    await wrapper.find('.easy-dropdown').trigger('click')
    await nextTick()
    expect(wrapper.vm.isOpen()).toBe(true)
    const menu = wrapper.find('.easy-dropdown-menu')
    expect(menu.exists()).toBe(true)
    expect(menu.findAll('.easy-dropdown-item').length).toBe(2)
    wrapper.unmount()
  })

  it('再次点击触发器收起菜单', async () => {
    const wrapper = renderDropdown()
    await wrapper.find('.easy-dropdown').trigger('click')
    await nextTick()
    await wrapper.find('.easy-dropdown').trigger('click')
    await nextTick()
    expect(wrapper.vm.isOpen()).toBe(false)
    wrapper.unmount()
  })

  it('点击菜单项后关闭菜单', async () => {
    const wrapper = renderDropdown()
    await wrapper.find('.easy-dropdown').trigger('click')
    await nextTick()
    await wrapper.find('.easy-dropdown-item').trigger('click')
    await nextTick()
    expect(wrapper.vm.isOpen()).toBe(false)
    wrapper.unmount()
  })

  it('DropdownItem 独立点击触发 click 事件', async () => {
    const onClick = vi.fn()
    const wrapper = mount(() => <DropdownItem onClick={onClick}>选项</DropdownItem>)
    await wrapper.find('.easy-dropdown-item').trigger('click')
    await nextTick()
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('点击菜单项后触发使用方 click 事件（选择生效）', async () => {
    const onClick = vi.fn()
    const wrapper = mount(Dropdown, {
      props: { label: '点击试试' },
      slots: {
        dropdown: () => <DropdownItem onClick={onClick}>黄金糕</DropdownItem>,
      },
    })
    await wrapper.find('.easy-dropdown').trigger('click')
    await nextTick()
    await wrapper.find('.easy-dropdown-item').trigger('click')
    await nextTick()
    // 使用方选择逻辑生效
    expect(onClick).toHaveBeenCalledTimes(1)
    // 且菜单同步关闭
    expect(wrapper.vm.isOpen()).toBe(false)
    wrapper.unmount()
  })

  it('trigger=click 时渲染下拉项文本', async () => {
    const wrapper = renderDropdown()
    await wrapper.find('.easy-dropdown').trigger('click')
    await nextTick()
    expect(wrapper.find('.easy-dropdown-menu').text()).toContain('选项一')
    expect(wrapper.find('.easy-dropdown-menu').text()).toContain('选项二')
    wrapper.unmount()
  })

  it('expose show/hide/toggle/isOpen 方法', () => {
    const wrapper = mount(Dropdown, { props: { label: '操作' } })
    const vm = wrapper.vm as unknown as {
      show: () => void
      hide: () => void
      toggle: () => void
      isOpen: () => boolean
    }
    expect(typeof vm.show).toBe('function')
    expect(typeof vm.hide).toBe('function')
    expect(typeof vm.toggle).toBe('function')
    expect(typeof vm.isOpen).toBe('function')
    expect(vm.isOpen()).toBe(false)
    vm.show()
    expect(vm.isOpen()).toBe(true)
    vm.hide()
    expect(vm.isOpen()).toBe(false)
  })
})
