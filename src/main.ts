import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { useIntersectionObserver } from '@vueuse/core'
import { initPerformanceMonitoring } from './utils/performance' // 引入性能监控初始化函数

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// 注入性能监控（使用统一的初始化函数）
initPerformanceMonitoring()

app.mount('#app')

app.directive('lazyimg', {  // <img loading="lazy"> 也可以实现懒加载(最简单)
    mounted(el) {
        const originsrc = el.src
        el.src = "#"
        const { stop } = useIntersectionObserver(el, ([{ isIntersecting }]) => {
            if (isIntersecting) {
                el.src = originsrc
                console.log('图片出来了')
                stop()
            }
        })
    }
})

// 淡入动画
app.directive('fade-in', {
    mounted(el) {
        const { stop } = useIntersectionObserver(el, ([{ isIntersecting }]) => {
            if (isIntersecting) {
                el.classList.add('fade-in-animation')
                stop()
            }
        }, {
            threshold: 0.15,  // 显示元素的百分之多少时,视为组件将要显示
            rootMargin: '10px 0px'  // 上下扩展10px, 防止频闪
        })
    }
})
