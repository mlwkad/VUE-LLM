<template>
    <div class="help-panel">
        <div class="close-btn" @click="router.back()">
            <img :src="closeIcon" alt="关闭" class="close-icon">
        </div>

        <div class="help-header">
            <h2>帮助与反馈</h2>
        </div>

        <div class="help-content">
            <div class="tabs">
                <div :class="['tab', activeTab === 'faq' ? 'active' : '']" @click="activeTab = 'faq'">常见问题</div>
                <div :class="['tab', activeTab === 'feedback' ? 'active' : '']" @click="activeTab = 'feedback'">意见反馈
                </div>
            </div>

            <!-- 常见问题 -->
            <div v-if="activeTab === 'faq'" class="faq-section">
                <div v-for="(faq, index) in faqList" :key="index" class="faq-item">
                    <div class="faq-question" @click="toggleFaq(index)">
                        <span>{{ faq.question }}</span>
                        <img :src="expandIcon" class="expand-icon"
                            :style="{ transform: expandedFaqs.includes(index) ? 'rotate(180deg)' : 'rotate(0deg)' }">
                    </div>
                    <div class="faq-answer" v-show="expandedFaqs.includes(index)">
                        {{ faq.answer }}
                    </div>
                </div>
            </div>

            <!-- 意见反馈 -->
            <div v-else class="feedback-section">
                <div class="form-group">
                    <label>反馈类型</label>
                    <div class="feedback-types">
                        <div v-for="(type, index) in feedbackTypes" :key="index"
                            :class="['feedback-type', feedbackForm.type === type ? 'active' : '']"
                            @click="feedbackForm.type = type">
                            {{ type }}
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label>反馈内容</label>
                    <textarea v-model="feedbackForm.content" placeholder="请详细描述您遇到的问题或建议..." rows="5"></textarea>
                </div>

                <div class="form-group">
                    <label>联系方式 (选填)</label>
                    <input type="text" v-model="feedbackForm.contact" placeholder="邮箱或手机号，方便我们联系您" />
                </div>

                <button class="submit-btn" @click="submitFeedback">提交反馈</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import closeIcon from '../../assets/img/关闭.svg'
import expandIcon from '../../assets/img/箭头.svg'

const router = useRouter()
const activeTab = ref('faq')
const expandedFaqs = ref<number[]>([])

// 常见问题列表
const faqList = [
    {
        question: '如何开启联网搜索功能？',
        answer: '在对话框下方，点击联网搜索按钮即可开启。开启后，右转将能够获取互联网上的最新信息来回答您的问题。'
    },
    {
        question: '如何切换深色/浅色模式？',
        answer: '点击右上角的设置按钮，在弹出的设置面板中找到"主题切换"选项，点击即可切换深色或浅色模式。'
    },
    {
        question: '如何清空聊天记录？',
        answer: '在对话界面，点击输入框旁的清空按钮即可清空当前对话。如需删除特定历史对话，可在左侧历史记录中找到并点击删除按钮。'
    },
    {
        question: '如何保存重要的对话内容？',
        answer: '您可以使用复制功能保存重要内容，只需点击对话气泡旁的复制按钮即可将内容复制到剪贴板。'
    }
]

// 反馈类型
const feedbackTypes = ['功能建议', '产品体验', '内容质量', 'BUG反馈']

// 反馈表单
const feedbackForm = ref({
    type: '功能建议',
    content: '',
    contact: '',
    files: [] as File[]
})

// 展开/收起FAQ
const toggleFaq = (index: number) => {
    const position = expandedFaqs.value.indexOf(index)
    if (position > -1) {
        expandedFaqs.value.splice(position, 1)
    } else {
        expandedFaqs.value.push(index)
    }
}

// 提交反馈
const submitFeedback = () => {
    if (!feedbackForm.value.content) {
        alert('请填写反馈内容')
        return
    }

    // 模拟提交
    alert('感谢您的反馈，我们会尽快处理！')

    // 重置表单
    feedbackForm.value = {
        type: '功能建议',
        content: '',
        contact: '',
        files: []
    }
}
</script>

<style lang="less" scoped>
@import '../../assets/styles.less';
@import '../../assets/property.less';

