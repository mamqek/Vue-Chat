import path from 'node:path'
import { defineConfig } from 'vite'

import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import tailwind from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
// import purgecss from '@fullhuman/postcss-purgecss';

import vuetify from 'vite-plugin-vuetify'

import { visualizer } from 'rollup-plugin-visualizer'


// https://vite.dev/config/
export default defineConfig(({ command }) => ({
    build: {
        lib: {
            entry: 'widgets/ChatWidget.js',
            name: 'ChatWidget',
            fileName: 'chat-widget',
            formats: ["es", "umd"],
            exports: 'named', // Ensure named exports are included
        },
        rollupOptions: {
            external: ["vue", "service", "@vue/devtools-api"], // Dont include these into build output
            output: {
                // As they are not included, we need to provide a global name for UMD build
                globals: {
                    vue: "Vue",
                    '@vue/devtools-api': 'DevtoolsApi'
                },
            },
            plugins: [
                visualizer({ filename: 'stats.html' })
            ]
        },
    },
    plugins: [
        vue(),
        vueDevTools(),
        vuetify({ 
            autoImport: true,       // Enabled by default
            styles: { configFile: 'assets/vuetify-settings.scss'}
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
            plugins: [
                tailwind(), 
                autoprefixer(),
                // Replace :root with :host in each selector, so css works inside shadow DOM.
                // Only for build command, as it is not needed in dev mode (no shadow dom)
                ...(command === 'build'
                    ? 
                    [
                        {
                            postcssPlugin: 'replace-root-with-host',
                            Once(root) {
                                root.walkRules(rule => {
                                    rule.selector = rule.selector.replace(/:root/g, ':host');
                                });
                            }
                        },
                    ]
                    : 
                    []
                ),
                // Purge which doesn't work because of vuetify
                // purgecss({
                //     content: [
                //         './index.html',
                //         './src/**/*.{js,jsx,ts,tsx,vue}', // Adjust paths to match your project structure.
                //     ],
                //     defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
                //     // Adjust safelist as needed to keep any selectors that are dynamically generated.
                //     safelist: ['host', 'dynamic-class'],
                // }),
                cssnano({
                    preset: 'default',
                }),
            ],
        },
    },
}))
