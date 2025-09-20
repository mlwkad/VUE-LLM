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
import DOMPurify from 'dompurify'

const props = defineProps({
    content: { type: String, required: true },
    containerClass: { type: String, default: '' },
    codeClass: { type: String, default: 'hljs' }
})

// 创建markdown-it实例并配置插件
const md = new MarkdownIt({
    html: false, // 禁止原生 HTML
    linkify: true,
    typographer: true,
    breaks: true,
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

// 链接安全
const defaultRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options)
}
md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    tokens[idx].attrSet('target', '_blank')
    tokens[idx].attrSet('rel', 'noopener noreferrer nofollow')
    const hrefAttr = tokens[idx].attrs?.find(a => a[0] === 'href')
    if (hrefAttr && hrefAttr[1] && !/^https?:\/\//i.test(hrefAttr[1])) {
        hrefAttr[1] = '#'
    }
    return defaultRender(tokens, idx, options, env, self)
}

// DOMPurify 白名单
const purifierConfig = {
    ALLOWED_TAGS: [
        'a', 'p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'blockquote',
        'code', 'pre', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'img', 'sup', 'sub'
    ],
    ALLOWED_ATTR: [
        'href', 'target', 'rel', 'title', 'alt', 'src', 'class', 'id', 'role',
        /^aria-[\w-]*$/i
    ],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'style'],
    FORBID_ATTR: [/^on/i, 'style'],
    ALLOW_UNKNOWN_PROTOCOLS: false
}

const renderedContent = computed(() => {
    const raw = md.render(props.content || '')
    return DOMPurify.sanitize(raw, purifierConfig)
})
</script>

<!-- 不设置样式隔离,获取父组件样式 -->
<style scoped lang="less">
.markdown-body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    line-height: 1.6;
    padding: 20px;
    color: #24292e;
    // background-color: #090909;
}

.markdown-body code {
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    border-radius: 3px;
    padding: 0.2em 0.4em;
}

.ai-markdown {
    background-color: #090909;
}

.markdown-body :deep(pre) {
    background-color: #ededed;
    border-radius: 12px;
    padding: 16px;
    overflow: auto;
}

.markdown-body :deep(table) {
    // 会变成 .markdown-body[data-v-xxxx] table[data-v-xxxx]
    // 而v-html注入的是原生HTML, 没有data-v-...属性, 所以应用不上样式
    width: 100%;
    border-collapse: collapse; // 合并边框
    background-color: #fff;

    thead {
        tr {
            background-color: #f8fafc;

            th {
                padding: 12px 16px;
                text-align: center; // 居中对齐
                font-weight: 600;
                color: #333;
                white-space: nowrap;
                border: 1px solid rgba(128, 128, 128, 0.256);

                &:first-child {
                    border-radius: 6px 0 0 0;
                }

                &:last-child {
                    border-radius: 0 6px 0 0;
                }
            }
        }
    }

    tbody {

        // 行样式
        tr {
            transition: background-color 0.2s ease;

            &:nth-child(even) {
                // 交替行样式
                background-color: #f1f5f9;
            }

            &:hover {
                background-color: #f0f9ff;
            }

            // 单元格样式
            td {

                padding: 12px 16px;
                color: #64748b;
                text-align: center;
                border: 1px solid rgba(128, 128, 128, 0.242);

                &:first-child {
                    border-radius: 0;
                }

                &:last-child {
                    border-radius: 0;
                }
            }
        }


    }
}

.hljs {
    padding: 0;
    background: transparent;
}
</style>
