import { isString } from '@technobuddha/library';

import { type FilterValue } from '../../filter/index.ts';

/**
 * Normalizes a filter value to a single string or null
 *
 * Converts filter values to a consistent format for single-value filters:
 * - Arrays: returns first element or null if empty
 * - Strings: returns as-is
 * - null: returns null
 *
 * @param filterValue - The filter value to normalize
 * @returns The first string value or null
 *
 * @group Components
 * @category DataGrid
 */
export const normalizeFilterValue = (filterValue: FilterValue): string | null =>
  Array.isArray(filterValue) ?
    filterValue.length > 0 ?
      filterValue[0]
    : null
  : filterValue;

/**
 * Normalizes a filter value to a string array or null
 *
 * Converts filter values to a consistent format for multi-value filters:
 * - Arrays: returns as-is if non-empty, null if empty
 * - Strings: wraps in array
 * - null: returns null
 *
 * @param filterValue - The filter value to normalize
 * @returns An array of strings or null
 *
 * @group Components
 * @category DataGrid
 */
export const normalizeFilterArray = (filterValue: FilterValue): string[] | null =>
  Array.isArray(filterValue) ?
    filterValue.length > 0 ?
      filterValue
    : null
  : isString(filterValue) ? [filterValue]
  : null;
