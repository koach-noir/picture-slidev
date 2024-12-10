<!-- components/CelestialBody.vue -->
<template>
  <div class="layout">
    <!-- 左側：説明文 -->
    <div class="content-left">
      <div class="facts">
        <v-clicks :every="1">
          <slot name="facts" />
        </v-clicks>
      </div>
    </div>

    <!-- 右側：画像と位相アニメーション -->
    <div class="content-right">
      <div class="visual">
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
        >
          <img 
            :src="`/images/${imageName}.png`" 
            :class="`${imageName}-image`"
            :alt="title"
            class="celestial-image"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  imageName: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  height: 100%;
  padding: 2rem;
}

.facts {
  font-size: 1.5rem;
  line-height: 2;
}

.celestial-image {
  width: 300px;
  height: 300px;
  object-fit: contain;
}
</style>
