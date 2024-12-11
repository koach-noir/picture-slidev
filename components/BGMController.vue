<!-- components/BGMController.vue -->
<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useSlideContext } from '@slidev/client'
import AudioPlayer from './AudioPlayer.vue'

// 状態管理
const bgmSettings = ref(null)
const trackPositions = ref(new Map())
const currentBgmInfo = ref(null)
const audioPlayerRef = ref(null)
const { $slidev } = useSlideContext()
const { currentPage, currentLayout, currentSlideRoute } = $slidev.nav

const debug = ref({
  initialized: false,
  currentBgm: null,
  trackPositions: null,
  lastError: null,
  lastSlideChange: null
})

// CUEシートをパースする関数
function parseCueSheet(cueText) {
  const trackPositions = new Map()
  const lines = cueText.split('\n').map(line => line.trim())
  let currentTrackTitle = ''

  lines.forEach(line => {
    if (line.startsWith('TITLE')) {
      currentTrackTitle = line.match(/"([^"]+)"/)[1]
    }
    else if (line.startsWith('INDEX 01')) {
      const timeStr = line.split('INDEX 01')[1].trim()
      const [min, sec, frames] = timeStr.split(':').map(Number)
      // フレームを秒に変換（75フレーム = 1秒）
      const totalSeconds = (min * 60) + sec + (frames / 75)
      if (currentTrackTitle) {
        trackPositions.set(currentTrackTitle, totalSeconds)
      }
    }
  })
  const debugPositions = Object.fromEntries(trackPositions)
  // console.log('Parsed CUE positions:', debugPositions)
  return trackPositions
}

// 再生範囲を計算する関数
function calculatePlayRange(trackName) {
  const positions = Array.from(trackPositions.value.entries())
  const currentIndex = positions.findIndex(([title]) => title === trackName)
  
  if (currentIndex === -1) {
    console.error(`Track "${trackName}" not found in CUE sheet`)
    return null
  }

  const startTime = positions[currentIndex][1]
  const endTime = positions[currentIndex + 1]
    ? positions[currentIndex + 1][1]
    : 157 // 全体の長さ（2:37 = 157秒）

  return { startTime, endTime }
}

// BGMの再生制御
async function controlBGM(bgmName) {
  // console.log('Attempting to control BGM:', {
  //   bgmName,
  //   settings: bgmSettings.value,
  //   trackPositions: Object.fromEntries(trackPositions.value)
  // })

  if (!bgmSettings.value || !audioPlayerRef.value) {
    console.warn('BGM control skipped: not ready', {
      settingsLoaded: !!bgmSettings.value,
      playerReady: !!audioPlayerRef.value
    })
    return
  }

  const bgmInfo = bgmSettings.value.bgmSettings.bgms[bgmName]
  if (!bgmInfo) {
    console.error(`BGM "${bgmName}" not found in settings`)
    return
  }

  try {
    const playRange = calculatePlayRange(bgmInfo.trackName)
    if (!playRange) return

    // currentBgmInfoの更新
    currentBgmInfo.value = {
      ...bgmInfo,
      startTime: playRange.startTime,
      endTime: playRange.endTime
    }

    const audioEl = audioPlayerRef.value.$refs.audioPlayer
    audioEl.currentTime = playRange.startTime
    
    if (audioEl.paused) {
      await audioEl.play()
    }
    
    debug.value.currentBgm = {
      name: bgmName,
      info: currentBgmInfo.value,
      audioStatus: {
        currentTime: audioEl.currentTime,
        paused: audioEl.paused
      }
    }
    
    // console.log('BGM switched successfully:', debug.value.currentBgm)
  } catch (error) {
    debug.value.lastError = error
    console.error('BGM control failed:', error)
  }
}

// 再生位置の監視
const onTimeUpdate = () => {
  if (!audioPlayerRef.value || !currentBgmInfo.value) return
  const audioEl = audioPlayerRef.value.$refs.audioPlayer

  if (audioEl.currentTime >= currentBgmInfo.value.endTime) {
    if (currentBgmInfo.value.playCount === 'loop') {
      audioEl.currentTime = currentBgmInfo.value.startTime
    } else {
      audioEl.pause()
      audioEl.currentTime = currentBgmInfo.value.endTime
    }
  }
}

// スライド変更の監視
watch(
  () => $slidev.nav.currentPage,
  async (newPage) => {
    // 現在のスライドのfrontmatterを直接取得
    const currentSlide = $slidev.nav.currentSlideRoute
    const bgmName = currentSlide?.meta?.slide?.frontmatter?.bgmName

    // console.log('Slide changed:', {
    //   page: newPage,
    //   bgmName,
    //   slideMeta: currentSlide?.meta
    // })

    if (bgmName) {
      await controlBGM(bgmName)
    }
  }
)

// 初期化
onMounted(async () => {
  try {
    const response = await fetch('/audio/bgm-settings.json')
    bgmSettings.value = await response.json()
    
    const cueResponse = await fetch(bgmSettings.value.bgmSettings.cuePath)
    const cueText = await cueResponse.text()
    trackPositions.value = parseCueSheet(cueText)
    
    debug.value.initialized = true
    debug.value.trackPositions = Object.fromEntries(trackPositions.value)
    
    // console.log('BGM Controller initialized:', debug.value)

    // AudioPlayerの初期設定
    if (audioPlayerRef.value) {
      const audioEl = audioPlayerRef.value.$refs.audioPlayer
      audioEl.addEventListener('timeupdate', onTimeUpdate)

      // 初期BGMの設定
      const initialBgmName = $slidev?.nav?.currentRoute?.meta?.frontmatter?.bgmName
      if (initialBgmName) {
        // console.log('Setting initial BGM:', initialBgmName)
        await controlBGM(initialBgmName)
      }
    }

  } catch (error) {
    debug.value.lastError = error
    console.error('BGM initialization failed:', error)
  }
})

// クリーンアップ
onUnmounted(() => {
  if (audioPlayerRef.value) {
    const audioEl = audioPlayerRef.value.$refs.audioPlayer
    audioEl.removeEventListener('timeupdate', onTimeUpdate)
  }
})
</script>

<template>
  <AudioPlayer 
    ref="audioPlayerRef"
    :src="bgmSettings?.bgmSettings?.audioPath"
  />
</template>
