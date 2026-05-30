<template>
  <div id="app-container">
    <el-container style="height: 100vh">
      <el-header class="app-header">
        <div class="header-left">
          <router-link to="/" class="logo-link">
            <el-icon :size="24"><School /></el-icon>
            <span class="logo-text">智能学习助手</span>
          </router-link>
        </div>
        <div class="header-right">
          <!-- API Status -->
          <el-tooltip :content="apiStatusTooltip" placement="bottom">
            <el-tag
              :type="apiStatusTagType"
              size="small"
              style="cursor: pointer"
              @click="settingsVisible = true"
            >
              {{ settingsStore.isConfigured ? settingsStore.providerName : '未配置 API' }}
            </el-tag>
          </el-tooltip>

          <!-- Settings button -->
          <el-button circle :icon="Setting" size="small" @click="settingsVisible = true" />

          <!-- Menu -->
          <el-dropdown trigger="click" @command="handleCommand">
            <el-button circle :icon="MoreFilled" size="small" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="new-session">新建会话</el-dropdown-item>
                <el-dropdown-item command="clear-history">清空记录</el-dropdown-item>
                <el-dropdown-item divided command="about">关于</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>

    <!-- API Settings Dialog -->
    <ApiSettings v-model:visible="settingsVisible" />

    <!-- About Dialog -->
    <el-dialog v-model="aboutVisible" title="关于智能学习助手" width="400px">
      <div class="about-content">
        <p><strong>版本:</strong> 1.0.0</p>
        <p><strong>技术栈:</strong> FastAPI + LangGraph + Vue 3</p>
        <p><strong>当前 API:</strong> {{ settingsStore.providerName }}</p>
        <p><strong>功能:</strong></p>
        <ul>
          <li>全学科课程答疑 (数学/计算机/物理/人文)</li>
          <li>智能出题 (自动生成练习题)</li>
          <li>学习规划 (个性化学习计划)</li>
          <li>知识总结 (长文本智能摘要)</li>
          <li>代码辅导 (调试/审查/讲解)</li>
        </ul>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { School, MoreFilled, Setting } from '@element-plus/icons-vue'
import { useChatStore } from './stores/chat'
import { useSettingsStore } from './stores/settings'
import ApiSettings from './components/common/ApiSettings.vue'

const router = useRouter()
const chatStore = useChatStore()
const settingsStore = useSettingsStore()
const settingsVisible = ref(false)
const aboutVisible = ref(false)

const apiStatusTagType = computed(() => {
  return settingsStore.isConfigured ? 'success' : 'danger'
})

const apiStatusTooltip = computed(() => {
  if (!settingsStore.isConfigured) return '点击配置 API'
  return `当前使用: ${settingsStore.providerName}`
})

function handleCommand(cmd: string) {
  switch (cmd) {
    case 'new-session':
      chatStore.newSession()
      router.push('/chat')
      break
    case 'clear-history':
      chatStore.clearMessages()
      break
    case 'about':
      aboutVisible.value = true
      break
  }
}

onMounted(() => {
  settingsStore.loadConfig()
})
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid var(--border-color);
  padding: 0 20px;
  height: 56px !important;
  box-shadow: var(--shadow-sm);
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--text-primary);
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-color);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-main {
  padding: 0;
  height: calc(100vh - 56px);
  overflow: hidden;
}

.about-content {
  line-height: 2;
}

.about-content ul {
  padding-left: 20px;
}
</style>
