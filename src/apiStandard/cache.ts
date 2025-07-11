export const cacheManager = {
    // 获取缓存的 ETag
    getETag(url: string) {
        return localStorage.getItem(`etag_${url}`) || ''
    },
    // 存储 ETag
    setETag(url: string, etag: string) {
        localStorage.setItem(`etag_${url}`, etag)
    },
    // 获取缓存的 Last-Modified
    getLastModified(url: string) {
        return localStorage.getItem(`lastModified_${url}`) || ''
    },
    // 存储 Last-Modified
    setLastModified(url: string, lastModified: string) {
        localStorage.setItem(`lastModified_${url}`, lastModified)
    },
    // 存储响应数据（可选）
    setResponseData(url: string, data: any) {
        localStorage.setItem(`responseData_${url}`, JSON.stringify(data))
    },
    // 获取响应数据（可选）
    getResponseData(url: string) {
        const data = localStorage.getItem(`responseData_${url}`)
        return data ? JSON.parse(data) : null
    },
}