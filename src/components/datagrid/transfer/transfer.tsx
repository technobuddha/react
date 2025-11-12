import React from 'react';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';

import { useDerivedState } from '../../../hooks/use-derived-state.ts';

import { type ColumnSpecification } from '../data-grid/column.ts';
import {
  type DataGridClasses,
  type DataGridStyles,
  type OnSelectionChangedParams,
} from '../data-grid/data-grid.tsx';
import { DataGrid } from '../data-grid/data-grid.tsx';
import { type FilterSpecification } from '../data-grid/filter-compiler/index.ts';

import {
  type DispatchFunction,
  type TransferButtonClasses,
  type TransferButtonStyles,
} from './transfer-buttons.tsx';
import TransferButtons from './transfer-buttons.tsx';

function not<T = unknown>(a: T[], b: T[]): T[] {
  return a.filter((value) => !b.includes(value));
}

export type TransferProps<T = unknown> = {
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly classes?: TransferClasses;
  readonly styles?: TransferStyles;
  readonly rowHeight?: number;
  readonly left: T[];
  readonly right: T[];
  readonly name: string;
  readonly title?: string;
  onTransfer?(this: void, left: T[], right: T[]): void;
  readonly children?: never;
};

type TransferClasses = TransferClassesBase & {
  grid: DataGridClasses;
  buttons: TransferButtonClasses;
};

type TransferStyles = TransferStylesBase & {
  grid: DataGridStyles;
  buttons: TransferButtonStyles;
};

type TransferClassesBase = {
  root: string;
  gridBox: string;
  buttonsBox: string;
};
type TransferStylesBase = { [key in keyof TransferClassesBase]: React.CSSProperties };

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'row',
    width: 640,
    height: 480,
  },
  gridBox: {
    flexGrow: 1,
  },
});

export function Transfer<T = unknown>({
  left: leftProp,
  right: rightProp,
  rowHeight,
  name,
  title,
  onTransfer,
  className,
  style,
  classes,
  styles,
}: TransferProps<T>): React.ReactElement {
  const css = useStyles();
  const dispatch = React.useRef<DispatchFunction | null>(null);
  const [left, setLeft] = useDerivedState(leftProp, [leftProp]);
  const [right, setRight] = useDerivedState(rightProp, [rightProp]);
  const selected = React.useMemo(
    () => ({ left: [] as T[], right: [] as T[] }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [leftProp, rightProp],
  );
  const columns = React.useMemo(() => [{ name } as ColumnSpecification<T>], [name]);
  const clearR = React.useRef<() => void>(null);
  const clearL = React.useRef<() => void>(null);
  const filtersR = React.useMemo(
    () => [{ type: 'search', name, title: title ?? name, clear: clearR } as FilterSpecification<T>],
    [name, title],
  );
  const filtersL = React.useMemo(
    () => [{ type: 'search', name, title: title ?? name, clear: clearL } as FilterSpecification<T>],
    [name, title],
  );
  const isLeftSelected = React.useCallback((datum: T) => selected.left.includes(datum), [selected]);
  const isRightSelected = React.useCallback(
    (datum: T) => selected.right.includes(datum),
    [selected],
  );

  const handleSelectionChangedLeft = React.useCallback(
    ({ selectedRows, selectedCount, unselectedCount }: OnSelectionChangedParams<T>) => {
      selected.left = selectedRows;
      dispatch.current?.({
        rAll: selectedCount === 0 && unselectedCount === 0,
        rSel: selectedCount === 0,
      });
    },
    [selected],
  );
  const handleSelectionChangedRight = React.useCallback(
    ({ selectedRows, selectedCount, unselectedCount }: OnSelectionChangedParams<T>) => {
      selected.right = selectedRows;
      dispatch.current?.({
        lSel: selectedCount === 0,
        lAll: selectedCount === 0 && unselectedCount === 0,
      });
    },
    [selected],
  );
  const handleAllRight = React.useCallback(() => {
    const newLeft: T[] = [];
    const newRight: T[] = [...right, ...left];

    setLeft(newLeft);
    setRight(newRight);

    selected.right = [...selected.right, ...selected.left];
    selected.left = [];

    onTransfer?.(newLeft, newRight);
    clearR.current?.();
  }, [right, left, setLeft, setRight, selected, onTransfer]);
  const handleSelectedRight = React.useCallback(() => {
    const newLeft: T[] = not(left, selected.left);
    const newRight: T[] = [...right, ...selected.left];

    setLeft(newLeft);
    setRight(newRight);

    selected.right = [...selected.right, ...selected.left];
    selected.left = [];

    onTransfer?.(newLeft, newRight);
    clearL.current?.();
  }, [left, selected, right, setLeft, setRight, onTransfer]);
  const handleSelectedLeft = React.useCallback(() => {
    const newLeft: T[] = [...left, ...selected.right];
    const newRight: T[] = not(right, selected.right);

    setLeft(newLeft);
    setRight(newRight);

    selected.left = [...selected.left, ...selected.right];
    selected.right = [];

    onTransfer?.(newLeft, newRight);
    clearR.current?.();
  }, [left, selected, right, setLeft, setRight, onTransfer]);
  const handleAllLeft = React.useCallback(() => {
    const newLeft: T[] = [...left, ...right];
    const newRight: T[] = [];

    setLeft(newLeft);
    setRight(newRight);

    selected.left = [...selected.left, ...selected.right];
    selected.right = [];

    onTransfer?.(newLeft, newRight);
    clearL.current?.();
  }, [left, right, setLeft, setRight, selected, onTransfer]);

  return (
    <Box className={clsx(css.root, className, classes?.root)} style={{ ...style, ...styles?.root }}>
      <Box className={clsx(css.gridBox, classes?.gridBox)} style={styles?.gridBox} flexGrow={1}>
        <DataGrid
          classes={classes?.grid}
          rowHeight={rowHeight}
          styles={styles?.grid}
          selection
          selected={isLeftSelected}
          data={left}
          columns={columns}
          filters={filtersR}
          defaultSort={name}
          onSelectionChanged={handleSelectionChangedLeft}
        />
      </Box>
      <Box className={classes?.buttonsBox} style={styles?.buttonsBox}>
        <TransferButtons
          classes={classes?.buttons}
          styles={styles?.buttons}
          dispatch={dispatch}
          onRAllClick={handleAllRight}
          onRSelClick={handleSelectedRight}
          onLSelClick={handleSelectedLeft}
          onLAllClick={handleAllLeft}
        />
      </Box>
      <Box className={clsx(css.gridBox, classes?.gridBox)} style={styles?.gridBox}>
        <DataGrid
          classes={classes?.grid}
          rowHeight={rowHeight}
          styles={styles?.grid}
          selection
          selected={isRightSelected}
          data={right}
          columns={columns}
          filters={filtersL}
          defaultSort={name}
          onSelectionChanged={handleSelectionChangedRight}
        />
      </Box>
    </Box>
  );
}

export default Transfer;
