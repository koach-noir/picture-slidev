<!-- components/NavigationController.vue -->
<template>
    <div 
      class="control-row"
      :class="{ 'is-transitioning': isTransitioning }"
    >
      <div class="navigation-grid">
        <div 
          class="hover-area volume-left"
          @mouseenter="handleHover('volumeLeft')"
          @mouseleave="handleLeave('volumeLeft')"
        />
        <div 
          class="hover-area intent-left"
          @mouseenter="handleHover('intentLeft')"
          @mouseleave="handleLeave('intentLeft')"
        />
        <div 
          class="hover-area standby"
          @mouseenter="handleHover('standby')"
          @mouseleave="handleLeave('standby')"
        />
        <div 
          class="hover-area intent-right"
          @mouseenter="handleHover('intentRight')"
          @mouseleave="handleLeave('intentRight')"
        />
        <div 
          class="hover-area volume-right"
          @mouseenter="handleHover('volumeRight')"
          @mouseleave="handleLeave('volumeRight')"
        />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue'
  import { useNav } from '@slidev/client'
  import type { HoverArea, NavigationState, BookmarkState, NavigationDirection } from './types'
  
  const nav = useNav()

  const props = defineProps<{
  modelValue: {
    prev: BookmarkState
    next: BookmarkState
  }
}>()

const emit = defineEmits(['update:modelValue', 'navigationStart', 'navigationEnd'])
  
  // 定数
  const MIN_HOVER_TIME = 1000
  const MAX_HOVER_TIME = 3000
  const MAX_PAGE_COUNT = 5
  
  // 状態管理
  const isTransitioning = ref(false)
  const navState = reactive<NavigationState>({
    currentArea: null,
    previousArea: null,
    hoverStartTime: null,
    accumulatedCount: 0,
    direction: null
  })
  
  // 外部公開用の状態
  const navigationState = computed(() => {
    if (!navState.accumulatedCount) return null
    return {
      count: navState.accumulatedCount,
      direction: navState.direction
    }
  })
  
  // エリア間の移動検知
  const handleHover = (area: HoverArea) => {
  // console.log('Hover detected:', area, {
  //   currentArea: navState.currentArea,
  //   previousArea: navState.previousArea,
  //   accumulatedCount: navState.accumulatedCount
  // })
  
  if (isTransitioning.value || area === navState.currentArea) {
    // console.log('Hover ignored - already in this area or transitioning')
    return
  }

  const prev = navState.currentArea
  navState.previousArea = prev
  navState.currentArea = area

  console.log('State transition:', {
    prev,
    current: area,
    isValidTransition: isValidTransition(prev, area)
  })

  if (area === 'standby') {
    if (navState.accumulatedCount > 0) {
      executeNavigation()
    } else {
      clearBookmarks()
    }
    return
  }
  
    if (isValidTransition(prev, area)) {
      handleAreaTransition(prev, area)
    } else {
      resetNavigationState()
    }
  }
  
  const handleLeave = (area: HoverArea) => {
  // エリアを離れた直後にリセットするのではなく、
  // 少し遅延を設けてリセットする
  setTimeout(() => {
    // 別のエリアに既に移動している場合はリセットしない
    if (navState.currentArea === area) {
      console.log('Reset area:', area) // デバッグ用
      navState.currentArea = null
    }
  }, 100) // 100ms の遅延
}
  
  // 移動量の計算
  const handleVolumeSelection = () => {
    if (!navState.hoverStartTime || !navState.direction) return
    
    const hoverDuration = Date.now() - navState.hoverStartTime
    const normalizedDuration = Math.min(Math.max(hoverDuration - MIN_HOVER_TIME, 0), MAX_HOVER_TIME)
    const ratio = normalizedDuration / MAX_HOVER_TIME
    
    const safeMaxCount = getSafeMaxCount(navState.direction)
    const additionalCount = Math.min(
      Math.ceil(ratio * MAX_PAGE_COUNT),
      safeMaxCount
    )
    
    navState.accumulatedCount += additionalCount
  }
  
  // 安全な移動量計算
  const getSafeMaxCount = (direction: NavigationDirection) => {
    const currentPage = nav.currentPage.value
    const totalPages = nav.total.value
    
    return direction === 'prev' 
      ? currentPage - 1
      : totalPages - currentPage
  }
  
  // エリア間の遷移処理
  const handleAreaTransition = (from: HoverArea | null, to: HoverArea) => {
    console.log('Area transition:', { from, to }) // デバッグ追加

    // intentエリアに入った時点でカウントを開始
    if (isIntentArea(to)) {
      console.log('Intent area entered, setting initial count')
      navState.direction = to === 'intentLeft' ? 'prev' : 'next'
      navState.accumulatedCount = 1  // 初期値として1を設定
    }

// volumeエリアでの追加カウント
    if (isVolumeArea(to)) {
      navState.hoverStartTime = Date.now()
      navState.direction = getDirection(to)
    }
    
    if (isVolumeArea(from) && isIntentArea(to)) {
      handleVolumeSelection()
    }

    // intentエリアからstandbyへの移動で実行
    if (isIntentArea(from) && to === 'standby') {
      console.log('Ready to execute with count:', navState.accumulatedCount)
      if (navState.accumulatedCount > 0) {
        executeNavigation()
      }
    }
  }
  
  // ナビゲーション実行
  const executeNavigation = async () => {
    console.log('Executing navigation:', {
      accumulatedCount: navState.accumulatedCount,
      direction: navState.direction
    })
    if (isTransitioning.value || !navState.direction || navState.accumulatedCount === 0) {
    console.log('Navigation cancelled:', {
      isTransitioning: isTransitioning.value,
      direction: navState.direction,
      count: navState.accumulatedCount
    })
    return
  }
    
    try {
      emit('navigationStart')
      isTransitioning.value = true
      
      const currentPage = nav.currentPage.value
      const targetPage = navState.direction === 'prev'
        ? currentPage - navState.accumulatedCount
        : currentPage + navState.accumulatedCount

      const totalPages = nav.total.value
      const validatedTargetPage = Math.max(1, Math.min(targetPage, totalPages))

      console.log('Navigating:', { from: currentPage, to: validatedTargetPage })

      setBookmark(validatedTargetPage)
      await nav.go(validatedTargetPage)
      
    } catch (error) {
      console.error('Navigation failed:', error)
    } finally {
      resetNavigationState()
      isTransitioning.value = false
      emit('navigationEnd')
    }
  }
  
  // ヘルパー関数
  const isVolumeArea = (area: HoverArea | null) => 
    area === 'volumeLeft' || area === 'volumeRight'
  
  const isIntentArea = (area: HoverArea | null) => 
    area === 'intentLeft' || area === 'intentRight'
  
    const getDirection = (area: HoverArea): NavigationDirection => 
    area === 'volumeLeft' ? 'prev' : 'next'
  
  const isValidTransition = (from: HoverArea | null, to: HoverArea): boolean => {
    if (!from) return true
    
    const validTransitions = {
      intentLeft: ['volumeLeft', 'standby'],
      intentRight: ['volumeRight', 'standby'],
      volumeLeft: ['intentLeft'],
      volumeRight: ['intentRight'],
      standby: ['intentLeft', 'intentRight'],
      bookmarkPrev: ['standby'],
      bookmarkNext: ['standby']
    }
  
    return validTransitions[to].includes(from)
  }
  
