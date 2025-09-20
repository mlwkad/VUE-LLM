import request from '../request.ts'
import { setAccessToken, clearAccessToken } from '../request.ts'

export const login = async (data: any) => {
    return request({
        url: '/api/user/login',
        method: 'post',
        data,
    }).then((res: any) => {
        // 假设后端返回 { token, user } 或 { accessToken, ... }
        const token = res?.token || res?.accessToken
        if (token) setAccessToken(token)
        return res
    })
}

export const getUserInfo = () => {
    return request({
        url: '/api/user/info',
        method: 'get',
    })
}

export const updateUserInfo = (data: any) => {
    return request({
        url: '/api/user/info',
        method: 'put',
        data,
    })
}

// 登出：清空本地 token
export const logout = async () => {
    clearAccessToken()
    // 可选：通知后端登出
    return request({
        url: '/api/user/logout',
        method: 'post',
    }).catch(() => {
        // 即使后端登出失败，也清空本地 token
    })
}
