/* eslint-disable react/no-multi-comp */
/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { FixedSizeList, type ListChildComponentProps } from 'react-window';

import { Size } from '../../size/index.tsx';

import { type Column } from './column.ts';
import { type RowClasses, type RowStyles } from './column-styles.ts';
import {
  type Filter,
  type FilterActuatorClasses,
  type FilterActuatorStyles,
  type FilterIndicatorClasses,
  type FilterIndicatorStyles,
} from './filter/index.ts';
import { type MenuFactory } from './menu.ts';
import { type RowRenderer } from './row.tsx';
import { Row } from './row.tsx';
import { RowHeader } from './row-header.tsx';

/**
 * Material-UI styles for the Grid component.
 *
 * @internal
 */
const useGridStyles = makeStyles((theme) => ({
  actuators: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: theme.palette.grey[700],
  },
  indicators: {
    'display': 'flex',
    'flexDirection': 'row',
    'border': `3px solid ${theme.palette.grey[700]}`,
    'padding': theme.spacing(1),
    '&:empty': {
      display: 'none',
    },
  },
}));

/**
 * Props for the Grid component.
 *
 * Defines all configuration options for rendering the data grid including
 * data, columns, styling, filtering, and interaction handlers.
 *
 * @typeParam T - The type of data items in the grid
 * @group Components
 * @category DataGrid
 */
export type GridProps<T = unknown> = {
  /** Optional CSS class overrides for grid areas, rows, and filters */
  readonly classes?: GridClasses;
  /** Optional inline style overrides for grid areas, rows, and filters */
  readonly styles?: GridStyles;
  /** The array of data items to display in the grid */
  readonly data: T[];
  /** Column definitions specifying how to render each column */
  readonly columns: Column<T>[];
  /** Optional custom renderer for row cells */
  readonly rowRenderer?: RowRenderer;
  /** Array of column widths in pixels, one per column */
  readonly columnWidths: number[];
  /** Width of the scrollbar in pixels */
  readonly scrollbarWidth: number;
  /** Width of the control column (e.g., for checkboxes or row numbers) in pixels */
  readonly controlWidth: number;
  /** Optional fixed height for rows. If provided, enables virtualization */
  readonly rowHeight?: number;
  /** Optional array of filter objects for filtering the grid data */
  readonly filters?: Filter<T>[];
  /** Optional factory function for creating context menus */
  readonly menu?: MenuFactory<T>;
  /** Children are not supported */
  readonly children?: never;
};

/**
 * CSS class overrides for the Grid component.
 *
 * Allows customization of styling for different parts of the grid
 * including filters, areas, rows, and columns.
 *
 * @group Components
 * @category DataGrid
 */
export type GridClasses = {
  /** Classes for filter components */
  filter?: {
    /** Classes for filter actuator buttons */
    actuator?: FilterActuatorClasses;
    /** Classes for active filter indicators */
    indicator?: FilterIndicatorClasses;
  };
  /** Classes for different grid areas */
  area?: GridAreaClasses;
  /** Classes for row elements */
  row?: RowClasses;
  /** Classes for column cells */
  column?: RowClasses['column'];
};

/**
 * Inline style overrides for the Grid component.
 *
 * Allows customization of inline styles for different parts of the grid
 * including filters, areas, rows, and columns.
 *
 * @group Components
 * @category DataGrid
 */
export type GridStyles = {
  /** Styles for filter components */
  filter?: {
    /** Styles for filter actuator buttons */
    actuator?: FilterActuatorStyles;
    /** Styles for active filter indicators */
    indicator?: FilterIndicatorStyles;
  };
  /** Styles for different grid areas */
  area?: GridAreaStyles;
  /** Styles for row elements */
  row?: RowStyles;
  /** Styles for column cells */
  column?: RowStyles['column'];
};

/**
 * CSS classes for different grid areas.
 *
 * @group Components
 * @category DataGrid
 */
export type GridAreaClasses = {
  /** Class for the filter actuators area */
  actuators?: string;
  /** Class for the filter indicators area */
  indicators?: string;
  /** Class for the header area */
  header?: string;
  /** Class for the detail/data area */
  detail?: string;
};

