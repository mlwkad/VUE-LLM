import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { useIntersectionObserver } from '@vueuse/core'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.mount('#app')

app.directive('lazyimg', {
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
