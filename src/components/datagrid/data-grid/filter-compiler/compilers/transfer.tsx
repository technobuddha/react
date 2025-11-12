import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import { Transfer } from '../../../transfer/index.ts';

import { type AnalyzerResults } from '../../analyzer.ts';
import { type Filter, type FilterActuatorProps } from '../../filter/index.ts';
import { useGrid } from '../../grid-context.tsx';

import FilterActuator from '../filter-actuator.tsx';
import { arrayIndicator } from '../indicators.tsx';
import { getUniqueValues } from '../util.ts';

import { equalityExecute } from './execution.ts';
import { normalizeFilterArray } from './normalization.ts';
import { type CompilerOptions } from './options.ts';

export type TransferCompilerOptions<T = unknown> = CompilerOptions & {
  type: 'transfer';
  name: keyof T;
  title?: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
};

function not<T>(a: T[], b: T[]): T[] {
  return a.filter((value) => !b.includes(value));
}

// TODO [2025-12-31]: implement the clear functionality
export function filterCompilerTransfer<T = unknown>(
  // eslint-disable-next-line @typescript-eslint/naming-convention
  { name, title, Icon }: TransferCompilerOptions<T>,
  { getShape }: AnalyzerResults<T>,
): Filter<T> {
  return {
    name,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Actuator({ classes, styles }: FilterActuatorProps) {
      const { data, changeFilter, filterValues } = useGrid<T>();
      const [open, setOpen] = React.useState<boolean>(false);
      const filterValue = React.useMemo(
        () => normalizeFilterArray(filterValues[name]) ?? [],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [filterValues, name],
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
            // eslint-disable-next-line react/jsx-no-bind
            onButtonClick={handleActuatorClick}
          />
          {/* eslint-disable-next-line react/jsx-no-bind */}
          <Dialog open={open} onClose={handleDialogClose} maxWidth={false}>
            <DialogTitle>{title ?? (name as string)}</DialogTitle>
            <DialogContent>
              <Transfer
                name={name as string}
                title={title}
                rowHeight={24}
                left={left}
                right={right}
                // eslint-disable-next-line react/jsx-no-bind
                onTransfer={handleTransfer}
              />
            </DialogContent>
            <DialogActions>
              {/* eslint-disable-next-line react/jsx-no-bind */}
              <Button onClick={handleCancelClick}>Cancel</Button>
              {/* eslint-disable-next-line react/jsx-no-bind */}
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
