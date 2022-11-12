import Vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import Components from 'unplugin-vue-components/vite'
import presetUno from '@unocss/preset-uno'

import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    Vue(),
    Unocss({
      presets: [presetUno()],
    }),
    Components(),
  ],
})
