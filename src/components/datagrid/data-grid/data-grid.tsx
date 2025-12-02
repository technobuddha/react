import React from 'react';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';

import { analyzer } from './analyzer.ts';
import { type ColumnSpecifications } from './column.ts';
import { columnCompiler } from './column-compiler/column-compiler.tsx';
import { Filterer, type FiltererRenderProps } from './filter/index.ts';
import { filterCompiler, type FilterSpecification } from './filter-compiler/filter-compiler.ts';
import { Frame, type FrameRenderProps } from './frame.tsx';
import { Grid, type GridClasses, type GridStyles } from './grid.tsx';
import { GridProvider } from './grid-context.tsx';
import { type MenuFactory } from './menu.ts';
import { type RowRenderer } from './row.tsx';
import { RowProvider } from './row-context.tsx';
import { Sorter, type SorterRenderProps } from './sorter.ts';

/**
 * Props for the DataGrid component.
 *
 * The main configuration interface for creating a feature-rich data grid with
 * sorting, filtering, selection, and custom rendering capabilities.
 *
 * @typeParam T - The type of data items displayed in the grid
 * @group Components
 * @category DataGrid
 */
export type DataGridProps<T = unknown> = {
  /** Optional CSS class name for the root element */
  readonly className?: string;
  /** Optional inline style for the root element */
  readonly style?: React.CSSProperties;
  /** Optional CSS class overrides for nested elements */
  readonly classes?: DataGridClasses;
  /** Optional inline style overrides for nested elements */
  readonly styles?: DataGridStyles;
  /** The array of data items to display */
  readonly data: T[];
  /** Optional column specifications. If not provided, columns are inferred from data */
  readonly columns?: ColumnSpecifications<T>;
  /** Optional custom cell renderer function */
  readonly rowRenderer?: RowRenderer;
  /** Whether to enable row selection with checkboxes */
  readonly selection?: boolean;
  /**
   * Optional function to determine if a row is selected
   *
   * @param datum - The data item for the row
   * @returns True if the row should be marked as selected
   */
  selected?(this: void, datum: T): boolean;
  /** Optional array of filter specifications */
  readonly filters?: FilterSpecification<T>[];
  /** Optional factory function for creating row context menus */
  readonly menu?: MenuFactory<T>;
  /** Optional default sort specification (e.g., 'name:asc' or 'age:desc') */
  readonly defaultSort?: string;
  /** Optional fixed row height in pixels. Enables virtualization for better performance */
  readonly rowHeight?: number;
  /** Optional width of the control column in pixels. Defaults to 40 */
  readonly controlWidth?: number;
  /** Whether to sync sort and filter state with URL query parameters */
  readonly useLocation?: boolean;
  /**
   * Optional callback invoked when selection changes
   *
   * @param params - Object containing selection statistics
   */
  onSelectionChanged?(this: void, params: OnSelectionChangedParams<T>): void;
};

/**
 * CSS class overrides for the DataGrid component.
 *
 * @group Components
 * @category DataGrid
 */
export type DataGridClasses = {
  /** Class for the root container element */
  root?: string;
  /** Classes for the internal Grid component */
  grid?: GridClasses;
};

/**
 * Inline style overrides for the DataGrid component.
 *
 * @group Components
 * @category DataGrid
 */
export type DataGridStyles = {
  /** Style for the root container element */
  root?: React.CSSProperties;
  /** Styles for the internal Grid component */
  grid?: GridStyles;
};

/**
 * Parameters passed to the onSelectionChanged callback.
 *
 * @typeParam T - The type of data items in the grid
 * @group Components
 * @category DataGrid
 */
export type OnSelectionChangedParams<T = unknown> = {
  /** Array of all currently selected data items */
  selectedRows: T[];
  /** Number of selected rows */
  selectedCount: number;
  /** Number of unselected rows */
  unselectedCount: number;
};

/**
 * Material-UI styles for the DataGrid component.
 *
 * @internal
 */
