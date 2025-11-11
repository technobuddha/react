import React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { toString } from '@technobuddha/library';

import { type AnalyzerResults } from '../../analyzer.ts';
import { type OnSelectionChangedParams } from '../../data-grid.tsx';
import { DataGrid } from '../../data-grid.tsx';
import { type Filter, type FilterActuatorProps } from '../../filter/index.ts';
import useGrid from '../../grid-context.tsx';

import FilterActuator from '../filter-actuator.tsx';
import { arrayIndicator } from '../indicators.tsx';
import { getUniqueValues } from '../util.ts';

import { equalityExecute } from './execution.ts';
import { normalizeFilterArray } from './normalization.ts';
import { type CompilerOptions } from './options.ts';

// TODO [2025-12-31]: implement clear functionality
export type CheckboxCompilerOptions<T = unknown> = CompilerOptions & {
  type: 'checkbox-list';
  name: keyof T;
  title?: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
};

export function filterCompilerCheckbox<T = unknown>(
  // eslint-disable-next-line @typescript-eslint/naming-convention
  { name, title, Icon }: CheckboxCompilerOptions<T>,
  data: T[],
  { getShape }: AnalyzerResults<T>,
): Filter<T> {
  const search = getUniqueValues(data, name);

  return {
    name,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Actuator({ classes, styles }: FilterActuatorProps) {
      const { changeFilter, filterValues } = useGrid<T>();
      const [open, setOpen] = React.useState<boolean>(false);
      const [disabled, setDisabled] = React.useState<boolean>(true);
      const filterValue = React.useRef(normalizeFilterArray(filterValues[name]));

      const handleActuatorClick = (): void => {
        setOpen(true);
      };
      const handleDialogClose = (): void => {
        setOpen(false);
      };
      const handleSelectionChanged = ({
        selectedRows,
        selectedCount,
        unselectedCount,
      }: OnSelectionChangedParams<string>): void => {
        filterValue.current = unselectedCount === 0 ? null : selectedRows;
        setDisabled(selectedCount === 0);
      };
      const handleOKClick = (): void => {
        setOpen(false);
        changeFilter(name, filterValue.current);
      };
      const handleCancelClick = (): void => {
        setOpen(false);
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
          {/*  eslint-disable-next-line react/jsx-no-bind */}
          <Dialog open={open} onClose={handleDialogClose} maxWidth={false}>
            <DialogTitle>{title ?? (name as string)}</DialogTitle>
            <DialogContent>
              <Box width={640} height={480}>
                <DataGrid
                  data={search}
                  selection
                  // eslint-disable-next-line react/jsx-no-bind
                  selected={(datum: string) =>
                    filterValue.current === null || filterValue.current.includes(toString(datum))
                  }
                  columns={[{ name: name as string }]}
                  filters={[{ type: 'search', name: 0, title: title ?? (name as string) }]}
                  defaultSort="*"
                  // eslint-disable-next-line react/jsx-no-bind
                  onSelectionChanged={handleSelectionChanged}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              {/* eslint-disable-next-line react/jsx-no-bind */}
              <Button onClick={handleCancelClick}>Cancel</Button>
              {/* eslint-disable-next-line react/jsx-no-bind */}
              <Button onClick={handleOKClick} disabled={disabled}>
                OK
              </Button>
            </DialogActions>
          </Dialog>
        </>
      );
    },
    Indicator: arrayIndicator({ name, title, Icon }),
    execute: equalityExecute(name, getShape()),
  };
}
