import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// 引入highlight.js
import 'highlight.js/styles/vs2015.css'  // 使用VS Code的暗色主题
import hljs from 'highlight.js/lib/core'
import hljsVuePlugin from "@highlightjs/vue-plugin"

// 按需引入语言
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import json from 'highlight.js/lib/languages/json'

// 注册语言
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('json', json)

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(hljsVuePlugin)  // 使用highlight.js插件

app.mount('#app')