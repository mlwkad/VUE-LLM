<template>
    <div class="markdown-body" :class="containerClass" v-html="renderedContent"></div>
    <!-- :class="[ containerClass, { 'dark-mode': isDark } ]"
    :style="{ 
      color: textColor, 
      fontSize: `${fontSize}px`,
      maxWidth: isWide ? '1200px' : '800px'
    }"  动态style -->
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import MarkdownIt from 'markdown-it'
import mk from 'markdown-it-katex'
import breaks from 'markdown-it-br'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-light.css'
import 'katex/dist/katex.min.css'

const props = defineProps({
    content: {
        type: String,
        required: true
    },
    containerClass: {
        type: String,
        default: ''
    },
    codeClass: {
        type: String,
        default: 'hljs'
    }
})

// 创建markdown-it实例并配置插件
const md = new MarkdownIt({
    html: true,  // 解析html
    linkify: true,  // 自动链接
    typographer: true,  // 智能引号
    breaks: true,  // 换行
    highlight: function (str, lang) {
        // 原理: 自动检测语言(```语言   代码```), 如果支持, 则使用highlight.js相应代码高亮, 否则使用默认样式
        if (lang && hljs.getLanguage(lang)) {
            try {
                return `<pre class="${props.codeClass}"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`
            } catch (e) { console.log(e.message) }
        }
        return `<pre class="${props.codeClass}"><code>${md.utils.escapeHtml(str)}</code></pre>`
    }
})
    .use(mk)  // 启用KaTeX数学公式支持
    .use(breaks)  // 启用换行支持

// 配置链接在新窗口打开
const defaultRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options)
}
md.renderer.rules.link_open = function (tokens, idx, options, env, self) { // 重写链接打开规则
    tokens[idx].attrPush(['target', '_blank'])
    return defaultRender(tokens, idx, options, env, self)
}

// 计算渲染后的HTML, 用v-html解析富文本
const renderedContent = computed(() => {
    return md.render(props.content || '')
})
</script>

<!-- 不设置样式隔离,获取父组件样式 -->
<style scoped>
.markdown-body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    line-height: 1.6;
    padding: 20px;
    color: #24292e;
}

.markdown-body code {
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    /* background-color: rgba(27, 31, 35, 0.05); */
    border-radius: 3px;
    padding: 0.2em 0.4em;
}

.markdown-body pre {
    background-color: #ededed;
    border-radius: 12px;
    padding: 16px;
    overflow: auto;
}

.hljs {
    padding: 0;
    background: transparent;
}
</style>
