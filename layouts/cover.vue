<!-- layouts/cover.vue -->
<template>
  <div 
    class="slidev-layout cover"
    :style="backgroundStyle"
  >
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'
import { resolveBasePath } from '../utils/path'

const { $slidev } = useSlideContext()

const backgroundStyle = computed(() => {
  const currentSlide = $slidev.nav.currentSlideRoute
  const bgImage = currentSlide?.meta?.slide?.frontmatter?.background
  if (!bgImage) return {}
  
  return {
    backgroundImage: `url(${resolveBasePath(bgImage)})`,
    backgroundSize: '100% 100%',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: -1
  }
})
</script>

<style>
.slidev-layout.default,
.slidev-layout.cover {
  @apply w-full h-full;
  position: relative;
  overflow: hidden;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
