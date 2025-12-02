import { makeStyles } from '@mui/styles';
import type React from 'react';

/**
 * Base CSS class names for row elements.
 *
 * @internal
 */
export type RowClassnames = {
  /** Class for the row root container */
  root?: string;
  /** Class for individual cells */
  cell?: string;
  /** Class for header cells */
  cellHeader?: string;
  /** Class for the menu container */
  menu?: string;
  /** Class for the menu button */
  menuButton?: string;
  /** Class for the menu icon */
  menuIcon?: string;
  /** Class for the menu icon in header */
  menuIconHeader?: string;
  /** Class for the scrollbar stub */
  stub?: string;
};

/**
 * CSS class overrides for row elements.
 *
 * Extends base row classnames with additional classes for headers and columns.
 *
 * @group Components
 * @category DataGrid
 */
export type RowClasses = RowClassnames & {
  /** Classes for column headers */
  header?: HeaderClasses;
  /** Classes for specific columns, keyed by column name */
  column?: Record<string, string>;
};

/**
 * Inline style overrides for row elements.
 *
 * Provides CSS properties for all row elements including headers and columns.
 *
 * @group Components
 * @category DataGrid
 */
export type RowStyles = { [key in keyof RowClassnames]: React.CSSProperties } & {
  /** Styles for column headers */
  header?: HeaderStyles;
  /** Styles for specific columns, keyed by column name */
  column?: Record<string, React.CSSProperties>;
};

/**
 * CSS class overrides for column header elements.
 *
 * @group Components
 * @category DataGrid
 */
export type HeaderClasses = {
  /** Class for the header button */
  button?: string;
  /** Class for the button contents container */
  buttonContents?: string;
  /** Class for the button title text */
  buttonTitle?: string;
  /** Class for the sort indicator icon */
  buttonSortIndicator?: string;
};

/**
 * Inline style overrides for column header elements.
 *
 * @group Components
 * @category DataGrid
 */
export type HeaderStyles = { [key in keyof HeaderClasses]: React.CSSProperties };

/**
 * Material-UI styles hook for column and row styling.
 *
 * @group Components
 * @category DataGrid
 */
export const ucs = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'stretch',
    border: `1px solid ${theme.palette.divider}`,
  },
  cell: {
    'flex': '0 0 auto',
    'display': 'flex',
    'flexFlow': 'row nowrap',
    'alignItems': 'stretch',
    'cursor': 'default',
    'whiteSpace': 'nowrap',
    'overflow': 'hidden',
    'textOverflow': 'ellipsis',
    '&:not(:first-child)': {
      borderLeft: `1px solid ${theme.palette.divider}`,
    },
    'padding': theme.spacing(0.5),
  },
  cellHeader: {
    backgroundColor: theme.palette.primary.light,
  },
  menu: {
    flex: '0 0 auto',
    width: (props: Record<string, unknown>) => `${props.controlWidth}px`,
    height: '100%',
  },
  menuButton: {
    width: '28px',
    padding: 0,
    margin: '0 6px',
  },
  menuIcon: {
    marginTop: theme.spacing(0.5),
    width: (props: Record<string, unknown>) => `${props.controlWidth}px`,
    color: theme.palette.primary.main,
  },
  menuIconHeader: {
    color: theme.palette.primary.contrastText,
  },
  hamburger: {
    cursor: 'pointer',
    height: '24px',
    width: '24px',
    margin: '4px',
  },
  stub: {
    width: (props: Record<string, unknown>) => `${props.scrollbarWidth}px`,
    userSelect: 'none',
    height: '100%',
  },
}));

/**
 * React hook for accessing column and row styles.
 *
 * Provides Material-UI styles for rendering rows, cells, headers, menus, and other
 * grid elements. The styles adapt based on scrollbar width and control column width.
 *
 * @param args - Configuration object containing scrollbarWidth (width of the scrollbar in pixels) and controlWidth (width of the control column in pixels)
 * @returns An object containing CSS class names for grid elements
 *
 * @example
 * ```typescript
 * const classes = useColumnStyles({
 *   scrollbarWidth: 15,
 *   controlWidth: 50,
 * });
 * ```
 *
 * @group Components
 * @category DataGrid
 */
export const useColumnStyles: (args: {
  /** Width of the scrollbar in pixels */
  scrollbarWidth: number;
  /** Width of the control column in pixels */
  controlWidth: number;
}) => ReturnType<typeof ucs> = ucs;

/**
 * Default export of the useColumnStyles hook.
 *
 * @group Components
 * @category DataGrid
 */
export default useColumnStyles;
