/**
 * 业务领域表单校验器
 *
 * 基于 @raopan/easy-ui 的 FormRule 规范，提供项目通用的领域校验规则：
 * - noSpecialChar  无特殊字符（客户名称、联系人等）
 * - integer        正整数（意向期限、排序号等）
 * - amount         金额（非负，最多两位小数）
 * - idCard         身份证号（18 位 + 校验位）
 * - creditCode     统一社会信用代码（18 位）
 * - userName       用户名（字母数字下划线）
 * - code           编码（字母数字下划线连字符）
 *
 * 所有校验器均遵循「空值跳过」约定：值为空时返回 true，
 * 必填校验交由 `required` 处理，二者可组合使用。
 */
import type { FormRule } from '@raopan/easy-ui'

/** 判空：undefined / null / 空字符串视为空 */
function isEmpty(v: unknown): boolean {
  return v === undefined || v === null || v === ''
}

/**
 * 无特殊字符校验
 * 白名单：中文、字母、数字、中间点 `·`、中文括号 `（）`、短横线 `-`
 */
export function noSpecialChar(message = '不能包含特殊字符'): FormRule {
  return {
    validator: (v) => {
      if (isEmpty(v))
        return true
      return /^[\u4E00-\u9FA5A-Z0-9·（）\-]+$/i.test(String(v)) || message
    },
    trigger: 'change',
  }
}

/**
 * 非负整数校验（正整数 + 0）
 * 合法：0、1、2、3...（纯数字，无小数点）
 * 不合法：负数、小数、空字符串、含非数字字符
 */
export function integer(message = '请输入正整数'): FormRule {
  return {
    validator: (v) => {
      if (isEmpty(v))
        return true
      return /^\d+$/.test(String(v)) || message
    },
    trigger: 'change',
  }
}

/**
 * 大于 0 的正整数校验（不允许 0）
 * 合法：1、2、3...（首位非 0 的纯数字）
 * 不合法：0、负数、小数、空字符串、含非数字字符
 */
export function positiveInteger(message = '请输入大于0的整数'): FormRule {
  return {
    validator: (v) => {
      if (isEmpty(v))
        return true
      return /^[1-9]\d*$/.test(String(v)) || message
    },
    trigger: 'change',
  }
}

/**
 * 金额校验：非负数字，最多两位小数
 * 合法：0、100、3.14、0.50（整数或最多 2 位小数）
 * 不合法：负数（-1）、超过 2 位小数（3.141）、空字符串、含非数字字符
 */
export function amount(message = '请输入正确的金额'): FormRule {
  return {
    validator: (v) => {
      if (isEmpty(v))
        return true
      return /^\d+(\.\d{1,2})?$/.test(String(v)) || message
    },
    trigger: 'change',
  }
}

/**
 * 小数校验：非负数字，最多指定位数小数（默认 2 位）
 * 合法：0、100、3.14、3.141（整数或最多 `places` 位小数）
 * 不合法：负数（-1）、小数位超过 `places`、空字符串、含非数字字符
 */
export function decimal(places = 2, message?: string): FormRule {
  return {
    validator: (v) => {
      if (isEmpty(v))
        return true
      const re = new RegExp(`^\\d+(\\.\\d{1,${places}})?$`)
      return re.test(String(v)) || (message || `最多${places}位小数`)
    },
    trigger: 'change',
  }
}

/** 合法身份证省份代码（前两位） */
const ID_CARD_PROVINCE_CODES = new Set([
  '11',
  '12',
  '13',
  '14',
  '15',
  '21',
  '22',
  '23',
  '31',
  '32',
  '33',
  '34',
  '35',
  '36',
  '37',
  '41',
  '42',
  '43',
  '44',
  '45',
  '46',
  '50',
  '51',
  '52',
  '53',
  '54',
  '61',
  '62',
  '63',
  '64',
  '65',
  '71',
  '81',
  '82',
  '91',
])

/** 校验日期合法性：年月日须对应真实日历日期（自动识别闰年、各月天数） */
function isValidDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31)
    return false
  const date = new Date(year, month - 1, day)
  return (
    date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day
  )
}

/**
 * 身份证号校验（支持 15 位与 18 位）
 * 合法：前两位为合法省份代码，出生日期为真实日历日期，18 位含正确的 GB 11643 校验码
 *   - 18 位：`yyyyMMdd` 出生日期 + 校验位，如 342425199408237918
 *   - 15 位：按 19xx 解析出生日期（2000 年前签发），无校验码
 * 不合法：省份代码非法、出生日期不真实、校验位错误、位数不是 15/18、含非数字字符
 */
