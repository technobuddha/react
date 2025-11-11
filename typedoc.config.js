//@ts-check
/** @type {import('typedoc').TypeDocOptions} */
const config = {
  // Configuration
  name: 'react-hooks',
  tsconfig: 'src/tsconfig.code.json',
  // Input
  entryPoints: ['src/index.ts'],
  entryPointStrategy: 'resolve',
  excludeInternal: true,
  excludePrivate: true,
  excludeProtected: true,
  gitRevision: 'main',
  readme: 'none',
  //  Output
  basePath: '.',
  //  Organization
  categorizeByGroup: true,
  defaultCategory: 'Uncategorized',
  categoryOrder: ['Uncategorized', '*'],
};

export default config;
