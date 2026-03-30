import React from 'react';
import { Box, IconButton } from '@mui/material';
import clsx from 'clsx';
import { MdMoreVert } from 'react-icons/md';

import { type Column } from './column.ts';
import { type RowClasses, type RowStyles } from './column-styles.ts';
import { useColumnStyles } from './column-styles.ts';
import { type MenuFactory } from './menu.ts';

/**
 * Function type for custom row rendering.
 *
 * Allows complete customization of row rendering by providing the data item,
 * dimensions, and styling information. The renderer is responsible for creating
 * all cell elements for the row.
 *
 * @typeParam T - The type of data items in the grid
 *
 * @example
 * ```typescript
 * const customRenderer: RowRenderer\<User\> = ({
 *   datum,
 *   width,
 *   cellClasses,
 *   cellStyles,
 * }) => (
 *   \<\>
 *     \<div className={cellClasses} style={{ width: width[0] }}\>
 *       {datum.name}
 *     \</div\>
 *     \<div className={cellClasses} style={{ width: width[1] }}\>
 *       {datum.email}
 *     \</div\>
 *   \</\>
 * );
 * ```
 *
 * @group Components
 * @category DataGrid
 */
export type RowRenderer<T = unknown> = (
  this: void,
  args: {
    /** The data item for this row */
    datum: T;
    /** Optional fixed height for the row */
    height?: number;
    /** Array of column widths in pixels */
    width: number[];
    /** CSS classes to apply to cells */
    cellClasses?: string;
    /** Inline styles to apply to cells */
    cellStyles?: React.CSSProperties;
    /** CSS classes for specific columns, keyed by column name */
    columnClasses?: Record<string, string>;
    /** Inline styles for specific columns, keyed by column name */
    columnStyles?: Record<string, React.CSSProperties>;
  },
) => React.ReactElement;

/**
 * Props for the Row component.
 *
 * Defines all properties needed to render a data row in the grid,
 * including the data item, column definitions, dimensions, styling, and menu support.
 *
 * @typeParam T - The type of data items in the grid
 * @group Components
 * @category DataGrid
 */
export type RowProps<T = unknown> = {
  /** The data item for this row */
  readonly datum: T;
  /** Optional row index */
  readonly index?: number;
  /** Array of column definitions */
  readonly columns: Column<T>[];
  /** Optional custom renderer for the entire row */
  readonly rowRenderer?: RowRenderer<T>;
  /** Array of column widths in pixels */
  readonly columnWidths: number[];
  /** Width of the scrollbar in pixels */
  readonly scrollbarWidth: number;
  /** Width of the control column in pixels */
  readonly controlWidth: number;
  /** Optional fixed height for the row */
  readonly rowHeight?: number;
  /** Optional factory function for creating context menus */
  readonly menu?: MenuFactory<T>;
  /** Optional CSS class name for the root element */
  readonly className?: string;
  /** Optional inline style for the root element */
  readonly style?: React.CSSProperties;
  /** Optional CSS class overrides for nested elements */
  readonly classes?: RowClasses;
  /** Optional inline style overrides for nested elements */
  readonly styles?: RowStyles;
  /** Children are not supported */
  readonly children?: never;
};

/**
 * Props passed to row render callbacks.
 *
 * @typeParam T - The type of data items in the grid
 * @group Components
 * @category DataGrid
 */
export type RowRenderProps<T = unknown> = {
  /** The column definition */
  column: Column<T>;
  /** The column index */
  index: number;
};

/**
 * Component that renders a single data row in the grid.
 *
 * Displays row data across multiple columns with optional custom rendering,
 * context menu button, and configurable styling. The component supports two
 * rendering modes:
 * 1. Custom row renderer: Uses the provided rowRenderer function for complete control
 * 2. Default rendering: Uses each column's render function to display cells
 *
 * Layout structure:
 * - Data cells (one per column, using configured widths and renderers)
 * - Menu button column (if menu is provided, shows three-dot icon)
 *
 * The component handles:
 * - Rendering all column cells with appropriate styling
 * - Custom row rendering when rowRenderer is provided
 * - Displaying context menu button
 * - Forwarding menu click events with row data and index
 *
 * @typeParam T - The type of data items in the grid
 * @param props - Configuration props for the row
 * @returns A row element containing all data cells
 *
 * @example
 * ```tsx
 * \<Row
 *   datum={user}
 *   index={0}
 *   columns={columns}
 *   columnWidths={[200, 150, 100]}
 *   scrollbarWidth={15}
 *   controlWidth={50}
 *   rowHeight={40}
 *   menu={menuFactory}
 * /\>
 * ```
 *
 * @group Components
 * @category DataGrid
 */
export function Row<T = unknown>({
  datum,
  index,
  columns,
  rowRenderer,
  columnWidths,
  scrollbarWidth,
  controlWidth,
  rowHeight,
  menu,
  className,
  style,
  classes,
  styles,
}: RowProps<T>): React.ReactElement {
  const css = useColumnStyles({ scrollbarWidth, controlWidth });

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>): void => {
    menu?.({ event, datum, index });
  };

  return (
    <Box className={clsx(css.root, className, classes?.root)} style={{ ...styles?.root, ...style }}>
      {rowRenderer ?
        rowRenderer({
          datum,
          height: rowHeight,
          width: columnWidths,
          cellClasses: clsx(css.cell, classes?.cell),
          cellStyles: styles?.cell,
          columnClasses: classes?.column,
          columnStyles: styles?.column,
        })
      : columns.map((column, i) => (
          <Box
            key={column.name}
            height={rowHeight}
            width={columnWidths[i]}
            className={clsx(css.cell, classes?.cell)}
            style={{ ...styles?.cell }}
          >
            {column.render({ datum, classes: classes?.column, styles: styles?.column })}
          </Box>
        ))
      }
      {Boolean(menu) && (
        <Box
          key="[menu]"
          height={rowHeight}
          width={`${controlWidth}px`}
          className={clsx(css.cell, classes?.cell)}
          style={{ ...styles?.cell }}
        >
          <IconButton
            className={clsx(css.menuButton, classes?.menuButton)}
            style={styles?.menuButton}
            onClick={handleMenuClick}
            size="small"
          >
            <MdMoreVert
              className={clsx(css.menuIcon, classes?.menuIcon)}
              style={{ ...styles?.menuIcon }}
            />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}
