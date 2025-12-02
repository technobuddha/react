import React from 'react';
import { Chip } from '@mui/material';
import useGrid from '../grid-context';
import { normalizeFilterArray } from './compilers/normalization';

import type { FilterIndicatorProps } from '../filter';

/**
 * Arguments for creating a filter indicator.
 *
 * @typeParam T - The type of data items in the grid
 * @group Components
 * @category DataGrid
 */
export type IndicatorArgs<T = unknown> = {
  /** The column name being filtered */
  name: keyof T;
  /** Optional display title for the indicator */
  title?: string;
  /** Optional icon component to display in the indicator chip */
  Icon?: React.ComponentType<{
    /** Optional CSS class name for the icon element */
    className?: string;
    /** Optional inline styles for the icon element */
    style?: React.CSSProperties;
  }>;
};

/**
 * Creates a filter indicator component for array-based filters.
 *
 * Returns a function that renders a chip displaying the active filter values.
 * The chip shows a comma-separated list of selected values, truncating with
 * ellipsis when the display exceeds 40 characters. A count indicator (+N…) is
 * added when values are truncated.
 *
 * Features:
 * - Displays comma-separated filter values
 * - Smart truncation to keep label under 40 characters
 * - Shows count of hidden values when truncated
 * - Includes delete button to clear the filter
 * - Optional icon display
 * - Only renders when filter is active (returns empty fragment otherwise)
 *
 * @typeParam T - The type of data items in the grid
 * @param args - Configuration for the indicator
 * @returns A function that creates a React element for the filter indicator
 *
 * @example
 * ```typescript
 * const indicator = arrayIndicator({
 *   name: 'category',
 *   title: 'Categories',
 *   Icon: FilterIcon,
 * });
 * ```
 *
 * @group Components
 * @category DataGrid
 */
export function arrayIndicator<T = unknown>({
  Icon,
  name,
  title,
}: IndicatorArgs<T>): (args: FilterIndicatorProps) => React.ReactElement {
  return ({ classes, styles }: FilterIndicatorProps) => {
    const { filterValues, changeFilter } = useGrid<T>();
    const filterValue = normalizeFilterArray(filterValues[name]);

    if (filterValue) {
      let str = '';

      for (let i = filterValue.length; i > 0; --i) {
        str = filterValue.slice(0, i).join(', ');
        if (str.length < 40 || i === 1) {
          if (filterValue.length > i) str += `, +${filterValue.length - i}…`;
          break;
        }
      }

      const handleFilterDelete = () => {
        changeFilter(name, null);
      };

      return (
        <Chip
          className={classes?.root}
          style={styles?.root}
          icon={Icon && <Icon />}
          color="secondary"
          label={`${title ?? name.toString()}: ${str}`}
          onDelete={handleFilterDelete}
        />
      );
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
  };
}

/**
 * Default export of the arrayIndicator function.
 *
 * @group Components
 * @category DataGrid
 */
export default arrayIndicator;
