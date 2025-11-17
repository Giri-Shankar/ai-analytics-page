import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set base to your repository name so built asset URLs include the subpath.
// This makes the built index.html reference /ai-analytics-page/assets/... instead of /assets/...
export default defineConfig({
  base: '/ai-analytics-page/',
  plugins: [react()],
})
