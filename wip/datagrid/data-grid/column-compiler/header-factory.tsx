import React from 'react';
import { makeStyles } from '@mui/styles';
import { Button, Box } from '@mui/material';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import clsx from 'clsx';
import { isString } from '@technobuddha/library';
import { useGrid } from '../grid-context';

import type { Shape } from '../analyzer';
import type { ColumnSpecification, ColumnType, ColumnHeaderProps } from '../column';

const useHeaderStyles = makeStyles((theme) => ({
  button: {
    padding: '4px 0',
    borderRadius: 0,
    backgroundColor: theme.palette.primary.light,
  },
  buttonContents: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  },
  buttonTitle: {
    flexGrow: 1,
    color: theme.palette.getContrastText(theme.palette.primary.light),
    textAlign: 'left',
  },
  buttonSortIndicator: {
    position: 'relative',
    top: '2px',
    width: '18px',
    height: '18px',
    color: theme.palette.getContrastText(theme.palette.primary.light),
  },
}));

export function headerFactory<T = unknown>(
  column: ColumnSpecification<T>,
  _type: ColumnType,
  _shape: Shape,
): ({ classes, styles }: ColumnHeaderProps<T>) => React.ReactElement {
  if (isString(column.header) || column.header === undefined) {
    const text = column.header ?? column.name;

    return ({ classes, styles }: ColumnHeaderProps<T>) => {
      const css = useHeaderStyles();
      const { sort, changeSort } = useGrid<T>();

      return (
        <Button
          className={clsx(css.button, classes?.button)}
          style={styles?.button}
          fullWidth={true}
          disableElevation={true}
          size="small"
          variant="contained"
          onClick={
            column.sortBy === null ?
              undefined
            : () => {
                changeSort(column.name.toString());
              }
          }
        >
          <Box
            className={clsx(css.buttonContents, classes?.buttonContents)}
            style={styles?.buttonContents}
          >
            <Box
              className={clsx(css.buttonTitle, classes?.buttonTitle)}
              style={styles?.buttonTitle}
            >
              {text}
            </Box>
            {column.sortBy !== null &&
              (sort?.sortBy === column.name ?
                sort.sortAscending ?
                  <FaSortUp
                    className={clsx(css.buttonSortIndicator, classes?.buttonSortIndicator)}
                    style={styles?.buttonSortIndicator}
                  />
                : <FaSortDown
                    className={clsx(css.buttonSortIndicator, classes?.buttonSortIndicator)}
                    style={styles?.buttonSortIndicator}
                  />
              : <FaSort
                  className={clsx(css.buttonSortIndicator, classes?.buttonSortIndicator)}
                  style={styles?.buttonSortIndicator}
                />)}
          </Box>
        </Button>
      );
    };
  }

  return column.header;
}
