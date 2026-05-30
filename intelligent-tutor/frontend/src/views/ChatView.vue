<template>
  <div class="chat-layout">
    <!-- Agent Status Sidebar -->
    <div class="agent-sidebar">
      <div class="sidebar-header">
        <h3>Agent 状态</h3>
      </div>
      <div class="agent-list">
        <div
          v-for="agent in agentList"
          :key="agent.name"
          class="agent-item"
          :class="{ active: agent.status === 'processing', done: agent.status === 'complete' }"
        >
          <span v-if="agent.status === 'idle'" class="idle-dot"></span>
          <el-icon :size="18" v-else-if="agent.status === 'processing'" class="spin" :color="'#409eff'"><Loading /></el-icon>
          <el-icon :size="18" v-else-if="agent.status === 'complete'" :color="'#67c23a'"><Select /></el-icon>
          <el-icon :size="18" v-else :color="'#f56c6c'"><Close /></el-icon>
          <div class="agent-info">
            <span class="agent-name">{{ agent.displayName }}</span>
            <span class="agent-status-text" v-if="agent.message">{{ agent.message }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Chat Area -->
    <div class="chat-area">
      <!-- Messages -->
      <div class="messages-container" ref="messagesRef">
        <div v-if="chatStore.messages.length === 0" class="empty-chat">
          <el-icon :size="48" color="#c0c4cc"><ChatDotSquare /></el-icon>
          <p>有什么学习问题需要帮助吗？</p>
          <div class="quick-actions">
            <el-button type="primary" plain size="small" @click="quickAsk('解释一下梯度下降法的数学原理')">
              梯度下降法
            </el-button>
            <el-button type="success" plain size="small" @click="quickAsk('用Python实现一个二分查找算法')">
              二分查找
            </el-button>
            <el-button type="warning" plain size="small" @click="quickAsk('出3道微积分的练习题')">
              微积分练习
            </el-button>
            <el-button type="info" plain size="small" @click="quickAsk('帮我制定一个期末复习计划，要考高数和线代')">
              复习计划
            </el-button>
          </div>
        </div>

        <div v-for="msg in chatStore.messages" :key="msg.id" class="message-wrapper">
          <MessageBubble :message="msg" />
        </div>

        <div v-if="chatStore.isProcessing" class="processing-indicator">
          <el-icon class="spin"><Loading /></el-icon>
          <span>Agent 正在处理...</span>
        </div>
      </div>

      <!-- Input Area -->
      <div class="input-area">
        <el-input
          v-model="inputMessage"
          type="textarea"
          :rows="3"
          :disabled="chatStore.isProcessing"
          placeholder="输入你的学习问题，例如：解释一下量子力学中的叠加态..."
          @keydown.enter.exact.prevent="sendMessage"
        />
        <div class="input-actions">
          <div class="input-options">
            <el-select v-model="subjectOverride" placeholder="学科" size="small" clearable style="width: 100px">
              <el-option label="自动" value="" />
              <el-option label="数学" value="数学" />
              <el-option label="计算机" value="计算机" />
              <el-option label="物理" value="物理" />
              <el-option label="人文" value="人文" />
            </el-select>
            <el-select v-model="intentOverride" placeholder="类型" size="small" clearable style="width: 100px">
              <el-option label="自动" value="" />
              <el-option label="答疑" value="答疑" />
              <el-option label="出题" value="出题" />
              <el-option label="规划" value="规划" />
              <el-option label="总结" value="总结" />
              <el-option label="代码" value="代码" />
            </el-select>
          </div>
          <el-button
            type="primary"
            :icon="Promotion"
            :disabled="!inputMessage.trim() || chatStore.isProcessing"
            @click="sendMessage"
          >
            发送
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  ChatDotSquare, Promotion, Loading,
  Select, Close,
} from '@element-plus/icons-vue'
import { useChatStore } from '../stores/chat'
import { sendChatMessage } from '../api/chat'
import MessageBubble from '../components/chat/MessageBubble.vue'

const route = useRoute()
const chatStore = useChatStore()
const inputMessage = ref('')
const subjectOverride = ref('')
const intentOverride = ref('')
const messagesRef = ref<HTMLElement | null>(null)

const agentList = computed(() => {
  const defaults = [
    { name: 'dispatcher', displayName: '调度 Agent', status: 'idle' as const, message: '' },
    { name: 'math_agent', displayName: '数学 Agent', status: 'idle' as const, message: '' },
    { name: 'cs_agent', displayName: '计算机 Agent', status: 'idle' as const, message: '' },
    { name: 'physics_agent', displayName: '物理 Agent', status: 'idle' as const, message: '' },
    { name: 'humanities_agent', displayName: '人文 Agent', status: 'idle' as const, message: '' },
    { name: 'exercise_agent', displayName: '出题 Agent', status: 'idle' as const, message: '' },
    { name: 'planner_agent', displayName: '规划 Agent', status: 'idle' as const, message: '' },
    { name: 'summary_agent', displayName: '总结 Agent', status: 'idle' as const, message: '' },
    { name: 'code_review_agent', displayName: '代码 Agent', status: 'idle' as const, message: '' },
  ]

  // Merge with live statuses
  const live = chatStore.agentStatuses
  return defaults.map((d) => {
    const l = live.find((s) => s.name === d.name || s.name === d.displayName)
    return l || d
  })
})

function scrollToBottom() {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

watch(() => chatStore.messages.length, scrollToBottom)
watch(() => chatStore.isProcessing, scrollToBottom)

async function sendMessage() {
  const message = inputMessage.value.trim()
  if (!message || chatStore.isProcessing) return

  inputMessage.value = ''
  await sendChatMessage(
    message,
    chatStore.currentSessionId,
    subjectOverride.value || undefined,
    intentOverride.value || undefined,
  )
}

function quickAsk(text: string) {
  inputMessage.value = text
  sendMessage()
}

onMounted(() => {
  // Check for intent from home page
  const intent = route.query.intent as string
  if (intent) {
    intentOverride.value = intent
  }
})
</script>

<style scoped>
.chat-layout {
  display: flex;
  height: 100%;
  background: var(--bg-color);
}

.agent-sidebar {
  width: 200px;
  background: #fff;
  border-right: 1px solid var(--border-color);
  padding: 16px;
  overflow-y: auto;
}

.sidebar-header h3 {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.agent-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.agent-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  font-size: 13px;
  transition: all 0.2s;
}

.idle-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c0c4cc;
  flex-shrink: 0;
}

.agent-item.active {
  background: #ecf5ff;
}

.agent-item.done {
  opacity: 0.7;
}

.agent-info {
  display: flex;
  flex-direction: column;
}

.agent-name {
  font-weight: 500;
}

.agent-status-text {
  font-size: 11px;
  color: var(--text-muted);
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  gap: 16px;
}

.quick-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 8px;
}

.message-wrapper {
  max-width: 800px;
  margin: 0 auto 16px;
}

.processing-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: var(--text-muted);
  font-size: 14px;
}

.input-area {
  border-top: 1px solid var(--border-color);
  background: #fff;
  padding: 16px 24px;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.input-options {
  display: flex;
  gap: 8px;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
