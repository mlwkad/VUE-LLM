<template>
    <div class="hover-btn" :class="theme">
        <!-- 图标元素 -->
        <img :src="src" class="icon" @mouseenter="isHover = true" @mouseleave="isHover = false" :style="{ width }"
            :alt="title">

        <!-- 提示文本框 -->
        <div class="title" v-if="isHover" :style="getTooltipStyle">
            {{ title }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 定义位置选项类型
// type Position = 'top' | 'bottom' | 'left' | 'right' |
// 'topleft' | 'topright' | 'bottomleft' | 'bottomright' | 'center'

// 定义主题类型
// type Theme = 'dark' | 'light' | 'primary'

const props = defineProps({
    // 核心属性
    src: { type: String, required: true },
    title: { type: String, required: true },

    // 样式属性
    width: { type: String, default: '20px' },
    position: { type: String, default: 'top' },
    theme: { type: String, default: 'dark' },
    offset: { type: Number, default: 8 }
})

// 状态管理
const isHover = ref(false)

// 计算提示框样式
const getTooltipStyle = computed(() => {
    // 根据位置设置定位样式
    switch (props.position) {
        case 'top':
            return {
                bottom: '100%',
                left: '50%',
                transform: `translateX(-50%) translateY(-${props.offset}px)`
            }
        case 'bottom':
            return {
                top: '100%',
                left: '50%',
                transform: `translateX(-50%) translateY(${props.offset}px)`
            }
        case 'left':
            return {
                right: '100%',
                top: '50%',
                transform: `translateY(-50%) translateX(-${props.offset}px)`
            }
        case 'right':
            return {
                left: '100%',
                top: '50%',
                transform: `translateY(-50%) translateX(${props.offset}px)`
            }
        case 'topleft':
            return {
                bottom: '100%',
                left: 0,
                transform: `translateY(-${props.offset}px)`
            }
        case 'topright':
            return {
                bottom: '100%',
                right: 0,
                transform: `translateY(-${props.offset}px)`
            }
        case 'bottomleft':
            return {
                top: '100%',
                left: 0,
                transform: `translateY(${props.offset}px)`
            }
        case 'bottomright':
            return {
                top: '100%',
                right: 0,
                transform: `translateY(${props.offset}px)`
            }
        case 'center':
            return {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            }
        default:
            return {}
    }
})
</script>

<style scoped lang="less">
.hover-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    cursor: pointer;

    .icon {
        padding: 5px;
        transition: all 0.3s ease;
        border: none;
        background: transparent;

        &:hover {
            border-radius: 12px;
        }
    }

    .title {
        position: absolute;
        white-space: nowrap;
        z-index: 10;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    // 深色主题
    &.dark {
        .icon:hover {
            background-color: rgba(128, 128, 128, 0.462);
        }

        .title {
            color: #ffffff;
            background-color: #333333;
        }
    }

    // 浅色主题
    &.light {
        .icon:hover {
            background-color: rgba(220, 220, 220, 0.8);
        }

        .title {
            color: #333333;
            background-color: #ffffff;
        }
    }

    // 主色调主题
    &.primary {
        .icon:hover {
            background-color: rgba(66, 153, 225, 0.2);
        }

        .title {
            color: #ffffff;
            background-color: #4299e1;
        }
    }
}
</style>