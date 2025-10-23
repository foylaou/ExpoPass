import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'
import Sitemap from 'vite-plugin-sitemap'
import { createHtmlPlugin } from 'vite-plugin-html'



// https://vite.dev/config/
export default defineConfig({
    server: {
        allowedHosts: ["01296ddfa1e9.ngrok-free.app"], // ✅ 明確寫出完整主機名稱
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
                // 不要移除 /api 前綴，讓後端處理完整路徑
            },
            '/qrcodes': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
            },
        }
    },

    optimizeDeps: {
        include: ['react', 'react-dom', 'react-helmet-async'],
    },

    ssr: {
        noExternal: ['react-helmet-async'],
    },

    plugins: [
        react(),
        tailwindcss(),
        Sitemap({ hostname: 'https://expopass.isafe.org.tw' }),
        createHtmlPlugin({
            minify: true,
            inject: {
                data: {
                    title: 'ExpoPass 展覽管理系統',
                    description: '一個現代化的展覽活動管理系統，提供 QR Code 掃描、參展人員管理、攤位管理及數據分析功能。',
                },
            },
        }),

        VitePWA({
            registerType: 'autoUpdate',
            workbox: {
                clientsClaim: true,
                skipWaiting: true,
            },
            devOptions: {
                enabled: true,
            },
        }),
    ],
})
