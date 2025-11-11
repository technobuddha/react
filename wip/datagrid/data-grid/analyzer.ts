import { isDate, isNumber, isObject, isoDate, isString, numeric } from '@technobuddha/library';

import { type Column, type ColumnSpecifications, type ColumnType } from './column.ts';
import { collatorFactory, headerFactory, rendererFactory } from './column-compiler/index.tsx';

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
export type Shape = 'key-value' | 'array' | 'primitive' | 'polymorphic';

export type AnalyzerResults<T = unknown> = {
  getColumnType(this: void, key: string): ColumnType;
  getShape(this: void): Shape;
  createDefaultColumn(this: void, name: string): Column<T>;
  getKeys(this: void): string[];
};

export function analyzer<T = unknown>({
  data,
  columns,
}: {
  data: T[];
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
      for (const key of Object.keys(datum)) {
        if (!(key in columnData)) {
          columnData[key] = new Set<IdentifiedType>();
        }

        columnData[key].add(identify((datum as Record<string, unknown>)[key]));
      }

      shapes.add('key-value');
    } else if (Array.isArray(datum)) {
      for (const [i, element] of datum.entries()) {
        const key = i.toString();

        if (!(key in columnData)) {
          columnData[key] = new Set<IdentifiedType>();
        }

        columnData[key].add(identify(element));
      }

      shapes.add('array');
    } else {
      const type = identify(datum);

      if (used.size > 0) {
        for (const key of used.keys()) {
          if (!(key in columnData)) {
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
    if (!(key in types)) {
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

function identify(value: unknown, identifyArrays = true): IdentifiedType {
  const type = typeof value;
  switch (type) {
    case 'string': {
      if (isoDate.test(value as string)) {
        return 'iso-date';
      } else if (numeric.test(value as string)) {
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
      } else if (isDate(value)) {
        return 'date';
      } else if (identifyArrays && Array.isArray(value)) {
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
