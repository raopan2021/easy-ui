import dayjs from 'dayjs'

/**
 * 格式化时间戳为日期时间字符串
 * @param timestamp 毫秒时间戳或日期字符串
 * @param template 格式模板，默认 "YYYY-MM-DD HH:mm:ss"
 * @returns 格式化后的日期字符串，无效值原样返回
 */
export function formatDateTime(timestamp?: string | number, template = 'YYYY-MM-DD HH:mm:ss') {
  if (!timestamp)
    return ''
  const d = dayjs(Number(timestamp))
  return d.isValid() ? d.format(template) : String(timestamp)
}

/**
 * 通用数字转 number（空值 / 非法值返回 NaN）
 */
function toNum(v?: number | string | null): number {
  if (v == null || v === '')
    return NaN
  return Number(v)
}

/**
 * 格式化金额数字（千分位分隔，可追加单位）
 * @param value 金额
 * @param opts.decimals 小数位数，默认 6
 * @param opts.suffix 单位后缀，如 "万元"
 * @returns 格式化字符串，空值返回 "-"
 *
 * @example formatAmount(1000)                     // "1,000"
 * @example formatAmount(1000, { decimals: 2 })    // "1,000"
 * @example formatAmount(1000, { suffix: "万元" })  // "1,000 万元"
 */
export function formatAmount(value?: number | string | null, opts?: { decimals?: number, suffix?: string }): string {
  const { decimals = 6, suffix = '' } = opts ?? {}
  const num = toNum(value)
  if (isNaN(num))
    return '-'
  const formatted = num.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })
  return `${formatted} ${suffix}`
}

/**
 * 脱敏字符串，保留首尾指定数量的字符，中间替换为 *
 * @param str 原字符串
 * @param keepHead 保留开头字符数，默认 3
 * @param keepTail 保留末尾字符数，默认 2
 * @returns 脱敏后的字符串，空值返回 "-"
 */
export function desensitize(str?: string | null, keepHead = 3, keepTail = 2) {
  if (!str)
    return '-'
  if (str.length <= keepHead + keepTail)
    return str
  return str.slice(0, keepHead) + '*'.repeat(str.length - keepHead - keepTail) + str.slice(-keepTail)
}

/**
 * 过滤对象中值为 null / undefined / 空字符串 的键
 * @param obj 源对象
 * @returns 清洗后的新对象
 *
 * @example cleanObject({ a: 1, b: null, c: "", d: undefined, e: 0 }) // => { a: 1, e: 0 }
 */
export function cleanObject<T extends Record<string, any>>(obj?: T | null): Partial<T> {
  if (!obj)
    return {}
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== null && v !== undefined && v !== '',
    ),
  ) as Partial<T>
}
