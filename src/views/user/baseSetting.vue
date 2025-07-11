<template>
    <div class="settings-panel">
        <div class="close-btn" @click="emit('closeSetting')">
            <img :src="closeIcon" alt="关闭" class="close-icon">
        </div>

        <div class="user-info">
            <div class="user-id">右转号：638251347</div>
            <div class="user-name">我不是用户</div>
        </div>

        <div class="settings-list">
            <div v-for="(item, index) in settingsList" :key="index" class="settings-item" @click="item.action">
                <div class="item-left">
                    <img :src="item.icon" :alt="item.title" class="icon">
                    <span>{{ item.title }}</span>
                </div>
                <div v-if="item.type === 'select'" class="language-select">
                    {{ item.value }}
                </div>
                <div v-if="item.type === 'toggle'" class="toggle-switch">
                    <label :for="'switch-' + index"></label>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import closeIcon from '../../assets/img/关闭.svg'
import editIcon from '../../assets/img/编辑.svg'
import languageIcon from '../../assets/img/语言.svg'
import themeIcon from '../../assets/img/日月.svg'
import helpIcon from '../../assets/img/help.svg'
import share1Icon from '../../assets/img/share1.svg'
import aboutUsIcon from '../../assets/img/aboutUs.svg'
import { ref, onMounted, computed } from 'vue'

const emit = defineEmits(['closeSetting'])

const currentTheme = ref<string>('light')

const toggleTheme = () => {
    const newTheme = currentTheme.value === 'light' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', newTheme)
    currentTheme.value = newTheme
    localStorage.setItem('theme', newTheme)
}

const settingsList = computed(() => [
    { icon: editIcon, title: '编辑个人资料', type: 'action', action: () => { } },
    { icon: languageIcon, title: '语言设置', type: 'select', value: '中文（简体）', action: () => { } },
    { icon: themeIcon, title: '主题切换', type: 'select', value: currentTheme.value === 'light' ? '浅色' : '深色', action: toggleTheme },
    { icon: helpIcon, title: '帮助与反馈', type: 'action', action: () => { } },
    { icon: share1Icon, title: '分享豆包给好友', type: 'action', action: () => { } },
    { icon: aboutUsIcon, title: '关于豆包大模型', type: 'action', action: () => { } }
])

onMounted(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) currentTheme.value = savedTheme
})
</script>

<style lang="less" scoped>
.settings-panel {
    position: relative;
    background-color: var(--bg-color);
    border-radius: 16px;
    box-shadow: 0 0 10px 0 var(--shadow-color);
    width: 320px;
    padding: 20px;

    .user-info {
        text-align: center;
        margin-bottom: 24px;

        .user-id {
            color: var(--text-secondary);
            font-size: 14px;
            margin-bottom: 8px;
        }

        .user-name {
            font-size: 18px;
            font-weight: 600;
            color: var(--text-color);
        }
    }

    .settings-list {
        .settings-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 8px 12px;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
                background-color: var(--hover-bg);
                border-radius: 10px;
            }

            .item-left {
                display: flex;
                align-items: center;
                gap: 12px;

                .icon {
                    width: 22px;
                    height: 22px;
                }

                span {
                    font-size: 14px;
                    color: var(--text-color);
                }
            }

            .language-select {
                color: var(--text-secondary);
                font-size: 14px;
            }

            .toggle-switch {
                position: relative;
                width: 40px;
                height: 20px;

                label {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: var(--border-color);
                    transition: .4s;
                    border-radius: 20px;

                    &:before {
                        position: absolute;
                        content: "";
                        height: 16px;
                        width: 16px;
                        left: 2px;
                        bottom: 2px;
                        background-color: var(--bg-color);
                        transition: .4s;
                        border-radius: 50%;
                    }
                }
            }
        }
    }

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
}
</style>