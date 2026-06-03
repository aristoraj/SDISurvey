import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    // Disable the inline module-preload polyfill script.
    // Zoho Creator's CSP blocks inline scripts — this is the main culprit.
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        // Keep all code in external files, no inline scripts
        inlineDynamicImports: false,
      },
    },
  },
})
