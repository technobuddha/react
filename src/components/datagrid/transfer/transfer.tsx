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
import { type FilterSpecification } from '../data-grid/filter-compiler/filter-compiler.ts';

import {
  type DispatchFunction,
  type TransferButtonClasses,
  type TransferButtonStyles,
} from './transfer-buttons.tsx';
import TransferButtons from './transfer-buttons.tsx';

/**
 * Returns elements in array a that are not in array b.
 *
 * @typeParam T - The type of array elements
 * @param a - The source array
 * @param b - The array of elements to exclude
 * @returns A new array containing elements from a that are not in b
 * @internal
 */
function not<T = unknown>(a: T[], b: T[]): T[] {
  return a.filter((value) => !b.includes(value));
}

/**
 * Props for the Transfer component.
 *
 * Defines properties for a dual-list transfer component that allows users
 * to move items between two lists (available and selected).
 *
 * @typeParam T - The type of data items in the lists
 * @group Components
 * @category DataGrid
 */
export type TransferProps<T = unknown> = {
  /** Optional CSS class name for the root element */
  readonly className?: string;
  /** Optional inline style for the root element */
  readonly style?: React.CSSProperties;
  /** Optional CSS class overrides for nested elements */
  readonly classes?: TransferClasses;
  /** Optional inline style overrides for nested elements */
  readonly styles?: TransferStyles;
  /** Optional fixed height for rows in pixels */
  readonly rowHeight?: number;
  /** Array of items in the left (available) list */
  readonly left: T[];
  /** Array of items in the right (selected) list */
  readonly right: T[];
  /** Property name to display for each item */
  readonly name: string;
  /** Optional title for the filter/search box */
  readonly title?: string;
  /**
   * Optional callback invoked when items are transferred
   *
   * @param left - Updated left list after transfer
   * @param right - Updated right list after transfer
   */
  onTransfer?(this: void, left: T[], right: T[]): void;
  /** Children are not supported */
  readonly children?: never;
};

/**
 * CSS class overrides for the Transfer component.
 *
 * @group Components
 * @category DataGrid
 */
export type TransferClasses = TransferClassesBase & {
  /** Classes for the data grid components */
  grid: DataGridClasses;
  /** Classes for the transfer buttons */
  buttons: TransferButtonClasses;
};

/**
 * Inline style overrides for the Transfer component.
 *
 * @group Components
 * @category DataGrid
 */
export type TransferStyles = TransferStylesBase & {
  /** Styles for the data grid components */
  grid: DataGridStyles;
  /** Styles for the transfer buttons */
  buttons: TransferButtonStyles;
};

/**
 * Base CSS classes for Transfer component structure.
 *
 * @group Components
 * @category DataGrid
 */
export type TransferClassesBase = {
  /** Class for the root container */
  root: string;
  /** Class for the grid container boxes */
  gridBox: string;
  /** Class for the buttons container box */
  buttonsBox: string;
};

/**
 * Base inline styles for Transfer component structure.
 *
 * @group Components
 * @category DataGrid
 */
export type TransferStylesBase = { [key in keyof TransferClassesBase]: React.CSSProperties };

/**
 * Material-UI styles for the Transfer component.
 *
 * @internal
 */
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

/**
 * A dual-list transfer component for moving items between two lists.
 *
 * Displays two data grids side by side with transfer buttons between them,
 * allowing users to move selected items from the left (available) list to
 * the right (selected) list and vice versa.
 *
 * Features:
 * - Two synchronized data grids with selection
 * - Four transfer operations:
 *   - Move all items right (available → selected)
 *   - Move selected items right
 *   - Move selected items left
 *   - Move all items left (selected → available)
 * - Search/filter capability for both lists
 * - Row selection with checkboxes
 * - Button states reflect current selection
 * - Automatic filter clearing after transfer
 *
 * The component manages internal state for both lists and notifies the parent
 * via the onTransfer callback when items are moved.
 *
 * @typeParam T - The type of data items in the lists
 * @param props - Configuration props for the transfer component
 * @returns A dual-list transfer interface
 *
 * @example
 * ```tsx
 * \<Transfer
 *   left={availableUsers}
 *   right={selectedUsers}
 *   name="username"
 *   title="Select Users"
 *   rowHeight={40}
 *   onTransfer={(left, right) => {
 *     console.log('Available:', left);
 *     console.log('Selected:', right);
 *   }}
 * /\>
 * ```
 *
 * @group Components
 * @category Transfer
 */
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
  const dispatchRef = React.useRef<DispatchFunction | null>(null);
  const [left, setLeft] = useDerivedState(leftProp, [leftProp]);
  const [right, setRight] = useDerivedState(rightProp, [rightProp]);
  const selected = React.useMemo(
    () => ({ left: [] as T[], right: [] as T[] }),
    // eslint-disable-next-line react/exhaustive-deps
    [leftProp, rightProp],
  );
  const columns = React.useMemo(() => [{ name } as ColumnSpecification<T>], [name]);
  const clearRRef = React.useRef<() => void>(null);
  const clearLRef = React.useRef<() => void>(null);
  const filtersR = React.useMemo(
    () => [
      { type: 'search', name, title: title ?? name, clear: clearRRef } as FilterSpecification<T>,
    ],
    [name, title],
  );
  const filtersL = React.useMemo(
    () => [
      { type: 'search', name, title: title ?? name, clear: clearLRef } as FilterSpecification<T>,
    ],
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
      dispatchRef.current?.({
        rAll: selectedCount === 0 && unselectedCount === 0,
        rSel: selectedCount === 0,
      });
    },
    [selected],
  );
  const handleSelectionChangedRight = React.useCallback(
    ({ selectedRows, selectedCount, unselectedCount }: OnSelectionChangedParams<T>) => {
      selected.right = selectedRows;
      dispatchRef.current?.({
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
    clearRRef.current?.();
  }, [right, left, setLeft, setRight, selected, onTransfer]);
  const handleSelectedRight = React.useCallback(() => {
    const newLeft: T[] = not(left, selected.left);
    const newRight: T[] = [...right, ...selected.left];

    setLeft(newLeft);
    setRight(newRight);

    selected.right = [...selected.right, ...selected.left];
    selected.left = [];

    onTransfer?.(newLeft, newRight);
    clearLRef.current?.();
  }, [left, selected, right, setLeft, setRight, onTransfer]);
  const handleSelectedLeft = React.useCallback(() => {
    const newLeft: T[] = [...left, ...selected.right];
    const newRight: T[] = not(right, selected.right);

    setLeft(newLeft);
    setRight(newRight);

    selected.left = [...selected.left, ...selected.right];
    selected.right = [];

    onTransfer?.(newLeft, newRight);
    clearRRef.current?.();
  }, [left, selected, right, setLeft, setRight, onTransfer]);
  const handleAllLeft = React.useCallback(() => {
    const newLeft: T[] = [...left, ...right];
    const newRight: T[] = [];

    setLeft(newLeft);
    setRight(newRight);

    selected.left = [...selected.left, ...selected.right];
    selected.right = [];

    onTransfer?.(newLeft, newRight);
    clearLRef.current?.();
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
          dispatch={dispatchRef}
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

/**
 * Default export of the Transfer component.
 *
 * @group Components
 * @category Transfer
 */
export default Transfer;