/**
 * Inline styles for different grid areas.
 *
 * @group Components
 * @category DataGrid
 */
export type GridAreaStyles = { [key in keyof GridAreaClasses]: React.CSSProperties };

/**
 * The main Grid component for rendering tabular data.
 *
 * Renders a feature-rich data grid with:
 * - Customizable columns with headers
 * - Optional filters with actuators and indicators
 * - Row virtualization when fixed row height is provided
 * - Context menus for rows
 * - Custom row renderers
 * - Responsive sizing
 *
 * The grid automatically switches between virtualized rendering (for fixed row heights)
 * and standard rendering (for dynamic row heights). Virtualization improves performance
 * with large datasets by only rendering visible rows.
 *
 * @typeParam T - The type of data items in the grid
 * @param props - The grid configuration props
 * @returns A React element rendering the complete data grid
 *
 * @example
 * ```tsx
 * \<Grid
 *   data={users}
 *   columns={columns}
 *   columnWidths={[200, 150, 100]}
 *   rowHeight={40}
 *   scrollbarWidth={15}
 *   controlWidth={50}
 *   filters={filters}
 * /\>
 * ```
 *
 * @group Components
 * @category DataGrid
 */
export function Grid<T = unknown>({
  classes,
  styles,
  rowHeight,
  scrollbarWidth,
  controlWidth,
  data,
  columns,
  rowRenderer,
  columnWidths,
  filters,
  menu,
}: GridProps<T>): React.ReactElement {
  const css = useGridStyles();

  const GridRow = (rowProps: ListChildComponentProps): React.ReactElement => {
    // eslint-disable-next-line react/destructuring-assignment
    const datum = data[rowProps.index];

    return (
      <Row
        classes={classes?.row}
        styles={styles?.row}
        // eslint-disable-next-line react/destructuring-assignment
        style={rowProps.style}
        // eslint-disable-next-line react/destructuring-assignment
        index={rowProps.index}
        datum={datum}
        columns={columns}
        rowRenderer={rowRenderer}
        columnWidths={columnWidths}
        rowHeight={rowHeight}
        controlWidth={controlWidth}
        scrollbarWidth={scrollbarWidth}
        menu={menu}
      />
    );
  };

  return (
    <>
      {Boolean(filters) && (
        <>
          <Box
            className={clsx(css.actuators, classes?.area?.actuators)}
            style={styles?.area?.actuators}
          >
            {filters?.map((filter, index) => (
              <filter.Actuator
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                classes={classes?.filter?.actuator}
                styles={styles?.filter?.actuator}
              />
            ))}
          </Box>
          <Box
            className={clsx(css.indicators, classes?.area?.indicators)}
            style={styles?.area?.indicators}
          >
            {filters?.flatMap((filter, index) =>
              filter.Indicator ?
                <filter.Indicator
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  classes={classes?.filter?.indicator}
                  styles={styles?.filter?.indicator}
                />
              : [],
            )}
          </Box>
        </>
      )}
      <RowHeader
        classes={classes?.row}
        styles={styles?.row}
        data={data}
        columns={columns}
        columnWidths={columnWidths}
        scrollbarWidth={scrollbarWidth}
        rowHeight={32}
        controlWidth={controlWidth}
        menu={menu}
      />
      <Size style={{ flexGrow: 1 }}>
        {({ width, height }) => {
          if (rowHeight) {
            return (
              <FixedSizeList
                height={height}
                width={width}
                itemCount={data.length}
                itemSize={rowHeight}
                layout="vertical"
              >
                {/* TODO [2025-11-30]: any */}
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {GridRow as any}
              </FixedSizeList>
            );
          }

          return (
            <Box width={width} height={height} style={{ overflowX: 'auto' }}>
              {data.map((datum, index) => (
                <Row
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  classes={classes?.row}
                  styles={styles?.row}
                  datum={datum}
                  columns={columns}
                  rowRenderer={rowRenderer}
                  columnWidths={columnWidths}
                  controlWidth={controlWidth}
                  scrollbarWidth={scrollbarWidth}
                  menu={menu}
                />
              ))}
            </Box>
          );
        }}
      </Size>
    </>
  );
}
