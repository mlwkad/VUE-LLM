import request from '../request.ts'

export const login = (data: any) => {
    return request({
        url: '/api/user/login',
        method: 'post',
        data,
    });
};

export const getUserInfo = () => {
    return request({
        url: '/api/user/info',
        method: 'get',
    });
};

export  const updateUserInfo = (data: any) => {
    return request({
        url: '/api/user/info',
        method: 'put',
        data,
    })
}
