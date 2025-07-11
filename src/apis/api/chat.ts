import request from "../request"

// 讯飞api
export default function chatWithXunfei(data: any) {
   return request({
      method: 'post',
      url: '/api/chat',
      data
   })
};

// 新的流式处理函数
export function createStreamConnection(message: string) {
   // 直接返回 EventSource 对象,该API必须搭配get请求
   // encodeURIComponent:将message里的￥&？符号转换成对应16进制编码
   return new EventSource(`/api/chat/stream?message=${encodeURIComponent(message)}`);
}

// 是否联网搜索
export function onlineSearch(isSure: boolean) {
   return request({
      method: 'get',
      url: `/api/chat/onlineSearch?isSure=${isSure}`
   })
}

// 获取所有历史对话
export function getAllContent() {
   return request({
      method: 'get',
      url: '/api/chat/getAllContent'
   })
}

// 添加对话
export function addToAllContent(data: any) {
   return request({
      method: 'post',
      url: '/api/chat/addToAllContent',
      data
   })
}

// 删除对话
export function deleteContent(id: any) {
   return request({
      method: 'delete',
      url: `/api/chat/deleteContent/${id}`
   })
}

// 获取具体对话
export function getContent(id: any) {
   return request({
      method: 'get',
      url: `/api/chat/getContent?id=${id}`
   })
}

// 更新对话
export function updateContent(data: any) {
   return request({
      method: 'put',
      url: '/api/chat/updateContent',
      data
   })
}
