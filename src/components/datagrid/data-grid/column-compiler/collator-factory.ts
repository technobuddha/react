import { isNumber, toDate, toNumber, toString } from '@technobuddha/library';

import { type Shape } from '../analyzer.ts';
import { type ColumnSpecification, type ColumnType } from '../column.ts';

/**
 * A comparer function that always returns 0.
 *
 * Used when no meaningful comparison can be performed.
 *
 * @returns Always returns 0
 *
 * @internal
 */
const nullComparer = (): number => 0;

/**
 * A collator factory that returns a no-op comparer.
 *
 * Used as a fallback when column sorting is not supported or applicable.
 *
 * @returns A function that returns a comparer that always returns 0
 *
 * @group Components
 * @category DataGrid
 */
export const nullCollator: () => () => number = () => nullComparer;

/**
 * Internationalized string collator for case-insensitive comparison.
 *
 * @internal
 */
const intlCollator = new Intl.Collator(undefined, { sensitivity: 'base' });

/**
 * Creates a collator function for sorting column data.
 *
 * Generates appropriate comparison functions based on the column's data shape and type.
 * If a custom collator is defined in the column specification, it is used instead.
 *
 * The factory handles different data structures:
 * - `key-value`: Extracts values from object properties
 * - `array`: Extracts values from array indices
 * - `primitive`/`polymorphic`: Compares values directly
 *
 * And different data types:
 * - `string`/`array`: Uses locale-aware string comparison
 * - `number`/`boolean`: Numeric comparison
 * - `date`: Timestamp comparison
 *
 * Null and undefined values are consistently sorted to the end regardless of sort direction.
 *
 * @typeParam T - The type of data being sorted
 * @param column - The column specification containing name and optional custom collator
 * @param type - The detected data type of the column
 * @param shape - The structural shape of the data (key-value, array, primitive, or polymorphic)
 * @returns A factory function that takes a sort direction and returns a comparison function
 *
 * @example
 * ```typescript
 * const collator = collatorFactory(
 *   { name: 'age' },
 *   { dataType: 'number' },
 *   'key-value'
 * );
 * const ascComparer = collator(true);
 * const sorted = users.sort(ascComparer);
 * ```
 *
 * @group Components
 * @category DataGrid
 */
