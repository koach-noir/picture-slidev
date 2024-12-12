<!-- components/BGMController.vue -->
<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
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

// audioPathを加工するcomputed property
const normalizedAudioPath = computed(() => {
  if (!bgmSettings.value?.bgmSettings?.audioPath) return ''
  
  const base = import.meta.env.BASE_URL || '/'
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  const audioPath = bgmSettings.value.bgmSettings.audioPath
  
  // 先頭のスラッシュを除去してベースパスと結合
  return `${normalizedBase}${audioPath.replace(/^\//, '')}`.replace('//', '/')
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

// BGM停止用の関数（script setup内で定義）
function stopBGM() {
  if (audioPlayerRef.value) {
    const audioEl = audioPlayerRef.value.$refs.audioPlayer
    audioEl.pause()
  }
}

// スライド変更の監視
watch(
  () => $slidev.nav.currentPage,
  async (newPage) => {
    try {
      const currentSlide = $slidev.nav.currentSlideRoute
      const bgmName = currentSlide?.meta?.slide?.frontmatter?.bgmName

      if (bgmName === 'non') {
        stopBGM()
      } 
      else if (bgmName) {
        await controlBGM(bgmName)
      }
    } catch (error) {
      console.error('BGM transition failed:', error)
    }
  },
  { immediate: true }
)

// 初期化
onMounted(async () => {
  try {
    const base = import.meta.env.BASE_URL || '/'
    const normalizedBase = base.endsWith('/') ? base : `${base}/`
    
    // 設定ファイルの取得
    const response = await fetch(`${normalizedBase}audio/bgm-settings.json`.replace('//', '/'))
    bgmSettings.value = await response.json()
    
    // CUEファイルの取得と解析
    const cuePath = bgmSettings.value.bgmSettings.cuePath
    const normalizedCuePath = `${normalizedBase}${cuePath.replace(/^\//, '')}`.replace('//', '/')
    const cueResponse = await fetch(normalizedCuePath)
    
    if (!cueResponse.ok) {
      throw new Error(`Failed to fetch CUE file: ${cueResponse.status} ${cueResponse.statusText}`)
    }
    
    const cueText = await cueResponse.text()
    trackPositions.value = parseCueSheet(cueText)

    // AudioPlayerの初期設定
    if (audioPlayerRef.value) {
      const audioEl = audioPlayerRef.value.$refs.audioPlayer
      audioEl.addEventListener('timeupdate', onTimeUpdate)

      // 現在のスライドのBGM名を取得（新しい方法）
      const currentSlide = $slidev.nav.currentSlideRoute
      const initialBgmName = currentSlide?.meta?.slide?.frontmatter?.bgmName

      // BGMの自動再生
      if (initialBgmName && initialBgmName !== 'non') {
        await controlBGM(initialBgmName)
        // 明示的に再生を開始
        const playPromise = audioEl.play()
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.warn('Auto-play was prevented:', error)
            // ここでユーザーに再生ボタンを押すように促すUIを表示することもできます
          })
        }
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
    :src="normalizedAudioPath"
  />
</template>
