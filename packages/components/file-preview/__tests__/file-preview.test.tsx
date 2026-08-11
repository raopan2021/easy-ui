import { mount } from '@vue/test-utils'
import FilePreview from '../src/file-preview.vue'

// mock 第三方文档预览库，避免 jsdom 加载失败
vi.mock('@vue-office/docx', () => ({ default: { name: 'VueOfficeDocx', template: '<div class="docx-preview-stub"/>' } }))
vi.mock('@vue-office/excel', () => ({ default: { name: 'VueOfficeExcel', template: '<div class="excel-preview-stub"/>' } }))
vi.mock('@vue-office/pdf', () => ({ default: { name: 'VueOfficePdf', template: '<div class="pdf-preview-stub"/>' } }))
vi.mock('pptx-preview', () => ({ default: { name: 'PptxPreview', template: '<div class="pptx-preview-stub"/>' } }))
vi.mock('@vue-office/docx/dist/index.css', () => ({}))
vi.mock('@vue-office/excel/dist/index.css', () => ({}))
vi.mock('@vue-office/pdf/dist/index.css', () => ({}))
vi.mock('pptx-preview/dist/index.css', () => ({}))

describe('FilePreview 文件预览组件', () => {
  it('渲染预览容器', () => {
    const wrapper = mount(() => <FilePreview files={[]} />)
    expect(wrapper.find('.easy-file-preview').exists()).toBe(true)
  })

  it('渲染文件列表', () => {
    const wrapper = mount(() => <FilePreview files={[{ name: '文档.docx', url: '/a.docx' }]} />)
    expect(wrapper.find('.easy-file-preview').text()).toContain('文档.docx')
  })

  it('空文件列表渲染空状态', () => {
    const wrapper = mount(() => <FilePreview files={[]} />)
    expect(wrapper.find('.easy-file-preview').exists()).toBe(true)
  })

  it('渲染文件名列表项', () => {
    const files = [{ name: 'a.docx', url: '/a.docx' }, { name: 'b.pdf', url: '/b.pdf' }]
    const wrapper = mount(() => <FilePreview files={files} />)
    const text = wrapper.find('.easy-file-preview').text()
    expect(text).toContain('a.docx')
    expect(text).toContain('b.pdf')
  })

  it('正常渲染文件预览', () => {
    const wrapper = mount(() => <FilePreview files={[{ name: 'a.pdf', url: '/a.pdf' }]} />)
    expect(wrapper.find('.easy-file-preview').exists()).toBe(true)
  })
})
