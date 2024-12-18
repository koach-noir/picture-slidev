<!-- layouts/default.vue -->
<template>
  <div 
    class="slidev-layout default"
    :style="combinedStyle"
  >
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'
import { useDarkMode } from '@slidev/client'
import { resolveBasePath } from '../utils/path'

const { $slidev } = useSlideContext()
const { isDark } = useDarkMode()

const backgroundStyle = computed(() => {
  const currentSlide = $slidev.nav.currentSlideRoute
  const bgImage = currentSlide?.meta?.slide?.frontmatter?.background
  
  // 背景画像が指定されている場合
  if (bgImage) {
    return {
      backgroundImage: `url(${resolveBasePath(bgImage)})`,
      backgroundSize: '100% 100%',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }
  }
  
  // 背景画像が指定されていない場合はダークモードに応じた背景色を設定
  return {
    backgroundColor: isDark.value ? '#121212' : '#ffffff'
  }
})

// position関連のスタイルは別途管理
const positionStyle = {
  width: '100%',
  height: '100%',
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: -1
}

const combinedStyle = computed(() => ({
  ...backgroundStyle.value,
  ...positionStyle
}))
</script>

<style>
.slidev-layout.default {
  @apply w-full h-full;
  position: relative;
  overflow: hidden;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  color: v-bind("isDark ? '#ffffff' : '#000000'");
}
</style>
