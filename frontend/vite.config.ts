import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from "@tailwindcss/vite"

// https://vitejs.dev/config/
export default defineConfig(() => {
  // Use relative base so generated assets use `./assets/...` which is
  // compatible with GitHub Pages and other static hosts regardless of path.
  // NOTE: per request, avoid using environment variables in frontend.
  const base = './';

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      port: 5173,
    },
  }
})