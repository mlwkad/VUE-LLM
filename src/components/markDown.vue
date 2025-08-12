<template>
    <div class="markdown-body" v-html="renderedContent"></div>
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
    }
})

// 创建markdown-it实例并配置插件
const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true,
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`
            } catch (e) { console.log(e.message) }
        }
        return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
    }
})
    .use(mk)  // 启用KaTeX数学公式支持
    .use(breaks)  // 启用换行支持

// 配置链接在新窗口打开
const defaultRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options)
}
md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    tokens[idx].attrPush(['target', '_blank'])
    return defaultRender(tokens, idx, options, env, self)
}

// 计算渲染后的HTML, 用v-html解析富文本
const renderedContent = computed(() => {
    return md.render(props.content || '')
})
</script>

<style>
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
