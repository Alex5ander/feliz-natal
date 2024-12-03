import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        '2023': './2023/index.html',
        '2024': './2023/index.html'
      }
    }
  }
})