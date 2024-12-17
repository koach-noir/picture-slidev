<!-- global-bottom.vue -->
<template>
  <div class="fixed top-10 right-74 z-50">
    <BGMController />
  </div>
  <SlideNavigator />
  <!-- トランジションを登録 -->
  <PageTurnTransition />
</template>

<script setup>
import BGMController from '/components/BGMController.vue'
import SlideNavigator from '/components/SlideNavigator.vue'
import PageTurnTransition from '/components/PageTurnTransition.vue'
</script>
