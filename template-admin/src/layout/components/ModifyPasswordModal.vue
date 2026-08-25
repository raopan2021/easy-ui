<script setup lang="ts">
/**
 * 修改当前登录用户密码弹窗
 *
 * 职责：原密码 / 新密码 / 确认新密码的表单校验与提交（调用 Mock 接口，接入后端后替换）
 */
import { custom, required } from '@raopan/easy-ui'
import { modifyMyPassword } from '@/api/login'
import { useBoolean } from '@/layout/hooks/useBoolean'
import { useUserStoreHook } from '@/store/modules/user'
import { showFailureDialog } from '@/utils/message'
import { REGEXP_PWD } from '@/views/login/utils/rule'

defineOptions({ name: 'ModifyPasswordModal' })

// ==================== 入参 / 出参 ====================
const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'success'): void
}>()

// ==================== 表单 ====================
const formRef = ref()
const { bool: submitLoading, setTrue: startSubmitLoad, setFalse: stopSubmitLoad } = useBoolean()

/** 表单字段值类型 */
interface FormShape {
  oldPw: string
  newPw: string
  confirmPw: string
}

/** 表单初始值 */
function createDefaultForm(): FormShape {
  return { oldPw: '', newPw: '', confirmPw: '' }
}

const formData = reactive<FormShape>(createDefaultForm())

/** 表单校验规则 */
const formRules: Record<string, any> = {
  oldPw: [required('请输入原密码')],
  newPw: [
    required('请输入新密码'),
    custom(
      v => !v || REGEXP_PWD.test(String(v)) || '密码须同时包含字母和数字，可含常见符号，长度为 6-20 位',
      'change',
    ),
  ],
  confirmPw: [
    required('请再次输入新密码'),
    custom(
      (v, formData) => !v || v === formData?.newPw || '两次输入的新密码不一致',
      'change',
    ),
  ],
}

// ==================== 弹窗生命周期 ====================
/** 打开时清空表单 */
watch(
  () => props.visible,
  (val) => {
    if (val) {
      Object.assign(formData, createDefaultForm())
      formRef.value?.clearValidate()
    }
  },
)

// ==================== 提交 ====================
async function handleConfirm() {
  const isValid = await formRef.value?.validate().catch(() => false)
  if (!isValid)
    return
  startSubmitLoad()
  try {
    const res = await modifyMyPassword(formData.oldPw, formData.newPw)
    if (res.retCode === 0) {
      ElMessage.success('密码修改成功，请重新登录')
      emit('success')
      emit('update:visible', false)
      // 密码已变更，重新登录
      useUserStoreHook().logOut()
    }
    else {
      showFailureDialog(res.msg, handleConfirm, 'modifyPassword')
    }
  }
  catch {
    showFailureDialog('系统异常，请稍后重试', handleConfirm, 'modifyPassword')
  }
  finally {
    stopSubmitLoad()
  }
}

function handleCancel() {
  emit('update:visible', false)
}
</script>

<template>
  <EasyModal :model-value="visible" title="修改密码" width="480px" :confirm-loading="submitLoading"
    @update:model-value="emit('update:visible', $event)" @confirm="handleConfirm" @cancel="handleCancel">
    <EasyForm ref="formRef" :model="formData" :rules="formRules" label-width="110px">
      <EasyFormItem label="原密码" prop="oldPw">
        <EasyInput v-model="formData.oldPw" type="password" placeholder="请输入原密码" :maxlength="20" />
      </EasyFormItem>
      <EasyFormItem label="新密码" prop="newPw">
        <EasyInput v-model="formData.newPw" type="password" placeholder="请输入新密码" :maxlength="20" />
      </EasyFormItem>
      <EasyFormItem label="确认新密码" prop="confirmPw">
        <EasyInput v-model="formData.confirmPw" type="password" placeholder="请再次输入新密码" :maxlength="20" />
      </EasyFormItem>
      <div class="password-tip">
        新密码须同时包含字母和数字，可含常见符号，长度为 6-20 位
      </div>
    </EasyForm>
  </EasyModal>
</template>

<style lang="scss" scoped>
.password-tip {
  margin-top: -8px;
  padding-left: 110px;
  font-size: 12px;
  color: #909399;
  line-height: 1.6;
}
</style>
