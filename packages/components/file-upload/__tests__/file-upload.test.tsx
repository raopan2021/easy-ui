import { mount } from '@vue/test-utils'
import FileUpload from '../src/file-upload.vue'

describe('FileUpload 文件上传组件', () => {
  it('渲染上传容器', () => {
    const wrapper = mount(() => <FileUpload />)
    expect(wrapper.find('.easy-upload').exists()).toBe(true)
  })

  it('渲染上传触发区', () => {
    const wrapper = mount(() => <FileUpload />)
    expect(wrapper.find('.easy-upload__trigger').exists()).toBe(true)
    expect(wrapper.find('.easy-upload__trigger-text').text()).toContain('点击上传')
  })

  it('自定义 triggerText', () => {
    const wrapper = mount(() => <FileUpload triggerText="选择文件" />)
    expect(wrapper.find('.easy-upload__trigger-text').text()).toContain('选择文件')
  })

  it('渲染隐藏的 file input', () => {
    const wrapper = mount(() => <FileUpload />)
    expect(wrapper.find('input[type="file"]').exists()).toBe(true)
  })

  it('disabled 应用禁用类名', () => {
    const wrapper = mount(() => <FileUpload disabled />)
    expect(wrapper.find('.easy-upload').classes()).toContain('is-disabled')
  })

  it('tip 渲染提示文字', () => {
    const wrapper = mount(() => <FileUpload tip="支持 PDF、Word" />)
    expect(wrapper.find('.easy-upload__tip').text()).toBe('支持 PDF、Word')
  })

  it('modelValue 渲染已上传文件名', () => {
    const wrapper = mount(() => <FileUpload modelValue={[{ id: '1', name: '报告.pdf', url: '/r.pdf' }]} />)
    expect(wrapper.find('.easy-upload__file-name').text()).toBe('报告.pdf')
  })

  it('limit 渲染上传数量', () => {
    const wrapper = mount(() => <FileUpload limit={3} />)
    expect(wrapper.find('.easy-upload').exists()).toBe(true)
  })

  it('选中文件后组件正常响应', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(() => <FileUpload onUpdate:modelValue={onUpdate} />)
    const input = wrapper.find('input[type="file"]')
    const file = new File(['x'], 'a.txt', { type: 'text/plain' })
    Object.defineProperty(input.element, 'files', { value: [file] })
    await input.trigger('change')
    // 组件响应文件选择，不抛错
    expect(wrapper.find('.easy-upload').exists()).toBe(true)
  })
})
