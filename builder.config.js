/** @type {import('@technobuddha/builder').Builds} */
const config = {
  dev: {
    watch: true,
    steps: [
      {
        name: 'Clean',
        command: 'rm -rf ./dist'
      },
      {
        name: 'React',
        directory: './src',
        command: 'tsc --build src',
        context: 'daemon',
      },
    ],
  },
  prod: {
    steps: [
      {
        name: 'Clean',
        command: 'rm -rf ./dist',
      },
      {
        name: 'React',
        command: 'tsc --build src',
      },
    ]
  },
  publish: {
    steps: [
      {
        name: 'Clean',
        command: 'rm -rf ./dist',
      },
      {
        name: 'React',
        command: 'tsc --build src',
      },
      {
        name: 'Version',
        command: 'yarn version patch',
      },
      {
        name: 'Publish',
        command: 'yarn npm publish --access public',
      }
    ]
  }
};

export default config;
