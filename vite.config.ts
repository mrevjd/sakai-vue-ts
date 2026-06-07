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
        // Scoped to pure logic in src/utils (e.g. the DOMPurify sanitizer).
        // jsdom is required because DOMPurify needs a DOM to operate on.
        environment: 'jsdom',
        include: ['src/utils/**/*.{test,spec}.ts']
    }
});
