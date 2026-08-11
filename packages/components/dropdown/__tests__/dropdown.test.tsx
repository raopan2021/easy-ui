import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import DropdownItem from '../src/dropdown-item.vue'
import Dropdown from '../src/dropdown.vue'

function renderDropdown(props: Record<string, any> = {}, items: string[] = ['选项一', '选项二']) {
  return mount(() => (
    <Dropdown {...props}>
      {{
        dropdown: () => items.map(t => <DropdownItem>{t}</DropdownItem>),
      }}
    </Dropdown>
  ))
}

describe('Dropdown 下拉菜单组件', () => {
  it('渲染触发器文本', () => {
    const wrapper = renderDropdown({ label: '操作' })
    expect(wrapper.find('.easy-dropdown__trigger').text()).toContain('操作')
  })

  it('默认菜单初始隐藏', () => {
    const wrapper = renderDropdown()
    expect(wrapper.find('.easy-dropdown-menu').exists()).toBe(false)
  })

  it('点击触发器展开菜单', async () => {
    const wrapper = renderDropdown()
    await wrapper.find('.easy-dropdown').trigger('click')
    await nextTick()
    const menu = document.body.querySelector('.easy-dropdown-menu')
    expect(menu).toBeTruthy()
    expect(menu!.querySelectorAll('.easy-dropdown-item').length).toBe(2)
    wrapper.unmount()
  })

  it('再次点击触发器收起菜单', async () => {
    const wrapper = renderDropdown()
    await wrapper.find('.easy-dropdown').trigger('click')
    await nextTick()
    await wrapper.find('.easy-dropdown').trigger('click')
    await nextTick()
    const menu = document.body.querySelector('.easy-dropdown-menu')
    expect(menu).toBeTruthy()
    expect((menu as HTMLElement).style.display).toBe('none')
    wrapper.unmount()
  })

  it('trigger=click 时渲染下拉项文本', async () => {
    const wrapper = renderDropdown()
    await wrapper.find('.easy-dropdown').trigger('click')
    await nextTick()
    const menu = document.body.querySelector('.easy-dropdown-menu')!
    expect(menu.textContent).toContain('选项一')
    expect(menu.textContent).toContain('选项二')
    wrapper.unmount()
  })

  it('expose show/hide/toggle 方法', () => {
    const wrapper = mount(Dropdown, { props: { label: '操作' } })
    const vm = wrapper.vm as unknown as { show: () => void, hide: () => void, toggle: () => void }
    expect(typeof vm.show).toBe('function')
    expect(typeof vm.hide).toBe('function')
    expect(typeof vm.toggle).toBe('function')
  })
})
