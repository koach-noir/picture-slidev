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
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }
})
</script>

<style>
.slidev-layout.cover {
  @apply w-full h-full;
}
</style>
