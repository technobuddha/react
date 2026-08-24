import React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { toString } from '@technobuddha/library';

import { type AnalyzerResults } from '../../analyzer.ts';
import { type OnSelectionChangedParams } from '../../data-grid.tsx';
import { DataGrid } from '../../data-grid.tsx';
import { type Filter, type FilterActuatorProps2 } from '../../filter/index.ts';
import useGrid from '../../grid-context.tsx';

import FilterActuator from '../filter-actuator.tsx';
import { arrayIndicator } from '../indicators.tsx';
import { getUniqueValues } from '../util.ts';

import { equalityExecute } from './execution.ts';
import { normalizeFilterArray } from './normalization.ts';
import { type CompilerOptions } from './options.ts';

/**
 * Options for creating a checkbox list filter
 *
 * @group Components
 * @category DataGrid
 * @typeParam T - The data item type
 */
// TODO [>1]: implement clear functionality
export type CheckboxCompilerOptions<T = unknown> = CompilerOptions & {
  /** Filter type identifier */
  type: 'checkbox-list';
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
 * Creates a checkbox list filter for selecting multiple values
 *
 * Displays a dialog with a DataGrid showing all unique values for the column.
 * Users can select/deselect values to filter by. Selected rows are shown in the
 * main grid. Uses equality comparison for filtering.
 *
 * @param options - Configuration options for the checkbox filter
 * @param data - The complete dataset to extract unique values from
 * @param analyzerResults - Analysis results containing shape information
 * @returns A Filter object with Actuator, Indicator, and execute functions
 *
 * @example
 * ```tsx
 * const filter = filterCompilerCheckbox(
 *   { type: 'checkbox-list', name: 'category', title: 'Category' },
 *   data,
 *   analyzerResults
 * );
 * ```
 *
 * @group Components
 * @category DataGrid
 * @typeParam T - The data item type
 */
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
    Actuator({ classes, styles }: FilterActuatorProps2) {
      const { changeFilter, filterValues } = useGrid<T>();
      const [open, setOpen] = React.useState(false);
      const [disabled, setDisabled] = React.useState(true);
      const filterValueRef = React.useRef(normalizeFilterArray(filterValues[name]));

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
        filterValueRef.current = unselectedCount === 0 ? null : selectedRows;
        setDisabled(selectedCount === 0);
      };
      const handleOKClick = (): void => {
        setOpen(false);
        changeFilter(name, filterValueRef.current);
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
            onButtonClick={handleActuatorClick}
          />
          <Dialog open={open} onClose={handleDialogClose} maxWidth={false}>
            <DialogTitle>{title ?? (name as string)}</DialogTitle>
            <DialogContent>
              <Box width={640} height={480}>
                <DataGrid
                  data={search}
                  selection
                  selected={(datum: string) =>
                    filterValueRef.current === null ||
                    filterValueRef.current.includes(toString(datum))
                  }
                  columns={[{ name: name as string }]}
                  filters={[{ type: 'search', name: 0, title: title ?? (name as string) }]}
                  defaultSort="*"
                  onSelectionChanged={handleSelectionChanged}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelClick}>Cancel</Button>
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
