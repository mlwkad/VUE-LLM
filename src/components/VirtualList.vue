<template>
  <div ref="containerRef" class="virtual-list" @scroll="handleScroll">
    <div :style="{ height: totalHeight + 'px' }" class="virtual-list-phantom"></div>
    <div :style="{ transform: `translateY(${offsetY}px)` }" class="virtual-list-content">
      <div
        v-for="item in visibleData"
        :key="item.id"
        :data-id="item.id"
        class="virtual-list-item"
        ref="itemRefs"
      >
        <slot :item="item" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

interface Props {
  itemList: any[]
  visibleCount?: number
  bufferSize?: number // 缓冲区大小
}

const props = withDefaults(defineProps<Props>(), {
  visibleCount: 10,
  bufferSize: 5
})

const containerRef = ref<HTMLElement | null>(null)
const itemRefs = ref<HTMLElement[]>([])
const scrollTop = ref(0)
const isScrolling = ref(false)
const itemHeights = ref<number[]>([])
let scrollTimer: number | null = null

// 初始化每项的高度为默认值
const initializeItemHeights = () => {
  const heights: number[] = []
  for (let i = 0; i < props.itemList.length; i++) {
    heights.push(80) // 默认高度
  }
  itemHeights.value = heights
}

// 更新指定项的高度
const updateItemHeight = (index: number, height: number) => {
  if (itemHeights.value[index] !== height) {
    itemHeights.value[index] = height
  }
}

// 计算总高度
const totalHeight = computed(() => {
  return itemHeights.value.reduce((sum, height) => sum + height, 0)
})

// 计算每项的累积高度（用于定位）
const cumulativeHeights = computed(() => {
  const cumulative: number[] = [0];
  itemHeights.value.forEach((height, index) => {
    cumulative.push(cumulative[index] + height);
  });
  return cumulative;
})

// 计算开始索引（包含缓冲区）
const startIndex = computed(() => {
  const heights = cumulativeHeights.value
  let index = heights.findIndex((height, i) => {
    return height <= scrollTop.value && 
           (i >= heights.length - 1 || heights[i + 1] > scrollTop.value)
  })
  
  // 添加缓冲区
  index = Math.max(0, index - props.bufferSize)
  return index
})

// 计算结束索引（包含缓冲区）
const endIndex = computed(() => {
  const start = Math.max(0, startIndex.value)
  let count = 0
  let index = start
  
  // 计算可见项数量（包括缓冲区）
  const totalVisibleCount = props.visibleCount + props.bufferSize * 2
  
  while (index < props.itemList.length && count < totalVisibleCount) {
    count++
    index++
  }
  
  // 添加缓冲区
  index = Math.min(index + props.bufferSize, props.itemList.length)
  return index
})

// 计算可见数据
const visibleData = computed(() => {
  const start = Math.max(0, startIndex.value)
  const end = Math.min(endIndex.value, props.itemList.length)
  return props.itemList.slice(start, end)
})

// 计算偏移量
const offsetY = computed(() => {
  const start = Math.max(0, startIndex.value)
  return cumulativeHeights.value[start]
})

const handleScroll = () => {
  if (containerRef.value) {
    scrollTop.value = containerRef.value.scrollTop
    isScrolling.value = true
    
    // 清除之前的定时器
    if (scrollTimer) {
      window.clearTimeout(scrollTimer)
    }
    
    // 设置新的定时器，在滚动停止后重置滚动状态
    scrollTimer = window.setTimeout(() => {
      isScrolling.value = false
    }, 150)
  }
}

// 更新可见项的高度
const updateVisibleItemHeights = () => {
  nextTick(() => {
    const start = Math.max(0, startIndex.value)
    itemRefs.value.forEach((el, index) => {
      const itemIndex = start + index
      if (el && itemIndex < itemHeights.value.length) {
        updateItemHeight(itemIndex, el.offsetHeight)
      }
    })
  })
}

// 滚动到顶部
const scrollToTop = () => {
  if (containerRef.value) {
    containerRef.value.scrollTop = 0
  }
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (containerRef.value) {
      // 使用平滑滚动
      containerRef.value.scrollTo({
        top: containerRef.value.scrollHeight,
        behavior: 'smooth'
      })
    }
  })
}

defineExpose({
  scrollToTop,
  scrollToBottom
})

// 监听数据变化，自动滚动到底部（仅在用户未手动滚动时）
watch(() => props.itemList.length, () => {
  // 初始化高度数组
  initializeItemHeights()
  
  // 如果用户没有手动滚动，则自动滚动到底部
  if (!isScrolling.value) {
    scrollToBottom()
  }
})

// 监听可见数据变化，更新项的高度
watch([visibleData, startIndex], () => {
  updateVisibleItemHeights()
}, { flush: 'post' })

onMounted(() => {
  // 初始化高度数组
  initializeItemHeights()
})

onUnmounted(() => {
  if (scrollTimer) {
    window.clearTimeout(scrollTimer)
  }
})
</script>

<style scoped>
.virtual-list {
  position: relative;
  height: 100%;
  overflow: auto;
  will-change: transform;
  scroll-behavior: smooth;
}

.virtual-list-phantom {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: -1;
}

.virtual-list-content {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
}

.virtual-list-item {
  display: flex;
  flex-direction: column;
}
</style>