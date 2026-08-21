<script setup lang="ts">
import type { FormInstance } from 'element-plus'
import { Lock, UserFilled as User } from '@element-plus/icons-vue'
import { debounce } from '@pureadmin/utils'
import { useEventListener } from '@vueuse/core'
import { getLoginValidateCode } from '@/api/login'
import { useRenderIcon } from '@/components/ReIcon/src/hooks'
import { useDataThemeChange } from '@/layout/hooks/useDataThemeChange'
import { useLayout } from '@/layout/hooks/useLayout'
import { useNav } from '@/layout/hooks/useNav'
import { useViewTransition } from '@/layout/hooks/useViewTransition'
import { getTopMenu, initRouter } from '@/router/utils'
import { useUserStoreHook } from '@/store/modules/user'
import { message } from '@/utils/message'
import { makeIcon } from '@/utils/svg-icons'
/**
 * 登录页
 *
 * 流程：
 * 1. 加载图形验证码（点击图片可刷新，Mock 生成）
 * 2. 用户输入账号/密码/验证码后回车或点击登录
 * 3. 调用 userStore.loginByUsername（Mock：admin / admin123），成功后跳转首菜单
 * 4. 失败：清空验证码 + 重新加载
 */
import Motion from './utils/motion'

import { loginRules } from './utils/rule'
import { avatar } from './utils/static'

defineOptions({ name: 'Login' })
const dayIcon = makeIcon('day')
const darkIcon = makeIcon('dark')

// ==================== 路由 / 状态 ====================
const router = useRouter()
const loading = ref(false)
const disabled = ref(false)
const ruleFormRef = ref<FormInstance>()

// ==================== 主题 / 布局初始化 ====================
const { initStorage } = useLayout()
initStorage()

const { dataTheme, overallStyle, dataThemeChange } = useDataThemeChange()
dataThemeChange(overallStyle.value)

// ==================== 切换主题 ====================
const { recordPos, toggle: toggleTheme } = useViewTransition(dataTheme)
async function onThemeChange() {
  await toggleTheme()
  dataThemeChange()
}
const { title } = useNav()

// ==================== 表单 ====================
/** 默认登录账号（模板 Mock 账号） */
const ruleForm = reactive({
  username: 'admin',
  password: 'admin123',
  validateCode: '',
})

/** 图形验证码（Blob URL） */
const captchaImg = ref('')

/** 加载图形验证码 */
function getCaptcha() {
  getLoginValidateCode({ now: new Date().toString() })
    .then((blob) => {
      if (captchaImg.value)
        URL.revokeObjectURL(captchaImg.value)
      captchaImg.value = URL.createObjectURL(blob)
    })
    .catch(() => {
      captchaImg.value = ''
    })
}

onMounted(getCaptcha)

// ==================== 登录 ====================
/**
 * 登录动作
 * @param formEl el-form 实例（用于触发校验）
 */
async function onLogin(formEl: FormInstance | undefined) {
  if (!formEl)
    return
  await formEl.validate((valid) => {
    if (!valid)
      return
    loading.value = true
    useUserStoreHook()
      .loginByUsername({
        username: ruleForm.username,
        password: ruleForm.password,
        validateCode: ruleForm.validateCode,
      })
      .then((res) => {
        if (res.retCode === 0) {
          // 登录成功：拉取动态路由 + 跳转首菜单
          return initRouter().then(() => {
            disabled.value = true
            router
              .push(getTopMenu(true).path)
              .then(() => message('登录成功', { type: 'success' }))
              .finally(() => (disabled.value = false))
          })
        }
        else {
          message(res.msg || '登录失败', { type: 'error' })
          ruleForm.validateCode = ''
          getCaptcha()
        }
      })
      .catch(() => {
        ruleForm.validateCode = ''
        getCaptcha()
      })
      .finally(() => (loading.value = false))
  })
}

/** 登录按钮防抖（1s） */
const immediateDebounce: any = debounce(formRef => onLogin(formRef), 1000, true)

/** 全局回车键触发登录 */
useEventListener(document, 'keydown', ({ code }) => {
  if (['Enter', 'NumpadEnter'].includes(code) && !disabled.value && !loading.value) {
    immediateDebounce(ruleFormRef.value)
  }
})
</script>

<template>
  <div class="login-page">
    <!-- 主题切换 -->
    <div class="theme-switch flex-c absolute right-5 top-3" @pointerdown="recordPos">
      <el-switch
        :model-value="dataTheme" inline-prompt :active-icon="dayIcon" :inactive-icon="darkIcon"
        @change="onThemeChange"
      />
    </div>

    <div class="login-box">
      <div class="login-card">
        <Motion>
          <div class="title">
            <img :src="avatar" class="avatar">
            <h2 class="outline-hidden">
              {{ title }}
            </h2>
          </div>
          <p class="subtitle">
            请使用模板账号登录体验（admin / admin123）
          </p>
        </Motion>

        <el-form ref="ruleFormRef" :model="ruleForm" :rules="loginRules" size="large">
          <Motion :delay="100">
            <el-form-item prop="username">
              <el-input v-model="ruleForm.username" clearable placeholder="账号" :prefix-icon="useRenderIcon(User)" />
            </el-form-item>
          </Motion>

          <Motion :delay="150">
            <el-form-item prop="password">
              <el-input
                v-model="ruleForm.password" clearable show-password placeholder="密码"
                :prefix-icon="useRenderIcon(Lock)"
              />
            </el-form-item>
          </Motion>

          <Motion :delay="200">
            <el-form-item prop="validateCode">
              <div class="flex w-full gap-2">
                <el-input v-model="ruleForm.validateCode" placeholder="验证码" class="flex-1" />
                <img
                  v-if="captchaImg" :src="captchaImg" class="h-10 cursor-pointer rounded" @click="getCaptcha"
                  @error="captchaImg = ''"
                >
                <div
                  v-else
                  class="flex h-10 w-auto p-3 cursor-pointer items-center justify-center rounded bg-gray-100 text-xs text-gray-400 dark:bg-gray-700"
                  @click="getCaptcha"
                >
                  加载失败，点击重试
                </div>
              </div>
            </el-form-item>
          </Motion>

          <Motion :delay="250">
            <el-button
              class="w-full mt-4!" size="default" type="primary" :loading="loading" :disabled="disabled"
              @click="onLogin(ruleFormRef)"
            >
              登录
            </el-button>
          </Motion>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--el-bg-color);
}

.login-box {
  width: 100vw;
  height: 100vh;
  max-width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  overflow: hidden;
}

.login-card {
  width: 380px;
  padding: 40px 36px;
  border-radius: 12px;
  background: var(--el-bg-color-overlay);
  box-shadow: var(--app-card-shadow-lg);
}

.title {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 56px;
  height: 56px;
}

.subtitle {
  margin: 12px 0 24px;
  font-size: 13px;
  color: var(--app-text-secondary);
}

.login-card h2 {
  text-transform: uppercase;
  margin: 0;
  color: var(--app-text-primary);
  font:
    bold 200% Consolas,
    Monaco,
    monospace;
}
</style>

<style lang="scss" scoped>
::deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0;
}
</style>
