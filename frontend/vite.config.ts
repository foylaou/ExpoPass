import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'
import Sitemap from 'vite-plugin-sitemap'
import { createHtmlPlugin } from 'vite-plugin-html'

// https://vite.dev/config/
export default defineConfig({
    server: {
        allowedHosts: ["01296ddfa1e9.ngrok-free.app"],
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
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
                cleanupOutdatedCaches: true,
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/expopass\.isafe\.org\.tw\/api\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 300, // 5 minutes
                            },
                            networkTimeoutSeconds: 10,
                        },
                    },
                    {
                        urlPattern: /^https:\/\/expopass\.isafe\.org\.tw\/assets\/.*/i,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'assets-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 86400, // 24 hours
                            },
                        },
                    },
                ],
            },
            manifest: {
                name: 'ExpoPass 展覽管理系統',
                short_name: 'ExpoPass',
                description: '現代化的展覽活動管理系統',
                theme_color: '#ffffff',
                icons: [
                    {
                        src: '/pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: '/pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            },
            devOptions: {
                enabled: true,
            },
        }),
    ],
})
