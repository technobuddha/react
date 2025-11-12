import { type Filter } from '../../filter/index.ts';

import { type CompilerOptions } from './options.ts';

export type CustomCompilerOptions<T = unknown> = CompilerOptions & {
  type: 'custom';
  filter(data: T[], clear?: CompilerOptions['clear']): Filter<T>;
};

export function filterCompilerCustom<T = unknown>(
  options: CustomCompilerOptions<T>,
  data: T[],
): Filter<T> {
  // eslint-disable-next-line unicorn/no-array-method-this-argument
  return options.filter(data, options.clear);
}
