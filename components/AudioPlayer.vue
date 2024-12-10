<!-- AudioPlayer.vue -->
<template>
  <div class="audio-controls">
    <audio
      ref="audioPlayer"
      :src="audioPath"
      loop
    />
    <div class="controls-wrapper">
    <button
      class="play-button"
      @click="togglePlay"
      :title="isPlaying ? '停止' : '再生'"
    >
      <div v-if="isPlaying" class="pause-icon">❚❚</div>
      <div v-else class="play-icon">▶</div>
    </button>
      
      <!-- 音量調整セクション -->
      <div 
        class="volume-control"
        @mouseenter="showVolume = true"
      >
        <div class="volume-icon" @click="toggleMute">
          {{ volumeIcon }}
        </div>
        <div 
          class="volume-slider" 
          v-show="showVolume"
          @mouseleave="handleSliderLeave"
        >
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            v-model="volume"
            @input="updateVolume"
            class="slider"
            @mouseenter="isSliderHovered = true"
            @mouseleave="isSliderHovered = false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const audioPlayer = ref(null)
const isPlaying = ref(false)
const volume = ref(0.5)
const previousVolume = ref(0.5)
const showVolume = ref(false)
const isSliderHovered = ref(false)

const audioPath = computed(() => {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}audio/audio_01.mp3`.replace('//', '/')
})

const volumeIcon = computed(() => {
  if (volume.value <= 0) return '🔇'
  if (volume.value < 0.5) return '🔉'
  return '🔊'
})

// スライダー領域から離れた時の処理
const handleSliderLeave = () => {
  // スライダー自体にホバーしている場合は表示を維持
  if (!isSliderHovered.value) {
    showVolume.value = false
  }
}

const togglePlay = () => {
  if (!audioPlayer.value) return
  
  if (isPlaying.value) {
    audioPlayer.value.pause()
    isPlaying.value = false
  } else {
    audioPlayer.value.play().catch(error => {
      console.error('Audio playback failed:', error)
      console.log('Current audio path:', audioPath.value)
      alert('音声の再生に失敗しました。オーディオファイルが正しく配置されているか確認してください。')
    })
    isPlaying.value = true
  }
}

const updateVolume = () => {
  if (audioPlayer.value) {
    audioPlayer.value.volume = volume.value
    previousVolume.value = volume.value
  }
}

const toggleMute = () => {
  if (volume.value > 0) {
    previousVolume.value = volume.value
    volume.value = 0
  } else {
    volume.value = previousVolume.value
  }
}

watch(volume, (newValue) => {
  if (audioPlayer.value) {
    audioPlayer.value.volume = newValue
  }
})

onMounted(() => {
  if (audioPlayer.value) {
    audioPlayer.value.volume = volume.value
  }
})
</script>

<style scoped>
.audio-controls {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
}

.controls-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.6);
  padding: 8px;
  border-radius: 20px;
}

.play-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: transparent;
  border: 2px solid white;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-button:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.1);
}

.play-icon {
  margin-left: 3px;
}

.pause-icon {
  font-size: 12px;
}

.volume-control {
  position: relative;
  display: flex;
  align-items: center;
}

.volume-icon {
  color: white;
  cursor: pointer;
  padding: 5px;
  transition: all 0.3s ease;
}

.volume-icon:hover {
  transform: scale(1.1);
}

.volume-slider {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  padding: 10px;
  border-radius: 10px;
  margin-bottom: 10px;
}

.slider {
  -webkit-appearance: none;
  width: 100px;
  height: 4px;
  border-radius: 2px;
  background: #ffffff;
  outline: none;
  transition: all 0.3s ease;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}
</style>
