//@ts-check
/** @type import('@technobuddha/project').TechnobuddhaConfig */
const config = {
  directories: {
    src: {
      platform: 'vite-client',
    },
  },
  lint: {
    rules: {
      'no-bitwise': { rule: 'off' },
    }
  }
};

export default config;
