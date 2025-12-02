import React from 'react';
import { Box, IconButton } from '@mui/material';
import clsx from 'clsx';
import { MdMoreVert } from 'react-icons/md';

import { type Column } from './column.ts';
import { type RowClasses, type RowStyles } from './column-styles.ts';
import { useColumnStyles } from './column-styles.ts';
import { type MenuFactory } from './menu.ts';

/**
 * Props for the RowHeader component.
 *
 * Defines all properties needed to render the header row of the data grid,
 * including column definitions, dimensions, styling, and menu support.
 *
 * @typeParam T - The type of data items in the grid
 * @group Components
 * @category DataGrid
 */
export type RowHeaderProps<T = unknown> = {
  /** The complete dataset for the grid */
  readonly data: T[];
  /** Optional row index (used when header has associated data) */
  readonly index?: number;
  /** Array of column definitions */
  readonly columns: Column<T>[];
  /** Array of column widths in pixels */
  readonly columnWidths: number[];
  /** Width of the scrollbar in pixels */
  readonly scrollbarWidth: number;
  /** Width of the control column in pixels */
  readonly controlWidth: number;
  /** Optional fixed height for the header row */
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
 * Component that renders the header row of the data grid.
 *
 * Displays column headers with sort indicators, optional menu button, and a
 * scrollbar stub to maintain alignment with the data rows. Each column header
 * is rendered using its configured header renderer function.
 *
 * Layout structure:
 * - Column headers (one per column, using configured widths)
 * - Menu button column (if menu is provided)
 * - Scrollbar stub (to align with scrollbar in data area)
 *
 * The component handles:
 * - Rendering all column headers with appropriate styling
 * - Displaying context menu button (three-dot icon)
 * - Maintaining consistent width alignment with data rows
 * - Forwarding menu click events to the menu factory
 *
 * @typeParam T - The type of data items in the grid
 * @param props - Configuration props for the header row
 * @returns A header row element containing all column headers
 *
 * @example
 * ```tsx
 * \<RowHeader
 *   data={users}
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
export function RowHeader<T = unknown>({
  data,
  index,
  columns,
  columnWidths,
  scrollbarWidth,
  controlWidth,
  rowHeight,
  menu,
  className,
  style,
  classes,
  styles,
}: RowHeaderProps<T>): React.ReactElement {
  const css = useColumnStyles({ scrollbarWidth, controlWidth });

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>): void => {
    menu?.({ event, data, index });
  };

  return (
    <Box className={clsx(css.root, className, classes?.root)} style={{ ...styles?.root, ...style }}>
      {columns.map((column, i) => (
        <Box
          key={column.name}
          height={rowHeight}
          width={columnWidths[i]}
          className={clsx(css.cell, classes?.cell, css.cellHeader, classes?.cellHeader)}
          style={{ ...styles?.cell, ...styles?.cellHeader }}
        >
          {column.header({ data, classes: classes?.header, styles: styles?.header })}
        </Box>
      ))}
      {Boolean(menu) && (
        <Box
          key="[menu]"
          height={rowHeight}
          width={`${controlWidth}px`}
          className={clsx(css.cell, classes?.cell, css.cellHeader, classes?.cellHeader)}
          style={{ ...styles?.cell, ...styles?.cellHeader }}
        >
          <IconButton
            className={clsx(css.menuButton, classes?.menuButton)}
            style={styles?.menuButton}
            // eslint-disable-next-line react/jsx-no-bind
            onClick={handleMenuClick}
            size="small"
          >
            <MdMoreVert
              className={clsx(
                css.menuIcon,
                classes?.menuIcon,
                css.menuIconHeader,
                classes?.menuIconHeader,
              )}
              style={{ ...styles?.menuIcon, ...styles?.menuIconHeader }}
            />
          </IconButton>
        </Box>
      )}
      <Box
        key="[stub]"
        width={`${scrollbarWidth}px`}
        className={clsx(css.cell, css.stub, classes?.cell, css.cellHeader, classes?.cellHeader)}
        style={{ ...styles?.cell, ...styles?.stub, ...styles?.cellHeader }}
      >
        {'\u00A0'}
      </Box>
    </Box>
  );
}
