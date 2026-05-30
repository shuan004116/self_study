<template>
  <div class="markdown-renderer message-content" v-html="renderedContent"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
})

const props = defineProps<{
  content: string
}>()

const renderedContent = computed(() => {
  if (!props.content) return ''

  // Pre-process LaTeX blocks: $$...$$
  let processed = props.content.replace(/\$\$(.+?)\$\$/gs, (_, formula) => {
    return `<span class="math math-display">${formula}</span>`
  })

  // Inline LaTeX: $...$
  processed = processed.replace(/\$(.+?)\$/g, (_, formula) => {
    return `<span class="math math-inline">${formula}</span>`
  })

  // Render markdown
  return marked.parse(processed) as string
})
</script>

<style scoped>
.math-display {
  display: block;
  text-align: center;
  padding: 8px;
  margin: 8px 0;
  background: #f8f9fa;
  border-radius: 4px;
  font-family: 'Times New Roman', serif;
  font-style: italic;
  font-size: 1.1em;
}

.math-inline {
  font-family: 'Times New Roman', serif;
  font-style: italic;
  padding: 0 2px;
}
</style>
