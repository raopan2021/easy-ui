<template>
  <div class="coming-soon">
    <div class="coming-soon__icon">
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="38" stroke="var(--el-color-primary-light-5)" stroke-width="2" fill="none" />
        <path
          d="M40 22v20l14 8"
          stroke="var(--el-color-primary)"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle cx="40" cy="40" r="5" fill="var(--el-color-primary-light-3)" opacity="0.3">
          <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
    <h2 class="coming-soon__title">
      功能开发中
    </h2>
    <p class="coming-soon__desc">
      该模块正在抓紧开发，敬请期待
    </p>
    <div class="coming-soon__meta">
      <el-tag type="info" effect="plain">
        状态：规划中
      </el-tag>
      <el-tag type="warning" effect="plain">
        预计上线：2026 Q3
      </el-tag>
    </div>
  </div>
</template>

<style scoped lang="scss">
.coming-soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40px 20px;
  text-align: center;

  .coming-soon__icon {
    margin-bottom: 24px;
  }

  .coming-soon__title {
    font-size: 22px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 12px;
  }

  .coming-soon__desc {
    font-size: 15px;
    color: var(--el-text-color-secondary);
    margin: 0 0 24px;
  }

  .coming-soon__meta {
    display: flex;
    gap: 12px;
  }
}
</style>
