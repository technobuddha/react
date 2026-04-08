// 🚨
// 🚨 CHANGES TO THIS FILE WILL BE OVERRIDDEN
// 🚨
// @ts-check
import { lint } from '@technobuddha/project';

export default lint(
  {
    files: ['**/*.ts'],
    ignores: ['@types/**/*', 'components/datagrid/@types/**/*'],
    typescript: true,
  },
  {
    files: ['**/*.tsx'],
    ignores: ['@types/**/*', 'components/datagrid/@types/**/*'],
    typescript: true,
    react: true,
  },
);
