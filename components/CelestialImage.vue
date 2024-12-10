<!-- components/CelestialImage.vue -->
<template>
  <div class="celestial-wrapper">
    <div
      v-motion
      :initial="{ scale: 0.8, opacity: 0 }"
      :enter="{ 
        scale: 1, 
        opacity: 1,
        transition: { 
          type: 'spring',
          damping: 10,
          stiffness: 100
        }
      }"
      class="celestial-container"
      :style="{
        maxWidth: `${imageSize}px`,
        maxHeight: `${imageSize}px`
      }"
    >
      <img 
        :src="`${base}/images/${imageName}.png`" 
        :class="`${imageName}-image celestial-image`"
        :alt="title"
        :style="{
          width: '100%',
          height: '100%',
          maxWidth: `${imageSize}px`,
          maxHeight: `${imageSize}px`
        }"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const base = ref('')

onMounted(() => {
  // GitHub Pages のベースパスを取得
  base.value = import.meta.env.BASE_URL
})

defineProps({
  title: {
    type: String,
    required: true
  },
  imageName: {
    type: String,
    required: true
  },
  imageSize: {
    type: Number,
    default: 300 // デフォルトサイズ
  }
})
</script>

<style scoped>
.celestial-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden; /* はみ出しを防ぐ */
}

.celestial-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.celestial-image {
  object-fit: contain;
}
</style>
