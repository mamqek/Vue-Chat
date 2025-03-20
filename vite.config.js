import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwind from 'tailwindcss';
import autoprefixer from 'autoprefixer';

import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'


// https://vite.dev/config/
export default defineConfig({
    build: {
        lib: {
            entry: 'components/ChatWidget.ts',
            name: 'ChatWidget',
            fileName: 'chat-widget',
            formats: ["es", "umd"],  // For both ES Module and UMD
        },
        rollupOptions: {
            external: ["vue", "service"],
            output: {
                globals: {
                    vue: "Vue",  // Make sure Vue is available globally in UMD builds
                },
            },
        },
    },
    plugins: [
        vue(),
        vueDevTools(),
        vuetify({ 
            autoImport: true,       // Enabled by default
            styles: { configFile: 'assets/vuetify-settings.scss' }
        }),
    ],
    root: path.resolve(__dirname, 'src'),
    resolve: {
        alias: {
            '@/shadcn-vue-components': path.resolve(__dirname, 'src/components/ui/shadcn-vue'),
            '@/elements': path.resolve(__dirname, 'src/components/ui/elements'),
            '@': path.resolve(__dirname, 'src'),
        },
    },
    css: {
        postcss: {
            plugins: [tailwind(), autoprefixer()],
        },
    },
})
