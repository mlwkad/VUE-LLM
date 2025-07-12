import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useChatStore = defineStore('chat', () => {
    const selectedLanguage = ref('')
    const input = ref('')
    const result = computed(() => `使用${selectedLanguage.value || 'javascript'}语言帮我解决:${input.value}`)
    return {
        selectedLanguage,
        result,
        input
    }
})  