export function idCard(message = '请输入正确的身份证号码'): FormRule {
  return {
    validator: (v) => {
      if (isEmpty(v))
        return true
      const s = String(v).trim()

      // 18 位身份证
      if (s.length === 18) {
        const upper = s.toUpperCase()
        if (!/^\d{17}[\dX]$/.test(upper))
          return message
        // 省份代码
        if (!ID_CARD_PROVINCE_CODES.has(upper.slice(0, 2)))
          return message
        // 出生日期 yyyyMMdd
        if (!isValidDate(Number(upper.slice(6, 10)), Number(upper.slice(10, 12)), Number(upper.slice(12, 14)))) {
          return message
        }
        // 校验码（GB 11643）
        const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
        const checkMap = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
        let sum = 0
        for (let i = 0; i < 17; i++) {
          sum += Number(upper[i]) * weights[i]
        }
        return checkMap[sum % 11] === upper[17] || message
      }

      // 15 位身份证（仅校验省份与出生日期，无校验码）
      if (s.length === 15) {
        if (!/^\d{15}$/.test(s))
          return message
        if (!ID_CARD_PROVINCE_CODES.has(s.slice(0, 2)))
          return message
        // 15 位出生日期 yyMMdd，15 位证均为 2000 年前签发，按 19xx 解析
        if (!isValidDate(1900 + Number(s.slice(6, 8)), Number(s.slice(8, 10)), Number(s.slice(10, 12)))) {
          return message
        }
        return true
      }

      return message
    },
    trigger: 'change',
  }
}

/**
 * 统一社会信用代码校验（参考 GB 32100-2015）
 * 合法：18 位，字符集不含 I/O/S/V/Z，第 17 位组织机构校验码（GB 11714）与第 18 位统一社会信用代码校验码（GB/T 17710）均正确，
 *   如 91340100MA2WEEDH6L
 * 不合法：位数非 18、含禁用字符（I/O/S/V/Z）、校验码错误、空字符串
 * 可选：`checkPrefix = true` 时还要求以 9134 或 9234 开头
 */
export function creditCode(message = '请输入正确的统一社会信用代码', checkPrefix = false): FormRule {
  return {
    validator: (v) => {
      if (isEmpty(v))
        return true

      const code = String(v).toUpperCase()

      // 可选：校验是否以 9134 或 9234 开头
      if (checkPrefix && !/^(9134|9234)/.test(code)) {
        return '统一社会信用代码须以 9134 或 9234 开头'
      }

      // 18 位，字符集不含 I O S V Z
      if (!/^[0-9A-HJ-NPQRTUWXY]{18}$/.test(code))
        return message

      // ---- 组织机构代码校验码（第 17 位，GB 11714）----
      // 本体为第 9~16 位（index 8~15），字符集含全部字母
      const orgChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      const orgWeights = [3, 7, 9, 10, 5, 8, 4, 2]
      let orgSum = 0
      for (let i = 0; i < 8; i++) {
        orgSum += orgWeights[i] * orgChars.indexOf(code[8 + i])
      }
      const orgKey = 11 - (orgSum % 11)
      // 校验码映射：10→X，11→0，其余为数字本身
      const orgCheck = orgKey === 10 ? 'X' : orgKey === 11 ? '0' : String(orgKey)
      if (orgCheck !== code[16])
        return message

      // ---- 统一社会信用代码校验码（第 18 位，GB/T 17710）----
      // 取前 17 位，字符集不含 I O S V Z
      const codeChars = '0123456789ABCDEFGHJKLMNPQRTUWXY'
      const codeWeights = [1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30, 28]
      let codeSum = 0
      for (let i = 0; i < 17; i++) {
        codeSum += codeWeights[i] * codeChars.indexOf(code[i])
      }
      let codeKey = 31 - (codeSum % 31)
      if (codeKey === 31)
        codeKey = 0
      if (codeChars[codeKey] !== code[17])
        return message

      return true
    },
    trigger: ['blur', 'change'] as const,
  }
}

/**
 * 用户名校验
 * 合法：字母、数字、下划线，长度 2~20 位，如 `admin_01`
 * 不合法：含中文/空格/连字符等特殊字符、长度小于 2 或大于 20、空字符串
 */
export function userName(message = '仅支持字母、数字、下划线，2-20 位'): FormRule {
  return {
    validator: (v) => {
      if (isEmpty(v))
        return true
      return /^\w{2,20}$/.test(String(v)) || message
    },
    trigger: 'change',
  }
}

/**
 * 编码校验
 * 合法：字母、数字、下划线、连字符，如 `user-name_1`
 * 不合法：含中文、空格、点号等特殊字符、空字符串
 */
export function code(message = '仅支持字母、数字、下划线、连字符'): FormRule {
  return {
    validator: (v) => {
      if (isEmpty(v))
        return true
      return /^[\w-]+$/.test(String(v)) || message
    },
    trigger: 'change',
  }
}

/**
 * 大写字母 + 数字 + 下划线 + 连字符校验（不允许小写）
 * 合法：大写字母、数字、下划线、连字符，如 `USER_NAME-1`
 * 不合法：含小写字母、中文、空格等字符、空字符串
 * 注意：需配合 xly-input 的 `to-upper-case` 或手动转大写使用
 */
export function upperAlpha(message = '字母必须大写'): FormRule {
  return {
    validator: (v) => {
      if (isEmpty(v))
        return true
      return /^[A-Z0-9_-]+$/.test(String(v)) || message
    },
    trigger: 'change',
  }
}
