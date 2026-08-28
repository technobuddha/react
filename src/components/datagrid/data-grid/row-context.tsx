import React from 'react';
import { isArray } from '@technobuddha/library';

import { type OnSelectionChangedParams } from './data-grid.tsx';
import { useGrid } from './grid-context.tsx';

/**
 * State interface for row selection management.
 *
 * Provides access to selection counts and methods to query and modify
 * row selection state.
 *
 * @typeParam T - The type of data items in the grid
 * @internal
 */
type RowState<T = unknown> = {
  /** Number of currently selected rows */
  selectedCount: number;
  /** Number of currently unselected rows */
  unselectedCount: number;
  /**
   * Sets the selection state of a row or rows
   *
   * @param datum - The data item or array of data items
   * @param selected - Whether to select or deselect
   */
  setSelected(this: void, datum: T, selected: boolean): void;
  /**
   * Gets the selection state of a row
   *
   * @param datum - The data item to check
   * @returns True if the row is selected
   */
  getSelected(this: void, datum: T): boolean;
  /**
   * Counts selected and unselected rows in a subset of data
   *
   * @param data - Array of data items to count
   * @returns Object with selected and unselected counts
   */
  countSelected(this: void, data: T[]): { selected: number; unselected: number };
};

/**
 * Internal properties stored for each row.
 *
 * @internal
 */
type RowProperties = {
  /** Whether the row is currently selected */
  selected: boolean;
};

/**
 * React context for sharing row selection state across components.
 *
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RowContext = React.createContext<RowState<any>>(null!);

/**
 * React hook to access row selection context.
 *
 * Provides access to row selection state including counts, and functions
 * to query and modify selection state.
 *
 * @typeParam T - The type of data items in the grid
 * @returns The current row selection state
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { selectedCount, setSelected, getSelected } = useRow\<User\>();
 *   // Use row selection state...
 * }
 * ```
 *
 * @group Components
 * @category DataGrid
 */
export function useRow<T = unknown>(): RowState<T> {
  return React.use(RowContext) as RowState<T>;
}

/**
 * Props for the RowProvider component.
 *
 * @typeParam T - The type of data items in the grid
 * @internal
 */
type RowProviderProps<T = unknown> = {
  /**
   * Optional function to determine initial selection state
   *
   * @param datum - The data item
   * @returns True if the row should be initially selected
   */
  selected?(this: void, datum: T): boolean;
  /**
   * Optional callback invoked when selection changes
   *
   * @param params - Object containing selection statistics and selected rows
   */
  onSelectionChanged?(this: void, params: OnSelectionChangedParams<T>): void;
  /** Child components to render within the provider */
  readonly children?: React.ReactNode;
};

/**
 * Creates default row properties object.
 *
 * @param selected - Initial selection state
 * @returns Row properties with the given selection state
 * @internal
 */
function defaultRowProperties(selected = false): { selected: boolean } {
  return { selected };
}

/**
 * Context provider for row selection state management.
 *
 * Manages selection state for all rows in the data grid. Tracks which rows
 * are selected, maintains selection counts, and notifies listeners when
 * selection changes.
 *
 * Features:
 * - Track selected/unselected state for each row
 * - Efficient selection queries using a Map
 * - Automatic selection count tracking
 * - Callback notifications on selection changes
 * - Initial selection state support
 *
 * The provider creates a Map that associates each data item with its selection
 * state, allowing O(1) lookup and update operations.
 *
 * @typeParam T - The type of data items in the grid
 * @param props - Configuration props for the provider
 * @returns A context provider component
 *
 * @example
 * ```tsx
 * \<RowProvider
 *   selected={(user) => user.isActive}
 *   onSelectionChanged={({ selectedRows, selectedCount }) => {
 *     console.log(`${selectedCount} rows selected`);
 *   }}
 * \>
 *   \<DataGridContent /\>
 * \</RowProvider\>
 * ```
 *
 * @group Components
 * @category DataGrid
 */
export function RowProvider<T = unknown>({
  selected,
  onSelectionChanged,
  children,
}: RowProviderProps<T>): React.ReactElement {
  const { data } = useGrid<T>();
  // eslint-disable-next-line react/use-state
  const [, setUpdate] = React.useState(0);

  const state = React.useMemo(() => {
    let selectedCount = 0;
    const map = new Map<T, RowProperties>();

    for (const datum of data) {
      const datumSelected = Boolean(selected?.(datum));
      if (datumSelected) {
        ++selectedCount;
      }
      map.set(datum, defaultRowProperties(datumSelected));
    }

    return { map, selectedCount, unselectedCount: data.length - selectedCount, now: Date.now() };
  }, [data, selected]);

  const getSelected = React.useCallback(
    (datum: T) => {
      const current = state.map.get(datum);
      if (current) {
        return current.selected;
      }
      return false;
    },
    [state],
  );

  const setDatumSelected = React.useCallback(
    (datum: T, isSelected: boolean) => {
      const current = state.map.get(datum);
      if (current) {
        if (current.selected !== isSelected) {
          current.selected = isSelected;
          if (isSelected) {
            state.selectedCount++;
            state.unselectedCount--;
          } else {
            state.selectedCount--;
            state.unselectedCount++;
          }
          setUpdate((x) => x + 1);
        }
      } else {
        // TODO [>1]: better error recovery
      }
    },
    [state],
  );

  const setSelected = React.useCallback(
    (row: T | T[], isSelected: boolean) => {
      if (isArray(row)) {
        for (const datum of row) {
          setDatumSelected(datum, isSelected);
        }
      } else {
        setDatumSelected(row, isSelected);
      }
    },
    [setDatumSelected],
  );

  const countSelected = React.useCallback(
    (rows: T[]) => {
      let cntSelected = 0;
      let cntUnselected = 0;
      for (const datum of rows) {
        const datumState = state.map.get(datum);
        if (datumState) {
          if (datumState.selected) {
            cntSelected++;
          } else {
            cntUnselected++;
          }
        } else {
          // TODO [>1]: Better error recovery
        }
      }

      return { selected: cntSelected, unselected: cntUnselected };
    },
    [state],
  );

  React.useEffect(() => {
    onSelectionChanged?.({
      selectedRows: data.filter((datum) => getSelected(datum)),
      selectedCount: state.selectedCount,
      unselectedCount: state.unselectedCount,
    });
    // eslint-disable-next-line react/exhaustive-deps
  }, [state, state.selectedCount, state.unselectedCount]);

  const value = React.useMemo(
    () => ({
      selectedCount: state.selectedCount,
      unselectedCount: state.unselectedCount,
      getSelected,
      setSelected,
      countSelected,
    }),
    [countSelected, getSelected, setSelected, state.selectedCount, state.unselectedCount],
  );

  return <RowContext value={value}>{children}</RowContext>;
}
