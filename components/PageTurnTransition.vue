<!-- components/PageTurnTransition.vue -->
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CustomBookTurnTransition',
  setup() {
    const FADE_DURATION = 300
    const INTERVAL_DURATION = 200

    const beforeLeave = (el: Element) => {
      const layout = el as HTMLElement
      // トランジション開始時の初期化
      layout.style.position = 'absolute'
      layout.style.width = '100%'
    }

    const leave = async (el: Element, done: () => void) => {
      const layout = el as HTMLElement
      const rightPage = layout.querySelector('.right-page')
      const leftPage = layout.querySelector('.left-page')
      const bindingLine = layout.querySelector('.binding-line')

      // Step 1: 右ページのフェードアウト
      if (rightPage) {
        rightPage.classList.add('leaving')
        await wait(FADE_DURATION)
      }

      // インターバル1: 綴じ線表示
      if (bindingLine) {
        bindingLine.classList.add('active')
        await wait(INTERVAL_DURATION)
        bindingLine.classList.remove('active')
      }

      // Step 2: 左ページのフェードアウト
      if (leftPage) {
        leftPage.classList.add('leaving')
        await wait(FADE_DURATION)
      }

      done()
    }

    const enter = async (el: Element, done: () => void) => {
      const layout = el as HTMLElement
      const rightPage = layout.querySelector('.right-page')
      const leftPage = layout.querySelector('.left-page')
      const bindingLine = layout.querySelector('.binding-line')

      // 初期状態：両ページを非表示に
      rightPage?.classList.add('entering')
      leftPage?.classList.add('entering')

      // Step 1: 右ページのフェードイン
      if (rightPage) {
        rightPage.classList.remove('entering')
        await wait(FADE_DURATION)
      }

      // インターバル2: 綴じ線表示
      if (bindingLine) {
        bindingLine.classList.add('active')
        await wait(INTERVAL_DURATION)
        bindingLine.classList.remove('active')
      }

      // Step 2: 左ページのフェードイン
      if (leftPage) {
        leftPage.classList.remove('entering')
        await wait(FADE_DURATION)
      }

      done()
    }

    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    return {
      beforeLeave,
      leave,
      enter
    }
  }
})
