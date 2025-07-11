<template>
    <div class="chat-container">

        <!-- 侧边栏 -->
        <div class="sidebar" ref="sidebarRef">
            <div class="user-info" v-if="!isFold">
                <div style="display:flex;gap: 8px">
                    <img src="../../assets/img/logo.svg" style="width: 25px">
                    <div class="logo">右转</div>
                </div>
                <HoverBtn :src="foldIcon" title="折叠" @click="foldSidebar" />
            </div>

            <!-- 新对话 -->
            <button class="new-chat-btn" v-if="!isFold" @mouseenter="isShowMenu = true"
                @mouseleave="isShowMenu = false;">
                <span class="plus-icon">+</span>新对话
                <div class="menu-items" v-if="isShowMenu">
                    <div class="menu-item" @click="addContent">
                        <img :src="sousuo" alt="搜索" class="icon-search">搜索
                    </div>
                    <div class="menu-item" @click="addContent">
                        <img :src="liaotianjilu" alt="聊天记录" class="icon-liaotianjilu">聊天记录
                    </div>
                </div>
            </button>

            <!-- 历史对话 -->
            <div class="history-section" v-if="!isFold">
                <h3>历史对话</h3>
                <div class="history-items">
                    <div class="history-item" v-for="item in history" :key="item.id">
                        <div class="history-item-content">
                            <span class="history-item-content-text" @click="goDetail(item.id)" :style="{
                                backgroundColor: item.id === curID ? 'white' : '',
                                boxShadow: item.id === curID ? '0 0 10px 0 rgba(0, 0, 0, 0.1)' : ''
                            }">
                                <img :src="information" alt="User Avatar" class="avatar"
                                    style="width: 14px;transform: translateY(1px);margin-right: 2px;">
                                {{ item.content && item.content.length > 0 ? item.content[0].content :
                                    '新对话' }}
                                <HoverBtn class="delete-icon" :src="deleteIcon" title="删除"
                                    @click.stop="deleteHist(item.id)" />
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 收起侧边栏 -->
            <HoverBtn class="sidebar-fold" :src="unfoldIcon" title="展开" @click="foldSidebar" v-if="isFold" />

        </div>

        <!-- 聊天区域 -->
        <div class="main-content">

            <!-- 标题和功能 -->
            <div class="setting">
                <div class="setting-title">
                    <div style="white-space: nowrap;font-size: 16px;">{{ getTitle() }}</div>
                    <div class="ai-alert">内容由 AI 生成</div>
                </div>
                <div class="setting-set">
                    <HoverBtn :src="share" title="分享" />
                    <HoverBtn :src="user" title="设置" @click="isShowSetting = !isShowSetting" />
                </div>
            </div>

            <!-- 聊天内容 -->
            <BaseAIChat :streamMessage="streamMessage" :startOutPut="startOutPut" :id="curID"
                @finishOutPut="finishOutPut" @clearStreamMessage="clearStreamMessage" @updateHistName="updateHistName"
                @isNoChat="(val) => { noChat = val }">
            </BaseAIChat>

            <!-- 输入框 -->
            <div class="input-area" v-if="noChat">
                <div class="input-container">
                    <input type="text" placeholder="随便问" v-model="streamMessage" />
                    <div class="input-actions">
                        <button class="action-btn"
                            :style="{ backgroundColor: isOnline ? '#d4ffcaaf' : '#ffffff', color: isOnline ? '#1eba13' : 'rgb(202, 202, 202)', outline: isOnline ? '1px solid #1eba13' : '1px solid #dddddd' }"
                            @click="changeOnline">
                            <img :src='isOnline ? isOnlineIcon : onlineIcon' class="icon-attach" style="width: 19px;"
                                :style="{ stroke: isOnline ? '#1eba13' : 'rgb(202, 202, 202)' }">联网搜索
                        </button>
                    </div>
                    <button style="position: absolute;right:49px;border: none;" class="submit"
                        @click="streamMessage = ''" v-if="streamMessage"><img :src="clearInput" class="clearInput">
                    </button>
                    <button style="position: absolute;right:6px;" class="submit" @click="startOutPut = true"><img
                            :src="fasong" class="fasong">
                    </button>
                </div>
            </div>

        </div>
    </div>

    <!-- 设置 -->
    <BaseSetting class="user-setting" :style="{ transform: isShowSetting ? 'translateX(0)' : 'translateX(110%)' }"
        @closeSetting="isShowSetting = false">
    </BaseSetting>
</template>

