import { isDate, isNumber, isObject, isoDate, isString, numeric } from '@technobuddha/library';

import { type Column, type ColumnSpecifications, type ColumnType } from './column.ts';
import { collatorFactory, headerFactory, rendererFactory } from './column-compiler/index.ts';

/**
 * Types that can be identified by the data analyzer.
 *
 * Includes JavaScript primitive types, special date formats, and composite types.
 *
 * @group Components
 * @category DataGrid
 */
export type IdentifiedType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'symbol'
  | 'object'
  | 'function'
  | 'undefined'
  | 'iso-date'
  | 'null'
  | 'date'
  | 'array';

/**
 * Data structure shapes that can be detected.
 *
 * - `key-value`: Objects with named properties
 * - `array`: Array structures with indexed elements
 * - `primitive`: Primitive values (strings, numbers, etc.)
 * - `polymorphic`: Mixed shapes in the dataset
 *
 * @group Components
 * @category DataGrid
 */
export type Shape = 'key-value' | 'array' | 'primitive' | 'polymorphic';

/**
 * Results returned by the data analyzer.
 *
 * Provides methods to query the analyzed data structure and generate default
 * column configurations based on the detected types and shape.
 *
 * @typeParam T - The type of data items in the grid
 * @group Components
 * @category DataGrid
 */
export type AnalyzerResults<T = unknown> = {
  /**
   * Gets the detected column type for a key
   *
   * @param key - The column key/name
   * @returns The column type including data type and nullability
   */
  getColumnType(this: void, key: string): ColumnType;
  /**
   * Gets the detected data structure shape
   *
   * @returns The shape of the data (key-value, array, primitive, or polymorphic)
   */
  getShape(this: void): Shape;
  /**
   * Creates a default column configuration
   *
   * @param name - The column name
   * @returns A complete column definition with default header, renderer, and collator
   */
  createDefaultColumn(this: void, name: string): Column<T>;
  /**
   * Gets all detected column keys
   *
   * @returns Array of column key names
   */
  getKeys(this: void): string[];
};

/**
 * Analyzes data structure to detect column types and shapes.
 *
 * Performs lazy analysis of the dataset to determine:
 * - Data structure shape (key-value, array, primitive, or polymorphic)
 * - Column types for each detected key
 * - Nullability of columns
 *
 * The analysis is performed lazily on first access to any result method.
 * Results are cached for subsequent calls.
 *
 * Column type detection:
 * - Samples up to 1000 rows for type inference
 * - Handles mixed types (e.g., string/number/null)
 * - Detects ISO date strings and converts to date type
 * - Prefers string over number for mixed numeric strings
 * - Tracks nullability separately
 *
 * @typeParam T - The type of data items in the grid
 * @param args - Configuration containing data and optional column specifications
 * @returns An object with methods to query analysis results
 *
 * @example
 * ```typescript
 * const results = analyzer({
 *   data: users,
 *   columns: [{ name: 'id' }, { name: 'name' }],
 * });
 *
 * const shape = results.getShape(); // 'key-value'
 * const nameType = results.getColumnType('name'); // { dataType: 'string', nullable: false }
 * const keys = results.getKeys(); // ['id', 'name', 'email', ...]
 * ```
 *
 * @group Components
 * @category DataGrid
 */
export function analyzer<T = unknown>({
  data,
  columns,
}: {
  /** The array of data items to analyze */
  data: T[];
  /** Optional column specifications that may include type hints */
  columns?: ColumnSpecifications<T>;
}): AnalyzerResults<T> {
  let information: { types: Record<string, ColumnType | undefined>; shape: Shape } | undefined;

  function getShape(): Shape {
    information ??= analyze({ data, columns });
    return information.shape;
  }

  function getColumnType(key: string): ColumnType {
    information ??= analyze({ data, columns });
    return information.types[key] ?? { dataType: 'unknown', nullable: false };
  }

  function createDefaultColumn(name: string): Column<T> {
    const shape = getShape();
    const type = getColumnType(name);

    return {
      name: name,
      width: '*',
      header: headerFactory({ name }, type, shape),
      render: rendererFactory({ name }, type, shape),
      sortBy: [name],
      collate: collatorFactory({ name }, type, shape),
    };
  }

  function getKeys(): string[] {
    information ??= analyze({ data, columns });
    return Object.keys(information.types);
  }

  return { getColumnType, getShape, createDefaultColumn, getKeys };
}

/**
 * Internal function that performs the actual data analysis.
 *
 * Examines the data structure and column specifications to determine:
 * - Column types by sampling data (up to 1000 rows)
 * - Data structure shape (key-value, array, primitive, polymorphic)
 * - Nullability of each column
 *
 * Type inference rules:
 * - Explicit types in column specs take precedence
 * - ISO date strings are detected and typed as dates
 * - Numeric strings can be typed as numbers
 * - Mixed types default to the most general type
 * - Null/undefined values mark columns as nullable
 *
 * @typeParam T - The type of data items
 * @param args - Data and column specifications
 * @returns An object containing detected types and shape
 * @internal
 */