const setBookmark = (targetPage: number) => {
  const currentPage = nav.currentPage.value
  const updatedBookmarks = { ...props.modelValue }
  
  // ナビゲーション方向に基づいて適切なブックマークをセット
  if (targetPage < currentPage) {
    updatedBookmarks.prev = {
      page: targetPage,
      active: true
    }
    updatedBookmarks.next = {
      page: currentPage,
      active: true
    }
  } else {
    updatedBookmarks.prev = {
      page: currentPage,
      active: true
    }
    updatedBookmarks.next = {
      page: targetPage,
      active: true
    }
  }
  
  emit('update:modelValue', updatedBookmarks)
}
  
  const clearBookmarks = () => {
    emit('update:modelValue', {
      prev: { page: null, active: false },
      next: { page: null, active: false }
    })
  }
  
  const resetNavigationState = () => {
    console.log('Resetting navigation state')
    navState.accumulatedCount = 0
    navState.direction = null
    navState.hoverStartTime = null
  }
  
  // 外部から参照可能な状態とメソッドを公開
  defineExpose({
    navigationState,
    handleHover,
    handleLeave
  })

  onMounted(() => {
  // console.log('NavigationController mounted')
})
  </script>
  
  <style scoped>
  @import '../styles/navigation.css';
  
  .control-row {
  width: 100%;
  transition: opacity 0.3s ease;
}
  .control-row.is-transitioning {
    opacity: 0.5;
    pointer-events: none;
  }
  
  .navigation-grid {
  display: grid;
  grid-template-columns: 3fr 1.5fr 1fr 1.5fr 3fr;
  column-gap: 0px;
  /* gap: 0px; */
  width: 100%;
  align-items: center;
  justify-items: center;
}

/* 基準サイズの設定 */
.standby {
  /* width: 4vw; */
  /* height: 4vw; */
  min-width: 40px;
  min-height: 40px;
  max-width: 300px;
  max-height: 200px;
}

.intent-left,
.intent-right {
  /* width: 6vw; */
  /* height: 4vw; */
  min-width: 60px;
  min-height: 40px;
  max-width: 300px;
  max-height: 200px;
}

.volume-left,
.volume-right {
  /* width: 12vw; */
  /* height: 4vw; */
  min-width: 120px;
  min-height: 40px;
  max-width: 600px;
  max-height: 200px;
}
  
  .intent-left:hover,
  .intent-right:hover {
    background: rgba(251, 191, 36, 0.3);
  }
  
  .volume-left:hover,
  .volume-right:hover {
    background: rgba(239, 68, 68, 0.3);
  }


  </style>
