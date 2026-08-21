# EasyUI 管理后台模板

基于：

- vue-pure-admin 精简版（非国际化版本） (https://github.com/pure-admin/pure-admin-thin)
- EaseUI/ease-ui 方便 CRUD (https://gitee.com/yun_hua_admin/ease-ui)

## 功能特性

- 登录页：Mock 账号 `admin` / `admin123`，无需后端即可体验
- 首页：欢迎页 + 快速入口
- CRUD 示例：SearchForm 搜索 + Table 列表 + 新增/编辑弹窗 + 删除（本地 Mock 数据）
- 异常页面：403 / 404 / 500

## 目录说明

```
src/
├── api/           # 接口层（当前为本地 Mock，替换为真实接口即可）
│   ├── login/     # 登录 / 验证码 / 修改密码
│   └── example/   # CRUD 示例
├── views/
│   ├── home/      # 首页（欢迎页）
│   ├── example/   # CRUD 示例页面
│   ├── login/     # 登录页
│   └── error/     # 异常页面
└── router/modules/ # 路由配置（home / example / error）
```

## 接入真实后端

将 `src/api` 下的 Mock 实现替换为 HTTP 调用即可，各文件内已注释替换示例。

## 启动

```bash
pnpm install
pnpm dev
```