function analyze<T = unknown>({
  data,
  columns,
}: {
  data: T[];
  columns?: ColumnSpecifications<T>;
}): { types: Record<string, ColumnType>; shape: Shape } {
  const types = {} as Record<string, ColumnType>;
  const used = new Set<string>();
  const columnData = {} as Record<string, Set<IdentifiedType>>;
  const shapes = new Set<Shape>();

  if (columns) {
    for (const column of columns) {
      if (isString(column) || isNumber(column)) {
        used.add(column.toString());
      } else {
        used.add(column.name.toString());

        if (Array.isArray(column.sortBy)) {
          for (const sort of column.sortBy) {
            used.add(sort.toString());
          }
        }

        if (column.type) {
          types[column.name] =
            isString(column.type) ? { dataType: column.type, nullable: false } : column.type;
        }
      }
    }
  }

  for (const datum of data.slice(0, 1000)) {
    if (isObject(datum) && !isDate(datum)) {
      // eslint-disable-next-line unicorn/prefer-object-iterable-methods
      for (const key of Object.keys(datum)) {
        if (!Object.hasOwn(columnData, key)) {
          columnData[key] = new Set<IdentifiedType>();
        }

        columnData[key].add(identify((datum as Record<string, unknown>)[key]));
      }

      shapes.add('key-value');
    } else if (Array.isArray(datum)) {
      for (const [i, element] of datum.entries()) {
        const key = i.toString();

        if (!Object.hasOwn(columnData, key)) {
          columnData[key] = new Set<IdentifiedType>();
        }

        columnData[key].add(identify(element));
      }

      shapes.add('array');
    } else {
      const type = identify(datum);

      if (used.size > 0) {
        for (const key of used) {
          if (!Object.hasOwn(columnData, key)) {
            columnData[key] = new Set<IdentifiedType>();
          }

          columnData[key].add(type);
        }
      } else {
        if (!('*' in columnData)) {
          columnData['*'] = new Set<IdentifiedType>();
        }

        columnData['*'].add(type);
      }

      shapes.add('primitive');
    }
  }

  for (const [key, identified] of Object.entries(columnData)) {
    if (!Object.hasOwn(types, key)) {
      let nullable = false;

      if (identified.has('null') || identified.has('undefined')) {
        identified.delete('null');
        identified.delete('undefined');
        nullable = true;
      }

      if (identified.has('string') && identified.has('iso-date')) {
        identified.delete('iso-date');
      }

      if (identified.has('string') && identified.has('number')) {
        identified.delete('number');
      }

      if (identified.size === 1 && identified.has('number')) {
        types[key] = { dataType: 'number', nullable };
      } else if (identified.size === 1 && identified.has('boolean')) {
        types[key] = { dataType: 'boolean', nullable };
      } else if (identified.size === 1 && (identified.has('date') || identified.has('iso-date'))) {
        types[key] = { dataType: 'date', nullable };
      } else if (identified.size === 1 && identified.has('string')) {
        types[key] = { dataType: 'string', nullable };
      } else if (identified.size === 1 && identified.has('object')) {
        types[key] = { dataType: 'object', nullable };
      } else if (identified.size === 1 && identified.has('array')) {
        types[key] = { dataType: 'array', nullable };
      } else {
        types[key] = { dataType: 'unknown', nullable };
      }
    }
  }

  const shape = shapes.size === 1 ? shapes.values().next().value! : 'polymorphic';

  return { types, shape };
}

/**
 * Identifies the type of a value.
 *
 * Performs deep type detection including:
 * - ISO date string detection
 * - Numeric string detection
 * - Date object detection
 * - Homogeneous array detection (arrays with consistent element types)
 *
 * For arrays, when `identifyArrays` is true, checks if all elements are of
 * the same type. Returns 'array' for homogeneous arrays of primitives,
 * 'object' otherwise.
 *
 * @param value - The value to identify
 * @param identifyArrays - Whether to detect homogeneous arrays (default: true)
 * @returns The identified type
 * @internal
 */
function identify(value: unknown, identifyArrays = true): IdentifiedType {
  const type = typeof value;
  switch (type) {
    case 'string': {
      if (isoDate.test(value as string)) {
        return 'iso-date';
      }
      if (numeric.test(value as string)) {
        return 'number';
      }
      return 'string';
    }

    case 'number':
    case 'bigint': {
      return 'number';
    }

    case 'object': {
      if (value === null) {
        return 'null';
      }
      if (isDate(value)) {
        return 'date';
      }
      if (identifyArrays && Array.isArray(value)) {
        const arrayTypes = new Set<IdentifiedType>();
        for (const val of value) {
          arrayTypes.add(identify(val, false));
        }

        if (
          (arrayTypes.size === 1 && arrayTypes.has('string')) ||
          (arrayTypes.size === 2 && arrayTypes.has('string') && arrayTypes.has('iso-date')) ||
          (arrayTypes.size === 1 && arrayTypes.has('number')) ||
          (arrayTypes.size === 1 && (arrayTypes.has('date') || arrayTypes.has('iso-date'))) ||
          (arrayTypes.size === 2 && arrayTypes.has('date') && arrayTypes.has('iso-date'))
        ) {
          return 'array';
        }

        return 'object';
      }

      return 'object';
    }

    case 'boolean':
    case 'symbol':
    case 'undefined':
    case 'function':
    default: {
      return type;
    }
  }
}
