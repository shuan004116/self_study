<template>
  <div class="message-bubble" :class="message.role">
    <div class="message-avatar">
      <el-icon :size="24" v-if="message.role === 'user'"><User /></el-icon>
      <el-icon :size="24" v-else color="#409eff"><MagicStick /></el-icon>
    </div>
    <div class="message-body">
      <div class="message-header">
        <span class="message-role">{{ message.role === 'user' ? '你' : '智能助手' }}</span>
        <span class="message-time">{{ formatTime(message.timestamp) }}</span>
        <el-tag v-if="message.agentChain && message.agentChain.length > 1" size="small" type="info">
          {{ message.agentChain.join(' → ') }}
        </el-tag>
      </div>
      <div class="message-content" :class="{ streaming: message.status === 'streaming' }">
        <MarkdownRenderer :content="message.content" />
        <el-icon v-if="message.status === 'streaming'" class="cursor-blink" :size="16" color="#409eff">
          <MoreFilled />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { User, MagicStick, MoreFilled } from '@element-plus/icons-vue'
import type { Message } from '../../stores/chat'
import MarkdownRenderer from '../common/MarkdownRenderer.vue'

defineProps<{
  message: Message
}>()

function formatTime(date: Date | string): string {
  const d = new Date(date)
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}
</script>

<style scoped>
.message-bubble {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.message-bubble.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-bubble.user .message-avatar {
  background: #ecf5ff;
}

.message-body {
  max-width: 75%;
}

.message-bubble.user .message-body {
  text-align: right;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.message-bubble.user .message-header {
  justify-content: flex-end;
}

.message-role {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.message-time {
  font-size: 12px;
  color: var(--text-muted);
}

.message-content {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  text-align: left;
}

.message-bubble.user .message-content {
  background: #ecf5ff;
  border-color: #d9ecff;
}

.message-content.streaming {
  border-color: #409eff;
  border-style: dashed;
}

.cursor-blink {
  animation: blink 1s step-end infinite;
  vertical-align: middle;
  margin-left: 2px;
}

@keyframes blink {
  50% { opacity: 0; }
}
</style>
