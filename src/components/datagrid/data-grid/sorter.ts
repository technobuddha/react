import { cull } from '@technobuddha/library';
import type React from 'react';

import { type Column } from './column.ts';
import { useGrid } from './grid-context.tsx';

type SorterProps<T = unknown> = {
  data: T[];
  columns: Column<T>[];
  children(this: void, props: SorterRenderProps<T>): React.ReactElement;
};

export type SorterRenderProps<T = unknown> = {
  data: T[];
};

export function Sorter<T = unknown>({
  data,
  columns,
  children,
}: SorterProps<T>): React.ReactElement {
  const { sort } = useGrid<T>();

  if (sort === undefined) {
    //TODO [2025-12-31]: Better error recovery
  } else {
    const column = columns.find((col) => col.name === sort.sortBy);

    if (column?.sortBy && column.sortBy.length > 0) {
      const collators = cull(
        // eslint-disable-next-line @typescript-eslint/unbound-method
        column.sortBy.map((s) => columns.find((col) => col.name === s)?.collate),
      ).map((collate) => collate(sort.sortAscending));
      if (collators.length > 0) {
        data.sort((x: T, y: T) => {
          let result = 0;
          for (const collator of collators) {
            result = collator(x, y);
            if (result !== 0) {
              break;
            }
          }
          return result;
        });
      }
    }
  }

  return children({ data });
}

export default Sorter;
