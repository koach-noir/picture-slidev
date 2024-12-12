<!-- components/AudioPlayer.vue -->
<template>
  <div class="audio-controls">
    <!-- トグルボタンは常に表示 -->
    <button 
      class="visibility-toggle"
      @click="toggleVisibility"
      :title="isHidden ? '表示' : '非表示'"
    >
      <span class="toggle-icon" :class="{ 'is-hidden': !isHidden }">
        🔊
      </span>
      <span class="toggle-arrow" :class="{ 'is-hidden': isHidden }">
        ▼
      </span>
    </button>

    <!-- コントロールパネル部分を別のdivで分離 -->
    <div class="controls-panel" :class="{ 'is-hidden': isHidden }">
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
        <!-- 最初から再生ボタン -->
        <button
          class="control-button"
          @click="restart"
          title="最初から再生"
        >
          ⟲
        </button>
        
        <!-- 10秒戻るボタン -->
        <button
          class="control-button"
          @click="skipBackward"
          title="10秒戻る"
        >
          ⫷<sup>10</sup>
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
          <sup>10</sup>⫸
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
        <div 
          class="volume-slider"
          @mouseleave="handleSliderLeave"
          @mouseenter="isSliderHovered = true"
        >
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { resolveBasePath } from '../utils/path'

const isHidden = ref(false)
const audioPlayer = ref(null)
const isPlaying = ref(false)
const volume = ref(0.5)
const previousVolume = ref(0.5)
const showVolume = ref(false)
const isSliderHovered = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const emit = defineEmits(['playStateChange', 'playerAction'])

const toggleVisibility = () => {
  isHidden.value = !isHidden.value
}

const audioPath = computed(() => {
  return resolveBasePath('/audio/bgm.mp3')
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
    isSliderHovered.value = false
  // スライダーからマウスが離れた時に少し遅延を入れて非表示に
  setTimeout(() => {
    if (!isSliderHovered.value) {
      showVolume.value = false
    }
  }, 500)
}

const isVolumeControlHovered = ref(false)

// ハンドラー関数の実装
const handleVolumeControlEnter = () => {
  isVolumeControlHovered.value = true
  showVolume.value = true
}

const handleVolumeControlLeave = () => {
  isVolumeControlHovered.value = false
  // スライダーコンテナにホバーしていない場合のみ非表示
  if (!isSliderContainerHovered.value) {
    showVolume.value = false
  }
}

const handleSliderContainerLeave = () => {
  isSliderContainerHovered.value = false
  // 音量コントロール全体にホバーしていない場合のみ非表示
  if (!isVolumeControlHovered.value) {
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

  // 再生状態の変更を親コンポーネントに通知
  emit('playStateChange', isPlaying.value)
}

// isPlayingプロパティをコンポーネント外部から変更可能にする
defineExpose({
  isPlaying
})

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


// 初期状態の読み込み
onMounted(() => {
  const savedState = localStorage.getItem('audioPlayerHidden')
  if (savedState !== null) {
    isHidden.value = JSON.parse(savedState)
  }
  if (audioPlayer.value) {
    audioPlayer.value.volume = volume.value
  }
})

// 状態変更時の保存
watch(isHidden, (newValue) => {
  localStorage.setItem('audioPlayerHidden', JSON.stringify(newValue))
})


// 10秒進む
const skipForward = async () => {
  try {
    // イベントを発行し、結果を待つ
    const shouldPreventDefault = await emit('playerAction', 'skipForward')
    // shouldPreventDefaultがtrueの場合は、デフォルトの動作をスキップ
    if (!shouldPreventDefault && audioPlayer.value) {
      audioPlayer.value.currentTime = Math.min(duration.value, audioPlayer.value.currentTime + 10)
    }
  } catch (error) {
    console.error('Skip forward action failed:', error)
  }
}

// 10秒戻る
const skipBackward = async () => {
  try {
    const shouldPreventDefault = await emit('playerAction', 'skipBackward')
    if (!shouldPreventDefault && audioPlayer.value) {
      audioPlayer.value.currentTime = Math.max(0, audioPlayer.value.currentTime - 10)
    }
  } catch (error) {
    console.error('Skip backward action failed:', error)
  }
}

// 最初から再生
const restart = async () => {
  try {
    const shouldPreventDefault = await emit('playerAction', 'restart')
    if (!shouldPreventDefault && audioPlayer.value) {
      audioPlayer.value.currentTime = 0
      if (!isPlaying.value) {
        await audioPlayer.value.play()
        isPlaying.value = true
      }
    }
  } catch (error) {
    console.error('Restart action failed:', error)
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

.visibility-toggle {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: white;
  padding: 5px 10px;
  border-radius: 5px 5px 0 0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.controls-panel {
  transition: transform 0.3s ease, opacity 0.3s ease;
  opacity: 1;
  transform: translateY(0);
}

.controls-panel.is-hidden {
  transform: translateY(20px);
  opacity: 0;
  pointer-events: none; /* 非表示時はクリックを無効化 */
}

.toggle-icon {
  font-size: 1.5em; /* アイコンサイズを大きく */
  opacity: 0.15; /* 85%の透明度 */
  transition: opacity 0.2s ease;
}

.toggle-arrow {
  font-size: 0.8em; /* 矢印サイズを小さく */
}

.toggle-icon.is-hidden {
  display: none;
}

.toggle-arrow.is-hidden {
  display: none;
}

/* ホバー時の透明度調整 */
.visibility-toggle:hover .toggle-icon {
  opacity: 1;
}

.visibility-toggle {
  position: absolute;
  top: -30px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: white;
  padding: 5px 10px;
  border-radius: 5px 5px 0 0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.visibility-toggle:hover {
  background: rgba(0, 0, 0, 0.8);
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
  -webkit-appearance: none;
  appearance: none;
  height: 100px;
  width: 4px;
  background: rgba(255, 255, 255, 0.3);
  outline: none;
  border-radius: 2px;
  margin: 0;
  writing-mode: vertical-lr;
  direction: rtl;
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
  width: 4px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.slider::-moz-range-track {
  width: 4px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}
</style>
