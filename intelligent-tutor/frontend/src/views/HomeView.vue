<template>
  <div class="home">
    <div class="hero">
      <el-icon :size="64" color="#409eff"><School /></el-icon>
      <h1>全学科智能学习助手</h1>
      <p class="subtitle">基于多 Agent 协作的 AI 辅导系统，覆盖数学、计算机、物理、人文等学科</p>

      <div class="feature-grid">
        <div class="feature-card" @click="goToChat">
          <el-icon :size="32" color="#409eff"><ChatDotSquare /></el-icon>
          <h3>课程答疑</h3>
          <p>多学科知识问答，逐步推导讲解</p>
        </div>
        <div class="feature-card" @click="goToChat('出题')">
          <el-icon :size="32" color="#67c23a"><EditPen /></el-icon>
          <h3>智能出题</h3>
          <p>根据知识点自动生成练习题</p>
        </div>
        <div class="feature-card" @click="goToChat('规划')">
          <el-icon :size="32" color="#e6a23c"><Timer /></el-icon>
          <h3>学习规划</h3>
          <p>个性化学习计划与复习安排</p>
        </div>
        <div class="feature-card" @click="goToChat('总结')">
          <el-icon :size="32" color="#409eff"><Document /></el-icon>
          <h3>知识总结</h3>
          <p>长文本智能摘要与知识梳理</p>
        </div>
        <div class="feature-card" @click="goToChat('代码')">
          <el-icon :size="32" color="#67c23a"><Monitor /></el-icon>
          <h3>代码辅导</h3>
          <p>编程题讲解、Debug 和代码审查</p>
        </div>
        <div class="feature-card" @click="goToChat">
          <el-icon :size="32" color="#e6a23c"><Connection /></el-icon>
          <h3>多 Agent 协作</h3>
          <p>多个 AI Agent 协同为你服务</p>
        </div>
      </div>

      <div class="connect-status">
        <el-tag :type="backendConnected ? 'success' : 'danger'" size="large">
          {{ backendConnected ? '✓ Ollama 已连接' : '✗ Ollama 未连接' }}
        </el-tag>
        <span class="model-name" v-if="backendConnected">模型: Qwen2.5-14B</span>
      </div>

      <el-button type="primary" size="large" @click="goToChat" class="start-btn">
        <el-icon><ChatDotSquare /></el-icon>
        开始学习
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  School, ChatDotSquare, EditPen, Timer, Document,
  Monitor, Connection,
} from '@element-plus/icons-vue'
import { checkHealth } from '../api/chat'

const router = useRouter()
const backendConnected = ref(false)

function goToChat(intent?: string) {
  let query = {}
  if (intent) {
    query = { intent }
  }
  router.push({ name: 'chat', query })
}

onMounted(async () => {
  backendConnected.value = await checkHealth()
})
</script>

<style scoped>
.home {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f4f8 100%);
}

.hero {
  text-align: center;
  max-width: 800px;
  padding: 40px;
}

.hero h1 {
  font-size: 32px;
  margin: 16px 0 8px;
  color: var(--text-primary);
}

.subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin: 32px 0;
}

.feature-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 24px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
}

.feature-card h3 {
  margin: 12px 0 8px;
  font-size: 16px;
}

.feature-card p {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

.connect-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin: 24px 0;
}

.model-name {
  font-size: 13px;
  color: var(--text-muted);
}

.start-btn {
  margin-top: 16px;
  padding: 12px 40px;
  font-size: 16px;
}
</style>
