// 进阶优化建议
// 请求取消：添加请求取消功能（AbortController），避免重复请求。
// 请求重试：对网络波动导致的失败请求自动重试。
// 请求队列：对相同接口的并发请求进行排队处理。
// 响应数据转换：统一处理接口返回的数据格式。
import axios from 'axios'
import { cacheManager } from './cache.ts' // 缓存工具

// 创建 axios 实例
const request = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // 从环境变量获取 API 基础路径
    timeout: 10000, // 请求超时时间
    withCredentials: true, // 跨域请求时发送 cookie
})

// 请求拦截器
request.interceptors.request.use(
    (config) => {
        // 添加认证头
        // token要搞一下

        // 添加缓存请求头（协商缓存）
        const { url } = config
        if (url) {
            const etag = cacheManager.getETag(url)
            const lastModified = cacheManager.getLastModified(url)
            if (etag) config.headers['If-None-Match'] = etag
            if (lastModified) config.headers['If-Modified-Since'] = lastModified
        }
        config.headers['Content-Type'] = 'application/json'

        return config
    },
    (error) => {
        console.error('请求错误:', error)
        return Promise.reject(error)
    }
)

// 响应拦截器
request.interceptors.response.use(
    (response) => {
        // 存储缓存信息（协商缓存）
        const { url } = response.config
        const { headers } = response
        if (url && headers.etag) cacheManager.setETag(url, headers.etag)
        if (url && headers['last-modified']) cacheManager.setLastModified(url, headers['last-modified'])

        // if (response.status === 200) return response.data
        // else return Promise.reject(new Error(response.data.message || '操作失败'))
        return response.data
    },
    (error) => {
        // 处理 HTTP 状态码
        const status = error.response?.status
        switch (status) {
            case 401:
                console.log('身份验证失败，请重新登录')
                window.location.href = '/login'
                break
            case 403:
                console.log('权限不足，无法访问')
                break
            case 404:
                console.log('请求资源不存在')
                break
            case 500:
                console.log('服务器内部错误')
                break
            default:
                console.log('网络请求失败，请稍后重试')
        }
        return Promise.reject(error)
    }
)

export default request