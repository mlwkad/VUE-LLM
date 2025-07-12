<template>
    <div class="alert" v-if="isShow">
        <div class="alert-header">
            <div class="alert-title">{{ props.title }}</div>
            <div class="alert-close" @click="isShow = false">
                <img src="../assets/img/close.svg" alt="close" @click="closeHandler" />
            </div>
        </div>
        <div class="alert-content">{{ props.content }}</div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { ref } from 'vue';

const isShow = ref(false)
let timer: any = null

const props = defineProps({
    title: { type: String, default: '' },
    content: { type: String, default: '' },
    duration: { type: Number, default: 3000 }
})

const closeHandler = () => {
    isShow.value = false
    clearTimeout(timer)
}

onMounted(() => {
    timer = setTimeout(() => {

        isShow.value = false
    }, props.duration)
})
</script>

<style lang="less" scoped>
.alert {
    position: fixed;
    top: 20%;
    left: 50%;
    transform: translate(-50%, 0);
    width: 300px;
    height: 100px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
    z-index: 1000;

    .alert-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .alert-title {
            font-size: 16px;
            font-weight: bold;
        }

        .alert-close {
            width: 20px;
            height: 20px;
            cursor: pointer;
        }
    }

    .alert-content {
        font-size: 14px;
    }


}
</style>
