import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import { Transfer } from '../../../transfer/index.ts';

import { type AnalyzerResults } from '../../analyzer.ts';
import { type Filter, type FilterActuatorProps2 } from '../../filter/index.ts';
import { useGrid } from '../../grid-context.tsx';

import FilterActuator from '../filter-actuator.tsx';
import { arrayIndicator } from '../indicators.tsx';
import { getUniqueValues } from '../util.ts';

import { equalityExecute } from './execution.ts';
import { normalizeFilterArray } from './normalization.ts';
import { type CompilerOptions } from './options.ts';

/**
 * Options for creating a transfer list filter
 *
 * @group Components
 * @category DataGrid
 * @typeParam T - The data item type
 */
export type TransferCompilerOptions<T = unknown> = CompilerOptions & {
  /** Filter type identifier */
  type: 'transfer';
  /** The column name to filter */
  name: keyof T;
  /** Optional title for the filter dialog */
  title?: string;
  /** Optional icon component for the filter button */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Icon?: React.ComponentType<{
    /** Optional CSS class name for the icon element */
    className?: string;
    /** Optional inline styles for the icon element */
    style?: React.CSSProperties;
  }>;
};

/**
 * Returns elements in array a that are not in array b
 *
 * @internal
 * @param a - The source array
 * @param b - The array of elements to exclude
 * @returns Elements from a that are not in b
 */
function not<T>(a: T[], b: T[]): T[] {
  return a.filter((value) => !b.includes(value));
}

/**
 * Creates a transfer list filter for moving items between available and selected lists
 *
 * Displays a dialog with a Transfer component showing two lists: available items on the left
 * and selected items on the right. Users can move items between lists using transfer buttons.
 * Only items in the right list are included in the filtered results.
 *
 * @param options - Configuration options for the transfer filter
 * @param analyzerResults - Analysis results containing shape information
 * @returns A Filter object with Actuator, Indicator, and execute functions
 *
 * @example
 * ```tsx
 * const filter = filterCompilerTransfer(
 *   { type: 'transfer', name: 'status', title: 'Status' },
 *   analyzerResults
 * );
 * ```
 *
 * @group Components
 * @category DataGrid
 * @typeParam T - The data item type
 */
// TODO [>0.1]: implement the clear functionality
export function filterCompilerTransfer<T = unknown>(
  // eslint-disable-next-line @typescript-eslint/naming-convention
  { name, title, Icon }: TransferCompilerOptions<T>,
  { getShape }: AnalyzerResults<T>,
): Filter<T> {
  return {
    name,
    // eslint-disable-next-line @typescript-eslint/naming-convention, react/component-hook-factories
    Actuator({ classes, styles }: FilterActuatorProps2) {
      const { data, changeFilter, filterValues } = useGrid<T>();
      const [open, setOpen] = React.useState(false);
      const filterValue = React.useMemo(
        () => normalizeFilterArray(filterValues[name]) ?? [],
        // eslint-disable-next-line react/exhaustive-deps
        [filterValues, name],
      );
      // eslint-disable-next-line react/exhaustive-deps
      const search = React.useMemo(() => getUniqueValues(data, name), [data, name]);
      const left = React.useMemo(() => not(search, filterValue), [search, filterValue]);
      const right = React.useMemo(() => filterValue, [filterValue]);
      const transfer = React.useMemo(() => ({ left, right }), [left, right]);
      const handleActuatorClick = (): void => {
        setOpen(true);
      };
      const handleDialogClose = (): void => {
        setOpen(false);
      };
      const handleOKClick = (): void => {
        setOpen(false);
        changeFilter(name, transfer.right);
      };
      const handleCancelClick = (): void => {
        setOpen(false);
      };
      const handleTransfer = (leftItems: string[], rightItems: string[]): void => {
        transfer.left = leftItems;
        transfer.right = rightItems;
      };

      return (
        <>
          <FilterActuator
            classes={classes}
            styles={styles}
            Icon={Icon}
            title={title ?? (name as string)}
            onButtonClick={handleActuatorClick}
          />
          <Dialog open={open} onClose={handleDialogClose} maxWidth={false}>
            <DialogTitle>{title ?? (name as string)}</DialogTitle>
            <DialogContent>
              <Transfer
                name={name as string}
                title={title}
                rowHeight={24}
                left={left}
                right={right}
                onTransfer={handleTransfer}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelClick}>Cancel</Button>
              <Button onClick={handleOKClick}>OK</Button>
            </DialogActions>
          </Dialog>
        </>
      );
    },
    Indicator: arrayIndicator({ name, title, Icon }),
    execute: equalityExecute(name, getShape()),
  };
}

export default filterCompilerTransfer;
