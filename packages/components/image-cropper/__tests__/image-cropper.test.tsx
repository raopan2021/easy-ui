import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ImageCropper from '../src/image-cropper.vue'

const stubs = {
  'el-tooltip': { template: '<span><slot/></span>' },
  'easy-button': { template: '<button class="easy-button-stub"><slot/></button>' },
}

describe('ImageCropper 图片裁剪组件', () => {
  it('渲染基础裁剪器容器', () => {
    const wrapper = mount(() => <ImageCropper />, { global: { stubs } })
    expect(wrapper.find('.easy-image-cropper').exists()).toBe(true)
  })

  it('无 src 时渲染占位符', () => {
    const wrapper = mount(() => <ImageCropper />, { global: { stubs } })
    expect(wrapper.find('.easy-image-cropper__placeholder').exists()).toBe(true)
    expect(wrapper.find('.easy-image-cropper__placeholder').text()).toContain('请选择图片')
  })

  it('有 src 时渲染图片', () => {
    const wrapper = mount(() => <ImageCropper src="/photo.png" />, { global: { stubs } })
    const img = wrapper.find('.easy-image-cropper__img')
    expect(img.exists()).toBe(true)
    expect((img.element as HTMLImageElement).src).toContain('/photo.png')
  })

  it('toolbar 默认渲染工具栏', () => {
    const wrapper = mount(() => <ImageCropper />, { global: { stubs } })
    expect(wrapper.find('.easy-image-cropper__toolbar').exists()).toBe(true)
    // 左旋、右旋、镜像、翻转、放大、缩小、重置 共 7 个按钮
    expect(wrapper.findAll('.easy-image-cropper__btn').length).toBe(7)
  })

  it('toolbar=false 不渲染工具栏', () => {
    const wrapper = mount(() => <ImageCropper toolbar={false} />, { global: { stubs } })
    expect(wrapper.find('.easy-image-cropper__toolbar').exists()).toBe(false)
  })

  it('showAction 默认渲染操作按钮', () => {
    const wrapper = mount(() => <ImageCropper />, { global: { stubs } })
    const action = wrapper.find('.easy-image-cropper__action')
    expect(action.exists()).toBe(true)
    expect(action.text()).toContain('取消')
    expect(action.text()).toContain('确认裁剪')
  })

  it('showAction=false 不渲染操作按钮', () => {
    const wrapper = mount(() => <ImageCropper showAction={false} />, { global: { stubs } })
    expect(wrapper.find('.easy-image-cropper__action').exists()).toBe(false)
  })

  it('点击取消触发 cancel 事件', async () => {
    const onCancel = vi.fn()
    const wrapper = mount(() => <ImageCropper onCancel={onCancel} />, { global: { stubs } })
    const cancelBtn = wrapper.findAll('.easy-button-stub')[0]!
    await cancelBtn.trigger('click')
    expect(onCancel).toHaveBeenCalled()
  })

  it('action 插槽自定义操作区', () => {
    const wrapper = mount(() => (
      <ImageCropper>
        {{
          action: () => <button class="custom-action">自定义</button>,
        }}
      </ImageCropper>
    ), { global: { stubs } })
    expect(wrapper.find('.easy-image-cropper__action .custom-action').text()).toBe('自定义')
  })

  it('无 src 时点击确认不触发 confirm', async () => {
    const onConfirm = vi.fn()
    const wrapper = mount(() => <ImageCropper onConfirm={onConfirm} />, { global: { stubs } })
    const confirmBtn = wrapper.findAll('.easy-button-stub')[1]!
    await confirmBtn.trigger('click')
    await nextTick()
    // 未初始化 Cropper，getCropData 返回 null，不触发 confirm
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