const useDataGridStyles = makeStyles((theme) => ({
  root: {
    flex: '1 0 auto',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

/**
 * A powerful and flexible data grid component for displaying tabular data.
 *
 * Features:
 * - Automatic column detection from data structure
 * - Sortable columns with visual indicators
 * - Multiple filter types (search, checkbox, transfer, custom)
 * - Row selection with checkboxes
 * - Context menus for rows
 * - Virtual scrolling for large datasets (with fixed row heights)
 * - Responsive column sizing (fixed or proportional widths)
 * - URL state synchronization for sorting and filtering
 * - Fully customizable styling and rendering
 *
 * The component automatically analyzes the data structure to determine column types
 * and generate appropriate renderers, collators, and filters. All aspects can be
 * customized through the props.
 *
 * @typeParam T - The type of data items displayed in the grid
 * @param props - Configuration props for the data grid
 * @returns A fully-featured data grid component
 *
 * @example
 * ```tsx
 * interface User {
 *   id: number;
 *   name: string;
 *   email: string;
 *   age: number;
 * }
 *
 * const users: User[] = [
 *   { id: 1, name: 'Alice', email: 'alice@example.com', age: 30 },
 *   { id: 2, name: 'Bob', email: 'bob@example.com', age: 25 },
 * ];
 *
 * \<DataGrid
 *   data={users}
 *   columns={[
 *     { name: 'name', width: 200, sortBy: ['name'] },
 *     { name: 'email', width: 250 },
 *     { name: 'age', width: 100, type: 'number' },
 *   ]}
 *   selection={true}
 *   filters={[
 *     { type: 'search', name: 'name', title: 'Search Name' },
 *   ]}
 *   rowHeight={40}
 *   defaultSort="name:asc"
 * /\>
 * ```
 *
 * @group Components
 * @category DataGrid
 */
export function DataGrid<T = unknown>({
  data,
  columns,
  rowRenderer,
  className,
  style,
  classes,
  styles,
  selection,
  selected,
  filters,
  menu,
  defaultSort,
  rowHeight,
  controlWidth,
  useLocation,
  onSelectionChanged,
}: DataGridProps<T>): React.ReactElement {
  const css = useDataGridStyles();
  const analysis = React.useMemo(() => analyzer({ data, columns }), [data, columns]);
  const compiledColumns = React.useMemo(
    () => columnCompiler<T>(analysis, selection ?? false, controlWidth ?? 40, columns),
    [analysis, selection, controlWidth, columns],
  );
  const compiledFilters = React.useMemo(
    () => (filters ?? []).map((f) => filterCompiler(f, data, analysis)),
    [data, analysis, filters],
  );

  const handleSelectionChanged = React.useCallback(
    (params: OnSelectionChangedParams<T>) => {
      onSelectionChanged?.(params);
    },
    [onSelectionChanged],
  );

  return (
    <GridProvider data={data} defaultSort={defaultSort} useLocation={useLocation}>
      <RowProvider selected={selected} onSelectionChanged={handleSelectionChanged}>
        <Filterer filters={compiledFilters}>
          {(filtered: FiltererRenderProps<T>) => (
            <Sorter data={filtered.data} columns={compiledColumns}>
              {(sorter: SorterRenderProps<T>) => (
                <Frame
                  className={clsx(css.root, className, classes?.root)}
                  style={{ ...style, ...styles?.root }}
                  columns={compiledColumns}
                  controlWidth={controlWidth ?? 40}
                  menu={Boolean(menu)}
                >
                  {(frame: FrameRenderProps) => (
                    <Grid
                      data={sorter.data}
                      columns={compiledColumns}
                      rowRenderer={rowRenderer}
                      columnWidths={frame.columnWidths}
                      rowHeight={rowHeight}
                      controlWidth={controlWidth ?? 40}
                      scrollbarWidth={frame.scrollbarWidth}
                      menu={menu}
                      filters={compiledFilters}
                    />
                  )}
                </Frame>
              )}
            </Sorter>
          )}
        </Filterer>
      </RowProvider>
    </GridProvider>
  );
}
