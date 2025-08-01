<template>
    <div class="XF-chat" ref="chatContainer">

        <!-- 聊天内容 -->
        <div v-for="item in messageList" :key="item.id" :class="item.role === 'user' ? 'user-zone' : 'ai-zone'"
            v-virtual-scroll>
            <div v-if="item.role === 'user'" style="position: relative">
                {{ item.content }}
                <HoverBtn class="copy-btn" :src="copy" title="复制" width="15px" @click="copyContent(item.content)" />
                <HoverBtn class="retry-btn" :src="retry" title="重试" width="15px" @click="retryContent(item.content)" />
            </div>
            <div v-else-if="item.role === 'online'" class="online-detail">
                <div class="online-alert">参考资料</div>
                <div v-for="info, index in item.content" style="margin: 10px 0 2px;">
                    {{ index + 1 }} . <a :href="info.url" target="_blank">{{ info.title }}</a>
                </div>
            </div>
            <div v-else style="position: relative;width: 100%;">
                <CodeHighlight v-if="item.content.includes('```')" :content="item.content" />
                <pre v-else v-html="formatAIResponse(item.content)"></pre>
                <HoverBtn class="copy-btn" :src="copy" title="复制" width="15px" @click="copyContent(item.content)" />
            </div>
        </div>

        <!-- 回复完成之前显示流式,流式回复完成之后隐藏,并将完整回复保存到 messageList,该回复又被显示 -->
        <div v-if="showStream" class="ai-zone">
            <CodeHighlight v-if="streamResponse.includes('```')" :content="streamResponse" />
            <pre v-else v-html="formatAIResponse(streamResponse)"></pre>
        </div>

        <!-- 初始输入框 -->
        <div v-if="messageList.length === 0" class="initial-input" v-fade-in>
            <div class='initial-title'>你好啊,用户名</div>
            <div class="initial-shuru">
                <textarea placeholder="问点什么吧 . . ." v-model="curInput"></textarea>
                <div class="input-actions">

                    <div class="input-actions-btn">
                        <HoverBtn ref="onlineBtn" :class="{ 'action-btn': true, 'texiao-btn': isOnline }"
                            direction="-15%" directionY="-47px" :src="onlineIcon" :title="isOnline ? '已联网 ' : '联网搜索'"
                            @click="changeOnline" width="25px" />
                        <HoverBtn :class="{ 'action-btn': true, 'code-btn': isCodeMode }"
                            :title="isCodeMode ? '已开启' : '编程助手'" :src="AICode" width="21px" direction="44px"
                            @click="toggleCodeMode" />
                    </div>

                    <div class="input-actions-btn">
                        <HoverBtn class="clearInput" :src="clearInput" title="清空" @click="clearInputFunction"
                            v-if="curInput" />
                        <HoverBtn v-if="!isCodeMode" class="fasong" :src="fasong" title="发送" @click="beginChat"
                            width="25px" />
                        <div class="code-btn-container" v-if="isCodeMode">
                            <HoverBtn :src="pushCode" title="开始编程" @click="beginChat" width="25px" />
                            <select class="code-select" v-model="selectedLanguage">
                                <option class="code-select-option" v-for="item in codeLanguage" :value="item" :id="item"
                                    :key="item">{{ item }}</option>
                            </select>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import copy from '../../assets/img/复制.svg'
import retry from '../../assets/img/重试.svg'
import clearInput from '../../assets/img/clearInput.svg'
import fasong from '../../assets/img/fasong1.svg'
import onlineIcon from '../../assets/img/online.svg'
import AICode from '../../assets/img/AICode.svg'
import pushCode from '../../assets/img/pushCode.svg'
import { ref, watch, onMounted, nextTick } from 'vue'
import { createStreamConnection, updateContent, getContent, getAllContent, onlineSearch } from '../../apiStandard/api/chat'
import HoverBtn from '../../components/hoverBtn.vue'
import CodeHighlight from '../../components/codeHighlight.vue'

