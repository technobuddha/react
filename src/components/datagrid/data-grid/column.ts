import type React from 'react';

import { type HeaderClasses, type HeaderStyles } from './column-styles.ts';

/**
 * Represents a compiled column definition for the DataGrid.
 *
 * Contains all the information needed to render a column including its name,
 * width, header, cell renderer, and sorting behavior.
 *
 * @typeParam T - The type of data items in the grid
 * @group Components
 * @category DataGrid
 */
export type Column<T = unknown> = {
  /** The column's identifier */
  name: string;
  /** The column's width specification */
  width: ColumnWidth;
  /**
   * Function to render the column header
   *
   * @param args - Props for rendering the header
   * @returns A React element for the column header
   */
  header(args: ColumnHeaderProps<T>): React.ReactElement;
  /**
   * Function to render cell content
   *
   * @param args - Props containing the data and styling
   * @returns A React element for the cell
   */
  render(args: ColumnRenderProps<T>): React.ReactElement;
  /** Column names to use for sorting, or null if sorting is disabled */
  sortBy: null | ColumnName[];
  /**
   * Function to create a comparison function for sorting
   *
   * @param ascending - Whether to sort in ascending order
   * @returns A comparison function for sorting two items
   */
  collate(ascending: boolean): (x: T, y: T) => number;
};

/**
 * A column identifier.
 *
 * Can be a string key name or a numeric index for array-based data.
 *
 * @group Components
 * @category DataGrid
 */
export type ColumnName = string | number;

/**
 * Column width specification.
 *
 * Can be either:
 * - A fixed width in pixels (number)
 * - A proportional width using asterisk notation (e.g., '*', '2*', '3*')
 *
 * Proportional widths distribute available space based on their multiplier.
 * For example, '2*' takes twice as much space as '*' or '1*'.
 *
 * @group Components
 * @category DataGrid
 */
export type ColumnWidth =
  | number
  | '*'
  | '1*'
  | '2*'
  | '3*'
  | '4*'
  | '5*'
  | '6*'
  | '7*'
  | '8*'
  | '9*'
  | '10*'
  | '11*'
  | '12*';

/**
 * Props passed to column cell renderers.
 *
 * @typeParam T - The type of data items in the grid
 * @group Components
 * @category DataGrid
 */
export type ColumnRenderProps<T = unknown> = {
  /** The data item for the current row */
  datum: T;
  /** Optional CSS class overrides for styling */
  classes?: Record<string, string>;
  /** Optional inline style overrides */
  styles?: Record<string, React.CSSProperties>;
};

/**
 * Props passed to column header renderers.
 *
 * @typeParam T - The type of data items in the grid
 * @group Components
 * @category DataGrid
 */
export type ColumnHeaderProps<T = unknown> = {
  /** The complete dataset for the grid */
  data: T[];
  /** Optional CSS class overrides for header styling */
  classes?: HeaderClasses;
  /** Optional inline style overrides for header */
  styles?: HeaderStyles;
};

/**
 * Properties defining the current sort state.
 *
 * @group Components
 * @category DataGrid
 */
export type SortProperties = {
  /** The column name being sorted by */
  sortBy: string;
  /** Whether the sort is in ascending order */
  sortAscending: boolean;
};

/**
 * Enumeration of supported data types for columns.
 *
 * @group Components
 * @category DataGrid
 */
export type DataType = 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array' | 'unknown';

/**
 * Detailed type information for a column.
 *
 * @group Components
 * @category DataGrid
 */
export type ColumnType = {
  /** The primary data type of the column */
  dataType: DataType;
  /** Whether the column can contain null or undefined values */
  nullable: boolean;
};

/**
 * Array of column specifications.
 *
 * @typeParam T - The type of data items in the grid
 * @group Components
 * @category DataGrid
 */
export type ColumnSpecifications<T = unknown> = ColumnSpecification<T>[];

/**
 * User-provided specification for defining a column.
 *
 * A flexible configuration object that is compiled into a full Column definition.
 * Most properties are optional and will use sensible defaults based on the data.
 *
 * @typeParam T - The type of data items in the grid
 * @group Components
 * @category DataGrid
 */
export type ColumnSpecification<T = unknown> = {
  /** The column's identifier (property name or array index) */
  name: ColumnName;
  /** Optional data type hint for the column */
  type?: DataType | ColumnType;
  /** Optional width specification. Defaults to proportional sizing */
  width?: Column<T>['width'];
  /** Optional header content (string or custom render function). Defaults to column name */
  header?: string | Column<T>['header'];
  /** Optional custom cell renderer. Defaults to basic value display */
  render?: Column<T>['render'];
  /** Optional array of column names for sorting, or null to disable sorting */
  sortBy?: null | ColumnName[];
  /** Optional custom collation function for sorting */
  collate?: Column<T>['collate'];
};

/**
 * Default export of the Column type.
 *
 * @group Components
 * @category DataGrid
 */
export default Column;
