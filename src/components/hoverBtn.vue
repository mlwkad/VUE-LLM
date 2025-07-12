<template>
    <div class="hover-btn">
        <img :src=props.src class="icon" @mouseenter="isHover = true" @mouseleave="isHover = false">
        <div class="title" v-show="isHover">{{ props.title }}</div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isHover = ref(false)

const props = defineProps({
    src: { type: String, required: true },
    title: { type: String, required: true },
    width: { type: String, default: '20px' },
    direction: { type: String, default: '-110%' },
    directionY: { type: String, default: '-50%' }
})
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
        width: v-bind(width);
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
        top: 50%;
        left: 0;
        transform: translate(v-bind(direction), v-bind(directionY));
        background-color: #aeaeae5c;
        border-radius: 5px;
        padding: 4px;
        background-color: rgb(128, 128, 128);
        white-space: nowrap;
        transition: all 0.3s ease;
    }
}
</style>