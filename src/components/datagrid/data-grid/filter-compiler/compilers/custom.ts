import { type Filter } from '../../filter/index.ts';

import { type CompilerOptions } from './options.ts';

/**
 * Options for a custom filter compiler.
 *
 * Allows defining custom filtering logic by providing a filter function
 * that operates on the data and returns a Filter object.
 *
 * @typeParam T - The type of data being filtered
 * @group Components
 * @category DataGrid
 */
export type CustomCompilerOptions<T = unknown> = CompilerOptions & {
  /** The type identifier for custom filter compilers */
  type: 'custom';
  /**
   * Custom filter function that processes the data
   *
   * @param data - The array of data to filter
   * @param clear - Optional reference to a clear function from CompilerOptions
   * @returns A Filter object containing the filtering logic
   */
  filter(data: T[], clear?: CompilerOptions['clear']): Filter<T>;
};

/**
 * Creates a filter using a custom filter function.
 *
 * This compiler delegates filtering logic to a user-provided function,
 * allowing for flexible and custom filtering behavior beyond the built-in
 * filter types.
 *
 * @typeParam T - The type of data being filtered
 * @param options - The custom compiler options containing the filter function
 * @param data - The array of data to be filtered
 * @returns A Filter object containing the custom filtering logic
 *
 * @example
 * ```typescript
 * const options: CustomCompilerOptions\<User\> = {
 *   type: 'custom',
 *   filter: (data, clear) => ({
 *     predicate: (user) => user.age \> 18,
 *     indicator: () => \<div\>Adults Only\</div\>,
 *   }),
 * };
 * const filter = filterCompilerCustom(options, users);
 * ```
 *
 * @group Components
 * @category DataGrid
 */
export function filterCompilerCustom<T = unknown>(
  options: CustomCompilerOptions<T>,
  data: T[],
): Filter<T> {
  return options.filter(data, options.clear);
}
