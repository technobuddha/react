import React from 'react';
import { Box, IconButton } from '@mui/material';
import clsx from 'clsx';
import { MdMoreVert } from 'react-icons/md';

import { type Column } from './column.ts';
import { type RowClasses, type RowStyles } from './column-styles.ts';
import { useColumnStyles } from './column-styles.ts';
import { type MenuFactory } from './menu.ts';

export type RowHeaderProps<T = unknown> = {
  readonly data: T[];
  readonly index?: number;
  readonly columns: Column<T>[];
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
