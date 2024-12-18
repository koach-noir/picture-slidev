<!-- layouts/cover.vue -->
<template>
  <div 
    class="slidev-layout cover-layout"
    :style="combinedStyle"
  >
    <div class="book-cover" :class="{ 'is-back-cover': isBackCover }">
      <h1 class="title">{{ title }}</h1>
      <div class="subtitle">{{ subtitle }}</div>
      <div class="instruction">{{ instruction }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'
import { useDarkMode } from '@slidev/client'
import { resolveBasePath } from '../utils/path'

const { $slidev } = useSlideContext()
const { isDark } = useDarkMode()

// プロパティの定義
const props = defineProps({
  title: {
    type: String,
    default: '天体'
  },
  subtitle: {
    type: String,
    default: '太陽・地球・月'
  },
  instruction: {
    type: String,
    default: 'クリックまたは → キーで開始'
  },
  background: {
    type: String,
    default: 'images/sun-in-the-universe.svg'
  }
})

// 現在のスライドが最後のスライドかどうかを判定
const isBackCover = computed(() => {
  return $slidev.nav.currentPage === $slidev.nav.total
})

const instruction = computed(() => {
  return isBackCover.value ? 'おわり' : props.instruction
})

// 背景スタイルの計算
const backgroundStyle = computed(() => {
  const currentSlide = $slidev.nav.currentSlideRoute
  // フロントマターのbackgroundまたはpropsのbackgroundを使用
  const bgPath = currentSlide?.meta?.slide?.frontmatter?.background || props.background
  // resolveBasePathを使用してパスを解決
  const resolvedPath = resolveBasePath(bgPath)
  
  return {
    backgroundImage: `url(${resolvedPath})`,
    backgroundSize: '100% 100%',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }
})

// ポジショニングスタイル
const positionStyle = {
  width: '100%',
  height: '100%',
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: -1
}

// 全スタイルの結合
const combinedStyle = computed(() => ({
  ...backgroundStyle.value,
  ...positionStyle
}))
</script>

<style>
.slidev-layout.cover {
  @apply w-full h-full;
  position: relative;
  overflow: hidden;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.book-cover {
  @apply flex flex-col items-center justify-center h-full;
}

.title {
  @apply text-6xl mb-4 font-bold;
}

.subtitle {
  @apply text-2xl mb-8;
}

.instruction {
  @apply text-sm opacity-50 mt-8;
}

.book-cover.is-back-cover .instruction {
  @apply text-4xl opacity-80;
  margin-left: 2em;
}

/* ダークモード対応 */
:root {
  --cover-text-color: #000000;
}

:root.dark {
  --cover-text-color: #ffffff;
}

.book-cover {
  color: var(--cover-text-color);
}
</style>
