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
    }
}