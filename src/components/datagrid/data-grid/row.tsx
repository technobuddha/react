import React from 'react';
import { Box, IconButton } from '@mui/material';
import clsx from 'clsx';
import { MdMoreVert } from 'react-icons/md';

import { type Column } from './column.ts';
import { type RowClasses, type RowStyles } from './column-styles.ts';
import { useColumnStyles } from './column-styles.ts';
import { type MenuFactory } from './menu.ts';

export type RowRenderer<T = unknown> = (
  this: void,
  args: {
    datum: T;
    height?: number;
    width: number[];
    cellClasses?: string;
    cellStyles?: React.CSSProperties;
    columnClasses?: Record<string, string>;
    columnStyles?: Record<string, React.CSSProperties>;
  },
) => React.ReactElement;

export type RowProps<T = unknown> = {
  readonly datum: T;
  readonly index?: number;
  readonly columns: Column<T>[];
  readonly rowRenderer?: RowRenderer<T>;
  readonly columnWidths: number[];
  readonly scrollbarWidth: number;
  readonly controlWidth: number;
  readonly rowHeight?: number;
  readonly menu?: MenuFactory<T>;
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly classes?: RowClasses;
  readonly styles?: RowStyles;
  readonly children?: never;
};

export type RowRenderProps<T = unknown> = {
  column: Column<T>;
  index: number;
};

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
            // eslint-disable-next-line react/jsx-no-bind
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
