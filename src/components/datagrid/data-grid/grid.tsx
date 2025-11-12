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

export type GridProps<T = unknown> = {
  readonly classes?: GridClasses;
  readonly styles?: GridStyles;
  readonly data: T[];
  readonly columns: Column<T>[];
  readonly rowRenderer?: RowRenderer;
  readonly columnWidths: number[];
  readonly scrollbarWidth: number;
  readonly controlWidth: number;
  readonly rowHeight?: number;
  readonly filters?: Filter<T>[];
  readonly menu?: MenuFactory<T>;
  readonly children?: never;
};

export type GridClasses = {
  filter?: {
    actuator?: FilterActuatorClasses;
    indicator?: FilterIndicatorClasses;
  };
  area?: GridAreaClasses;
  row?: RowClasses;
  column?: RowClasses['column'];
};

export type GridStyles = {
  filter?: {
    actuator?: FilterActuatorStyles;
    indicator?: FilterIndicatorStyles;
  };
  area?: GridAreaStyles;
  row?: RowStyles;
  column?: RowStyles['column'];
};

type GridAreaClasses = {
  actuators?: string;
  indicators?: string;
  header?: string;
  detail?: string;
};
type GridAreaStyles = { [key in keyof GridAreaClasses]: React.CSSProperties };

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
