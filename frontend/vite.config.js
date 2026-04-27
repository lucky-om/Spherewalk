/* Coded by Lucky */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    plugins: [
      react()
    ],
    server: {
      host: true, // This allows your phone to connect to your laptop's IP
      port: 5173
    }
  }
})