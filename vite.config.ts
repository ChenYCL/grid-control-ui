import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'
import Components from 'unplugin-vue-components/vite'

// https://vitejs.dev/config/
export default defineConfig({
  server:{host:'0.0.0.0'},
  plugins: [
    vue(),
    Components({
      dts: true,
    }),
    Pages({
      pagesDir: [
        {
          dir: 'src/pages',
          baseRoute: '',
        },
        {
          dir: 'src/modules/**/**/pages',
          baseRoute: '',
        },
      ],
    }),
    Layouts({
      layoutsDirs: 'src/layouts',
      defaultLayout: 'defaultLayout',
      exclude: [],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    include: [
      'date-fns/locale/en-US',
    ],
  },
  build: {
    sourcemap: false,
  },
})
