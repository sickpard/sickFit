import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { getInitialTheme, getSavedTheme } from './lib/theme'

const initialTheme = getInitialTheme(getSavedTheme(), window.matchMedia('(prefers-color-scheme: dark)').matches)
document.documentElement.dataset.theme = initialTheme
document.querySelector('meta[name="theme-color"]')?.setAttribute('content', initialTheme === 'dark' ? '#0b100e' : '#f5f5f7')

createApp(App).mount('#app')
