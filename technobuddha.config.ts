import { defineConfig } from '@technobuddha/project/config';

export default defineConfig({
  directories: {
    src: {
      platform: 'vite-client',
    },
  },
  lint: {
    rules: {
      'no-bitwise': { rule: 'off' },
    },
  },
});
