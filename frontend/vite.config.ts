import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from "@tailwindcss/vite"

// https://vitejs.dev/config/
export default defineConfig(() => {
  // Hard-coded base path for production (served under '/acadnet/')
  // NOTE: per request, avoid using environment variables in frontend.
  const base = '/acadnet/';

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