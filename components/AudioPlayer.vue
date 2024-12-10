<!-- AudioPlayer.vue -->
<template>
  <div class="audio-controls">
    <audio
      ref="audioPlayer"
      :src="audioPath"
      loop
      @timeupdate="updateProgress"
      @loadedmetadata="onLoadedMetadata"
    />
    <div class="controls-wrapper">
      <!-- プログレスバー -->
      <div class="progress-container">
        <div class="time-display">{{ formatTime(currentTime) }}</div>
        <div class="progress-bar-wrapper">
          <input
            type="range"
            min="0"
            :max="duration"
            v-model="currentTime"
            @input="seek"
            class="progress-slider"
          />
          <div 
            class="progress-bar"
            :style="{ width: `${(currentTime / duration) * 100}%` }"
          ></div>
        </div>
        <div class="time-display">{{ formatTime(duration) }}</div>
      </div>

      <!-- 再生コントロール -->
      <div class="controls">
        <!-- 10秒戻るボタン -->
        <button
          class="control-button"
          @click="skipBackward"
          title="10秒戻る"
        >
          ⫷10
        </button>

        <!-- 再生/一時停止ボタン -->
        <button
          class="play-button"
          @click="togglePlay"
          :title="isPlaying ? '停止' : '再生'"
        >
          <div v-if="isPlaying" class="pause-icon">❚❚</div>
          <div v-else class="play-icon">▶</div>
        </button>

        <!-- 10秒進むボタン -->
        <button
          class="control-button"
          @click="skipForward"
          title="10秒進む"
        >
          10⫸
        </button>

        <!-- 最初から再生ボタン -->
        <button
          class="control-button"
          @click="restartFromBeginning"
          title="最初から再生"
        >
          ⟲
        </button>
        
        <!-- 音量調整セクション -->
        <div 
          class="volume-control"
          @mouseenter="showVolume = true"
        >
          <button 
            class="volume-icon" 
            @click.stop="toggleMute"
            type="button"
          >
            {{ volumeIcon }}
          </button>
          <div 
            class="volume-slider-container" 
            v-show="showVolume"
            @mouseleave="handleSliderLeave"
            @mouseenter="isSliderHovered = true"
          >
            <div class="volume-slider">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              v-model="volume"
              @input="updateVolume"
              class="slider"
                orient="vertical"
            />
        </div>
      </div>
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
const currentTime = ref(0)
const duration = ref(0)

const audioPath = computed(() => {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}audio/audio_01.mp3`.replace('//', '/')
})

const volumeIcon = computed(() => {
  if (volume.value <= 0) return '🔇'
  if (volume.value < 0.5) return '🔉'
  return '🔊'
})

// 時間のフォーマット（MM:SS）
const formatTime = (time) => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// メタデータ読み込み完了時
const onLoadedMetadata = () => {
  if (audioPlayer.value) {
    duration.value = audioPlayer.value.duration
  }
}

// 再生位置の更新
const updateProgress = () => {
  if (audioPlayer.value) {
    currentTime.value = audioPlayer.value.currentTime
  }
}

// シーク処理
const seek = () => {
  if (audioPlayer.value) {
    audioPlayer.value.currentTime = currentTime.value
  }
}

const handleSliderLeave = () => {
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

// 10秒戻る
const skipBackward = () => {
  if (audioPlayer.value) {
    audioPlayer.value.currentTime = Math.max(0, audioPlayer.value.currentTime - 10)
  }
}

// 10秒進む
const skipForward = () => {
  if (audioPlayer.value) {
    audioPlayer.value.currentTime = Math.min(duration.value, audioPlayer.value.currentTime + 10)
  }
}

// 最初から再生
const restartFromBeginning = () => {
  if (audioPlayer.value) {
    audioPlayer.value.currentTime = 0
    if (!isPlaying.value) {
      togglePlay()
    }
  }
  }
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
  flex-direction: column;
  gap: 8px;
  background: rgba(0, 0, 0, 0.6);
  padding: 8px;
  border-radius: 20px;
  min-width: 300px;
}

.controls {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.control-button {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  font-size: 1.1em;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-button:hover {
  transform: scale(1.1);
  color: #f0f0f0;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.progress-bar-wrapper {
  position: relative;
  flex-grow: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.progress-slider {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}

.progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: #ffffff;
  border-radius: 2px;
  pointer-events: none;
}

.time-display {
  color: white;
  font-size: 12px;
  min-width: 35px;
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
  background: none;
  border: none;
  font-size: 1.2em;
}

.volume-icon:hover {
  transform: scale(1.1);
}

.volume-slider-container {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  padding: 15px 10px;
  border-radius: 10px;
  margin-bottom: 10px;
}

.volume-slider {
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0; /* パディングを削除して中央寄せを調整 */
}

.volume-slider-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px 10px;
}

.slider {
  margin: 0; /* マージンをリセット */
  -webkit-appearance: none;
  appearance: none;
  height: 100px;
  width: 4px;
  background: rgba(255, 255, 255, 0.3);
  outline: none;
  writing-mode: bt-lr; /* IE */
  -webkit-appearance: slider-vertical; /* Chromium */
  border-radius: 2px;
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
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

.slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
}

.slider::-webkit-slider-thumb:hover,
.slider::-moz-range-thumb:hover {
  transform: scale(1.2);
  background: #f0f0f0;
}

/* スライダーのトラック部分のスタイル */
.slider::-webkit-slider-runnable-track {
  margin: 0 auto;
  width: 4px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.slider::-moz-range-track {
  margin: 0 auto;
  width: 4px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}
</style>
