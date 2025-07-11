<template>
    <div class="hover-btn" @mouseenter="isHover = true" @mouseleave="isHover = false">
        <img :src=props.src class="icon">
        <div class="title" v-show="isHover">{{ props.title }}</div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
    src: { type: String, required: true },
    title: { type: String, required: true }
})
const isHover = ref(false)
</script>

<style scoped lang="less">
@import '../assets/styles.less';
@import '../assets/property.less';

.hover-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    .icon {
        width: 20px;
        padding: 5px;
        transition: all 0.3s ease;

        &:hover {
            background-color: rgba(128, 128, 128, 0.462);
            border-radius: 12px;
        }
    }

    .title {
        font-size: 12px;
        color: #ffffff;
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translate(-50%, 120%);
        background-color: #aeaeae5c;
        border-radius: 5px;
        padding: 4px;
        background-color: rgba(128, 128, 128, 0.462);
        white-space: nowrap;
        transition: all 0.3s ease;
        z-index: 99999999;
    }
}
</style>