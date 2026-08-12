import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' keeps the build hosting-path agnostic (GitHub Pages project path,
// access-controlled Pages subdomains, or local preview) — hash routing does the rest.
export default defineConfig({
  plugins: [react()],
  base: './',
})