<script setup lang="ts">
import information from '../../assets/img/聊天记录.svg'
import deleteIcon from '../../assets/img/删除.svg'
import fasong from '../../assets/img/fasong1.svg'
import onlineIcon from '../../assets/img/online.svg'
import isOnlineIcon from '../../assets/img/isOnline.svg'
import foldIcon from '../../assets/img/收起.svg'
import unfoldIcon from '../../assets/img/unFold.svg'
import sousuo from '../../assets/img/搜索-copy.svg'
import liaotianjilu from '../../assets/img/聊天记录.svg'
import clearInput from '../../assets/img/clearInput.svg'
import user from '../../assets/img/user.svg'
import share from '../../assets/img/share.svg'
import { ref, onMounted } from 'vue'
import BaseAIChat from './content.vue'
import { getAllContent, addToAllContent, onlineSearch, deleteContent } from '../../apis/api/chat'
import BaseSetting from '../user/baseSetting.vue'
import HoverBtn from '../../components/hoverBtn.vue'

let startOutPut = ref(false)  //传递一次输入内容
const isShowMenu = ref(false)  // 是否显示菜单
let streamMessage = ref<string>('')  // 用户输入
const noChat = ref<boolean>(false)

let isFold = ref(false)
const isShowSetting = ref(false)
const sidebarRef = ref<HTMLElement | null>(null)

// 联网（默认不选）
let isOnline = ref(false)
const changeOnline = () => {
    isOnline.value = !isOnline.value
    onlineSearch(isOnline.value)
}

// 收起侧边栏
const foldSidebar = () => {
    isFold.value = !isFold.value
    if (isFold.value) sidebarRef.value!.style.width = '0px'
    else sidebarRef.value!.style.width = '220px'
}

// 历史对话
let curID = ref(1)
const history = ref<any>([])

// 获取题目
const getTitle = () => {
    const title = history.value.find((item: any) => item.id === curID.value)
    if (title) {
        if (title.content.length === 0) return '新对话'
        else return title.content[0].content
    }
}

// 跳转到具体对话
const goDetail = (id: any) => curID.value = id

// 删除对话
const deleteHist = async (id: any) => {
    await deleteContent(id)
    history.value = history.value.filter((item: any) => item.id !== id)
    if (history.value.length == 0) addContent()
    else {
        getAllContent().then((res: any) => {
            history.value = res
            curID.value = res[0].id
        })
    }
}

// 添加对话
const addContent = () => {
    isShowMenu.value = false
    addToAllContent({ id: Number(new Date().getTime().toString().slice(-7)), content: [] }).then(() => {
        getAllContent().then((res: any) => {
            history.value = res
            curID.value = res[0].id
        })
    })

}

// 完成流式输出
const finishOutPut = () => startOutPut.value = false

//清空输入
const clearStreamMessage = () => streamMessage.value = ''

// 更新对话名称
const updateHistName = () => getAllContent().then((res: any) => history.value = res)

onMounted(() => {
    onlineSearch(isOnline.value)
    getAllContent().then((res: any) => {
        if (res.length > 0) {
            history.value = res
            curID.value = res[0].id
        }
        else addContent()
    })
    if (window.innerWidth < 500) isFold.value = true
    // 获取主题
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme)
    }
})
</script>

<style scoped lang="less">
// CSS 变量
@primary-color: #1a73e8;
@background-color: var(--bg-color);
@sidebar-bg: var(--hover-bg);
@border-color: var(--border-color);
@text-gray: var(--text-secondary);
@text-light: var(--text-secondary);
@hover-bg: var(--hover-bg);

