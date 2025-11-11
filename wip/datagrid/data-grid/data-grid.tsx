import React from 'react';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';

import { analyzer } from './analyzer.ts';
import { type ColumnSpecifications } from './column.ts';
import { columnCompiler } from './column-compiler/index.tsx';
import { Filterer, type FiltererRenderProps } from './filter/index.ts';
import { filterCompiler, type FilterSpecification } from './filter-compiler/index.ts';
import { Frame, type FrameRenderProps } from './frame.tsx';
import { Grid, type GridClasses, type GridStyles } from './grid.tsx';
import { GridProvider } from './grid-context.tsx';
import { type MenuFactory } from './menu.ts';
import { type RowRenderer } from './row.tsx';
import { RowProvider } from './row-context.tsx';
import { Sorter, type SorterRenderProps } from './sorter.ts';

export type DataGridProps<T = unknown> = {
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly classes?: DataGridClasses;
  readonly styles?: DataGridStyles;
  readonly data: T[];
  readonly columns?: ColumnSpecifications<T>;
  readonly rowRenderer?: RowRenderer;
  readonly selection?: boolean;
  selected?(this: void, datum: T): boolean;
  readonly filters?: FilterSpecification<T>[];
  readonly menu?: MenuFactory<T>;
  readonly defaultSort?: string;
  readonly rowHeight?: number;
  readonly controlWidth?: number;
  readonly useLocation?: boolean;
  onSelectionChanged?(this: void, params: OnSelectionChangedParams<T>): void;
};

export type DataGridClasses = {
  root?: string;
  grid?: GridClasses;
};

export type DataGridStyles = {
  root?: React.CSSProperties;
  grid?: GridStyles;
};

export type OnSelectionChangedParams<T = unknown> = {
  selectedRows: T[];
  selectedCount: number;
  unselectedCount: number;
};

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
