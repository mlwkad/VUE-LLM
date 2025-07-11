import axios from 'axios'

const request = axios.create()

request.interceptors.request.use(
    config => {
        config.headers['Content-Type'] = 'application/json'
        return config
    },
    error => Promise.reject(error)
)

request.interceptors.response.use(
    response => response.data,
    error => Promise.reject(error)
)

export default request

