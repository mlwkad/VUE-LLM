import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: () => import('../views/AIChat/cover.vue'),
            children: [
                {
                    path: '',
                    component: () => import('../views/AIChat/content.vue')
                },
                {
                    path: 'login',
                    component: () => import('../views/user/login.vue')
                },
                {
                    path: 'about',
                    component: () => import('../views/user/about.vue')
                },
                {
                    path: 'help',
                    component: () => import('../views/user/help.vue')
                },
                {
                    path: 'share',
                    component: () => import('../views/share/share.vue')
                }
            ]
        }
    ]
})
export default router