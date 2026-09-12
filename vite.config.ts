import { PrimeVueResolver } from '@primevue/auto-import-resolver';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
    base: '/',
    optimizeDeps: {
        noDiscovery: false
    },
    plugins: [
        vue(),
        tailwindcss(),
        Components({
            // Only PrimeVue is auto-imported; shadcn components are imported explicitly. Removed in the sweep that drops PrimeVue.
            dirs: [],
            resolvers: [PrimeVueResolver()]
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler'
            }
        }
    },
    test: {
        // jsdom because DOMPurify and the mounted components need a DOM.
        environment: 'jsdom',
        include: ['src/**/*.{test,spec}.ts'],
        setupFiles: ['src/test/setup.ts']
    }
});
