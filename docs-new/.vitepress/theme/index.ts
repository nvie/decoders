import DefaultTheme from 'vitepress/theme'
import DecoderSearch from './components/DecoderSearch.vue'
import DecoderPlayground from './components/DecoderPlayground.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('DecoderSearch', DecoderSearch)
    app.component('DecoderPlayground', DecoderPlayground)
  }
}