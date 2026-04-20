import React from 'react';
import { isNumber } from '@technobuddha/library';

import {
  SizeScrollbar,
  type SizeScrollbarProps,
  type SizeScrollbarRenderProps,
} from '../../size-scrollbar/index.tsx';

import { type Column } from './column.ts';

/**
 * Props for the Frame component.
 *
 * Extends SizeScrollbar props to add grid-specific configuration for
 * column width calculations and layout management.
 *
 * @typeParam T - The type of data items in the grid
 * @group Components
 * @category DataGrid
 */
export type FrameProps<T = unknown> = Omit<SizeScrollbarProps, 'children'> & {
  /** Optional CSS class name for the root element */
  readonly className?: string;
  /** Optional inline style for the root element */
  readonly style?: React.CSSProperties;
  /** Array of column definitions for width calculations */
  readonly columns: Column<T>[];
  /** Width of the control column in pixels */
  readonly controlWidth: number;
  /** Whether a menu column is present */
  readonly menu?: boolean;
  /**
   * Render function that receives calculated dimensions and column widths
   *
   * @param props - Object containing dimensions and column widths
   * @returns React element to render inside the frame
   */
  children(this: void, props: FrameRenderProps): React.ReactElement;
};

/**
 * Props passed to the Frame component's render function.
 *
 * Extends scrollbar dimension information with calculated column widths.
 *
 * @group Components
 * @category DataGrid
 */
export type FrameRenderProps = SizeScrollbarRenderProps & {
  /** Array of calculated column widths in pixels */
  columnWidths: number[];
};

/**
 * Container component that manages grid layout and column width calculations.
 *
 * The Frame component wraps the grid content and calculates appropriate column widths
 * based on the available space, column specifications (fixed or proportional), and
 * reserved space for scrollbars and control columns.
 *
 * Width calculation logic:
 * 1. Start with available width minus scrollbar width and borders
 * 2. Subtract control column width if menu is enabled
 * 3. Subtract all fixed-width columns
 * 4. Distribute remaining space proportionally among star-width columns
 *
 * Star widths (e.g., '*', '2*', '3*') are proportional:
 * - '*' or '1*' gets 1 unit of remaining space
 * - '2*' gets 2 units of remaining space
 * - etc.
 *
 * @typeParam T - The type of data items in the grid
 * @param props - Configuration props for the frame
 * @returns A container element with calculated layout dimensions
 *
 * @example
 * ```tsx
 * \<Frame
 *   columns={columns}
 *   controlWidth={50}
 *   menu={true}
 * \>
 *   {({ columnWidths, width, height }) => (
 *     \<Grid columnWidths={columnWidths} ... /\>
 *   )}
 * \</Frame\>
 * ```
 *
 * @group Components
 * @category DataGrid
 */
export function Frame<T = unknown>({
  className,
  style,
  columns,
  controlWidth,
  menu,
  children,
}: FrameProps<T>): React.ReactElement {
  return (
    <SizeScrollbar className={className} style={style}>
      {({ width, height, scrollbarWidth, scrollbarHeight }: SizeScrollbarRenderProps) => {
        let rowWidth = width - scrollbarWidth - 2;
        let stars = 0;

        if (menu) {
          rowWidth -= controlWidth;
        }

        for (const column of columns) {
          if (isNumber(column.width)) {
            rowWidth -= column.width;
          } else {
            stars += Number.parseInt(column.width) || 1;
          }
        }

        const columnWidths = columns.map((column) =>
          isNumber(column.width) ?
            column.width
          : (rowWidth * (Number.parseInt(column.width) || 1)) / stars,
        );
        return children({ width, height, scrollbarWidth, scrollbarHeight, columnWidths });
      }}
    </SizeScrollbar>
  );
}

/**
 * Default export of the Frame component.
 *
 * @group Components
 * @category DataGrid
 */
export default Frame;
