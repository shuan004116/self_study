import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API_BASE = '/api'

export interface LLMConfig {
  provider: string
  api_key: string
  api_key_masked?: string
  api_base_url: string
  api_chat_model: string
  api_embedding_model: string
  ollama_base_url: string
  ollama_chat_model: string
}

export const useSettingsStore = defineStore('settings', () => {
  const config = ref<LLMConfig | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const testing = ref(false)
  const testResult = ref<{ status: string; message: string } | null>(null)

  const isConfigured = computed(() => {
    if (!config.value) return false
    if (config.value.provider === 'openai_compatible') {
      return !!(config.value.api_key && config.value.api_base_url && config.value.api_chat_model)
    }
    return !!config.value.ollama_base_url
  })

  const providerName = computed(() => {
    if (!config.value) return '未配置'
    if (config.value.provider === 'ollama') return 'Ollama 本地'
    const url = config.value.api_base_url || ''
    if (url.includes('deepseek')) return 'DeepSeek'
    if (url.includes('siliconflow')) return 'SiliconFlow'
    if (url.includes('dashscope') || url.includes('aliyuncs')) return '通义千问'
    if (url.includes('openai')) return 'OpenAI'
    return '自定义 API'
  })

  async function loadConfig() {
    loading.value = true
    try {
      const res = await fetch(`${API_BASE}/settings/llm`)
      if (res.ok) {
        config.value = await res.json()
      }
    } catch (err) {
      console.error('加载配置失败:', err)
    } finally {
      loading.value = false
    }
  }

  async function saveConfig(newConfig: Partial<LLMConfig>) {
    saving.value = true
    try {
      const payload = { ...config.value, ...newConfig }
      const res = await fetch(`${API_BASE}/settings/llm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const data = await res.json()
        config.value = data.config
        return true
      }
      return false
    } catch (err) {
      console.error('保存配置失败:', err)
      return false
    } finally {
      saving.value = false
    }
  }

  async function testConnection(testConfig: Partial<LLMConfig>) {
    testing.value = true
    testResult.value = null
    try {
      const payload = { ...config.value, ...testConfig }
      const res = await fetch(`${API_BASE}/settings/llm/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        testResult.value = await res.json()
      } else {
        testResult.value = { status: 'error', message: '请求失败' }
      }
    } catch (err: any) {
      testResult.value = { status: 'error', message: err.message || '网络错误' }
    } finally {
      testing.value = false
    }
  }

  return {
    config,
    loading,
    saving,
    testing,
    testResult,
    isConfigured,
    providerName,
    loadConfig,
    saveConfig,
    testConnection,
  }
})