export function collatorFactory<T = unknown>(
  column: ColumnSpecification<T>,
  type: ColumnType,
  shape: Shape,
): (ascending: boolean) => (x: T, y: T) => number {
  if (column.collate) {
    return column.collate;
  }

  switch (shape) {
    case 'key-value': {
      const key = column.name.toString();

      // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
      switch (type.dataType) {
        case 'array':
        case 'string': {
          return (ascending: boolean) =>
            ascending ?
              (x: T, y: T) => {
                const xx = (x as Record<string, unknown>)[key];
                const yy = (y as Record<string, unknown>)[key];
                return (
                  xx == null ?
                    yy == null ?
                      0
                    : 1
                  : yy == null ? -1
                  : intlCollator.compare(toString(xx), toString(yy))
                );
              }
            : (x: T, y: T) => {
                const xx = (x as Record<string, unknown>)[key];
                const yy = (y as Record<string, unknown>)[key];
                return (
                  yy == null ?
                    xx == null ?
                      0
                    : -1
                  : xx == null ? 1
                  : intlCollator.compare(toString(yy), toString(xx))
                );
              };
        }

        case 'number':
        case 'boolean': {
          return (ascending: boolean) =>
            ascending ?
              (x: T, y: T) => {
                const xx = (x as Record<string, unknown>)[key];
                const yy = (y as Record<string, unknown>)[key];
                return (
                  xx == null ?
                    yy == null ?
                      0
                    : 1
                  : yy == null ? -1
                  : toNumber(xx as string) - toNumber(yy as string)
                );
              }
            : (x: T, y: T) => {
                const xx = (x as Record<string, unknown>)[key];
                const yy = (y as Record<string, unknown>)[key];
                return (
                  yy == null ?
                    xx == null ?
                      0
                    : -1
                  : xx == null ? 1
                  : toNumber(yy as number) - toNumber(xx as number)
                );
              };
        }

        case 'date': {
          return (ascending: boolean) =>
            ascending ?
              (x: T, y: T) => {
                const xx = (x as Record<string, unknown>)[key];
                const yy = (y as Record<string, unknown>)[key];
                return (
                  xx == null ?
                    yy == null ?
                      0
                    : 1
                  : yy == null ? -1
                  : toDate(xx).getTime() - toDate(yy).getTime()
                );
              }
            : (x: T, y: T) => {
                const xx = (x as Record<string, unknown>)[key];
                const yy = (y as Record<string, unknown>)[key];
                return (
                  yy == null ?
                    xx == null ?
                      0
                    : -1
                  : xx == null ? 1
                  : toDate(yy).getTime() - toDate(xx).getTime()
                );
              };
        }

        default: {
          return nullCollator;
        }
      }
    }

    case 'array': {
      const key = isNumber(column.name) ? column.name : Number.parseInt(column.name);

      // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
      switch (type.dataType) {
        case 'string': {
          return (ascending: boolean) =>
            ascending ?
              (x: T, y: T) => {
                const xx = (x as unknown as unknown[])[key];
                const yy = (y as unknown as unknown[])[key];
                return (
                  xx == null ?
                    yy == null ?
                      0
                    : 1
                  : yy == null ? -1
                  : intlCollator.compare(toString(xx), toString(yy))
                );
              }
            : (x: T, y: T) => {
                const xx = (x as unknown as unknown[])[key];
                const yy = (y as unknown as unknown[])[key];
                return (
                  yy == null ?
                    xx == null ?
                      0
                    : -1
                  : xx == null ? 1
                  : intlCollator.compare(toString(yy), toString(xx))
                );
              };
        }

        case 'number':
        case 'boolean': {
          return (ascending: boolean) =>
            ascending ?
              (x: T, y: T) => {
                const xx = (x as unknown as unknown[])[key];
                const yy = (y as unknown as unknown[])[key];
                return (
                  xx == null ?
                    yy == null ?
                      0
                    : 1
                  : yy == null ? -1
                  : toNumber(xx as string) - toNumber(yy as string)
                );
              }
            : (x: T, y: T) => {
                const xx = (x as unknown as unknown[])[key];
                const yy = (y as unknown as unknown[])[key];
                return (
                  yy == null ?
                    xx == null ?
                      0
                    : -1
                  : xx == null ? 1
                  : toNumber(yy as string) - toNumber(xx as string)
                );
              };
        }

        case 'date': {
          return (ascending: boolean) =>
            ascending ?
              (x: T, y: T) => {
                const xx = (x as unknown as unknown[])[key];
                const yy = (y as unknown as unknown[])[key];
                return (
                  xx == null ?
                    yy == null ?
                      0
                    : 1
                  : yy == null ? -1
                  : toDate(xx).getTime() - toDate(yy).getTime()
                );
              }
            : (x: T, y: T) => {
                const xx = (x as unknown as unknown[])[key];
                const yy = (y as unknown as unknown[])[key];
                return (
                  yy == null ?
                    xx == null ?
                      0
                    : -1
                  : xx == null ? 1
                  : toDate(yy).getTime() - toDate(xx).getTime()
                );
              };
        }

        default: {
          return nullCollator;
        }
      }
    }

    case 'primitive':
    case 'polymorphic': {
      // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
      switch (type.dataType) {
        case 'string': {
          return (ascending: boolean) =>
            ascending ?
              (x: T, y: T) =>
                x == null ?
                  y == null ?
                    0
                  : 1
                : y == null ? -1
                : intlCollator.compare(toString(x), toString(y))
            : (x: T, y: T) =>
                y == null ?
                  x == null ?
                    0
                  : -1
                : x == null ? 1
                : intlCollator.compare(toString(y), toString(x));
        }

        case 'number':
        case 'boolean': {
          return (ascending: boolean) =>
            ascending ?
              (x: T, y: T) =>
                x == null ?
                  y == null ?
                    0
                  : 1
                : y == null ? -1
                : toNumber(x as string) - toNumber(y as string)
            : (x: T, y: T) =>
                y == null ?
                  x == null ?
                    0
                  : -1
                : x == null ? 1
                : toNumber(y as string) - toNumber(x as string);
        }

        case 'date': {
          return (ascending: boolean) =>
            ascending ?
              (x: T, y: T) =>
                x == null ?
                  y == null ?
                    0
                  : 1
                : y == null ? -1
                : toDate(x).getTime() - toDate(y).getTime()
            : (x: T, y: T) =>
                y == null ?
                  x == null ?
                    0
                  : -1
                : x == null ? 1
                : toDate(y).getTime() - toDate(x).getTime();
        }

        default: {
          return nullCollator;
        }
      }
    }

    default: {
      return nullCollator;
    }
  }
}
