import useFormFields from '../src/useFormFields'

describe('useFormFields', () => {
  const {
    input,
    select,
    dateRangePicker,
    dateTimeRangePicker,
    timeRangePicker,
    sw,
    rate,
    rules,
    pick,
    textarea,
    password,
    custom,
    divider,
    title,
  } = useFormFields()

  test('input infers Chinese label and basic props', () => {
    const field = input('name')
    expect(field.prop).toBe('name')
    expect(field.type).toBe('input')
    expect(field.label).toBe('姓名')
  })

  test('input with explicit label and required', () => {
    const field = input('phone', '手机号', { required: true })
    expect(field.label).toBe('手机号')
    expect(field.required).toBe(true)
  })

  test('chain methods build field config', () => {
    const field = input('age')
      .$required()
      .$span(12)
      .$label('年龄')
      .$props({ clearable: true })
      .$size('small')

    expect(field.required).toBe(true)
    expect(field.span).toBe(12)
    expect(field.label).toBe('年龄')
    expect(field.props).toEqual({ clearable: true })
    expect(field.size).toBe('small')
  })

  test('$optional resets required', () => {
    const field = input('code').$required().$optional()
    expect(field.required).toBe(false)
  })

  test('textarea adds textarea props', () => {
    const field = textarea('remark')
    expect(field.type).toBe('input')
    expect(field.props?.type).toBe('textarea')
    expect(field.props?.rows).toBe(3)
  })

  test('password adds password props', () => {
    const field = password('password', '密码')
    expect(field.props?.type).toBe('password')
    expect(field.props?.showPassword).toBe(true)
  })

  test('select with options via $options', () => {
    const field = select('dept').$options([{ label: '技术部', value: 1 }])
    expect(field.type).toBe('select')
    expect(field.props?.options).toHaveLength(1)
  })

  test('sw and rate', () => {
    expect(sw('enabled').type).toBe('switch')
    expect(rate('score').type).toBe('rate')
  })

  test('dateRangePicker infers start/end props', () => {
    const field = dateRangePicker('dateRange')
    expect(field.type).toBe('dateRangePicker')
    expect(field.startProp).toBe('dateStart')
    expect(field.endProp).toBe('dateEnd')
  })

  test('dateRangePicker with explicit start/end', () => {
    const field = dateRangePicker('range', 'beginTime', 'endTime')
    expect(field.startProp).toBe('beginTime')
    expect(field.endProp).toBe('endTime')
  })

  test('dateRangePicker with label and explicit start/end', () => {
    const field = dateRangePicker('range', '用药时长', 'beginTime', 'endTime')
    expect(field.label).toBe('用药时长')
    expect(field.startProp).toBe('beginTime')
    expect(field.endProp).toBe('endTime')
  })

  test('dateTimeRangePicker and timeRangePicker infer props', () => {
    expect(dateTimeRangePicker('dtRange').startProp).toBe('dtStart')
    expect(timeRangePicker('tRange').startProp).toBe('tStart')
  })

  test('custom field with component', () => {
    const comp = {}
    const field = custom('custom', comp, '自定义')
    expect(field.component).toBe(comp)
    expect(field.label).toBe('自定义')
  })

  test('divider and title placeholders', () => {
    const d = divider('分组')
    expect(d.prop).toBe('__divider__')
    expect(d.type).toBe('divider')
    expect(d.label).toBe('分组')

    const t = title('标题', 1)
    expect(t.prop).toBe('__title__')
    expect(t.props.level).toBe(1)
    expect(t.span).toBe(24)
  })

  test('pick extracts specified props', () => {
    const formData = { name: '张三', age: 18, ignored: true }
    const fields = [input('name'), input('age')]
    const picked = pick(formData, fields, ['name', 'age'])
    expect(picked).toEqual({ name: '张三', age: 18 })
  })

  test('rules helpers', () => {
    expect(rules.required('必填')).toEqual({ type: 'required', message: '必填' })
    expect(rules.email()).toEqual({ type: 'email', message: undefined })
    expect(rules.phone()).toEqual({ type: 'phone', message: undefined })
    expect(rules.pattern(/^\d+$/, '格式错误')).toEqual({
      type: 'pattern',
      pattern: /^\d+$/,
      message: '格式错误',
    })
    expect(rules.minLength(6)).toEqual({ type: 'pattern', minLength: 6, message: undefined })
    expect(rules.maxLength(10)).toEqual({ type: 'pattern', maxLength: 10, message: undefined })
    expect(rules.range(1, 10)).toEqual({ type: 'pattern', min: 1, max: 10, message: undefined })
  })

  test('rules.custom wraps validator', () => {
    const validator = (value: unknown) => (value === 'ok' ? true : 'error')
    const rule = rules.custom(validator, '错误')
    expect(rule.validator).toBe(validator)
    expect(rule.message).toBe('错误')
  })

  test('$range sets start/end props', () => {
    const field = input('a').$range('aStart', 'aEnd')
    expect(field.startProp).toBe('aStart')
    expect(field.endProp).toBe('aEnd')
  })

  test('label inference for unknown props converts camelCase', () => {
    const field = input('orderNo')
    expect(field.label).toBe('OrderNo')
  })
})
