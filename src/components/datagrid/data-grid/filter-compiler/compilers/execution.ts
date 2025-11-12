import { toString } from '@technobuddha/library';

import { type Shape } from '../../analyzer.ts';
import { type FilterValue } from '../../filter/index.ts';

import { normalizeFilterArray, normalizeFilterValue } from './normalization.ts';

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
