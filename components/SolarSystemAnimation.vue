<!-- components/SolarSystemAnimation.vue -->
<script setup>
defineProps({
  earthOrbitDuration: {
    type: Number,
    default: 400000
  },
  moonOrbitDuration: {
    type: Number,
    default: 377500
  },
  earthSize: {
    type: Number,
    default: 24
  },
  moonSize: {
    type: Number,
    default: 6
  }
})
</script>

<template>
  <div class="solar-system-container">
    <!-- 地球と月のグループ -->
    <div v-if="$slidev">
      <div
        v-motion
        :initial="{ x: 10, y: 0 }"
        :enter="{ 
            x: 0,
            y: -50,
          transition: { 
            duration: earthOrbitDuration, 
            ease: 'linear',
            repeat: Infinity
          } 
        }"
        class="earth-orbit"
      >
        <!-- 地球 -->
        <img
          src="/images/earth.png"
          class="celestial-body earth"
          :style="{ width: `${earthSize}px`, height: `${earthSize}px` }"
          alt="Earth"
        />

        <!-- 月の軌道 -->
        <div
          v-motion
          :initial="{ x: -300, y: -108 }"
          :enter="{ 
            x: 900,
            y: -175,
            transition: { 
              duration: moonOrbitDuration, 
              ease: 'linear',
              repeat: Infinity
            } 
          }"
          class="moon-orbit"
        >
          <img
            src="/images/moon.png"
            class="celestial-body moon"
            :style="{ width: `${moonSize}px`, height: `${moonSize}px` }"
            alt="Moon"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.solar-system-container {
  position: relative;
  width: 100vw;
  height: 600px;
  overflow: hidden;
}

.earth-orbit {
  position: relative;
}

.moon-orbit {
  position: absolute;
  left: -4px;
  top: -14px;
}

.celestial-body {
  object-fit: contain;
  opacity: 1;
}

.earth {
  filter: drop-shadow(0 0 20px rgba(100, 149, 237, 0.6));
  background-color: transparent;
  mix-blend-mode: normal;
}

.moon {
  filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.5));
  background-color: transparent;
  mix-blend-mode: normal;
}
</style>
