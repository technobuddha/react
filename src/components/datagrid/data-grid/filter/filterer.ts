// cspell:ignore Stringize

import React from 'react';
import { isArray } from '@technobuddha/library';

import { useGrid } from '../grid-context.tsx';

/**
 * A filter definition for filtering data in a DataGrid column
 *
 * @group Components
 * @category DataGrid
 * @typeParam T - The data item type
 */
export type Filter<T = unknown> = {
  /** The column name this filter applies to */
  name: keyof T;
  /** Component for opening the filter dialog */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Actuator: React.ComponentType<FilterActuatorProps2>;
  /** Optional component for displaying active filter state as a chip */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Indicator?: React.ComponentType<FilterIndicatorProps>;
  /** Function to execute the filter on the dataset */
  execute(data: T[], value: FilterValue): T[];
};

/**
 * Value that can be stored for a filter (string, string array, or null for no filter)
 *
 * @group Components
 * @category DataGrid
 */
export type FilterValue = string | string[] | null;

/**
 * Map of column names to their filter values
 *
 * @group Components
 * @category DataGrid
 * @typeParam T - The data item type
 */
export type FilterValues<T = unknown> = Record<keyof T, FilterValue>;

/**
 * Props for filter actuator components (the button that opens the filter dialog)
 *
 * @group Components
 * @category DataGrid
 */
export type FilterActuatorProps2 = {
  /** CSS class names for styling */
  classes?: FilterActuatorClasses;
  /** Inline styles for customization */
  styles?: FilterActuatorStyles;
};

/**
 * Props for filter indicator components (the chip showing active filter state)
 *
 * @group Components
 * @category DataGrid
 */
export type FilterIndicatorProps = {
  /** CSS class names for styling */
  classes?: FilterIndicatorClasses;
  /** Inline styles for customization */
  styles?: FilterIndicatorStyles;
};

/**
 * CSS class names for filter actuator elements
 *
 * @group Components
 * @category DataGrid
 */
export type FilterActuatorClasses = {
  /** Root container class */
  root: string;
  /** Filter button class */
  button: string;
  /** Filter icon class */
  icon: string;
  /** Filter title class */
  title: string;
};

/**
 * Inline styles for filter actuator elements
 *
 * @group Components
 * @category DataGrid
 */
export type FilterActuatorStyles = { [key in keyof FilterActuatorClasses]: React.CSSProperties };

/**
 * CSS class names for filter indicator elements
 *
 * @group Components
 * @category DataGrid
 */
export type FilterIndicatorClasses = {
  /** Root container class */
  root: string;
};

/**
 * Inline styles for filter indicator elements
 *
 * @group Components
 * @category DataGrid
 */
export type FilterIndicatorStyles = { [key in keyof FilterIndicatorClasses]: React.CSSProperties };

/**
 * Serializes filter values to a JSON string for memoization purposes
 *
 * Converts FilterValues to a stable string representation by joining array values
 * with '&' separator. Used in useMemo dependency array to detect filter changes.
 *
 * @internal
 * @param filterValues - The filter values to serialize
 * @returns JSON string representation of the filter values
 */
function queryStringizeFilterValue<T = unknown>(filterValues: FilterValues<T>): string {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(filterValues).map(([k, v]) => {
        if (v === null) {
          return [k, null];
        }
        if (isArray(v)) {
          return [k, v.join('&')];
        }

        return [k, v];
      }),
    ),
  );
}

/**
 * Props for the Filterer component
 *
 * @typeParam T - The data item type
 * @group Components
 * @category DataGrid
 */
export type FiltererProps<T = unknown> = {
  /** Array of filter definitions to apply */
  filters: Filter<T>[];
  /** Render prop function receiving filtered data */
  children(this: void, renderProps: FiltererRenderProps<T>): React.ReactElement;
};

/**
 * Render props passed to Filterer children
 *
 * @group Components
 * @category DataGrid
 * @typeParam T - The data item type
 */
export type FiltererRenderProps<T = unknown> = {
  /** The filtered dataset after applying all active filters */
  data: T[];
};

/**
 * Component that applies filters to DataGrid data using render props pattern
 *
 * Reads filter values from grid context and executes each filter's execute function
 * in sequence. Memoizes the filtered result to avoid unnecessary recomputation.
 *
 * @group Components
 * @category DataGrid
 * @typeParam T - The data item type
 *
 * @example
 * ```tsx
 * \<Filterer filters={filters}\>
 *   {({ data }) => \<Grid data={data} /\>}
 * \</Filterer\>
 * ```
 */
export function Filterer<T = unknown>({ filters, children }: FiltererProps<T>): React.ReactElement {
  const { data, filterValues } = useGrid<T>();
  const filteredData = React.useMemo(() => {
    let fData = [...data];
    for (const filter of filters) {
      fData = filter.execute(fData, filterValues[filter.name]);
    }
    return fData;
  }, [data, filters, queryStringizeFilterValue(filterValues)]);

  return children({ data: filteredData });
}

export default Filterer;
