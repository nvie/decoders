import DefaultTheme from 'vitepress/theme';
import DecoderPlayground from './components/DecoderPlayground.vue';
import DecoderSearch from './components/DecoderSearch.vue';
import Signature from './components/Signature.vue';
import './custom.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('DecoderPlayground', DecoderPlayground);
    app.component('DecoderSearch', DecoderSearch);
    app.component('Signature', Signature);
  },
};
