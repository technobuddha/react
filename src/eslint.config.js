// 🚨
// 🚨 CHANGES TO THIS FILE WILL BE OVERRIDDEN
// 🚨
// @ts-check
import { lint } from '@technobuddha/project';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  lint({
    files: ['**/*.ts'],
    ignores: ['@types/**/*', 'components/datagrid/@types/**/*'],
    typescript: true,
  }),
  lint({
    files: ['**/*.tsx'],
    ignores: ['@types/**/*', 'components/datagrid/@types/**/*'],
    typescript: true,
    react: true,
  }),
]);
