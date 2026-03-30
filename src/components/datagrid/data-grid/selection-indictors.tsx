import React from 'react';
import { Checkbox } from '@mui/material';

import { useRow } from './row-context.tsx';

/**
 * Base props shared by all selection indicator components.
 *
 * @internal
 */
type BaseSelectionIndicatorProps = {
  /** Optional CSS class name for the checkbox */
  readonly className?: string;
  /** Optional inline style for the checkbox (currently unused) */
  readonly style?: React.CSSProperties;
  /** Children are not supported */
  readonly children?: never;
};

/**
 * Props for the RowSelectionIndicator component.
 *
 * @typeParam T - The type of data items in the grid
 * @group Components
 * @category DataGrid
 */
export type RowSelectionIndicatorProps<T = unknown> = BaseSelectionIndicatorProps & {
  /** The data item for this row */
  readonly datum: T;
};

/**
 * A checkbox component for selecting individual rows in the data grid.
 *
 * Displays a checkbox that reflects and controls the selection state of a single row.
 * The checkbox state is synchronized with the row selection context, allowing it to
 * respond to both user interaction and programmatic selection changes.
 *
 * Features:
 * - Reflects current selection state of the row
 * - Updates selection context when toggled
 * - Styled with Material-UI theme
 * - Small size for compact display
 *
 * @typeParam T - The type of data items in the grid
 * @param props - Configuration props for the indicator
 * @returns A checkbox element for row selection
 *
 * @example
 * ```tsx
 * \<RowSelectionIndicator
 *   datum={user}
 *   className="custom-checkbox"
 * /\>
 * ```
 *
 * @group Components
 * @category DataGrid
 */
export function RowSelectionIndicator<T = unknown>({
  datum,
  className,
  // style,
}: RowSelectionIndicatorProps<T>): React.ReactElement {
  const { setSelected, getSelected } = useRow();

  const handleCheckboxChange = React.useCallback(
    (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      setSelected(datum, checked);
    },
    [datum, setSelected],
  );

  return (
    <Checkbox
      size="small"
      classes={{ root: className }}
      // styles={{ root: style}}
      onChange={handleCheckboxChange}
      checked={getSelected(datum)}
      color="secondary"
    />
  );
}

/**
 * Props for the MasterSelectionIndicator component.
 *
 * @typeParam T - The type of data items in the grid
 * @group Components
 * @category DataGrid
 */
export type MasterSelectionIndicatorProps<T = unknown> = BaseSelectionIndicatorProps & {
  /** The complete dataset or subset to control */
  readonly data: T[];
};

/**
 * A checkbox component for selecting/deselecting all rows in the data grid.
 *
 * Displays a "master" checkbox in the header that controls the selection state
 * of all rows. The checkbox state reflects the current selection:
 * - Unchecked: No rows selected
 * - Checked: All rows selected
 * - Indeterminate: Some but not all rows selected
 *
 * Features:
 * - Three-state display (unchecked/checked/indeterminate)
 * - Selects/deselects all rows when toggled
 * - Automatically updates based on individual row selections
 * - Styled with Material-UI theme
 * - Small size for compact display in header
 *
 * @typeParam T - The type of data items in the grid
 * @param props - Configuration props for the indicator
 * @returns A checkbox element for master selection control
 *
 * @example
 * ```tsx
 * \<MasterSelectionIndicator
 *   data={users}
 *   className="header-checkbox"
 * /\>
 * ```
 *
 * @group Components
 * @category DataGrid
 */
export function MasterSelectionIndicator<T = unknown>({
  data,
  className,
  // style,
}: MasterSelectionIndicatorProps<T>): React.ReactElement {
  const { setSelected, countSelected } = useRow();
  const { selected, unselected } = countSelected(data);

  const handleMasterChange = React.useCallback(
    (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      setSelected(data, checked);
    },
    // eslint-disable-next-line react/exhaustive-deps
    [data],
  );

  return (
    <Checkbox
      size="small"
      classes={{ root: className }}
      // style={style}
      onChange={handleMasterChange}
      checked={selected > 0 && unselected === 0}
      indeterminate={selected > 0 && unselected > 0}
      color="secondary"
    />
  );
}
