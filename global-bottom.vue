<!-- global-bottom.vue -->
<template>
  <div class="fixed top-10 right-74 z-50">
    <BGMController />
  </div>
  <SlideNavigator />
  <div class="slides-container">
    <slot></slot>
  </div>
</template>

<script setup>
import BGMController from '/components/BGMController.vue'
import SlideNavigator from '/components/SlideNavigator.vue'
import { useSlideContext } from '@slidev/client'

const { $slidev } = useSlideContext()

// トランジション設定
if ($slidev) {
  $slidev.configs.transition = {
    name: 'custom-book-turn',
    onBeforeLeave(el) {
      console.log('📖 ページめくり開始')
      el.style.position = 'absolute'
      el.style.width = '100%'
      el.style.transformOrigin = 'left center'
    },
    onLeave(el, done) {
      // 退場アニメーション
      el.style.transition = 'all 0.6s ease'
      el.style.opacity = '0'
      el.style.transform = 'perspective(2000px) rotateY(-60deg)'
      el.addEventListener('transitionend', done, { once: true })
    },
    onEnter(el, done) {
      // 入場アニメーション（右から）
      el.style.transition = 'none'
      el.style.opacity = '0'
      el.style.transform = 'perspective(2000px) rotateY(60deg)'
      
      requestAnimationFrame(() => {
        el.style.transition = 'all 0.6s ease'
        el.style.opacity = '1'
        el.style.transform = 'none'
      })
      
      el.addEventListener('transitionend', () => {
        console.log('📖 ページめくり完了')
        done()
      }, { once: true })
    }
  }
}
</script>

<style>
.slides-container {
  position: relative;
  width: 100%;
  height: 100%;
  perspective: 2000px;
  transform-style: preserve-3d;
}
</style>
