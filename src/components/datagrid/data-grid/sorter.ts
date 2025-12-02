import { cull } from '@technobuddha/library';
import type React from 'react';

import { type Column } from './column.ts';
import { useGrid } from './grid-context.tsx';

/**
 * Props for the Sorter component.
 *
 * @typeParam T - The type of data items in the grid
 * @internal
 */
type SorterProps<T = unknown> = {
  /** The array of data items to sort */
  data: T[];
  /** Column definitions containing collation functions */
  columns: Column<T>[];
  /**
   * Render function that receives the sorted data
   *
   * @param props - Object containing the sorted data
   * @returns React element to render with sorted data
   */
  children(this: void, props: SorterRenderProps<T>): React.ReactElement;
};

/**
 * Props passed to the Sorter component's render function.
 *
 * @typeParam T - The type of data items in the grid
 * @group Components
 * @category DataGrid
 */
export type SorterRenderProps<T = unknown> = {
  /** The sorted array of data items */
  data: T[];
};

/**
 * Component that sorts data and provides it to child components via render props.
 *
 * Reads the current sort configuration from the grid context and applies the
 * appropriate collation functions to sort the data. The component supports
 * multi-level sorting by chaining multiple collators when a column specifies
 * multiple sort keys.
 *
 * Sorting behavior:
 * - If no sort is active, returns data unsorted
 * - Finds the column matching the sort key from grid context
 * - Uses the column's sortBy array to determine sort fields
 * - Chains collators for multi-level sorting (falls through on equality)
 * - Mutates the input data array by sorting in place
 *
 * Multi-level sorting example:
 * If sortBy is ['lastName', 'firstName'], the data is sorted first by lastName,
 * and when lastName values are equal, by firstName.
 *
 * @typeParam T - The type of data items in the grid
 * @param props - Configuration props for the sorter
 * @returns The result of calling the children render function with sorted data
 *
 * @example
 * ```tsx
 * \<Sorter data={users} columns={columns}\>
 *   {({ data: sortedUsers }) => (
 *     \<Grid data={sortedUsers} ... /\>
 *   )}
 * \</Sorter\>
 * ```
 *
 * @group Components
 * @category DataGrid
 */
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

/**
 * Default export of the Sorter component.
 *
 * @group Components
 * @category DataGrid
 */
export default Sorter;
