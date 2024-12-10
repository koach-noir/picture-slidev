import { defineConfig } from 'unocss'

export default defineConfig({
  shortcuts: {
    'toc-item': 'cursor-pointer opacity-60 transition-all duration-300 hover:opacity-100',
    'toc-active': 'font-bold animate-pulse opacity-100',
    'toc-sun-active': 'text-orange-500',
    'toc-earth-active': 'text-green-500',
    'toc-moon-active': 'text-purple-500'
  }
})
