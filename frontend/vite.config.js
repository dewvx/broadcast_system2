import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // อนุญาตให้เข้าผ่าน ngrok tunnel ได้
    allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app'],
    // proxy request /api ไปหา backend (localhost:3000) ภายในเครื่องเอง
    // ทำให้ frontend ต้องมี ngrok tunnel แค่ตัวเดียว (ไม่ต้องมี tunnel แยกไปหา backend อีกตัว)
    // เพราะ browser (มือถือ) ยิงมาที่ frontend tunnel ตัวเดียว แล้ว Vite dev server
    // เป็นคนส่งต่อไปหา backend ในเครื่องเดียวกันเองอีกที
    proxy: {
      '/api': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000',
    },
  },
});