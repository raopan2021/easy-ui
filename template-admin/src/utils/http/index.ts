import type { AxiosInstance, AxiosRequestConfig, CustomParamsSerializer } from 'axios'
import type {
  PureHttpError,
  PureHttpRequestConfig,
  PureHttpResponse,
  RequestMethods,
} from './types.d'
import Axios from 'axios'
import { stringify } from 'qs'
import getToken from '@/utils/token'
import { cleanObject } from '../format'
import { handleTokenExpired } from '../tokenExpired'

// 相关配置请参考：www.axios-js.com/zh-cn/docs/#axios-request-config-1
const defaultConfig: AxiosRequestConfig = {
  // 请求超时时间
  timeout: 30000,
  // 接口基础路径
  baseURL: '/api',
  headers: {
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  // 数组格式参数序列化（https://github.com/axios/axios/issues/5142）
  paramsSerializer: {
    serialize: stringify as unknown as CustomParamsSerializer,
  },
}

class PureHttp {
  constructor() {
    this.httpInterceptorsRequest()
    this.httpInterceptorsResponse()
  }

  /** 初始化配置对象 */
  private static initConfig: PureHttpRequestConfig = {}

  /** 保存当前`Axios`实例对象 */
  private static axiosInstance: AxiosInstance = Axios.create(defaultConfig)

  /** 请求拦截 */
  private httpInterceptorsRequest(): void {
    PureHttp.axiosInstance.interceptors.request.use(
      async (config: PureHttpRequestConfig): Promise<any> => {
        // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
        if (typeof config.beforeRequestCallback === 'function') {
          config.beforeRequestCallback(config)
          return config
        }
        if (PureHttp.initConfig.beforeRequestCallback) {
          PureHttp.initConfig.beforeRequestCallback(config)
          return config
        }
        /** 请求白名单，放置一些不需要`token`的接口 */
        const whiteList = ['/refresh-token', '/login']
        if (whiteList.some(url => config.url.endsWith(url))) {
          return config
        }

        // 每次请求动态生成 token
        const token = await getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // 全局过滤请求参数中的 null / undefined / 空字符串
        // 跳过 FormData / URLSearchParams 等二进制或特殊结构，避免被转成空对象
        if (config.data && !(config.data instanceof FormData)) {
          config.data = cleanObject(config.data)
        }
        if (
          config.params
          && !(config.params instanceof URLSearchParams)
          && typeof config.params === 'object'
        ) {
          config.params = cleanObject(config.params)
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      },
    )
  }

  /** 响应拦截 */
  private httpInterceptorsResponse(): void {
    const instance = PureHttp.axiosInstance
    instance.interceptors.response.use(
      (response: PureHttpResponse) => {
        const $config = response.config
        // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
        if (typeof $config.beforeResponseCallback === 'function') {
          $config.beforeResponseCallback(response)
          return response.data
        }
        if (PureHttp.initConfig.beforeResponseCallback) {
          PureHttp.initConfig.beforeResponseCallback(response)
          return response.data
        }
        // 全局处理 token 过期
        const res = response.data
        if (res && res.retCode === 1 && res.msg === 'token已过期') {
          handleTokenExpired()
          return Promise.reject(res)
        }
        return response.data
      },
      (error: PureHttpError) => {
        const $error = error
        $error.isCancelRequest = Axios.isCancel($error)
        // 全局处理 token 过期（HTTP 非 2xx 时响应体在 error.response.data）
        const errRes = $error.response?.data as { retCode?: number, msg?: string } | undefined
        if (errRes && errRes.retCode === 1 && errRes.msg === 'token已过期') {
          handleTokenExpired()
          return Promise.reject($error)
        }
        // 所有的响应异常 区分来源为取消请求/非取消请求
        return Promise.reject($error)
      },
    )
  }

  /** 通用请求工具函数 */
  public request<T>(
    method: RequestMethods,
    url: string,
    param?: AxiosRequestConfig,
    axiosConfig?: PureHttpRequestConfig,
  ): Promise<T> {
    const config = {
      method,
      url,
      ...param,
      ...axiosConfig,
    } as PureHttpRequestConfig

    // 单独处理自定义请求/响应回调
    return new Promise((resolve, reject) => {
      PureHttp.axiosInstance
        .request(config)
        .then((response: undefined) => {
          resolve(response)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  /** 单独抽离的`post`工具函数 */
  public post<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    config?: PureHttpRequestConfig,
  ): Promise<T> {
    return this.request<T>('post', url, params, config)
  }

  /** 单独抽离的`get`工具函数 */
  public get<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    config?: PureHttpRequestConfig,
  ): Promise<T> {
    return this.request<T>('get', url, params, config)
  }
}

export const http = new PureHttp()
