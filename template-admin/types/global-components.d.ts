// 全局属性和自定义组件声明

declare module "vue" {
  /** 自定义全局组件获得 Volar 提示 */
  export interface GlobalComponents {
    IconifyIconOffline: (typeof import("../src/components/ReIcon"))["IconifyIconOffline"];
    IconifyIconOnline: (typeof import("../src/components/ReIcon"))["IconifyIconOnline"];
    FontIcon: (typeof import("../src/components/ReIcon"))["FontIcon"];
  }

  interface ComponentCustomProperties {
    $storage: ResponsiveStorage;
    $message: (typeof import("element-plus"))["ElMessage"];
    $notify: (typeof import("element-plus"))["ElNotification"];
    $msgbox: (typeof import("element-plus"))["ElMessageBox"];
    $messageBox: (typeof import("element-plus"))["ElMessageBox"];
    $alert: (typeof import("element-plus"))["ElMessageBox"]["alert"];
    $confirm: (typeof import("element-plus"))["ElMessageBox"]["confirm"];
    $prompt: (typeof import("element-plus"))["ElMessageBox"]["prompt"];
    $loading: (typeof import("@raopan/easy-ui"))["easy"]["$loading"];
  }
}

export {};
