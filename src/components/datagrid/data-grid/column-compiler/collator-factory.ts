import { isNumber, toDate, toNumber, toString } from '@technobuddha/library';

import { type Shape } from '../analyzer.ts';
import { type ColumnSpecification, type ColumnType } from '../column.ts';

const nullComparer = (): number => 0;
export const nullCollator: () => () => number = () => nullComparer;
const intlCollator = new Intl.Collator(undefined, { sensitivity: 'base' });

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
                  : toNumber(xx) - toNumber(yy)
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
                  : toNumber(yy) - toNumber(xx)
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
                  : toNumber(x) - toNumber(y)
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
                  : toNumber(y) - toNumber(y)
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
                : toNumber(x) - toNumber(y)
            : (x: T, y: T) =>
                y == null ?
                  x == null ?
                    0
                  : -1
                : x == null ? 1
                : toNumber(y) - toNumber(x);
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
