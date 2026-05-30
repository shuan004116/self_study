import { useChatStore } from '../stores/chat'

const API_BASE = '/api'

export async function sendChatMessage(
  message: string,
  sessionId: string,
  subjectOverride?: string,
  intentOverride?: string,
): Promise<void> {
  const store = useChatStore()
  store.isProcessing = true
  store.error = null

  // Add user message
  store.addMessage({
    id: store.generateId(),
    role: 'user',
    content: message,
    timestamp: new Date(),
    status: 'done',
  })

  // Add placeholder assistant message
  const assistantId = store.generateId()
  store.addMessage({
    id: assistantId,
    role: 'assistant',
    content: '',
    timestamp: new Date(),
    status: 'streaming',
    agentChain: [],
  })

  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        session_id: sessionId,
        subject_override: subjectOverride || null,
        intent_override: intentOverride || null,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // Process SSE events
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          const eventType = line.slice(7).trim()
          // Next line(s) contain data
          continue
        }
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            handleEvent(data)
          } catch {
            // Ignore malformed JSON
          }
        }
      }
    }
  } catch (err: any) {
    store.error = err.message || '请求失败，请检查网络连接或Ollama服务是否启动'
    const last = store.lastMessage
    if (last && last.role === 'assistant') {
      last.content = `**错误**: ${store.error}\n\n请确保:\n1. Ollama 服务已启动 (\`ollama serve\`)\n2. 模型已下载 (\`ollama pull qwen2.5:14b\`)\n3. 后端服务运行中 (\`uvicorn backend.main:app\`)`
      last.status = 'error'
    }
  } finally {
    store.isProcessing = false
  }
}

function handleEvent(data: any) {
  const store = useChatStore()

  switch (data.event || data.agent ? 'status' : 'token') {
    case 'status':
      if (data.agent && data.status) {
        store.updateAgentStatus(data.agent, data.status, data.message)
      }
      break
    case 'token':
      if (data.token) {
        store.updateLastMessage(data.token)
      }
      break
    case 'error':
      if (data.message) {
        store.error = data.message
      }
      break
    case 'done':
      const last = store.lastMessage
      if (last && last.role === 'assistant') {
        last.status = 'done'
        if (data.agent_chain) {
          last.agentChain = data.agent_chain
        }
      }
      store.isProcessing = false
      break
    default:
      // Parse inline event format from SSE
      if (typeof data === 'object' && data !== null) {
        if (data.agent && data.status) {
          store.updateAgentStatus(data.agent, data.status, data.message || '')
        }
        if (data.token) {
          store.updateLastMessage(data.token)
        }
      }
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`)
    return res.ok
  } catch {
    return false
  }
}
