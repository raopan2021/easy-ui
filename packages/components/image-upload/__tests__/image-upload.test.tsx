import { mount } from '@vue/test-utils'
import ImageUpload from '../src/image-upload.vue'

describe('ImageUpload 图片上传组件', () => {
  it('渲染上传容器', () => {
    const wrapper = mount(() => <ImageUpload />)
    expect(wrapper.find('.easy-upload').exists()).toBe(true)
  })

  it('渲染上传触发区', () => {
    const wrapper = mount(() => <ImageUpload />)
    expect(wrapper.find('.easy-upload__trigger').exists()).toBe(true)
  })

  it('渲染隐藏的 file input 且 accept 为图片', () => {
    const wrapper = mount(() => <ImageUpload />)
    const input = wrapper.find('input[type="file"]')
    expect(input.exists()).toBe(true)
    expect((input.element as HTMLInputElement).accept).toBe('image/*')
  })

  it('accept 自定义', () => {
    const wrapper = mount(() => <ImageUpload accept="image/png" />)
    expect((wrapper.find('input[type="file"]').element as HTMLInputElement).accept).toBe('image/png')
  })

  it('disabled 应用禁用类名', () => {
    const wrapper = mount(() => <ImageUpload disabled />)
    expect(wrapper.find('.easy-upload').classes()).toContain('is-disabled')
  })

  it('modelValue 渲染已上传图片', () => {
    const wrapper = mount(() => <ImageUpload modelValue={['/img1.png']} />)
    expect(wrapper.find('.easy-upload__img').exists()).toBe(true)
    expect((wrapper.find('.easy-upload__img').element as HTMLImageElement).src).toContain('/img1.png')
  })

  it('limit 控制显示上传按钮数量', () => {
    const wrapper = mount(() => <ImageUpload modelValue={['/a.png']} limit={2} />)
    expect(wrapper.find('.easy-upload').exists()).toBe(true)
  })

  it('tip 渲染提示文字', () => {
    const wrapper = mount(() => <ImageUpload tip="最多上传 5 张" />)
    expect(wrapper.find('.easy-upload__tip').text()).toBe('最多上传 5 张')
  })

  it('previewable prop 正常渲染', () => {
    const wrapper = mount(() => <ImageUpload modelValue={['/a.png']} previewable />)
    expect(wrapper.find('.easy-upload').exists()).toBe(true)
  })

  it('multiple 渲染多选标识', () => {
    const wrapper = mount(() => <ImageUpload multiple />)
    expect(wrapper.find('.easy-upload').exists()).toBe(true)
  })
})
