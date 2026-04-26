/* Coded by Lucky */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
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