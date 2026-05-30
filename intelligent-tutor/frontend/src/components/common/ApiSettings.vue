<template>
  <el-dialog
    v-model="visible"
    title="API 设置"
    width="520px"
    :close-on-click-modal="false"
  >
    <div class="api-settings">
      <el-form label-position="top" size="default">
        <!-- Provider Presets -->
        <el-form-item label="API 服务商">
          <el-select v-model="form.provider" style="width: 100%" @change="onProviderChange">
            <el-option label="OpenAI 兼容 API" value="openai_compatible" />
            <el-option label="Ollama 本地" value="ollama" />
          </el-select>
        </el-form-item>

        <!-- Quick Presets (for openai_compatible) -->
        <el-form-item label="快速选择" v-if="form.provider === 'openai_compatible'">
          <div class="preset-buttons">
            <el-button
              v-for="p in presets"
              :key="p.name"
              :type="activePreset === p.name ? 'primary' : 'default'"
              plain
              size="small"
              @click="applyPreset(p)"
            >
              {{ p.name }}
            </el-button>
          </div>
        </el-form-item>

        <!-- API Key -->
        <el-form-item
          v-if="form.provider === 'openai_compatible'"
          label="API Key"
          required
        >
          <el-input
            v-model="form.api_key"
            type="password"
            show-password
            placeholder="sk-..."
          />
          <div class="form-tip" v-if="savedKeyHint">
            已保存: {{ savedKeyHint }}
          </div>
        </el-form-item>

        <!-- Base URL -->
        <el-form-item
          v-if="form.provider === 'openai_compatible'"
          label="API 地址"
          required
        >
          <el-input v-model="form.api_base_url" placeholder="https://api.deepseek.com/v1" />
        </el-form-item>

        <!-- Model Name -->
        <el-form-item
          v-if="form.provider === 'openai_compatible'"
          label="模型名称"
          required
        >
          <el-input v-model="form.api_chat_model" placeholder="deepseek-chat" />
        </el-form-item>

        <!-- Ollama settings -->
        <template v-if="form.provider === 'ollama'">
          <el-form-item label="Ollama 地址" required>
            <el-input v-model="form.ollama_base_url" placeholder="http://localhost:11434" />
          </el-form-item>
          <el-form-item label="模型名称" required>
            <el-input v-model="form.ollama_chat_model" placeholder="qwen2.5:14b" />
          </el-form-item>
        </template>
      </el-form>

      <!-- Test Result -->
      <el-alert
        v-if="store.testResult"
        :type="store.testResult.status === 'ok' ? 'success' : 'error'"
        :title="store.testResult.message"
        show-icon
        :closable="true"
        @close="store.testResult = null"
        class="test-result"
      />

      <div class="dialog-footer">
        <el-button @click="testConnection" :loading="store.testing" :disabled="!canTest">
          <el-icon><Connection /></el-icon>
          测试连接
        </el-button>
        <el-button type="primary" @click="saveSettings" :loading="store.saving">
          <el-icon><Check /></el-icon>
          保存配置
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Connection, Check } from '@element-plus/icons-vue'
import { useSettingsStore, type LLMConfig } from '../../stores/settings'

const store = useSettingsStore()

const visible = defineModel<boolean>('visible', { default: false })

const presets = [
  { name: 'DeepSeek', api_base_url: 'https://api.deepseek.com/v1', api_chat_model: 'deepseek-chat' },
  { name: 'SiliconFlow', api_base_url: 'https://api.siliconflow.cn/v1', api_chat_model: 'Qwen/Qwen2.5-14B-Instruct' },
  { name: '通义千问', api_base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1', api_chat_model: 'qwen-plus' },
  { name: 'OpenAI', api_base_url: 'https://api.openai.com/v1', api_chat_model: 'gpt-4o-mini' },
]

const activePreset = ref('')

const form = reactive<LLMConfig>({
  provider: 'openai_compatible',
  api_key: '',
  api_base_url: 'https://api.deepseek.com/v1',
  api_chat_model: 'deepseek-chat',
  api_embedding_model: '',
  ollama_base_url: 'http://localhost:11434',
  ollama_chat_model: 'qwen2.5:14b',
})

const savedKeyHint = computed(() => store.config?.api_key_masked || '')

const canTest = computed(() => {
  if (form.provider === 'openai_compatible') {
    return !!(form.api_key && form.api_base_url && form.api_chat_model)
  }
  return !!form.ollama_base_url
})

function onProviderChange() {
  store.testResult = null
}

function applyPreset(p: typeof presets[0]) {
  form.api_base_url = p.api_base_url
  form.api_chat_model = p.api_chat_model
  activePreset.value = p.name
}

function loadFromStore() {
  if (store.config) {
    form.provider = store.config.provider
    form.api_key = store.config.api_key || ''
    form.api_base_url = store.config.api_base_url
    form.api_chat_model = store.config.api_chat_model
    form.ollama_base_url = store.config.ollama_base_url
    form.ollama_chat_model = store.config.ollama_chat_model
  }
}

watch(visible, (val) => {
  if (val) {
    loadFromStore()
    store.testResult = null
  }
})

async function testConnection() {
  await store.testConnection({ ...form })
}

async function saveSettings() {
  const success = await store.saveConfig({ ...form })
  if (success) {
    ElMessage.success('配置已保存')
    visible.value = false
  } else {
    ElMessage.error('保存失败')
  }
}
</script>

<style scoped>
.api-settings {
  padding: 8px 0;
}
.preset-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.form-tip {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}
.test-result {
  margin: 16px 0;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}
</style>
