import React from 'react';
import { Grid, TextField } from '@mui/material';
import { makeStyles } from '@mui/styles';

import { type AnalyzerResults } from '../../analyzer.ts';
import { type Filter } from '../../filter/index.ts';
import { useGrid } from '../../grid-context.tsx';

import { searchExecute } from './execution.ts';
import { normalizeFilterValue } from './normalization.ts';
import { type CompilerOptions } from './options.ts';

export type SearchCompilerOptions<T = unknown> = CompilerOptions & {
  type: 'search';
  name: keyof T;
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

export function filterCompilerSearch<T = unknown>(
  { name, title, clear }: SearchCompilerOptions<T>,
  { getShape }: AnalyzerResults<T>,
): Filter<T> {
  return {
    name,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Actuator: () => {
      const css = useSearchStyles();
      const { changeFilter, filterValues } = useGrid<T>();
      const [search, setSearch] = React.useState(normalizeFilterValue(filterValues[name]));
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
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        <Grid className={css.root} container alignItems="flex-end">
          {/* <Grid className={css.gridIcon} item>
            <Search />
          </Grid> */}
          {/* eslint-disable-next-line @typescript-eslint/no-deprecated */}
          <Grid item className={css.gridText}>
            <TextField
              classes={{ root: css.textfield }}
              size="small"
              placeholder={title}
              variant="outlined"
              value={search}
            />
          </Grid>
          {/* eslint-disable-next-line @typescript-eslint/no-deprecated */}
          <Grid className={css.gridIcon} item>
            {/* {search !== '' && <Clear className={css.clear} onClick={handleClearClick} />} */}
          </Grid>
        </Grid>
      );
    },
    execute: searchExecute(name, getShape()),
  };
}
