import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  status?: 'sending' | 'streaming' | 'done' | 'error'
  agentChain?: string[]
}

export interface AgentStatus {
  name: string
  displayName: string
  status: 'idle' | 'processing' | 'complete' | 'error'
  message?: string
}

export const useChatStore = defineStore('chat', () => {
  const messages = ref<Message[]>([])
  const currentSessionId = ref(`session_${Date.now()}`)
  const agentStatuses = ref<AgentStatus[]>([])
  const isProcessing = ref(false)
  const error = ref<string | null>(null)

  const lastMessage = computed(() => messages.value[messages.value.length - 1] || null)

  function addMessage(msg: Message) {
    messages.value.push(msg)
  }

  function updateLastMessage(content: string) {
    const last = messages.value[messages.value.length - 1]
    if (last && last.role === 'assistant') {
      last.content += content
    }
  }

  function setAgentStatuses(statuses: AgentStatus[]) {
    agentStatuses.value = statuses
  }

  function updateAgentStatus(name: string, status: AgentStatus['status'], message?: string) {
    const idx = agentStatuses.value.findIndex((s) => s.name === name)
    if (idx >= 0) {
      agentStatuses.value[idx].status = status
      if (message) agentStatuses.value[idx].message = message
    } else {
      agentStatuses.value.push({
        name,
        displayName: name,
        status,
        message,
      })
    }
  }

  function generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  }

  function clearMessages() {
    messages.value = []
    agentStatuses.value = []
    error.value = null
  }

  function newSession() {
    currentSessionId.value = `session_${Date.now()}`
    clearMessages()
  }

  return {
    messages,
    currentSessionId,
    agentStatuses,
    isProcessing,
    error,
    lastMessage,
    addMessage,
    updateLastMessage,
    setAgentStatuses,
    updateAgentStatus,
    generateId,
    clearMessages,
    newSession,
  }
})
