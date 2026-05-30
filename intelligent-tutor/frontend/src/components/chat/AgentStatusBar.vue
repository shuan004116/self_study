<template>
  <div class="agent-status-bar">
    <div
      v-for="agent in agents"
      :key="agent.name"
      class="agent-status-item"
      :class="agent.status"
    >
      <el-icon :size="14" v-if="agent.status === 'processing'" class="spin"><Loading /></el-icon>
      <el-icon :size="14" v-else-if="agent.status === 'complete'"><Select /></el-icon>
      <el-icon :size="14" v-else-if="agent.status === 'error'"><Close /></el-icon>
      <el-icon :size="14" v-else><Circle /></el-icon>
      <span class="agent-label">{{ agent.displayName }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loading, Select, Close, Circle } from '@element-plus/icons-vue'
import type { AgentStatus } from '../../stores/chat'

defineProps<{
  agents: AgentStatus[]
}>()
</script>

<style scoped>
.agent-status-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #fafafa;
  border-bottom: 1px solid var(--border-color);
  overflow-x: auto;
}

.agent-status-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  white-space: nowrap;
  background: #f0f2f5;
  color: var(--text-muted);
}

.agent-status-item.processing {
  background: #ecf5ff;
  color: var(--primary-color);
}

.agent-status-item.complete {
  background: #f0f9eb;
  color: var(--success-color);
}

.agent-status-item.error {
  background: #fef0f0;
  color: var(--danger-color);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
