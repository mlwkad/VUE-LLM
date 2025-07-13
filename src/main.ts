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

// 简单虚拟列表指令
app.directive('virtual-scroll', {
    mounted(el: HTMLElement) {
        // 保存原始DOM和精确高度
        const originalHTML = el.outerHTML
        let cachedHeight: number | null = null

        // 获取精确高度的函数
        const getAccurateHeight = (element: HTMLElement): number => {
            if (cachedHeight !== null) return cachedHeight
            const rect = element.getBoundingClientRect()
            const computedStyle = window.getComputedStyle(element)
            const marginTop = parseFloat(computedStyle.marginTop) || 0
            const marginBottom = parseFloat(computedStyle.marginBottom) || 0
            const totalHeight = rect.height + marginTop + marginBottom
            cachedHeight = Math.max(totalHeight, element.offsetHeight)
            return cachedHeight
        }

        // 创建占位元素
        const createPlaceholder = (height: number) => {
            const placeholder = document.createElement('div')
            placeholder.style.cssText = `
                height: ${height}px;
                width: 100%;
                background: transparent;
                pointer-events: none;
                margin: 0;
                padding: 0;
                border: none;
                flex-shrink: 0;
            `
            placeholder.dataset.placeholder = 'true'
            return placeholder
        }

        // 递归观察函数
        const observeElement = (element: HTMLElement) => {
            const { stop } = useIntersectionObserver(element, ([{ isIntersecting }]) => {
                if (isIntersecting) {
                    if (element.dataset.placeholder) {  // 恢复成真实DOM
                        const temp = document.createElement('div')
                        temp.innerHTML = originalHTML
                        const realElement = temp.firstElementChild as HTMLElement

                        if (realElement && element.parentNode) {
                            // 使用 requestAnimationFrame 确保DOM操作在合适的时机执行
                            requestAnimationFrame(() => {
                                element.parentNode?.replaceChild(realElement, element)
                                stop() // 停止观察旧元素
                                observeElement(realElement) // 开始观察新元素
                                console.log('恢复')
                            })
                        }
                    }
                } else {
                    if (!element.dataset.placeholder) {  // 替换为占位元素
                        const currentHeight = getAccurateHeight(element)
                        const placeholder = createPlaceholder(currentHeight)

                        if (element.parentNode) {
                            // 使用 requestAnimationFrame 确保DOM操作在合适的时机执行
                            requestAnimationFrame(() => {
                                element.parentNode?.replaceChild(placeholder, element)
                                stop() // 停止观察旧元素
                                observeElement(placeholder) // 开始观察新元素
                                console.log('替换')
                            })
                        }
                    }
                }
            }, {
                rootMargin: '50px 0px',
                threshold: 0
            })
        }

        observeElement(el)
    }
})

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
