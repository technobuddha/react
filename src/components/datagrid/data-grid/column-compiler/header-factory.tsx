import React from 'react';
import { Box, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { isString } from '@technobuddha/library';
import clsx from 'clsx';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';

import { type Shape } from '../analyzer.ts';
import { type ColumnHeaderProps, type ColumnSpecification, type ColumnType } from '../column.ts';
import { useGrid } from '../grid-context.tsx';

/**
 * Material-UI styles for column headers.
 *
 * @internal
 */
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

/**
 * Creates a column header renderer function.
 *
 * Generates a React component for rendering column headers in the DataGrid.
 * If the column specification provides a custom header component, it is used directly.
 * Otherwise, a default sortable button header is created with the following features:
 * - Click to sort (if sorting is enabled for the column)
 * - Sort direction indicators (up/down arrows or neutral icon)
 * - Customizable styling through classes and styles props
 *
 * The default header displays the column name or a custom header text string,
 * along with sort indicators when the column is sortable.
 *
 * @typeParam T - The type of data in the grid
 * @param column - The column specification containing name, header, and sort configuration
 * @param _type - The detected data type of the column (unused in current implementation)
 * @param _shape - The structural shape of the data (unused in current implementation)
 * @returns A render function that accepts ColumnHeaderProps and returns a React element
 *
 * @example
 * ```typescript
 * const headerRenderer = headerFactory(
 *   { name: 'username', header: 'User Name', sortBy: 'username' },
 *   { dataType: 'string' },
 *   'key-value'
 * );
 * ```
 *
 * @group Components
 * @category DataGrid
 */
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
          fullWidth
          disableElevation
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
