const utils = await import('../index')

describe('strings', () => {
  it('camelize 将短横线命名转为驼峰', () => {
    const { camelize } = utils
    expect(camelize('search-form')).toBe('searchForm')
    expect(camelize('abc-def-ghi')).toBe('abcDefGhi')
  })

  it('hyphenate 将驼峰命名转为短横线', () => {
    const { hyphenate } = utils
    expect(hyphenate('searchForm')).toBe('search-form')
    expect(hyphenate('ABC')).toBe('a-b-c')
  })

  it('capitalize 首字母大写', () => {
    const { capitalize } = utils
    expect(capitalize('easyUI')).toBe('EasyUI')
  })

  it('escapeStringRegexp 转义正则特殊字符', () => {
    const { escapeStringRegexp } = utils
    expect(escapeStringRegexp('a.b*c')).toBe('a\\.b\\*c')
  })
})

describe('numbers', () => {
  it('addUnit 为纯数字追加默认单位', () => {
    const { addUnit } = utils
    expect(addUnit(12)).toBe('12px')
    expect(addUnit('12.5', 'rem')).toBe('12.5rem')
    expect(addUnit('100%')).toBe('100%')
    expect(addUnit(undefined)).toBeUndefined()
    expect(addUnit('')).toBeUndefined()
  })
})

describe('download', () => {
  it('downloadBlob 创建 blob 链接并触发下载', () => {
    const { downloadBlob } = utils
    const clickSpy = vi.fn()
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(clickSpy)

    downloadBlob('# Hello', 'test.md', 'text/markdown;charset=utf-8')

    expect(clickSpy).toHaveBeenCalledTimes(1)
    expect(revokeSpy).toHaveBeenCalledWith('blob:mock')
  })
})