const codeLanguage = ['javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'sql']
const selectedLanguage = ref('javascript')
const isCodeMode = ref(false)

// 流式聊天
let retryCon = ref('')
const streamResponse = ref('')
const streamRespOnline = ref<any>([])
const showStream = ref(false)
let eventSource: any = null
let messageList = ref<any>([])
const chatContainer = ref<HTMLDivElement | null>(null)

// 打字机
const currentResponse = ref('')
const typeIndex = ref(0)
let typingInterval: any = null
const isDone = ref(false)

const curInput = ref<string>('')

// 联网搜索
const isOnline = ref<boolean>(false)
const changeOnline = () => {
    isOnline.value = !isOnline.value
    onlineSearch(isOnline.value)
}

// 编程助手
const toggleCodeMode = () => isCodeMode.value = !isCodeMode.value

const props = defineProps({
    streamMessage: { type: String, default: '' },
    startOutPut: { type: Boolean, default: false },
    id: { type: Number, default: 0 }, // 当前对话id
})

const emit = defineEmits(['retryContent', 'finishOutPut', 'clearStreamMessage', 'clearCon', 'updateHistName', 'isNoChat', 'refreshCurId'])
const finishOutPut = () => emit('finishOutPut')
const clearStreamMessage = () => emit('clearStreamMessage')
const updateHistName = () => emit('updateHistName')
const refreshCurId = () => emit('refreshCurId')

watch([streamResponse, messageList], (newVal) => {
    scrollToBottom()
    const [, newMessageList] = newVal
    if (newMessageList.length === 0) emit('isNoChat', false)
    else emit('isNoChat', true)
})
watch(() => props.id, (newVal) => { if (newVal) getContent(newVal).then((res: any) => messageList.value = res.content) })
watch(() => props.startOutPut, (newVal) => { if (newVal && props.streamMessage) beginChat() })
watch(isOnline, (newVal) => { if (newVal) isCodeMode.value = false })
watch(isCodeMode, (newVal) => { if (newVal) isOnline.value = false })

//scrollY 是一个全局属性，表示整个窗口在垂直方向上已滚动的距离, 只读
//scrollTop 是某个元素在垂直方向上已滚动的距离，只读
//scrollHeight 是某个元素的实际高度，包括溢出的文本高度, 只读
//滚动到底部的函数
const scrollToBottom = () => nextTick(() => { if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight })

// 清空输入
const clearInputFunction = () => curInput.value = ''

// 格式化AI回复，将[^1^]等引用转换为可点击的链接
const formatAIResponse = (text: string) => {
    if (!text) return text
    // 先移除 * 和 # 符号
    text = text.replace(/[*#《》]/g, '')
    // 替换引用标记为HTML链接
    return text.replace(/\[\^(\d+)\^\]/g, (match, index) => {  // match:符合正则的完整字符串,eg：[^4^], (\d+)捕获内容, index:对应的内容,但是是字符串，eg："4"
        const infoIndex = parseInt(index) - 1
        if (streamRespOnline.value && infoIndex >= 0 && infoIndex < streamRespOnline.value.length) {
            return `<a href="${streamRespOnline.value[infoIndex].url}" target="_blank" class="reference-link">${index}</a>`
        }
        return match
    })
}

//流式聊天
const beginChat = () => {
    if (isCodeMode.value) curInput.value = `使用${selectedLanguage.value}语言帮我解决:${curInput.value}`
    let selectInput = props.streamMessage || curInput.value || retryCon.value
    if (selectInput === '') return

    finishOutPut()
    showStream.value = true
    streamResponse.value = ''
    streamRespOnline.value = []
    saveMessage('user', selectInput)
    writeFontMachine()
    eventSource = createStreamConnection(selectInput)
    eventSource.onmessage = (event: any) => {
        if (event.data === '[DONE]') {
            isDone.value = true
            eventSource.close()
            return
        }
        const data = JSON.parse(event.data)
        if (data.onlineInfo) {
            streamRespOnline.value = data.onlineInfo
            saveMessage('online', data.onlineInfo)
        }
        else currentResponse.value += data.content
    }
    eventSource.onerror = () => eventSource.close()
    eventSource.onopen = () => []
    clearStreamMessage()
    curInput.value = ''
}

// 打字机
const writeFontMachine = () => {
    isDone.value = false
    currentResponse.value = ''
    typeIndex.value = 0
    typingInterval = setInterval(() => {
        if (typeIndex.value < currentResponse.value.length) {
            streamResponse.value = currentResponse.value.slice(0, typeIndex.value + 1)
            typeIndex.value++
        } else {
            if (isDone.value) {
                clearInterval(typingInterval)
                typingInterval = null
                showStream.value = false
                saveMessage('ai', currentResponse.value)
            }
        }
    }, 5)
}

//保留用户/AI信息
const saveMessage = async (role: string, content: string) => {
    let finalContent = content
    // AI回复且有联网信息，则格式化后再存入
    if (role === 'ai' && streamRespOnline.value && streamRespOnline.value.length > 0) finalContent = formatAIResponse(content)
    await messageList.value.push({ role: role, content: finalContent })
    updateContent({ id: props.id, content: messageList.value })
    updateHistName()
    scrollToBottom()
}

//复制内容
const copyContent = (content: string) => navigator.clipboard.writeText(content)

//重试内容
const retryContent = (content: string) => {
    retryCon.value = content
    beginChat()
}

onMounted(() => {
    getAllContent().then((res: any) => getContent(res[0].id).then((res: any) => messageList.value = res.content))
    refreshCurId()
    // 初始加载时滚动到底部
    scrollToBottom()
})
</script>

<style scoped lang="less">
@import '../../assets/styles.less';
@import '../../assets/property.less';

.XF-chat {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 100%;
    height: 100%;
    gap: 35px;
    overflow-y: auto;
    overflow-x: hidden;
    padding-bottom: 40px;
    background-color: var(--chat-bg);

    &::-webkit-scrollbar {
        width: 7px;

        &-thumb {
            background-color: var(--scrollbar-thumb);
            border-radius: 12px;
            outline: 2px solid var(--scrollbar-track);
        }
    }

    .user-zone {
        width: fit-content;
        max-width: 80%;
        display: flex;
        align-self: flex-end;
        background-color: var(--user-msg-bg);
        color: var(--text-color);
        border-radius: 12px;
        border: none;
        outline: none;
        padding: 5px 10px;
        margin: 5px 30px 5px 5px;
        font-weight: 350;
        font-size: 16px;

        .copy-btn {
            position: absolute;
            left: -18px;
            bottom: 0;
            transform: translateY(120%);
            color: var(--text-color);
            padding: 5px 7px;
            margin: 5px 15px 5px 5px;
            width: 15px;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.3s ease;
        }

        .retry-btn {
            position: absolute;
            left: 7px;
            bottom: 0;
            transform: translateY(120%);
            color: var(--text-color);
            padding: 5px 7px;
            margin: 5px 15px 5px 5px;
            width: 15px;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.3s ease;
        }
    }

    .ai-zone {
        max-width: 80%;
        display: flex;
        align-self: flex-start;
        background-color: var(--ai-msg-bg);
        color: var(--text-color);
        padding: 5px 10px;
        margin: 5px 5px 5px 30px;
        font-weight: 450;
        font-size: 16px;
        border-radius: 6px 12px 12px 6px;
        position: relative;

        &:after {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            height: 90%;
            width: 2px;
            background: linear-gradient(to bottom, var(--ai-msg-bg), var(--ai-msg-border), var(--ai-msg-bg));
        }

        pre {
            white-space: pre-wrap;
            word-wrap: break-word;
            margin: 0;
            font-family: inherit;
            font-size: inherit;
            font-weight: inherit;
            color: var(--text-color);
        }

        :deep(.reference-link) {
            display: inline-block;
            transform: translateY(1px);
            font-size: 13px;
            width: 13px;
            height: 13px;
            line-height: 13px;
            text-align: center;
            text-decoration: none;
            color: var(--text-color);
            font-weight: bold;
            cursor: pointer;
            background-color: var(--bg-color);
            border-radius: 100%;
            margin-left: 3px;
            border: 1px solid var(--text-color);
            transition: color 0.3s ease, background-color 0.3s ease;

            &:hover {
                background-color: var(--text-color);
                color: var(--bg-color);
            }
        }

        .copy-btn {
            position: absolute;
            left: -10px;
            bottom: 0;
            transform: translateY(130%);
            color: var(--text-color);
            padding: 5px 7px;
            margin: 5px 15px 5px 5px;
            width: 15px;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.3s ease;
        }

        .online-alert {
            font-size: 20px;
            color: var(--text-color);
        }

        .online-detail {
            position: relative;

            a {
                text-decoration: none;
                color: transparent;
                background-color: var(--text-color);
                background-clip: text;
                width: fit-content;
                border-bottom: 2px solid var(--hover-bg);
                transition: all 0.3s ease-in-out;

                &:hover {
                    text-decoration: underline;
                    border-bottom: 2px solid var(--text-color);
                }
            }
        }
    }

    .initial-input {
        display: flex;
        flex-direction: column;
        gap: 12px;
        justify-content: center;
        align-items: center;
        height: 90%;

        .initial-title {
            .rem(font-size, 1.7);
            font-weight: 500;
            color: var(--text-color);
        }

        .initial-shuru {
            position: relative;
            border-radius: 20px;
            border: 2px solid var(--input-border);
            width: 70%;
            max-width: 700px;
            height: fit-content;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            background-color: var(--input-bg);

            textarea {
                color: var(--input-text);
                font-size: 17px;
                font-weight: 400;
                font-family: "Microsoft YaHei", "微软雅黑", sans-serif;
                height: calc(17px*1.3*3);
                line-height: 1.3;
                width: 100%;
                border: none;
                outline: none;
                resize: none;
                background-color: var(--input-bg);

                &:focus {
                    border: none;
                    outline: none;
                }

                &::placeholder {
                    color: var(--text-secondary);
                }
            }

            .input-actions {
                display: flex;
                gap: 10px;
                justify-content: space-between;

                .action-btn {
                    border: none;
                    background-color: transparent;
                    border-radius: 12px;
                    outline: none;
                    padding: px;
                    color: var(--text-color);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    position: relative;
                    z-index: 10;

                    .isOnlineIcon {
                        width: 20px;
                    }
                }

                .texiao-btn {
                    position: relative;
                    z-index: 1;

                    &:before {
                        content: '';
                        position: absolute;
                        border-radius: 12px;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(to bottom, #f49dc0af, #f85ea590, #ffaa009d);
                        z-index: -1;
                        animation: TeXiaoRotate 1.5s linear infinite;
                    }

                    &::after {
                        content: '';
                        background: linear-gradient(to bottom, #f49dc0af, #f7369090, #dff7549d);
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 90%;
                        height: 90%;
                        border-radius: 12px;
                        animation: TeXiaoScale 1.5s ease-in-out infinite;
                        z-index: -1;
                    }

                    @keyframes TeXiaoRotate {
                        0% {
                            transform: rotate(0deg);
                        }

                        100% {
                            transform: rotate(360deg);
                        }
                    }

                    @keyframes TeXiaoScale {
                        0% {
                            transform: translate(-50%, -50%) scale(0.9);
                        }

                        50% {
                            transform: translate(-50%, -50%) scale(1.1);
                        }

                        100% {
                            transform: translate(-50%, -50%) scale(0.9);
                        }
                    }
                }

                .code-btn {
                    position: relative;
                    z-index: 1;

                    &:before {
                        content: '';
                        position: absolute;
                        border-radius: 12px;
                        top: 5%;
                        left: 0%;
                        width: 103%;
                        height: 93%;
                        background: linear-gradient(to right, #4facfecc, #00f2fecc);
                        z-index: -1;
                        animation: CodePulse 1.5s ease-in-out infinite;
                    }

                    &::after {
                        content: '';
                        background: linear-gradient(135deg, #4facfeaa, #00f2feaa);
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 100%;
                        height: 90%;
                        border-radius: 12px;
                        animation: CodeGlow 1.5s ease-in-out infinite alternate;
                        z-index: -1;
                    }

                    @keyframes CodePulse {
                        0% {
                            opacity: 0.7;
                            transform: scale(0.95);
                        }

                        50% {
                            opacity: 1;
                            transform: scale(1.08);
                        }

                        100% {
                            opacity: 0.7;
                            transform: scale(0.95);
                        }
                    }

                    @keyframes CodeGlow {
                        0% {
                            box-shadow: 0 0 10px #4facfe77, 0 0 10px #00f2fe77;
                        }

                        50% {
                            box-shadow: 0 0 15px #0088ffaa, 0 0 20px #55f7ff7a;
                        }

                        100% {
                            box-shadow: 0 0 10px #4facfe77, 0 0 10px #00f2fe77;
                        }
                    }
                }

                .input-actions-btn {
                    display: flex;
                    gap: 10px;
                    cursor: pointer;

                    .action-btn {
                        border: none;
                        background-color: transparent;
                        outline: none;
                        cursor: pointer;
                        transition: all 0.3s ease;

                        .clearInput {
                            width: 25px;
                            transition: all 0.3s ease;
                            padding: 3px;
                            margin-top: -5px;

                            &:hover {
                                background-color: var(--button-hover);
                                border-radius: 10px;
                            }
                        }

                        .fasong {
                            width: 25px;
                            transition: all 0.3s ease;
                            padding: 3px;
                            margin-top: -5px;

                            &:hover {
                                background-color: rgba(128, 128, 128, 0.436);
                                border-radius: 10px;
                            }
                        }
                    }

                    .code-btn-container {
                        display: flex;
                        align-items: center;
                        gap: 10px;

                        .code-select {
                            color: var(--text-color);
                            background-color: var(--input-bg);
                            border-radius: 12px;
                            padding: 6px;
                            border: 2px solid var(--input-border);
                            min-width: 100px;
                            outline: none;
                            cursor: pointer;
                            font-size: 14px;
                            width: auto;

                            .code-select-option {
                                background-color: var(--input-bg);
                                border: none;
                                outline: none;
                                padding: 4px;
                                border-radius: 12px;
                            }
                        }
                    }
                }
            }
        }
    }

    .code-block {
        margin: 0;
        border-radius: 6px;
        font-family: 'Consolas', 'Monaco', monospace;

        :deep(code) {
            padding: 1em;
            border-radius: 6px;
            font-size: 14px;
            line-height: 1.5;
            tab-size: 4;
        }
    }
}
</style>