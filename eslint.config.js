import js from '@eslint/js';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';
import { configureVueProject, defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import pluginVue from 'eslint-plugin-vue';

configureVueProject({ scriptLangs: ['ts', 'js'] });

export default defineConfigWithVueTs(
    {
        name: 'app/files-to-lint',
        files: ['**/*.{ts,mts,tsx,vue,js,jsx,cjs,mjs}']
    },
    {
        name: 'app/files-to-ignore',
        ignores: ['**/node_modules/**', '**/.bun/**', '**/dist/**', '**/dist-ssr/**', '**/coverage/**', 'components.d.ts', '*.tsbuildinfo']
    },
    js.configs.recommended,
    pluginVue.configs['flat/essential'],
    vueTsConfigs.recommended,
    skipFormatting,
    {
        name: 'app/rules',
        rules: {
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
            'vue/multi-word-component-names': 'off'
        }
    }
);
