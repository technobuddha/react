import React from 'react';

import { type FilterValue, type FilterValues } from './filter/index.ts';
import { type SortKey } from './query.ts';
import {
  decodeSort,
  getFiltersFromQueryString,
  getSortFromQueryString,
  setFiltersInQueryString,
  setSortInQueryString,
} from './query.ts';

/**
 * State interface for the grid context.
 *
 * Provides access to grid data, sort state, filter state, and methods
 * to update sort and filter values.
 *
 * @typeParam T - The type of data items in the grid
 * @internal
 */
type GridState<T = unknown> = {
  /** The array of data items in the grid */
  data: T[];
  /** Current sort configuration, if any */
  sort?: SortKey;
  /**
   * Function to change the sort order
   *
   * @param sort - Column name to sort by
   */
  changeSort(this: void, sort: string): void;
  /** Current filter values keyed by column name */
  filterValues: FilterValues<T>;
  /**
   * Function to update a filter value
   *
   * @param name - Column name to filter
   * @param value - Filter value to apply
   */
  changeFilter(this: void, name: keyof T, value: FilterValue): void;
};

/**
 * React context for sharing grid state across components.
 *
 * @internal
 */
const GridContext = React.createContext<GridState>(null!);

/**
 * React hook to access the grid context.
 *
 * Provides access to grid data, current sort state, filter values,
 * and functions to update sorting and filtering.
 *
 * @typeParam T - The type of data items in the grid
 * @returns The current grid state
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { sort, changeSort, filterValues } = useGrid\<User\>();
 *   // Use grid state...
 * }
 * ```
 *
 * @group Components
 * @category DataGrid
 */
export function useGrid<T = unknown>(): GridState<T> {
  return React.use(GridContext) as GridState<T>;
}

/**
 * Props for the GridProvider component.
 *
 * @typeParam T - The type of data items in the grid
 * @internal
 */
type GridProviderProps<T = unknown> = {
  /** The array of data items for the grid */
  readonly data: T[];
  /** Optional default sort specification (e.g., 'name:asc' or 'age:desc') */
  readonly defaultSort?: string;
  /** Whether to sync sort and filter state with URL query parameters */
  readonly useLocation?: boolean;
  /** Child components to render within the provider */
  readonly children: React.ReactNode;
};

/**
 * Context provider for grid state management.
 *
 * Manages sort and filter state for the data grid, with optional URL synchronization.
 * When `useLocation` is enabled, sort and filter state is persisted to URL query
 * parameters and restored on page load or browser navigation.
 *
 * Features:
 * - Sort state management with toggle between ascending/descending
 * - Filter state management for multiple columns
 * - Optional URL query parameter synchronization
 * - Browser history support (back/forward buttons)
 *
 * @typeParam T - The type of data items in the grid
 * @param props - Configuration props for the provider
 * @returns A context provider component
 *
 * @example
 * ```tsx
 * \<GridProvider
 *   data={users}
 *   defaultSort="name:asc"
 *   useLocation={true}
 * \>
 *   \<DataGridContent /\>
 * \</GridProvider\>
 * ```
 *
 * @group Components
 * @category DataGrid
 */
export function GridProvider<T = unknown>({
  data,
  defaultSort,
  useLocation,
  children,
}: GridProviderProps<T>): React.ReactElement {
  function baseSort(): SortKey | undefined {
    return (useLocation ? getSortFromQueryString() : undefined) ?? decodeSort(defaultSort);
  }
  const [sortCode, setSortCode] = React.useState<SortKey | undefined>(baseSort);
  const changeSort = React.useCallback(
    (columnName: string) => {
      let newSort: SortKey;

      // eslint-disable-next-line prefer-const
      newSort =
        sortCode === undefined ?
          {
            sortBy: columnName,
            sortAscending: true,
          }
        : {
            sortBy: columnName,
            sortAscending: columnName === sortCode.sortBy ? !sortCode.sortAscending : true,
          };

      setSortCode(newSort);
      if (useLocation) {
        setSortInQueryString(newSort);
      }
    },
    // eslint-disable-next-line react/exhaustive-deps
    [sortCode],
  );

  const baseFilterValues = React.useCallback(
    () => (useLocation ? getFiltersFromQueryString() : {}),
    // eslint-disable-next-line react/exhaustive-deps
    [],
  );
  const [filterValues, setFilterValues] = React.useState<FilterValues>(baseFilterValues);
  const changeFilter = React.useCallback(
    (name: keyof T, value: FilterValue) => {
      const newFilterValues = { ...filterValues, [name]: value };
      setFilterValues(newFilterValues);
      if (useLocation) {
        setFiltersInQueryString(newFilterValues);
      }
    },
    // eslint-disable-next-line react/exhaustive-deps
    [filterValues],
  );

  const handlePopState = React.useCallback(() => {
    setSortCode(baseSort());
    setFilterValues(baseFilterValues());
    // eslint-disable-next-line react/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (useLocation) {
      // eslint-disable-next-line unicorn/prefer-global-this
      window.addEventListener('popstate', handlePopState);
    }
    return () => {
      if (useLocation) {
        // eslint-disable-next-line unicorn/prefer-global-this
        window.removeEventListener('popstate', handlePopState);
      }
    };
    // eslint-disable-next-line react/exhaustive-deps
  }, [useLocation]);

  return (
    // eslint-disable-next-line react/no-unstable-context-value
    <GridContext value={{ data, sort: sortCode, changeSort, filterValues, changeFilter }}>
      {children}
    </GridContext>
  );
}

/**
 * Default export of the useGrid hook.
 *
 * @group Components
 * @category DataGrid
 */
export default useGrid;
