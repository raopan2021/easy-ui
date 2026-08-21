import type { FormRules } from 'element-plus'

/** 密码正则（须同时包含字母和数字，可含常见符号，长度6-20位，与修改密码校验一致） */
export const REGEXP_PWD = /^(?=.*[a-z])(?=.*\d)[\x21-\x7E]{6,20}$/i

/** 登录校验 */
const loginRules = reactive<FormRules>({
  password: [
    {
      validator: (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'))
        }
        else if (!REGEXP_PWD.test(value)) {
          callback(
            new Error('密码须同时包含字母和数字，可含常见符号，长度为6-20位'),
          )
        }
        else {
          callback()
        }
      },
      trigger: 'change',
    },
  ],
  validateCode: [
    {
      required: true,
      message: '请输入验证码',
      trigger: 'change',
    },
  ],
})

export { loginRules }
