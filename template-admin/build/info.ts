import type { Plugin } from "vite";
import type { Duration } from "dayjs/plugin/duration";
import gradient from "gradient-string";
import { getPackageSize } from "./utils";
import dayjs, { type Dayjs } from "dayjs";
import duration from "dayjs/plugin/duration";
import boxen, { type Options as BoxenOptions } from "boxen";
dayjs.extend(duration);

const welcomeMessage = gradient(["cyan", "magenta"]).multiline(
  `EasyUI 管理后台模板 Copyright 2026-present`
);

const boxenOptions: BoxenOptions = {
  padding: 0.5,
  borderColor: "cyan",
  borderStyle: "round"
};

/** 格式化时长：分钟为 0 则不显示 */
function formatDuration(d: Duration): string {
  const minutes = Math.floor(d.asMinutes());
  const seconds = d.seconds();
  const ms = d.milliseconds();
  return minutes > 0
    ? `${minutes}分 ${seconds}秒 ${ms}`
    : `${seconds}秒 ${ms}`;
}

export function viteBuildInfo(): Plugin {
  let config: { command: string };
  let startTime: Dayjs;
  let transformEndTime: Dayjs;
  let endTime: Dayjs;
  let outDir: string;
  return {
    name: "vite:buildInfo",
    // config 是插件生命周期中最先触发的钩子，尽可能贴近 pnpm run build 的实际起始时间
    config(_userConfig, { command }) {
      if (command === "build") {
        startTime = dayjs(new Date());
      }
    },
    configResolved(resolvedConfig) {
      config = resolvedConfig;
      outDir = resolvedConfig.build?.outDir ?? "dist";
    },
    buildStart() {
      console.log(boxen(welcomeMessage, boxenOptions));
    },
    buildEnd() {
      if (config.command === "build") {
        transformEndTime = dayjs(new Date());
      }
    },
    closeBundle() {
      if (config.command === "build") {
        getPackageSize({
          folder: outDir,
          callback: (size: string) => {
            endTime = dayjs(new Date());
            const transformTime = formatDuration(
              dayjs.duration(transformEndTime.diff(startTime))
            );
            const renderTime = formatDuration(
              dayjs.duration(endTime.diff(transformEndTime))
            );
            const totalTime = formatDuration(
              dayjs.duration(endTime.diff(startTime))
            );
            console.log(
              boxen(
                gradient(["cyan", "magenta"]).multiline(
                  `恭喜打包完成

模块转换 ${transformTime}
分块渲染 ${renderTime}
----------------
总用时 ${totalTime}

打包后的大小为 ${size}`
                ),
                boxenOptions
              )
            );
          }
        });
      }
    }
  };
}
