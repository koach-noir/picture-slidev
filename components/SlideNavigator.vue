<!-- components/SlideNavigator.vue -->
<template>
    <div class="slide-navigator">
      <navigation-controller
      ref="controller"
      v-model="bookmarks"
      @navigation-start="handleNavigationStart"
      @navigation-end="handleNavigationEnd"
    />
    <!-- 区切り線 -->
    <div class="divider"></div>

      <!-- ブックマーク行 -->
      <div class="navigator-row bookmark-row">
      <!-- 移動量インジケーター
      <div 
        v-if="navigationIndicator"
        class="navigation-indicator"
        :class="navigationIndicator.direction"
      >
        {{ navigationIndicator.count }}
      </div> -->
        <!-- 親コンテナ -->
        <div class="bookmarks-container">
          <!-- 前のブックマーク -->
          <div 
            v-show="bookmarks.prev.active"
            class="hover-area bookmark-prev"
            :class="{ 'disabled': !bookmarkStates.prev.isEnabled }"
            @mouseenter="controller.handleHover('bookmarkPrev')"
            @mouseleave="controller.handleLeave('bookmarkPrev')"
            @click="handleBookmarkNavigation('prev')"
          >
        <div 
          v-if="bookmarks.prev.active && bookmarkStates.prev.isEnabled" 
          class="bookmark-indicator"
            >
              {{ bookmarks.prev.page }}
            </div>
          </div>

          <!-- 次のブックマーク -->
          <div 
            v-show="bookmarks.next.active"
            class="hover-area bookmark-next"
            :class="{ 'disabled': !bookmarkStates.next.isEnabled }"
            @mouseenter="controller.handleHover('bookmarkNext')"
            @mouseleave="controller.handleLeave('bookmarkNext')"
            @click="handleBookmarkNavigation('next')"
          >
          <div 
          v-if="bookmarks.next.active && bookmarkStates.next.isEnabled" 
          class="bookmark-indicator"
            >
              {{ bookmarks.next.page }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useNav } from '@slidev/client'
  import NavigationController from './NavigationController.vue'
  import type { BookmarkState, NavigationIndicator } from './types'
  
  const nav = useNav()
  const controller = ref()
  const isTransitioning = ref(false)
  
  // ブックマークの状態管理
  const bookmarks = ref({
    prev: {
      page: null,
      active: false
    } as BookmarkState,
    next: {
      page: null,
      active: false
    } as BookmarkState
  })
  
  // ブックマークの有効性を判定
  const bookmarkStates = computed(() => {
    const currentPage = nav.currentPage.value
    return {
      prev: {
      ...bookmarks.value.prev,
      isEnabled: bookmarks.value.prev.active && bookmarks.value.prev.page !== currentPage
    },
    next: {
      ...bookmarks.value.next,
      isEnabled: bookmarks.value.next.active && bookmarks.value.next.page !== currentPage
    }
    }
  })
  
  // // ナビゲーションインジケーターの状態
  // const navigationIndicator = computed(() => {
  //   if (!controller.value?.navigationState) return null
  //   return controller.value.navigationState as NavigationIndicator
  // })
  
  // ブックマークによる遷移
  const handleBookmarkNavigation = async (type: 'prev' | 'next') => {
    const state = bookmarkStates.value[type]
    if (!state.isEnabled || isTransitioning.value) return
  
    try {
      isTransitioning.value = true
      await nav.go(state.page!)
    } finally {
      isTransitioning.value = false
    }
  }
  
  // ナビゲーション状態の管理
  const handleNavigationStart = () => {
    isTransitioning.value = true
  }
  
  const handleNavigationEnd = () => {
    isTransitioning.value = false
  }
    onMounted(() => {
    // console.log('SlideNavigator mounted')
    // console.log('controller ref:', controller.value)
    })
  </script>
  
  <style scoped>
  @import '../styles/navigation.css';
  
.slide-navigator {
  position: fixed;
  bottom: 10px;
  left: 0;
  right: 0;
  z-index: 40;
  padding: 0 20px; /* 左右に少しだけ余白を持たせる */
  display: flex;
  flex-direction: column;
  align-items: center;
}

  /* 区切り線のスタイル */
.divider {
  width: 100%;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.2);
  margin: 8px 0;
}

/* ブックマーク行のスタイルを修正 */
.navigator-row.bookmark-row {
  display: flex;
  width: 100%;
  justify-content: center;
  min-height: 40px; /* 最小の高さを保証 */
  margin-top: 8px;
  position: relative; /* 子要素の位置の基準点に */
}

.bookmarks-container {
  position: relative;
  /* コンテナの幅と高さを設定 */
  width: 250px;  /* 必要に応じて調整 */
  height: 50px; /* 必要に応じて調整 */
}

/* ブックマークの見た目の調整 */
.bookmark-indicator {
  /* 必要に応じてスタイリング */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.hover-area.bookmark-prev {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  left: 0;
}

.hover-area.bookmark-next {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  left: 0;
}

/* ホバー時にさらにずらす効果も追加できます */
.hover-area.bookmark-prev:hover {
  transform: translateX(-15px);
}

.hover-area.bookmark-next:hover {
  transform: translateX(15px);
}

  </style>
