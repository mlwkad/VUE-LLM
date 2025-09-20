<template>
    <div class="XF-chat" ref="chatContainer">

        <!-- 聊天内容 -->
        <div class="chat-content-container" ref="chatContentContainerRef">
            <div v-for="item in messageList" :key="item.id"
                :style="{ alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start' }">
                <div :class="item.role === 'user' ? 'user-zone' : 'ai-zone'">
                    <div v-if="item.role === 'user'" style="position: relative">
                        {{ item.content }}
                    </div>
                    <div v-else-if="item.role === 'online'" class="online-detail">
                        <div class="online-alert">参考资料</div>
                        <div v-for="info, index in item.content" style="margin: 10px 0 2px;">
                            {{ index + 1 }} . <a :href="info.url" target="_blank">{{ info.title }}</a>
                        </div>
                    </div>
                    <div v-else style="position: relative;width: 100%;">
                        <!-- 给Markdown组件的样式要穿透一下 -->
                        <MarkDown :content="item.content"
                            :container-class="item.role === 'user' ? 'user-markdown' : 'ai-markdown'"
                            :code-class="item.role === 'user' ? 'user-code' : 'ai-code'">
                        </MarkDown>
                    </div>
                </div>
            </div>
        </div>

        <!-- 回复完成之前显示流式,流式回复完成之后隐藏,并将完整回复保存到 messageList,该回复又被显示 -->
        <div v-if="showStream" class="ai-zone">
            <MarkDown :content="streamResponse" container-class="ai-markdown" code-class="ai-code">
            </MarkDown>
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
import clearInput from '../../assets/img/clearInput.svg'
import fasong from '../../assets/img/fasong1.svg'
import onlineIcon from '../../assets/img/online.svg'
import AICode from '../../assets/img/AICode.svg'
import pushCode from '../../assets/img/pushCode.svg'
import { ref, watch, onMounted, nextTick } from 'vue'
import axios from 'axios'
import { updateContent, getContent, getAllContent, onlineSearch } from '../../apiStandard/api/chat'
import HoverBtn from '../../components/hoverBtn.vue'
import MarkDown from '../../components/markDown.vue'

const codeLanguage = ['javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'sql']
const selectedLanguage = ref('javascript')
const isCodeMode = ref(false)

// 流式聊天
let retryCon = ref('')
const streamResponse = ref('')
const streamRespOnline = ref<any>([])
const showStream = ref(false)
let messageList = ref<any>([])
const chatContentContainerRef = ref<HTMLElement | null>(null)
let controller: AbortController | null = null

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
const scrollToBottom = () => {
    nextTick(() => {
        const container = chatContentContainerRef.value
        if (container) {
            container.scrollTop = container.scrollHeight
        }
    })
}

// 清空输入
const clearInputFunction = () => curInput.value = ''

// 格式化AI回复，将[^1^]等引用转换为可点击的链接
const formatAIResponse = (text: string) => {
    if (!text) return text
    // 替换引用标记为HTML链接
    return text.replace(/\[\^(\d+)\^\]/g, (match, index) => {  // 匹配[^ number ^]
        const infoIndex = parseInt(index) - 1
        if (streamRespOnline.value && infoIndex >= 0 && infoIndex < streamRespOnline.value.length) {
            // 返回 markdown 格式链接，title 可选
            return `[${index}](${streamRespOnline.value[infoIndex].url} "参考${index}")`
        }
        return match
    })
}

//流式聊天
const beginChat = () => {
    if (isCodeMode.value) curInput.value = `使用${selectedLanguage.value}语言帮我解决:${curInput.value}`
    let selectInput = props.streamMessage || curInput.value || retryCon.value
    if (selectInput === '') return

    // 如果存在之前的请求,取消它
    if (controller) {
        controller.abort()
    }
    controller = new AbortController()

    finishOutPut()
    showStream.value = true
    streamResponse.value = ''
    streamRespOnline.value = []
    saveMessage('user', selectInput)
    writeFontMachine()

    // 使用 axios 发送流式请求
    let lastProcessedLength = 0 // 保存上一次处理过的数据长度

    axios.get(`/api/chat/stream?message=${encodeURIComponent(selectInput)}`, {
        responseType: 'text',
        signal: controller.signal,
        onDownloadProgress: (progressEvent: any) => {  // 浏览器每接收一个数据块就会触发该事件
            // 当有响应头 Transfer-Encoding: chunked(分块传输, 无法预知响应体大小/响应头太大自动开启, 也可手动开启)返回数据时
            // 浏览器会持续接收数据块，并将这些块逐步合并到同一个响应对象中
            // 所以说需要记录上次处理到的位置, 每次只处理新增的部分
            const text = progressEvent.event.target.response
            const matches = text.split('\n\n').slice(0, -1) // match=[data: {...}, data: {...}, ...]
            if (!matches) return
            // 只处理新的数据块
            const newMatches = matches.slice(lastProcessedLength)
            lastProcessedLength = matches.length
            // 处理新的数据块
            newMatches.forEach((dataBlock: any) => {
                try {
                    const jsonStr = dataBlock.substring(6) // 移除 'data: ' 前缀
                    if (jsonStr.trim() === '[DONE]') {
                        isDone.value = true
                        return
                    }
                    const data = JSON.parse(jsonStr)
                    if (data.onlineInfo) {
                        streamRespOnline.value = data.onlineInfo
                        saveMessage('online', data.onlineInfo)
                    } else if (data.content) {
                        currentResponse.value += data.content
                    }
                } catch (e) {
                    console.log('解析失败:', dataBlock, e)
                }
            })
        }
    }).catch((error: any) => {
        if (axios.isCancel(error)) {
            // 请求被取消
            console.log('请求被取消')
        } else {
            // 其他错误
            console.error('请求出错:', error)
        }
    }).finally(() => {
        controller = null
        clearStreamMessage()
    })

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

/* 给Markdown的样式 */
:deep(.user-markdown) {
    background-color: black;
}

:deep(.ai-markdown) {
    background-color: rgba(252, 252, 252, 0.718);
}

:deep(.user-code) {
    background-color: #e9e9e9;
    border-radius: 8px;
    padding: 12px;
    color: #333333;
}

:deep(.ai-code) {
    background-color: #d7d7d755;
    border-radius: 8px;
    padding: 12px;
    color: #000000;
    width: fit-content;
    max-width: 100%;
    overflow-x: auto;
}

.XF-chat {
    height: calc(100vh - 110px);
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 100%;
    gap: 35px;
    overflow-x: hidden;
    padding-bottom: 40px;
    background-color: var(--chat-bg);

    .chat-content-container {
        flex: 1;
        overflow-y: auto;
        overflow-x: auto;
        padding: 0 10px;
        display: flex;
        flex-direction: column;


        &::-webkit-scrollbar {
            width: 7px;
            height: 7px;

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
            overflow-y: auto;

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