// @ts-check
// 🚨
// 🚨 CHANGES TO THIS FILE WILL BE OVERRIDDEN
// 🚨
import { app } from '@technobuddha/project';

/** @type {import('eslint').Linter.Config[]} */
const config = [
  // .
  app.lint({ files: ['*.config.js'], ignores: [], environment: 'node' }),
  // .
  app.lint({
    files: ['*.config.ts', '*.setup.ts'],
    ignores: [],
    environment: 'node',
    tsConfig: 'tsconfig.json',
  }),
  // src
  app.lint({ files: ['src/**/*.ts'], ignores: [], tsConfig: 'src/tsconfig.json' }),
  // src
  app.lint({ files: ['src/**/*.tsx'], ignores: [], tsConfig: 'src/tsconfig.json', react: true }),
  // wip/audio
  app.lint({
    files: ['wip/audio/**/*.ts'],
    ignores: [],
    environment: 'node',
    tsConfig: 'wip/audio/tsconfig.json',
  }),
  // wip/datagrid
  app.lint({
    files: ['wip/datagrid/**/*.tsx'],
    ignores: [],
    environment: 'node',
    tsConfig: 'wip/datagrid/tsconfig.json',
    react: true,
  }),
  // wip/datagrid
  app.lint({
    files: ['wip/datagrid/**/*.ts'],
    ignores: [],
    environment: 'node',
    tsConfig: 'wip/datagrid/tsconfig.json',
  }),
];

export default config;
