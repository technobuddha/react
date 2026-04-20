import { type AnalyzerResults } from '../analyzer.ts';
import { type Filter } from '../filter/index.ts';

import {
  type CheckboxCompilerOptions,
  type CustomCompilerOptions,
  type SearchCompilerOptions,
  type TransferCompilerOptions,
} from './compilers/index.ts';
import {
  filterCompilerCheckbox,
  filterCompilerCustom,
  filterCompilerSearch,
  filterCompilerTransfer,
} from './compilers/index.ts';

/**
 * Union type representing all possible filter specifications.
 *
 * A filter specification defines the configuration for a filter in the DataGrid.
 * The type discriminator is the `type` property, which determines which compiler
 * will be used to create the filter.
 *
 * @typeParam T - The type of data being filtered
 * @group Components
 * @category DataGrid
 */
export type FilterSpecification<T = unknown> =
  | CustomCompilerOptions<T>
  | CheckboxCompilerOptions<T>
  | TransferCompilerOptions<T>
  | SearchCompilerOptions<T>;

/**
 * Compiles a filter specification into a Filter object.
 *
 * This function acts as a factory that routes to the appropriate filter compiler
 * based on the `type` property in the options. It supports multiple filter types:
 * - `checkbox-list`: Multi-select checkbox filter
 * - `transfer`: Transfer list filter for selecting items
 * - `search`: Text-based search filter
 * - `custom`: User-defined custom filter logic
 *
 * @typeParam T - The type of data being filtered
 * @param options - The filter specification defining the filter behavior
 * @param data - The array of data to be filtered
 * @param analysis - Results from analyzing the data structure and types
 * @returns A Filter object containing the filtering logic and UI components
 *
 * @example
 * ```typescript
 * const filter = filterCompiler(
 *   {
 *     type: 'search',
 *     name: 'username',
 *     title: 'Search Users',
 *   },
 *   users,
 *   analysisResults
 * );
 * ```
 *
 * @group Components
 * @category DataGrid
 */
export function filterCompiler<T = unknown>(
  options: FilterSpecification<T>,
  data: T[],
  analysis: AnalyzerResults<T>,
): Filter<T> {
  switch (options.type) {
    case 'checkbox-list': {
      return filterCompilerCheckbox(options, data, analysis);
    }
    case 'transfer': {
      return filterCompilerTransfer(options, analysis);
    }
    case 'search': {
      return filterCompilerSearch(options, analysis);
    }
    case 'custom':
    default: {
      return filterCompilerCustom(options, data);
    }
  }
}

export default filterCompiler;
