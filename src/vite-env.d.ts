/// <reference types="vite/client" />
// 无法找到模块“xxx.vue”的声明文件。“d:/xxx.vue”隐式拥有 "any" 类型
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}