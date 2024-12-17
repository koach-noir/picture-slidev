<!-- layouts/book-page.vue -->
<template>
    <div class="book-page-layout">
      <!-- 左ページ -->
      <div class="page left-page debug-border">
        <div class="page-content">
          <slot name="left">
            <slot /> <!-- デフォルトスロットは左ページに表示 -->
          </slot>
        </div>
      </div>
  
      <!-- 右ページ -->
      <div class="page right-page debug-border">
        <div class="page-content">
          <slot name="right" />
        </div>
      </div>
  
      <!-- 綴じ線（トランジション時のみ表示） -->
      <div class="binding-line"></div>
    </div>
  </template>
  
  <style scoped>
  .book-page-layout {
    @apply w-full h-full;
    display: grid;
    grid-template-columns: 1fr 1fr;
    position: relative;
    overflow: hidden;
  }
  
  .page {
    @apply relative;
    transition: opacity 300ms ease;
  }
  
  /* デバッグ用の境界線 - 開発完了後に削除 */
  .debug-border {
    @apply border border-white/10;
  }
  
  .page-content {
    @apply w-full h-full p-8;
  }
  
  .binding-line {
    position: absolute;
    top: 0;
    left: 50%;
    height: 100%;
    width: 2px;
    background-color: rgba(255, 255, 255, 0.4);
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 200ms ease;
    pointer-events: none;
  }
  
  /* トランジション時のクラス */
  .page.leaving {
    opacity: 0;
  }
  
  .page.entering {
    opacity: 0;
  }
  
  .binding-line.active {
    opacity: 1;
  }
  </style>
  
  <script setup lang="ts">
  import { onMounted } from 'vue'
  
  onMounted(() => {
    // レイアウトが適用されたことを確認
    console.log('Book page layout mounted')
  })
  </script>
