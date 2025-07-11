<template>
    <div class="share-page">
        <div class="share-container">
            <!-- 头部 -->
            <div class="share-header">
                <img src="../../assets/img/logo.svg" class="logo">
                <div class="app-info">
                    <div class="app-name">右转 AI</div>
                    <div class="app-desc">智能对话助手</div>
                </div>
            </div>

            <!-- 对话内容 -->
            <div class="chat-content">
                <div class="chat-item user">
                    <div class="avatar">用户</div>
                    <div class="message">{{ conversation.question }}</div>
                </div>
                <div class="chat-item ai">
                    <div class="avatar">AI</div>
                    <div class="message">{{ conversation.answer }}</div>
                </div>
            </div>

            <!-- 分享按钮 -->
            <div class="share-actions">
                <div class="share-title">分享到：</div>
                <div class="share-buttons">
                    <button class="share-btn wechat" @click="shareToWeChat">
                        <i class="share-icon wechat-icon"></i>
                        微信
                    </button>
                    <button class="share-btn weibo" @click="shareToWeibo">
                        <i class="share-icon weibo-icon"></i>
                        微博
                    </button>
                    <button class="share-btn qq" @click="shareToQQ">
                        <i class="share-icon qq-icon"></i>
                        QQ
                    </button>
                    <button class="share-btn copy" @click="copyShareLink">
                        <i class="share-icon copy-icon"></i>
                        复制链接
                    </button>
                </div>
            </div>

            <!-- 底部操作区 -->
            <div class="share-footer">
                <div class="watermark">由右转AI生成 · {{ formatDate(conversation.time) }}</div>
                <a class="open-app-btn" @click="openApp">打开右转，体验更多AI对话</a>
            </div>
        </div>

        <!-- 复制成功提示 -->
        <div class="toast-notification" v-if="shareStatus" :class="{ 'show': shareStatus }">
            {{ shareStatus }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 对话内容
const conversation = reactive({
    id: '',
    question: '如何使用右转AI进行创意写作？',
    answer: '右转AI可以帮助您进行创意写作。您可以提供一个主题或开头，然后让AI继续创作。也可以指定写作风格、长度和格式要求，AI会根据您的需求生成相应的内容。通过与AI的对话，您可以不断调整和完善您的创意，直到满意为止。',
    time: new Date()
})

// 分享状态
const shareStatus = ref('')

// 格式化日期
const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

// 获取当前页面URL
const getShareUrl = () => {
    return window.location.href
}

// 分享到微信
const shareToWeChat = () => {
    // 微信分享通常需要使用微信SDK，这里简化为显示二维码提示
    alert('请打开微信扫一扫，扫描二维码进行分享')
}

// 分享到微博
const shareToWeibo = () => {
    const shareUrl = encodeURIComponent(getShareUrl())
    const title = encodeURIComponent(`我在右转AI与AI进行了一次对话：${conversation.question.substring(0, 30)}...`)
    window.open(`https://service.weibo.com/share/share.php?url=${shareUrl}&title=${title}`, '_blank')
}

// 分享到QQ
const shareToQQ = () => {
    const shareUrl = encodeURIComponent(getShareUrl())
    const title = encodeURIComponent(`右转AI对话分享`)
    const summary = encodeURIComponent(conversation.question.substring(0, 40) + '...')
    window.open(`https://connect.qq.com/widget/shareqq/index.html?url=${shareUrl}&title=${title}&summary=${summary}`, '_blank')
}

// 复制分享链接
const copyShareLink = () => {
    navigator.clipboard.writeText(getShareUrl())
        .then(() => {
            shareStatus.value = '链接已复制'
            setTimeout(() => {
                shareStatus.value = ''
            }, 2000)
        })
        .catch(err => {
            console.error('复制失败:', err)
            shareStatus.value = '复制失败，请手动复制'
        })
}

// 打开APP
const openApp = () => {
    // 尝试打开APP
    window.location.href = 'youzhuanai://chat/' + conversation.id

    // 如果3秒后还在当前页面，说明没有安装APP，跳转到下载页
    setTimeout(() => {
        window.location.href = 'https://youzhuanai.com/download'
    }, 3000)
}

// 加载分享数据
const loadShareData = (shareId: string) => {
    const shares = JSON.parse(localStorage.getItem('shares') || '[]')
    const shareData = shares.find((item: any) => item.id === shareId)

    if (shareData) {
        conversation.id = shareData.id
        conversation.question = shareData.question
        conversation.answer = shareData.answer
        conversation.time = new Date(shareData.time)
    } else {
        // 如果找不到分享数据，显示默认内容或返回首页
        console.error('分享内容不存在或已过期')
    }
}

onMounted(() => {
    // 从URL获取对话ID
    const id = route.params.id || route.query.id
    if (id) {
        conversation.id = String(id)
        loadShareData(String(id))
    }
})
</script>

<style lang="less" scoped>
@import '../../assets/styles.less';
@import '../../assets/property.less';

.share-page {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding: 20px;
    display: flex;
    justify-content: center;
    font-family: "Microsoft YaHei", "微软雅黑", sans-serif;
}

.share-container {
    width: 100%;
    max-width: 600px;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.share-header {
    display: flex;
    align-items: center;
    padding: 16px;
    background-color: #f9f9f9;
    border-bottom: 1px solid #eaeaea;

    .logo {
        width: 40px;
        height: 40px;
        margin-right: 12px;
    }

    .app-info {
        .app-name {
            font-size: 18px;
            font-weight: 600;
            color: #333;
        }

        .app-desc {
            font-size: 12px;
            color: #666;
        }
    }
}

.chat-content {
    padding: 20px;

    .chat-item {
        display: flex;
        margin-bottom: 20px;

        .avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 14px;
            margin-right: 10px;
            flex-shrink: 0;
        }

        .message {
            padding: 12px 16px;
            border-radius: 12px;
            max-width: calc(100% - 60px);
            line-height: 1.5;
            font-size: 15px;
            word-break: break-word;
        }

        &.user {
            .avatar {
                background-color: #e6f7ff;
                color: #1890ff;
            }

            .message {
                background-color: #e6f7ff;
                color: #333;
            }
        }

        &.ai {
            .avatar {
                background-color: #f6f6f6;
                color: #666;
            }

            .message {
                background-color: #f6f6f6;
                color: #333;
                position: relative;

                &:before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    height: 60%;
                    width: 3px;
                    background: linear-gradient(to bottom, #1890ff, #36cfc9);
                    border-radius: 3px;
                }
            }
        }
    }
}

.share-actions {
    padding: 0 20px 20px;

    .share-title {
        font-size: 14px;
        color: #666;
        margin-bottom: 10px;
    }

    .share-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;

        .share-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 10px;
            border: none;
            background-color: #f9f9f9;
            border-radius: 8px;
            cursor: pointer;
            font-size: 12px;
            color: #333;
            transition: all 0.3s ease;

            &:hover {
                background-color: #f0f0f0;
                transform: translateY(-2px);
            }

            .share-icon {
                display: block;
                width: 24px;
                height: 24px;
                margin-bottom: 5px;
                background-size: contain;
                background-repeat: no-repeat;
                background-position: center;
            }

            &.wechat .share-icon {
                background-color: #07C160;
                border-radius: 50%;
            }

            &.weibo .share-icon {
                background-color: #E6162D;
                border-radius: 50%;
            }

            &.qq .share-icon {
                background-color: #12B7F5;
                border-radius: 50%;
            }

            &.copy .share-icon {
                background-color: #666;
                border-radius: 50%;
            }
        }
    }
}

.share-footer {
    padding: 16px;
    border-top: 1px solid #eaeaea;
    text-align: center;

    .watermark {
        font-size: 12px;
        color: #999;
        margin-bottom: 16px;
    }

    .open-app-btn {
        display: block;
        background: linear-gradient(135deg, #1890ff, #36cfc9);
        color: white;
        padding: 12px;
        border-radius: 24px;
        font-size: 16px;
        font-weight: 500;
        text-decoration: none;
        text-align: center;
        box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
        transition: all 0.3s ease;
        cursor: pointer;

        &:hover {
            box-shadow: 0 6px 16px rgba(24, 144, 255, 0.3);
            transform: translateY(-2px);
        }
    }
}

.toast-notification {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 10px 20px;
    border-radius: 4px;
    font-size: 14px;
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 1000;

    &.show {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
    }
}

@media (max-width: 480px) {
    .share-page {
        padding: 0;
    }

    .share-container {
        border-radius: 0;
        box-shadow: none;
        height: 100vh;
        display: flex;
        flex-direction: column;
    }

    .chat-content {
        flex: 1;
        overflow-y: auto;
    }

    .share-actions {
        padding: 15px;

        .share-buttons {
            justify-content: space-around;
        }
    }
}
</style>
