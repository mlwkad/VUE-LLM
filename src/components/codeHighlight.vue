<template>
    <div class="markdown-content">
        <div v-for="(block, index) in contentBlocks" :key="index">
            <!-- 普通文本 -->
            <div v-if="block.type === 'text'" class="text-block" v-html="block.content"></div>

            <!-- 代码块 -->
            <div v-else-if="block.type === 'code'" class="code-block">
                <div class="code-header">
                    <span class="language-label">{{ block.language }}</span>
                    <div class="code-actions">
                        <span class="copy-button" @click="copyCode(block.content)">复制</span>
                    </div>
                </div>
                <pre class="code-content"><code v-html="highlightCode(block.content, block.language)"></code></pre>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import hljs from 'highlight.js/lib/core'
import 'highlight.js/styles/vs2015.css'

// 按需引入常用语言
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import csharp from 'highlight.js/lib/languages/csharp'
import cpp from 'highlight.js/lib/languages/cpp'
import sql from 'highlight.js/lib/languages/sql'

// 注册语言
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('java', java)
hljs.registerLanguage('csharp', csharp)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('sql', sql)

const props = defineProps({
    content: { type: String, default: '' }
})

// 解析内容为代码块和文本块
const contentBlocks = computed(() => {
    const blocks = []
    const content = props.content

    // 使用正则表达式匹配代码块
    const regex = /```(\w+)?\n([\s\S]*?)```/g
    let lastIndex = 0
    let match

    while ((match = regex.exec(content)) !== null) {
        // 添加代码块前的文本
        if (match.index > lastIndex) {
            blocks.push({
                type: 'text',
                content: content.substring(lastIndex, match.index).replace(/\n/g, '<br>')
            })
        }

        // 添加代码块
        blocks.push({
            type: 'code',
            language: match[1] || 'plaintext',
            content: match[2].trim()
        })

        lastIndex = match.index + match[0].length
    }

    // 添加最后一个代码块后的文本
    if (lastIndex < content.length) {
        blocks.push({
            type: 'text',
            content: content.substring(lastIndex).replace(/\n/g, '<br>')
        })
    }

    return blocks
})

// 高亮代码
const highlightCode = (code: string, language: string | undefined): string => {
    try {
        if (language && hljs.getLanguage(language)) return hljs.highlight(code, { language }).value
        else return hljs.highlightAuto(code).value
    } catch (e) {
        console.error('高亮代码失败:', e)
        return code
    }
}

// 复制代码到剪贴板
const copyCode = (code: string) => navigator.clipboard.writeText(code)

</script>

<style scoped lang="less">
.markdown-content {
    color: var(--text-color, #333);

    .text-block {
        margin-bottom: 8px;
        white-space: pre-wrap;
        line-height: 1.6;
    }

    .code-block {
        margin: 12px 0;
        border-radius: 6px;
        overflow: hidden;
        background-color: var(--code-bg, #1e1e1e);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

        .code-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            background-color: var(--code-header-bg, #333333);
            color: var(--code-header-text, #cccccc);
            font-size: 12px;

            .language-label {
                text-transform: uppercase;
                font-weight: 500;
            }

            .code-actions {
                .copy-button {
                    cursor: pointer;
                    padding: 2px 8px;
                    border-radius: 4px;
                    background-color: var(--code-button-bg, #505050);

                    &:hover {
                        background-color: var(--code-button-hover, #606060);
                    }
                }
            }
        }

        .code-content {
            margin: 0;
            padding: 12px;
            overflow-x: auto;
            font-family: 'Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', monospace;
            font-size: 14px;
            line-height: 1.5;
            tab-size: 2;
            color: var(--code-text, #d4d4d4);

            &::-webkit-scrollbar {
                height: 6px;
            }

            &::-webkit-scrollbar-thumb {
                background-color: var(--scrollbar-thumb, #505050);
                border-radius: 4px;
            }

            &::-webkit-scrollbar-track {
                background-color: var(--scrollbar-track, #2c2c2c);
            }
        }
    }
}
</style>