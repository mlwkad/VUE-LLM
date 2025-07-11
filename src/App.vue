<template>
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style lang="less">
@import './assets/styles.less'; // 主题切换

body {
  overflow-y: hidden;
  margin: 0px;
}
</style>
