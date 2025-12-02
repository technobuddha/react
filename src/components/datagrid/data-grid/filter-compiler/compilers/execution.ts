import { toString } from '@technobuddha/library';

import { type Shape } from '../../analyzer.ts';
import { type FilterValue } from '../../filter/index.ts';

import { normalizeFilterArray, normalizeFilterValue } from './normalization.ts';

/**
 * Creates a filter execution function for text search filtering
 *
 * Returns a function that filters data by checking if field values contain
 * the search string (case-insensitive). Handles different data shapes:
 * - key-value: searches object properties
 * - array: searches array elements by index
 * - primitive/polymorphic: searches the datum directly
 *
 * @param name - The column name or index to filter
 * @param shape - The data shape (key-value, array, primitive, polymorphic)
 * @returns A filter execution function that performs text search
 *
 * @group Components
 * @category DataGrid
 * @typeParam T - The data item type
 */
export function searchExecute<T = unknown>(
  name: keyof T,
  shape: Shape,
): (data: T[], value: FilterValue) => T[] {
  switch (shape) {
    case 'key-value': {
      return (data: T[], value: FilterValue) => {
        const filterValue = normalizeFilterValue(value);

        if (filterValue) {
          const search = filterValue.toLocaleLowerCase();

          return data.filter((datum) => {
            const field = datum[name];

            return Array.isArray(field) ?
                field.some((f) => toString(f).toLocaleLowerCase().includes(search))
              : toString(field).toLocaleLowerCase().includes(search);
          });
        }

        return data;
      };
    }

    case 'array': {
      const key = Number.parseInt(name as string);

      return (data: T[], value: FilterValue) => {
        const filterValue = normalizeFilterValue(value);

        if (filterValue) {
          const search = filterValue.toLocaleLowerCase();

          return data.filter((datum) => {
            const field = (datum as unknown as unknown[])[key];

            return Array.isArray(field) ?
                field.some((f) => toString(f).toLocaleLowerCase().includes(search))
              : toString(field).toLocaleLowerCase().includes(search);
          });
        }

        return data;
      };
    }

    case 'primitive':
    case 'polymorphic':
    default: {
      return (data: T[], value: FilterValue) => {
        const filterValue = normalizeFilterValue(value);

        if (filterValue) {
          const search = filterValue.toLocaleLowerCase();
          return data.filter((datum) => toString(datum).toLocaleLowerCase().includes(search));
        }

        return data;
      };
    }
  }
}

/**
 * Creates a filter execution function for exact equality filtering
 *
 * Returns a function that filters data by checking if field values exactly match
 * any of the selected filter values. Handles different data shapes:
 * - key-value: checks object properties for exact matches
 * - array: checks array elements by index for exact matches
 * - primitive/polymorphic: checks the datum directly for exact matches
 *
 * @param name - The column name or index to filter
 * @param shape - The data shape (key-value, array, primitive, polymorphic)
 * @returns A filter execution function that performs equality comparison
 *
 * @group Components
 * @category DataGrid
 * @typeParam T - The data item type
 */
export function equalityExecute<T = unknown>(
  name: keyof T,
  shape: Shape,
): (data: T[], value: FilterValue) => T[] {
  switch (shape) {
    case 'key-value': {
      return (data: T[], value: FilterValue) => {
        const filterValue = normalizeFilterArray(value);

        if (filterValue) {
          return data.filter((datum) => {
            const field = datum[name];

            return Array.isArray(field) ?
                field.some((f) => filterValue.includes(toString(f)))
              : filterValue.includes(toString(field));
          });
        }

        return data;
      };
    }

    case 'array': {
      const key = Number.parseInt(name as string);

      return (data: T[], value: FilterValue) => {
        const filterValue = normalizeFilterArray(value);

        if (filterValue) {
          return data.filter((datum) => {
            const field = (datum as unknown as unknown[])[key];

            return Array.isArray(field) ?
                field.some((f) => filterValue.includes(toString(f)))
              : filterValue.includes(toString(field));
          });
        }

        return data;
      };
    }

    case 'primitive':
    case 'polymorphic':
    default: {
      return (data: T[], value: FilterValue) => {
        const filterValue = normalizeFilterArray(value);

        if (filterValue) {
          return data.filter((datum) => filterValue.includes(toString(datum)));
        }

        return data;
      };
    }
  }
}
