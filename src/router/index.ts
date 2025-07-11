import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: () => import('../views/AIChat/cover.vue'),
            children: [
                // {
                //     path: '/',
                //     component: () => import('../views/AIChat/content.vue')
                // }
            ]
        }
    ]
})
export default router