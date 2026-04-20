/* eslint-disable @typescript-eslint/no-deprecated */
import React from 'react';
import { GridLegacy as Grid, TextField } from '@mui/material';
import { makeStyles } from '@mui/styles';

import { type AnalyzerResults } from '../../analyzer.ts';
import { type Filter } from '../../filter/index.ts';
import { useGrid } from '../../grid-context.tsx';

import { searchExecute } from './execution.ts';
import { normalizeFilterValue } from './normalization.ts';
import { type CompilerOptions } from './options.ts';

/**
 * Options for creating a search text filter
 *
 * @group Components
 * @category DataGrid
 * @typeParam T - The data item type
 */
export type SearchCompilerOptions<T = unknown> = CompilerOptions & {
  /** Filter type identifier */
  type: 'search';
  /** The column name to filter */
  name: keyof T;
  /** Placeholder text for the search field */
  title: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useSearchStyles = makeStyles((theme: any) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
  },
  gridIcon: {
    position: 'relative',
    top: -2,
  },
  gridText: {
    flexGrow: 1,
  },
  textfield: {
    'width': '100%',
    '& fieldset': {
      border: 'none',
    },
  },
  clear: {
    fontSize: '1.0rem',
    marginBottom: '0.25rem',
    cursor: 'pointer',
  },
}));

/**
 * Creates a text search filter with inline search field
 *
 * Displays a text field directly in the filter area for typing search queries.
 * Filters data using case-insensitive substring matching. The search field shows
 * a placeholder with the provided title.
 *
 * @param options - Configuration options for the search filter
 * @param analyzerResults - Analysis results containing shape information
 * @returns A Filter object with Actuator and execute functions
 *
 * @example
 * ```tsx
 * const filter = filterCompilerSearch(
 *   { type: 'search', name: 'description', title: 'Search descriptions' },
 *   analyzerResults
 * );
 * ```
 *
 * @group Components
 * @category DataGrid
 * @typeParam T - The data item type
 */
export function filterCompilerSearch<T = unknown>(
  { name, title, clear }: SearchCompilerOptions<T>,
  { getShape }: AnalyzerResults<T>,
): Filter<T> {
  return {
    name,
    // eslint-disable-next-line @typescript-eslint/naming-convention, react/component-hook-factories
    Actuator: () => {
      const css = useSearchStyles();
      const { changeFilter, filterValues } = useGrid<T>();
      const [search, setSearch] = React.useState(() => normalizeFilterValue(filterValues[name]));
      // const timer = React.useRef<number | undefined>(undefined);

      // const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
      //   const value = event.target.value ?? undefined;

      //   if (timer.current) {
      //     clearTimeout(timer.current);
      //   }

      //   setSearch(value ?? '');
      //   timer.current = globalThis.setTimeout(() => {
      //     changeFilter(name, value);
      //     timer.current = undefined;
      //   }, 1000);
      // };

      const handleClearClick = (): void => {
        changeFilter(name, '');
        setSearch('');
      };
      if (clear) {
        clear.current = handleClearClick;
      }

      return (
        <Grid className={css.root} container alignItems="flex-end">
          {/* <Grid className={css.gridIcon} item>
            <Search />
          </Grid> */}
          <Grid item className={css.gridText}>
            <TextField
              classes={{ root: css.textfield }}
              size="small"
              placeholder={title}
              variant="outlined"
              value={search}
            />
          </Grid>
          <Grid className={css.gridIcon} item>
            {/* {search !== '' && <Clear className={css.clear} onClick={handleClearClick} />} */}
          </Grid>
        </Grid>
      );
    },
    execute: searchExecute(name, getShape()),
  };
}
