<!-- BackgroundMusic.vue -->
<template>
  <div class="audio-controls">
    <audio
      ref="audioPlayer"
      :src="audioPath"
      loop
    />
    <button
      class="play-button"
      @click="togglePlay"
      :title="isPlaying ? '停止' : '再生'"
    >
      <div v-if="isPlaying" class="pause-icon">❚❚</div>
      <div v-else class="play-icon">▶</div>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const audioPlayer = ref(null)
const isPlaying = ref(false)

// BASE_URLを考慮したパスの生成
const audioPath = computed(() => {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}audio/audio_01.mp3`.replace('//', '/')
})

const togglePlay = () => {
  if (!audioPlayer.value) return
  
  if (isPlaying.value) {
    audioPlayer.value.pause()
    isPlaying.value = false
  } else {
    // エラーハンドリングを追加
    audioPlayer.value.play().catch(error => {
      console.error('Audio playback failed:', error)
      console.log('Current audio path:', audioPath.value)
      // ユーザーにエラーを通知することもできます
      alert('音声の再生に失敗しました。オーディオファイルが正しく配置されているか確認してください。')
    })
    isPlaying.value = true
  }
}

onMounted(() => {
  if (audioPlayer.value) {
    audioPlayer.value.volume = 0.5 // 音量を50%に設定
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

.play-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
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
  background: rgba(0, 0, 0, 0.8);
}

.play-icon {
  margin-left: 3px;
}

.pause-icon {
  font-size: 12px;
}
</style>