.help-panel {
    position: relative;
    background-color: var(--bg-color);
    border-radius: 16px;
    box-shadow: 0 0 10px 0 var(--shadow-color);
    width: 380px;
    padding: 30px;
    margin: auto;

    .close-btn {
        position: absolute;
        top: 20px;
        right: 20px;
        cursor: pointer;

        .close-icon {
            width: 20px;
            height: 20px;
            transition: all 0.3s ease;

            &:hover {
                transform: scale(1.1);
            }
        }
    }

    .help-header {
        text-align: center;
        margin-bottom: 20px;

        h2 {
            font-size: 24px;
            font-weight: 600;
            color: var(--text-color);
            margin: 0;
        }
    }

    .help-content {
        .tabs {
            display: flex;
            background-color: var(--hover-bg);
            border-radius: 8px;
            margin-bottom: 20px;
            overflow: hidden;

            .tab {
                flex: 1;
                text-align: center;
                padding: 12px;
                cursor: pointer;
                font-size: 16px;
                color: var(--text-secondary);
                transition: all 0.3s ease;

                &.active {
                    background-color: var(--ai-msg-border);
                    color: white;
                    font-weight: 500;
                }
            }
        }

        .faq-section {
            .faq-item {
                margin-bottom: 10px;
                border-bottom: 1px solid var(--border-color);

                .faq-question {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 0;
                    cursor: pointer;
                    font-size: 16px;
                    color: var(--text-color);
                    font-weight: 500;

                    .expand-icon {
                        width: 16px;
                        height: 16px;
                        transition: all 0.3s ease;
                    }
                }

                .faq-answer {
                    padding: 0 0 15px;
                    color: var(--text-secondary);
                    font-size: 14px;
                    line-height: 1.6;
                }
            }
        }

        .feedback-section {
            .form-group {
                margin-bottom: 20px;

                label {
                    display: block;
                    font-size: 14px;
                    color: var(--text-color);
                    margin-bottom: 8px;
                    font-weight: 500;
                }

                input,
                textarea {
                    width: 93%;
                    padding: 10px 12px;
                    border-radius: 8px;
                    border: 1px solid var(--border-color);
                    background-color: var(--input-bg);
                    color: var(--input-text);
                    font-size: 14px;
                    resize: none;

                    &:focus {
                        outline: none;
                        border-color: var(--ai-msg-border);
                    }

                    &::placeholder {
                        color: var(--text-secondary);
                    }
                }

                .feedback-types {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;

                    .feedback-type {
                        padding: 8px 12px;
                        border-radius: 20px;
                        background-color: var(--hover-bg);
                        color: var(--text-color);
                        font-size: 14px;
                        cursor: pointer;
                        transition: all 0.3s ease;

                        &.active {
                            background-color: var(--ai-msg-border);
                            color: white;
                        }
                    }
                }

                .upload-area {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 15px;
                    border: 1px dashed var(--border-color);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;

                    &:hover {
                        border-color: var(--ai-msg-border);
                        background-color: var(--hover-bg);
                    }

                    .upload-icon {
                        width: 24px;
                        height: 24px;
                    }

                    .upload-text {
                        color: var(--text-color);
                        font-size: 14px;

                        .upload-tip {
                            font-size: 12px;
                            color: var(--text-secondary);
                            margin-top: 2px;
                        }
                    }
                }
            }

            .uploaded-files {
                margin-bottom: 20px;

                .file-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 12px;
                    background-color: var(--hover-bg);
                    border-radius: 6px;
                    margin-bottom: 8px;

                    .file-name {
                        font-size: 14px;
                        color: var(--text-color);
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        max-width: 280px;
                    }

                    .delete-icon {
                        width: 16px;
                        height: 16px;
                        cursor: pointer;
                        transition: all 0.3s ease;

                        &:hover {
                            transform: scale(1.1);
                        }
                    }
                }
            }

            .submit-btn {
                width: 100%;
                padding: 12px;
                border: none;
                border-radius: 8px;
                background-color: var(--ai-msg-border);
                color: white;
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;

                &:hover {
                    opacity: 0.9;
                }
            }
        }
    }
}
</style>