.chat-container {
    display: flex;
    height: 100vh;
    background-color: @background-color;
    overflow-y: auto;

    .sidebar {
        width: 220px;
        background-color: @sidebar-bg;
        border-right: 1px solid @border-color;
        padding: 16px;
        overflow-y: auto;
        overflow-x: hidden;
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;

        &::-webkit-scrollbar {
            width: 5px;

            &-thumb {
                background-color: var(--scrollbar-thumb);
                border-radius: 4px;
            }

            &-track {
                background-color: var(--scrollbar-track);
            }
        }

        .user-info {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px;

            .logo {
                font-size: 22px;
                font-weight: 600;
                color: var(--text-color);
            }
        }

        .new-chat-btn {
            position: relative;
            display: flex;
            align-items: center;
            gap: 8px;
            background-color: @background-color;
            border: 1px solid @border-color;
            border-radius: 8px;
            padding: 8px 16px;
            margin: 16px 0;
            color: var(--text-color);
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
                background-color: @hover-bg;
            }

            .plus-icon {
                font-size: 18px;
            }

            .menu-items {
                position: absolute;
                top: 37px;
                left: 0;
                display: flex;
                flex-direction: column;
                gap: 1px;
                background-color: var(--bg-color);
                border-radius: 8px;
                padding: 8px 16px;
                border: 1px solid @border-color;
                z-index: 1000;

                .menu-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 20px;
                    border-radius: 6px;
                    color: var(--text-color);
                    cursor: pointer;
                    transition: all 0.3s ease;

                    &:hover {
                        background-color: @hover-bg;
                    }

                    .icon-search {
                        width: 20px;
                    }

                    .icon-liaotianjilu {
                        width: 15px;
                        margin-right: 4px;
                    }
                }
            }
        }

        .history-section {
            display: flex;
            flex-direction: column;
            width: 100%;

            h3 {
                color: var(--text-color);
                margin: 0 0 16px 0;
            }

            .history-items {
                display: flex;
                flex-direction: column;
                gap: 5px;

                .history-item {
                    .history-item-content {
                        .history-item-content-text {
                            position: relative;
                            display: inline-block;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            width: 90%;
                            font-size: 13px;
                            color: var(--text-secondary);
                            padding: 8px 8px;
                            border-radius: 8px;
                            cursor: pointer;
                            transition: all 0.3s ease;

                            &:hover {
                                background-color: rgba(128, 128, 128, 0.225);

                                .delete-icon {
                                    position: absolute;
                                    right: 8px;
                                    top: 8.5%;
                                    display: block;
                                    z-index: 99999999;
                                }

                                .edit-icon {
                                    position: absolute;
                                    right: 30px;
                                    top: 8%;
                                    display: block;
                                    z-index: 99999999;
                                }
                            }

                            .avatar {
                                width: 14px;
                                transform: translateY(1px);
                                margin-right: 2px;
                            }

                            .delete-icon {
                                display: none;
                            }

                            .edit-icon {
                                display: none;
                            }
                        }
                    }
                }
            }
        }

        .sidebar-fold {
            margin: auto 0;
        }
    }

    .main-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 0 12px;
        overflow-y: hidden;
        position: relative;
        width: 100%;
        background-color: var(--bg-color);

        .setting {
            width: 100%;
            margin-bottom: 3px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;

            .setting-title {
                display: flex;
                flex-direction: column;
                padding: 4px 1px 2px;
                color: var(--text-color);

                .ai-alert {
                    font-size: 12px;
                    color: var(--text-secondary);
                }
            }

            .setting-set {
                display: flex;
                align-items: center;
                gap: 12px;
                cursor: pointer;
            }
        }

        .input-area {
            margin-top: auto;
            padding: 16px 0px 8px;

            .input-container {
                display: flex;
                align-items: center;
                gap: 8px;
                border: 2px solid var(--input-border);
                border-radius: 12px;
                padding: 8px 16px;
                position: relative;
                background-color: var(--input-bg);

                input {
                    flex: 1;
                    border: none;
                    outline: none;
                    font-size: 14px;
                    padding-left: 90px;
                    padding-top: 6px;
                    padding-bottom: 6px;
                    color: var(--input-text);
                    background-color: var(--input-bg);

                    &::placeholder {
                        color: var(--text-secondary);
                    }
                }

                .input-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    position: absolute;
                    left: 10px;
                    width: fit-content;

                    .action-btn {
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        padding: 6px;
                        border: none;
                        background: none;
                        color: var(--text-secondary);
                        background-color: var(--bg-color);
                        outline: 1px solid var(--border-color);
                        border-radius: 12px;
                        cursor: pointer;
                        transition: all 0.3s ease;

                        &:hover {
                            background-color: @hover-bg;
                        }

                        .icon-attach {
                            width: 19px;
                        }
                    }
                }

                .submit {
                    height: 30px;
                    background-color: transparent;
                    border: none;
                    outline: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    padding: 3.5px;

                    &:hover {
                        background-color: var(--button-hover);
                        border-radius: 12px;
                    }

                    .fasong {
                        width: 24px;
                    }

                    .clearInput {
                        width: 22px;
                        transform: translateY(1.6px);
                    }
                }
            }
        }
    }
}

.user-setting {
    position: fixed;
    z-index: 100000;
    right: 10px;
    top: 180px;
    transition: all 0.3s ease-in-out;
}
</style>