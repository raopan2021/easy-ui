/**
 * 随机数据生成工具（供"填写假数据"等调试/测试场景复用）
 */

/** 随机字母数字字符串 */
export function randomStr(len = 6) {
  return Math.random()
    .toString(36)
    .slice(2, 2 + len)
}

/** 常用中文名字用字 */
const NAME_CHARS = [
  '伟',
  '芳',
  '娜',
  '敏',
  '静',
  '丽',
  '强',
  '磊',
  '军',
  '洋',
  '勇',
  '艳',
  '杰',
  '娟',
  '涛',
  '明',
  '超',
  '秀兰',
  '霞',
  '平',
  '刚',
  '桂英',
  '文',
  '辉',
  '力',
  '梅',
  '鑫',
  '玉兰',
  '亮',
  '华',
  '浩',
  '婷',
  '凯',
  '欣',
  '宇',
  '琳',
  '晨',
  '雪',
  '思',
  '睿',
]
/** 随机中文姓名（纯中文，不含英文/数字） */
export function randomName() {
  const surnames = ['张', '李', '王', '赵', '陈', '刘', '杨', '黄', '周', '吴']
  const surname = surnames[Math.floor(Math.random() * surnames.length)]
  const givenLen = Math.random() > 0.5 ? 1 : 2 // 单名或双名
  let given = ''
  for (let i = 0; i < givenLen; i++) {
    given += NAME_CHARS[Math.floor(Math.random() * NAME_CHARS.length)]
  }
  return surname + given
}

/** 常用公司字号用字 */
const COMPANY_WORDS = [
  '凯多',
  '盛峰',
  '华信',
  '中汇',
  '国泰',
  '恒达',
  '宏远',
  '嘉禾',
  '瑞达',
  '鑫源',
  '德正',
  '广泰',
  '启航',
  '新源',
  '致远',
  '博雅',
  '海纳',
  '天晟',
  '纵横',
  '蓝海',
]
/** 公司行业词（用于生成企业名称） */
const COMPANY_INDUSTRIES = ['建筑工程', '科技', '贸易', '物流', '建材', '机械制造', '信息技术', '新能源', '环保', '建设']
/** 随机企业名称（地区 + 字号 + 行业 + 组织形式） */
export function randomCompanyName() {
  const regions = ['安徽', '合肥', '芜湖', '蚌埠', '阜阳']
  const region = regions[Math.floor(Math.random() * regions.length)]
  const word = COMPANY_WORDS[Math.floor(Math.random() * COMPANY_WORDS.length)]
  const industry = COMPANY_INDUSTRIES[Math.floor(Math.random() * COMPANY_INDUSTRIES.length)]
  const forms = ['有限公司', '有限责任公司', '股份有限公司']
  const form = forms[Math.floor(Math.random() * forms.length)]
  return `${region}${word}${industry}${form}`
}

/** 随机手机号（11位，以常见号段开头） */
const phonePrefixes = [
  '130',
  '131',
  '132',
  '133',
  '134',
  '135',
  '136',
  '137',
  '138',
  '139',
  '150',
  '151',
  '152',
  '153',
  '155',
  '156',
  '157',
  '158',
  '159',
  '180',
  '181',
  '182',
  '183',
  '184',
  '185',
  '186',
  '187',
  '188',
  '189',
  '191',
  '198',
  '199',
]
export function randomPhone() {
  return phonePrefixes[Math.floor(Math.random() * phonePrefixes.length)] + String(Math.random()).slice(2, 10)
}

/** 随机金额（默认 100 ~ 5000，保留两位小数） */
export function randomMoney(min = 100, max = 5000) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100
}

/** 合法身份证省份代码（前两位） */
const ID_CARD_PROVINCE_CODES = [
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
]
/**
 * 随机身份证号（18位，能通过 idCard 校验）
 * 前6位地区码（含合法省份）+ 8位合法出生日期 + 3位顺序码 + 1位 GB 11643 校验位
 */
export function randomIdCard() {
  const province = ID_CARD_PROVINCE_CODES[Math.floor(Math.random() * ID_CARD_PROVINCE_CODES.length)]
  const area = province + String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  const year = 1970 + Math.floor(Math.random() * 30)
  const month = Math.floor(Math.random() * 12) + 1
  const day = Math.min(Math.floor(Math.random() * 28) + 1, new Date(year, month, 0).getDate())
  const birth = `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`
  const seq = String(Math.floor(Math.random() * 999)).padStart(3, '0')
  const base = `${area}${birth}${seq}`
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkMap = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += Number(base[i]) * weights[i]
  }
  return `${base}${checkMap[sum % 11]}`
}

/** 统一社会信用代码字符集（不含 I O S V Z） */
const CREDIT_CODE_CHARS = '0123456789ABCDEFGHJKLMNPQRTUWXY'
/** 随机统一社会信用代码（18位，按 GB 32100 算法生成合法校验位） */
export function randomCreditCode() {
  const pick = (chars: string, n: number) =>
    Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('')

  // 前8位（登记管理部门/机构类别/行政区划等）+ 第9~16位组织机构代码本体（统一用受限字符集，保证两套校验可索引）
  const head = pick(CREDIT_CODE_CHARS, 8)
  const orgBody = pick(CREDIT_CODE_CHARS, 8)

  // 第17位：组织机构代码校验码（GB 11714）
  const orgWeights = [3, 7, 9, 10, 5, 8, 4, 2]
  let orgSum = 0
  for (let i = 0; i < 8; i++) {
    orgSum += orgWeights[i] * CREDIT_CODE_CHARS.indexOf(orgBody[i])
  }
  let orgKey = 11 - (orgSum % 11)
  const orgCheck = orgKey === 10 ? 'X' : orgKey === 11 ? '0' : String(orgKey)

  // 第18位：统一社会信用代码校验码（GB/T 17710）
  const first17 = `${head}${orgBody}${orgCheck}`
  const codeWeights = [1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30, 28]
  let codeSum = 0
  for (let i = 0; i < 17; i++) {
    codeSum += codeWeights[i] * CREDIT_CODE_CHARS.indexOf(first17[i])
  }
  let codeKey = 31 - (codeSum % 31)
  if (codeKey === 31)
    codeKey = 0
  const codeCheck = CREDIT_CODE_CHARS[codeKey]

  return `${first17}${codeCheck}`
}
