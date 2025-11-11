import React from 'react';
import { isNumber } from '@technobuddha/library';
import {
  SizeScrollbar,
  type SizeScrollbarProps,
  type SizeScrollbarRenderProps,
} from '@technobuddha/size';

import { type Column } from './column.ts';

export type FrameProps<T = unknown> = Omit<SizeScrollbarProps, 'children'> & {
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly columns: Column<T>[];
  readonly controlWidth: number;
  readonly menu?: boolean;
  children(this: void, props: FrameRenderProps): React.ReactElement;
};

export type FrameRenderProps = SizeScrollbarRenderProps & {
  columnWidths: number[];
};

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

export default Frame;
