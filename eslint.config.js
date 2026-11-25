import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import {defineConfig, globalIgnores} from 'eslint/config'

export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            tseslint.configs.strictTypeChecked,
            tseslint.configs.stylisticTypeChecked,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                // the type-checked rules need the TypeScript project
                projectService: {
                    // vite.config.ts is outside the src folder covered by tsconfig.json, the scripts have their own
                    allowDefaultProject: ['vite.config.ts'],
                },
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            // numbers are used to build CSS values in template literals
            '@typescript-eslint/restrict-template-expressions': ['error', {allowNumber: true}],
            // allows short arrow functions such as () => audioService.playCardSlide()
            '@typescript-eslint/no-confusing-void-expression': ['error', {ignoreArrowShorthand: true}],
            // softer-components contracts must be type aliases: an interface has no implicit index signature
            '@typescript-eslint/consistent-type-definitions': 'off',
        },
    },
    {
        // the scripts run with Node.js
        files: ['scripts/**/*.ts'],
        languageOptions: {globals: globals.node},
    },
])
