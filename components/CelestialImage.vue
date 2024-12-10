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
        :src="imageSrc"
        :class="`${imageName}-image celestial-image`"
        :alt="title"
        @error="handleImageError"
        :style="{
          width: '100%',
          height: '100%',
          maxWidth: `${imageSize}px`,
          maxHeight: `${imageSize}px`
        }"
      />
      <div v-if="hasError" class="error-message">
        画像の読み込みに失敗しました
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
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

const hasError = ref(false)

// 画像のパスを計算
const imageSrc = computed(() => {
  // 開発環境とプロダクション環境の両方で動作するパスを生成
  return `/images/${props.imageName}.png`
})

// 画像読み込みエラーのハンドリング
const handleImageError = (event) => {
  console.error(`画像の読み込みに失敗: ${imageSrc.value}`)
  hasError.value = true
}
</script>

<style scoped>
.celestial-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
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

.error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: red;
  background: rgba(0, 0, 0, 0.7);
  padding: 10px;
  border-radius: 4px;
}
</style>
